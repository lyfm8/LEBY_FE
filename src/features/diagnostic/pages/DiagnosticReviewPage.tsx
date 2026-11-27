import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { AudioPlayer } from '../components/AudioPlayer';
import { DiagnosticHeader } from '../components/DiagnosticHeader';
import { QuestionCard } from '../components/QuestionCard';
import { QuestionPalette } from '../components/QuestionPalette';
import { useDiagnosticReview } from '../hooks/useDiagnosticReview';
import '../diagnostic.css';

/**
 * Trang Xem lại kết quả bài thi chẩn đoán ngay trong giao diện Phòng thi (UC07 - BR14).
 * Hỗ trợ:
 * - Đồng hồ không chạy, không có nút tạm dừng hay nộp bài.
 * - Phát lại audio tương ứng từng câu Nghe không giới hạn số lần và cho phép tua.
 * - Bảng Palette tô xanh lá câu đúng, đỏ câu sai và cho phép lọc câu đúng/sai/đánh dấu.
 * - Đáp án hiển thị khung xanh (đúng) / đỏ (chọn sai) kèm nút "Giải thích" mở rộng dưới từng câu.
 * - Cho phép gắn cờ đánh dấu lại trong lúc xem bài.
 */
export default function DiagnosticReviewPage() {
    // Lấy attemptId từ URL route (/diagnostic/review/:attemptId)
    const { attemptId } = useParams<{ attemptId: string }>();
    // Hook điều hướng quay về trang Báo cáo kết quả hoặc Dashboard
    const navigate = useNavigate();

    // Lấy toàn bộ state và hàm thao tác phòng xem lại từ custom hook chuyên biệt
    const {
        reviewData,
        steps,
        currentStep,
        currentStepIndex,
        focusedOrderNo,
        answers,
        reviewQuestionMap,
        reviewStatusMap,
        activeQuestionOrderNos,
        flagged,
        isPaletteCollapsed,
        isLoading,
        error,
        notCompletedYet,
        setIsPaletteCollapsed,
        handleToggleFlag,
        handlePrevStep,
        handleNextStep,
        handleSelectQuestionFromPalette,
        retryFetch,
    } = useDiagnosticReview(attemptId);

    // Đường dẫn quay về trang Báo cáo kết quả chẩn đoán tương ứng
    const backToReportUrl = attemptId ? `/diagnostic/results/${attemptId}` : '/diagnostic/results';

    // Trạng thái 1: Đang tải dữ liệu xem lại bài thi từ Backend
    if (isLoading) {
        return (
            <div className="diag-loading-page">
                <div className="diag-spinner" />
                <p>Đang tải chi tiết bài làm và lời giải chẩn đoán...</p>
            </div>
        );
    }

    // Trạng thái 2: Xảy ra lỗi tải dữ liệu hoặc lượt thi chưa hoàn thành
    if (error || !reviewData) {
        return (
            <div className="diag-state-page">
                <div className="diag-state-card">
                    <div className="diag-state-card__icon">
                        <AlertTriangle size={36} color={notCompletedYet ? '#ea580c' : '#dc2626'} />
                    </div>
                    <h2 className="diag-state-card__title">
                        {notCompletedYet
                            ? 'Chưa thể xem lại bài thi này'
                            : 'Không thể tải dữ liệu xem lại bài thi'}
                    </h2>
                    <p className="diag-state-card__desc">
                        {error || 'Không tìm thấy dữ liệu lượt thi chẩn đoán.'}
                    </p>
                    <div className="diag-state-card__actions">
                        {notCompletedYet ? (
                            <button
                                type="button"
                                className="diag-action-btn is-submit"
                                onClick={() => navigate('/diagnostic/room')}
                            >
                                Vào phòng thi chẩn đoán
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="diag-action-btn is-submit"
                                onClick={() => void retryFetch()}
                            >
                                <RotateCcw size={16} />
                                <span>Thử tải lại</span>
                            </button>
                        )}
                        <Link to={backToReportUrl} className="diag-action-btn is-outline">
                            Quay lại báo cáo
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Trạng thái 3: Dữ liệu rỗng (đề thi không có câu hỏi nào)
    if (!currentStep || reviewData.questions.length === 0) {
        return (
            <div className="diag-state-page">
                <div className="diag-state-card">
                    <h2 className="diag-state-card__title">Bài thi chưa có dữ liệu câu hỏi</h2>
                    <p className="diag-state-card__desc">
                        Không có câu hỏi nào được ghi nhận trong lượt thi này.
                    </p>
                    <div className="diag-state-card__actions">
                        <Link to={backToReportUrl} className="diag-action-btn is-submit">
                            Quay lại báo cáo
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Lấy số thứ tự câu đầu tiên của màn hình hiện tại
    const firstOrderNo = currentStep.questions[0]?.orderNo ?? 1;
    // Lấy số thứ tự câu cuối cùng của màn hình hiện tại (khác firstOrderNo nếu là câu chùm)
    const lastOrderNo = currentStep.questions[currentStep.questions.length - 1]?.orderNo ?? firstOrderNo;
    // Tạo nhãn tiến độ hiển thị trên Header cho cả câu đơn lẫn câu chùm
    const questionLabel =
        firstOrderNo === lastOrderNo
            ? `Câu ${firstOrderNo} / ${reviewData.totalQuestions}`
            : `Câu ${firstOrderNo}–${lastOrderNo} / ${reviewData.totalQuestions}`;

    // Kiểm tra vô hiệu hóa nút Câu trước khi đang ở trang đầu tiên
    const isPrevDisabled = currentStepIndex === 0;
    // Kiểm tra vô hiệu hóa nút Câu tiếp khi đang ở trang cuối cùng
    const isNextDisabled = currentStepIndex === steps.length - 1;

    return (
        <div className="diag-room-page">
            {/* Thanh tiêu đề phòng xem lại: không chạy đồng hồ, hiển thị đúng X/Y câu và nút Quay lại báo cáo */}
            <DiagnosticHeader
                title={reviewData.testTitle}
                currentQuestion={firstOrderNo}
                totalQuestions={reviewData.totalQuestions}
                questionLabel={questionLabel}
                isReviewMode={true}
                reviewScoreLabel={`Đúng ${reviewData.correctCount}/${reviewData.totalQuestions} câu`}
                onBackToReport={() => navigate(backToReportUrl)}
            />

            {/* Bố cục chính 2 cột giữ nguyên trải nghiệm phòng thi: bên trái xem câu & giải thích, bên phải Palette */}
            <main className={`diag-room-layout ${isPaletteCollapsed ? 'is-palette-collapsed' : ''}`}>
                <section className="diag-main-column">
                    {/* Thanh phát audio tương ứng câu Nghe đang chọn: không giới hạn số lần phát và cho phép tua */}
                    {currentStep.audioUrl && (
                        <AudioPlayer
                            stepKey={currentStep.audioKey || `review_step_${currentStep.stepIndex}`}
                            src={currentStep.audioUrl}
                            isLocked={false}
                            isReviewMode={true}
                            shouldAutoPlay={false}
                            onAudioEnded={() => {}}
                        />
                    )}

                    {/* Khung hiển thị câu hỏi/chùm câu: tô xanh/đỏ đáp án, cho gắn cờ lại và nút Giải thích mở rộng */}
                    <QuestionCard
                        step={currentStep}
                        answers={answers}
                        flagged={flagged}
                        focusedOrderNo={focusedOrderNo}
                        isReviewMode={true}
                        reviewQuestionMap={reviewQuestionMap}
                        onToggleFlag={handleToggleFlag}
                    />

                    {/* Thanh điều hướng dưới cùng: cho phép chuyển câu tự do và quay lại trang Báo cáo */}
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
                            <Link to={backToReportUrl} className="diag-action-btn is-outline">
                                Quay lại báo cáo
                            </Link>
                        </div>
                    </footer>
                </section>

                {/* Cột phải: Bảng Palette hiển thị xanh lá (đúng) / đỏ (sai), lọc câu đúng/sai và cờ */}
                <section className="diag-sidebar-column">
                    <QuestionPalette
                        questions={reviewData.questions}
                        activeOrderNos={activeQuestionOrderNos}
                        answers={answers}
                        flagged={flagged}
                        isCollapsed={isPaletteCollapsed}
                        isListeningCompleted={true}
                        isReviewMode={true}
                        reviewStatusMap={reviewStatusMap}
                        onToggleCollapse={() => setIsPaletteCollapsed((prev) => !prev)}
                        onSelectQuestion={handleSelectQuestionFromPalette}
                    />
                </section>
            </main>
        </div>
    );
}
