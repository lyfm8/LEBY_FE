import { Camera, ShieldCheck } from 'lucide-react';
import type { UserProfile } from '../types/profileTypes';

interface ProfileHeroProps {
    user: UserProfile;
}

export function ProfileHero({ user }: ProfileHeroProps) {
    return (
        <section className="pf-hero-card">
            <div className="pf-hero-card__left">
                <div className="pf-avatar-wrapper">
                    <img
                        src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={user.fullName}
                        className="pf-avatar-img"
                    />
                    <button type="button" className="pf-avatar-btn" title="Đổi ảnh đại diện">
                        <Camera size={14} />
                    </button>
                </div>

                <div className="pf-hero-info">
                    <div className="pf-hero-name-row">
                        <h1 className="pf-hero-name">{user.fullName}</h1>
                        <span className="pf-hero-role-tag">
                            <ShieldCheck size={14} />
                            {user.role}
                        </span>
                    </div>

                    <p className="pf-hero-meta">
                        @{user.username} • {user.email}
                    </p>
                    <span className="pf-hero-joined">
                        Tham gia từ: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                </div>
            </div>
        </section>
    );
}
