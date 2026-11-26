import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Lock, SkipForward } from 'lucide-react';

interface AudioPlayerProps {
    // Khóa bước hiện tại giúp reset và tự nạp lại file audio ngay cả khi các câu dùng chung URL
    stepKey: string;
    // Đường dẫn file âm thanh của câu hỏi hoặc chùm câu hỏi Listening
    src?: string | null;
    // Khóa phát lại nếu audio này đã chạy xong 1 lần (BR13)
    isLocked: boolean;
    // Đang tạm dừng phòng thi hoặc đang nộp bài
    isPaused?: boolean;
    // Cho phép tự động phát nối tiếp khi chuyển sang câu Nghe tiếp theo trong phiên
    shouldAutoPlay?: boolean;
    // Thông báo lên hook khi học viên bấm tương tác phát audio lần đầu
    onUserStartedAudio?: () => void;
    // Callback kích hoạt khi bản ghi âm kết thúc (hoặc bỏ qua lúc file lỗi)
    onAudioEnded: () => void;
}

/**
 * Trình phát âm thanh tuân thủ BR08 / BR13:
 * - Phát đúng 1 lần duy nhất cho mỗi câu / chùm câu Nghe.
 * - Tự động nạp lại và phát nối tiếp khi chuyển câu Nghe tiếp theo.
 * - Tự tạm dừng khi học viên bấm Tạm dừng phòng thi và tự phát tiếp đoạn đang nghe dở khi Tiếp tục.
 */
export function AudioPlayer({
    stepKey,
    src,
    isLocked,
    isPaused = false,
    shouldAutoPlay = false,
    onUserStartedAudio,
    onAudioEnded,
}: AudioPlayerProps) {
    // Trạng thái đang phát âm thanh hay không
    const [isPlaying, setIsPlaying] = useState(false);
    // Thời gian đã chạy tính theo giây
    const [currentTime, setCurrentTime] = useState(0);
    // Tổng thời lượng file âm thanh tính theo giây
    const [duration, setDuration] = useState(0);
    // Trạng thái tắt tiếng loa trên trình duyệt
    const [isMuted, setIsMuted] = useState(false);
    // Cờ báo lỗi khi file audio không tải được từ mạng/CDN
    const [hasAudioError, setHasAudioError] = useState(false);
    // Tham chiếu trực tiếp tới thẻ <audio> gốc của trình duyệt
    const audioRef = useRef<HTMLAudioElement | null>(null);
    // Ghi nhớ audio có đang phát ngay trước lúc bấm Tạm dừng hay không để tự resume lại
    const wasPlayingBeforePauseRef = useRef(false);
    // Các ref lưu trạng thái mới nhất để effect đổi câu không phải reset nhầm khi user bấm Play hoặc Pause
    const isLockedRef = useRef(isLocked);
    const isPausedRef = useRef(isPaused);
    const shouldAutoPlayRef = useRef(shouldAutoPlay);

    // Đồng bộ props mới nhất vào ref sau mỗi lần render
    useEffect(() => {
        isLockedRef.current = isLocked;
        isPausedRef.current = isPaused;
        shouldAutoPlayRef.current = shouldAutoPlay;
    }, [isLocked, isPaused, shouldAutoPlay]);

    // Chỉ reset và nạp lại file audio khi chuyển sang câu/chùm Listening khác (stepKey hoặc src thay đổi)
    useEffect(() => {
        // Đặt lại toàn bộ thông số hiển thị cho bản ghi mới
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setHasAudioError(false);
        // Xóa cờ tạm dừng cũ vì đã sang bản ghi âm mới
        wasPlayingBeforePauseRef.current = false;

        // Lấy phần tử <audio> hiện tại
        const audio = audioRef.current;
        // Nếu chưa mount audio hoặc không có nguồn âm thanh thì dừng tại đây
        if (!audio || !src) return;

        // Dừng bản ghi cũ nếu còn chạy và đặt lại con trỏ về giây 0
        audio.pause();
        audio.currentTime = 0;
        // Bắt buộc gọi .load() để trình duyệt nạp metadata mới khi src hoặc stepKey thay đổi
        audio.load();

        // Nếu bài này đã khóa hết lượt phát hoặc phòng đang tạm dừng hoặc chưa bắt đầu phiên nghe thì không tự phát
        if (isLockedRef.current || isPausedRef.current || !shouldAutoPlayRef.current) return;

        // Thử tự động phát liên tục khi chuyển sang câu Nghe tiếp theo
        audio
            .play()
            .then(() => {
                // Cập nhật icon chuyển sang trạng thái đang phát
                setIsPlaying(true);
            })
            .catch(() => {
                // Nếu trình duyệt chặn autoplay khi chưa tương tác, giữ nút Play sẵn để người dùng bấm tay
                setIsPlaying(false);
            });
    }, [stepKey, src]);

    // Tự dừng khi Tạm dừng phòng thi và tự chạy tiếp đoạn đang nghe dở khi Tiếp tục
    useEffect(() => {
        // Lấy tham chiếu phần tử audio
        const audio = audioRef.current;
        // Thoát sớm nếu chưa có thẻ audio
        if (!audio) return;

        // Khi chuyển sang trạng thái Tạm dừng
        if (isPaused) {
            // Nếu lúc đó audio đang chạy thì ghi nhận lại để lúc Tiếp tục phát nối luôn
            if (!audio.paused) {
                wasPlayingBeforePauseRef.current = true;
                audio.pause();
                setIsPlaying(false);
            }
            return;
        }

        // Khi người dùng bấm Tiếp tục làm bài và trước đó audio đang chạy dở (chưa bị khóa)
        if (!isPaused && wasPlayingBeforePauseRef.current && !isLocked && src) {
            // Xóa cờ để không lặp lại nhiều lần
            wasPlayingBeforePauseRef.current = false;
            // Phát tiếp ngay từ vị trí currentTime đang dở
            audio
                .play()
                .then(() => {
                    // Đồng bộ lại trạng thái đang phát
                    setIsPlaying(true);
                })
                .catch(() => {
                    // Phòng trường hợp trình duyệt từ chối resume tự động
                    setIsPlaying(false);
                });
        }
    }, [isPaused, isLocked, src]);

    // Xử lý bấm nút Phát / Tạm dừng trên thanh điều khiển audio
    function togglePlay() {
        // Không làm gì nếu audio đã hết lượt nghe, thiếu src hoặc phòng đang tạm dừng
        if (isLocked || !audioRef.current || !src || isPaused) return;

        // Nếu đang phát -> tạm dừng; nếu đang dừng -> bắt đầu phát và đánh dấu đã tương tác nghe
        if (isPlaying) {
            // Dừng phát audio
            audioRef.current.pause();
            // Xóa cờ resume khi tạm dừng thủ công
            wasPlayingBeforePauseRef.current = false;
            // Cập nhật icon về Play
            setIsPlaying(false);
        } else {
            // Đánh dấu học viên đã chủ động bấm nghe để mở khóa autoplay cho các câu sau
            onUserStartedAudio?.();
            // Bắt đầu phát bản ghi âm
            audioRef.current
                .play()
                .then(() => {
                    // Chuyển nút sang trạng thái đang phát
                    setIsPlaying(true);
                    // Xóa cờ lỗi cũ nếu phát lại thành công
                    setHasAudioError(false);
                })
                .catch(() => {
                    // Giữ trạng thái dừng nếu trình duyệt từ chối phát
                    setIsPlaying(false);
                });
        }
    }

    // Cập nhật tiến trình giây đang phát theo thời gian thực
    function handleTimeUpdate() {
        // Đọc currentTime và duration mới nhất từ phần tử audio
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            if (!isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
                setDuration(audioRef.current.duration);
            }
        }
    }

    // Cập nhật tổng thời lượng ngay khi trình duyệt đọc xong metadata audio
    function handleLoadedMetadata() {
        // Lưu tổng thời lượng hợp lệ vào state để hiển thị mốc phút:giây
        if (audioRef.current && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
            setDuration(audioRef.current.duration);
        }
    }

    // Xử lý sự kiện audio chạy đến giây cuối cùng
    function handleEnded() {
        // Đưa trạng thái về dừng và thanh tiến trình đầy 100%
        setIsPlaying(false);
        setCurrentTime(duration);
        wasPlayingBeforePauseRef.current = false;
        // Thông báo cho Hook để khóa audio hiện tại và tự nhảy sang câu tiếp theo
        onAudioEnded();
    }

    // Đánh dấu lỗi khi không tải được file âm thanh để mở phương án dự phòng tránh kẹt thi
    function handleAudioError() {
        // Tắt trạng thái đang phát và bật thông báo lỗi âm thanh
        setIsPlaying(false);
        setHasAudioError(true);
    }

    // Bật hoặc tắt âm thanh loa
    function toggleMute() {
        // Đảo trạng thái muted trên DOM audio và cập nhật state hiển thị icon
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    }

    // Định dạng số giây sang chuỗi phút:giây (ví dụ 1:05)
    const formatTime = (secs: number) => {
        // Trả về 0:00 nếu giá trị chưa sẵn sàng
        if (!isFinite(secs) || secs < 0) return '0:00';
        // Chia lấy phần phút nguyên
        const m = Math.floor(secs / 60);
        // Lấy phần giây dư
        const s = Math.floor(secs % 60);
        // Ghép chuỗi kèm số 0 đầu ở hàng giây
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    // Tính phần trăm độ dài thanh tiến trình đã nghe
    const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

    return (
        <div className="audio-player-wrap">
            {/* Thanh phát âm thanh chính */}
            <div className={`audio-player ${isLocked ? 'is-locked' : ''}`}>
                {/* Thẻ audio gốc của trình duyệt, gắn event metadata, tiến trình, kết thúc và lỗi */}
                {src && (
                    <audio
                        ref={audioRef}
                        src={src}
                        preload="metadata"
                        onLoadedMetadata={handleLoadedMetadata}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleEnded}
                        onError={handleAudioError}
                    />
                )}

                {/* Nút Phát / Tạm dừng hoặc biểu tượng Khóa khi đã nghe đủ 1 lượt */}
                <button
                    type="button"
                    className={`audio-player__play-btn ${isLocked ? 'is-locked' : ''}`}
                    onClick={togglePlay}
                    aria-disabled={isLocked}
                    aria-label={
                        isLocked
                            ? 'Audio đã phát 1 lần'
                            : isPlaying
                              ? 'Tạm dừng audio'
                              : 'Phát audio'
                    }
                    title={isLocked ? 'Đã hết lượt phát (BR13)' : isPlaying ? 'Tạm dừng' : 'Phát audio'}
                >
                    {isLocked ? (
                        <Lock size={16} color="#ffffff" />
                    ) : isPlaying ? (
                        <Pause size={18} fill="#ffffff" />
                    ) : (
                        <Play size={18} fill="#ffffff" />
                    )}
                </button>

                {/* Thời gian đã phát */}
                <span className="audio-player__time-current">{formatTime(currentTime)}</span>

                {/* Thanh tiến trình bị khóa tua lại theo quy chế khảo thí TOEIC */}
                <div
                    className="audio-player__track-wrapper"
                    title="Không được phép tua lại bản ghi âm trong bài thi chẩn đoán"
                >
                    <div
                        className="audio-player__progress-fill"
                        style={{ width: `${isLocked ? 100 : progressPercent}%` }}
                    />
                </div>

                {/* Tổng thời lượng bản ghi */}
                <span className="audio-player__time-total">{formatTime(duration)}</span>

                {/* Nút bật/tắt tiếng loa */}
                <button
                    type="button"
                    className="audio-player__mute-btn"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
                >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
            </div>

            {/* Banner dự phòng nếu file audio lỗi mạng, cho phép bỏ qua để không bị treo phòng thi */}
            {hasAudioError && !isLocked && (
                <div className="audio-player__notice" role="alert">
                    <span>Không tải được tệp âm thanh từ máy chủ. Bạn có thể chuyển sang câu tiếp theo.</span>
                    <button
                        type="button"
                        className="audio-player__skip-btn"
                        onClick={onAudioEnded}
                    >
                        <SkipForward size={14} />
                        <span>Sang câu tiếp</span>
                    </button>
                </div>
            )}
        </div>
    );
}
