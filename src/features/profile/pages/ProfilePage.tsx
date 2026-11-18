import { useState } from 'react';
import { SidebarNav } from '@/features/roadmap/components/SidebarNav';
import { ProfileHero } from '../components/ProfileHero';
import { ProfileInfoTab } from '../components/ProfileInfoTab';
import { ProfileAbilityTab } from '../components/ProfileAbilityTab';
import { ProfileSecurityTab } from '../components/ProfileSecurityTab';
import { useProfile } from '../hooks/useProfile';
import { AlertCircle, RotateCcw } from 'lucide-react';
import '../profile.css';

/**
 * Smart / Container Component: Trang Hồ sơ cá nhân và Ma trận năng lực LEBY (UC15 & UC16).
 * Toàn bộ logic (state, fetching API, cập nhật thông tin) được ủy quyền cho hook useProfile.
 */
export default function ProfilePage() {
    const {
        data,
        isLoading,
        error,
        refetch,
        handleUpdateProfile,
        handleUpdateAvatar,
    } = useProfile();

    const [activeTab, setActiveTab] = useState<'info' | 'skills' | 'security'>('info');

    if (isLoading) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <div className="pf-loading" style={{ flex: 1 }}>
                    <div className="pf-spinner" />
                    <p>Đang tải thông tin cá nhân...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <div className="pf-error-state" style={{ flex: 1, padding: '60px 40px', textAlign: 'center' }}>
                    <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                        Không thể tải thông tin hồ sơ
                    </h3>
                    <p style={{ color: '#64748b', marginBottom: '24px' }}>
                        {error || 'Đã có lỗi xảy ra trong quá trình kết nối với máy chủ.'}
                    </p>
                    <button
                        type="button"
                        className="pf-btn-save"
                        onClick={refetch}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
                    >
                        <RotateCcw size={16} />
                        <span>Tải lại hồ sơ</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <SidebarNav />

            <div className="app-main-viewport" style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
                <main className="pf-container" style={{ padding: '32px 40px' }}>
                    {/* Phần đầu: Ảnh đại diện, thông tin cơ bản & tải ảnh mới */}
                    <ProfileHero
                        user={data.user}
                        onUpdateAvatar={handleUpdateAvatar}
                    />

                    {/* Navigation Tabs */}
                    <div className="pf-tabs">
                        <button
                            type="button"
                            className={`pf-tab-item ${activeTab === 'info' ? 'is-active' : ''}`}
                            onClick={() => setActiveTab('info')}
                        >
                            Hồ sơ & Mục tiêu
                        </button>

                        <button
                            type="button"
                            className={`pf-tab-item ${activeTab === 'skills' ? 'is-active' : ''}`}
                            onClick={() => setActiveTab('skills')}
                        >
                            Hồ sơ năng lực TOEIC ({data.skills?.length || 0})
                        </button>

                        <button
                            type="button"
                            className={`pf-tab-item ${activeTab === 'security' ? 'is-active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            Bảo mật & Tài khoản
                        </button>
                    </div>

                    {/* Tab Views */}
                    {activeTab === 'info' && (
                        <ProfileInfoTab
                            user={data.user}
                            target={data.target}
                            onSave={handleUpdateProfile}
                        />
                    )}

                    {activeTab === 'skills' && (
                        <ProfileAbilityTab skills={data.skills} />
                    )}

                    {activeTab === 'security' && (
                        <ProfileSecurityTab />
                    )}
                </main>
            </div>
        </div>
    );
}
