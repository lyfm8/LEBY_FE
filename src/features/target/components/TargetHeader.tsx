import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface TargetHeaderProps {
    isFirstTime?: boolean;
    currentStep?: number;
    totalSteps?: number;
}

/**
 * Phần đầu trang chọn mục tiêu AIM, tự động thích ứng giữa chế độ Onboarding lần đầu
 * và chế độ Đổi mục tiêu khi học viên đã có hồ sơ.
 */
export function TargetHeader({ isFirstTime = true}: TargetHeaderProps) {
    return (
        <header className="target-header">
            <div className="target-header__container">
                <Link to={isFirstTime ? '/' : '/dashboard'} className="target-header__logo">
                    <div className="target-header__logo-badge">L</div>
                    <span className="target-header__logo-text">LEBY</span>
                </Link>

                {!isFirstTime && (
                    <Link to="/profile" className="target-header__back-link">
                        <ArrowLeft size={16} />
                        <span>Quay lại hồ sơ</span>
                    </Link>
                )}
            </div>
        </header>
    );
}
