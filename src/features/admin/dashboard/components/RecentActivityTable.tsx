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
    <div className="table-container">
      <div className="activity-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
        <h3 className="activity-title" style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>Hoạt động gần nhất</h3>
      </div>
      <div className="activity-table-wrapper" style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Học viên</th>
              <th>Hành động</th>
              <th>Mục tiêu</th>
              <th>Thời gian</th>
              <th style={{ textAlign: 'right' }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#6b7280', padding: '1.5rem 0' }}>
                  Không có hoạt động nào gần đây
                </td>
              </tr>
            ) : (
              activities.map((activity, index) => (
                <tr key={index} style={{ transition: 'background-color 0.2s' }}>
                  <td style={{ fontWeight: 500, color: '#111827' }}>
                    {activity.fullName}
                  </td>
                  <td style={{ color: '#4b5563' }}>
                    {activity.action}
                  </td>
                  <td style={{ color: '#4b5563' }}>
                    {activity.aimTarget}
                  </td>
                  <td style={{ color: '#6b7280' }}>
                    {activity.timeAgo}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className={`badge badge-${activity.resultBadge === 'PASS' ? 'green' : activity.resultBadge === 'NEW' ? 'blue' : activity.resultBadge === 'SCORE' ? 'purple' : 'gray'}`}
                          style={activity.resultBadge === 'NEW' ? getBadgeStyle(activity.resultBadge) : (activity.resultBadge === 'SCORE' ? getBadgeStyle(activity.resultBadge) : undefined)}>
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
