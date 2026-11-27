import { Link, useParams } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowLeft,
    BarChart3,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Lock,
    RefreshCw,
} from 'lucide-react';
import { ExamAudioPlayer } from '../../../shared/exam/components/ExamAudioPlayer';
import { ExamHeader } from '../../../shared/exam/components/ExamHeader';
import { ExamQuestionCard } from '../../../shared/exam/components/ExamQuestionCard';
import { ExamQuestionPalette } from '../../../shared/exam/components/ExamQuestionPalette';
import { PracticeSummaryView } from '../components/PracticeSummaryView';
import { usePracticeRoom } from '../hooks/usePracticeRoom';
import '../practice.css';

/**
 * Phòng luyện tập bài thực hành theo mô-đun (UC12):
 * - Nghe không giới hạn số lần, hỗ trợ tua và tốc độ 0.8x / 1.0x / 1.2x (BR08).
 * - Di chuyển tự do giữa các câu, bấm "Kiểm tra đáp án" để xem đúng/sai và giải thích tức thì.
 * - Hỗ trợ đánh dấu câu hỏi cần ôn lại và tổng kết phiên luyện tập (Luồng 7 & 8a).
 */
export function PracticeRoomPage() {
    const { moduleId, lessonId } = useParams<{ moduleId?: string; lessonId: string }>();

    const {
        data,
        currentStep,
        focusedOrderNo,
        answers,
        revealedOrderNos,
        flagged,
        activeOrderNos,
        reviewQuestionMap,
        reviewStatusMap,
        isPaletteCollapsed,
        showSummary,
        isLoading,
        errorState,
        questionLabel,
        firstOrderNo,
        isPrevDisabled,
        isLastStep,
        togglePaletteCollapse,
        openSummary,
        closeSummary,
        retryLoad,
        handleSelectOption,
        handleCheckAnswer,
        handleToggleFlag,
        handlePrevStep,
        handleNextStep,
        handleSelectQuestionFromPalette,
        handleResetPractice,
    } = usePracticeRoom(lessonId);

    const resolvedModuleId = moduleId ?? (data?.moduleId ? String(data.moduleId) : undefined);
    const backToModuleUrl = resolvedModuleId ? `/modules/${resolvedModuleId}` : '/roadmap';

    if (isLoading) {
        return (
            <div className="diag-state-page">
                <div className="diag-spinner" />
                <p>Đang tải nội dung bài luyện tập...</p>
            </div>
        );
    }

    if (errorState) {
        const isLocked = errorState.kind === 'FORBIDDEN';
        return (
            <div className="diag-state-page">
                <div className="diag-state-card">
                    <div className="diag-state-card__icon">
                        {isLocked ? (
                            <Lock size={28} color="#ea580c" />
                        ) : (
                            <AlertTriangle size={28} color="#dc2626" />
                        )}
                    </div>
                    <h2 className="diag-state-card__title">
                        {isLocked
                            ? 'Bài luyện tập đang tạm khóa'
                            : 'Không thể mở phòng luyện tập'}
                    </h2>
                    <p className="diag-state-card__desc">{errorState.message}</p>
                    <div className="diag-state-card__actions">
                        <Link to={backToModuleUrl} className="diag-nav-btn is-prev">
                            <ArrowLeft size={16} />
                            <span>Quay lại mô-đun</span>
                        </Link>
                        {!isLocked && (
                            <button
                                type="button"
                                className="diag-nav-btn is-next"
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

    // UC12 Ngoại lệ 2a: Bài PRACTICE chưa có câu hỏi nào được gán
    if (!data || data.isEmpty || data.questions.length === 0 || !currentStep) {
        return (
            <div className="diag-state-page">
                <div className="diag-state-card">
                    <div className="diag-state-card__icon practice-empty-icon">
                        <BookOpen size={28} color="#2563eb" />
                    </div>
                    <h2 className="diag-state-card__title">
                        {data?.lessonTitle ?? 'Bài tập đang được cập nhật'}
                    </h2>
                    <p className="diag-state-card__desc">
                        Bài tập này đang được cập nhật câu hỏi. Vui lòng quay lại sau.
                    </p>
                    <div className="diag-state-card__actions">
                        <Link to={backToModuleUrl} className="diag-nav-btn is-next">
                            <ArrowLeft size={16} />
                            <span>Quay lại mô-đun</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="diag-room-page">
            <ExamHeader
                mode="PRACTICE"
                title={data.lessonTitle}
                subtitle={`${data.moduleTitle} · ${data.partName}${
                    data.abilityName ? ` · ${data.abilityName}` : ''
                }`}
                currentQuestion={firstOrderNo}
                totalQuestions={data.totalQuestions}
                questionLabel={questionLabel}
                backToUrl={backToModuleUrl}
                backLabel="Quay lại mô-đun"
            />

            {showSummary ? (
                <PracticeSummaryView
                    data={data}
                    answers={answers}
                    revealedOrderNos={revealedOrderNos}
                    flagged={flagged}
                    backToModuleUrl={backToModuleUrl}
                    onBackToQuestions={closeSummary}
                    onJumpToQuestion={handleSelectQuestionFromPalette}
                    onToggleFlag={handleToggleFlag}
                    onResetPractice={handleResetPractice}
                />
            ) : (
                <div
                    className={`diag-room-layout ${
                        isPaletteCollapsed ? 'is-palette-collapsed' : ''
                    }`}
                >
                    <main className="diag-room-main">
                        <div className="diag-question-area">
                            {currentStep.audioUrl && (
                                <ExamAudioPlayer
                                    stepKey={currentStep.audioKey ?? `practice_${currentStep.stepIndex}`}
                                    src={currentStep.audioUrl}
                                    policy="UNLIMITED"
                                    allowSpeedControl={true}
                                    isLocked={false}
                                    shouldAutoPlay={false}
                                    onAudioEnded={() => undefined}
                                />
                            )}

                            <ExamQuestionCard
                                step={currentStep}
                                answers={answers}
                                flagged={flagged}
                                focusedOrderNo={focusedOrderNo}
                                mode="PRACTICE"
                                revealedOrderNos={revealedOrderNos}
                                reviewQuestionMap={reviewQuestionMap}
                                onSelectOption={handleSelectOption}
                                onCheckAnswer={handleCheckAnswer}
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

                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        className="practice-footer-summary-btn"
                                        onClick={openSummary}
                                    >
                                        <BarChart3 size={16} />
                                        <span>
                                            Tổng kết ({revealedOrderNos.size}/{data.totalQuestions})
                                        </span>
                                    </button>

                                    {!isLastStep && (
                                        <button
                                            type="button"
                                            className="diag-nav-btn is-next"
                                            onClick={handleNextStep}
                                        >
                                            <span>Câu tiếp theo</span>
                                            <ChevronRight size={18} />
                                        </button>
                                    )}
                                </div>
                            </footer>
                        </div>
                    </main>

                    <aside className="diag-room-sidebar">
                        <ExamQuestionPalette
                            questions={data.questions}
                            activeOrderNos={activeOrderNos}
                            answers={answers}
                            flagged={flagged}
                            isCollapsed={isPaletteCollapsed}
                            isListeningCompleted={true}
                            mode="PRACTICE"
                            revealedOrderNos={revealedOrderNos}
                            reviewStatusMap={reviewStatusMap}
                            onToggleCollapse={togglePaletteCollapse}
                            onSelectQuestion={handleSelectQuestionFromPalette}
                        />
                    </aside>
                </div>
            )}
        </div>
    );
}
