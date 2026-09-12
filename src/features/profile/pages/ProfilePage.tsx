import { useEffect, useState } from 'react';
import { SidebarNav } from '@/features/roadmap/components/SidebarNav';
import { ProfileHero } from '../components/ProfileHero';
import { ProfileInfoTab } from '../components/ProfileInfoTab';
import { ProfileAbilityTab } from '../components/ProfileAbilityTab';
import { ProfileSecurityTab } from '../components/ProfileSecurityTab';
import { profileService } from '../services/profileService';
import type { ProfileData } from '../types/profileTypes';
import '../profile.css';

export default function ProfilePage() {
    const [data, setData] = useState<ProfileData | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'skills' | 'security'>('info');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        profileService
            .getProfile()
            .then((res) => {
                if (isMounted && res.success && res.data) {
                    setData(res.data);
                }
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    async function handleUpdateProfile(updated: { fullName: string; dob: string | null; learnerType: string }) {
        const res = await profileService.updateProfile(updated);
        if (res.success && res.data) {
            setData(res.data);
        }
    }

    if (isLoading || !data) {
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

    return (
        <div className="app-layout">
            <SidebarNav />

            <div className="app-main-viewport" style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
                <main className="pf-container" style={{ padding: '32px 40px' }}>
                    <ProfileHero user={data.user} />

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
                            Hồ sơ năng lực TOEIC ({data.skills.length})
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

                    {activeTab === 'skills' && <ProfileAbilityTab skills={data.skills} />}

                    {activeTab === 'security' && <ProfileSecurityTab />}
                </main>
            </div>
        </div>
    );
}
