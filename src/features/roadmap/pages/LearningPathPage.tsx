import { useEffect, useState } from 'react';
import { SidebarNav } from '../components/SidebarNav';
import { ModuleTimelineItem } from '../components/ModuleTimelineItem';
import { roadmapService } from '../services/roadmapService';
import type { RoadmapData } from '../types/roadmapTypes';
import '../roadmap.css';

export default function LearningPathPage() {
    const [data, setData] = useState<RoadmapData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        roadmapService
            .getRoadmap()
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
                <div className="roadmap-loading">
                    <div className="roadmap-spinner" />
                    <p>Đang tải lộ trình học thích ứng...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <SidebarNav />

            <main className="roadmap-main">
                <div className="roadmap-container">
                    {/* Header Lộ trình */}
                    <header className="roadmap-header">
                        <div className="roadmap-header__left">
                            <h1 className="roadmap-header__title">Lộ trình học thích ứng của bạn</h1>
                            <p className="roadmap-header__desc">
                                AI tối ưu hóa lộ trình đạt mục tiêu dựa trên điểm yếu của bạn.
                            </p>
                        </div>

                        <div className="roadmap-header__right">
                            <div className="roadmap-header__aim-badge">
                                <span className="roadmap-header__aim-label">MỤC TIÊU ĐẶT RA</span>
                                <span className="roadmap-header__aim-val">AIM {data.targetScore}</span>
                            </div>

                            <div className="roadmap-header__progress-box">
                                <div className="roadmap-header__progress-text">
                                    <span>TIẾN ĐỘ LỘ TRÌNH</span>
                                    <strong>{data.progressPercent}% Hoàn thành</strong>
                                </div>
                                <div className="roadmap-header__progress-track">
                                    <div
                                        className="roadmap-header__progress-fill"
                                        style={{ width: `${data.progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Timeline các module */}
                    <div className="roadmap-timeline">
                        {data.modules.map((m, idx) => (
                            <ModuleTimelineItem
                                key={m.id}
                                item={m}
                                isLast={idx === data.modules.length - 1}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
