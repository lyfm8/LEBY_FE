import { Lightbulb } from 'lucide-react';
import type { PartResult, DirectiveType } from '../types/diagnosticTypes';

interface PartResultCardProps {
    result: PartResult;
}

export function PartResultCard({ result }: PartResultCardProps) {
    const percent = Math.min(100, Math.max(0, (result.score / result.maxScore) * 100));

    function getDirectiveStyle(directive: DirectiveType) {
        switch (directive) {
            case 'PASS':
                return { badgeClass: 'is-pass', barClass: 'is-pass' };
            case 'CONFIRM':
                return { badgeClass: 'is-confirm', barClass: 'is-confirm' };
            case 'WEAK':
                return { badgeClass: 'is-weak', barClass: 'is-weak' };
            case 'FULL_PART':
                return { badgeClass: 'is-full-part', barClass: 'is-full-part' };
            default:
                return { badgeClass: 'is-pass', barClass: 'is-pass' };
        }
    }

    const { badgeClass, barClass } = getDirectiveStyle(result.directive);

    return (
        <article className="diag-part-card">
            <div className="diag-part-card__header">
                <div className="diag-part-card__title-wrap">
                    <h3 className="diag-part-card__title">{result.name}</h3>
                    <span className="diag-part-card__score">
                        {result.score}/{result.maxScore}
                    </span>
                </div>

                <span className={`diag-part-card__badge ${badgeClass}`}>
                    {result.directiveLabel}
                </span>
            </div>

            <div className="diag-part-card__bar-track">
                <div
                    className={`diag-part-card__bar-fill ${barClass}`}
                    style={{ width: `${percent}%` }}
                />
            </div>

            <div className="diag-part-card__insight">
                <Lightbulb size={16} className="diag-part-card__insight-icon" />
                <p className="diag-part-card__insight-text">{result.aiFeedback}</p>
            </div>
        </article>
    );
}
