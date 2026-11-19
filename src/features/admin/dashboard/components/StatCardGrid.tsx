import React from 'react';
import type { DashboardStats } from '../types';
import { Users, UserCheck, TrendingUp, TrendingDown, Award, Target, BookOpen, CheckCircle } from 'lucide-react';

interface StatCardGridProps {
  stats: DashboardStats;
}

export const StatCardGrid: React.FC<StatCardGridProps> = ({ stats }) => {
  return (
    <div className="stat-grid">
      {/* 1. Tổng số học viên */}
      <div className="stat-card">
        <div className="stat-card-header">
          <div>
            <p className="stat-card-title">Tổng học viên đã đăng ký</p>
            <h3 className="stat-value">{stats.totalUsers.toLocaleString()}</h3>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <Users size={22} />
          </div>
        </div>
        <div className={`stat-growth ${stats.totalUsersGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {stats.totalUsersGrowthPercent >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>
            {stats.totalUsersGrowthPercent > 0 ? '+' : ''}
            {stats.totalUsersGrowthPercent}% so với tháng trước
          </span>
        </div>
      </div>

      {/* 2. Học viên hoạt động tháng này */}
      <div className="stat-card">
        <div className="stat-card-header">
          <div>
            <p className="stat-card-title">Học viên hoạt động tháng này</p>
            <h3 className="stat-value">{stats.activeUsersThisMonth.toLocaleString()}</h3>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            <UserCheck size={22} />
          </div>
        </div>
        <div className={`stat-growth ${stats.activeUsersGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {stats.activeUsersGrowthPercent >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>
            {stats.activeUsersGrowthPercent > 0 ? '+' : ''}
            {stats.activeUsersGrowthPercent}% so với tháng trước
          </span>
        </div>
      </div>

      {/* 3. Tỷ lệ hoàn thành lộ trình học tập */}
      <div className="stat-card">
        <div className="stat-card-header">
          <div>
            <p className="stat-card-title">Tỷ lệ hoàn thành lộ trình</p>
            <h3 className="stat-value">{stats.learningPathCompletionRate}%</h3>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#faf5ff', color: '#9333ea' }}>
            <Award size={22} />
          </div>
        </div>
        <div className="stat-progress-bar">
          <div
            className="stat-progress-fill bg-purple-600"
            style={{ width: `${Math.min(100, Math.max(0, stats.learningPathCompletionRate))}%` }}
          />
        </div>
      </div>

      {/* 4. Tỷ lệ đỗ bài thi vượt ải trung bình */}
      <div className="stat-card">
        <div className="stat-card-header">
          <div>
            <p className="stat-card-title">Tỷ lệ đỗ bài thi vượt ải</p>
            <h3 className="stat-value">{stats.moduleTestPassRate}%</h3>
          </div>
          <div className="stat-icon" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}>
            <Target size={22} />
          </div>
        </div>
        <div className="stat-progress-bar">
          <div
            className="stat-progress-fill bg-orange-500"
            style={{ width: `${Math.min(100, Math.max(0, stats.moduleTestPassRate))}%` }}
          />
        </div>
      </div>

      {/* 5. Tổng mô-đun học liệu (Phụ) */}
      <div className="stat-card stat-card-sub">
        <div className="stat-card-header">
          <div>
            <p className="stat-card-title">Mô-đun học liệu</p>
            <h4 className="stat-sub-value">{stats.totalModules.toLocaleString()}</h4>
          </div>
          <div className="stat-icon-sm" style={{ color: '#0284c7' }}>
            <BookOpen size={18} />
          </div>
        </div>
        <p className="stat-sub-desc">Tổng mô-đun trên hệ thống</p>
      </div>

      {/* 6. Tổng lượt thi hoàn thành (Phụ) */}
      <div className="stat-card stat-card-sub">
        <div className="stat-card-header">
          <div>
            <p className="stat-card-title">Lượt thi hoàn thành</p>
            <h4 className="stat-sub-value">{stats.totalTestsCompleted.toLocaleString()}</h4>
          </div>
          <div className="stat-icon-sm" style={{ color: '#059669' }}>
            <CheckCircle size={18} />
          </div>
        </div>
        <p className="stat-sub-desc">Lượt nộp bài vượt ải module</p>
      </div>
    </div>
  );
};
