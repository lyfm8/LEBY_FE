import { Link } from 'react-router-dom';
import type { NextModuleItem } from '../types/dashboardTypes';

interface NextRoadmapCardProps {
    modules: NextModuleItem[];
}

export function NextRoadmapCard({ modules }: NextRoadmapCardProps) {
    return (
        <aside className="db-roadmap-card">
            <h3 className="db-roadmap-card__title">Lộ trình học tiếp theo</h3>
            <p className="db-roadmap-card__desc">AI tự động đề xuất dựa trên điểm yếu Part 4 & 7</p>

            <div className="db-roadmap-list">
                {modules.map((item) => {
                    const isNext = item.status === 'IN_PROGRESS';
                    const isUnlocked = item.status === 'UNLOCKED';

                    return (
                        <div
                            key={item.id}
                            className={`db-roadmap-item ${isNext ? 'is-next' : ''} ${item.status === 'LOCKED' ? 'is-locked' : ''}`}
                        >
                            <div className="db-roadmap-item__meta">
                                <span className={`db-roadmap-item__status-tag is-${item.status.toLowerCase()}`}>
                                    {item.statusLabel}
                                </span>
                                <span className="db-roadmap-item__section">{item.section}</span>
                            </div>

                            <h4 className="db-roadmap-item__title">{item.title}</h4>
                            <p className="db-roadmap-item__desc">{item.description}</p>

                            {isNext && (
                                <Link to={`/modules/${item.moduleId}`} className="db-roadmap-item__btn">
                                    Học ngay
                                </Link>
                            )}

                            {isUnlocked && (
                                <Link to={`/modules/${item.moduleId}`} className="db-roadmap-item__btn is-unlocked">
                                    Xem bài học
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}
