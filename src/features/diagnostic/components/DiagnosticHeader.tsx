import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Pause, Play } from 'lucide-react';

interface DiagnosticHeaderProps {
    // Tiêu đề bài thi chẩn đoán hiển thị ở giữa thanh tiêu đề
    title: string;
    // Số thứ tự câu đầu tiên đang hiển thị (dùng khi không truyền questionLabel tùy biến)
    currentQuestion: number;
    // Tổng số câu hỏi toàn đề
    totalQuestions: number;
    // Nhãn hiển thị khoảng câu tùy biến cho câu hỏi chùm (ví dụ "Câu 10–12 / 40")
    questionLabel?: string;
    // Số giây đếm ngược khởi tạo khi vào phòng thi
    initialSeconds: number;
    // Trạng thái đang tạm dừng đồng hồ client-side
    isPaused: boolean;
    // Khóa nút tạm dừng khi đang nộp bài hoặc hết giờ
    isLocked: boolean;
    // Callback bấm Tạm dừng / Tiếp tục làm bài
    onTogglePause: () => void;
    // Callback báo số giây hiện tại về cho ref đồng bộ server
    onSecondsChange?: (secondsLeft: number) => void;
    // Callback kích hoạt nộp bài tự động khi chạm 00:00 (BR07)
    onTimeOut?: () => void;
}

/**
 * Header phòng thi chẩn đoán gồm bộ đếm câu hỏi, đồng hồ đếm ngược,
 * nút tạm dừng (Luồng 4b) và kích hoạt tự động nộp bài khi hết giờ (BR07).
 */
export function DiagnosticHeader({
    title,
    currentQuestion,
    totalQuestions,
    questionLabel,
    initialSeconds,
    isPaused,
    isLocked,
    onTogglePause,
    onSecondsChange,
    onTimeOut,
}: DiagnosticHeaderProps) {
    // Số giây còn lại hiển thị trên đồng hồ đếm ngược
    const [secondsLeft, setSecondsLeft] = useState(Math.max(0, Math.floor(initialSeconds)));
    // Cờ bảo đảm sự kiện hết giờ chỉ kích hoạt đúng 1 lần duy nhất
    const hasTriggeredTimeoutRef = useRef(false);

    // Cập nhật lại bộ đếm khi initialSeconds thay đổi lúc khôi phục phiên hoặc thi lại
    useEffect(() => {
        // Đặt số giây làm tròn không âm
        setSecondsLeft(Math.max(0, Math.floor(initialSeconds)));
        // Cho phép kích hoạt timeout lại cho phiên mới
        hasTriggeredTimeoutRef.current = false;
    }, [initialSeconds]);

    // Đẩy số giây mới nhất ra cho component cha lưu ref phục vụ đồng bộ API
    useEffect(() => {
        // Gọi callback nếu được truyền vào
        onSecondsChange?.(secondsLeft);
    }, [secondsLeft, onSecondsChange]);

    // Chạy interval giảm mỗi 1 giây khi không tạm dừng và chưa khóa nộp bài
    useEffect(() => {
        // Ngưng đếm ngược khi bị khóa nộp bài hoặc đang tạm dừng
        if (isLocked || isPaused) {
            return;
        }

        // Nếu chạm mốc 00:00 thì tự động nộp bài theo BR07
        if (secondsLeft <= 0) {
            if (!hasTriggeredTimeoutRef.current) {
                hasTriggeredTimeoutRef.current = true;
                onTimeOut?.();
            }
            return;
        }

        // Lập lịch giảm 1 giây mỗi 1000ms
        const timer = setInterval(() => {
            setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        // Xóa interval khi unmount hoặc phụ thuộc thay đổi
        return () => clearInterval(timer);
    }, [secondsLeft, isPaused, isLocked, onTimeOut]);

    // Quy đổi giây còn lại ra số phút nguyên
    const minutes = Math.floor(secondsLeft / 60);
    // Lấy số giây lẻ trong phút
    const seconds = secondsLeft % 60;
    // Chuẩn hóa chuỗi MM:SS luôn đủ 2 chữ số
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    // Cảnh báo đỏ nhấp nháy khi thời gian còn dưới 5 phút
    const isUrgent = secondsLeft > 0 && secondsLeft < 300;
    // Chuỗi hiển thị câu hiện tại trên tổng số câu
    const counterText = questionLabel ?? `Câu ${currentQuestion} / ${totalQuestions}`;

    return (
        <header className="diag-header">
            <div className="diag-header__container">
                {/* Logo thương hiệu LEBY dẫn về Dashboard */}
                <Link to="/dashboard" className="diag-header__logo">
                    <div className="diag-header__logo-badge">L</div>
                    <span className="diag-header__logo-text">LEBY</span>
                </Link>

                {/* Tên bài thi chẩn đoán */}
                <div className="diag-header__title">{title}</div>

                {/* Khối thống kê: bộ đếm câu, đồng hồ và nút Tạm dừng */}
                <div className="diag-header__stats">
                    {/* Nhãn hiển thị câu đơn hoặc khoảng câu chùm hiện tại */}
                    <span className="diag-header__question-counter">{counterText}</span>

                    {/* Đồng hồ đếm ngược thời gian làm bài */}
                    <div
                        className={`diag-header__timer ${isUrgent ? 'is-urgent' : ''} ${isPaused ? 'is-paused' : ''}`}
                    >
                        <Clock size={16} />
                        <span>{formattedTime}</span>
                    </div>

                    {/* Nút Tạm dừng / Tiếp tục bài thi */}
                    <button
                        type="button"
                        className={`diag-header__pause-btn ${isPaused ? 'is-resuming' : ''}`}
                        onClick={onTogglePause}
                        disabled={isLocked || secondsLeft <= 0}
                        title={isPaused ? 'Tiếp tục làm bài' : 'Tạm dừng làm bài'}
                    >
                        {isPaused ? <Play size={14} /> : <Pause size={14} />}
                        <span>{isPaused ? 'Tiếp tục' : 'Tạm dừng'}</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
