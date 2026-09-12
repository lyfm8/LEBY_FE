import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarNav } from '@/features/roadmap/components/SidebarNav';
import { ModuleTestHeader } from '../components/ModuleTestHeader';
import { ModuleQuestionCard } from '../components/ModuleQuestionCard';
import { ModuleQuestionPalette } from '../components/ModuleQuestionPalette';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { moduleTestService } from '../services/moduleTestService';
import type { ModuleTestData, TestOptionKey } from '../types/moduleTestTypes';
import '../module-test.css';

export default function ModuleTestRoomPage() {
    const { moduleId } = useParams<{ moduleId: string }>();
    const navigate = useNavigate();
    const [testData, setTestData] = useState<ModuleTestData | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(7); // Câu 8 như UI mẫu
    const [answers, setAnswers] = useState<Record<number, TestOptionKey | null>>({
        8: 'A',
    });
    const [flagged, setFlagged] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let isMounted = true;
        moduleTestService
            .getModuleTest(moduleId || '2')
            .then((res) => {
                if (isMounted && res.success && res.data) {
                    setTestData(res.data);

                    // Mock 14 câu đã làm khớp UI
                    setAnswers((prev) => {
                        const initial = { ...prev };
                        for (let i = 1; i <= 7; i++) {
                            initial[i] = 'B';
                        }
                        return initial;
                    });
                }
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [moduleId]);

    const currentQuestion = testData?.questions[currentIndex];
    const totalQuestions = testData?.totalQuestions || 25;
    const currentQNo = currentIndex + 1;
    const isCurrentFlagged = flagged.has(currentQNo);

    function handleSelectOption(key: TestOptionKey) {
        setAnswers((prev) => ({ ...prev, [currentQNo]: key }));
    }

    function handleToggleFlag() {
        setFlagged((prev) => {
            const next = new Set(prev);
            if (next.has(currentQNo)) next.delete(currentQNo);
            else next.add(currentQNo);
            return next;
        });
    }

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    }, []);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
    }, [totalQuestions]);

    async function handleSubmit() {
        if (!testData) return;
        setIsSubmitting(true);
        try {
            const formatted = testData.questions.map((q) => ({
                questionId: q.questionId,
                selectedOption: answers[q.orderNo] ?? null,
            }));

            const res = await moduleTestService.submitTest(testData.moduleId, {
                attemptId: 901,
                moduleId: testData.moduleId,
                durationSeconds: 900,
                answers: formatted,
            });

            if (res.success && res.data) {
                navigate(`/modules/${testData.moduleId}/test/result/${res.data.attemptId}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading || !testData || !currentQuestion) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <div className="mtest-loading">
                    <div className="mtest-spinner" />
                    <p>Đang chuẩn bị đề thi vượt ải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <SidebarNav />

            <main className="mtest-main">
                <div className="mtest-container">
                    <ModuleTestHeader
                        title={testData.moduleTitle}
                        topic={testData.topic}
                        currentQ={currentQNo}
                        totalQ={totalQuestions}
                        durationMinutes={testData.durationMinutes}
                        onTimeOut={handleSubmit}
                    />

                    <div className="mtest-body-grid">
                        <section className="mtest-content-col">
                            <ModuleQuestionCard
                                question={currentQuestion}
                                selectedOption={answers[currentQNo] ?? null}
                                passScore={testData.passScore}
                                targetScore={testData.currentAIM}
                                onSelectOption={handleSelectOption}
                            />

                            <footer className="mtest-action-bar">
                                <div className="mtest-action-bar__left">
                                    <button
                                        type="button"
                                        className="mtest-action-btn is-outline"
                                        onClick={handlePrev}
                                        disabled={currentIndex === 0}
                                    >
                                        <ChevronLeft size={16} />
                                        <span>Câu trước</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="mtest-action-btn is-outline"
                                        onClick={handleNext}
                                        disabled={currentIndex === totalQuestions - 1}
                                    >
                                        <span>Câu tiếp</span>
                                        <ChevronRight size={16} />
                                    </button>
                                </div>

                                <div className="mtest-action-bar__right">
                                    <button
                                        type="button"
                                        className={`mtest-action-btn is-flag ${isCurrentFlagged ? 'is-active' : ''}`}
                                        onClick={handleToggleFlag}
                                    >
                                        <Flag size={16} fill={isCurrentFlagged ? '#f59e0b' : 'none'} />
                                        <span>Đánh dấu xem lại</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="mtest-action-btn is-submit"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Đang chấm điểm...' : 'Nộp bài thi'}
                                    </button>
                                </div>
                            </footer>
                        </section>

                        <section className="mtest-sidebar-col">
                            <ModuleQuestionPalette
                                total={totalQuestions}
                                currentIndex={currentIndex}
                                answers={answers}
                                onSelectQuestion={setCurrentIndex}
                            />
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
