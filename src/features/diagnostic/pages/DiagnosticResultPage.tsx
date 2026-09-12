import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PartResultCard } from '../components/PartResultCard';
import { RadarChart } from '../components/RadarChart';
import { diagnosticService } from '../services/diagnosticService';
import type { DiagnosticResult } from '../types/diagnosticTypes';
import '../diagnostic.css';

export default function DiagnosticResultPage() {
    const { attemptId } = useParams<{ attemptId: string }>();
    const [result, setResult] = useState<DiagnosticResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;
        diagnosticService
            .getResults(attemptId || '501')
            .then((res) => {
                if (isMounted && res.success && res.data) {
                    setResult(res.data);
                }
            })
            .catch(() => {
                if (isMounted) setError('Không thể tải báo cáo kết quả.');
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [attemptId]);

    if (isLoading) {
        return (
            <div className="diag-loading-page">
                <div className="diag-spinner" />
                <p>Đang tổng hợp báo cáo và tính toán năng lực toàn diện...</p>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="diag-error-page">
                <p>{error || 'Không tìm thấy kết quả bài thi.'}</p>
                <Link to="/target-selection" className="diag-back-btn">
                    Quay lại chọn mục tiêu
                </Link>
            </div>
        );
    }

    return (
        <div className="diag-result-page">
            <section className="diag-hero-banner">
                <div className="diag-hero-banner__container">
                    <div className="diag-hero-banner__left">
                        <nav className="diag-breadcrumb" aria-label="Đường dẫn trang">
                            <span>Diagnostic Test</span>
                            <ChevronRight size={14} />
                            <span className="is-active">Kết quả phân tích</span>
                        </nav>

                        <h1 className="diag-hero-banner__title">Kết quả đánh giá năng lực của bạn</h1>
                        <p className="diag-hero-banner__desc">
                            Dựa trên phân tích {result.totalQuestions} câu hỏi Diagnostic bằng AI thích ứng.
                        </p>
                    </div>

                    <div className="diag-hero-banner__score-card">
                        <span className="diag-hero-banner__score-label">ĐIỂM DỰ ĐOÁN BAN ĐẦU</span>
                        <div className="diag-hero-banner__score-val">{result.predictedScore}</div>
                    </div>
                </div>
            </section>

            <main className="diag-result-body">
                <div className="diag-result-container">
                    <section className="diag-result-left">
                        <h2 className="diag-section-title">Chi tiết năng lực theo từng phần thi</h2>
                        <div className="diag-part-list">
                            {result.partResults.map((part) => (
                                <PartResultCard key={part.partNo} result={part} />
                            ))}
                        </div>
                    </section>

                    <aside className="diag-result-right">
                        <div className="diag-radar-card">
                            <h3 className="diag-radar-card__title">Biểu đồ năng lực tổng quát</h3>
                            <div className="diag-radar-card__sub">
                                Listening: {result.sectionScores.listeningPercent}% | Reading:{' '}
                                {result.sectionScores.readingPercent}%
                            </div>

                            <div className="diag-radar-card__canvas-box">
                                <RadarChart abilities={result.abilitiesRadar} size={280} />
                            </div>

                            <p className="diag-radar-card__insight">
                                {result.aiRoadmapSummary.radarInsight}
                            </p>
                        </div>

                        <div className="diag-roadmap-card">
                            <h3 className="diag-roadmap-card__title">Lộ trình học đã sẵn sàng!</h3>
                            <p className="diag-roadmap-card__desc">
                                Leby AI đã thiết kế lộ trình thích ứng {result.aiRoadmapSummary.roadmapDays} ngày
                                giúp bạn khắc phục Part{' '}
                                {result.aiRoadmapSummary.focusParts.join(' & ')} một cách cô đọng nhất.
                            </p>

                            <div className="diag-roadmap-card__actions">
                                <Link to="/home" className="diag-roadmap-btn is-primary">
                                    {result.aiRoadmapSummary.recommendedAction}
                                </Link>

                                <button
                                    type="button"
                                    className="diag-roadmap-btn is-outline"
                                    onClick={() => alert('Chức năng đánh giá chuyên sâu đang mở theo lộ trình.')}
                                >
                                    {result.aiRoadmapSummary.secondaryAction}
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
