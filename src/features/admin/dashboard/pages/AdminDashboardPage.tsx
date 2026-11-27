import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminDashboardService } from '../services/adminDashboardService';
import type { DashboardSummary, TimeRangeFilter } from '../types';
import { StatCardGrid } from '../components/StatCardGrid';
import { ChartSection } from '../components/ChartSection';
import { RecentActivityTable } from '../components/RecentActivityTable';
import { Loader2, AlertCircle, RefreshCw, Download, Database } from 'lucide-react';
import '../admin-dashboard.css';

/**
 * Container Component (Smart) quản lý toàn bộ luồng dữ liệu và tương tác của Admin Dashboard (A01).
 *
 * Tiêu chuẩn kiến trúc tuân thủ:
 * - Đồng bộ tham số bộ lọc lên URL qua useSearchParams (Quy chuẩn FE số 14).
 * - Xử lý trọn vẹn 4 trạng thái giao diện: Loading, Error, Empty, Success (Quy chuẩn FE số 8).
 * - Tích hợp xuất file CSV native an toàn phía Client (YAGNI & Tiết kiệm tài nguyên server).
 */
export const AdminDashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const timeRangeParam = (searchParams.get('timeRange') as TimeRangeFilter) || 'all';

  const [timeRange, setTimeRange] = useState<TimeRangeFilter>(timeRangeParam);
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Khi URL query thay đổi, đồng bộ lại local state
  useEffect(() => {
    if (timeRangeParam !== timeRange) {
      setTimeRange(timeRangeParam);
    }
  }, [timeRangeParam, timeRange]);

  /**
   * Gọi API nạp dữ liệu thống kê tổng hợp từ Backend.
   */
  const fetchSummary = useCallback(async (range: TimeRangeFilter, isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await adminDashboardService.getSummary(range);

      if (response.success && response.data) {
        setData(response.data);
        setError(null);
      } else {
        setError(response.message || 'Lấy dữ liệu dashboard thất bại');
      }
    } catch (err: unknown) {
      console.error('[AdminDashboardPage] fetchSummary error:', err);
      setError('Có lỗi xảy ra khi tải dữ liệu dashboard. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Tự động fetch mỗi khi timeRange thay đổi
  useEffect(() => {
    fetchSummary(timeRange);
  }, [timeRange, fetchSummary]);

  /**
   * Chuyển đổi bộ lọc thời gian và đồng bộ ngay lên URL.
   */
  const handleRangeChange = (newRange: TimeRangeFilter) => {
    setTimeRange(newRange);
    setSearchParams(newRange === 'all' ? {} : { timeRange: newRange });
  };

  /**
   * Xuất báo cáo CSV trực tiếp từ dữ liệu Client (Native Blob).
   */
  const handleExportCSV = () => {
    if (!data) return;

    const rows = [
      ['CHI SO', 'GIA TRI'],
      ['Tong hoc vien', data.stats.totalUsers],
      ['Tang truong hoc vien (%)', data.stats.totalUsersGrowthPercent],
      ['Hoc vien Active thang nay', data.stats.activeUsersThisMonth],
      ['Tang truong Active (%)', data.stats.activeUsersGrowthPercent],
      ['Ty le hoan thanh lo trinh (%)', data.stats.learningPathCompletionRate],
      ['Ty le do bai thi vuot ai (%)', data.stats.moduleTestPassRate],
      ['Tong luot thi hoan thanh', data.stats.totalTestsCompleted],
      ['Tong module hoc lieu', data.stats.totalModules],
      [],
      ['TOP MO-DUN KHO', 'PART', 'LUOT THI', 'LUOT TRUOT', 'TY LE TRUOT (%)'],
      ...data.topDifficultModules.map((m) => [
        `"${m.moduleTitle.replace(/"/g, '""')}"`,
        m.partName,
        m.totalAttempts,
        m.failCount,
        m.failPercent,
      ]),
    ];

    const csvContent = '\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leby_dashboard_report_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1. Trạng thái Đang tải (Loading State)
  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader2 size={36} className="spin-icon dashboard-loading-icon" />
        <p className="dashboard-loading-text">Đang tải và tính toán số liệu tổng quan...</p>
      </div>
    );
  }

  // 2. Trạng thái Lỗi (Error State)
  if (error || !data) {
    return (
      <div className="admin-page-container">
        <div className="dashboard-error-message">
          <AlertCircle size={24} className="dashboard-error-icon" />
          <div className="dashboard-error-content">
            <h4 className="dashboard-error-title">Tải dữ liệu thất bại</h4>
            <p className="dashboard-error-desc">{error || 'Không tìm thấy dữ liệu thống kê'}</p>
          </div>
          <button
            onClick={() => fetchSummary(timeRange)}
            className="btn-dashboard-retry"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // 3. Trạng thái Hệ thống rỗng hoàn toàn (Empty State)
  const isSystemEmpty = data.stats.totalUsers === 0 && data.stats.totalTestsCompleted === 0;

  return (
    <div className="admin-page-container">
      {/* Thanh Header điều khiển và Bộ lọc */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Tổng quan hệ thống</h1>
          <p className="admin-page-subtitle">
            Trung tâm chỉ huy theo dõi hoạt động học tập, kết quả thi và tăng trưởng nền tảng
          </p>
        </div>

        <div className="dashboard-controls">
          {/* Bộ lọc thời gian (Time Filter Tabs) */}
          <div className="time-filter-tabs">
            <button
              onClick={() => handleRangeChange('all')}
              className={`time-tab ${timeRange === 'all' ? 'active' : ''}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => handleRangeChange('this_month')}
              className={`time-tab ${timeRange === 'this_month' ? 'active' : ''}`}
            >
              Tháng này
            </button>
            <button
              onClick={() => handleRangeChange('30d')}
              className={`time-tab ${timeRange === '30d' ? 'active' : ''}`}
            >
              30 ngày qua
            </button>
            <button
              onClick={() => handleRangeChange('7d')}
              className={`time-tab ${timeRange === '7d' ? 'active' : ''}`}
            >
              7 ngày qua
            </button>
          </div>

          {/* Nút Làm mới (Refresh) */}
          <button
            onClick={() => fetchSummary(timeRange, true)}
            disabled={isRefreshing}
            className="btn-dashboard-action"
            title="Làm mới dữ liệu tức thì"
          >
            <RefreshCw size={16} className={isRefreshing ? 'spin-icon' : ''} />
            <span>{isRefreshing ? 'Đang tính...' : 'Làm mới'}</span>
          </button>

          {/* Nút Xuất CSV */}
          <button
            onClick={handleExportCSV}
            className="btn-dashboard-action btn-dashboard-primary"
            title="Xuất file báo cáo thống kê CSV"
          >
            <Download size={16} />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {isSystemEmpty ? (
        <div className="dashboard-empty-card">
          <Database size={44} className="dashboard-empty-icon" />
          <h3 className="dashboard-empty-title">Hệ thống chưa ghi nhận dữ liệu học viên</h3>
          <p className="dashboard-empty-desc">
            Số liệu thống kê, biểu đồ tăng trưởng và tỷ lệ đỗ sẽ tự động xuất hiện ngay khi học viên tham gia học và nộp bài thi.
          </p>
        </div>
      ) : (
        <>
          {/* Lưới 4 Thẻ KPI chính + 2 Thẻ phụ */}
          <StatCardGrid stats={data.stats} />

          {/* Biểu đồ Cột đôi Tăng trưởng + Phân bố AIM + Top mô-đun khó */}
          <ChartSection
            usersByMonth={data.usersByMonth}
            aimDistribution={data.aimDistribution}
            topDifficultModules={data.topDifficultModules}
          />

          {/* Bảng Nhật ký Hoạt động Gần đây */}
          <RecentActivityTable activities={data.recentActivities} />
        </>
      )}
    </div>
  );
};
