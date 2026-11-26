import { ChevronDown, ChevronUp } from 'lucide-react';
import type { PartResult, DirectiveType, AbilityStatus } from '../types/diagnosticTypes';

interface PartResultCardProps {
    result: PartResult;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

function getDirectiveStyle(directive: DirectiveType) {
    switch (directive) {
        case 'PASS':
            return { badgeClass: 'is-pass', barClass: 'is-pass', defaultLabel: 'Đạt chuẩn' };
        case 'CONFIRM':
            return { badgeClass: 'is-confirm', barClass: 'is-confirm', defaultLabel: 'Cận chuẩn' };
        case 'ABILITY_DIAGNOSTIC':
            return { badgeClass: 'is-weak', barClass: 'is-weak', defaultLabel: 'Dưới chuẩn' };
        case 'FULL_PART':
            return { badgeClass: 'is-full-part', barClass: 'is-full-part', defaultLabel: 'Mất gốc' };
        default:
            return { badgeClass: 'is-confirm', barClass: 'is-confirm', defaultLabel: 'Cần đánh giá' };
    }
}

function getAbilityStatusBadge(status: AbilityStatus) {
    switch (status) {
        case 'STABLE':
            return { cls: 'is-stable', label: 'Vững vàng' };
        case 'DEVELOPING':
            return { cls: 'is-developing', label: 'Đang phát triển' };
        case 'UNCERTAIN':
            return { cls: 'is-uncertain', label: 'Chưa đủ dữ liệu' };
        case 'WEAK':
        default:
            return { cls: 'is-weak', label: 'Cần bồi dưỡng' };
    }
}

/**
 * Thẻ hiển thị kết quả chẩn đoán của một Part TOEIC kèm khả năng mở rộng
 * xem chi tiết tỷ lệ đúng từng Năng lực con (UC07 Luồng chính 3 & Luồng thay thế 5a).
 */
export function PartResultCard({ result, isExpanded, onToggleExpand }: PartResultCardProps) {
    const percent = Math.min(100, Math.max(0, (result.score / (result.maxScore || 100)) * 100));
    const { badgeClass, barClass, defaultLabel } = getDirectiveStyle(result.directive);
    const hasAbilities = result.abilities && result.abilities.length > 0;

    return (
        <article id={`diag-part-card-${result.partNo}`} className={`diag-part-card ${isExpanded ? 'is-expanded' : ''}`}>
            <div className="diag-part-card__header">
                <div className="diag-part-card__title-wrap">
                    <h3 className="diag-part-card__title">{result.name}</h3>
                    <span className="diag-part-card__score">
                        {result.score}% ({result.correctCount}/{result.totalQuestions} câu)
                    </span>
                </div>

                <span className={`diag-part-card__badge ${badgeClass}`}>
                    {result.directiveLabel || defaultLabel}
                </span>
            </div>

            <div className="diag-part-card__bar-track">
                <div
                    className={`diag-part-card__bar-fill ${barClass}`}
                    style={{ width: `${percent}%` }}
                />
            </div>

            {hasAbilities && (
                <div className="diag-part-card__abilities-section">
                    <button
                        type="button"
                        className="diag-part-card__expand-btn"
                        onClick={onToggleExpand}
                        aria-expanded={isExpanded}
                    >
                        <span>
                            {isExpanded
                                ? 'Thu gọn năng lực con'
                                : `Xem chi tiết ${result.abilities.length} năng lực con`}
                        </span>
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>

                    {isExpanded && (
                        <div className="diag-part-abilities-list">
                            {result.abilities.map((ab) => {
                                const st = getAbilityStatusBadge(ab.status);
                                return (
                                    <div key={ab.abilityId} className="diag-part-ability-row">
                                        <div className="diag-part-ability-info">
                                            <span className="diag-part-ability-name">{ab.abilityName}</span>
                                            <span className="diag-part-ability-count">
                                                {ab.correctCount}/{ab.totalCount} câu đúng
                                            </span>
                                        </div>
                                        <div className="diag-part-ability-right">
                                            <span className="diag-part-ability-pct">{ab.accuracyPercent}%</span>
                                            <span className={`diag-ability-pill ${st.cls}`}>{st.label}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}
