import React from 'react';
import type { UserListItemResponse } from '../types';
import { Edit2, Ban, CheckCircle } from 'lucide-react';

interface UserTableProps {
  users: UserListItemResponse[];
  onEdit: (id: number) => void;
  onToggleActive: (id: number) => void;
  isLoading: boolean;
}

export const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onToggleActive, isLoading }) => {
  if (isLoading) {
    return <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3 font-medium">Họ Tên & Email</th>
            <th className="px-6 py-3 font-medium">Role</th>
            <th className="px-6 py-3 font-medium">Loại TK</th>
            <th className="px-6 py-3 font-medium">Mục tiêu (AIM)</th>
            <th className="px-6 py-3 font-medium text-center">Trạng thái</th>
            <th className="px-6 py-3 font-medium text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                Không tìm thấy người dùng nào
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{user.fullName}</div>
                  <div className="text-gray-500 text-xs mt-1">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {user.learnerType}
                </td>
                <td className="px-6 py-4 text-gray-600 font-medium">
                  {user.aimTarget || '—'}
                </td>
                <td className="px-6 py-4 text-center">
                  {user.isActive ? (
                    <span className="inline-flex items-center text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-medium">
                      <CheckCircle size={14} className="mr-1" /> Hoạt động
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-xs font-medium">
                      <Ban size={14} className="mr-1" /> Đã khóa
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onEdit(user.id)}
                    className="text-blue-600 hover:text-blue-800 p-1 mr-2 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onToggleActive(user.id)}
                    className={`${user.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'} p-1 transition-colors`}
                    title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                  >
                    {user.isActive ? <Ban size={18} /> : <CheckCircle size={18} />}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
