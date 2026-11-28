import { Link } from 'react-router-dom';
import {
    AlertTriangle,
    Award,
    Clock,
    Compass,
    FileCheck2,
    History,
    Lock,
    Play,
    RefreshCw,
    Target,
} from 'lucide-react';
import { SidebarNav } from '@/features/roadmap/components/SidebarNav';
import { MockExamIntroModal } from '../components/MockExamIntroModal';
import { useMockExamList } from '../hooks/useMockExamList';
import { formatMockExamDuration } from '../utils/mockExamDraftUtils';
import '../mock-exam.css';

// Trang sảnh Phòng thi thử TOEIC chuẩn ETS 200 câu (UC17 - Chọn đề Luyện tập hoặc Thi đầu ra)
export default function MockExamListPage() {
    // Khởi tạo toàn bộ dữ liệu đề thi, trạng thái mở khóa đầu ra và hành động từ custom hook
    const {
        listData,
        filteredExams,
        tagFilter,
        setTagFilter,
        isLoading,
        errorMessage,
        pendingStartExam,
        isStarting,
        startError,
        retryLoad,
        handleSelectExam,
        closeStartModal,
        handleConfirmStart,
        handleResumeActiveAttempt,
    } = useMockExamList();

    // Hiển thị màn hình chờ trong khi đang tải danh sách bộ đề thi thử ETS
    if (isLoading) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <main className="mock-page-main">
                    <div className="diag-state-page" style={{ minHeight: '60vh' }}>
                        <div className="diag-spinner" />
                        <p>Đang tải danh sách đề thi thật ETS 200 câu...</p>
                    </div>
                </main>
            </div>
        );
    }

    // Hiển thị màn hình báo lỗi kèm nút Thử lại khi gọi API danh sách thất bại
    if (errorMessage || !listData) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <main className="mock-page-main">
                    <div className="mock-section-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                        <AlertTriangle size={34} color="#dc2626" style={{ marginBottom: 12 }} />
                        <h2 style={{ margin: '0 0 8px', color: '#0f172a' }}>
                            Không thể tải phòng thi thử ETS
                        </h2>
                        <p style={{ margin: '0 0 20px', color: '#64748b' }}>
                            {errorMessage ?? 'Đã có sự cố kết nối máy chủ.'}
                        </p>
                        <button type="button" className="mock-btn-primary" onClick={() => void retryLoad()}>
                            <RefreshCw size={16} />
                            <span>Thử lại</span>
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <SidebarNav />

            <main className="mock-page-main">
                {/* Banner khôi phục nhanh nếu đang có bài thi thử làm dở */}
                {listData.activeAttemptId && (
                    <section className="mock-resume-banner" role="region" aria-label="Tiếp tục bài thi">
                        <div className="mock-resume-banner__info">
                            <Clock size={22} color="#ea580c" />
                            <div>
                                <h2 className="mock-resume-banner__title">
                                    Bạn đang có phiên làm bài chưa hoàn tất
                                </h2>
                                <p className="mock-resume-banner__desc">
                                    Bộ đề: <strong>{listData.activeTestTitle ?? 'Đề thi thử ETS'}</strong> —
                                    đáp án và đồng hồ đã được bảo lưu an toàn.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="mock-btn-primary"
                            onClick={handleResumeActiveAttempt}
                        >
                            <Play size={16} />
                            <span>Tiếp tục làm bài ngay</span>
                        </button>
                    </section>
                )}

                {/* 3. Thanh lọc theo loại đề & cảnh báo lý do khóa đề OUTPUT nếu chưa xong lộ trình */}
                <div className="mock-toolbar">
                    <div className="mock-filter-tabs" role="tablist" aria-label="Lọc theo loại đề thi thử">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={tagFilter === 'ALL'}
                            className={`mock-filter-tab ${tagFilter === 'ALL' ? 'is-active' : ''}`}
                            onClick={() => setTagFilter('ALL')}
                        >
                            Tất cả ({listData.exams.length})
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={tagFilter === 'PRACTICE'}
                            className={`mock-filter-tab ${tagFilter === 'PRACTICE' ? 'is-active' : ''}`}
                            onClick={() => setTagFilter('PRACTICE')}
                        >
                            Đề luyện tập
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={tagFilter === 'OUTPUT'}
                            className={`mock-filter-tab ${tagFilter === 'OUTPUT' ? 'is-active' : ''}`}
                            onClick={() => setTagFilter('OUTPUT')}
                        >
                            Đề thi đầu ra
                        </button>
                    </div>
                </div>

                {!listData.isOutputExamUnlocked && listData.outputLockReason && (
                    <div className="mock-lock-notice" role="status">
                        <div className="mock-lock-notice__left">
                            <Lock size={17} />
                            <span>{listData.outputLockReason}</span>
                        </div>
                        <Link to="/learning-path" className="mock-btn-secondary">
                            <Compass size={15} />
                            <span>Tiếp tục lộ trình học</span>
                        </Link>
                    </div>
                )}

                {/* 4. Danh sách các bộ đề thi thử ETS (hoặc trạng thái rỗng theo UC17 3a) */}
                {filteredExams.length === 0 ? (
                    <section className="mock-section-card" style={{ textAlign: 'center', padding: '44px 20px' }}>
                        <FileCheck2 size={36} color="#94a3b8" style={{ marginBottom: 10 }} />
                        <h3 style={{ margin: '0 0 6px', color: '#0f172a' }}>
                            Chưa có đề thi thử nào khả dụng
                        </h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
                            Hiện chưa có bộ đề ETS phù hợp trong mục lọc này. Bạn có thể chuyển sang tab
                            khác hoặc quay lại sau khi quản trị viên mở đề mới.
                        </p>
                    </section>
                ) : (
                    <section className="mock-exam-grid" aria-label="Danh sách đề thi thử ETS">
                        {filteredExams.map((exam) => {
                            // Xác định thẻ là đề đầu ra hay đề luyện tập để phân màu badge & mô tả
                            const isOutput = exam.examTag === 'OUTPUT';
                            return (
                                <article
                                    key={exam.id}
                                    className={`mock-exam-card ${exam.isLocked ? 'is-locked' : ''}`}
                                >
                                    <div>
                                        <div className="mock-exam-card__top">
                                            <span
                                                className={`mock-tag-badge ${
                                                    isOutput ? 'is-output' : 'is-practice'
                                                }`}
                                            >
                                                {isOutput ? (
                                                    <>
                                                        <Target size={13} />
                                                        <span>Đề thi đầu ra (OUTPUT)</span>
                                                    </>
                                                ) : (
                                                    <span>Đề luyện tập (PRACTICE)</span>
                                                )}
                                            </span>

                                            {exam.hasInProgressAttempt && (
                                                <span className="mock-status-chip is-in-progress">
                                                    Đang làm dở
                                                </span>
                                            )}

                                            {exam.isLocked && (
                                                <span className="mock-status-chip is-locked">
                                                    <Lock size={12} />
                                                    <span>Đang khóa</span>
                                                </span>
                                            )}
                                        </div>

                                        <h2 className="mock-exam-card__title">{exam.title}</h2>
                                        <p className="mock-exam-card__desc">
                                            {exam.description ||
                                                (isOutput
                                                    ? 'Bài thi nghiệm thu toàn diện, xuất biểu đồ Radar Trước & Sau lộ trình kèm khuyến nghị.'
                                                    : 'Bộ đề chuẩn cấu trúc ETS giúp bạn làm quen áp lực thời gian 120 phút.')}
                                        </p>

                                        <div className="mock-exam-card__meta">
                                            <span className="mock-exam-card__meta-item">
                                                <Clock size={14} color="#64748b" />
                                                <span>{exam.durationMinutes} phút</span>
                                            </span>
                                            <span className="mock-exam-card__meta-item">
                                                <FileCheck2 size={14} color="#64748b" />
                                                <span>{exam.totalQuestions} câu hỏi</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <div className="mock-exam-card__stats">
                                            <span>Đã hoàn thành: {exam.attemptCount} lần</span>
                                            {exam.bestScore !== null && (
                                                <span className="mock-exam-card__best">
                                                    Cao nhất: {exam.bestScore}/990
                                                </span>
                                            )}
                                        </div>

                                        {exam.isLocked ? (
                                            <p className="mock-exam-card__lock-reason">
                                                {exam.lockReason ??
                                                    'Hoàn tất toàn bộ các mô-đun trong lộ trình học để mở khóa đề thi đầu ra.'}
                                            </p>
                                        ) : (
                                            <button
                                                type="button"
                                                className="mock-btn-primary"
                                                onClick={() => handleSelectExam(exam)}
                                            >
                                                <Play size={16} />
                                                <span>
                                                    {exam.hasInProgressAttempt
                                                        ? 'Tiếp tục làm bài'
                                                        : 'Vào phòng thi ngay'}
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}

                {/* 5. Bảng lịch sử các lần thi thử ETS trước đó */}
                <section className="mock-section-card" aria-label="Lịch sử thi thử ETS">
                    <div className="mock-section-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <History size={19} color="#ea580c" />
                            <h2 className="mock-section-title">Lịch sử làm bài thi thử</h2>
                        </div>
                        <span style={{ fontSize: 13, color: '#64748b' }}>
                            Tổng cộng {listData.history.length} lượt ghi nhận
                        </span>
                    </div>

                    {listData.history.length === 0 ? (
                        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
                            Bạn chưa hoàn thành bài thi thử ETS 200 câu nào. Hãy chọn một đề luyện tập
                            phía trên để bắt đầu thử sức!
                        </p>
                    ) : (
                        <div className="mock-table-scroll">
                            <table className="mock-history-table">
                                <thead>
                                    <tr>
                                        <th>Bộ đề thi</th>
                                        <th>Phân loại</th>
                                        <th>Thời gian làm</th>
                                        <th>Listening</th>
                                        <th>Reading</th>
                                        <th>Tổng TOEIC</th>
                                        <th>Mục tiêu AIM</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listData.history.map((item) => {
                                        // Chỉ định đường dẫn xem báo cáo phù hợp loại đề
                                        const reportUrl =
                                            item.examTag === 'OUTPUT'
                                                ? `/mock-exam/report/${item.attemptId}`
                                                : `/mock-exam/results/${item.attemptId}`;
                                        // Kiểm tra lượt thi có được mở xem lại lời giải hay bị khóa do chưa đạt AIM
                                        const canViewReview =
                                            item.canViewReview ??
                                            (item.examTag !== 'OUTPUT' || item.isAimAchieved !== false);
                                        const isInProgress = item.status === 'IN_PROGRESS';
                                        return (
                                            <tr key={item.attemptId}>
                                                <td style={{ fontWeight: 700, color: '#0f172a' }}>
                                                    {item.testTitle}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`mock-tag-badge ${
                                                            item.examTag === 'OUTPUT'
                                                                ? 'is-output'
                                                                : 'is-practice'
                                                        }`}
                                                    >
                                                        {item.examTag === 'OUTPUT' ? 'Đầu ra' : 'Luyện tập'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {isInProgress
                                                        ? 'Đang làm dở'
                                                        : formatMockExamDuration(item.durationSeconds)}
                                                </td>
                                                <td>
                                                    {item.listeningScore !== null
                                                        ? `${item.listeningScore}/495`
                                                        : '—'}
                                                </td>
                                                <td>
                                                    {item.readingScore !== null
                                                        ? `${item.readingScore}/495`
                                                        : '—'}
                                                </td>
                                                <td>
                                                    <strong>
                                                        {item.totalToeicScore !== null
                                                            ? `${item.totalToeicScore}/990`
                                                            : '—'}
                                                    </strong>
                                                </td>
                                                <td>
                                                    {item.isAimAchieved === true ? (
                                                        <span className="mock-delta-pill is-up">
                                                            <Award size={12} />
                                                            Đạt AIM
                                                        </span>
                                                    ) : item.isAimAchieved === false ? (
                                                        <span className="mock-delta-pill is-flat">
                                                            Chưa đạt
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="mock-history-actions">
                                                        {isInProgress ? (
                                                            <Link
                                                                to={`/mock-exam/room/${item.attemptId}`}
                                                                className="mock-link-btn"
                                                            >
                                                                Làm tiếp
                                                            </Link>
                                                        ) : (
                                                            <>
                                                                <Link to={reportUrl} className="mock-link-btn">
                                                                    {item.examTag === 'OUTPUT'
                                                                        ? 'Xem báo cáo'
                                                                        : 'Xem điểm'}
                                                                </Link>
                                                                {canViewReview ? (
                                                                    <Link
                                                                        to={`/mock-exam/review/${item.attemptId}`}
                                                                        className="mock-link-btn is-secondary"
                                                                    >
                                                                        Xem lại
                                                                    </Link>
                                                                ) : (
                                                                    <span
                                                                        className="mock-link-btn is-locked"
                                                                        title="Chưa đạt mục tiêu AIM — không thể xem lời giải bài thi đầu ra"
                                                                    >
                                                                        <Lock size={12} />
                                                                        <span>Khóa lời giải</span>
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>

            <MockExamIntroModal
                exam={pendingStartExam}
                isStarting={isStarting}
                startError={startError}
                onClose={closeStartModal}
                onConfirmStart={() => void handleConfirmStart()}
            />
        </div>
    );
}
