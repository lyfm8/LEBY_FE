import type { AttemptHistoryItem } from '../types/moduleTestTypes';

interface ResultHistoryTableProps {
    history: AttemptHistoryItem[];
}

export function ResultHistoryTable({ history }: ResultHistoryTableProps) {
    return (
        <section className="report-history-section" aria-label="Lịch sử nỗ lực luyện tập">
            <h2 className="report-section-title">Lịch sử nỗ lực luyện tập</h2>

            <div className="history-table-container">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Lần thử</th>
                            <th>Ngày làm bài</th>
                            <th>Điểm số</th>
                            <th>Kết quả</th>
                            <th>Thời gian làm</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((item) => (
                            <tr key={item.attemptNumber}>
                                <td className="history-attempt-cell">
                                    Lần {item.attemptNumber} {item.isLatest && <span className="latest-tag">(Mới nhất)</span>}
                                </td>
                                <td>{item.completedAt}</td>
                                <td className={item.isPassed ? 'score-cell--pass' : 'score-cell--fail'}>
                                    {item.score}/{item.maxScore}
                                </td>
                                <td>
                                    <span className={`table-badge ${item.isPassed ? 'table-badge--pass' : 'table-badge--fail'}`}>
                                        {item.isPassed ? 'ĐẠT (PASS)' : 'CHƯA ĐẠT (FAIL)'}
                                    </span>
                                </td>
                                <td>{item.durationFormatted}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
