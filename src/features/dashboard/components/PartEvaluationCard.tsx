import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { DashboardPartEvaluation, PartDirectiveType } from '../types/dashboardTypes';

// Kiểu props nhận vào của thẻ đánh giá năng lực 7 Phần thi TOEIC
interface PartEvaluationCardProps {
    parts: DashboardPartEvaluation[];
    latestDiagnosticAttemptId: number | null;
}

/**
 * Chuyển đổi mã chỉ thị Tầng 1 sang lớp màu CSS nhất quán cho thanh điểm và nhãn trạng thái.
 *
 * @param directive Chỉ thị đánh giá từ Backend
 * @returns Tên class CSS tương ứng
 */
function resolveDirectiveStyleClass(directive: PartDirectiveType): string {
    // Đạt chuẩn -> màu xanh hoàn thành
    if (directive === 'PASS') return 'is-pass';
    // Cận chuẩn -> màu hổ phách chú ý
    if (directive === 'CONFIRM') return 'is-confirm';
    // Dưới chuẩn hoặc mất gốc -> màu đỏ cần tập trung cải thiện
    return 'is-weak';
}

/**
 * Thẻ hiển thị bảng đánh giá năng lực 7 phần thi TOEIC (Part 1 - Part 7) từ bài chẩn đoán gần nhất.
 * Toàn bộ nhãn hiển thị đều dùng tiếng Việt tự nhiên, không lộ tên enum kỹ thuật.
 */
export function PartEvaluationCard({ parts, latestDiagnosticAttemptId }: PartEvaluationCardProps) {
    // Tạo liên kết xem báo cáo chẩn đoán đầy đủ kèm biểu đồ Radar nếu đã có lượt thi
    const reportPath = latestDiagnosticAttemptId
        ? `/diagnostic/results/${latestDiagnosticAttemptId}`
        : '/diagnostic/results';

    return (
        <section className="db-card db-card--eval">
            {/* Tiêu đề thẻ, chú giải màu sắc bằng tiếng Việt và liên kết sang báo cáo chi tiết */}
            <div className="db-card__header db-card__header--wrap">
                <div>
                    <h3 className="db-card__title">Đánh giá năng lực 7 phần thi TOEIC</h3>
                    <div className="db-card__legend">
                        <span className="db-card__legend-item is-pass">● Đạt chuẩn</span>
                        <span className="db-card__legend-item is-confirm">● Cận chuẩn</span>
                        <span className="db-card__legend-item is-weak">● Cần cải thiện</span>
                    </div>
                </div>

                {parts.length > 0 && (
                    <Link to={reportPath} className="db-inline-link">
                        <span>Xem báo cáo chi tiết</span>
                        <ArrowRight size={14} />
                    </Link>
                )}
            </div>

            {/* Trạng thái rỗng khi học viên chưa có dữ liệu chi tiết 7 Part */}
            {parts.length === 0 ? (
                <div className="db-empty-inline">
                    Chưa có số liệu đánh giá chi tiết từng phần thi. Hoàn thành bài chẩn đoán để xem điểm mạnh và
                    điểm yếu theo 7 phần thi TOEIC.
                </div>
            ) : (
                <div className="db-part-eval-list">
                    {parts.map((item) => {
                        // Xác định lớp màu hiển thị cho thanh tiến độ và badge
                        const toneClass = resolveDirectiveStyleClass(item.directive);
                        return (
                            <div key={item.partId} className="db-part-eval-row">
                                {/* Tên phần thi (Part 1 -> Part 7) */}
                                <span className="db-part-eval-name">{item.name}</span>

                                {/* Thanh tỷ lệ trả lời chính xác (%) */}
                                <div className="db-part-eval-track">
                                    <div
                                        className={`db-part-eval-fill ${toneClass}`}
                                        style={{ width: `${item.scorePercent}%` }}
                                    />
                                </div>

                                {/* Số phần trăm chính xác */}
                                <span className="db-part-eval-score">{item.scorePercent}%</span>

                                {/* Nhãn đánh giá tiếng Việt tự nhiên từ Backend */}
                                <span className={`db-part-eval-badge ${toneClass}`}>
                                    {item.directiveLabel}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
