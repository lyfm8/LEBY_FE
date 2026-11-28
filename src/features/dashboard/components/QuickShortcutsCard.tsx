import { Link } from 'react-router-dom';
import {
    BookOpen,
    ChevronRight,
    Compass,
    FileBarChart2,
    Lock,
    Trophy,
    UserCheck,
} from 'lucide-react';

// Kiểu props nhận vào của khối lối tắt học tập quan trọng
interface QuickShortcutsCardProps {
    canTakeFullMockTest: boolean;
    latestDiagnosticAttemptId: number | null;
}

/**
 * Khối lối tắt nhanh dẫn tới các màn hình trọng tâm của học viên:
 * Lộ trình chi tiết, Thư viện 7 Part, Hồ sơ năng lực, Kết quả vượt ải,
 * Báo cáo chẩn đoán và Bài thi thử TOEIC 200 câu nghiệm thu đầu ra.
 */
export function QuickShortcutsCard({
    canTakeFullMockTest,
    latestDiagnosticAttemptId,
}: QuickShortcutsCardProps) {
    // Tính đường dẫn tới báo cáo chẩn đoán gần nhất nếu đã có dữ liệu
    const diagnosticReportUrl = latestDiagnosticAttemptId
        ? `/diagnostic/results/${latestDiagnosticAttemptId}`
        : '/diagnostic/results';

    return (
        <section className="db-card db-shortcuts-card">
            {/* Tiêu đề khối lối tắt */}
            <h3 className="db-card__title">Lối tắt học tập</h3>

            <div className="db-shortcuts-list">
                {/* 1. Lối tắt sang Lộ trình học cá nhân */}
                <Link to="/learning-path" className="db-shortcut-item">
                    <span className="db-shortcut-item__icon is-roadmap">
                        <Compass size={17} />
                    </span>
                    <div className="db-shortcut-item__text">
                        <strong>Lộ trình học chi tiết</strong>
                        <span>Theo dõi toàn bộ chặng học tuần tự</span>
                    </div>
                    <ChevronRight size={16} className="db-shortcut-item__arrow" />
                </Link>

                {/* 2. Lối tắt sang Hồ sơ cá nhân & Ma trận năng lực */}
                <Link to="/profile" className="db-shortcut-item">
                    <span className="db-shortcut-item__icon is-profile">
                        <UserCheck size={17} />
                    </span>
                    <div className="db-shortcut-item__text">
                        <strong>Hồ sơ &amp; Ma trận năng lực</strong>
                        <span>Xem mức độ vững vàng từng kỹ năng</span>
                    </div>
                    <ChevronRight size={16} className="db-shortcut-item__arrow" />
                </Link>

                {/* 3. Lối tắt sang Thư viện khóa học 7 Part */}
                <Link to="/catalog" className="db-shortcut-item">
                    <span className="db-shortcut-item__icon is-catalog">
                        <BookOpen size={17} />
                    </span>
                    <div className="db-shortcut-item__text">
                        <strong>Thư viện khóa học 7 Part</strong>
                        <span>Khám phá và ôn tập bổ trợ tự do</span>
                    </div>
                    <ChevronRight size={16} className="db-shortcut-item__arrow" />
                </Link>

                {/* 4. Lối tắt xem lại báo cáo chẩn đoán đầu vào (hiển thị khi đã từng thi) */}
                {latestDiagnosticAttemptId !== null && (
                    <Link to={diagnosticReportUrl} className="db-shortcut-item">
                        <span className="db-shortcut-item__icon is-report">
                            <FileBarChart2 size={17} />
                        </span>
                        <div className="db-shortcut-item__text">
                            <strong>Báo cáo chẩn đoán đầu vào</strong>
                            <span>Xem biểu đồ Radar và lời giải chi tiết</span>
                        </div>
                        <ChevronRight size={16} className="db-shortcut-item__arrow" />
                    </Link>
                )}

                {/* 5. Lối tắt sang bài thi thử TOEIC 200 câu đầu ra (mở sáng khi hoàn thành 100% lộ trình) */}
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
