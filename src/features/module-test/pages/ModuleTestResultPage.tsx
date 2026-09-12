import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { moduleTestService } from '../services/moduleTestService';
import type { ModuleTestPerformanceReport } from '../types/moduleTestTypes';
import { SidebarNav } from '@/features/roadmap/components/SidebarNav';
import { ResultScoreCard } from '../components/ResultScoreCard';
import { ResultMetricsGrid } from '../components/ResultMetricsGrid';
import { ResultHistoryTable } from '../components/ResultHistoryTable';
import '../result-report.css';

export default function ModuleTestResultPage() {
    const { moduleId, attemptId } = useParams<{ moduleId?: string; attemptId?: string }>();
    const [report, setReport] = useState<ModuleTestPerformanceReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const attId = attemptId ? parseInt(attemptId, 10) : 901;
        const modId = moduleId ? parseInt(moduleId, 10) : 2;

        moduleTestService
            .getPerformanceReport(attId, modId)
            .then((res) => {
                if (res.success && res.data) {
                    setReport(res.data);
                }
            })
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, [moduleId, attemptId]);

    if (isLoading || !report) {
        return (
            <div className="app-layout">
                <SidebarNav />
                <main className="report-content-container" style={{ flex: 1 }}>
                    <p style={{ color: '#64748b', marginTop: 40 }}>Đang tải báo cáo kết quả kiểm tra...</p>
                </main>
            </div>
        );
    }

    const currentModId = report.moduleId || 2;
    const currentAttId = report.attemptId || 901;

    return (
        <div className="app-layout">
            {/* Sidebar Điều Hướng Thống Nhất */}
            <SidebarNav />

            {/* Nội Dung Báo Cáo */}
            <main className="report-content-container" style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
                {/* Header Tiêu Đề */}
                <header>
                    <div className="report-meta-badge">BÁO CÁO KẾT QUẢ KIỂM TRA</div>
                    <h1 className="report-main-title">Kết quả kiểm tra: {report.moduleTitle}</h1>
                    <p className="report-subtitle">
                        Lộ trình thích ứng thông minh LEBY • Hoàn thành lúc: {report.completedAt}
                    </p>
                </header>

                {/* 1. Thẻ Điểm Số & Lời Khuyên AI */}
                <ResultScoreCard report={report} />

                {/* 2. Phân Tích Năng Lực Chi Tiết (3 Thẻ Chỉ Số) */}
                <ResultMetricsGrid metrics={report.metrics} />

                {/* 3. Lịch Sử Nỗ Lực Luyện Tập (Bảng Các Lần Thi) */}
                <ResultHistoryTable history={report.history} />

                {/* 4. Các Nút Hành Động Phía Dưới */}
                <div className="report-actions-row">
                    <Link to="/learning-path" className="report-btn-primary">
                        Tiếp tục lộ trình học
                    </Link>
                    <Link to={`/modules/${currentModId}/test`} className="report-btn-secondary">
                        Làm lại bài kiểm tra
                    </Link>
                </div>

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Link
                        to={`/modules/${currentModId}/test/review/${currentAttId}`}
                        className="report-review-link"
                    >
                        Xem lại đáp án chi tiết & giải thích từng câu hỏi →
                    </Link>
                </div>
            </main>
        </div>
    );
}
