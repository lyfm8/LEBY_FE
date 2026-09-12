import type { UserSkillStat } from '../types/profileTypes';

interface ProfileAbilityTabProps {
    skills: UserSkillStat[];
}

export function ProfileAbilityTab({ skills }: ProfileAbilityTabProps) {
    function getStatusBadge(status: 'WEAK' | 'DEVELOPING' | 'STABLE') {
        switch (status) {
            case 'STABLE':
                return <span className="pf-skill-badge is-stable">VỮNG</span>;
            case 'DEVELOPING':
                return <span className="pf-skill-badge is-developing">ĐANG PHÁT TRIỂN</span>;
            case 'WEAK':
                return <span className="pf-skill-badge is-weak">CẦN CẢI THIỆN</span>;
        }
    }

    return (
        <div className="pf-tab-content">
            <div className="pf-card">
                <div className="pf-card__header">
                    <div>
                        <h3 className="pf-card__title">Hồ sơ năng lực kỹ năng chi tiết</h3>
                        <p className="pf-card__sub">
                            Dữ liệu được cập nhật tự động sau mỗi bài kiểm tra chẩn đoán và Module Test
                        </p>
                    </div>
                </div>

                <div className="pf-skills-table-wrap">
                    <table className="pf-skills-table">
                        <thead>
                            <tr>
                                <th>Kỹ năng</th>
                                <th>Thuộc Part</th>
                                <th>Tỉ lệ chính xác</th>
                                <th>Số câu đã làm</th>
                                <th>Đánh giá hệ thống</th>
                            </tr>
                        </thead>
                        <tbody>
                            {skills.map((s) => (
                                <tr key={s.code}>
                                    <td>
                                        <strong>{s.name}</strong>
                                    </td>
                                    <td>Part {s.partNo}</td>
                                    <td>
                                        <div className="pf-skill-bar-wrap">
                                            <div className="pf-skill-bar-track">
                                                <div
                                                    className={`pf-skill-bar-fill is-${s.status.toLowerCase()}`}
                                                    style={{ width: `${Math.round(s.accuracyRate * 100)}%` }}
                                                />
                                            </div>
                                            <span className="pf-skill-bar-num">
                                                {Math.round(s.accuracyRate * 100)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td>{s.evidenceCount} câu hỏi</td>
                                    <td>{getStatusBadge(s.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
