import { useEffect, useRef, useState } from 'react';
import {
    AlertTriangle,
    Flag,
    Maximize2,
    Minimize2,
    Pause,
    Play,
    RotateCcw,
    Volume2,
    VolumeX,
} from 'lucide-react';

/** Các mức tốc độ phát video được hỗ trợ cho học viên. */
const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5] as const;

/**
 * Thuộc tính đầu vào cho trình phát bài giảng Video có giám sát thời lượng xem thực tế.
 */
interface VideoPlayerProps {
    /** Đường dẫn tệp video bài giảng từ Backend (không dùng video mẫu cứng). */
    src?: string | null;
    /** Tiêu đề bài giảng phục vụ hỗ trợ tiếp cận (accessibility). */
    title: string;
    /** Mốc thời gian tạm dừng trước đó để gợi ý Xem tiếp (giây). */
    initialPositionSeconds: number;
    /** Thời lượng bài giảng lưu sẵn trong CSDL (giây). */
    initialDurationSeconds: number;
    /** Tỷ lệ % thời lượng xem thực tế hiện tại (0 - 100). */
    liveWatchPercent: number;
    /** Ngưỡng % tối thiểu cần đạt để hoàn thành bài giảng. */
    requiredWatchPercent: number;
    /** Trạng thái đã hoàn thành bài giảng hay chưa. */
    isCompleted: boolean;
    /** Cờ báo hiệu mất kết nối mạng (tự động tạm dừng video khi true). */
    isOffline: boolean;
    /** Cờ báo hiệu phiên đăng nhập đã hết hạn (tự động tạm dừng video khi true). */
    isSessionExpired: boolean;
    /** Callback bắn nhịp phát thực tế về hook giám sát tiến độ. */
    onPlaybackTick: (deltaSeconds: number, currentPosition: number, playbackRate: number) => void;
    /** Callback thông báo thời lượng thực tế đọc từ tệp video. */
    onDurationResolved: (durationSeconds: number) => void;
    /** Callback khi người dùng tua thanh thời gian. */
    onSeekAttempt: (targetPosition: number) => void;
    /** Callback đồng bộ vị trí khi tạm dừng hoặc phát xong video. */
    onPauseOrEndSync: (currentPosition: number) => void;
    /** Callback mở hộp thoại gửi báo lỗi học liệu nhanh khi video không tải được. */
    onReportBrokenVideo: () => void;
}

/**
 * Định dạng số giây sang chuỗi phút:giây chuẩn (ví dụ 04:25).
 *
 * @param secs Số giây cần định dạng
 * @returns Chuỗi mm:ss thân thiện
 */
function formatClockTime(secs: number): string {
    // Chặn giá trị âm hoặc NaN về 0 trước khi tính toán
    const safeSecs = Number.isFinite(secs) && secs > 0 ? Math.floor(secs) : 0;
    // Tính số phút nguyên
    const minutes = Math.floor(safeSecs / 60);
    // Tính số giây dư còn lại
    const seconds = safeSecs % 60;
    // Ghép thành chuỗi có 2 chữ số cho phần giây
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Trình phát Video bài giảng chuyên dụng cho phòng học LEBY:
 * - Hỗ trợ gợi ý "Xem tiếp từ vị trí tạm dừng" hoặc "Xem lại từ đầu"
 * - Giám sát thời gian phát thực tế, loại trừ hành vi tua cóc
 * - Tích hợp tốc độ phát, âm lượng, toàn màn hình, xử lý lỗi tệp video và tự tạm dừng khi mất mạng
 */
export function VideoPlayer({
    src,
    title,
    initialPositionSeconds,
    initialDurationSeconds,
    liveWatchPercent,
    requiredWatchPercent,
    isCompleted,
    isOffline,
    isSessionExpired,
    onPlaybackTick,
    onDurationResolved,
    onSeekAttempt,
    onPauseOrEndSync,
    onReportBrokenVideo,
}: VideoPlayerProps) {
    // Tham chiếu trực tiếp tới thẻ DOM <video>
    const videoRef = useRef<HTMLVideoElement | null>(null);
    // Tham chiếu tới khung bọc ngoài cùng để phóng to toàn màn hình kèm thanh điều khiển
    const containerRef = useRef<HTMLDivElement | null>(null);
    // Lưu mốc thời gian của lần cập nhật trước để tính khoảng phát thực tế (chống tua)
    const lastTickTimeRef = useRef<number | null>(null);
    // Cờ đang trong quá trình kéo thanh trượt tua video
    const isSeekingRef = useRef<boolean>(false);

    // Trạng thái video đang phát hay đang tạm dừng
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    // Vị trí phát hiện tại tính theo giây
    const [currentTime, setCurrentTime] = useState<number>(0);
    // Tổng thời lượng video tính theo giây
    const [duration, setDuration] = useState<number>(initialDurationSeconds);
    // Mức âm lượng hiện tại (0 đến 1)
    const [volume, setVolume] = useState<number>(1);
    // Cờ tắt tiếng hiện tại
    const [isMuted, setIsMuted] = useState<boolean>(false);
    // Tốc độ phát hiện tại (mặc định 1.0x)
    const [playbackRate, setPlaybackRate] = useState<number>(1);
    // Cờ trạng thái đang ở chế độ toàn màn hình hay không
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    // Cờ báo hiệu tệp video bị lỗi không thể tải hoặc thiếu đường dẫn
    const [hasMediaError, setHasMediaError] = useState<boolean>(!src);
    // Cờ hiển thị thanh gợi ý Xem tiếp từ vị trí tạm dừng (chỉ hiện nếu lần trước đã xem > 5s)
    const [showResumePrompt, setShowResumePrompt] = useState<boolean>(
        initialPositionSeconds > 5 &&
            (initialDurationSeconds <= 0 || initialPositionSeconds < initialDurationSeconds - 3)
    );

    // Đặt lại trạng thái trình phát khi chuyển sang bài học / nguồn video khác
    useEffect(() => {
        // Xóa mốc thời gian cũ để không tính nhầm bước nhảy giữa 2 video
        lastTickTimeRef.current = null;
        isSeekingRef.current = false;
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(initialDurationSeconds);
        setHasMediaError(!src);
        // Hiện lại thanh gợi ý Xem tiếp nếu bài mới có lịch sử tạm dừng hợp lệ
        setShowResumePrompt(
            initialPositionSeconds > 5 &&
                (initialDurationSeconds <= 0 || initialPositionSeconds < initialDurationSeconds - 3)
        );
    }, [src, initialPositionSeconds, initialDurationSeconds]);

    // Tự động tạm dừng video ngay lập tức khi mất kết nối mạng hoặc phiên làm việc hết hạn
    useEffect(() => {
        if ((isOffline || isSessionExpired) && videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, [isOffline, isSessionExpired]);

    // Theo dõi trạng thái toàn màn hình của trình duyệt để cập nhật biểu tượng tương ứng
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    /**
     * Bật hoặc tạm dừng phát video; chặn phát khi đang mất mạng hoặc hết phiên.
     */
    function togglePlay() {
        // Không thao tác nếu thẻ video chưa sẵn sàng, tệp lỗi hoặc đang ngoại tuyến/hết phiên
        if (!videoRef.current || hasMediaError || isOffline || isSessionExpired) {
            return;
        }
        // Nếu đang phát thì tạm dừng, ngược lại thì bắt đầu phát
        if (!videoRef.current.paused) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            // Ẩn thanh gợi ý Resume khi người dùng đã chủ động bấm phát
            setShowResumePrompt(false);
            // Ghi nhận mốc bắt đầu phát để tính chính xác delta từ thời điểm này
            lastTickTimeRef.current = videoRef.current.currentTime;
            videoRef.current.play().catch(() => {
                setIsPlaying(false);
            });
            setIsPlaying(true);
        }
    }

    /**
     * Xử lý khi học viên chọn "Xem tiếp từ vị trí tạm dừng".
     */
    function handleResumeFromSavedPosition() {
        if (!videoRef.current || hasMediaError || isOffline || isSessionExpired) {
            return;
        }
        // Đảm bảo mốc nhảy không vượt quá tổng thời lượng thực tế của video
        const safeTarget =
            duration > 0 ? Math.min(duration - 1, initialPositionSeconds) : initialPositionSeconds;
        // Nhảy đầu đọc đến đúng vị trí đã lưu
        videoRef.current.currentTime = Math.max(0, safeTarget);
        setCurrentTime(Math.max(0, safeTarget));
        // Đặt lại mốc tham chiếu để bước nhảy Resume không bị tính thành thời gian xem
        lastTickTimeRef.current = Math.max(0, safeTarget);
        setShowResumePrompt(false);
        // Tự động phát tiếp ngay cho học viên
        videoRef.current.play().catch(() => {
            setIsPlaying(false);
        });
        setIsPlaying(true);
    }

    /**
     * Xử lý khi học viên chọn "Xem lại từ đầu".
     */
    function handleRestartFromBeginning() {
        if (!videoRef.current || hasMediaError || isOffline || isSessionExpired) {
            return;
        }
        // Đưa đầu đọc về giây 0
        videoRef.current.currentTime = 0;
        setCurrentTime(0);
        lastTickTimeRef.current = 0;
        setShowResumePrompt(false);
        // Phát lại từ đầu
        videoRef.current.play().catch(() => {
            setIsPlaying(false);
        });
        setIsPlaying(true);
    }

    /**
     * Đọc tổng thời lượng thực tế ngay khi trình duyệt nạp xong siêu dữ liệu của video.
     */
    function handleLoadedMetadata() {
        if (!videoRef.current) {
            return;
        }
        const resolved = videoRef.current.duration;
        if (Number.isFinite(resolved) && resolved > 0) {
            setDuration(resolved);
            onDurationResolved(resolved);
        }
    }

    /**
     * Cập nhật thanh thời gian và tính khoảng thời gian xem thực tế (loại trừ đoạn tua).
     */
    function handleTimeUpdate() {
        if (!videoRef.current) {
            return;
        }
        const nowPos = videoRef.current.currentTime;
        setCurrentTime(nowPos);

        // Nếu đang kéo tua hoặc video không đang phát thì chỉ cập nhật mốc tham chiếu, không cộng delta
        if (isSeekingRef.current || videoRef.current.paused || videoRef.current.ended) {
            lastTickTimeRef.current = nowPos;
            return;
        }

        // Tính chênh lệch giây thực tế so với lần cập nhật liền trước
        if (lastTickTimeRef.current !== null) {
            const delta = nowPos - lastTickTimeRef.current;
            // Đẩy bước nhảy về hook theo dõi tiến độ để lọc chống tua và kích hoạt heartbeat
            onPlaybackTick(delta, nowPos, playbackRate);
        }

        // Lưu mốc hiện tại làm tham chiếu cho khung hình tiếp theo
        lastTickTimeRef.current = nowPos;
    }

    /**
     * Xử lý khi học viên kéo thanh trượt thời gian.
     */
    function handleSeekChange(event: React.ChangeEvent<HTMLInputElement>) {
        // Đọc vị trí giây đích từ thanh trượt
        const targetPos = Number(event.target.value);
        // Đánh dấu đang tua để hàm handleTimeUpdate không cộng đoạn nhảy cóc này
        isSeekingRef.current = true;
        setCurrentTime(targetPos);
        if (videoRef.current) {
            videoRef.current.currentTime = targetPos;
        }
        // Cập nhật mốc tham chiếu về đúng vị trí đích sau khi tua
        lastTickTimeRef.current = targetPos;
        setShowResumePrompt(false);
        // Thông báo cho hook theo dõi để kiểm tra cảnh báo tua vội đến cuối
        onSeekAttempt(targetPos);
    }

    /**
     * Kết thúc trạng thái tua khi trình phát đã chuyển khung hình xong.
     */
    function handleSeeked() {
        isSeekingRef.current = false;
        if (videoRef.current) {
            lastTickTimeRef.current = videoRef.current.currentTime;
        }
    }

    /**
     * Lưu mốc tạm dừng lên máy chủ khi người dùng dừng video.
     */
    function handleVideoPause() {
        setIsPlaying(false);
        if (videoRef.current) {
            onPauseOrEndSync(videoRef.current.currentTime);
        }
    }

    /**
     * Lưu tiến độ lần cuối khi video phát đến giây cuối cùng.
     */
    function handleVideoEnded() {
        setIsPlaying(false);
        if (videoRef.current) {
            onPauseOrEndSync(videoRef.current.currentTime);
        }
    }

    /**
     * Điều chỉnh mức âm lượng của video.
     */
    function handleVolumeChange(event: React.ChangeEvent<HTMLInputElement>) {
        const nextVol = Number(event.target.value);
        setVolume(nextVol);
        if (videoRef.current) {
            videoRef.current.volume = nextVol;
            videoRef.current.muted = nextVol === 0;
        }
        setIsMuted(nextVol === 0);
    }

    /**
     * Bật/tắt tiếng nhanh.
     */
    function toggleMute() {
        if (!videoRef.current) {
            return;
        }
        const nextMuted = !isMuted;
        videoRef.current.muted = nextMuted;
        setIsMuted(nextMuted);
        // Nếu bật tiếng trở lại khi âm lượng đang bằng 0 thì khôi phục về 80%
        if (!nextMuted && volume === 0) {
            videoRef.current.volume = 0.8;
            setVolume(0.8);
        }
    }

    /**
     * Chuyển đổi tốc độ phát tuần tự giữa 0.75x, 1.0x, 1.25x và 1.5x.
     */
    function cyclePlaybackRate() {
        const currentIndex = PLAYBACK_RATES.indexOf(
            playbackRate as (typeof PLAYBACK_RATES)[number]
        );
        const nextRate = PLAYBACK_RATES[(currentIndex + 1) % PLAYBACK_RATES.length];
        setPlaybackRate(nextRate);
        if (videoRef.current) {
            videoRef.current.playbackRate = nextRate;
        }
    }

    /**
     * Bật/tắt chế độ xem toàn màn hình.
     */
    function toggleFullscreen() {
        if (!containerRef.current) {
            return;
        }
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    }

    // Màn hình thay thế khi tệp video bị lỗi hoặc không có đường dẫn hợp lệ
    if (hasMediaError || !src) {
        return (
            <div className="video-error-card" role="alert">
                <div className="video-error-card__icon" aria-hidden="true">
                    <AlertTriangle size={28} />
                </div>
                <h3 className="video-error-card__title">Không thể tải tệp video bài giảng</h3>
                <p className="video-error-card__desc">
                    Không thể tải tệp video bài giảng. Vui lòng thông báo cho quản trị viên để khắc phục sớm nhất.
                </p>
                <div className="video-error-card__actions">
                    {/* Cho phép thử tải lại nếu do đường truyền chập chờn */}
                    {src && (
                        <button
                            type="button"
                            className="video-error-card__btn is-secondary"
                            onClick={() => setHasMediaError(false)}
                        >
                            <RotateCcw size={15} />
                            <span>Thử tải lại video</span>
                        </button>
                    )}
                    {/* Nút gửi báo lỗi học liệu nhanh cho quản trị viên */}
                    <button
                        type="button"
                        className="video-error-card__btn is-primary"
                        onClick={onReportBrokenVideo}
                    >
                        <Flag size={15} />
                        <span>Gửi báo lỗi nhanh</span>
                    </button>
                </div>
            </div>
        );
    }

    // Tính vị trí điểm mốc mục tiêu (%) hiển thị trực quan trên thanh tiến độ xem thực tế
    const clampedWatchPercent = Math.max(0, Math.min(100, liveWatchPercent));

    return (
        <div className="video-player-shell">
            {/* Thanh gợi ý Xem tiếp từ vị trí tạm dừng trước đó nếu có lịch sử xem */}
            {showResumePrompt && (
                <div className="video-resume-banner" role="region" aria-label="Tiếp tục xem bài giảng">
                    <div className="video-resume-banner__text">
                        <span>Bạn đã dừng bài giảng ở mốc </span>
                        <strong>{formatClockTime(initialPositionSeconds)}</strong>
                    </div>
                    <div className="video-resume-banner__actions">
                        <button
                            type="button"
                            className="video-resume-btn is-primary"
                            onClick={handleResumeFromSavedPosition}
                        >
                            <Play size={14} fill="currentColor" />
                            <span>Xem tiếp từ {formatClockTime(initialPositionSeconds)}</span>
                        </button>
                        <button
                            type="button"
                            className="video-resume-btn is-ghost"
                            onClick={handleRestartFromBeginning}
                        >
                            <RotateCcw size={14} />
                            <span>Xem lại từ đầu</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Khung trình phát video chính 16:9 */}
            <div ref={containerRef} className="video-player-container">
                <video
                    ref={videoRef}
                    src={src}
                    aria-label={title}
                    className="video-element"
                    preload="metadata"
                    playsInline
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onSeeked={handleSeeked}
                    onPause={handleVideoPause}
                    onEnded={handleVideoEnded}
                    onError={() => setHasMediaError(true)}
                    onClick={togglePlay}
                />

                {/* Nút phát lớn ở giữa khung hình khi video đang dừng */}
                {!isPlaying && !isOffline && !isSessionExpired && (
                    <button
                        type="button"
                        className="video-center-play-btn"
                        onClick={togglePlay}
                        aria-label="Phát bài giảng"
                    >
                        <Play size={28} fill="#ffffff" />
                    </button>
                )}

                {/* Thanh điều khiển phía dưới khung video */}
                <div className="video-controls">
                    {/* Nút phát / tạm dừng */}
                    <button
                        type="button"
                        className="video-play-btn"
                        onClick={togglePlay}
                        disabled={isOffline || isSessionExpired}
                        aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
                    >
                        {isPlaying ? (
                            <Pause size={17} fill="#ffffff" />
                        ) : (
                            <Play size={17} fill="#ffffff" />
                        )}
                    </button>

                    {/* Thời gian phát hiện tại */}
                    <span className="video-time">{formatClockTime(currentTime)}</span>

                    {/* Thanh trượt thời gian */}
                    <input
                        type="range"
                        min={0}
                        max={duration > 0 ? duration : 100}
                        step={0.5}
                        value={Math.min(currentTime, duration > 0 ? duration : 100)}
                        onChange={handleSeekChange}
                        className="video-seeker"
                        aria-label="Thanh thời gian bài giảng"
                    />

                    {/* Tổng thời lượng video */}
                    <span className="video-time">{formatClockTime(duration)}</span>

                    {/* Nút chuyển tốc độ phát */}
                    <button
                        type="button"
                        className="video-rate-btn"
                        onClick={cyclePlaybackRate}
                        title="Đổi tốc độ phát"
                    >
                        {playbackRate}x
                    </button>

                    {/* Cụm điều chỉnh âm lượng */}
                    <div className="video-volume-group">
                        <button
                            type="button"
                            className="video-icon-btn"
                            onClick={toggleMute}
                            aria-label={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
                        >
                            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        </button>
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.05}
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="video-volume-slider"
                            aria-label="Âm lượng"
                        />
                    </div>

                    {/* Nút toàn màn hình */}
                    <button
                        type="button"
                        className="video-icon-btn"
                        onClick={toggleFullscreen}
                        aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                    >
                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                </div>
            </div>

            {/* Thanh đo tiến độ xem thực tế tách biệt với thanh tua để học viên theo dõi minh bạch */}
            <div className="video-watch-meter">
                <div className="video-watch-meter__header">
                    <span className="video-watch-meter__label">
                        {isCompleted
                            ? 'Bạn đã hoàn thành bài giảng này'
                            : `Tiến độ xem thực tế: ${clampedWatchPercent}% (cần tối thiểu ${requiredWatchPercent}% để hoàn thành)`}
                    </span>
                    <span className={`video-watch-meter__badge ${isCompleted ? 'is-done' : ''}`}>
                        {isCompleted ? 'Đã hoàn thành' : `${clampedWatchPercent}% / ${requiredWatchPercent}%`}
                    </span>
                </div>
                <div className="video-watch-meter__track">
                    {/* Phần thanh tiến độ xem thực tế đã tích lũy */}
                    <div
                        className={`video-watch-meter__fill ${isCompleted ? 'is-done' : ''}`}
                        style={{ width: `${clampedWatchPercent}%` }}
                    />
                    {/* Vạch đánh dấu mốc tối thiểu cần đạt */}
                    <span
                        className="video-watch-meter__threshold"
                        style={{ left: `${Math.min(100, Math.max(0, requiredWatchPercent))}%` }}
                        title={`Mốc hoàn thành ${requiredWatchPercent}%`}
                    />
                </div>
            </div>
        </div>
    );
}
