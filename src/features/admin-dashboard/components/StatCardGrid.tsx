import React from 'react';
import type { DashboardStats } from '../types';
import { Users, TrendingUp, BookOpen, CheckCircle } from 'lucide-react';

interface StatCardGridProps {
  stats: DashboardStats;
}

export const StatCardGrid: React.FC<StatCardGridProps> = ({ stats }) => {
  return (
    <div className="stat-grid">
      <div className="stat-card">
        <div className="stat-card-header">
          <div>
            <p className="stat-card-title">Tổng học viên</p>
            <h3 className="stat-value">{stats.totalUsers.toLocaleString()}</h3>
          </div>
          <div className="stat-icon" style={{ color: '#2563eb' }}>
            <Users size={20} />
          </div>
        </div>
        <div className={`stat-growth ${stats.totalUsersGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp size={16} />
          <span>{stats.totalUsersGrowthPercent > 0 ? '+' : ''}{stats.totalUsersGrowthPercent}% so với tháng trước</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <div>
            <p className="stat-card-title">HV Active Tháng này</p>
            <h3 className="stat-value">{stats.activeUsersThisMonth.toLocaleString()}</h3>
          </div>
          <div className="stat-icon" style={{ color: '#16a34a' }}>
            <Users size={20} />
          </div>
        </div>
        <div className={`stat-growth ${stats.activeUsersGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp size={16} />
          <span>{stats.activeUsersGrowthPercent > 0 ? '+' : ''}{stats.activeUsersGrowthPercent}% so với tháng trước</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <div>
            <p className="stat-card-title">Tổng Module</p>
            <h3 className="stat-value">{stats.totalModules.toLocaleString()}</h3>
          </div>
          <div className="stat-icon" style={{ color: '#9333ea' }}>
            <BookOpen size={20} />
          </div>
        </div>
        <p className="text-gray-500" style={{ fontSize: '0.875rem', marginTop: '1rem' }}>Module học liệu trên hệ thống</p>
      </div>

      <div className="stat-card">
        <div className="stat-card-header">
          <div>
            <p className="stat-card-title">Lượt làm Test</p>
            <h3 className="stat-value">{stats.totalTestsCompleted.toLocaleString()}</h3>
          </div>
          <div className="stat-icon" style={{ color: '#ea580c' }}>
            <CheckCircle size={20} />
          </div>
        </div>
        <p className="text-gray-500" style={{ fontSize: '0.875rem', marginTop: '1rem' }}>Tổng số lượt nộp bài test</p>
      </div>
    </div>
  );
};
