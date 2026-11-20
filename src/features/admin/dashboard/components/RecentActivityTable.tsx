import React, { useState } from 'react';
import type { RecentActivity } from '../types';
import { Clock } from 'lucide-react';

interface RecentActivityTableProps {
  activities: RecentActivity[];
}

const getInitials = (name: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const UserAvatarItem: React.FC<{ avatar?: string | null; fullName: string }> = ({ avatar, fullName }) => {
  const [hasError, setHasError] = useState(false);

  if (avatar && !hasError) {
    return (
      <img
        src={avatar}
        alt={fullName}
        className="user-avatar-img"
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div className="user-avatar-fallback">
      {getInitials(fullName)}
    </div>
  );
};

export const RecentActivityTable: React.FC<RecentActivityTableProps> = ({ activities }) => {
  const getBadgeConfig = (badge: string) => {
    switch (badge.toUpperCase()) {
      case 'PASS':
        return { label: 'Đạt', className: 'badge-success' };
      case 'FAIL':
        return { label: 'Chưa đạt', className: 'badge-danger' };
      case 'DIAGNOSTIC':
        return { label: 'Chẩn đoán', className: 'badge-purple' };
      case 'NEW':
        return { label: 'Mới', className: 'badge-info' };
      default:
        return { label: badge, className: 'badge-gray' };
    }
  };

  return (
    <div className="table-container">
      <div className="activity-header">
        <div>
          <h3 className="activity-title">
            <Clock size={16} className="activity-title-icon" />
            <span>Nhật ký hoạt động học tập gần đây</span>
          </h3>
          <p className="activity-subtitle">
            Các lượt nộp bài thi, thi chẩn đoán và học viên đăng ký mới nhất
          </p>
        </div>
        <span className="activity-count-badge">
          {activities.length} hoạt động
        </span>
      </div>

      <div className="activity-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Học viên</th>
              <th>Hành động</th>
              <th>Mục tiêu</th>
              <th>Điểm số</th>
              <th>Thời gian</th>
              <th className="text-right">Kết quả</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr>
                <td colSpan={6} className="activity-empty-cell">
                  Chưa ghi nhận hoạt động nào gần đây trong hệ thống
                </td>
              </tr>
            ) : (
              activities.map((activity, index) => {
                const badge = getBadgeConfig(activity.resultBadge);
                return (
                  <tr key={activity.id ?? index}>
                    <td>
                      <div className="user-avatar-cell">
                        <UserAvatarItem avatar={activity.avatar} fullName={activity.fullName} />
                        <div>
                          <div className="user-name">{activity.fullName}</div>
                          {activity.userId && (
                            <div className="user-id">ID: #{activity.userId}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="activity-action-text">
                      {activity.action.replace('Module:', 'Mô-đun:')}
                    </td>
                    <td>
                      <span className="aim-pill">{activity.aimTarget}</span>
                    </td>
                    <td>
                      {activity.score !== null && activity.score !== undefined ? (
                        <span className="activity-score-text">{activity.score} điểm</span>
                      ) : (
                        <span className="activity-score-na">--</span>
                      )}
                    </td>
                    <td className="activity-time-text">
                      {activity.timeAgo}
                    </td>
                    <td className="text-right">
                      <span className={`badge ${badge.className}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
