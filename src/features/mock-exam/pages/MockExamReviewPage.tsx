import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, Lock, RefreshCw } from 'lucide-react';
import { ExamAudioPlayer } from '@/shared/exam/components/ExamAudioPlayer';
import { ExamHeader } from '@/shared/exam/components/ExamHeader';
import { ExamQuestionCard } from '@/shared/exam/components/ExamQuestionCard';
import { ExamQuestionPalette } from '@/shared/exam/components/ExamQuestionPalette';
import { useMockExamReview } from '../hooks/useMockExamReview';
import '../mock-exam.css';

// Trang Xem lại chi tiết 200 câu hỏi, đáp án đúng và giải thích sau khi nộp bài thi thử ETS (BR14)
export default function MockExamReviewPage() {
    // Hook điều hướng quay về báo cáo hoặc sảnh thi thử
    const navigate = useNavigate();
    // Lấy attemptId lượt thi cần xem lại từ URL
    const { attemptId } = useParams<{ attemptId: string }>();

    // Kết nối hook lấy dữ liệu 200 câu hỏi kèm lời giải và quản lý bước điều hướng
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
        isReviewLocked,
        questionLabel,
        firstOrderNo,
        reportRoute,
        isPrevDisabled,
        isNextDisabled,
        retryLoad,
        togglePaletteCollapse,
        handleToggleFlag,
        handlePrevStep,
        handleNextStep,
        handleSelectQuestion,
    } = useMockExamReview(attemptId);

    // Điều hướng trở về trang Báo cáo kết quả hoặc Kết quả luyện tập tương ứng
    const handleBackToReport = () => {
        navigate(reportRoute);
    };

    // Màn hình chờ tải dữ liệu xem lại 200 câu
    if (isLoading) {
        return (
            <div className="diag-state-page">
                <div className="diag-spinner" />
                <p>Đang tải chi tiết 200 câu hỏi và lời giải bài thi thử ETS...</p>
            </div>
        );
    }

    // Màn hình lỗi hoặc bị khóa khi chưa đạt mục tiêu AIM ở bài thi đầu ra
    if (errorMessage || !reviewData || !currentStep) {
        return (
            <div className="diag-state-page">
                <div className="diag-state-card">
                    <div className="diag-state-card__icon">
                        {isReviewLocked ? (
                            <Lock size={28} color="#ea580c" />
                        ) : (
                            <AlertTriangle size={28} color="#dc2626" />
                        )}
                    </div>
                    <h2 className="diag-state-card__title">
                        {isReviewLocked
                            ? 'Chưa đạt AIM — Không thể xem lời giải'
                            : 'Không thể mở chế độ xem lại'}
                    </h2>
                    <p className="diag-state-card__desc">
                        {errorMessage ?? 'Không tìm thấy dữ liệu bài thi thử cho lượt làm này.'}
                    </p>
                    <div className="diag-state-card__actions">
                        <button
                            type="button"
                            className="diag-action-btn is-submit"
                            onClick={handleBackToReport}
                        >
                            <ArrowLeft size={16} />
                            <span>Quay lại báo cáo</span>
                        </button>
                        {isReviewLocked ? (
                            <Link to="/learning-path" className="diag-action-btn is-outline">
                                <span>Về lộ trình học</span>
                            </Link>
                        ) : (
                            <button
                                type="button"
                                className="diag-action-btn is-outline"
                                onClick={() => void retryLoad()}
                            >
                                <RefreshCw size={16} />
                                <span>Thử lại</span>
                            </button>
                        )}
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
                title={reviewData.testTitle}
                subtitle={
                    reviewData.examTag === 'OUTPUT'
                        ? 'Xem lại bài thi đầu ra chuẩn ETS'
                        : 'Xem lại bài luyện tập ETS'
                }
                currentQuestion={firstOrderNo}
                totalQuestions={reviewData.totalQuestions}
                questionLabel={questionLabel}
                reviewScoreLabel={`Đúng ${reviewData.correctCount}/${reviewData.totalQuestions}`}
                onBackToReport={handleBackToReport}
            />

            <main className={`diag-room-layout ${isPaletteCollapsed ? 'is-palette-collapsed' : ''}`}>
                <section className="diag-main-column">
                    {/* Cho phép nghe lại và tua tốc độ tự do ở chế độ xem lại bài (BR14) */}
                    {currentStep.audioUrl && (
                        <ExamAudioPlayer
                            stepKey={`mock_review_${currentStep.audioKey ?? currentStep.stepIndex}`}
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

                    <footer className="diag-action-bar">
                        <div className="diag-action-bar__left">
                            <button
                                type="button"
                                className="diag-action-btn is-outline"
                                onClick={handlePrevStep}
                                disabled={isPrevDisabled}
                            >
                                <ChevronLeft size={16} />
                                <span>Câu trước</span>
                            </button>

                            <button
                                type="button"
                                className="diag-action-btn is-outline"
                                onClick={handleNextStep}
                                disabled={isNextDisabled}
                            >
                                <span>Câu tiếp</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="diag-action-bar__right">
                            <button
                                type="button"
                                className="diag-action-btn is-outline"
                                onClick={handleBackToReport}
                            >
                                Quay lại báo cáo
                            </button>
                        </div>
                    </footer>
                </section>

                {/* Bảng câu hỏi phân nhóm rõ từng Part 1-7 để học viên dễ nhảy tới câu sai theo Part */}
                <section className="diag-sidebar-column">
                    <ExamQuestionPalette
                        questions={reviewData.questions}
                        activeOrderNos={activeOrderNos}
                        answers={answers}
                        flagged={flagged}
                        isCollapsed={isPaletteCollapsed}
                        isListeningCompleted={true}
                        mode="REVIEW"
                        isReviewMode={true}
                        groupByPart={true}
                        reviewStatusMap={reviewStatusMap}
                        onToggleCollapse={togglePaletteCollapse}
                        onSelectQuestion={handleSelectQuestion}
                    />
                </section>
            </main>
        </div>
    );
}
