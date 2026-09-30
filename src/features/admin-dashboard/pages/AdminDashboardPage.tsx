import React, { useEffect, useState } from 'react';
import { adminDashboardService } from '../services/adminDashboardService';
import type { DashboardSummary } from '../types';
import { StatCardGrid } from '../components/StatCardGrid';
import { ChartSection } from '../components/ChartSection';
import { RecentActivityTable } from '../components/RecentActivityTable';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * Container Component (Smart) xử lý logic hiển thị Trang tổng quan (Dashboard) cho Admin.
 * 
 * LƯU Ý KIẾN TRÚC:
 * - Component này đóng vai trò lấy toàn bộ dữ liệu từ API một lần khi mount.
 * - Sau đó phân phối dữ liệu xuống các Presentational Components (Dumb components) 
 *   như StatCardGrid, ChartSection để render biểu đồ và bảng, nhằm tách bạch logic fetch API.
 * 
 * @returns React Component render toàn bộ Dashboard
 */
export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        // Bước 1: Gọi API lấy dữ liệu thống kê tổng quan hệ thống
        const response = await adminDashboardService.getSummary();
        
        // Bước 2: Kiểm tra dữ liệu thành công và set vào State
        if (isMounted && response.success && response.data) {
          setData(response.data);
          setError(null);
        } else if (isMounted) {
          setError(response.message || 'Lấy dữ liệu dashboard thất bại');
        }
      } catch (err) {
        if (isMounted) {
          // NOTE: Bắt lỗi kết nối mạng hoặc lỗi server, chỉ hiển thị thông báo an toàn, 
          // tuyệt đối không hiển thị raw error (stack trace) ra UI
          setError('Có lỗi xảy ra khi tải dữ liệu dashboard. Vui lòng thử lại.');
          console.error('[AdminDashboardPage] fetchSummary error:', err);
        }
      } finally {
        // Bước 3: Tắt cờ loading sau khi load xong (dù thành công hay thất bại)
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSummary();

    // Tối ưu: Dọn dẹp cờ isMounted khi unmount để tránh rò rỉ bộ nhớ (memory leak) nếu người dùng chuyển trang nhanh
    return () => {
      isMounted = false; 
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-red-500">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium">{error || 'Không có dữ liệu'}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
        <p className="text-gray-500 mt-1">Theo dõi hoạt động và chỉ số quan trọng của học viên</p>
      </div>

      {/* Truyền dữ liệu từ Container xuống các Presentational Components */}
      <StatCardGrid stats={data.stats} />
      <ChartSection 
        usersByMonth={data.usersByMonth}
        aimDistribution={data.aimDistribution}
        moduleTestPassRate={data.moduleTestPassRate}
      />
      <RecentActivityTable activities={data.recentActivities} />
    </div>
  );
};

