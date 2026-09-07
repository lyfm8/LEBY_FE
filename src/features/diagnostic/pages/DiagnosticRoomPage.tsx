import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { DiagnosticHeader } from '../components/DiagnosticHeader';
import { AudioPlayer } from '../components/AudioPlayer';
import { QuestionCard } from '../components/QuestionCard';
import { QuestionPalette } from '../components/QuestionPalette';
import { SubmitModal } from '../components/SubmitModal';
import { diagnosticService } from '../services/diagnosticService';
import type { DiagnosticTest, OptionKey } from '../types/diagnosticTypes';
import '../diagnostic.css';

export default function DiagnosticRoomPage() {
    const navigate = useNavigate();
    const [test, setTest] = useState<DiagnosticTest | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(14);
    const [answers, setAnswers] = useState<Record<number, OptionKey | null>>({
        15: 'C',
    });
    const [flagged, setFlagged] = useState<Set<number>>(new Set([12, 16]));
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        let isMounted = true;
        diagnosticService
            .getComprehensiveTest()
            .then((res) => {
                if (isMounted && res.success && res.data) {
                    setTest(res.data);

                    setAnswers((prev) => {
                        const initial = { ...prev };
                        for (let i = 1; i <= 14; i++) {
                            if (!initial[i]) {
                                initial[i] = (['A', 'B', 'C', 'D'][(i * 3) % 4] as OptionKey) || 'B';
                            }
                        }
                        return initial;
                    });
                }
            })
            .catch(() => {
                if (isMounted) setError('Không thể tải bài thi chẩn đoán. Vui lòng tải lại trang.');
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const currentQuestion = test?.questions[currentIndex];
    const totalQuestions = test?.totalQuestions || 100;
    const currentQNo = currentIndex + 1;
    const isCurrentFlagged = flagged.has(currentQNo);

    function handleSelectOption(opt: OptionKey) {
        setAnswers((prev) => ({
            ...prev,
            [currentQNo]: opt,
        }));
    }

    function handleToggleFlag() {
        setFlagged((prev) => {
            const next = new Set(prev);
            if (next.has(currentQNo)) {
                next.delete(currentQNo);
            } else {
                next.add(currentQNo);
            }
            return next;
        });
    }

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
    }, []);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
    }, [totalQuestions]);

    async function handleConfirmSubmit() {
        if (!test) return;
        setIsSubmitting(true);
        setError('');

        try {
            const formattedAnswers = test.questions.map((q) => ({
                questionId: q.questionId,
                selectedOption: answers[q.orderNo] ?? null,
                isFlagged: flagged.has(q.orderNo),
            }));

            const res = await diagnosticService.submitTest({
                attemptId: test.attemptId,
                durationSeconds: 2100,
                answers: formattedAnswers,
            });

            if (res.success && res.data) {
                navigate(`/diagnostic/results/${res.data.attemptId}`);
            } else {
                setError(res.message || 'Lỗi khi nộp bài.');
                setIsModalOpen(false);
            }
        } catch {
            setError('Đã xảy ra lỗi nộp bài. Vui lòng thử lại.');
            setIsModalOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <div className="diag-loading-page">
                <div className="diag-spinner" />
                <p>Đang chuẩn bị đề thi chẩn đoán toàn diện...</p>
            </div>
        );
    }

    if (!test || !currentQuestion) {
        return (
            <div className="diag-error-page">
                <p>{error || 'Không tìm thấy dữ liệu bài thi.'}</p>
            </div>
        );
    }

    return (
        <div className="diag-room-page">
            <DiagnosticHeader
                title={test.title}
                currentQuestion={currentQNo}
                totalQuestions={totalQuestions}
                durationMinutes={test.durationMinutes}
                onTimeOut={() => setIsModalOpen(true)}
            />

            <main className="diag-room-layout">
                <section className="diag-main-column">
                    {currentQuestion.section === 'LISTENING' && (
                        <AudioPlayer src={currentQuestion.audioUrl} />
                    )}

                    <QuestionCard
                        question={currentQuestion}
                        selectedOption={answers[currentQNo] ?? null}
                        onSelectOption={handleSelectOption}
                    />

                    <footer className="diag-action-bar">
                        <div className="diag-action-bar__left">
                            <button
                                type="button"
                                className="diag-action-btn is-outline"
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                            >
                                <ChevronLeft size={16} />
                                <span>Câu trước</span>
                            </button>

                            <button
                                type="button"
                                className="diag-action-btn is-outline"
                                onClick={handleNext}
                                disabled={currentIndex === totalQuestions - 1}
                            >
                                <span>Câu tiếp</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="diag-action-bar__right">
                            <button
                                type="button"
                                className={`diag-action-btn is-flag ${isCurrentFlagged ? 'is-active' : ''}`}
                                onClick={handleToggleFlag}
                            >
                                <Flag size={16} fill={isCurrentFlagged ? '#f59e0b' : 'none'} />
                                <span>Đánh dấu</span>
                            </button>

                            <button
                                type="button"
                                className="diag-action-btn is-submit"
                                onClick={() => setIsModalOpen(true)}
                            >
                                Nộp bài
                            </button>
                        </div>
                    </footer>
                </section>

                <section className="diag-sidebar-column">
                    <QuestionPalette
                        total={totalQuestions}
                        currentIndex={currentIndex}
                        answers={answers}
                        flagged={flagged}
                        onSelectQuestion={setCurrentIndex}
                    />
                </section>
            </main>

            <SubmitModal
                isOpen={isModalOpen}
                totalQuestions={totalQuestions}
                answeredCount={Object.values(answers).filter((v) => v !== null).length}
                flaggedCount={flagged.size}
                isSubmitting={isSubmitting}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmSubmit}
            />
        </div>
    );
}
