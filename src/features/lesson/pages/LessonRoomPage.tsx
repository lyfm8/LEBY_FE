import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, BookOpen, Video as VideoIcon } from 'lucide-react';
import { VideoPlayer } from '../components/VideoPlayer';
import { PracticeQuestionView } from '../components/PracticeQuestionView';
import { lessonService } from '../services/lessonService';
import type { LessonDetail } from '../types/lessonTypes';
import '../lesson.css';

export default function LessonRoomPage() {
    const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState<LessonDetail | null>(null);
    const [activeTab, setActiveTab] = useState<'video' | 'practice' | 'notes'>('video');
    const [isCompleted, setIsCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        lessonService
            .getLesson(moduleId || '2', lessonId || '3')
            .then((res) => {
                if (isMounted && res.success && res.data) {
                    setLesson(res.data);
                    setActiveTab(res.data.type === 'PRACTICE' ? 'practice' : 'video');
                }
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [moduleId, lessonId]);

    async function handleCompleteLesson() {
        if (!lesson) return;
        try {
            await lessonService.completeLesson(lesson.moduleId, lesson.id);
            setIsCompleted(true);
            if (lesson.nextLessonId) {
                navigate(`/modules/${lesson.moduleId}/lessons/${lesson.nextLessonId}`);
            } else {
                navigate(`/modules/${lesson.moduleId}`);
            }
        } catch {
            setIsCompleted(true);
        }
    }

    if (isLoading || !lesson) {
        return (
            <div className="lesson-loading">
                <div className="lesson-spinner" />
                <p>Đang tải bài giảng bài bản...</p>
            </div>
        );
    }

    return (
        <div className="lesson-page">
            {/* Header phòng học */}
            <header className="lesson-header">
                <div className="lesson-header__left">
                    <Link to={`/modules/${lesson.moduleId}`} className="lesson-back-btn">
                        <ChevronLeft size={20} />
                        <span>Quay lại Module</span>
                    </Link>

                    <div className="lesson-header__title-wrap">
                        <span className="lesson-header__mod-name">{lesson.moduleTitle}</span>
                        <h1 className="lesson-header__title">{lesson.title}</h1>
                    </div>
                </div>

                <div className="lesson-header__right">
                    <Link
                        to={`/modules/${lesson.moduleId}/test`}
                        className="lesson-test-direct-btn"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '9px 18px',
                            background: '#ea580c',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            marginRight: '10px'
                        }}
                    >
                        Làm bài kiểm tra vượt ải Module →
                    </Link>
                    <button
                        type="button"
                        className={`lesson-complete-btn ${isCompleted ? 'is-done' : ''}`}
                        onClick={handleCompleteLesson}
                    >
                        <Check size={16} strokeWidth={3} />
                        <span>{isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}</span>
                    </button>
                </div>
            </header>

            {/* Layout nội dung phòng học */}
            <main className="lesson-body">
                <div className="lesson-main-content">
                    {/* Tabs chuyển đổi */}
                    <div className="lesson-tabs">
                        <button
                            type="button"
                            className={`lesson-tab-btn ${activeTab === 'video' ? 'is-active' : ''}`}
                            onClick={() => setActiveTab('video')}
                        >
                            <VideoIcon size={18} />
                            <span>Video bài giảng</span>
                        </button>

                        <button
                            type="button"
                            className={`lesson-tab-btn ${activeTab === 'practice' ? 'is-active' : ''}`}
                            onClick={() => setActiveTab('practice')}
                        >
                            <BookOpen size={18} />
                            <span>Bài tập thực hành ({lesson.practiceQuestions?.length ?? 2})</span>
                        </button>
                    </div>

                    {/* Tab View Video */}
                    {activeTab === 'video' && (
                        <div className="lesson-video-box">
                            <VideoPlayer src={lesson.videoUrl} title={lesson.title} />

                            <div className="lesson-notes-card">
                                <h3 className="lesson-notes-card__title">Ghi chú & Lý thuyết trọng tâm</h3>
                                <p className="lesson-notes-card__desc">{lesson.description}</p>
                                <div className="lesson-notes-card__tip">
                                    💡 <strong>Mẹo làm bài:</strong> {lesson.instructions}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab View Practice */}
                    {activeTab === 'practice' && (
                        <PracticeQuestionView questions={lesson.practiceQuestions || []} />
                    )}
                </div>
            </main>
        </div>
    );
}
