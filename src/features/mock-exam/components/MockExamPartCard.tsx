import { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingDown, TrendingUp } from 'lucide-react';
import type { MockExamPartComparison } from '../types/mockExamTypes';

// Props đầu vào cho thẻ phân tích chi tiết từng Part trong Báo cáo thi thử (UC18)
interface MockExamPartCardProps {
    // Dữ liệu thống kê và đối sánh của một Part
    part: MockExamPartComparison;
    // Có hiển thị dữ liệu Trước/Sau & phân tích Ability chi tiết không (true cho OUTPUT, false cho PRACTICE)
    isOutputExam: boolean;
    // Thẻ hiện có đang được chọn nổi bật từ Radar không
    isHighlighted?: boolean;
}

// Chuyển mã trạng thái năng lực sang nhãn tiếng Việt dễ đọc
function getAbilityStatusLabel(status: string): { label: string; className: string } {
    // Kiểm tra mức độ STABLE (Vững)
    if (status === 'STABLE') {
        return { label: 'Vững', className: 'is-stable' };
    }
    // Kiểm tra mức độ DEVELOPING (Đang phát triển)
    if (status === 'DEVELOPING') {
        return { label: 'Cần củng cố', className: 'is-developing' };
    }
    // Kiểm tra mức độ WEAK (Còn yếu)
    if (status === 'WEAK') {
        return { label: 'Còn yếu', className: 'is-weak' };
    }
    // Trường hợp ít câu hỏi chưa đủ kết luận chắc chắn
    return { label: 'Chưa đủ dữ liệu', className: 'is-uncertain' };
}

// Thẻ hiển thị kết quả từng Part kèm đối sánh Trước/Sau và kỹ năng con Ability mở rộng được
export function MockExamPartCard({
    part,
    isOutputExam,
    isHighlighted = false,
}: MockExamPartCardProps) {
    // Trạng thái mở rộng xem chi tiết từng kỹ năng con trong Part (chỉ áp dụng đề OUTPUT)
    const [isExpanded, setIsExpanded] = useState<boolean>(isHighlighted);
    // Chỉ số chênh lệch điểm so với lúc chẩn đoán đầu vào
    const delta = part.scoreDelta;
    // Kiểm tra Part này có danh sách kỹ năng con để xổ xuống xem chi tiết hay không
    const hasAbilities = isOutputExam && part.abilities.length > 0;

    return (
        <article className={`mock-part-card ${isHighlighted ? 'is-highlighted' : ''}`}>
            <div className="mock-part-card__top">
                <div>
                    <div className="mock-part-card__title-row">
                        <h3 className="mock-part-card__name">{part.name}</h3>
                        {isOutputExam && delta !== null && (
                            <span
                                className={`mock-delta-pill ${
                                    delta > 0 ? 'is-up' : delta < 0 ? 'is-down' : 'is-flat'
                                }`}
                            >
                                {delta > 0 && <TrendingUp size={13} />}
                                {delta < 0 && <TrendingDown size={13} />}
                                <span>{delta > 0 ? `+${delta}%` : `${delta}%`}</span>
                            </span>
                        )}
                    </div>
                    <p className="mock-part-card__counts">
                        Đúng <strong>{part.correctCount}/{part.totalQuestions}</strong> câu ({part.score}%)
                        {isOutputExam && part.beforeScore !== null && (
                            <span className="mock-part-card__before">
                                {' '}
                                · Đầu vào: {part.beforeScore}%
                            </span>
                        )}
                    </p>
                </div>

                <div className="mock-part-card__score-wrap">
                    <span className="mock-part-card__score">{part.score}%</span>
                </div>
            </div>

            {/* Thanh tiến độ so sánh trực quan điểm hiện tại (và vạch đầu vào nếu có) */}
            <div className="mock-part-progress">
                <div
                    className="mock-part-progress__fill"
                    style={{ width: `${Math.max(0, Math.min(100, part.score))}%` }}
                />
                {isOutputExam && part.beforeScore !== null && (
                    <span
                        className="mock-part-progress__before-marker"
                        style={{ left: `${Math.max(0, Math.min(100, part.beforeScore))}%` }}
                        title={`Mốc chẩn đoán đầu vào: ${part.beforeScore}%`}
                    />
                )}
            </div>

            {hasAbilities && (
                <div className="mock-part-card__footer">
                    <button
                        type="button"
                        className="mock-part-expand-btn"
                        onClick={() => setIsExpanded((prev) => !prev)}
                        aria-expanded={isExpanded}
                    >
                        <span>
                            {isExpanded
                                ? `Ẩn chi tiết ${part.abilities.length} kỹ năng`
                                : `Xem chi tiết ${part.abilities.length} kỹ năng con`}
                        </span>
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>

                    {isExpanded && (
                        <ul className="mock-ability-list">
                            {part.abilities.map((ability) => {
                                const badge = getAbilityStatusLabel(ability.status);
                                return (
                                    <li key={ability.abilityId} className="mock-ability-item">
                                        <div className="mock-ability-item__info">
                                            <span className="mock-ability-item__name">
                                                {ability.abilityName}
                                            </span>
                                            <span className="mock-ability-item__ratio">
                                                {ability.correctCount}/{ability.totalCount} câu (
                                                {ability.accuracyPercent}%)
                                            </span>
                                        </div>
                                        <span className={`mock-ability-badge ${badge.className}`}>
                                            {badge.label}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </article>
    );
}
