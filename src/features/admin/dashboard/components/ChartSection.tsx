import React from 'react';
import type { UsersByMonth, AimDistribution, TopDifficultModule } from '../types';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChartSectionProps {
  usersByMonth: UsersByMonth[];
  aimDistribution: AimDistribution[];
  topDifficultModules: TopDifficultModule[];
}

/**
 * Rút gọn nhãn Part TOEIC hiển thị trên badge để không chiếm quá nhiều không gian.
 * Ví dụ: "Part 2: Question - Response" -> "Part 2"
 */
const formatPartBadge = (partName?: string): string => {
  if (!partName) return 'Part N/A';
  const match = partName.match(/^Part\s*\d+/i);
  return match ? match[0] : partName;
};

export const ChartSection: React.FC<ChartSectionProps> = ({
  usersByMonth,
  aimDistribution,
  topDifficultModules,
}) => {
  const navigate = useNavigate();

  // Tìm giá trị max để scale chiều cao cột biểu đồ kép
  const maxVal = Math.max(
    ...usersByMonth.flatMap((u) => [u.newUsersCount, u.testSubmissionsCount]),
    1
  );

  // Mảng màu trực quan cho từng mốc AIM
  const aimColors = ['#0ea5e9', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'];

  return (
    <div className="chart-section">
      {/* 1. Biểu đồ Tăng trưởng kép (Dual-bar Chart: Học viên mới & Lượt nộp bài) */}
      <div className="chart-card">
        <div className="chart-card-header">
          <div>
            <h3 className="chart-title">Tăng trưởng Học viên & Lượt nộp bài</h3>
            <p className="chart-subtitle">So sánh 6 tháng gần nhất</p>
          </div>
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-dot bg-blue-500" /> Học viên mới
            </span>
            <span className="legend-item">
              <span className="legend-dot bg-orange-500" /> Lượt nộp bài thi
            </span>
          </div>
        </div>

        <div className="dual-bar-container">
          {usersByMonth.map((item, idx) => {
            const hUsers = Math.round((item.newUsersCount / maxVal) * 100);
            const hTests = Math.round((item.testSubmissionsCount / maxVal) * 100);

            return (
              <div key={idx} className="bar-group">
                <div className="bars-wrapper">
                  {/* Cột học viên mới */}
                  <div
                    className="bar-col bar-blue"
                    style={{ height: `${Math.max(6, hUsers)}%` }}
                    title={`Học viên mới: ${item.newUsersCount}`}
                  >
                    <span className="bar-tooltip">{item.newUsersCount}</span>
                  </div>
                  {/* Cột lượt nộp bài test */}
                  <div
                    className="bar-col bar-orange"
                    style={{ height: `${Math.max(6, hTests)}%` }}
                    title={`Lượt nộp bài thi: ${item.testSubmissionsCount}`}
                  >
                    <span className="bar-tooltip">{item.testSubmissionsCount}</span>
                  </div>
                </div>
                <span className="bar-label">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Cột phải: Phân bố mục tiêu AIM & Top mô-đun khó */}
      <div className="chart-right-col">
        {/* Phân bố AIM */}
        <div className="chart-card">
          <h3 className="chart-title">Phân bố mục tiêu (AIM)</h3>
          <p className="chart-subtitle">Tỷ lệ học viên theo mốc điểm kỳ vọng</p>

          <div className="aim-list">
            {aimDistribution.length === 0 ? (
              <p className="aim-empty-text">Chưa có dữ liệu phân bố AIM</p>
            ) : (
              aimDistribution.map((aim, index) => {
                const color = aimColors[index % aimColors.length];
                return (
                  <div key={index} className="aim-item">
                    <div className="aim-item-info">
                      <span className="aim-name font-semibold" style={{ color }}>
                        {aim.aimName}
                      </span>
                      <span className="aim-stats">
                        {aim.percent}% ({aim.count.toLocaleString()} học viên)
                      </span>
                    </div>
                    <div className="aim-progress-bg">
                      <div
                        className="aim-progress-bar"
                        style={{ width: `${aim.percent}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top 5 Mô-đun có tỷ lệ thi trượt cao nhất */}
        <div className="chart-card">
          <div className="difficult-card-header">
            <div>
              <h3 className="chart-title difficult-header-title">
                <AlertTriangle size={16} /> Top mô-đun khó (Trượt cao)
              </h3>
              <p className="chart-subtitle">Cần rà soát bài giảng hoặc cấu hình đề thi</p>
            </div>
            <button
              onClick={() => navigate('/admin/modules')}
              className="difficult-action-btn"
              title="Đi tới danh sách quản lý mô-đun"
            >
              Quản lý <ChevronRight size={14} />
            </button>
          </div>

          <div className="difficult-module-list">
            {topDifficultModules.length === 0 ? (
              <p className="difficult-empty-text">Chưa ghi nhận mô-đun có tỷ lệ trượt cao</p>
            ) : (
              topDifficultModules.map((mod) => (
                <div key={mod.moduleId} className="difficult-module-item">
                  <div className="difficult-module-info">
                    <div className="difficult-title-row">
                      <span className="difficult-part-badge" title={mod.partName}>
                        {formatPartBadge(mod.partName)}
                      </span>
                      <span className="difficult-title" title={mod.moduleTitle}>
                        {mod.moduleTitle}
                      </span>
                    </div>
                    <span className="difficult-meta">
                      {mod.failCount}/{mod.totalAttempts} lượt trượt
                    </span>
                  </div>
                  <div className="difficult-rate-badge">
                    {mod.failPercent}%
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
