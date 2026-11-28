import React, { useState } from 'react';
import { Lock, Check, AlertCircle, Pencil, X } from 'lucide-react';
import { profileService } from '../services/profileService';

/**
 * Tab quản lý bảo mật tài khoản và đổi mật khẩu người dùng (UC16).
 * Mặc định các trường mật khẩu bị khóa cho đến khi người dùng bấm nút Chỉnh sửa.
 */
export function ProfileSecurityTab() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // Trạng thái cho phép chỉnh sửa mật khẩu (mặc định khóa các trường)
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    /**
     * Hủy bỏ thao tác đổi mật khẩu, xóa trắng form và khóa lại các trường.
     */
    function handleCancel() {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setIsEditing(false);
    }

    async function handlePasswordChange(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setMsg('');

        // Bước 1: Kiểm tra tính hợp lệ của mật khẩu hiện tại và mật khẩu mới
        if (!oldPassword) {
            setError('Vui lòng nhập mật khẩu hiện tại.');
            return;
        }

        if (newPassword.length < 8) {
            setError('Mật khẩu mới phải có tối thiểu 8 ký tự.');
            return;
        }

        if (newPassword === oldPassword) {
            setError('Mật khẩu mới không được trùng với mật khẩu đang sử dụng.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp với mật khẩu mới.');
            return;
        }

        // Bước 2: Gửi request cập nhật mật khẩu lên server
        setIsSubmitting(true);
        try {
            const res = await profileService.changePassword({ oldPassword, newPassword, confirmPassword });
            if (res.success) {
                setMsg('Đổi mật khẩu thành công! Các phiên đăng nhập trên thiết bị khác đã được vô hiệu hóa.');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setIsEditing(false);
            } else {
                setError(res.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.');
            }
        } catch (err: unknown) {
            console.error('Lỗi khi đổi mật khẩu:', err);
            setError('Mật khẩu hiện tại không đúng hoặc đã xảy ra lỗi trong quá trình xử lý.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="pf-tab-content">
            {/* Đổi mật khẩu tài khoản (UC16) */}
            <div className="pf-card">
                <div className="pf-card__header-simple">
                    <Lock size={20} className="pf-icon-orange" />
                    <h3 className="pf-card__title">Đổi mật khẩu tài khoản</h3>
                </div>

                {msg && (
                    <div className="pf-alert-success" role="alert">
                        <Check size={16} />
                        <span>{msg}</span>
                    </div>
                )}

                {error && (
                    <div className="pf-alert-error" role="alert">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form className="pf-form" onSubmit={handlePasswordChange}>
                    <div className="pf-form__group">
                        <label className="pf-form__label">
                            Mật khẩu hiện tại <span className="pf-required">*</span>
                        </label>
                        <input
                            type="password"
                            className={`pf-form__input ${!isEditing ? 'is-disabled' : ''}`}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder={isEditing ? 'Nhập mật khẩu đang dùng' : '••••••••'}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="pf-form__group">
                        <label className="pf-form__label">
                            Mật khẩu mới <span className="pf-required">*</span>
                        </label>
                        <input
                            type="password"
                            className={`pf-form__input ${!isEditing ? 'is-disabled' : ''}`}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder={isEditing ? 'Tối thiểu 8 ký tự' : '••••••••'}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="pf-form__group">
                        <label className="pf-form__label">
                            Xác nhận mật khẩu mới <span className="pf-required">*</span>
                        </label>
                        <input
                            type="password"
                            className={`pf-form__input ${!isEditing ? 'is-disabled' : ''}`}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={isEditing ? 'Nhập lại mật khẩu mới' : '••••••••'}
                            disabled={!isEditing}
                            required
                        />
                    </div>

                    <div className="pf-form__actions">
                        {!isEditing ? (
                            <button
                                type="button"
                                className="pf-btn-edit"
                                onClick={() => setIsEditing(true)}
                            >
                                <Pencil size={16} />
                                <span>Chỉnh sửa</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="pf-btn-cancel"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                            >
                                <X size={16} />
                                <span>Hủy</span>
                            </button>
                        )}

                        <button
                            type="submit"
                            className="pf-btn-save"
                            disabled={!isEditing || isSubmitting}
                        >
                            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
