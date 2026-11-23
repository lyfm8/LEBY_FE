import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { lessonService } from '../services/lessonService';
import type {
    LessonDetail,
    LessonProgressResult,
    PendingProgressDraft,
} from '../types/lessonTypes';

/** Ngưỡng số giây xem thực tế tích lũy sẽ tự động kích hoạt 1 nhịp đồng bộ lên máy chủ. */
const HEARTBEAT_DELTA_SECONDS = 10;

/** Giới hạn chênh lệch giây tối đa giữa 2 sự kiện timeupdate hợp lệ (loại trừ hành vi tua). */
const MAX_VALID_TICK_DELTA_SECONDS = 2.5;

/** Tiền tố khóa lưu bản nháp tiến độ cục bộ trong localStorage khi rớt mạng hoặc hết phiên. */
const STORAGE_KEY_PREFIX = 'leby_lesson_progress_draft_';

/**
 * Tham số đầu vào cho hook giám sát thời lượng xem thực tế của bài giảng Video.
 */
interface UseVideoProgressTrackerOptions {
    /** Dữ liệu bài học hiện tại (null khi đang tải). */
    lesson: LessonDetail | null;
    /** Callback thông báo cho useLessonRoom cập nhật state sau mỗi lần đồng bộ thành công. */
    onProgressSynced: (result: LessonProgressResult) => void;
}

/**
 * Tạo khóa lưu trữ localStorage riêng cho từng bài học.
 *
 * @param lessonId Mã bài học
 * @returns Chuỗi khóa duy nhất trong localStorage
 */
function buildDraftStorageKey(lessonId: number): string {
    // Ghép tiền tố cố định với mã bài học để tránh ghi đè lẫn nhau giữa các bài
    return `${STORAGE_KEY_PREFIX}${lessonId}`;
}

/**
 * Đọc an toàn bản nháp tiến độ chưa kịp đồng bộ từ localStorage.
 *
 * @param lessonId Mã bài học cần đọc bản nháp
 * @returns Đối tượng PendingProgressDraft hợp lệ hoặc null nếu không có
 */
function readPendingDraft(lessonId: number): PendingProgressDraft | null {
    try {
        // Đọc chuỗi JSON đã lưu theo mã bài học
        const raw = window.localStorage.getItem(buildDraftStorageKey(lessonId));
        // Nếu chưa có bản nháp thì trả về null
        if (!raw) {
            return null;
        }
        // Giải mã chuỗi JSON sang object JavaScript
        const parsed: unknown = JSON.parse(raw);
        // Kiểm tra cấu trúc dữ liệu tối thiểu bằng type guard an toàn (không dùng any)
        if (
            typeof parsed === 'object' &&
            parsed !== null &&
            'lessonId' in parsed &&
            'pendingDeltaSeconds' in parsed &&
            'lastPositionSeconds' in parsed
        ) {
            const candidate = parsed as PendingProgressDraft;
            if (candidate.lessonId === lessonId) {
                return candidate;
            }
        }
        return null;
    } catch {
        // Bỏ qua lỗi đọc storage nếu trình duyệt chặn quyền lưu trữ cục bộ
        return null;
    }
}

/**
 * Lưu bản nháp tiến độ cục bộ vào localStorage để không mất tiến trình khi rớt mạng hoặc hết phiên.
 *
 * @param draft Bản nháp tiến độ cần bảo toàn
 */
function writePendingDraft(draft: PendingProgressDraft): void {
    try {
        // Tuần tự hóa đối tượng sang JSON và lưu theo khóa của bài học
        window.localStorage.setItem(buildDraftStorageKey(draft.lessonId), JSON.stringify(draft));
    } catch {
        // Bỏ qua nếu bộ nhớ cục bộ bị đầy hoặc trình duyệt ở chế độ hạn chế
    }
}

/**
 * Xóa bản nháp tiến độ cục bộ sau khi đã đồng bộ thành công lên máy chủ.
 *
 * @param lessonId Mã bài học đã đồng bộ xong
 */
function clearPendingDraft(lessonId: number): void {
    try {
        // Gỡ bỏ khóa lưu tạm tương ứng khỏi localStorage
        window.localStorage.removeItem(buildDraftStorageKey(lessonId));
    } catch {
        // Bỏ qua nếu không thể thao tác với localStorage
    }
}

/**
 * Custom Hook chịu trách nhiệm giám sát thời lượng xem Video thực tế (chống tua vội),
 * định kỳ gửi nhịp đồng bộ lên Backend, tự bảo toàn tiến độ khi mất kết nối mạng hoặc hết phiên,
 * và phát tín hiệu thông báo chúc mừng khi hoàn thành bài giảng / mở khóa bài thi vượt ải.
 */
export function useVideoProgressTracker({
    lesson,
    onProgressSynced,
}: UseVideoProgressTrackerOptions) {
    // Lưu số giây xem thực tế ước tính trực tiếp trên UI (mượt hơn giữa các nhịp gọi API)
    const [liveWatchedSeconds, setLiveWatchedSeconds] = useState<number>(0);
    // Lưu thời lượng thực tế của video (ưu tiên từ DB, cập nhật thêm khi trình phát tải xong metadata)
    const [effectiveDuration, setEffectiveDuration] = useState<number>(0);
    // Lưu trạng thái mạng hiện tại của trình duyệt
    const [isOffline, setIsOffline] = useState<boolean>(
        typeof navigator !== 'undefined' ? !navigator.onLine : false
    );
    // Cờ báo hiệu phiên đăng nhập bị hết hạn (HTTP 401) giữa lúc đang xem video
    const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);
    // Cờ báo hiệu có tiến độ đang chờ đồng bộ lại sau khi lỗi mạng tạm thời
    const [hasPendingSync, setHasPendingSync] = useState<boolean>(false);
    // Cờ hiển thị thông báo chúc mừng tích xanh nhẹ khi bài giảng vừa đạt mốc hoàn thành
    const [showCompletionToast, setShowCompletionToast] = useState<boolean>(false);
    // Cờ hiển thị thông báo mở khóa bài kiểm tra vượt ải khi mô-đun vừa đạt ngưỡng
    const [showTestUnlockedBanner, setShowTestUnlockedBanner] = useState<boolean>(false);
    // Cờ hiển thị nhắc nhở nhẹ khi học viên tua vội qua cuối video mà chưa xem đủ thời lượng
    const [showSeekWarning, setShowSeekWarning] = useState<boolean>(false);

    // Ref lưu phần giây xem thực tế chưa gửi lên server (dùng ref để tránh re-render liên tục mỗi 250ms)
    const unsyncedDeltaRef = useRef<number>(0);
    // Ref lưu mốc vị trí phát hiện tại gần nhất (giây) để gửi kèm khi đồng bộ
    const lastPositionRef = useRef<number>(0);
    // Ref lưu tốc độ phát hiện tại của trình phát (0.75x - 1.5x)
    const playbackRateRef = useRef<number>(1);
    // Ref lưu thời lượng video chuẩn mới nhất để đọc trong hàm đồng bộ bất đồng bộ
    const durationRef = useRef<number>(0);
    // Ref khóa chống gọi đồng thời 2 request PUT chồng chéo cho cùng một bài học
    const isSyncingRef = useRef<boolean>(false);
    // Ref lưu thời điểm bài học hiện tại để chống ghi nhầm khi người dùng chuyển bài nhanh
    const activeLessonIdRef = useRef<number | null>(null);
    // Ref lưu trạng thái bài giảng đã hoàn thành hay chưa để quyết định hiện nhắc nhở khi tua
    const isCompletedRef = useRef<boolean>(false);

    // Khởi tạo lại toàn bộ bộ đếm mỗi khi mở một bài học mới
    useEffect(() => {
        // Nếu chưa tải xong bài học thì không khởi tạo bộ đếm
        if (!lesson) {
            activeLessonIdRef.current = null;
            return;
        }

        // Gán mã bài học đang theo dõi vào ref
        activeLessonIdRef.current = lesson.id;
        // Đồng bộ cờ hoàn thành hiện tại vào ref
        isCompletedRef.current = lesson.isCompleted;
        // Xác định thời lượng ban đầu lấy từ CSDL
        durationRef.current = lesson.durationSeconds;
        // Cập nhật state thời lượng hiển thị
        setEffectiveDuration(lesson.durationSeconds);
        // Cập nhật mốc vị trí gần nhất lấy từ server
        lastPositionRef.current = lesson.lastPositionSeconds;
        // Khôi phục bản nháp chưa kịp đồng bộ (nếu lần trước bị mất mạng hoặc hết phiên)
        const pendingDraft = readPendingDraft(lesson.id);
        const restoredDelta = pendingDraft ? Math.max(0, pendingDraft.pendingDeltaSeconds) : 0;
        // Đặt lại phần delta chờ gửi bằng dữ liệu khôi phục được
        unsyncedDeltaRef.current = restoredDelta;
        // Nếu bản nháp có vị trí mới hơn thì giữ lại vị trí đó
        if (pendingDraft && pendingDraft.lastPositionSeconds > 0) {
            lastPositionRef.current = pendingDraft.lastPositionSeconds;
        }
        // Cập nhật số giây đã xem hiển thị ban đầu (kèm delta khôi phục nếu có)
        setLiveWatchedSeconds(lesson.watchedSeconds + Math.floor(restoredDelta));
        // Cập nhật cờ hiển thị trạng thái chờ đồng bộ nếu có bản nháp tồn đọng
        setHasPendingSync(restoredDelta > 0);
        // Ẩn toàn bộ các thông báo cũ của bài học trước đó
        setShowCompletionToast(false);
        setShowTestUnlockedBanner(false);
        setShowSeekWarning(false);
        setIsSessionExpired(false);
    }, [lesson?.id]);

    // Đồng bộ lại cờ hoàn thành khi state lesson được cập nhật từ phản hồi máy chủ
    useEffect(() => {
        if (lesson) {
            isCompletedRef.current = lesson.isCompleted;
        }
    }, [lesson?.isCompleted]);

    /**
     * Lưu ngay phần tiến độ đang tích lũy vào localStorage để đảm bảo an toàn dữ liệu.
     */
    const persistLocalDraft = useCallback(() => {
        // Lấy mã bài học hiện tại từ ref
        const currentLessonId = activeLessonIdRef.current;
        // Nếu chưa xác định bài học thì thoát sớm
        if (!currentLessonId) {
            return;
        }
        // Làm tròn xuống số giây xem thực tế đang chờ đồng bộ
        const pendingSeconds = Math.floor(unsyncedDeltaRef.current);
        // Chỉ lưu khi có delta xem hoặc đã có mốc dừng cụ thể
        if (pendingSeconds <= 0 && lastPositionRef.current <= 0) {
            return;
        }
        // Ghi bản nháp xuống localStorage
        writePendingDraft({
            lessonId: currentLessonId,
            pendingDeltaSeconds: pendingSeconds,
            lastPositionSeconds: Math.floor(lastPositionRef.current),
            reportedDurationSeconds: Math.floor(durationRef.current),
            playbackRate: playbackRateRef.current,
            savedAt: Date.now(),
        });
        // Đánh dấu có dữ liệu chờ đồng bộ nếu còn phần giây chưa đẩy lên server
        if (pendingSeconds > 0) {
            setHasPendingSync(true);
        }
    }, []);

    /**
     * Đẩy phần thời lượng xem tích lũy và vị trí tạm dừng hiện tại lên Backend.
     *
     * @param forceSavePosition Cho phép gửi cả khi delta = 0 (ví dụ khi người dùng tạm dừng để lưu mốc Resume)
     */
    const syncProgressNow = useCallback(
        async (forceSavePosition = false) => {
            // Lấy mã bài học hiện tại
            const currentLessonId = activeLessonIdRef.current;
            // Không đồng bộ nếu chưa có bài học, không phải bài giảng video, hoặc đang có request chạy song song
            if (
                !currentLessonId ||
                !lesson ||
                lesson.lessonType !== 'VIDEO' ||
                isSyncingRef.current ||
                isSessionExpired
            ) {
                return;
            }

            // Lấy phần giây nguyên đã tích lũy được kể từ lần đồng bộ gần nhất
            const deltaToSend = Math.floor(unsyncedDeltaRef.current);
            // Lấy mốc vị trí hiện tại trên trình phát
            const positionToSend = Math.max(0, Math.floor(lastPositionRef.current));

            // Nếu không có thay đổi nào đáng kể thì bỏ qua để tránh spam API vô ích
            if (deltaToSend <= 0 && !forceSavePosition) {
                return;
            }

            // Nếu trình duyệt đang ngoại tuyến thì lưu ngay bản nháp cục bộ rồi dừng
            if (typeof navigator !== 'undefined' && !navigator.onLine) {
                setIsOffline(true);
                persistLocalDraft();
                return;
            }

            // Khóa cờ đang đồng bộ và trích phần giây nguyên (giữ lại phần thập phân lẻ cho nhịp sau)
            isSyncingRef.current = true;
            // Cắt trần mỗi lần gửi tối đa 300s khớp giới hạn @Max(300) của Backend
            const cappedDelta = Math.min(300, deltaToSend);
            unsyncedDeltaRef.current = Math.max(0, unsyncedDeltaRef.current - cappedDelta);

            try {
                // Gọi API cập nhật tiến độ xem bài giảng lên Backend thật
                const response = await lessonService.updateLessonProgress(currentLessonId, {
                    watchedSecondsDelta: cappedDelta,
                    lastPositionSeconds: positionToSend,
                    reportedDurationSeconds:
                        durationRef.current > 0 ? Math.floor(durationRef.current) : undefined,
                    playbackRate: playbackRateRef.current,
                });

                // Nếu đồng bộ thành công thì xóa bản nháp cục bộ và cập nhật giao diện
                if (response.success && response.data) {
                    const result = response.data;
                    clearPendingDraft(currentLessonId);
                    setHasPendingSync(false);
                    setLiveWatchedSeconds(result.watchedSeconds);
                    if (result.durationSeconds > 0) {
                        durationRef.current = result.durationSeconds;
                        setEffectiveDuration(result.durationSeconds);
                    }
                    // Cập nhật ngược lại lên state chung của phòng học
                    onProgressSynced(result);

                    // Nếu bài giảng vừa chạm mốc hoàn thành -> hiển thị thông báo tích xanh nhẹ
                    if (result.justCompleted) {
                        setShowSeekWarning(false);
                        setShowCompletionToast(true);
                    }
                    // Nếu mô-đun vừa đủ ngưỡng mở khóa bài thi vượt ải -> hiện banner chúc mừng
                    if (result.moduleTestJustUnlocked) {
                        setShowTestUnlockedBanner(true);
                    }
                }
            } catch (err: unknown) {
                // Hoàn trả phần delta chưa gửi thành công để tự thử lại ở nhịp sau
                unsyncedDeltaRef.current += cappedDelta;
                // Lưu ngay vào localStorage tránh mất dữ liệu
                persistLocalDraft();

                // Nếu lỗi HTTP 401 -> đánh dấu hết phiên để hiện hộp thoại đăng nhập lại
                if (axios.isAxiosError(err) && err.response?.status === 401) {
                    setIsSessionExpired(true);
                }
            } finally {
                // Giải phóng khóa đồng bộ cho các nhịp kế tiếp
                isSyncingRef.current = false;
            }
        },
        [isSessionExpired, lesson, onProgressSynced, persistLocalDraft]
    );

    // Nếu vừa mở bài và phát hiện có bản nháp từ lần mất mạng trước thì tự đồng bộ ngay khi trực tuyến
    useEffect(() => {
        if (lesson && lesson.lessonType === 'VIDEO' && hasPendingSync && !isOffline && !isSessionExpired) {
            void syncProgressNow(true);
        }
    }, [hasPendingSync, isOffline, isSessionExpired, lesson?.id, lesson?.lessonType, syncProgressNow]);

    // Lắng nghe sự kiện mất mạng / có mạng trở lại của trình duyệt
    useEffect(() => {
        // Khi mất kết nối mạng -> bật trạng thái offline và lưu ngay bản nháp cục bộ
        const handleOffline = () => {
            setIsOffline(true);
            persistLocalDraft();
        };
        // Khi có kết nối mạng trở lại -> tắt trạng thái offline và tự đồng bộ phần tiến độ đang chờ
        const handleOnline = () => {
            setIsOffline(false);
            void syncProgressNow(true);
        };
        // Trước khi đóng tab / tải lại trang -> lưu tạm cục bộ để bảo toàn tiến độ
        const handleBeforeUnload = () => {
            persistLocalDraft();
        };

        // Đăng ký các sự kiện toàn cục trên window
        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Hủy đăng ký sự kiện và lưu tạm khi rời khỏi trang phòng học
        return () => {
            persistLocalDraft();
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [persistLocalDraft, syncProgressNow]);

    // Tự động ẩn thông báo hoàn thành nhẹ sau 6 giây để không che khuất vùng xem video
    useEffect(() => {
        if (!showCompletionToast) {
            return;
        }
        // Thiết lập bộ đếm 6 giây rồi đóng toast
        const timer = window.setTimeout(() => {
            setShowCompletionToast(false);
        }, 6000);
        // Dọn bộ đếm nếu component unmount sớm
        return () => window.clearTimeout(timer);
    }, [showCompletionToast]);

    /**
     * Nhận tín hiệu tiến trình phát thực tế từ VideoPlayer (chỉ cộng những bước nhảy hợp lệ, chống tua).
     *
     * @param deltaSeconds    Khoảng thời gian thực vừa phát thêm giữa 2 khung hình
     * @param currentPosition Vị trí hiện tại trên thanh thời gian (giây)
     * @param playbackRate    Tốc độ phát hiện tại của video
     */
    const handlePlaybackTick = useCallback(
        (deltaSeconds: number, currentPosition: number, playbackRate: number) => {
            // Cập nhật mốc vị trí và tốc độ phát hiện tại vào ref
            lastPositionRef.current = currentPosition;
            playbackRateRef.current = playbackRate;

            // Chỉ cộng vào thời lượng xem thực tế nếu bước nhảy nằm trong ngưỡng phát tự nhiên (bỏ qua tua cóc)
            if (deltaSeconds > 0 && deltaSeconds <= MAX_VALID_TICK_DELTA_SECONDS) {
                unsyncedDeltaRef.current += deltaSeconds;
                // Cập nhật số giây hiển thị trực tiếp trên giao diện (chặn trần theo tổng thời lượng nếu biết)
                setLiveWatchedSeconds((prev) => {
                    const nextValue = prev + deltaSeconds;
                    return durationRef.current > 0 ? Math.min(durationRef.current, nextValue) : nextValue;
                });
            }

            // Khi đã tích lũy đủ 10 giây xem thực tế thì kích hoạt đồng bộ tự động lên server
            if (unsyncedDeltaRef.current >= HEARTBEAT_DELTA_SECONDS) {
                void syncProgressNow(false);
            }
        },
        [syncProgressNow]
    );

    /**
     * Cập nhật thời lượng video thực tế khi trình phát đọc được metadata từ tệp video.
     *
     * @param resolvedDuration Tổng thời lượng video tính theo giây
     */
    const handleDurationResolved = useCallback((resolvedDuration: number) => {
        // Chỉ cập nhật khi trình phát trả về thời lượng dương hợp lệ và DB chưa có thời lượng
        if (resolvedDuration > 0 && durationRef.current <= 0) {
            durationRef.current = Math.round(resolvedDuration);
            setEffectiveDuration(Math.round(resolvedDuration));
        }
    }, []);

    /**
     * Xử lý khi học viên chủ động kéo thanh trượt tua video (kiểm tra cảnh báo tua vội đến cuối).
     *
     * @param targetPosition Vị trí đích mà học viên vừa tua tới (giây)
     */
    const handleSeekAttempt = useCallback(
        (targetPosition: number) => {
            // Lưu lại vị trí mới nhất mà người dùng vừa chuyển tới
            lastPositionRef.current = targetPosition;
            // Lấy ngưỡng hoàn thành động của bài giảng (mặc định 60%)
            const requiredPercent = lesson?.requiredWatchPercent ?? 60;
            // Tính tỷ lệ xem thực tế hiện tại
            const currentPercent =
                durationRef.current > 0
                    ? Math.floor((liveWatchedSeconds * 100) / durationRef.current)
                    : 0;

            // Nếu học viên tua vội tới đoạn cuối (>= 85% video) mà thời lượng xem thực tế chưa đủ ngưỡng -> hiện nhắc nhẹ
            if (
                !isCompletedRef.current &&
                durationRef.current > 0 &&
                targetPosition >= durationRef.current * 0.85 &&
                currentPercent < requiredPercent
            ) {
                setShowSeekWarning(true);
            }
        },
        [lesson?.requiredWatchPercent, liveWatchedSeconds]
    );

    /**
     * Lưu mốc tạm dừng khi người dùng bấm tạm dừng hoặc khi video phát hết.
     *
     * @param currentPosition Vị trí dừng hiện tại (giây)
     */
    const handlePauseOrEndSync = useCallback(
        (currentPosition: number) => {
            // Ghi nhận chính xác vị trí tạm dừng gần nhất
            lastPositionRef.current = currentPosition;
            // Gửi đồng bộ lên server ngay cả khi delta nhỏ để bảo toàn mốc Resume
            void syncProgressNow(true);
        },
        [syncProgressNow]
    );

    // Tính tỷ lệ phần trăm xem thực tế hiển thị mượt trên thanh tiến độ của bài giảng
    const liveWatchPercent = lesson?.isCompleted
        ? Math.max(lesson.watchPercent, lesson.requiredWatchPercent)
        : effectiveDuration > 0
          ? Math.min(100, Math.floor((liveWatchedSeconds * 100) / effectiveDuration))
          : lesson?.watchPercent ?? 0;

    // Trả về các trạng thái và handler cho VideoPlayer và LessonRoomPage
    return {
        liveWatchPercent,
        effectiveDuration,
        isOffline,
        isSessionExpired,
        hasPendingSync,
        showCompletionToast,
        showTestUnlockedBanner,
        showSeekWarning,
        dismissCompletionToast: () => setShowCompletionToast(false),
        dismissTestUnlockedBanner: () => setShowTestUnlockedBanner(false),
        dismissSeekWarning: () => setShowSeekWarning(false),
        handlePlaybackTick,
        handleDurationResolved,
        handleSeekAttempt,
        handlePauseOrEndSync,
    };
}
