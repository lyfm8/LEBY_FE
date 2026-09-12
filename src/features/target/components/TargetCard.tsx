import { Check } from 'lucide-react';
import type { TargetProfile } from '../types/targetTypes';

interface TargetCardProps {
    target: TargetProfile;
    isSelected: boolean;
    onSelect: (id: number) => void;
}

export function TargetCard({ target, isSelected, onSelect }: TargetCardProps) {
    return (
        <button
            type="button"
            className={`target-card ${isSelected ? 'is-selected' : ''}`}
            onClick={() => onSelect(target.id)}
            aria-pressed={isSelected}
        >
            {isSelected && (
                <div className="target-card__check-badge" aria-label="Mục tiêu đã chọn">
                    <Check size={14} strokeWidth={3} />
                </div>
            )}

            <div className="target-card__level">{target.level}</div>
            <div className="target-card__score">
                {target.targetTotalScore}
                {target.targetTotalScore === 850 ? '+' : ''}
            </div>
            <p className="target-card__desc">{target.description}</p>
        </button>
    );
}
