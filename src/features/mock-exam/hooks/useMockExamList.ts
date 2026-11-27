import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { parseExamApiError } from '@/shared/exam/utils/examErrorUtils';
import { mockExamService } from '../services/mockExamService';
import type { ExamTag, MockExamListData, MockExamListItem } from '../types/mockExamTypes';
import {
    clearMockExamLocalDraft,
    clearPendingMockExamSubmit,
    readPendingMockExamSubmit,
} from '../utils/mockExamDraftUtils';

// Kiểu bộ lọc danh sách đề thi thử trên trang sảnh Phòng thi ETS
export type MockExamTagFilter = 'ALL' | ExamTag;

// Hook quản lý trạng thái sảnh Danh sách đề thi thử ETS, mở khóa đề đầu ra và khởi tạo phiên thi (UC17)
export function useMockExamList() {
    // Hook điều hướng của React Router
    const navigate = useNavigate();
    // Lấy thông tin người dùng hiện tại phục vụ dọn nháp hoặc đồng bộ bài nộp treo
    const { user } = useAuth();
    // Ép userId an toàn kiểu number nếu đã đăng nhập
    const userId = user?.id;

    // Dữ liệu danh sách đề thi, trạng thái mở khóa đầu ra và lịch sử
    const [listData, setListData] = useState<MockExamListData | null>(null);
    // Trạng thái đang tải dữ liệu sảnh phòng thi
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // Thông báo lỗi khi tải danh sách thất bại
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    // Bộ lọc theo phân loại đề (Tất cả / Luyện tập / Đầu ra)
    const [tagFilter, setTagFilter] = useState<MockExamTagFilter>('ALL');

    // Bộ đề đang được chọn để hiển thị hộp thoại xác nhận nội quy trước khi thi
    const [pendingStartExam, setPendingStartExam] = useState<MockExamListItem | null>(null);
    // Trạng thái đang gọi API khởi tạo phiên thi
    const [isStarting, setIsStarting] = useState<boolean>(false);
    // Thông báo lỗi phát sinh khi bấm Bắt đầu làm bài
    const [startError, setStartError] = useState<string | null>(null);

    // Tải danh sách đề thi và tự động đẩy lại bài thi nộp dở do mất mạng nếu tồn tại
    const loadList = useCallback(async () => {
        // Bật cờ loading và xóa thông báo lỗi cũ trước khi gọi API
        setIsLoading(true);
        setErrorMessage(null);

        // Kiểm tra xem trình duyệt có lưu bài thi chưa kịp nộp lên máy chủ do rớt mạng trước đó không
        if (typeof userId === 'number' && Number.isFinite(userId) && userId > 0) {
            // Đọc payload nộp bài đang chờ đồng bộ
            const pendingPayload = readPendingMockExamSubmit(userId);
            // Nếu có bài thi nộp treo thì ưu tiên gửi lên Backend ngay lập tức
            if (pendingPayload) {
                try {
                    // Gọi API nộp bài để chốt điểm thay cho học viên
                    const submitRes = await mockExamService.submitMockExam(pendingPayload);
                    // Xóa hàng đợi nộp bài sau khi máy chủ ghi nhận thành công
                    clearPendingMockExamSubmit(userId);
                    // Dọn luôn bản nháp làm bài cục bộ của lượt thi đã nộp
                    clearMockExamLocalDraft(userId, pendingPayload.attemptId);
                    // Điều hướng ngay tới trang báo cáo tương ứng với examTag
                    const targetRoute =
                        submitRes.data.examTag === 'OUTPUT'
                            ? `/mock-exam/report/${submitRes.data.attemptId}`
                            : `/mock-exam/results/${submitRes.data.attemptId}`;
                    // Chuyển hướng trang và thay thế history để tránh bấm Back quay lại
                    navigate(targetRoute, { replace: true });
                    return;
                } catch (pendingErr) {
                    // Chuẩn hóa lỗi khi đẩy bài nộp treo
                    const parsedPending = parseExamApiError(pendingErr, '');
                    // Nếu hết hạn phiên đăng nhập thì đưa học viên về trang login
                    if (parsedPending.status === 401) {
                        navigate('/login', { replace: true });
                        return;
                    }
                    // Nếu máy chủ trả lỗi nghiệp vụ 4xx không thể nộp lại nữa thì xóa hàng đợi
                    if (parsedPending.status && parsedPending.status >= 400 && parsedPending.status < 500) {
                        clearPendingMockExamSubmit(userId);
                    }
                }
            }
        }

        // Gọi API lấy danh sách đề thi thử ETS và lịch sử thi của học viên
        try {
            // Thực hiện request GET danh sách phòng thi thử
            const res = await mockExamService.listMockExams();
            // Lưu dữ liệu trả về vào state hiển thị
            setListData(res.data);
        } catch (err) {
            // Chuyển đổi ngoại lệ Axios thành thông báo dễ hiểu
            const parsed = parseExamApiError(
                err,
                'Không thể tải danh sách đề thi thử ETS. Vui lòng thử lại.'
            );
            // Nếu chưa xác thực thì chuyển hướng về trang đăng nhập
            if (parsed.status === 401) {
                navigate('/login', { replace: true });
                return;
            }
            // Ghi nhận thông báo lỗi để hiển thị màn hình Retry
            setErrorMessage(parsed.message);
        } finally {
            // Tắt trạng thái loading sau khi hoàn tất mọi nhánh xử lý
            setIsLoading(false);
        }
    }, [userId, navigate]);

    // Tự động tải danh sách khi hook mount hoặc userId sẵn sàng
    useEffect(() => {
        // Kích hoạt hàm tải dữ liệu ban đầu
        void loadList();
    }, [loadList]);

    // Lọc danh sách bộ đề theo tab người dùng đang chọn
    const filteredExams = useMemo(() => {
        // Lấy mảng gốc hoặc mảng rỗng nếu dữ liệu chưa tải xong
        const all = listData?.exams ?? [];
        // Giữ nguyên tất cả bộ đề khi tab lọc là ALL
        if (tagFilter === 'ALL') return all;
        // Lọc đúng các bộ đề có examTag khớp bộ lọc
        return all.filter((exam) => exam.examTag === tagFilter);
    }, [listData?.exams, tagFilter]);

    // Mở hộp thoại xác nhận nội quy hoặc vào tiếp phiên thi đang làm dở
    const handleSelectExam = useCallback(
        (exam: MockExamListItem) => {
            // Không cho phép mở đề đầu ra khi học viên chưa hoàn tất lộ trình
            if (exam.isLocked) {
                // Ghi nhận lý do khóa để hiển thị nhắc nhở thân thiện
                setStartError(
                    exam.lockReason ??
                        'Bạn cần hoàn thành toàn bộ lộ trình học tập để mở khóa đề thi đầu ra này.'
                );
                return;
            }
            // Nếu đề này đã có phiên đang làm dở thì quay thẳng vào phòng thi khôi phục luôn
            if (exam.hasInProgressAttempt && exam.inProgressAttemptId) {
                // Điều hướng tới route phòng thi kèm attemptId đang làm dở
                navigate(`/mock-exam/room/${exam.inProgressAttemptId}`);
                return;
            }
            // Xóa thông báo lỗi cũ trước khi mở modal hướng dẫn nội quy phòng thi
            setStartError(null);
            // Lưu bộ đề được chọn để hiển thị MockExamIntroModal
            setPendingStartExam(exam);
        },
        [navigate]
    );

    // Đóng hộp thoại xác nhận nội quy thi
    const closeStartModal = useCallback(() => {
        // Không cho phép đóng khi API start đang gửi đi
        if (isStarting) return;
        // Xóa lựa chọn bộ đề và thông báo lỗi tạm
        setPendingStartExam(null);
        setStartError(null);
    }, [isStarting]);

    // Xác nhận bắt đầu làm bài thi thử và điều hướng vào Phòng thi ETS 200 câu
    const handleConfirmStart = useCallback(async () => {
        // Bỏ qua nếu chưa có đề nào được chọn hoặc đang trong tiến trình gọi API
        if (!pendingStartExam || isStarting) return;
        // Bật cờ loading nút Bắt đầu và xóa lỗi cũ
        setIsStarting(true);
        setStartError(null);
        try {
            // Gọi API POST khởi tạo phiên thi mới trên Backend
            const res = await mockExamService.startMockExam({
                diagnosticTestId: pendingStartExam.id,
            });
            // Xóa modal chọn đề trước khi chuyển trang
            setPendingStartExam(null);
            // Điều hướng ngay vào phòng thi 200 câu với attemptId vừa nhận
            navigate(`/mock-exam/room/${res.data.attemptId}`);
        } catch (err) {
            // Phân tích lỗi từ Backend (ví dụ chưa mở khóa đề OUTPUT)
            const parsed = parseExamApiError(
                err,
                'Không thể khởi tạo phiên thi thử lúc này. Vui lòng thử lại.'
            );
            // Nếu phiên đăng nhập hết hạn thì chuyển về trang Login
            if (parsed.status === 401) {
                navigate('/login', { replace: true });
                return;
            }
            // Hiển thị thông báo lỗi ngay trên modal hoặc sảnh phòng thi
            setStartError(parsed.message);
        } finally {
            // Giải phóng khóa nút bắt đầu
            setIsStarting(false);
        }
    }, [pendingStartExam, isStarting, navigate]);

    // Tiếp tục nhanh phiên thi thử đang dang dở từ banner đầu trang
    const handleResumeActiveAttempt = useCallback(() => {
        // Chỉ điều hướng khi API danh sách báo có phiên IN_PROGRESS hợp lệ
        if (!listData?.activeAttemptId) return;
        // Chuyển thẳng tới phòng thi theo activeAttemptId
        navigate(`/mock-exam/room/${listData.activeAttemptId}`);
    }, [listData?.activeAttemptId, navigate]);

    // Trả về đầy đủ dữ liệu và hành động cho trang danh sách MockExamListPage
    return {
        listData,
        filteredExams,
        tagFilter,
        setTagFilter,
        isLoading,
        errorMessage,
        pendingStartExam,
        isStarting,
        startError,
        retryLoad: loadList,
        handleSelectExam,
        closeStartModal,
        handleConfirmStart,
        handleResumeActiveAttempt,
    };
}
