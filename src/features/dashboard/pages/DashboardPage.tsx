import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SidebarNav } from '@/features/roadmap/components/SidebarNav';
import { StatCard } from '../components/StatCard';
import { PartEvaluationCard } from '../components/PartEvaluationCard';
import { RecentActivityCard } from '../components/RecentActivityCard';
import { NextRoadmapCard } from '../components/NextRoadmapCard';
import { dashboardService } from '../services/dashboardService';
import type { DashboardSummary } from '../types/dashboardTypes';
import '../dashboard.css';

export default function DashboardPage() {
    const [data, setData] = useState<DashboardSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        dashboardService
            .getSummary()
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

    if (isLoading || !data) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <div className="db-loading" style={{ flex: 1 }}>
                    <div className="db-spinner" />
                    <p>Đang tải không gian học tập cá nhân hóa...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <SidebarNav />

            <div className="app-main-viewport" style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
                {/* ── Top Bar inside Dashboard ── */}
                <header className="db-sub-header">
                    <div className="db-sub-header__left">
                        <span className="db-sub-header__welcome">Chào mừng trở lại,</span>
                        <h2 className="db-sub-header__name">{data.user.fullName} 👋</h2>
                    </div>

                    <div className="db-sub-header__right">
                        <Link to="/target-selection" className="db-sub-target-btn" title="Bấm để điều chỉnh mục tiêu">
                            🎯 Mục tiêu: {data.user.targetScore} TOEIC
                        </Link>
                        <Link to="/learning-path" className="db-sub-roadmap-btn">
                            Xem lộ trình →
                        </Link>
                    </div>
                </header>

                <main className="db-container" style={{ padding: '24px 36px' }}>
                    {/* ── 4 Stat Cards ── */}
                    <section className="db-stats-grid">
                        <StatCard
                            type="score"
                            title="Điểm dự đoán hiện tại"
                            value={data.stats.predictedScore}
                            subtext={`Tăng +${data.stats.scoreDiff} so với tuần trước`}
                        />
                        <StatCard
                            type="streak"
                            title="Streak ngày học"
                            value={`${data.stats.streakDays} ngày`}
                            subtext="Mục tiêu tuần: 5 buổi"
                        />
                        <StatCard
                            type="time"
                            title="Thời gian học tuần này"
                            value={`${data.stats.weeklyHours} giờ`}
                            subtext="Hoàn thành 75% chỉ tiêu"
                        />
                        <StatCard
                            type="modules"
                            title="Modules hoàn thành"
                            value={`${data.stats.completedModules} / ${data.stats.totalModules}`}
                            subtext="Lộ trình chính khóa"
                            extra={Math.round((data.stats.completedModules / data.stats.totalModules) * 100)}
                        />
                    </section>

                    {/* ── Main 2 Columns ── */}
                    <div className="db-content-grid">
                        <div className="db-content-left">
                            <PartEvaluationCard parts={data.partEvaluations} />
                            <RecentActivityCard activities={data.recentActivities} />
                        </div>

                        <div className="db-content-right">
                            <NextRoadmapCard modules={data.nextModules} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
