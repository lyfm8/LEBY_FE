import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    AlertTriangle,
    Award,
    CheckCircle2,
    ChevronRight,
    Download,
    RotateCcw,
    Target,
} from 'lucide-react';
import { PartResultCard } from '../components/PartResultCard';
import { RadarChart } from '../components/RadarChart';
import { diagnosticService } from '../services/diagnosticService';
import type { DiagnosticResult } from '../types/diagnosticTypes';
import '../diagnostic.css';

/**
 * Trang Báo cáo kết quả chẩn đoán và Biểu đồ Radar năng lực 7 chiều (UC07).
 * Hỗ trợ đầy đủ:
 * - Xem kết quả theo attemptId hoặc kết quả gần nhất (/diagnostic/results).
 * - Hiển thị điểm TOEIC quy đổi thang 990, bảng 7 Part, Radar 7 chiều, Ability cần bồi dưỡng, Part miễn học.
 * - Nhấn vào Part trên Radar để mở rộng danh sách Ability con (Luồng 5a).
 * - Tải báo cáo tóm tắt (Luồng 7a), xử lý chưa có dữ liệu (Ngoại lệ 1b) & tải lại khi lỗi mạng (Ngoại lệ 6a).
 */
export default function DiagnosticResultPage() {
    const { attemptId } = useParams<{ attemptId: string }>();
    const navigate = useNavigate();

    const [result, setResult] = useState<DiagnosticResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [notCompletedYet, setNotCompletedYet] = useState(false);
    const [expandedPartNo, setExpandedPartNo] = useState<number | null>(null);

    const fetchResult = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setNotCompletedYet(false);

        try {
            const res = attemptId
                ? await diagnosticService.getResults(attemptId)
                : await diagnosticService.getLatestResults();

            if (res.success && res.data) {
                setResult(res.data);
            } else {
                setError(res.message || 'Không thể tải báo cáo kết quả.');
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const data = err.response?.data as { code?: string; message?: string } | undefined;
                if (data?.code === 'DIAGNOSTIC_NOT_COMPLETED') {
                    setNotCompletedYet(true);
                    setError(
                        data.message ||
                            'Bạn chưa có dữ liệu bài thi chẩn đoán. Vui lòng tham gia làm bài kiểm tra đầu vào trước.'
                    );
                    return;
                }
                setError(data?.message || 'Mất kết nối hoặc không thể tải chi tiết báo cáo.');
            } else {
                setError('Không thể tải báo cáo kết quả. Vui lòng thử lại.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [attemptId]);

    useEffect(() => {
        void fetchResult();
    }, [fetchResult]);

    const handleSelectPartFromRadar = (partNo: number) => {
        setExpandedPartNo((prev) => (prev === partNo ? null : partNo));
        const targetEl = document.getElementById(`diag-part-card-${partNo}`);
        targetEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // UC07 Luồng thay thế 7a: Tải báo cáo tóm tắt dạng HTML/text sạch đẹp không phụ thuộc thư viện nặng
    const handleDownloadSummary = () => {
        if (!result) return;

        const lines = [
            `BAO CAO CHAN DOAN NANG LUC TOEIC - LEBY`,
            `========================================`,
            `Bai thi: ${result.testTitle}`,
            `Ngay hoan thanh: ${result.completedAt ? new Date(result.completedAt).toLocaleString('vi-VN') : '-'}`,
            `Diem du doan TOEIC: ${result.predictedScore} / 990`,
            `Muc tieu AIM: ${result.targetScore ?? '-'}`,
            `So cau dung: ${result.correctAnswers} / ${result.totalQuestions}`,
            `Listening: ${result.sectionScores.listeningPercent}% (${result.sectionScores.listening}/495)`,
            `Reading: ${result.sectionScores.readingPercent}% (${result.sectionScores.reading}/495)`,
            ``,
            `CHI TIET 7 PHAN THI TOEIC:`,
            ...result.partResults.map(
                (p) => `- ${p.name}: ${p.score}% (${p.correctCount}/${p.totalQuestions}) | ${p.directiveLabel}`
            ),
            ``,
            `NHOM NANG LUC CAN BOI DUONG:`,
            ...(result.weakAbilities.length > 0
                ? result.weakAbilities.map(
                      (ab) => `- [Part ${ab.partNo}] ${ab.abilityName}: ${ab.accuracyPercent}% (${ab.correctCount}/${ab.totalCount})`
                  )
                : ['- Khong co nang luc yeu dang ke']),
            ``,
            `KHUYEN NGHI LO TRINH:`,
            result.aiRoadmapSummary?.radarInsight || '',
        ];

        const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leby-diagnostic-report-${result.attemptId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="diag-loading-page">
                <div className="diag-spinner" />
                <p>Hệ thống đang hoàn thiện phân tích dữ liệu chẩn đoán của bạn. Vui lòng đợi trong giây lát...</p>
            </div>
        );
    }

    if (notCompletedYet) {
        return (
            <div className="diag-state-page">
                <div className="diag-state-card">
                    <div className="diag-state-card__icon">
                        <AlertTriangle size={36} color="#ea580c" />
                    </div>
                    <h2 className="diag-state-card__title">Bạn chưa có dữ liệu bài thi chẩn đoán</h2>
                    <p className="diag-state-card__desc">{error}</p>
                    <div className="diag-state-card__actions">
                        <button
                            type="button"
                            className="diag-action-btn is-submit"
                            onClick={() => navigate('/diagnostic/room')}
                        >
                            Tham gia làm bài chẩn đoán ngay
                        </button>
                        <Link to="/dashboard" className="diag-action-btn is-outline">
                            Quay về tổng quan
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="diag-state-page">
                <div className="diag-state-card">
                    <div className="diag-state-card__icon">
                        <AlertTriangle size={36} color="#dc2626" />
                    </div>
                    <h2 className="diag-state-card__title">Không thể tải dữ liệu báo cáo</h2>
                    <p className="diag-state-card__desc">{error || 'Không tìm thấy kết quả bài thi.'}</p>
                    <div className="diag-state-card__actions">
                        <button
                            type="button"
                            className="diag-action-btn is-submit"
                            onClick={() => void fetchResult()}
                        >
                            <RotateCcw size={16} />
                            <span>Tải lại dữ liệu báo cáo</span>
                        </button>
                        <Link to="/dashboard" className="diag-action-btn is-outline">
                            Quay về trang chủ
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="diag-result-page">
            <section className="diag-hero-banner">
                <div className="diag-hero-banner__container">
                    <div className="diag-hero-banner__left">
                        <nav className="diag-breadcrumb" aria-label="Đường dẫn trang">
                            <Link to="/dashboard">Tổng quan</Link>
                            <ChevronRight size={14} />
                            <span>Diagnostic Test</span>
                            <ChevronRight size={14} />
                            <span className="is-active">Kết quả phân tích</span>
                        </nav>

                        <h1 className="diag-hero-banner__title">Kết quả đánh giá năng lực của bạn</h1>
                        <p className="diag-hero-banner__desc">
                            {result.testTitle} • Chính xác {result.correctAnswers}/{result.totalQuestions} câu
                            {result.targetScore ? ` • Mục tiêu AIM ${result.targetScore}` : ''}
                        </p>
                    </div>

                    <div className="diag-hero-banner__score-card">
                        <span className="diag-hero-banner__score-label">ĐIỂM DỰ ĐOÁN TOEIC</span>
                        <div className="diag-hero-banner__score-val">{result.predictedScore}</div>
                        <span className="diag-hero-banner__score-sub">/ 990 điểm quy đổi</span>
                    </div>
                </div>
            </section>

            <main className="diag-result-body">
                <div className="diag-result-container">
                    <section className="diag-result-left">
                        <h2 className="diag-section-title">Chi tiết năng lực theo từng phần thi</h2>
                        <div className="diag-part-list">
                            {result.partResults.map((part) => (
                                <PartResultCard
                                    key={part.partNo}
                                    result={part}
                                    isExpanded={expandedPartNo === part.partNo}
                                    onToggleExpand={() =>
                                        setExpandedPartNo((prev) => (prev === part.partNo ? null : part.partNo))
                                    }
                                />
                            ))}
                        </div>

                        {/* UC07 Bước 5: Nhóm năng lực cần bồi dưỡng & Các phần thi được miễn học */}
                        <div className="diag-ability-summary-grid">
                            <div className="diag-summary-box">
                                <h3 className="diag-summary-box__title">
                                    <Target size={18} color="#ea580c" />
                                    <span>Năng lực cần tập trung bồi dưỡng ({result.weakAbilities.length})</span>
                                </h3>
                                {result.weakAbilities.length > 0 ? (
                                    <ul className="diag-summary-list">
                                        {result.weakAbilities.map((ab) => (
                                            <li key={`${ab.partNo}-${ab.abilityId}`} className="diag-summary-list__item">
                                                <div>
                                                    <strong>Part {ab.partNo}:</strong> {ab.abilityName}
                                                </div>
                                                <span className="diag-summary-list__score">
                                                    {ab.accuracyPercent}% ({ab.correctCount}/{ab.totalCount})
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="diag-summary-box__empty">
                                        Tuyệt vời! Bạn chưa ghi nhận năng lực nào yếu cần bồi dưỡng khẩn cấp.
                                    </p>
                                )}
                            </div>

                            <div className="diag-summary-box">
                                <h3 className="diag-summary-box__title">
                                    <Award size={18} color="#059669" />
                                    <span>Phần thi đạt chuẩn &amp; được miễn học ({result.passedParts.length})</span>
                                </h3>
                                {result.passedParts.length > 0 ? (
                                    <ul className="diag-summary-list">
                                        {result.passedParts.map((partName) => (
                                            <li key={partName} className="diag-summary-list__item is-pass">
                                                <span>{partName}</span>
                                                <CheckCircle2 size={16} color="#059669" />
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="diag-summary-box__empty">
                                        Hiện chưa có phần thi nào vượt ngưỡng miễn học. Hệ thống sẽ tối ưu từng mô-đun theo năng lực của bạn.
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    <aside className="diag-result-right">
                        <div className="diag-radar-card">
                            <h3 className="diag-radar-card__title">Biểu đồ năng lực 7 chiều</h3>
                            <div className="diag-radar-card__sub">
                                Listening: {result.sectionScores.listeningPercent}% ({result.sectionScores.listening}/495) | Reading:{' '}
                                {result.sectionScores.readingPercent}% ({result.sectionScores.reading}/495)
                            </div>

                            <div className="diag-radar-card__canvas-box">
                                <RadarChart
                                    abilities={result.abilitiesRadar}
                                    size={300}
                                    selectedPartNo={expandedPartNo}
                                    onSelectPart={handleSelectPartFromRadar}
                                />
                            </div>

                            <p className="diag-radar-card__insight">
                                {result.aiRoadmapSummary.radarInsight}
                            </p>
                        </div>

                        <div className="diag-roadmap-card">
                            {result.learningPathId != null ? (
                                <>
                                    <h3 className="diag-roadmap-card__title">Lộ trình học đã sẵn sàng!</h3>
                                    <p className="diag-roadmap-card__desc">
                                        {result.aiRoadmapSummary.focusParts.length > 0
                                            ? `LEBY đã thiết kế lộ trình thích ứng với ${result.aiRoadmapSummary.moduleCount} mô-đun trọng tâm tập trung cải thiện Part ${result.aiRoadmapSummary.focusParts.join(', ')}.`
                                            : 'Bạn đã đạt chuẩn toàn bộ các phần thi cho mục tiêu hiện tại!'}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h3 className="diag-roadmap-card__title">Định hướng ôn tập theo kết quả</h3>
                                    <p className="diag-roadmap-card__desc">
                                        {result.aiRoadmapSummary.focusParts.length > 0
                                            ? `Dựa trên kết quả chẩn đoán, bạn nên ưu tiên củng cố Part ${result.aiRoadmapSummary.focusParts.join(', ')} để đạt mục tiêu đề ra.`
                                            : 'Bạn đã đạt chuẩn toàn bộ các phần thi cho mục tiêu hiện tại!'}
                                    </p>
                                </>
                            )}

                            <div className="diag-roadmap-card__actions">
                                {result.learningPathId != null ? (
                                    <Link to="/learning-path" className="diag-roadmap-btn is-primary">
                                        {result.aiRoadmapSummary.recommendedAction || 'Xem lộ trình học cá nhân của tôi'}
                                    </Link>
                                ) : (
                                    <Link to="/dashboard" className="diag-roadmap-btn is-primary">
                                        Quay về trang tổng quan
                                    </Link>
                                )}

                                <button
                                    type="button"
                                    className="diag-roadmap-btn is-outline"
                                    onClick={handleDownloadSummary}
                                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    <Download size={16} />
                                    <span>{result.aiRoadmapSummary.secondaryAction || 'Tải báo cáo tóm tắt'}</span>
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
