import { Link } from 'react-router-dom';
import {
    ArrowRight,
    BookOpen,
    ClipboardCheck,
    Compass,
    RefreshCw,
    Target,
} from 'lucide-react';
import type { DashboardState } from '../types/dashboardTypes';

// Kiểu props nhận vào của component hiển thị các trạng thái hướng dẫn ban đầu
interface DashboardOnboardingCardProps {
    state: Extract<DashboardState, 'NEED_TARGET' | 'NEED_DIAGNOSTIC' | 'SYNCING_ROADMAP'>;
    fullName: string;
    targetScore: number | null;
    hasInProgressDiagnostic: boolean;
    onRefresh: () => void;
}

/**
 * Thẻ hướng dẫn học viên khi chưa sẵn sàng lộ trình học cá nhân:
 * - NEED_TARGET: chào mừng người dùng mới và dẫn sang màn hình chọn mục tiêu AIM.
 * - NEED_DIAGNOSTIC: nhắc hoàn thành bài thi chẩn đoán đầu vào để sinh lộ trình thích ứng.
 * - SYNCING_ROADMAP: thông báo hệ thống đang đồng bộ lộ trình và cho phép tải lại ngay.
 */
export function DashboardOnboardingCard({
    state,
    fullName,
    targetScore,
    hasInProgressDiagnostic,
    onRefresh,
}: DashboardOnboardingCardProps) {
    // Nhánh 1: Học viên mới chưa thiết lập mốc mục tiêu điểm TOEIC
    if (state === 'NEED_TARGET') {
        return (
            <section className="db-onboarding-card">
                {/* Biểu tượng mục tiêu đặt đầu thẻ giúp học viên nhận diện ngay bước khởi đầu */}
                <div className="db-onboarding-card__icon is-target">
                    <Target size={32} />
                </div>

                {/* Dòng tiêu đề chào mừng cá nhân hóa theo tên người học */}
                <h1 className="db-onboarding-card__title">
                    Chào mừng {fullName} đến với hành trình chinh phục TOEIC
                </h1>

                {/* Mô tả ngắn gọn lợi ích của việc thiết lập mục tiêu điểm trước khi học */}
                <p className="db-onboarding-card__desc">
                    Hãy chọn mốc điểm TOEIC mục tiêu (450 – 850) để hệ thống căn chỉnh bộ ngưỡng đánh giá
                    và xây dựng lộ trình ôn luyện tinh gọn dành riêng cho bạn.
                </p>

                {/* Lộ trình 3 bước khởi động ngắn gọn, rõ ràng */}
                <div className="db-onboarding-steps">
                    <div className="db-onboarding-step is-current">
                        <span className="db-onboarding-step__num">1</span>
                        <div>
                            <strong>Chọn mục tiêu điểm số</strong>
                            <span>Xác định mốc điểm đầu ra phù hợp với bạn</span>
                        </div>
                    </div>
                    <div className="db-onboarding-step">
                        <span className="db-onboarding-step__num">2</span>
                        <div>
                            <strong>Đánh giá năng lực 7 phần thi</strong>
                            <span>Định vị chính xác điểm mạnh và lỗ hổng kiến thức</span>
                        </div>
                    </div>
                    <div className="db-onboarding-step">
                        <span className="db-onboarding-step__num">3</span>
                        <div>
                            <strong>Học theo lộ trình cá nhân hóa</strong>
                            <span>Chỉ tập trung vào các chuyên đề còn yếu để tiết kiệm thời gian</span>
                        </div>
                    </div>
                </div>

                {/* Cụm nút hành động chính và lối khám phá thư viện khóa học */}
                <div className="db-onboarding-card__actions">
                    <Link to="/target-selection" className="db-btn-primary">
                        <Target size={17} />
                        <span>Chọn mục tiêu điểm TOEIC</span>
                        <ArrowRight size={16} />
                    </Link>
                    <Link to="/#curriculum" className="db-btn-secondary">
                        <BookOpen size={16} />
                        <span>Xem chương trình 7 Part</span>
                    </Link>
                </div>
            </section>
        );
    }

    // Nhánh 2: Học viên đã chọn mục tiêu nhưng chưa hoàn thành bài thi chẩn đoán đầu vào
    if (state === 'NEED_DIAGNOSTIC') {
        return (
            <section className="db-onboarding-card">
                {/* Biểu tượng phòng thi chẩn đoán */}
                <div className="db-onboarding-card__icon is-diagnostic">
                    <ClipboardCheck size={32} />
                </div>

                {/* Nhãn hiển thị mốc mục tiêu đã chọn để xác nhận ngữ cảnh */}
                {targetScore !== null && (
                    <span className="db-onboarding-card__pill">
                        Mục tiêu đã chọn: {targetScore} TOEIC
                    </span>
                )}

                {/* Tiêu đề nhắc nhở nổi bật mời làm bài đánh giá đầu vào */}
                <h1 className="db-onboarding-card__title">
                    {hasInProgressDiagnostic
                        ? 'Bạn đang có bài thi chẩn đoán làm dở'
                        : 'Hoàn thành bài thi chẩn đoán để nhận lộ trình riêng'}
                </h1>

                {/* Câu dẫn trực tiếp theo đặc tả nghiệp vụ */}
                <p className="db-onboarding-card__desc">
                    Hãy hoàn thành bài thi chẩn đoán đầu vào để nhận lộ trình học thích ứng dành riêng cho bạn.
                    Hệ thống sẽ tự động phân tích cả 7 phần thi Nghe và Đọc để chọn đúng các mô-đun trọng tâm.
                </p>

                {/* Cụm nút hành động chính dẫn thẳng vào phòng thi chẩn đoán */}
                <div className="db-onboarding-card__actions">
                    <Link to="/diagnostic/room" className="db-btn-primary">
                        <ClipboardCheck size={17} />
                        <span>{hasInProgressDiagnostic ? 'Tiếp tục bài thi chẩn đoán' : 'Vào phòng thi ngay'}</span>
                        <ArrowRight size={16} />
                    </Link>
                    <Link to="/target-selection" className="db-btn-secondary">
                        <Target size={16} />
                        <span>Điều chỉnh mục tiêu</span>
                    </Link>
                </div>
            </section>
        );
    }

    // Nhánh 3: Đã nộp bài chẩn đoán nhưng dữ liệu lộ trình đang được đồng bộ
    return (
        <section className="db-onboarding-card">
            {/* Biểu tượng la bàn biểu trưng cho quá trình tạo lộ trình */}
            <div className="db-onboarding-card__icon is-syncing">
                <Compass size={32} />
            </div>

            {/* Tiêu đề thông báo trạng thái đồng bộ */}
            <h1 className="db-onboarding-card__title">Đang cập nhật lộ trình học tập của bạn</h1>

            {/* Hướng dẫn học viên làm mới dữ liệu sau giây lát */}
            <p className="db-onboarding-card__desc">
                Hệ thống đã ghi nhận kết quả đánh giá đầu vào và đang hoàn thiện danh sách các chuyên đề học tập
                phù hợp nhất cho bạn. Nhấn làm mới sau vài giây nếu trang chưa tự cập nhật.
            </p>

            {/* Nút tải lại trang và lối xem lộ trình */}
            <div className="db-onboarding-card__actions">
                <button type="button" className="db-btn-primary" onClick={onRefresh}>
                    <RefreshCw size={16} />
                    <span>Làm mới dữ liệu</span>
                </button>
                <Link to="/learning-path" className="db-btn-secondary">
                    <Compass size={16} />
                    <span>Kiểm tra lộ trình học</span>
                </Link>
            </div>
        </section>
    );
}
