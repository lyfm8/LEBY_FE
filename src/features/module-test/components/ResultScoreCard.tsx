import type { ModuleTestPerformanceReport } from '../types/moduleTestTypes';

interface ResultScoreCardProps {
    report: ModuleTestPerformanceReport;
}

export function ResultScoreCard({ report }: ResultScoreCardProps) {
    const isPassed = report.isPassed;

    return (
        <section className="report-score-card" aria-label="Điểm số đạt được">
            <div className="score-card-header">
                <div>
                    <span className="score-card-label">ĐIỂM SỐ ĐẠT ĐƯỢC</span>
                    <div className="score-card-main-score">
                        <span className="score-number">{report.score}</span>
                        <span className="score-max">/{report.maxScore}</span>
                    </div>
                </div>

                <div
                    className={`score-status-badge ${
                        isPassed ? 'score-status-badge--pass' : 'score-status-badge--fail'
                    }`}
                >
                    {isPassed ? 'HOÀN THÀNH (PASS)' : 'CHƯA ĐẠT (FAIL)'}
                </div>
            </div>
        </section>
    );
}
