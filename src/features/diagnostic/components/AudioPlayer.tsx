import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
    src?: string | null;
}

export function AudioPlayer({ src }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(45);
    const [duration, setDuration] = useState(135);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
    }, [src]);

    function togglePlay() {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().catch(() => {});
            setIsPlaying(true);
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

    function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
        const val = Number(e.target.value);
        setCurrentTime(val);
        if (audioRef.current) {
            audioRef.current.currentTime = val;
        }
    }

    function toggleMute() {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    }

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    return (
        <div className="audio-player">
            {src && (
                <audio
                    ref={audioRef}
                    src={src}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                />
            )}

            <button
                type="button"
                className="audio-player__play-btn"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Tạm dừng audio' : 'Phát audio'}
            >
                {isPlaying ? <Pause size={18} fill="#ffffff" /> : <Play size={18} fill="#ffffff" />}
            </button>

            <span className="audio-player__time-current">{formatTime(currentTime)}</span>

            <div className="audio-player__track-wrapper">
                <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="audio-player__seeker"
                    aria-label="Thanh trượt audio"
                />
                <div
                    className="audio-player__progress-fill"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
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
    );
}
