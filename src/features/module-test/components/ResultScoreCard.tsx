import { Sparkles } from 'lucide-react';
import type { ModuleTestPerformanceReport } from '../types/moduleTestTypes';

interface ResultScoreCardProps {
    report: ModuleTestPerformanceReport;
}

export function ResultScoreCard({ report }: ResultScoreCardProps) {
    const isPassed = report.isPassed;
    const progressPercent = Math.min(100, Math.round((report.score / report.maxScore) * 100));

    return (
        <section className="report-score-card" aria-label="Điểm số đạt được">
            {/* Header: Label + Status Badge */}
            <div className="score-card-header">
                <div>
                    <span className="score-card-label">ĐIỂM SỐ ĐẠT ĐƯỢC</span>
                    <div className="score-card-main-score">
                        <span className="score-number">{report.score}</span>
                        <span className="score-max">/{report.maxScore}</span>
                    </div>
                </div>

                <div className={`score-status-badge ${isPassed ? 'score-status-badge--pass' : 'score-status-badge--fail'}`}>
                    {isPassed ? 'HOÀN THÀNH (PASS)' : 'CHƯA ĐẠT (FAIL)'}
                </div>
            </div>

            {/* Target vs Actual line */}
            <div className="score-target-row">
                <span className="target-req-text">
                    Yêu cầu tối thiểu: {report.passScore} điểm
                </span>
                <span className={`target-actual-text ${isPassed ? 'target-actual-text--green' : 'target-actual-text--red'}`}>
                    Đạt được: {report.score} điểm ({report.diffFromPass >= 0 ? `+${report.diffFromPass}` : `${report.diffFromPass}`})
                </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="score-progress-bar-container">
                <div
                    className={`score-progress-bar-fill ${isPassed ? 'score-progress-bar-fill--pass' : 'score-progress-bar-fill--fail'}`}
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* AI Recommendation Banner */}
            <div className="ai-feedback-banner">
                <div className="ai-feedback-icon-wrapper">
                    <Sparkles size={20} className="ai-feedback-icon" />
                </div>
                <div className="ai-feedback-body">
                    <div className="ai-feedback-title">{report.aiFeedback.title}</div>
                    <div className="ai-feedback-content">{report.aiFeedback.content}</div>
                </div>
            </div>
        </section>
    );
}
