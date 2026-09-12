import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SidebarNav } from '@/features/roadmap/components/SidebarNav';
import { CheckCircle2, XCircle, Award, ArrowRight } from 'lucide-react';
import { moduleTestService } from '../services/moduleTestService';
import type { ModuleTestResult } from '../types/moduleTestTypes';
import '../module-test.css';

export default function ModuleTestReviewPage() {
    const { moduleId, attemptId } = useParams<{ moduleId: string; attemptId: string }>();
    const [result, setResult] = useState<ModuleTestResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        moduleTestService
            .getTestReview(moduleId || '2', attemptId || '901')
            .then((res) => {
                if (isMounted && res.success && res.data) {
                    setResult(res.data);
                }
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [moduleId, attemptId]);

    if (isLoading || !result) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <div className="mtest-loading">
                    <div className="mtest-spinner" />
                    <p>Đang tải chi tiết kết quả và lời giải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <SidebarNav />

            <main className="mtest-main">
                <div className="mtest-container">
                    {/* Hero Result Banner */}
                    <div className="mtest-review-banner">
                        <div className="mtest-review-banner__left">
                            <div className="mtest-review-banner__score-box">
                                <Award size={36} color="#ea580c" />
                                <div>
                                    <span className="mtest-review-banner__label">ĐIỂM SỐ ĐẠT ĐƯỢC</span>
                                    <h1 className="mtest-review-banner__score">{result.score}/100</h1>
                                </div>
                            </div>

                            <div className="mtest-review-banner__status">
                                {result.isPassed ? (
                                    <span className="mtest-review-badge is-pass">
                                        ĐÃ VƯỢT QUA (PASS) — YÊU CẦU: {result.passScore} ĐIỂM
                                    </span>
                                ) : (
                                    <span className="mtest-review-badge is-fail">
                                        CHƯA ĐẠT (FAIL) — CẦN ĐẠT {result.passScore} ĐIỂM
                                    </span>
                                )}
                                <p className="mtest-review-banner__note">
                                    Đã trả lời đúng {result.correctCount}/{result.totalQuestions} câu hỏi.
                                    {result.isPassed && ' Chúc mừng bạn đã mở khóa Module tiếp theo!'}
                                </p>
                            </div>
                        </div>

                        <Link to="/learning-path" className="mtest-review-btn">
                            <span>Về Lộ trình học</span>
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    {/* Chi tiết từng câu hỏi */}
                    <section className="mtest-review-list">
                        <h2 className="mtest-review-list__title">Chi tiết câu hỏi & Lời giải bài bản</h2>

                        {result.detailedAnswers.map((ans) => (
                            <div key={ans.questionId} className="mtest-review-item">
                                <div className="mtest-review-item__header">
                                    <h3 className="mtest-review-item__title">
                                        Câu {ans.orderNo}: {ans.questionTitle}
                                    </h3>
                                    {ans.isCorrect ? (
                                        <span className="mtest-answer-tag is-correct">
                                            <CheckCircle2 size={16} /> Đúng (+4 điểm)
                                        </span>
                                    ) : (
                                        <span className="mtest-answer-tag is-wrong">
                                            <XCircle size={16} /> Chưa đúng
                                        </span>
                                    )}
                                </div>

                                <div className="mtest-review-options">
                                    {ans.options.map((opt) => {
                                        const isUserChosen = ans.selectedOption === opt.key;
                                        const isSystemCorrect = ans.correctOption === opt.key;

                                        let optClass = '';
                                        if (isSystemCorrect) optClass = 'is-correct-target';
                                        if (isUserChosen && !isSystemCorrect) optClass = 'is-user-wrong';

                                        return (
                                            <div key={opt.key} className={`mtest-review-opt ${optClass}`}>
                                                <span className="mtest-review-opt__key">{opt.key}</span>
                                                <span className="mtest-review-opt__text">{opt.text}</span>
                                                {isUserChosen && <span className="mtest-review-opt__label">(Bạn chọn)</span>}
                                                {isSystemCorrect && <span className="mtest-review-opt__label is-correct">(Đáp án đúng)</span>}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mtest-review-explain">
                                    <strong>💡 Giải thích chi tiết:</strong> {ans.explanation}
                                </div>
                            </div>
                        ))}
                    </section>
                </div>
            </main>
        </div>
    );
}
