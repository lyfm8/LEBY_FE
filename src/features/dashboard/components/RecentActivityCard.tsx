import { CheckCircle2, PlayCircle, Zap } from 'lucide-react';
import type { RecentActivity } from '../types/dashboardTypes';

interface RecentActivityCardProps {
    activities: RecentActivity[];
}

export function RecentActivityCard({ activities }: RecentActivityCardProps) {
    function renderTypeIcon(type: 'PRACTICE' | 'VIDEO' | 'TEST') {
        switch (type) {
            case 'PRACTICE':
                return <CheckCircle2 size={20} className="act-item__icon is-practice" />;
            case 'VIDEO':
                return <PlayCircle size={20} className="act-item__icon is-video" />;
            case 'TEST':
                return <Zap size={20} className="act-item__icon is-test" />;
        }
    }

    return (
        <div className="db-card db-card--activity">
            <h3 className="db-card__title">Lịch sử hoạt động gần đây</h3>

            <div className="act-list">
                {activities.map((act) => (
                    <div key={act.id} className="act-item">
                        {renderTypeIcon(act.type)}
                        <div className="act-item__content">
                            <h4 className="act-item__title">{act.title}</h4>
                            <p className="act-item__subtitle">{act.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
