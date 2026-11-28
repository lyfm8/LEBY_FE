import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SidebarNav } from '@/features/roadmap/components/SidebarNav';
import { ProfileHero } from '../components/ProfileHero';
import { ProfileInfoTab } from '../components/ProfileInfoTab';
import { ProfileAbilityTab } from '../components/ProfileAbilityTab';
import { ProfileMistakesTab } from '../components/ProfileMistakesTab';
import { ProfileSecurityTab } from '../components/ProfileSecurityTab';
import { useProfile } from '../hooks/useProfile';
import { AlertCircle, RotateCcw } from 'lucide-react';
import '../profile.css';

// Danh sách các tab hợp lệ được đồng bộ với tham số truy vấn ?tab= trên URL
type ProfileTabKey = 'info' | 'skills' | 'mistakes' | 'security';

const VALID_TABS: ReadonlySet<ProfileTabKey> = new Set([
    'info',
    'skills',
    'mistakes',
    'security',
]);

/**
 * Smart / Container Component: Trang Hồ sơ cá nhân, Ma trận năng lực và Sổ tay câu sai LEBY.
 * Toàn bộ logic tải hồ sơ được ủy quyền cho hook useProfile và đồng bộ tab đang mở lên URL.
 */
export default function ProfilePage() {
    // Khởi tạo hook quản lý dữ liệu hồ sơ người dùng
    const {
        data,
        isLoading,
        error,
        refetch,
        handleUpdateProfile,
        handleUpdateAvatar,
    } = useProfile();

    // Đọc và ghi trạng thái tab hiện tại qua URL search params để hỗ trợ reload/chia sẻ liên kết
    const [searchParams, setSearchParams] = useSearchParams();

    // Chuẩn hóa tên tab đọc từ URL, fallback về 'info' nếu không khớp danh sách hợp lệ
    const activeTab: ProfileTabKey = useMemo(() => {
        const rawTab = searchParams.get('tab') as ProfileTabKey | null;
        return rawTab && VALID_TABS.has(rawTab) ? rawTab : 'info';
    }, [searchParams]);

    // Chuyển tab và dọn gọn các bộ lọc phụ thuộc tab cũ trên URL
    function handleSelectTab(nextTab: ProfileTabKey) {
        if (nextTab === 'info') {
            setSearchParams({});
            return;
        }
        setSearchParams({ tab: nextTab });
    }

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

                    {/* Thanh điều hướng các mục hồ sơ đồng bộ với URL */}
                    <div className="pf-tabs">
                        <button
                            type="button"
                            className={`pf-tab-item ${activeTab === 'info' ? 'is-active' : ''}`}
                            onClick={() => handleSelectTab('info')}
                        >
                            Hồ sơ & Mục tiêu
                        </button>

                        <button
                            type="button"
                            className={`pf-tab-item ${activeTab === 'skills' ? 'is-active' : ''}`}
                            onClick={() => handleSelectTab('skills')}
                        >
                            Hồ sơ năng lực TOEIC ({data.skills?.length || 0})
                        </button>

                        <button
                            type="button"
                            className={`pf-tab-item ${activeTab === 'mistakes' ? 'is-active' : ''}`}
                            onClick={() => handleSelectTab('mistakes')}
                        >
                            Sổ tay câu sai
                        </button>

                        <button
                            type="button"
                            className={`pf-tab-item ${activeTab === 'security' ? 'is-active' : ''}`}
                            onClick={() => handleSelectTab('security')}
                        >
                            Bảo mật
                        </button>
                    </div>

                    {/* Nội dung từng tab theo lựa chọn hiện tại */}
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

                    {activeTab === 'mistakes' && (
                        <ProfileMistakesTab isActive={activeTab === 'mistakes'} />
                    )}

                    {activeTab === 'security' && (
                        <ProfileSecurityTab />
                    )}
                </main>
            </div>
        </div>
    );
}
