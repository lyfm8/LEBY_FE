import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { ExamAudioPlayer } from '../../../shared/exam/components/ExamAudioPlayer';
import { ExamHeader } from '../../../shared/exam/components/ExamHeader';
import { ExamQuestionCard } from '../../../shared/exam/components/ExamQuestionCard';
import { ExamQuestionPalette } from '../../../shared/exam/components/ExamQuestionPalette';
import { useModuleTestReview } from '../hooks/useModuleTestReview';
import '../module-test.css';

/**
 * Trang Xem lại chi tiết từng câu hỏi sau khi nộp bài kiểm tra vượt ải (UC14 Luồng 6a):
 * Giao diện & trải nghiệm đồng nhất hoàn toàn với DiagnosticReviewPage.
 */
export default function ModuleTestReviewPage() {
    const navigate = useNavigate();
    const { moduleId, attemptId } = useParams<{ moduleId: string; attemptId: string }>();

    const {
        reviewData,
        currentStep,
        focusedOrderNo,
        answers,
        flagged,
        activeOrderNos,
        reviewQuestionMap,
        reviewStatusMap,
        isPaletteCollapsed,
        isLoading,
        errorMessage,
        questionLabel,
        firstOrderNo,
        isPrevDisabled,
        isNextDisabled,
        retryLoad,
        togglePaletteCollapse,
        handleToggleFlag,
        handlePrevStep,
        handleNextStep,
        handleSelectQuestion,
    } = useModuleTestReview(moduleId, attemptId);

    const handleBackToReport = () => {
        if (moduleId && attemptId) {
            navigate(`/modules/${moduleId}/test/result/${attemptId}`);
            return;
        }
        navigate('/learning-path');
    };

    if (isLoading) {
        return (
            <div className="diag-state-page">
                <div className="diag-spinner" />
                <p>Đang tải chi tiết bài kiểm tra và giải thích từng câu...</p>
            </div>
        );
    }

    if (errorMessage || !reviewData || !currentStep) {
        return (
            <div className="diag-state-page">
                <div className="diag-state-card">
                    <div className="diag-state-card__icon">
                        <AlertTriangle size={28} color="#dc2626" />
                    </div>
                    <h2 className="diag-state-card__title">Không thể mở chế độ xem lại</h2>
                    <p className="diag-state-card__desc">
                        {errorMessage ?? 'Không tìm thấy dữ liệu câu hỏi cho lượt thi này.'}
                    </p>
                    <div className="diag-state-card__actions">
                        <button
                            type="button"
                            className="diag-nav-btn is-prev"
                            onClick={handleBackToReport}
                        >
                            <ArrowLeft size={16} />
                            <span>Quay lại báo cáo</span>
                        </button>
                        <button
                            type="button"
                            className="diag-nav-btn is-next"
                            onClick={() => void retryLoad()}
                        >
                            <RefreshCw size={16} />
                            <span>Thử lại</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="diag-room-page">
            <ExamHeader
                mode="REVIEW"
                isReviewMode={true}
                title={reviewData.testTitle || `Xem lại: ${reviewData.moduleTitle}`}
                subtitle={`${reviewData.score}/100 điểm (${
                    reviewData.isPassed ? 'Đạt' : 'Chưa đạt'
                })`}
                currentQuestion={firstOrderNo}
                totalQuestions={reviewData.totalQuestions}
                questionLabel={questionLabel}
                reviewScoreLabel={`Đúng ${reviewData.correctCount}/${reviewData.totalQuestions}`}
                onBackToReport={handleBackToReport}
            />

            <div
                className={`diag-room-layout ${isPaletteCollapsed ? 'is-palette-collapsed' : ''}`}
            >
                <main className="diag-room-main">
                    <div className="diag-question-area">
                        {currentStep.audioUrl && (
                            <ExamAudioPlayer
                                stepKey={`review_${currentStep.audioKey ?? currentStep.stepIndex}`}
                                src={currentStep.audioUrl}
                                policy="UNLIMITED"
                                allowSpeedControl={true}
                                isLocked={false}
                                isReviewMode={true}
                                onAudioEnded={() => undefined}
                            />
                        )}

                        <ExamQuestionCard
                            step={currentStep}
                            answers={answers}
                            flagged={flagged}
                            focusedOrderNo={focusedOrderNo}
                            mode="REVIEW"
                            isReviewMode={true}
                            reviewQuestionMap={reviewQuestionMap}
                            onToggleFlag={handleToggleFlag}
                        />

                        <footer className="diag-bottom-nav">
                            <button
                                type="button"
                                className="diag-nav-btn is-prev"
                                onClick={handlePrevStep}
                                disabled={isPrevDisabled}
                            >
                                <ChevronLeft size={18} />
                                <span>Câu trước</span>
                            </button>

                            <button
                                type="button"
                                className="diag-nav-btn is-next"
                                onClick={handleNextStep}
                                disabled={isNextDisabled}
                            >
                                <span>Câu tiếp theo</span>
                                <ChevronRight size={18} />
                            </button>
                        </footer>
                    </div>
                </main>

                <aside className="diag-room-sidebar">
                    <ExamQuestionPalette
                        questions={reviewData.questions}
                        activeOrderNos={activeOrderNos}
                        answers={answers}
                        flagged={flagged}
                        isCollapsed={isPaletteCollapsed}
                        isListeningCompleted={true}
                        mode="REVIEW"
                        isReviewMode={true}
                        reviewStatusMap={reviewStatusMap}
                        onToggleCollapse={togglePaletteCollapse}
                        onSelectQuestion={handleSelectQuestion}
                    />
                </aside>
            </div>
        </div>
    );
}
