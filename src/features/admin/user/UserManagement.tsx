import React, { useEffect, useState } from 'react';
import { userService } from './user.service';
import type { User } from './user.type';
import { useDebounce } from '../../hooks/useDebounce';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Debounce search term sau 500ms
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAllUsers(page, 10, debouncedSearchTerm);
      setUsers(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  useEffect(() => {
    setPage(0); // Reset page khi có search term mới
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearchTerm]);

  const handleToggleStatus = async (user: User) => {
    const action = user.isActive ? 'khóa' : 'mở khóa';
    // Hiển thị hộp thoại xác nhận
    if (window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản của ${user.fullName || user.email}?`)) {
      try {
        await userService.toggleUserStatus(user.id);
        fetchUsers(); // Refresh list after toggle
      } catch (error) {
        console.error('Failed to toggle status', error);
        alert('Có lỗi xảy ra khi cập nhật trạng thái!');
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Quản lý người dùng</h1>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm theo email hoặc họ tên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md p-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Họ tên</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.fullName || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.isActive ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleToggleStatus(user)}
                    className={`mr-4 transition-colors ${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                  >
                    {user.isActive ? 'Khóa' : 'Mở khóa'}
                  </button>
                  <button className="text-blue-600 hover:text-blue-900 transition-colors">
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  Không tìm thấy người dùng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button 
            disabled={page === 0} 
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Trước
          </button>
          <span className="text-sm text-gray-600 font-medium">
            Trang {page + 1} / {totalPages}
          </span>
          <button 
            disabled={page >= totalPages - 1} 
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};
