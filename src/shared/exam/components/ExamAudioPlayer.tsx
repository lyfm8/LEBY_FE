import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { Play, Pause, Volume2, VolumeX, Lock, SkipForward, RotateCcw } from 'lucide-react';
import type { ExamAudioPolicy } from '../types/examTypes';

const SPEED_OPTIONS = [0.8, 1.0, 1.2] as const;

interface ExamAudioPlayerProps {
    stepKey: string;
    src?: string | null;
    policy?: ExamAudioPolicy;
    allowSpeedControl?: boolean;
    isLocked: boolean;
    isReviewMode?: boolean;
    isPaused?: boolean;
    shouldAutoPlay?: boolean;
    onUserStartedAudio?: () => void;
    onAudioEnded: () => void;
}

/**
 * Trình phát âm thanh dùng chung:
 * - policy = 'ONCE' (Diagnostic & Module Test): chỉ phát 1 lần duy nhất, khóa tua, tự chuyển câu khi hết (BR13).
 * - policy = 'UNLIMITED' / isReviewMode (Practice UC12 & Review): phát lại vô hạn, cho tua, hỗ trợ tốc độ 0.8x/1.0x/1.2x (BR08)
 *   và nút "Tải lại âm thanh" khi gặp lỗi kết nối (UC12 Ngoại lệ 6a).
 */
export function ExamAudioPlayer({
    stepKey,
    src,
    policy,
    allowSpeedControl = false,
    isLocked,
    isReviewMode = false,
    isPaused = false,
    shouldAutoPlay = false,
    onUserStartedAudio,
    onAudioEnded,
}: ExamAudioPlayerProps) {
    const isUnlimited = isReviewMode || policy === 'UNLIMITED';
    const effectiveLocked = isUnlimited ? false : isLocked;

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState<number>(1.0);
    const [hasAudioError, setHasAudioError] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const wasPlayingBeforePauseRef = useRef(false);
    const isLockedRef = useRef(effectiveLocked);
    const isPausedRef = useRef(isPaused);
    const shouldAutoPlayRef = useRef(shouldAutoPlay);
    const playbackRateRef = useRef(playbackRate);

    useEffect(() => {
        isLockedRef.current = effectiveLocked;
        isPausedRef.current = isPaused;
        shouldAutoPlayRef.current = shouldAutoPlay;
        playbackRateRef.current = playbackRate;
    }, [effectiveLocked, isPaused, shouldAutoPlay, playbackRate]);

    useEffect(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        setHasAudioError(false);
        wasPlayingBeforePauseRef.current = false;

        const audio = audioRef.current;
        if (!audio || !src) return;

        audio.pause();
        audio.currentTime = 0;
        audio.load();
        audio.playbackRate = playbackRateRef.current;

        if (isLockedRef.current || isPausedRef.current || !shouldAutoPlayRef.current) return;

        audio
            .play()
            .then(() => {
                setIsPlaying(true);
            })
            .catch(() => {
                setIsPlaying(false);
            });
    }, [stepKey, src]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPaused) {
            if (!audio.paused) {
                wasPlayingBeforePauseRef.current = true;
                audio.pause();
                setIsPlaying(false);
            }
            return;
        }

        if (!isPaused && wasPlayingBeforePauseRef.current && !effectiveLocked && src) {
            wasPlayingBeforePauseRef.current = false;
            audio
                .play()
                .then(() => {
                    setIsPlaying(true);
                })
                .catch(() => {
                    setIsPlaying(false);
                });
        }
    }, [isPaused, effectiveLocked, src]);

    function handleChangeSpeed(speed: number) {
        setPlaybackRate(speed);
        if (audioRef.current) {
            audioRef.current.playbackRate = speed;
        }
    }

    function togglePlay() {
        if (effectiveLocked || !audioRef.current || !src || isPaused) return;

        if (isPlaying) {
            audioRef.current.pause();
            wasPlayingBeforePauseRef.current = false;
            setIsPlaying(false);
        } else {
            onUserStartedAudio?.();
            if (isUnlimited && audioRef.current.ended) {
                audioRef.current.currentTime = 0;
            }
            audioRef.current.playbackRate = playbackRate;
            audioRef.current
                .play()
                .then(() => {
                    setIsPlaying(true);
                    setHasAudioError(false);
                })
                .catch(() => {
                    setIsPlaying(false);
                });
        }
    }

    function handleRetryAudio() {
        const audio = audioRef.current;
        if (!audio || !src) return;
        setHasAudioError(false);
        audio.load();
        audio.playbackRate = playbackRate;
        audio
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
    }

    function handleSeek(event: ChangeEvent<HTMLInputElement>) {
        if (!isUnlimited || !audioRef.current) return;
        const nextTime = Number(event.target.value);
        if (isFinite(nextTime) && nextTime >= 0) {
            audioRef.current.currentTime = nextTime;
            setCurrentTime(nextTime);
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
            audioRef.current.playbackRate = playbackRate;
        }
    }

    function handleEnded() {
        setIsPlaying(false);
        wasPlayingBeforePauseRef.current = false;

        if (isUnlimited) {
            setCurrentTime(0);
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
            }
            return;
        }

        setCurrentTime(duration);
        onAudioEnded();
    }

    function handleAudioError() {
        setIsPlaying(false);
        setHasAudioError(true);
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
            <div className={`audio-player ${effectiveLocked ? 'is-locked' : ''}`}>
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

                <button
                    type="button"
                    className={`audio-player__play-btn ${effectiveLocked ? 'is-locked' : ''}`}
                    onClick={togglePlay}
                    aria-disabled={effectiveLocked}
                    aria-label={
                        effectiveLocked
                            ? 'Audio đã phát 1 lần'
                            : isPlaying
                              ? 'Tạm dừng audio'
                              : 'Phát audio'
                    }
                    title={
                        effectiveLocked
                            ? 'Đã hết lượt phát (BR13)'
                            : isPlaying
                              ? 'Tạm dừng'
                              : isUnlimited
                                ? 'Phát lại audio không giới hạn'
                                : 'Phát audio'
                    }
                >
                    {effectiveLocked ? (
                        <Lock size={16} color="#ffffff" />
                    ) : isPlaying ? (
                        <Pause size={18} fill="#ffffff" />
                    ) : (
                        <Play size={18} fill="#ffffff" />
                    )}
                </button>

                <span className="audio-player__time-current">{formatTime(currentTime)}</span>

                {isUnlimited ? (
                    <div className="audio-player__seek-container" title="Kéo để tua đoạn âm thanh">
                        <div className="audio-player__track-wrapper is-seekable">
                            <div
                                className="audio-player__progress-fill"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={duration > 0 ? duration : 0}
                            step={0.1}
                            value={Math.min(currentTime, duration || 0)}
                            onChange={handleSeek}
                            disabled={duration <= 0}
                            className="audio-player__seek-input"
                            aria-label="Tua tiến trình bản ghi âm"
                        />
                    </div>
                ) : (
                    <div
                        className="audio-player__track-wrapper"
                        title="Không được phép tua lại bản ghi âm trong bài thi"
                    >
                        <div
                            className="audio-player__progress-fill"
                            style={{ width: `${effectiveLocked ? 100 : progressPercent}%` }}
                        />
                    </div>
                )}

                <span className="audio-player__time-total">{formatTime(duration)}</span>

                {allowSpeedControl && isUnlimited && (
                    <div className="audio-player__speed-group" role="group" aria-label="Tốc độ phát âm thanh">
                        {SPEED_OPTIONS.map((speed) => (
                            <button
                                key={speed}
                                type="button"
                                className={`audio-player__speed-btn ${playbackRate === speed ? 'is-active' : ''}`}
                                onClick={() => handleChangeSpeed(speed)}
                            >
                                {speed.toFixed(1)}x
                            </button>
                        ))}
                    </div>
                )}

                <button
                    type="button"
                    className="audio-player__mute-btn"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
                >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
            </div>

            {hasAudioError && !effectiveLocked && (
                <div className="audio-player__notice" role="alert">
                    <span>
                        {isUnlimited
                            ? 'Không tải được tệp âm thanh từ máy chủ do đường truyền gián đoạn.'
                            : 'Không tải được tệp âm thanh từ máy chủ. Bạn có thể chuyển sang câu tiếp theo.'}
                    </span>
                    {isUnlimited ? (
                        <button
                            type="button"
                            className="audio-player__skip-btn"
                            onClick={handleRetryAudio}
                        >
                            <RotateCcw size={14} />
                            <span>Tải lại âm thanh</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="audio-player__skip-btn"
                            onClick={onAudioEnded}
                        >
                            <SkipForward size={14} />
                            <span>Sang câu tiếp</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
