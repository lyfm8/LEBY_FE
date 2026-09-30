import React from 'react';
import type { DashboardStats } from '../types';
import { Users, TrendingUp, BookOpen, CheckCircle } from 'lucide-react';

interface StatCardGridProps {
  stats: DashboardStats;
}

export const StatCardGrid: React.FC<StatCardGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">Tổng học viên</p>
            <h3 className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</h3>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Users size={20} />
          </div>
        </div>
        <div className={`text-sm mt-4 flex items-center ${stats.totalUsersGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp size={16} className="mr-1" />
          <span>{stats.totalUsersGrowthPercent > 0 ? '+' : ''}{stats.totalUsersGrowthPercent}% so với tháng trước</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">HV Active Tháng này</p>
            <h3 className="text-2xl font-bold">{stats.activeUsersThisMonth.toLocaleString()}</h3>
          </div>
          <div className="p-2 bg-green-50 text-green-600 rounded-lg">
            <Users size={20} />
          </div>
        </div>
        <div className={`text-sm mt-4 flex items-center ${stats.activeUsersGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp size={16} className="mr-1" />
          <span>{stats.activeUsersGrowthPercent > 0 ? '+' : ''}{stats.activeUsersGrowthPercent}% so với tháng trước</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">Tổng Module</p>
            <h3 className="text-2xl font-bold">{stats.totalModules.toLocaleString()}</h3>
          </div>
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <BookOpen size={20} />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">Module học liệu trên hệ thống</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">Lượt làm Test</p>
            <h3 className="text-2xl font-bold">{stats.totalTestsCompleted.toLocaleString()}</h3>
          </div>
          <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
            <CheckCircle size={20} />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">Tổng số lượt nộp bài test</p>
      </div>
    </div>
  );
};
