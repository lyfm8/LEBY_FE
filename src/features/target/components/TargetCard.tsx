import { Check } from 'lucide-react';
import type { TargetProfile } from '../types/targetTypes';

interface TargetCardProps {
    target: TargetProfile;
    isSelected: boolean;
    isCurrent?: boolean;
    onSelect: (id: number) => void;
}

/**
 * Thẻ hiển thị một mốc điểm TOEIC mục tiêu (AIM) cho phép học viên lựa chọn.
 */
export function TargetCard({ target, isSelected, isCurrent = false, onSelect }: TargetCardProps) {
    return (
        <button
            type="button"
            className={`target-card ${isSelected ? 'is-selected' : ''} ${isCurrent ? 'is-current' : ''}`}
            onClick={() => onSelect(target.id)}
            aria-pressed={isSelected}
        >
            {isSelected && (
                <div className="target-card__check-badge" aria-label="Mục tiêu đã chọn">
                    <Check size={14} strokeWidth={3} />
                </div>
            )}

            <div className="target-card__badges">
                {isCurrent && (
                    <span className="target-card__pill is-current">Mục tiêu hiện tại</span>
                )}
                {target.isRecommended && !isCurrent && (
                    <span className="target-card__pill is-recommended">Được đề xuất</span>
                )}
            </div>

            <div className="target-card__score">
                {target.targetTotalScore}
                {target.targetTotalScore === 850 ? '+' : ''}
            </div>

            <p className="target-card__desc">{target.description}</p>
        </button>
    );
}
