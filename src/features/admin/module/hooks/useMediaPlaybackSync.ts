import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Hook hỗ trợ đồng bộ trạng thái phát media và tua nhanh audio/video theo timestamp của Script.
 */
export const useMediaPlaybackSync = (mediaUrl?: string | null) => {
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  /**
   * Chuyển đổi định dạng mm:ss hoặc giây thành số giây float.
   */
  const parseTimeToSeconds = useCallback((timeStr: string): number => {
    if (!timeStr) return 0;
    const cleanStr = timeStr.trim();
    if (cleanStr.includes(':')) {
      const parts = cleanStr.split(':');
      if (parts.length === 2) {
        const minutes = parseFloat(parts[0]) || 0;
        const seconds = parseFloat(parts[1]) || 0;
        return minutes * 60 + seconds;
      }
    }
    return parseFloat(cleanStr) || 0;
  }, []);

  /**
   * Định dạng số giây thành chuỗi mm:ss thân thiện.
   */
  const formatSecondsToTime = useCallback((totalSeconds: number): string => {
    if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const padMin = String(minutes).padStart(2, '0');
    const padSec = String(seconds).padStart(2, '0');
    return `${padMin}:${padSec}`;
  }, []);

  /**
   * Bấm vào timestamp để tua và phát media tại thời điểm tương ứng.
   */
  const seekAndPlay = useCallback((timeStr: string) => {
    if (!mediaRef.current) return;
    const targetSeconds = parseTimeToSeconds(timeStr);
    mediaRef.current.currentTime = targetSeconds;
    mediaRef.current.play().then(() => {
      setIsPlaying(true);
    }).catch(err => {
      console.warn('Playback error:', err);
    });
  }, [parseTimeToSeconds]);

  const togglePlay = useCallback(() => {
    if (!mediaRef.current) return;
    if (mediaRef.current.paused) {
      mediaRef.current.play().then(() => setIsPlaying(true)).catch(console.warn);
    } else {
      mediaRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Reset khi đổi mediaUrl
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [mediaUrl]);

  return {
    mediaRef,
    isPlaying,
    currentTime,
    duration,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    togglePlay,
    seekAndPlay,
    formatSecondsToTime,
    parseTimeToSeconds,
  };
};

