import type { MetricSummary } from '../types/moduleTestTypes';

interface ResultMetricsGridProps {
    metrics: MetricSummary;
}

export function ResultMetricsGrid({ metrics }: ResultMetricsGridProps) {
    return (
        <section className="report-metrics-section" aria-label="Phân tích năng lực chi tiết">
            <h2 className="report-metrics-eyebrow">PHÂN TÍCH NĂNG LỰC CHI TIẾT</h2>

            <div className="report-metrics-grid">
                {/* Metric 1: Accuracy */}
                <div className="metric-card">
                    <div className="metric-card-label">TỶ LỆ CHÍNH XÁC</div>
                    <div className="metric-card-value">{metrics.accuracyRate}%</div>
                </div>

                {/* Metric 2: Duration */}
                <div className="metric-card">
                    <div className="metric-card-label">THỜI GIAN LÀM BÀI</div>
                    <div className="metric-card-value">{metrics.durationFormatted}</div>
                </div>
            </div>
        </section>
    );
}
