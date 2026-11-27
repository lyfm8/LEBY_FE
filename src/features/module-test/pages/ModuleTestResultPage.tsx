import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Unlock } from 'lucide-react';
import { SidebarNav } from '@/features/roadmap/components/SidebarNav';
import { parseExamApiError } from '@/shared/exam/utils/examErrorUtils';
import { ResultHistoryTable } from '../components/ResultHistoryTable';
import { ResultMetricsGrid } from '../components/ResultMetricsGrid';
import { ResultScoreCard } from '../components/ResultScoreCard';
import { moduleTestService } from '../services/moduleTestService';
import type { ModuleTestPerformanceReport } from '../types/moduleTestTypes';
import '../result-report.css';

/**
 * Trang Báo cáo kết quả thi vượt ải mô-đun (UC14):
 * Hiển thị điểm số theo chuẩn passScore của mô-đun, nhận xét AI, chỉ số tốc độ/chính xác,
 * lịch sử các lần thi và trạng thái mở khóa mô-đun tiếp theo / Mock Test 200 câu.
 */
export default function ModuleTestResultPage() {
    const navigate = useNavigate();
    const { moduleId, attemptId } = useParams<{ moduleId?: string; attemptId?: string }>();

    const [report, setReport] = useState<ModuleTestPerformanceReport | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadReport = useCallback(async () => {
        const modId = Number(moduleId);
        const attId = Number(attemptId);

        if (
            !moduleId ||
            !attemptId ||
            !Number.isFinite(modId) ||
            !Number.isFinite(attId) ||
            modId <= 0 ||
            attId <= 0
        ) {
            setIsLoading(false);
            setErrorMessage('Thiếu mã mô-đun hoặc mã lượt thi để hiển thị báo cáo kết quả.');
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const res = await moduleTestService.getPerformanceReport(attId, modId);
            setReport(res.data);
        } catch (err) {
            const parsed = parseExamApiError(
                err,
                'Không thể tải báo cáo kết quả bài kiểm tra.'
            );
            if (parsed.status === 401) {
                navigate('/login', { replace: true });
                return;
            }
            setErrorMessage(parsed.message);
        } finally {
            setIsLoading(false);
        }
    }, [moduleId, attemptId, navigate]);

    useEffect(() => {
        void loadReport();
    }, [loadReport]);

    if (isLoading) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <main className="report-content-container">
                    <div className="report-state-box">
                        <p style={{ color: '#64748b' }}>Đang tải báo cáo kết quả kiểm tra...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (errorMessage || !report) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <main className="report-content-container">
                    <div className="report-state-box is-error">
                        <AlertTriangle size={28} color="#dc2626" />
                        <h2>Không thể tải báo cáo kết quả</h2>
                        <p>{errorMessage ?? 'Dữ liệu kết quả không tồn tại hoặc đã bị xóa.'}</p>
                        <div className="report-actions-row">
                            <Link to="/learning-path" className="report-btn-secondary">
                                Về lộ trình học
                            </Link>
                            <button
                                type="button"
                                className="report-btn-primary"
                                onClick={() => void loadReport()}
                            >
                                <RefreshCw size={16} style={{ marginRight: 6 }} />
                                Thử lại
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const currentModId = report.moduleId;
    const currentAttId = report.attemptId;

    return (
        <div className="app-layout">
            <SidebarNav />

            <main className="report-content-container">
                <header className="report-header">
                    <div className="report-meta-badge">BÁO CÁO KẾT QUẢ KIỂM TRA</div>
                    <h1 className="report-main-title">Kết quả kiểm tra: {report.moduleTitle}</h1>
                </header>

                {report.isPassed && !report.isRoadmapCompleted && report.nextModuleId !== null && (
                    <div className="modtest-unlock-banner is-next-module">
                        <Unlock size={20} />
                        <div>
                            <strong>Đã mở khóa mô-đun tiếp theo!</strong>
                            <p>
                                Bạn đã đạt mốc chuẩn {report.passScore}/100 và mở khóa mô-đun kế
                                tiếp trong lộ trình cá nhân hóa.
                            </p>
                        </div>
                    </div>
                )}

                <div className="report-top-grid">
                    <ResultScoreCard report={report} />
                    <ResultMetricsGrid metrics={report.metrics} />
                </div>

                <ResultHistoryTable history={report.history} />

                <footer className="report-actions-bar">
                    <div className="report-actions-row">
                        {report.isPassed && report.nextModuleId !== null ? (
                            <Link to={`/modules/${report.nextModuleId}`} className="report-btn-primary">
                                Học mô-đun tiếp theo
                            </Link>
                        ) : (
                            <Link to="/learning-path" className="report-btn-primary">
                                Tiếp tục lộ trình học
                            </Link>
                        )}

                        <Link to={`/modules/${currentModId}`} className="report-btn-secondary">
                            Quay lại mô-đun
                        </Link>

                        <Link to={`/modules/${currentModId}/test`} className="report-btn-secondary">
                            Làm lại bài kiểm tra
                        </Link>
                    </div>

                    <Link
                        to={`/modules/${currentModId}/test/review/${currentAttId}`}
                        className="report-review-link"
                    >
                        Xem lại đáp án chi tiết &amp; giải thích từng câu hỏi →
                    </Link>
                </footer>
            </main>
        </div>
    );
}
