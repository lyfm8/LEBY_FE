import { Link } from 'react-router-dom';

interface TargetHeaderProps {
    currentStep?: number;
    totalSteps?: number;
}

export function TargetHeader({ currentStep = 1, totalSteps = 3 }: TargetHeaderProps) {
    return (
        <header className="target-header">
            <div className="target-header__container">
                <Link to="/" className="target-header__logo">
                    <div className="target-header__logo-badge">L</div>
                    <span className="target-header__logo-text">LEBY</span>
                </Link>

                <div className="target-header__step">
                    <span className="target-header__step-label">
                        Bước {currentStep} / {totalSteps}: Chọn mục tiêu
                    </span>
                    <div className="target-header__progress-bar">
                        <div className="target-header__progress-segment is-active" />
                        <div className="target-header__progress-segment" />
                        <div className="target-header__progress-segment" />
                    </div>
                </div>
            </div>
        </header>
    );
}
