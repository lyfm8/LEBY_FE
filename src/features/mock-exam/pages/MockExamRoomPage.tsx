import { Link, useParams } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Compass,
    PauseCircle,
    Play,
    RefreshCw,
    WifiOff,
} from 'lucide-react';
import { ExamAudioPlayer } from '@/shared/exam/components/ExamAudioPlayer';
import { ExamHeader } from '@/shared/exam/components/ExamHeader';
import { ExamQuestionCard } from '@/shared/exam/components/ExamQuestionCard';
import { ExamQuestionPalette } from '@/shared/exam/components/ExamQuestionPalette';
import { ExamSubmitModal } from '@/shared/exam/components/ExamSubmitModal';
import { useMockExamRoom } from '../hooks/useMockExamRoom';
import '../mock-exam.css';

// Trang Phòng thi thử TOEIC chuẩn ETS 200 câu (UC17 - giữ nguyên 100% quy chế Diagnostic + phân nhóm Palette theo Part 1-7)
export default function MockExamRoomPage() {
    // Lấy attemptId từ tham số URL nếu học viên mở hoặc tiếp tục lượt thi cụ thể
    const { attemptId } = useParams<{ attemptId?: string }>();

    // Kết nối hook điều phối toàn bộ trạng thái phòng thi thử 200 câu
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
    } = useMockExamRoom(attemptId);

    // Màn hình chờ khi đang khởi tạo/khôi phục phiên thi 200 câu từ máy chủ
    if (isLoading) {
        return (
            <div className="diag-state-page">
                <div className="diag-spinner" />
                <p>Đang tải đề thi thật ETS 200 câu và khôi phục bản nháp...</p>
            </div>
        );
    }

    // Màn hình thông báo khi học viên chưa đủ điều kiện mở khóa hoặc lượt thi đã hoàn tất
    if (blockedState) {
        // Kiểm tra trường hợp bài thi đã được nộp từ trước để dẫn tới trang báo cáo kết quả
        const isSubmitted = blockedState.kind === 'ALREADY_SUBMITTED' && Boolean(attemptId);
        // Kiểm tra trường hợp bị khóa đề thi đầu ra vì chưa xong lộ trình học
        const isLocked = blockedState.kind === 'OUTPUT_LOCKED';

        return (
            <div className="diag-state-page">
                <div className="diag-state-card">
                    <div className="diag-state-card__icon">
                        <AlertTriangle size={28} color="#ea580c" />
                    </div>
                    <h2 className="diag-state-card__title">
                        {isLocked
                            ? 'Đề thi đầu ra chưa mở khóa'
                            : isSubmitted
                              ? 'Bài thi thử này đã được nộp'
                              : 'Không thể mở phòng thi thử'}
                    </h2>
                    <p className="diag-state-card__desc">{blockedState.message}</p>
                    <div className="diag-state-card__actions">
                        {isLocked && (
                            <Link to="/learning-path" className="diag-action-btn is-submit">
                                <Compass size={16} />
                                <span>Về lộ trình học</span>
                            </Link>
                        )}
                        {isSubmitted && attemptId && (
                            <Link
                                to={`/mock-exam/report/${attemptId}`}
                                className="diag-action-btn is-submit"
                            >
                                <span>Xem kết quả lượt thi</span>
                            </Link>
                        )}
                        <Link to="/mock-exam" className="diag-action-btn is-outline">
                            <ArrowLeft size={16} />
                            <span>Về sảnh đề ETS</span>
                        </Link>
                        {blockedState.kind === 'NETWORK_OR_SERVER' && (
                            <button
                                type="button"
                                className="diag-action-btn is-submit"
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

    // Màn hình dự phòng khi đề thi chưa có câu hỏi khả dụng
    if (!roomData || !currentStep) {
        return (
            <div className="diag-state-page">
                <div className="diag-state-card">
                    <h2 className="diag-state-card__title">Chưa có dữ liệu câu hỏi</h2>
                    <p className="diag-state-card__desc">
                        Bộ đề thi thử hiện chưa có câu hỏi khả dụng. Vui lòng chọn đề thi khác.
                    </p>
                    <div className="diag-state-card__actions">
                        <Link to="/mock-exam" className="diag-action-btn is-submit">
                            <ArrowLeft size={16} />
                            <span>Về sảnh đề ETS</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Khóa tương tác toàn màn hình khi tạm dừng, đang nộp bài hoặc đã hết giờ
    const isInteractionLocked = isPaused || isSubmitting || isAutoSubmitting || isTimedOut;

    return (
        <div className="diag-room-page">
            {/* Banner cảnh báo ngoại tuyến tức thời khi mất kết nối mạng (BR12) */}
            {isOffline && (
                <div className="diag-offline-banner" role="alert">
                    <WifiOff size={16} />
                    <span>
                        Mất kết nối mạng tạm thời — đáp án vẫn đang được lưu cục bộ trên trình duyệt.
                    </span>
                </div>
            )}

            {/* Banner lỗi nộp bài nếu có sự cố khi gửi đáp án */}
            {submitError && (
                <div className="diag-submit-error-banner" role="alert">
                    <AlertTriangle size={16} />
                    <span>{submitError}</span>
                </div>
            )}

            <ExamHeader
                mode="EXAM"
                title={roomData.title}
                subtitle={
                    roomData.examTag === 'OUTPUT'
                        ? `Đề thi đầu ra chuẩn ETS · ${roomData.totalQuestions} câu`
                        : `Đề luyện tập chuẩn ETS · ${roomData.totalQuestions} câu`
                }
                currentQuestion={firstOrderNo}
                totalQuestions={roomData.totalQuestions}
                questionLabel={questionLabel}
                backToUrl="/mock-exam"
                backLabel="Về sảnh đề"
                initialSeconds={initialSeconds}
                showTimer={true}
                showPauseButton={true}
                isPaused={isPaused}
                isLocked={isSubmitting || isAutoSubmitting || isTimedOut}
                onTogglePause={handleTogglePause}
                onSecondsChange={handleSecondsChange}
                onTimeOut={handleTimeOut}
            />

            <main className={`diag-room-layout ${isPaletteCollapsed ? 'is-palette-collapsed' : ''}`}>
                <section className="diag-main-column">
                    {/* Audio chỉ được phát duy nhất 1 lần theo quy chế thi thật (BR08 / BR13) */}
                    {currentStep.audioUrl && (
                        <ExamAudioPlayer
                            stepKey={currentStep.audioKey ?? `mock_${currentStep.stepIndex}`}
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

                {/* Bảng câu hỏi phân tách rõ ràng từng Part 1-7 phục vụ bài thi 200 câu */}
                <section className="diag-sidebar-column">
                    <ExamQuestionPalette
                        questions={roomData.questions}
                        activeOrderNos={activeOrderNos}
                        answers={answers}
                        flagged={flagged}
                        isCollapsed={isPaletteCollapsed}
                        isListeningCompleted={isListeningCompleted}
                        mode="EXAM"
                        groupByPart={true}
                        onToggleCollapse={togglePaletteCollapse}
                        onSelectQuestion={handleSelectQuestion}
                    />
                </section>
            </main>

            {/* Lớp phủ khi học viên bấm Tạm dừng đồng hồ thi */}
            {isPaused && (
                <div className="diag-modal-backdrop" role="dialog" aria-modal="true">
                    <div className="diag-modal-card">
                        <div className="diag-modal-card__icon">
                            <PauseCircle size={34} color="#ea580c" />
                        </div>
                        <h3 className="diag-modal-card__title">Bài thi thử đang tạm dừng</h3>
                        <p className="diag-modal-card__desc">
                            Đồng hồ 120 phút đã tạm ngừng và các đáp án bạn chọn đã được bảo lưu an toàn.
                        </p>
                        <div className="diag-modal-actions">
                            <button
                                type="button"
                                className="diag-modal-btn is-confirm"
                                onClick={handleTogglePause}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <Play size={16} />
                                    Tiếp tục làm bài
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lớp phủ tự động thu bài khi đồng hồ chạm 00:00 (BR07) */}
            {isAutoSubmitting && (
                <div className="diag-modal-backdrop" role="alertdialog" aria-modal="true">
                    <div className="diag-modal-card">
                        <div className="diag-spinner" style={{ margin: '0 auto 16px' }} />
                        <h3 className="diag-modal-card__title">Đã hết thời gian làm bài</h3>
                        <p className="diag-modal-card__desc">
                            Hệ thống đang tự động thu bài và quy đổi điểm TOEIC chuẩn ETS (BR07)...
                        </p>
                    </div>
                </div>
            )}

            {/* Hộp thoại xác nhận nộp bài kèm thống kê số câu chưa làm và số câu gắn cờ */}
            <ExamSubmitModal
                isOpen={isSubmitModalOpen}
                totalQuestions={roomData.questions.length}
                answeredCount={answeredCount}
                flaggedCount={flagged.size}
                isSubmitting={isSubmitting}
                title="Xác nhận nộp bài thi thử ETS?"
                description={
                    roomData.examTag === 'OUTPUT'
                        ? 'Hệ thống sẽ chấm điểm quy đổi 990 và tạo Báo cáo đối sánh Trước & Sau lộ trình ngay lập tức.'
                        : 'Hệ thống sẽ chấm điểm quy đổi 990 và mở phần xem lại đáp án chi tiết từng câu.'
                }
                confirmLabel="Nộp bài ngay"
                onClose={closeSubmitModal}
                onConfirm={() => void submitExam(false)}
            />
        </div>
    );
}
