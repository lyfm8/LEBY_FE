import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, Check } from 'lucide-react';
import type { UserProfile, UserTargetInfo } from '../types/profileTypes';

interface ProfileInfoTabProps {
    user: UserProfile;
    target: UserTargetInfo;
    onSave: (data: { fullName: string; dob: string | null; learnerType: string }) => Promise<void>;
}

export function ProfileInfoTab({ user, target, onSave }: ProfileInfoTabProps) {
    const [fullName, setFullName] = useState(user.fullName);
    const [dob, setDob] = useState(user.dob || '');
    const [learnerType, setLearnerType] = useState(user.learnerType || 'Học thích ứng cấp tốc');
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsSaving(true);
        setSuccessMsg('');
        try {
            await onSave({ fullName, dob: dob || null, learnerType });
            setSuccessMsg('Đã lưu thông tin cá nhân thành công!');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="pf-tab-content">
            {/* Thẻ Mục tiêu hiện tại */}
            <div className="pf-card pf-card--target">
                <div className="pf-card__header">
                    <div className="pf-target-title-row">
                        <Target size={24} color="#ea580c" />
                        <div>
                            <h3 className="pf-card__title">Mục tiêu TOEIC hiện tại</h3>
                            <p className="pf-card__sub">Được thiết lập dựa trên kế hoạch cá nhân hóa</p>
                        </div>
                    </div>

                    <Link to="/target-selection" className="pf-target-change-btn">
                        Thay đổi mục tiêu
                    </Link>
                </div>

                <div className="pf-target-body">
                    <div className="pf-target-stat">
                        <span className="pf-target-stat__label">MỤC TIÊU ĐIỂM SỐ</span>
                        <span className="pf-target-stat__val">{target.targetTotalScore}</span>
                    </div>

                    <div className="pf-target-stat">
                        <span className="pf-target-stat__label">CẤP ĐỘ MỤC TIÊU</span>
                        <span className="pf-target-stat__badge">{target.level}</span>
                    </div>

                    <div className="pf-target-stat">
                        <span className="pf-target-stat__label">NGÀY THIẾT LẬP</span>
                        <span className="pf-target-stat__date">
                            {new Date(target.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Form chỉnh sửa thông tin */}
            <div className="pf-card">
                <h3 className="pf-card__title">Thông tin tài khoản</h3>

                {successMsg && (
                    <div className="pf-alert-success">
                        <Check size={16} />
                        <span>{successMsg}</span>
                    </div>
                )}

                <form className="pf-form" onSubmit={handleSubmit}>
                    <div className="pf-form__grid">
                        <div className="pf-form__group">
                            <label className="pf-form__label">Họ và tên</label>
                            <input
                                type="text"
                                className="pf-form__input"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="pf-form__group">
                            <label className="pf-form__label">Tên đăng nhập (Username)</label>
                            <input
                                type="text"
                                className="pf-form__input is-disabled"
                                value={user.username}
                                disabled
                            />
                        </div>

                        <div className="pf-form__group">
                            <label className="pf-form__label">Địa chỉ Email</label>
                            <input
                                type="email"
                                className="pf-form__input is-disabled"
                                value={user.email}
                                disabled
                            />
                        </div>

                        <div className="pf-form__group">
                            <label className="pf-form__label">Ngày sinh</label>
                            <input
                                type="date"
                                className="pf-form__input"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                            />
                        </div>

                        <div className="pf-form__group pf-form__group--full">
                            <label className="pf-form__label">Kiểu học viên (Learner Type)</label>
                            <select
                                className="pf-form__select"
                                value={learnerType}
                                onChange={(e) => setLearnerType(e.target.value)}
                            >
                                <option value="Học thích ứng cấp tốc">Học thích ứng cấp tốc (Ưu tiên thi sớm trong 2 tháng)</option>
                                <option value="Học tiêu chuẩn">Học tiêu chuẩn (Luyện tập đều đặn hàng ngày)</option>
                                <option value="Học tự do">Học tự do (Tự quản lý thời gian linh hoạt)</option>
                            </select>
                        </div>
                    </div>

                    <div className="pf-form__actions">
                        <button type="submit" className="pf-btn-save" disabled={isSaving}>
                            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
