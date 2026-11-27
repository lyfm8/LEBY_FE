import React, { useRef, useState } from 'react';
import { Camera, ShieldCheck, Loader2 } from 'lucide-react';
import type { UserInfoResponse } from '../types/profileTypes';
import { LEARNER_TYPE_LABELS } from '../types/profileTypes';
import { mediaService } from '@/features/media/services/mediaService';

interface ProfileHeroProps {
    user: UserInfoResponse;
    onUpdateAvatar?: (avatarUrl: string) => Promise<boolean>;
}

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5MB (Theo quy tắc UC16 6b)
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function ProfileHero({ user, onUpdateAvatar }: ProfileHeroProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleCameraClick = () => {
        if (isUploading) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setErrorMsg(null);

        // Kiểm tra định dạng tệp ảnh
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setErrorMsg('Ảnh đại diện chỉ chấp nhận định dạng JPG, PNG hoặc WEBP.');
            e.target.value = '';
            return;
        }

        // Kiểm tra dung lượng tối đa 5MB
        if (file.size > MAX_AVATAR_SIZE_BYTES) {
            setErrorMsg('Dung lượng ảnh đại diện không được vượt quá 5MB.');
            e.target.value = '';
            return;
        }

        try {
            setIsUploading(true);
            // Tải ảnh trực tiếp lên Cloudinary thông qua mediaService của hệ thống
            const savedMedias = await mediaService.upload([file]);
            if (savedMedias.length > 0 && savedMedias[0].url) {
                const newAvatarUrl = savedMedias[0].url;
                if (onUpdateAvatar) {
                    await onUpdateAvatar(newAvatarUrl);
                }
            }
        } catch (err: unknown) {
            console.error('Lỗi khi tải ảnh đại diện:', err);
            setErrorMsg('Không thể tải ảnh đại diện lên. Vui lòng thử lại sau.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const learnerLabel = user.learnerType ? LEARNER_TYPE_LABELS[user.learnerType] : null;

    return (
        <section className="pf-hero-card">
            <div className="pf-hero-card__left">
                <div className="pf-avatar-wrapper">
                    <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={user.fullName}
                        className={`pf-avatar-img ${isUploading ? 'is-uploading' : ''}`}
                    />
                    <button
                        type="button"
                        className="pf-avatar-btn"
                        title="Đổi ảnh đại diện"
                        onClick={handleCameraClick}
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader2 size={14} className="pf-spin" /> : <Camera size={14} />}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }}
                    />
                </div>

                <div className="pf-hero-info">
                    <div className="pf-hero-name-row">
                        <h1 className="pf-hero-name">{user.fullName}</h1>
                        <span className="pf-hero-role-tag">
                            <ShieldCheck size={14} />
                            {user.role}
                        </span>
                        {learnerLabel && (
                            <span className="pf-learner-badge">
                                {learnerLabel}
                            </span>
                        )}
                    </div>

                    <p className="pf-hero-meta">
                        {user.email}
                    </p>
                    <span className="pf-hero-joined">
                        Tham gia từ: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </span>

                    {errorMsg && (
                        <div className="pf-hero-error" role="alert">
                            {errorMsg}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
