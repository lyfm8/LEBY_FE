import { AlertTriangle, Award, Compass, RotateCcw } from 'lucide-react';
import type { RoomBlockState } from '../hooks/useDiagnosticRoom';

interface DiagnosticBlockedViewProps {
    // Thông tin trạng thái chặn vào phòng thi hiện tại
    blockState: RoomBlockState;
    // Thông báo lỗi nếu quá trình khởi tạo thi lại thất bại
    submitError: string;
    // Trạng thái đang mở hộp thoại xác nhận làm lại bài thi
    isRetakeConfirmOpen: boolean;
    // Trạng thái đang gọi API tạo lượt thi mới
    isRetaking: boolean;
    // Điều hướng sang trang Báo cáo kết quả gần nhất
    onViewResults: () => void;
    // Điều hướng sang trang Lộ trình học cá nhân hóa
    onViewLearningPath: () => void;
    // Điều hướng sang trang Chọn mục tiêu AIM
    onGoTargetSelection: () => void;
    // Điều hướng về trang Tổng quan Dashboard
    onGoDashboard: () => void;
    // Mở hộp thoại xác nhận làm lại bài thi chẩn đoán
    onOpenRetakeConfirm: () => void;
    // Đóng hộp thoại xác nhận làm lại
    onCloseRetakeConfirm: () => void;
    // Xác nhận tạo lượt thi chẩn đoán mới (forceRetake = true)
    onConfirmRetake: () => void;
}

/**
 * Màn hình hiển thị các trạng thái điều hướng trước khi vào phòng thi chẩn đoán:
 * - Đã hoàn thành bài chẩn đoán (kèm tùy chọn Làm lại bài thi chẩn đoán).
 * - Chưa thiết lập AIM, chưa kích hoạt đề thi hoặc lỗi kết nối.
 */
export function DiagnosticBlockedView({
    blockState,
    submitError,
    isRetakeConfirmOpen,
    isRetaking,
    onViewResults,
    onViewLearningPath,
    onGoTargetSelection,
    onGoDashboard,
    onOpenRetakeConfirm,
    onCloseRetakeConfirm,
    onConfirmRetake,
}: DiagnosticBlockedViewProps) {
    // Xác định tiêu đề phù hợp theo từng loại trạng thái chặn
    const title =
        blockState.type === 'ALREADY_COMPLETED'
            ? 'Bạn đã hoàn thành bài thi chẩn đoán'
            : blockState.type === 'NO_ACTIVE_EXAM'
              ? 'Đề thi chẩn đoán đang được chuẩn bị'
              : blockState.type === 'NO_TARGET'
                ? 'Chưa thiết lập mục tiêu TOEIC'
                : 'Không thể mở phòng thi';

    return (
        <div className="diag-state-page">
            {/* Thẻ thông báo trạng thái chính giữa màn hình */}
            <div className="diag-state-card">
                {/* Biểu tượng cảnh báo màu cam thương hiệu */}
                <div className="diag-state-card__icon">
                    <AlertTriangle size={36} color="#ea580c" />
                </div>

                {/* Tiêu đề trạng thái */}
                <h2 className="diag-state-card__title">{title}</h2>
                {/* Nội dung mô tả chi tiết */}
                <p className="diag-state-card__desc">{blockState.message}</p>

                {/* Hiển thị lỗi nếu thao tác bấm Làm lại gặp sự cố */}
                {submitError && (
                    <div className="diag-modal-warning" role="alert">
                        {submitError}
                    </div>
                )}

                {/* Các nút hành động tương ứng với từng trạng thái */}
                <div className="diag-state-card__actions">
                    {blockState.type === 'ALREADY_COMPLETED' && (
                        <>
                            {/* Nút xem lại báo cáo chẩn đoán gần nhất */}
                            <button
                                type="button"
                                className="diag-action-btn is-submit"
                                onClick={onViewResults}
                                disabled={isRetaking}
                            >
                                <Award size={16} />
                                <span>Xem báo cáo chẩn đoán</span>
                            </button>

                            {/* Nút chuyển sang lộ trình học tập */}
                            <button
                                type="button"
                                className="diag-action-btn is-outline"
                                onClick={onViewLearningPath}
                                disabled={isRetaking}
                            >
                                <Compass size={16} />
                                <span>Tiến hành học theo lộ trình</span>
                            </button>

                            {/* Nút tùy chọn cho phép làm lại bài thi chẩn đoán */}
                            <button
                                type="button"
                                className="diag-action-btn is-outline"
                                onClick={onOpenRetakeConfirm}
                                disabled={isRetaking}
                            >
                                <RotateCcw size={16} />
                                <span>Làm lại bài thi chẩn đoán</span>
                            </button>
                        </>
                    )}

                    {/* Trường hợp chưa chọn mục tiêu AIM */}
                    {blockState.type === 'NO_TARGET' && (
                        <button
                            type="button"
                            className="diag-action-btn is-submit"
                            onClick={onGoTargetSelection}
                        >
                            Chọn mục tiêu AIM ngay
                        </button>
                    )}

                    {/* Trường hợp chưa có đề thi hoặc lỗi hệ thống */}
                    {(blockState.type === 'NO_ACTIVE_EXAM' || blockState.type === 'ERROR') && (
                        <button
                            type="button"
                            className="diag-action-btn is-outline"
                            onClick={onGoDashboard}
                        >
                            Quay về trang tổng quan
                        </button>
                    )}
                </div>
            </div>

            {/* Modal xác nhận trước khi tạo lượt làm lại bài chẩn đoán mới */}
            {isRetakeConfirmOpen && (
                <div className="diag-modal-backdrop" role="dialog" aria-modal="true">
                    <div className="diag-modal-card">
                        {/* Icon nhấn mạnh hành động làm lại */}
                        <div className="diag-modal-card__icon">
                            <RotateCcw size={30} color="#ea580c" />
                        </div>

                        {/* Tiêu đề modal xác nhận */}
                        <h3 className="diag-modal-card__title">Làm lại bài thi chẩn đoán?</h3>
                        {/* Cảnh báo hệ quả nghiệp vụ khi làm lại bài */}
                        <p className="diag-modal-card__desc">
                            Hệ thống sẽ khởi tạo một lượt thi mới cho mục tiêu AIM hiện tại. Khi bạn nộp bài
                            mới, báo cáo năng lực và lộ trình học tập sẽ được cập nhật theo kết quả mới nhất
                            (lộ trình cũ vẫn được lưu trong lịch sử).
                        </p>

                        {/* Hai nút Hủy hoặc Bắt đầu làm lại */}
                        <div className="diag-modal-actions">
                            <button
                                type="button"
                                className="diag-modal-btn is-cancel"
                                onClick={onCloseRetakeConfirm}
                                disabled={isRetaking}
                            >
                                Để sau
                            </button>
                            <button
                                type="button"
                                className="diag-modal-btn is-confirm"
                                onClick={onConfirmRetake}
                                disabled={isRetaking}
                            >
                                {isRetaking ? 'Đang tạo phòng thi...' : 'Bắt đầu làm lại'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
