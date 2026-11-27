import { Link, useParams } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowLeft,
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
import { usePracticeRoom } from '../hooks/usePracticeRoom';
import '../practice.css';

/**
 * Phòng luyện tập bài thực hành theo mô-đun (UC12):
 * - Nghe không giới hạn số lần, hỗ trợ tua và tốc độ 0.8x / 1.0x / 1.2x (BR08).
 * - Di chuyển tự do giữa các câu, bấm "Kiểm tra đáp án" để xem đúng/sai và giải thích tức thì.
 * - Hỗ trợ đánh dấu câu hỏi cần ôn lại (Flag).
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
        isLoading,
        errorState,
        questionLabel,
        firstOrderNo,
        isPrevDisabled,
        isLastStep,
        togglePaletteCollapse,
        retryLoad,
        handleSelectOption,
        handleCheckAnswer,
        handleToggleFlag,
        handlePrevStep,
        handleNextStep,
        handleSelectQuestionFromPalette,
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
                        <Link to={backToModuleUrl} className="diag-action-btn is-outline">
                            <ArrowLeft size={16} />
                            <span>Quay lại mô-đun</span>
                        </Link>
                        {!isLocked && (
                            <button
                                type="button"
                                className="diag-action-btn is-submit"
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
                        <Link to={backToModuleUrl} className="diag-action-btn is-submit">
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

            <main
                className={`diag-room-layout ${
                    isPaletteCollapsed ? 'is-palette-collapsed' : ''
                }`}
            >
                <section className="diag-main-column">
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

                    <footer className="diag-action-bar">
                        <div className="diag-action-bar__left">
                            <button
                                type="button"
                                className="diag-action-btn is-outline"
                                onClick={handlePrevStep}
                                disabled={isPrevDisabled}
                                title="Quay lại câu trước"
                            >
                                <ChevronLeft size={16} />
                                <span>Câu trước</span>
                            </button>

                            <button
                                type="button"
                                className="diag-action-btn is-outline"
                                onClick={handleNextStep}
                                disabled={isLastStep}
                                title="Chuyển sang câu tiếp theo"
                            >
                                <span>Câu tiếp</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </footer>
                </section>

                <section className="diag-sidebar-column">
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
                </section>
            </main>
        </div>
    );
}
