import React, { useEffect, useState } from 'react';
import { adminDashboardService } from '../services/adminDashboardService';
import type { DashboardSummary } from '../types';
import { StatCardGrid } from '../components/StatCardGrid';
import { ChartSection } from '../components/ChartSection';
import { RecentActivityTable } from '../components/RecentActivityTable';
import { Loader2, AlertCircle } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        // Bước 1: Gọi API lấy dữ liệu dashboard (chỉ dùng GET, readonly)
        const response = await adminDashboardService.getSummary();
        
        // Bước 2: Kiểm tra dữ liệu thành công
        if (isMounted && response.success && response.data) {
          setData(response.data);
          setError(null);
        } else if (isMounted) {
          setError(response.message || 'Lấy dữ liệu dashboard thất bại');
        }
      } catch (err) {
        if (isMounted) {
          // NOTE: Bắt lỗi mạng hoặc lỗi hệ thống, không hiển thị raw stack trace
          setError('Có lỗi xảy ra khi tải dữ liệu dashboard. Vui lòng thử lại.');
          console.error('[AdminDashboardPage] fetchSummary error:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSummary();

    return () => {
      isMounted = false; // Cleanup tránh memory leak khi unmount
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

      {/* Truyền dữ liệu xuống các Dumb Components */}
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
