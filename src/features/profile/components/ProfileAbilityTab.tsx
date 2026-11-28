import { AlertCircle, BookOpen } from 'lucide-react';
import type { UserSkillStatResponse } from '../types/profileTypes';

// Kiểu props cho tab Bảng hồ sơ năng lực kỹ năng TOEIC
interface ProfileAbilityTabProps {
    skills: UserSkillStatResponse[];
    onReviewAbilityMistakes?: (abilityId: number) => void;
}

export function ProfileAbilityTab({
    skills,
    onReviewAbilityMistakes,
}: ProfileAbilityTabProps) {
    function getStatusBadge(status: UserSkillStatResponse['status']) {
        switch (status) {
            case 'STABLE':
                return <span className="pf-skill-badge is-stable">VỮNG VÀNG</span>;
            case 'DEVELOPING':
                return <span className="pf-skill-badge is-developing">ĐANG PHÁT TRIỂN</span>;
            case 'WEAK':
                return <span className="pf-skill-badge is-weak">CẦN CẢI THIỆN</span>;
            case 'UNCERTAIN':
            default:
                return <span className="pf-skill-badge is-uncertain">CHƯA ĐỦ DỮ LIỆU</span>;
        }
    }

    if (!skills || skills.length === 0) {
        return (
            <div className="pf-tab-content">
                <div className="pf-card">
                    <div className="pf-skills-empty">
                        <AlertCircle size={36} className="pf-empty-icon" />
                        <h4 className="pf-empty-title">Chưa có dữ liệu Ma trận năng lực</h4>
                        <p className="pf-empty-desc">
                            Hãy hoàn thành bài thi chẩn đoán đầu vào hoặc các bài kiểm tra mô-đun để hệ thống phân tích chi tiết mức độ thành thạo các kỹ năng TOEIC cho bạn.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pf-tab-content">
            <div className="pf-card">
                <div className="pf-card__header">
                    <div>
                        <h3 className="pf-card__title">Hồ sơ năng lực kỹ năng chi tiết</h3>
                        <p className="pf-card__sub">
                            Dữ liệu tổng hợp tích lũy từ kết quả bài thi chẩn đoán và bài kiểm tra mô-đun theo từng phần thi TOEIC
                        </p>
                    </div>
                </div>

                <div className="pf-skills-table-wrap">
                    <table className="pf-skills-table">
                        <thead>
                            <tr>
                                <th>Kỹ năng TOEIC</th>
                                <th>Thuộc Part</th>
                                <th>Tỷ lệ chính xác</th>
                                <th>Số câu đã làm</th>
                                <th>Đánh giá hệ thống</th>
                                {onReviewAbilityMistakes && <th>Ôn tập</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {skills.map((s) => {
                                // Backend lưu accuracyRate theo thang 0–100 nên làm tròn trực tiếp và kẹp biên an toàn
                                const percent = Math.min(100, Math.max(0, Math.round(s.accuracyRate ?? 0)));
                                // Chuẩn hóa lớp trạng thái CSS theo mức đánh giá của kỹ năng
                                const statusClass = s.status ? s.status.toLowerCase() : 'weak';

                                return (
                                    <tr key={s.abilityId}>
                                        <td>
                                            <strong>{s.abilityName}</strong>
                                        </td>
                                        <td>{s.partNo ? `Part ${s.partNo}` : 'Chung'}</td>
                                        <td>
                                            <div className="pf-skill-bar-wrap">
                                                <div className="pf-skill-bar-track">
                                                    <div
                                                        className={`pf-skill-bar-fill is-${statusClass}`}
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                                <span className="pf-skill-bar-num">
                                                    {percent}%
                                                </span>
                                            </div>
                                        </td>
                                        <td>{s.evidenceCount} câu hỏi</td>
                                        <td>{getStatusBadge(s.status)}</td>
                                        {onReviewAbilityMistakes && (
                                            <td>
                                                {/* Điều hướng thẳng sang tab Sổ tay câu sai đã lọc sẵn đúng kỹ năng này */}
                                                <button
                                                    type="button"
                                                    className="pf-skill-review-btn"
                                                    onClick={() => onReviewAbilityMistakes(s.abilityId)}
                                                >
                                                    <BookOpen size={13} />
                                                    <span>Ôn câu sai</span>
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
