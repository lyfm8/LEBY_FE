import { Link } from 'react-router-dom';
import {
    ChevronRight,
    FileBarChart2,
    Lock,
    Trophy,
    UserCheck,
} from 'lucide-react';

// Kiểu props nhận vào của khối truy cập nhanh (chỉ giữ các mục không hiện trực tiếp trên Topbar)
interface QuickShortcutsCardProps {
    canTakeFullMockTest: boolean;
    latestDiagnosticAttemptId: number | null;
}

/**
 * Khối truy cập nhanh tinh gọn: chỉ hiển thị 3 liên kết quan trọng không nằm trực tiếp trên Topbar
 * (Báo cáo chẩn đoán 7 Part, Hồ sơ & Ma trận năng lực, và Thi thử TOEIC 200 câu nghiệm thu đầu ra).
 */
export function QuickShortcutsCard({
    canTakeFullMockTest,
    latestDiagnosticAttemptId,
}: QuickShortcutsCardProps) {
    // Tạo đường dẫn tới báo cáo chẩn đoán gần nhất của học viên
    const diagnosticReportUrl = latestDiagnosticAttemptId
        ? `/diagnostic/results/${latestDiagnosticAttemptId}`
        : '/diagnostic/results';

    return (
        <section className="db-card db-shortcuts-card">
            {/* Tiêu đề khối truy cập nhanh */}
            <h3 className="db-card__title">Truy cập nhanh</h3>

            <div className="db-shortcuts-list">
                {/* 1. Báo cáo chẩn đoán 7 Part & Biểu đồ Radar */}
                <Link to={diagnosticReportUrl} className="db-shortcut-item">
                    <span className="db-shortcut-item__icon is-report">
                        <FileBarChart2 size={17} />
                    </span>
                    <div className="db-shortcut-item__text">
                        <strong>Báo cáo chẩn đoán 7 Part</strong>
                        <span>Xem điểm từng phần thi &amp; biểu đồ năng lực</span>
                    </div>
                    <ChevronRight size={16} className="db-shortcut-item__arrow" />
                </Link>

                {/* 2. Hồ sơ cá nhân & Ma trận năng lực */}
                <Link to="/profile" className="db-shortcut-item">
                    <span className="db-shortcut-item__icon is-profile">
                        <UserCheck size={17} />
                    </span>
                    <div className="db-shortcut-item__text">
                        <strong>Hồ sơ &amp; Ma trận năng lực</strong>
                        <span>Theo dõi kỹ năng vững vàng &amp; cần cải thiện</span>
                    </div>
                    <ChevronRight size={16} className="db-shortcut-item__arrow" />
                </Link>

                {/* 3. Thi thử TOEIC 200 câu nghiệm thu đầu ra */}
                {canTakeFullMockTest ? (
                    <Link to="/mock-exam" className="db-shortcut-item is-mock-unlocked">
                        <span className="db-shortcut-item__icon is-mock">
                            <Trophy size={17} />
                        </span>
                        <div className="db-shortcut-item__text">
                            <strong>Thi thử TOEIC 200 câu đầu ra</strong>
                            <span>Đã mở khóa • Nghiệm thu năng lực chuẩn ETS</span>
                        </div>
                        <ChevronRight size={16} className="db-shortcut-item__arrow" />
                    </Link>
                ) : (
                    <div className="db-shortcut-item is-mock-locked" aria-disabled="true">
                        <span className="db-shortcut-item__icon is-locked">
                            <Lock size={16} />
                        </span>
                        <div className="db-shortcut-item__text">
                            <strong>Thi thử TOEIC 200 câu đầu ra</strong>
                            <span>Mở khóa sau khi hoàn thành 100% lộ trình</span>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
