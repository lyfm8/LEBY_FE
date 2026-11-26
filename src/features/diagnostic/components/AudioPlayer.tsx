import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Lock, AlertTriangle } from 'lucide-react';

interface AudioPlayerProps {
    src?: string | null;
    isLocked: boolean;
    isPaused?: boolean;
    onAudioEnded: () => void;
}

/**
 * Trình phát âm thanh tuân thủ BR08 / BR13:
 * - Trong bài thi chẩn đoán, bản ghi âm chỉ được phát đúng 1 lần duy nhất.
 * - Vô hiệu hóa tua lại thanh tiến trình để đảm bảo tính chuẩn hóa khảo thí TOEIC.
 * - Tự động tạm dừng khi học viên bấm Tạm dừng phòng thi (Luồng 4b).
 */
export function AudioPlayer({ src, isLocked, isPaused = false, onAudioEnded }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [replayNotice, setReplayNotice] = useState('');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Reset trình phát mỗi khi chuyển sang file audio khác
    useEffect(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setReplayNotice('');
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [src]);

    // Tạm dừng audio ngay lập tức nếu học viên bấm Tạm dừng bài thi
    useEffect(() => {
        if (isPaused && isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, [isPaused, isPlaying]);

    function togglePlay() {
        if (isLocked) {
            setReplayNotice(
                'Bản ghi âm bài thi chẩn đoán chỉ được phát một lần duy nhất theo quy định khảo thí chuẩn TOEIC.'
            );
            return;
        }
        if (!audioRef.current || !src || isPaused) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current
                .play()
                .then(() => {
                    setIsPlaying(true);
                    setReplayNotice('');
                })
                .catch(() => {
                    setIsPlaying(false);
                });
        }
    }

    function handleTimeUpdate() {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            if (!isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
                setDuration(audioRef.current.duration);
            }
        }
    }

    function handleLoadedMetadata() {
        if (audioRef.current && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
            setDuration(audioRef.current.duration);
        }
    }

    function handleEnded() {
        setIsPlaying(false);
        setCurrentTime(duration);
        onAudioEnded();
    }

    function toggleMute() {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    }

    const formatTime = (secs: number) => {
        if (!isFinite(secs) || secs < 0) return '0:00';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

    return (
        <div className="audio-player-wrap">
            <div className={`audio-player ${isLocked ? 'is-locked' : ''}`}>
                {src && (
                    <audio
                        ref={audioRef}
                        src={src}
                        preload="metadata"
                        onLoadedMetadata={handleLoadedMetadata}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleEnded}
                    />
                )}

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

                <span className="audio-player__time-current">{formatTime(currentTime)}</span>

                <div
                    className="audio-player__track-wrapper"
                    title="Không được phép tua lại bản ghi âm trong bài thi chẩn đoán"
                >
                    <div
                        className="audio-player__progress-fill"
                        style={{ width: `${isLocked ? 100 : progressPercent}%` }}
                    />
                </div>

                <span className="audio-player__time-total">{formatTime(duration)}</span>

                <button
                    type="button"
                    className="audio-player__mute-btn"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
                >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
            </div>
        </div>
    );
}
