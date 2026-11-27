import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    PauseCircle,
    Play,
    WifiOff,
} from 'lucide-react';
import { DiagnosticHeader } from '../components/DiagnosticHeader';
import { AudioPlayer } from '../components/AudioPlayer';
import { QuestionCard } from '../components/QuestionCard';
import { QuestionPalette } from '../components/QuestionPalette';
import { SubmitModal } from '../components/SubmitModal';
import { DiagnosticBlockedView } from '../components/DiagnosticBlockedView';
import { useDiagnosticRoom } from '../hooks/useDiagnosticRoom';
import '../diagnostic.css';

/**
 * Trang Phòng thi chẩn đoán trực tuyến (UC06).
 * Tích hợp: gom câu hỏi chùm trên 1 trang, phát audio liên tục, Flag từng câu,
 * khóa/mở bảng Palette theo tiến độ Phần Nghe, ngưng đọng đồng hồ khi thoát/crash và tùy chọn thi lại.
 */
export default function DiagnosticRoomPage() {
    // Hook điều hướng tới trang Báo cáo, Lộ trình, Chọn AIM hoặc Dashboard
    const navigate = useNavigate();
    // Lấy toàn bộ state và hành động điều khiển phòng thi từ custom hook chuyên biệt
    const {
        test,
        steps,
        currentStep,
        currentStepIndex,
        focusedOrderNo,
        totalQuestions,
        answeredCount,
        activeQuestionOrderNos,
        answers,
        flagged,
        initialSeconds,
        isLoading,
        isSubmitting,
        isAutoSubmitting,
        isRetaking,
        isPaused,
        isPaletteCollapsed,
        isSubmitModalOpen,
        isRetakeConfirmOpen,
        isOffline,
        blockState,
        submitError,
        hasStartedAudio,
        isCurrentAudioLocked,
        isListeningCompleted,
        isListeningTransitionLocked,
        isInteractionLocked,
        setIsPaletteCollapsed,
        setIsSubmitModalOpen,
        setIsRetakeConfirmOpen,
        setHasStartedAudio,
        handleSelectOption,
        handleToggleFlag,
        handleAudioEnded,
        handlePrevStep,
        handleNextStep,
        handleSelectQuestionFromPalette,
        handleSecondsChange,
        handleTogglePause,
        submitExamPayload,
        handleTimeOut,
        handleConfirmRetake,
    } = useDiagnosticRoom();

    // Hiển thị màn hình chờ trong lúc đang gọi API nạp hoặc khôi phục đề thi
    if (isLoading) {
        return (
            <div className="diag-loading-page">
                <div className="diag-spinner" />
                <p>Đang chuẩn bị đề thi chẩn đoán toàn diện...</p>
            </div>
        );
    }

    // Hiển thị màn hình thông báo trạng thái nếu chưa đủ điều kiện hoặc đã hoàn thành bài thi (có tùy chọn Làm lại)
    if (blockState) {
        return (
            <DiagnosticBlockedView
                blockState={blockState}
                submitError={submitError}
                isRetakeConfirmOpen={isRetakeConfirmOpen}
                isRetaking={isRetaking}
                onViewResults={() => navigate('/diagnostic/results')}
                onViewLearningPath={() => navigate('/learning-path')}
                onGoTargetSelection={() => navigate('/target-selection')}
                onGoDashboard={() => navigate('/dashboard')}
                onOpenRetakeConfirm={() => setIsRetakeConfirmOpen(true)}
                onCloseRetakeConfirm={() => setIsRetakeConfirmOpen(false)}
                onConfirmRetake={() => void handleConfirmRetake()}
            />
        );
    }

    // Fallback an toàn nếu dữ liệu đề thi hoặc màn hình câu hỏi rỗng
    if (!test || !currentStep) {
        return (
            <div className="diag-error-page">
                <p>Không tìm thấy dữ liệu bài thi chẩn đoán.</p>
            </div>
        );
    }

    // Lấy số câu đầu tiên của màn hình hiện tại
    const firstOrderNo = currentStep.questions[0]?.orderNo ?? 1;
    // Lấy số câu cuối cùng của màn hình hiện tại (khác firstOrderNo nếu là câu chùm)
    const lastOrderNo = currentStep.questions[currentStep.questions.length - 1]?.orderNo ?? firstOrderNo;
    // Tạo nhãn tiến độ hiển thị trên Header cho cả câu đơn lẫn câu chùm
    const questionLabel =
        firstOrderNo === lastOrderNo
            ? `Câu ${firstOrderNo} / ${totalQuestions}`
            : `Câu ${firstOrderNo}–${lastOrderNo} / ${totalQuestions}`;

    // Kiểm tra vô hiệu hóa nút Câu trước (ở trang đầu, đang tạm dừng hoặc đang khóa trong lúc audio Nghe chạy)
    const isPrevDisabled = currentStepIndex === 0 || isInteractionLocked || isListeningTransitionLocked;
    // Kiểm tra vô hiệu hóa nút Câu tiếp (ở trang cuối, đang tạm dừng hoặc đang khóa trong lúc audio Nghe chạy)
    const isNextDisabled =
        currentStepIndex === steps.length - 1 || isInteractionLocked || isListeningTransitionLocked;

    return (
        <div className="diag-room-page">
            {/* UC06 Ngoại lệ 5b: Thông báo màu vàng khi mất kết nối internet */}
            {isOffline && (
                <div className="diag-offline-banner" role="alert">
                    <WifiOff size={16} />
                    <span>
                        Đang mất kết nối máy chủ. Câu trả lời của bạn đang được tạm lưu cục bộ, vui lòng không tắt
                        trình duyệt.
                    </span>
                </div>
            )}

            {/* Thanh tiêu đề gồm bộ đếm câu, đồng hồ đếm ngược và nút Tạm dừng */}
            <DiagnosticHeader
                title={test.title}
                currentQuestion={firstOrderNo}
                totalQuestions={totalQuestions}
                questionLabel={questionLabel}
                initialSeconds={initialSeconds}
                isPaused={isPaused}
                isLocked={isSubmitting || isAutoSubmitting}
                onTogglePause={handleTogglePause}
                onSecondsChange={handleSecondsChange}
                onTimeOut={handleTimeOut}
            />

            {/* Banner báo lỗi nộp bài nếu có sự cố từ máy chủ */}
            {submitError && (
                <div className="diag-submit-error-banner" role="alert">
                    <AlertTriangle size={16} />
                    <span>{submitError}</span>
                </div>
            )}

            {/* Bố cục chính 2 cột: khu vực làm bài bên trái + bảng Palette Nghe/Đọc bên phải */}
            <main className={`diag-room-layout ${isPaletteCollapsed ? 'is-palette-collapsed' : ''}`}>
                <section className="diag-main-column">
                    {/* Thanh phát audio cho phần Listening, tự động chuyển và phát nối tiếp khi hết đoạn nghe */}
                    {currentStep.section === 'LISTENING' && currentStep.audioUrl && (
                        <AudioPlayer
                            stepKey={currentStep.audioKey || `step_${currentStep.stepIndex}`}
                            src={currentStep.audioUrl}
                            isLocked={isCurrentAudioLocked}
                            isPaused={isInteractionLocked}
                            shouldAutoPlay={hasStartedAudio}
                            onUserStartedAudio={() => setHasStartedAudio(true)}
                            onAudioEnded={handleAudioEnded}
                        />
                    )}

                    {/* Khung hiển thị câu hỏi đơn hoặc cả chùm câu hỏi cùng icon Flag ở đầu từng câu */}
                    <QuestionCard
                        step={currentStep}
                        answers={answers}
                        flagged={flagged}
                        focusedOrderNo={focusedOrderNo}
                        disabled={isInteractionLocked}
                        onSelectOption={handleSelectOption}
                        onToggleFlag={handleToggleFlag}
                    />

                    {/* Thanh điều hướng dưới cùng: nút Câu trước / Câu tiếp (khóa khi audio đang chạy) và Nộp bài thi */}
                    <footer className="diag-action-bar">
                        <div className="diag-action-bar__left">
                            <button
                                type="button"
                                className="diag-action-btn is-outline"
                                onClick={handlePrevStep}
                                disabled={isPrevDisabled}
                                title={
                                    isListeningTransitionLocked
                                        ? 'Không thể chuyển câu trong khi audio phần Nghe đang chạy'
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
                                disabled={isNextDisabled}
                                title={
                                    isListeningTransitionLocked
                                        ? 'Vui lòng nghe hết bản ghi âm để tự động chuyển sang câu tiếp theo'
                                        : 'Chuyển sang câu tiếp theo'
                                }
                            >
                                <span>Câu tiếp</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <div className="diag-action-bar__right">
                            {/* Nút mở modal kiểm tra tổng hợp số câu đã làm / bỏ sót / đánh dấu trước khi nộp */}
                            <button
                                type="button"
                                className="diag-action-btn is-submit"
                                onClick={() => setIsSubmitModalOpen(true)}
                                disabled={isInteractionLocked}
                            >
                                Nộp bài thi
                            </button>
                        </div>
                    </footer>
                </section>

                {/* Cột phải: Bảng Palette chia 2 nhóm Phần Nghe / Phần Đọc */}
                <section className="diag-sidebar-column">
                    <QuestionPalette
                        questions={test.questions}
                        activeOrderNos={activeQuestionOrderNos}
                        answers={answers}
                        flagged={flagged}
                        isCollapsed={isPaletteCollapsed}
                        isListeningCompleted={isListeningCompleted}
                        onToggleCollapse={() => setIsPaletteCollapsed((prev) => !prev)}
                        onSelectQuestion={handleSelectQuestionFromPalette}
                    />
                </section>
            </main>

            {/* Modal xác nhận nộp bài giữ nguyên kiểm tra và cảnh báo số câu chưa làm (UC06 Bước 8 & Ngoại lệ 7a) */}
            <SubmitModal
                isOpen={isSubmitModalOpen}
                totalQuestions={totalQuestions}
                answeredCount={answeredCount}
                flaggedCount={flagged.size}
                isSubmitting={isSubmitting}
                onClose={() => setIsSubmitModalOpen(false)}
                onConfirm={() => void submitExamPayload(false)}
            />

            {/* Overlay Tạm dừng phòng thi (UC06 Luồng 4b — đồng hồ đã đồng bộ ngưng đọng lên server) */}
            {isPaused && !isAutoSubmitting && (
                <div className="diag-modal-backdrop" role="dialog" aria-modal="true">
                    <div className="diag-modal-card">
                        <div className="diag-modal-card__icon">
                            <PauseCircle size={34} color="#ea580c" />
                        </div>
                        <h3 className="diag-modal-card__title">Bài thi đang tạm dừng</h3>
                        <p className="diag-modal-card__desc">
                            Đồng hồ đếm ngược đã được ngưng đọng và tạm khóa thao tác. Nếu bạn đóng trình duyệt,
                            hệ thống sẽ bảo lưu đáp án và thời gian còn lại khi bạn quay trở lại.
                        </p>
                        <button
                            type="button"
                            className="diag-modal-btn is-confirm"
                            onClick={handleTogglePause}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                width: '100%',
                            }}
                        >
                            <Play size={16} />
                            <span>Tiếp tục làm bài</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Overlay Cưỡng chế nộp bài khi hết giờ (BR07) */}
            {isAutoSubmitting && (
                <div className="diag-modal-backdrop" role="dialog" aria-modal="true">
                    <div className="diag-modal-card">
                        <div className="diag-spinner" style={{ margin: '0 auto 16px' }} />
                        <h3 className="diag-modal-card__title">Đã hết thời gian làm bài thi</h3>
                        <p className="diag-modal-card__desc">
                            Đã hết thời gian làm bài thi. Hệ thống đang tiến hành nộp bài tự động và phân tích
                            năng lực của bạn...
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
