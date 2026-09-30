import React from 'react';
import type { RecentActivity } from '../types';

interface RecentActivityTableProps {
  activities: RecentActivity[];
}

export const RecentActivityTable: React.FC<RecentActivityTableProps> = ({ activities }) => {
  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'PASS':
        return { backgroundColor: '#dcfce7', color: '#166534' }; // bg-green-100 text-green-800
      case 'NEW':
        return { backgroundColor: '#dbeafe', color: '#1e40af' }; // bg-blue-100 text-blue-800
      case 'SCORE':
        return { backgroundColor: '#f3e8ff', color: '#6b21a8' }; // bg-purple-100 text-purple-800
      default:
        return { backgroundColor: '#f3f4f6', color: '#1f2937' }; // bg-gray-100 text-gray-800
    }
  };

  return (
    <div className="activity-section">
      <div className="activity-header">
        <h3 className="activity-title">Hoạt động gần nhất</h3>
      </div>
      <div className="activity-table-wrapper">
        <table className="activity-table">
          <thead>
            <tr>
              <th className="activity-th">Học viên</th>
              <th className="activity-th">Hành động</th>
              <th className="activity-th">Mục tiêu</th>
              <th className="activity-th">Thời gian</th>
              <th className="activity-th" style={{ textAlign: 'right' }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr className="activity-tr">
                <td colSpan={5} className="activity-td" style={{ textAlign: 'center', color: '#6b7280' }}>
                  Không có hoạt động nào gần đây
                </td>
              </tr>
            ) : (
              activities.map((activity, index) => (
                <tr key={index} className="activity-tr" style={{ transition: 'background-color 0.2s' }}>
                  <td className="activity-td" style={{ fontWeight: 500, color: '#111827' }}>
                    {activity.fullName}
                  </td>
                  <td className="activity-td" style={{ color: '#4b5563' }}>
                    {activity.action}
                  </td>
                  <td className="activity-td" style={{ color: '#4b5563' }}>
                    {activity.aimTarget}
                  </td>
                  <td className="activity-td" style={{ color: '#6b7280' }}>
                    {activity.timeAgo}
                  </td>
                  <td className="activity-td" style={{ textAlign: 'right' }}>
                    <span style={{ 
                      padding: '0.25rem 0.625rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      ...getBadgeStyle(activity.resultBadge)
                    }}>
                      {activity.resultBadge}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
