import { Link, useParams } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowLeft,
    Award,
    BookOpen,
    CheckCircle2,
    Clock,
    Compass,
    Eye,
    Lock,
    RefreshCw,
    Sparkles,
    Target,
} from 'lucide-react';
import { SidebarNav } from '@/features/roadmap/components/SidebarNav';
import { BeforeAfterRadar } from '../components/BeforeAfterRadar';
import { MockExamPartCard } from '../components/MockExamPartCard';
import { useMockExamReport } from '../hooks/useMockExamReport';
import { formatMockExamDuration } from '../utils/mockExamDraftUtils';
import '../mock-exam.css';

// Trang Báo cáo kết quả thi thử ETS: tự thích ứng hiển thị Tóm tắt điểm (PRACTICE) hoặc Đối sánh Đầu ra Trước/Sau (OUTPUT - UC18)
export default function MockExamReportPage() {
    // Lấy attemptId từ URL để tải đúng báo cáo lượt thi
    const { attemptId } = useParams<{ attemptId?: string }>();
    // Lấy toàn bộ dữ liệu báo cáo và trạng thái lọc Part từ custom hook
    const {
        report,
        isLoading,
        errorMessage,
        selectedPartNo,
        setSelectedPartNo,
        handleTogglePartFilter,
        retryLoad,
    } = useMockExamReport(attemptId);

    // Màn hình chờ tải dữ liệu báo cáo kết quả
    if (isLoading) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <main className="mock-page-main">
                    <div className="diag-state-page" style={{ minHeight: '60vh' }}>
                        <div className="diag-spinner" />
                        <p>Đang tổng hợp kết quả quy đổi ETS và báo cáo năng lực...</p>
                    </div>
                </main>
            </div>
        );
    }

    // Màn hình lỗi khi không tải được báo cáo lượt thi
    if (errorMessage || !report) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <main className="mock-page-main">
                    <div className="mock-section-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                        <AlertTriangle size={34} color="#dc2626" style={{ marginBottom: 12 }} />
                        <h2 style={{ margin: '0 0 8px', color: '#0f172a' }}>
                            Không thể tải báo cáo kết quả
                        </h2>
                        <p style={{ margin: '0 0 20px', color: '#64748b' }}>
                            {errorMessage ?? 'Không tìm thấy dữ liệu chấm điểm cho lượt thi thử này.'}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <Link to="/mock-exam" className="mock-btn-secondary">
                                <ArrowLeft size={16} />
                                <span>Về sảnh đề thi ETS</span>
                            </Link>
                            <button
                                type="button"
                                className="mock-btn-primary"
                                onClick={() => void retryLoad()}
                            >
                                <RefreshCw size={16} />
                                <span>Thử lại</span>
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Phân biệt chế độ đề đầu ra OUTPUT (đầy đủ Radar Trước/Sau & khuyến nghị) vs đề luyện tập PRACTICE
    const isOutputExam = report.examTag === 'OUTPUT';
    // Kiểm tra học viên đã đạt AIM để được phép mở xem 200 câu & lời giải ở bài thi đầu ra hay chưa
    const canViewReview = report.canViewReview ?? (!isOutputExam || report.isAimAchieved !== false);
    // Xác định class nền banner kết luận theo trạng thái đạt AIM hay luyện tập
    const verdictClass = !isOutputExam
        ? 'is-practice'
        : report.isAimAchieved
          ? 'is-achieved'
          : 'is-gap';

    // Lọc danh sách Part hiển thị nếu học viên bấm vào một trục trên biểu đồ Radar
    const visibleParts = selectedPartNo
        ? report.partResults.filter((part) => part.partNo === selectedPartNo)
        : report.partResults;

    return (
        <div className="app-layout">
            <SidebarNav />

            <main className="mock-page-main">
                {/* 1. Banner kết luận tổng quan & nhóm nút hành động */}
                <section className={`mock-verdict-banner ${verdictClass}`}>
                    <div className="mock-verdict-banner__body">
                        <span className={`mock-tag-badge ${isOutputExam ? 'is-output' : 'is-practice'}`}>
                            {isOutputExam ? 'Báo cáo nghiệm thu đầu ra (UC18)' : 'Kết quả đề luyện tập ETS'}
                        </span>
                        <h1 className="mock-verdict-banner__title">
                            {isOutputExam
                                ? (report.summaryHeadline ?? `Hoàn thành: ${report.testTitle}`)
                                : `Hoàn thành luyện tập: ${report.testTitle}`}
                        </h1>
                        <p className="mock-verdict-banner__desc">
                            {isOutputExam
                                ? (report.summaryMessage ??
                                  'Kết quả chi tiết 200 câu đã được đối sánh với năng lực đầu vào của bạn.')
                                : `Bạn đạt ${report.totalToeicScore}/990 điểm TOEIC (${report.totalCorrect}/${report.totalQuestions} câu đúng). Xem lại đáp án và lời giải từng câu bên dưới.`}
                        </p>
                        {!canViewReview && (
                            <p className="mock-verdict-lock-note">
                                <Lock size={14} />
                                <span>
                                    Bạn chưa đạt mục tiêu AIM ({report.targetScore} điểm) nên hệ thống tạm
                                    khóa xem đáp án &amp; lời giải chi tiết bài thi đầu ra. Hãy xem các Part
                                    còn yếu bên dưới để ôn luyện lại nhé!
                                </span>
                            </p>
                        )}
                    </div>

                    <div className="mock-verdict-actions">
                        {canViewReview ? (
                            <Link
                                to={`/mock-exam/review/${report.attemptId}`}
                                className="mock-btn-primary"
                            >
                                <Eye size={16} />
                                <span>Xem lại {report.totalQuestions} câu &amp; Lời giải</span>
                            </Link>
                        ) : (
                            <button
                                type="button"
                                className="mock-btn-locked"
                                disabled
                                title={`Cần đạt mục tiêu AIM ${report.targetScore ?? ''} để mở khóa xem lời giải`}
                            >
                                <Lock size={15} />
                                <span>Khóa lời giải (Chưa đạt AIM)</span>
                            </button>
                        )}
                        {isOutputExam && (
                            <Link to="/target-selection" className="mock-btn-secondary">
                                <Target size={16} />
                                <span>
                                    {report.isAimAchieved ? 'Đặt mục tiêu AIM mới' : 'Điều chỉnh lộ trình / AIM'}
                                </span>
                            </Link>
                        )}
                        <Link to="/mock-exam" className="mock-btn-secondary">
                            <ArrowLeft size={16} />
                            <span>Về sảnh đề ETS</span>
                        </Link>
                    </div>
                </section>

                {/* 2. Bảng điểm quy đổi chuẩn ETS: Tổng 990, Listening 495, Reading 495 */}
                <section className="mock-score-grid" aria-label="Điểm số TOEIC quy đổi">
                    <div className="mock-score-box is-total">
                        <span className="mock-score-box__label">Tổng điểm TOEIC ước lượng</span>
                        <strong className="mock-score-box__val">{report.totalToeicScore} / 990</strong>
                        <span className="mock-score-box__sub">
                            Tổng số câu đúng: {report.totalCorrect}/{report.totalQuestions} · Thời gian:{' '}
                            {formatMockExamDuration(report.durationSeconds)}
                        </span>
                        {report.targetScore !== null && (
                            <span
                                className="mock-score-box__sub"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4 }}
                            >
                                {report.isAimAchieved ? (
                                    <CheckCircle2 size={15} color="#4ade80" />
                                ) : (
                                    <Clock size={15} color="#fbbf24" />
                                )}
                                <span>
                                    Mục tiêu AIM {report.targetScore}:{' '}
                                    {report.scoreDifference !== null && report.scoreDifference >= 0
                                        ? `Đạt & vượt +${report.scoreDifference} điểm`
                                        : `Còn thiếu ${Math.abs(report.scoreDifference ?? 0)} điểm`}
                                </span>
                            </span>
                        )}
                    </div>

                    <div className="mock-score-box">
                        <span className="mock-score-box__label">Điểm Listening (Part 1–4)</span>
                        <strong className="mock-score-box__val" style={{ color: '#2563eb' }}>
                            {report.listeningScore} / 495
                        </strong>
                        <span className="mock-score-box__sub">
                            Đúng {report.listeningCorrect}/{report.listeningTotal} câu ({report.listeningPercent}%)
                        </span>
                    </div>

                    <div className="mock-score-box">
                        <span className="mock-score-box__label">Điểm Reading (Part 5–7)</span>
                        <strong className="mock-score-box__val" style={{ color: '#ea580c' }}>
                            {report.readingScore} / 495
                        </strong>
                        <span className="mock-score-box__sub">
                            Đúng {report.readingCorrect}/{report.readingTotal} câu ({report.readingPercent}%)
                        </span>
                    </div>
                </section>

                {/* 3. CHỈ HIỂN THỊ KHI LÀ ĐỀ ĐẦU RA (OUTPUT): Radar Trước vs Sau + Khuyến nghị + Điểm yếu còn sót */}
                {isOutputExam && report.beforeRadar && report.afterRadar && (
                    <section className="mock-report-split">
                        <BeforeAfterRadar
                            beforeData={report.beforeRadar}
                            afterData={report.afterRadar}
                            partResults={report.partResults}
                            selectedPartNo={selectedPartNo}
                            onSelectPart={handleTogglePartFilter}
                        />

                        <div className="mock-advice-stack">
                            <div className="mock-section-card">
                                <div className="mock-section-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Sparkles size={18} color="#2563eb" />
                                        <h2 className="mock-section-title">Khuyến nghị bước tiếp theo</h2>
                                    </div>
                                </div>
                                <ul className="mock-reco-list">
                                    {report.recommendations.map((rec, idx) => (
                                        <li key={idx} className="mock-reco-item">
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {report.remainingWeakAbilities.length > 0 && (
                                <div className="mock-section-card">
                                    <div className="mock-section-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <BookOpen size={18} color="#dc2626" />
                                            <h2 className="mock-section-title">Kỹ năng còn yếu cần ôn thêm</h2>
                                        </div>
                                    </div>
                                    <div className="mock-weak-list">
                                        {report.remainingWeakAbilities.map((ab) => (
                                            <div key={ab.abilityId} className="mock-weak-row">
                                                <div>
                                                    <div className="mock-weak-row__name">{ab.abilityName}</div>
                                                    <div className="mock-weak-row__meta">
                                                        Part {ab.partNo} · Đúng {ab.correctCount}/{ab.totalCount} câu
                                                    </div>
                                                </div>
                                                <strong style={{ color: '#b91c1c' }}>
                                                    {ab.accuracyPercent}%
                                                </strong>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: 14 }}>
                                        <Link to="/learning-path" className="mock-btn-secondary">
                                            <Compass size={15} />
                                            <span>Quay lại lộ trình củng cố</span>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* 4. Phân tích chi tiết từng Part (Part 1–7) */}
                <section className="mock-section-card">
                    <div className="mock-section-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Award size={19} color="#ea580c" />
                            <h2 className="mock-section-title">
                                {isOutputExam
                                    ? 'Đối sánh chi tiết 7 Part & Kỹ năng con'
                                    : 'Kết quả chi tiết theo từng Part (1–7)'}
                            </h2>
                        </div>
                        {selectedPartNo !== null && (
                            <button
                                type="button"
                                className="mock-btn-secondary"
                                onClick={() => setSelectedPartNo(null)}
                            >
                                Hiện tất cả 7 Part
                            </button>
                        )}
                    </div>

                    <div className="mock-parts-grid">
                        {visibleParts.map((part) => (
                            <MockExamPartCard
                                key={part.partNo}
                                part={part}
                                isOutputExam={isOutputExam}
                                isHighlighted={selectedPartNo === part.partNo}
                            />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
