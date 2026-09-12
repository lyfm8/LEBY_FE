import { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react';

interface VideoPlayerProps {
    src?: string;
    title: string;
}

export function VideoPlayer({ src, title: _title }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    function togglePlay() {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
        }
    }

    function handleTimeUpdate() {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            if (!isNaN(videoRef.current.duration)) {
                setDuration(videoRef.current.duration);
            }
        }
    }

    function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
        const val = Number(e.target.value);
        setCurrentTime(val);
        if (videoRef.current) {
            videoRef.current.currentTime = val;
        }
    }

    function toggleMute() {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    }

    function toggleFullscreen() {
        if (videoRef.current) {
            if (!document.fullscreenElement) {
                videoRef.current.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        }
    }

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    return (
        <div className="video-player-container">
            <video
                ref={videoRef}
                src={src || 'https://www.w3schools.com/html/mov_bbb.mp4'}
                className="video-element"
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80"
            />

            <div className="video-controls">
                <button
                    type="button"
                    className="video-play-btn"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Dừng' : 'Phát'}
                >
                    {isPlaying ? <Pause size={18} fill="#ffffff" /> : <Play size={18} fill="#ffffff" />}
                </button>

                <span className="video-time">{formatTime(currentTime)}</span>

                <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="video-seeker"
                    aria-label="Thanh trượt video"
                />

                <span className="video-time">{formatTime(duration || 1100)}</span>

                <button
                    type="button"
                    className="video-icon-btn"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
                >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                <button
                    type="button"
                    className="video-icon-btn"
                    onClick={toggleFullscreen}
                    aria-label="Toàn màn hình"
                >
                    <Maximize2 size={18} />
                </button>
            </div>
        </div>
    );
}
