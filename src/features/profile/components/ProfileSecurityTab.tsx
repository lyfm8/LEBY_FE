import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Lock, LogOut, Check } from 'lucide-react';
import { profileService } from '../services/profileService';

export function ProfileSecurityTab() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    async function handlePasswordChange(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setMsg('');

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
            return;
        }

        setIsSubmitting(true);
        try {
            await profileService.changePassword({ oldPassword, newPassword, confirmPassword });
            setMsg('Đổi mật khẩu thành công!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch {
            setError('Đã xảy ra lỗi khi đổi mật khẩu.');
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleLogout() {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) {
            await logout();
            navigate('/login');
        }
    }

    return (
        <div className="pf-tab-content">
            {/* Đổi mật khẩu */}
            <div className="pf-card">
                <div className="pf-card__header-simple">
                    <Lock size={20} className="pf-icon-orange" />
                    <h3 className="pf-card__title">Đổi mật khẩu tài khoản</h3>
                </div>

                {msg && (
                    <div className="pf-alert-success">
                        <Check size={16} />
                        <span>{msg}</span>
                    </div>
                )}

                {error && <div className="pf-alert-error">{error}</div>}

                <form className="pf-form" onSubmit={handlePasswordChange}>
                    <div className="pf-form__group">
                        <label className="pf-form__label">Mật khẩu hiện tại</label>
                        <input
                            type="password"
                            className="pf-form__input"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="pf-form__group">
                        <label className="pf-form__label">Mật khẩu mới</label>
                        <input
                            type="password"
                            className="pf-form__input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="pf-form__group">
                        <label className="pf-form__label">Xác nhận mật khẩu mới</label>
                        <input
                            type="password"
                            className="pf-form__input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="pf-form__actions">
                        <button type="submit" className="pf-btn-save" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Vùng nguy hiểm / Đăng xuất */}
            <div className="pf-card pf-card--danger">
                <div className="pf-card__header-simple">
                    <LogOut size={20} className="pf-icon-red" />
                    <h3 className="pf-card__title">Phiên đăng nhập & Bảo mật</h3>
                </div>

                <p className="pf-danger-desc">
                    Đăng xuất sẽ kết thúc phiên làm việc hiện tại và hủy toàn bộ token truy cập trên thiết bị này.
                </p>

                <button type="button" className="pf-btn-logout" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Đăng xuất khỏi hệ thống</span>
                </button>
            </div>
        </div>
    );
}
