import type { MetricSummary } from '../types/moduleTestTypes';

interface ResultMetricsGridProps {
    metrics: MetricSummary;
}

export function ResultMetricsGrid({ metrics }: ResultMetricsGridProps) {
    return (
        <section className="report-metrics-section" aria-label="Phân tích năng lực chi tiết">
            <h2 className="report-section-title">Phân tích năng lực chi tiết</h2>

            <div className="report-metrics-grid">
                {/* Metric 1: Accuracy */}
                <div className="metric-card">
                    <div className="metric-card-label">TỶ LỆ CHÍNH XÁC</div>
                    <div className="metric-card-value">{metrics.accuracyRate}%</div>
                    <div className="metric-card-sub">
                        Đúng {metrics.correctAnswers}/{metrics.totalQuestions} câu hỏi
                    </div>
                </div>

                {/* Metric 2: Duration */}
                <div className="metric-card">
                    <div className="metric-card-label">THỜI GIAN LÀM BÀI</div>
                    <div className="metric-card-value">{metrics.durationFormatted}</div>
                    <div className="metric-card-sub">{metrics.speedComparison}</div>
                </div>

                {/* Metric 3: Competency status */}
                <div className="metric-card">
                    <div className="metric-card-label">KHỐI KIẾN THỨC MỤC TIÊU</div>
                    <div className="metric-card-value metric-card-value--green">
                        {metrics.competencyStatus}
                    </div>
                    <div className="metric-card-sub">
                        Đã bù đắp {metrics.gapResolvedPercent}% lỗ hổng
                    </div>
                </div>
            </div>
        </section>
    );
}
