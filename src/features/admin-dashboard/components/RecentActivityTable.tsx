import React from 'react';
import type { RecentActivity } from '../types';

interface RecentActivityTableProps {
  activities: RecentActivity[];
}

export const RecentActivityTable: React.FC<RecentActivityTableProps> = ({ activities }) => {
  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'PASS':
        return 'bg-green-100 text-green-800';
      case 'NEW':
        return 'bg-blue-100 text-blue-800';
      case 'SCORE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Hoạt động gần nhất</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3 font-medium">Học viên</th>
              <th className="px-6 py-3 font-medium">Hành động</th>
              <th className="px-6 py-3 font-medium">Mục tiêu</th>
              <th className="px-6 py-3 font-medium">Thời gian</th>
              <th className="px-6 py-3 font-medium text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activities.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Không có hoạt động nào gần đây
                </td>
              </tr>
            ) : (
              activities.map((activity, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {activity.fullName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {activity.action}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {activity.aimTarget}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {activity.timeAgo}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getBadgeStyle(activity.resultBadge)}`}>
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
