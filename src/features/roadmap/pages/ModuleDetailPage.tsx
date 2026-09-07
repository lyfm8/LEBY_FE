import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SidebarNav } from '../components/SidebarNav';
import { Video, BookOpen, Check, Lock, ChevronRight, Flag } from 'lucide-react';
import { roadmapService } from '../services/roadmapService';
import type { ModuleDetailData } from '../types/roadmapTypes';
import '../roadmap.css';

export default function ModuleDetailPage() {
    const { moduleId } = useParams<{ moduleId: string }>();
    const [data, setData] = useState<ModuleDetailData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        roadmapService
            .getModuleDetail(moduleId || '2')
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
    }, [moduleId]);

    if (isLoading || !data) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <div className="roadmap-loading">
                    <div className="roadmap-spinner" />
                    <p>Đang tải chi tiết Module...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <SidebarNav />

            <main className="roadmap-main">
                <div className="module-detail-container">
                    {/* Hero Card tối màu */}
                    <section className="module-hero-card">
                        <nav className="module-breadcrumb">
                            <Link to="/learning-path">Lộ trình</Link>
                            <ChevronRight size={14} />
                            <span>Module {data.moduleId}</span>
                        </nav>

                        <div className="module-hero-card__header">
                            <h1 className="module-hero-card__title">{data.title}</h1>
                            <span className={`module-hero-card__badge is-${data.status.toLowerCase()}`}>
                                {data.statusLabel}
                            </span>
                        </div>

                        <p className="module-hero-card__desc">{data.description}</p>

                        <div className="module-hero-card__progress-wrap">
                            <span className="module-hero-card__progress-label">
                                Tiến độ Module: {data.completedLessons} / {data.totalLessons} bài học hoàn thành
                            </span>
                            <div className="module-hero-card__progress-track">
                                <div
                                    className="module-hero-card__progress-fill"
                                    style={{ width: `${data.progressPercent}%` }}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Danh sách bài học */}
                    <section className="module-lessons-section">
                        <h2 className="module-lessons-section__title">
                            Danh sách bài giảng & bài tập thực hành
                        </h2>

                        <div className="module-lessons-list">
                            {data.lessons.map((lesson) => {
                                const isCurrent = !lesson.isCompleted && !lesson.isLocked;

                                return (
                                    <div
                                        key={lesson.id}
                                        className={`module-lesson-item ${lesson.isCompleted ? 'is-completed' : ''} ${isCurrent ? 'is-current' : ''} ${lesson.isLocked ? 'is-locked' : ''}`}
                                    >
                                        <div className="module-lesson-item__left">
                                            <div className="module-lesson-item__icon-box">
                                                {lesson.type === 'VIDEO' ? (
                                                    <Video size={20} />
                                                ) : (
                                                    <BookOpen size={20} />
                                                )}
                                            </div>

                                            <div className="module-lesson-item__info">
                                                <h3 className="module-lesson-item__title">{lesson.title}</h3>
                                                <span className="module-lesson-item__meta">
                                                    {lesson.type === 'VIDEO' ? 'Video giảng dạy' : 'Luyện tập thích ứng'} •{' '}
                                                    {lesson.durationText}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="module-lesson-item__right">
                                            {lesson.isCompleted && (
                                                <div className="module-lesson-item__check">
                                                    <Check size={18} strokeWidth={3} />
                                                </div>
                                            )}

                                            {isCurrent && (
                                                <Link
                                                    to={`/modules/${data.moduleId}/lessons/${lesson.id}`}
                                                    className="module-lesson-item__start-btn"
                                                >
                                                    Học ngay
                                                </Link>
                                            )}

                                            {lesson.isLocked && (
                                                <div className="module-lesson-item__lock">
                                                    <Lock size={18} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Khối Bài kiểm tra Module */}
                    <section className="module-test-card">
                        <div className="module-test-card__header">
                            <div className="module-test-card__title-row">
                                <Flag size={20} className="module-test-card__flag-icon" />
                                <h3 className="module-test-card__title">{data.moduleTest.title}</h3>
                            </div>

                            <span className="module-test-card__badge">
                                {data.moduleTest.isUnlocked ? 'SẴN SÀNG' : 'ĐANG KHÓA'}
                            </span>
                        </div>

                        <p className="module-test-card__desc">{data.moduleTest.description}</p>

                        <div className="module-test-card__footer">
                            <div className="module-test-card__req">
                                🎯 Cần đạt {data.moduleTest.passScore} điểm để mở khóa Module tiếp theo — Mục tiêu AIM {data.moduleTest.targetScore}
                            </div>

                            {data.moduleTest.isUnlocked ? (
                                <Link
                                    to={`/modules/${data.moduleId}/test`}
                                    className="module-test-card__btn is-active"
                                >
                                    Bắt đầu kiểm tra
                                </Link>
                            ) : (
                                <button type="button" className="module-test-card__btn" disabled>
                                    Chưa mở khóa
                                </button>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
