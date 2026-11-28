import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Check, AlertCircle, Pencil, X } from 'lucide-react';
import type {
    UserInfoResponse,
    UserTargetResponse,
    UpdateProfileRequest,
    ELearnerType,
} from '../types/profileTypes';
import { LEARNER_TYPE_LABELS } from '../types/profileTypes';

interface ProfileInfoTabProps {
    user: UserInfoResponse;
    target: UserTargetResponse | null;
    onSave: (data: UpdateProfileRequest) => Promise<boolean>;
}

/**
 * Tab hiển thị và cập nhật thông tin cá nhân cùng Mục tiêu điểm số TOEIC (AIM).
 * 
 * @param user Thông tin tài khoản người học hiện tại
 * @param target Mục tiêu điểm số TOEIC và ngày thiết lập
 * @param onSave Callback lưu thông tin cá nhân lên server
 */
export function ProfileInfoTab({ user, target, onSave }: ProfileInfoTabProps) {
    const [fullName, setFullName] = useState(user.fullName || '');
    const [dob, setDob] = useState(user.dob || '');
    const [learnerType, setLearnerType] = useState<ELearnerType | ''>(user.learnerType || '');
    // Trạng thái cho phép chỉnh sửa thông tin (mặc định khóa các field để tránh thao tác nhầm)
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        setFullName(user.fullName || '');
        setDob(user.dob || '');
        setLearnerType(user.learnerType || '');
    }, [user]);

    /**
     * Hủy bỏ chỉnh sửa và hoàn tác các trường dữ liệu về thông tin gốc của người dùng.
     */
    function handleCancel() {
        setFullName(user.fullName || '');
        setDob(user.dob || '');
        setLearnerType(user.learnerType || '');
        setErrorMsg('');
        setIsEditing(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        // Bước 1: Validate hợp lệ họ và tên
        if (!fullName.trim() || fullName.trim().length < 2) {
            setErrorMsg('Họ và tên không được để trống (tối thiểu 2 ký tự).');
            return;
        }

        // Bước 2: Gửi request cập nhật và khóa lại form sau khi thành công
        setIsSaving(true);
        try {
            const success = await onSave({
                fullName: fullName.trim(),
                dob: dob || null,
                learnerType: learnerType ? learnerType : null,
            });

            if (success) {
                setSuccessMsg('Đã lưu thông tin cá nhân thành công!');
                setIsEditing(false);
            }
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="pf-tab-content">
            {/* Thẻ Mục tiêu điểm số TOEIC (AIM) */}
            <div className="pf-card pf-card--target">
                <div className="pf-card__header">
                    <div className="pf-target-title-row">
                        <Target size={24} color="#ea580c" />
                        <div>
                            <h3 className="pf-card__title">Mục tiêu TOEIC hiện tại</h3>
                            <p className="pf-card__sub">
                                {target
                                    ? 'Được thiết lập dựa trên kế hoạch học tập thích ứng của bạn'
                                    : 'Bạn chưa thiết lập mục tiêu điểm số TOEIC mong muốn'}
                            </p>
                        </div>
                    </div>

                    <Link to="/target-selection" className="pf-target-change-btn">
                        {target ? 'Thay đổi mục tiêu' : 'Thiết lập mục tiêu ngay'}
                    </Link>
                </div>

                {target ? (
                    <div className="pf-target-body">
                        <div className="pf-target-stat">
                            <span className="pf-target-stat__label">MỤC TIÊU ĐIỂM SỐ</span>
                            <span className="pf-target-stat__val">{target.targetTotalScore}</span>
                        </div>

                        {target.description && (
                            <div className="pf-target-stat">
                                <span className="pf-target-stat__label">MÔ TẢ MỤC TIÊU</span>
                                <span className="pf-target-stat__desc">{target.description}</span>
                            </div>
                        )}

                        <div className="pf-target-stat">
                            <span className="pf-target-stat__label">NGÀY THIẾT LẬP</span>
                            <span className="pf-target-stat__date">
                                {new Date(target.assignedAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="pf-target-empty">
                        <p>
                            Hãy chọn mốc mục tiêu điểm số để hệ thống phân tích lộ trình học thích ứng phù hợp nhất cho bạn.
                        </p>
                    </div>
                )}
            </div>

            {/* Form chỉnh sửa thông tin tài khoản (UC16) */}
            <div className="pf-card">
                <h3 className="pf-card__title">Thông tin tài khoản</h3>

                {successMsg && (
                    <div className="pf-alert-success" role="alert">
                        <Check size={16} />
                        <span>{successMsg}</span>
                    </div>
                )}

                {errorMsg && (
                    <div className="pf-alert-error" role="alert">
                        <AlertCircle size={16} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form className="pf-form" onSubmit={handleSubmit}>
                    <div className="pf-form__grid">
                        <div className="pf-form__group">
                            <label className="pf-form__label">
                                Họ và tên <span className="pf-required">*</span>
                            </label>
                            <input
                                type="text"
                                className={`pf-form__input ${!isEditing ? 'is-disabled' : ''}`}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Nhập họ và tên của bạn"
                                disabled={!isEditing}
                                required
                            />
                        </div>

                        <div className="pf-form__group">
                            <label className="pf-form__label">Địa chỉ Email</label>
                            <input
                                type="email"
                                className="pf-form__input is-disabled"
                                value={user.email}
                                disabled
                                title="Địa chỉ email định danh không thể thay đổi"
                            />
                        </div>

                        <div className="pf-form__group">
                            <label className="pf-form__label">Ngày sinh</label>
                            <input
                                type="date"
                                className={`pf-form__input ${!isEditing ? 'is-disabled' : ''}`}
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="pf-form__group pf-form__group--full">
                            <label className="pf-form__label">Đối tượng học tập</label>
                            <select
                                className={`pf-form__select ${!isEditing ? 'is-disabled' : ''}`}
                                value={learnerType}
                                onChange={(e) => setLearnerType(e.target.value as ELearnerType)}
                                disabled={!isEditing}
                            >
                                <option value="">-- Chọn đối tượng học tập phù hợp --</option>
                                {(Object.keys(LEARNER_TYPE_LABELS) as ELearnerType[]).map((key) => (
                                    <option key={key} value={key}>
                                        {LEARNER_TYPE_LABELS[key]}
                                    </option>
                                ))}
                            </select>
                        </div>
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
                                disabled={isSaving}
                            >
                                <X size={16} />
                                <span>Hủy</span>
                            </button>
                        )}

                        <button
                            type="submit"
                            className="pf-btn-save"
                            disabled={!isEditing || isSaving}
                        >
                            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
