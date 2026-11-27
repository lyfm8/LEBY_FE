import { Link, useParams } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowLeft,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Lock,
    PauseCircle,
    Play,
    RefreshCw,
    Volume2,
    WifiOff,
} from 'lucide-react';
import { ExamAudioPlayer } from '../../../shared/exam/components/ExamAudioPlayer';
import { ExamHeader } from '../../../shared/exam/components/ExamHeader';
import { ExamQuestionCard } from '../../../shared/exam/components/ExamQuestionCard';
import { ExamQuestionPalette } from '../../../shared/exam/components/ExamQuestionPalette';
import { ExamSubmitModal } from '../../../shared/exam/components/ExamSubmitModal';
import { useModuleTestRoom } from '../hooks/useModuleTestRoom';
import '../module-test.css';

/**
 * Phòng thi vượt ải mô-đun (UC13):
 * - Tái sử dụng toàn bộ UI/UX của phòng thi chẩn đoán (Shared Exam).
 * - Có nút Tạm dừng (Pause), đồng bộ đồng hồ định kỳ 5s + tự nộp khi 00:00 (BR07).
 * - Phần Nghe (Part 1–4): phát 1 lần duy nhất, khóa tua & khóa nhảy câu cho đến khi nghe xong (BR13).
 * - Phần Đọc (Part 5–7): mở điều hướng câu hỏi tự do.
 */
export default function ModuleTestRoomPage() {
    const { moduleId } = useParams<{ moduleId: string }>();

    const {
        roomData,
        currentStep,
        initialSeconds,
        focusedOrderNo,
        answers,
        flagged,
        activeOrderNos,
        answeredCount,
        isListeningCompleted,
        isCurrentAudioLocked,
        hasInteractedAudio,
        isPaletteCollapsed,
        isPaused,
        isSubmitModalOpen,
        isSubmitting,
        isAutoSubmitting,
        isTimedOut,
        isOffline,
        isLoading,
        blockedState,
        submitError,
        questionLabel,
        firstOrderNo,
        isPrevDisabled,
        isLastStep,
        retryInit,
        togglePaletteCollapse,
        openSubmitModal,
        closeSubmitModal,
        handleSelectOption,
        handleToggleFlag,
        handleTogglePause,
        handleSecondsChange,
        handleUserStartedAudio,
        handleAudioEnded,
        handlePrevStep,
        handleNextStep,
        handleSelectQuestion,
        submitExam,
        handleTimeOut,
    } = useModuleTestRoom(moduleId);

    const backToModuleUrl = moduleId ? `/modules/${moduleId}` : '/learning-path';

    if (isLoading) {
        return (
            <div className="diag-state-page">
                <div className="diag-spinner" />
                <p>Đang chuẩn bị phòng thi vượt ải mô-đun...</p>
            </div>
        );
    }

    if (blockedState) {
        const isLockedOrPrereq =
            blockedState.kind === 'PREREQUISITE' ||
            blockedState.kind === 'CONTENT_LOCKED' ||
            blockedState.kind === 'NOT_CONFIGURED';

        const titleMap: Record<string, string> = {
            PREREQUISITE: 'Chưa đủ điều kiện thi vượt ải',
            NOT_CONFIGURED: 'Bài thi đang được cập nhật',
            CONTENT_LOCKED: 'Mô-đun đang tạm khóa',
            ALREADY_SUBMITTED: 'Phiên thi đã được nộp trước đó',
            NOT_FOUND: 'Không tìm thấy bài kiểm tra',
            GENERIC: 'Không thể mở phòng thi',
        };

        return (
            <div className="diag-state-page">
                <div className="diag-state-card">
                    <div className="diag-state-card__icon">
                        {blockedState.kind === 'NOT_CONFIGURED' ? (
                            <BookOpen size={28} color="#ea580c" />
                        ) : isLockedOrPrereq ? (
                            <Lock size={28} color="#ea580c" />
                        ) : (
                            <AlertTriangle size={28} color="#dc2626" />
                        )}
                    </div>
                    <h2 className="diag-state-card__title">
                        {titleMap[blockedState.kind] ?? 'Không thể mở phòng thi'}
                    </h2>
                    <p className="diag-state-card__desc">{blockedState.message}</p>
                    <div className="diag-state-card__actions">
                        <Link
                            to={
                                blockedState.kind === 'CONTENT_LOCKED'
                                    ? '/learning-path'
                                    : backToModuleUrl
                            }
                            className="diag-action-btn is-submit"
                        >
                            <ArrowLeft size={16} />
                            <span>
                                {blockedState.kind === 'CONTENT_LOCKED'
                                    ? 'Quay lại lộ trình học'
                                    : 'Quay lại mô-đun'}
                            </span>
                        </Link>
                        {!isLockedOrPrereq && (
                            <button
                                type="button"
                                className="diag-action-btn is-outline"
                                onClick={() => void retryInit()}
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

    if (!roomData || !currentStep) {
        return (
            <div className="diag-state-page">
                <div className="diag-state-card">
                    <h2 className="diag-state-card__title">Không có dữ liệu câu hỏi</h2>
                    <p className="diag-state-card__desc">
                        Đề thi vượt ải hiện chưa có câu hỏi khả dụng. Vui lòng quay lại sau.
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

    const isInteractionLocked = isPaused || isSubmitting || isAutoSubmitting || isTimedOut;

    return (
        <div className="diag-room-page">
            {isOffline && (
                <div className="diag-offline-banner" role="alert">
                    <WifiOff size={16} />
                    <span>
                        Mất kết nối mạng tạm thời — đáp án vẫn đang được lưu cục bộ trên trình duyệt.
                    </span>
                </div>
            )}

            {submitError && (
                <div className="diag-submit-error-banner" role="alert">
                    <AlertTriangle size={16} />
                    <span>{submitError}</span>
                </div>
            )}

            <ExamHeader
                mode="EXAM"
                title={`Kiểm tra vượt ải: ${roomData.moduleTitle}`}
                subtitle={`${roomData.partName}${roomData.topic ? ` · ${roomData.topic}` : ''}`}
                passScoreBadge={`Đạt tối thiểu: ${roomData.passScore}/100`}
                currentQuestion={firstOrderNo}
                totalQuestions={roomData.totalQuestions}
                questionLabel={questionLabel}
                backToUrl={backToModuleUrl}
                backLabel="Quay lại mô-đun"
                initialSeconds={initialSeconds}
                showTimer={true}
                showPauseButton={true}
                isPaused={isPaused}
                isLocked={isSubmitting || isAutoSubmitting || isTimedOut}
                onTogglePause={handleTogglePause}
                onSecondsChange={handleSecondsChange}
                onTimeOut={handleTimeOut}
            />

            {!isListeningCompleted && (
                <div className="modtest-listening-notice">
                    <Volume2 size={15} />
                    <span>
                        Phần Nghe chỉ phát 1 lần duy nhất (BR13). Khi audio kết thúc hệ thống sẽ tự
                        chuyển câu và mở khóa điều hướng tự do sau khi nghe xong.
                    </span>
                </div>
            )}

            <main
                className={`diag-room-layout ${isPaletteCollapsed ? 'is-palette-collapsed' : ''}`}
            >
                <section className="diag-main-column">
                    {currentStep.audioUrl && (
                        <ExamAudioPlayer
                            stepKey={currentStep.audioKey ?? `mod_${currentStep.stepIndex}`}
                            src={currentStep.audioUrl}
                            policy="ONCE"
                            allowSpeedControl={false}
                            isLocked={isCurrentAudioLocked}
                            isPaused={isInteractionLocked}
                            shouldAutoPlay={hasInteractedAudio}
                            onUserStartedAudio={handleUserStartedAudio}
                            onAudioEnded={() => handleAudioEnded(currentStep.audioKey)}
                        />
                    )}

                    <ExamQuestionCard
                        step={currentStep}
                        answers={answers}
                        flagged={flagged}
                        focusedOrderNo={focusedOrderNo}
                        disabled={isInteractionLocked}
                        mode="EXAM"
                        onSelectOption={handleSelectOption}
                        onToggleFlag={handleToggleFlag}
                    />

                    <footer className="diag-action-bar">
                        <div className="diag-action-bar__left">
                            <button
                                type="button"
                                className="diag-action-btn is-outline"
                                onClick={handlePrevStep}
                                disabled={
                                    !isListeningCompleted || isPrevDisabled || isInteractionLocked
                                }
                                title={
                                    !isListeningCompleted
                                        ? 'Không thể chuyển câu khi phần Nghe chưa hoàn tất'
                                        : 'Quay lại câu trước'
                                }
                            >
                                <ChevronLeft size={16} />
                                <span>Câu trước</span>
                            </button>

                            <button
                                type="button"
                                className="diag-action-btn is-outline"
                                onClick={handleNextStep}
                                disabled={!isListeningCompleted || isLastStep || isInteractionLocked}
                                title={
                                    !isListeningCompleted
                                        ? 'Vui lòng nghe hết bản ghi âm để tự động chuyển câu'
                                        : 'Chuyển sang câu tiếp theo'
                                }
                            >
                                <span>Câu tiếp</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="diag-action-bar__right">
                            <button
                                type="button"
                                className="diag-action-btn is-submit"
                                onClick={openSubmitModal}
                                disabled={isSubmitting || isAutoSubmitting || isTimedOut}
                            >
                                Nộp bài thi
                            </button>
                        </div>
                    </footer>
                </section>

                <section className="diag-sidebar-column">
                    <ExamQuestionPalette
                        questions={roomData.questions}
                        activeOrderNos={activeOrderNos}
                        answers={answers}
                        flagged={flagged}
                        isCollapsed={isPaletteCollapsed}
                        isListeningCompleted={isListeningCompleted}
                        mode="EXAM"
                        onToggleCollapse={togglePaletteCollapse}
                        onSelectQuestion={handleSelectQuestion}
                    />
                </section>
            </main>

            {isPaused && (
                <div className="diag-modal-backdrop" role="dialog" aria-modal="true">
                    <div className="diag-modal-card">
                        <div className="diag-modal-card__icon">
                            <PauseCircle size={34} color="#ea580c" />
                        </div>
                        <h3 className="diag-modal-card__title">Bài kiểm tra đang tạm dừng</h3>
                        <p className="diag-modal-card__desc">
                            Đồng hồ đếm ngược đã tạm ngừng và đáp án hiện tại đã được lưu an toàn.
                        </p>
                        <div className="diag-modal-actions">
                            <button
                                type="button"
                                className="diag-modal-btn is-confirm"
                                onClick={handleTogglePause}
                            >
                                <span
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                    }}
                                >
                                    <Play size={16} />
                                    Tiếp tục làm bài
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAutoSubmitting && (
                <div className="diag-modal-backdrop" role="alertdialog" aria-modal="true">
                    <div className="diag-modal-card">
                        <div className="diag-spinner" style={{ margin: '0 auto 16px' }} />
                        <h3 className="diag-modal-card__title">Đã hết thời gian làm bài</h3>
                        <p className="diag-modal-card__desc">
                            Hệ thống đang tự động thu bài và chấm điểm theo quy định (BR07)...
                        </p>
                    </div>
                </div>
            )}

            <ExamSubmitModal
                isOpen={isSubmitModalOpen}
                totalQuestions={roomData.questions.length}
                answeredCount={answeredCount}
                flaggedCount={flagged.size}
                isSubmitting={isSubmitting}
                title="Xác nhận nộp bài kiểm tra vượt ải?"
                description={`Hệ thống sẽ chấm điểm ngay và đối chiếu với mốc đạt tối thiểu ${roomData.passScore}/100.`}
                confirmLabel="Nộp bài ngay"
                onClose={closeSubmitModal}
                onConfirm={() => void submitExam(false)}
            />
        </div>
    );
}
