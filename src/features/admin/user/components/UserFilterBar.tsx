import React, { useState, useEffect } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import type { TargetProfileOption, UserFilterParams, UserRole } from '../types';

interface UserFilterBarProps {
  // Bộ lọc hiện tại đọc từ URL Search Params
  filters: UserFilterParams;
  // Danh sách các mốc điểm AIM lấy từ Backend
  targetProfiles: TargetProfileOption[];
  // Cờ cho biết người dùng có đang bật ít nhất một bộ lọc không
  hasActiveFilters: boolean;
  // Callback cập nhật bộ lọc
  onFilterChange: (newFilters: Partial<UserFilterParams>) => void;
  // Callback xóa toàn bộ bộ lọc
  onResetFilters: () => void;
}

/**
 * Thanh tìm kiếm và 3 bộ lọc (vai trò, mốc AIM, trạng thái) nằm trên cùng 1 hàng,
 * đồng bộ font chữ với bảng danh sách.
 */
export const UserFilterBar: React.FC<UserFilterBarProps> = ({
  filters,
  targetProfiles,
  hasActiveFilters,
  onFilterChange,
  onResetFilters,
}) => {
  // State cục bộ lưu giá trị ô tìm kiếm để gõ mượt mà trước khi debounce 500ms
  const [localKeyword, setLocalKeyword] = useState<string>(filters.keyword ?? '');
  // Trì hoãn cập nhật từ khóa 500ms nhằm tránh gọi API liên tục theo từng phím bấm
  const debouncedKeyword = useDebounce(localKeyword, 500);

  // Đồng bộ lại ô nhập nếu URL keyword bị thay đổi từ bên ngoài (ví dụ nhấn nút Xóa bộ lọc)
  useEffect(() => {
    setLocalKeyword(filters.keyword ?? '');
  }, [filters.keyword]);

  // Chỉ kích hoạt gọi filter khi giá trị sau debounce thực sự khác từ khóa đang có trên URL
  useEffect(() => {
    // Chuẩn hóa chuỗi rỗng thành undefined để khớp với kiểu lưu trong URL
    const normalizedDebounced = debouncedKeyword.trim().length > 0 ? debouncedKeyword.trim() : undefined;
    // Nếu khác biệt so với filter hiện tại thì cập nhật và đưa về trang đầu tiên
    if (normalizedDebounced !== filters.keyword) {
      onFilterChange({ keyword: normalizedDebounced, page: 0 });
    }
  }, [debouncedKeyword, filters.keyword, onFilterChange]);

  // Xử lý khi người dùng thay đổi lựa chọn Vai trò
  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // Đọc giá trị chuỗi từ dropdown
    const rawValue = event.target.value;
    // Ép về kiểu UserRole hoặc undefined nếu chọn "Tất cả"
    const nextRole = rawValue ? (rawValue as UserRole) : undefined;
    // Cập nhật bộ lọc và reset về trang 0
    onFilterChange({ role: nextRole, page: 0 });
  };

  // Xử lý khi người dùng thay đổi lựa chọn Trạng thái tài khoản
  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // Đọc chuỗi 'true', 'false' hoặc ''
    const rawValue = event.target.value;
    // Quy đổi về boolean hoặc undefined
    const nextActive = rawValue === '' ? undefined : rawValue === 'true';
    // Cập nhật bộ lọc và reset về trang 0
    onFilterChange({ isActive: nextActive, page: 0 });
  };

  // Xử lý khi người dùng thay đổi lựa chọn Mốc AIM
  const handleAimChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // Đọc chuỗi số điểm AIM hoặc ''
    const rawValue = event.target.value;
    // Chuyển sang kiểu number hoặc undefined
    const nextAim = rawValue === '' ? undefined : Number(rawValue);
    // Cập nhật bộ lọc và reset về trang 0
    onFilterChange({ aimScore: nextAim, page: 0 });
  };

  // Render thanh tìm kiếm và 3 bộ lọc trên cùng 1 hàng bằng class riêng (tránh đụng CSS global)
  return (
    <div className="user-filter-bar">
      <div className="user-filter-row">
        <div className="user-filter-search-wrapper">
          <Search className="user-filter-search-icon" size={15} />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            className="user-filter-search-input"
            value={localKeyword}
            onChange={(event) => setLocalKeyword(event.target.value)}
            aria-label="Tìm kiếm theo tên hoặc email"
          />
        </div>

        <select
          className="user-filter-select"
          value={filters.role ?? ''}
          onChange={handleRoleChange}
          aria-label="Lọc theo vai trò"
        >
          <option value="">Tất cả vai trò</option>
          <option value="STUDENT">Học viên</option>
          <option value="TEACHER">Giáo viên</option>
          <option value="ADMIN">Quản trị viên</option>
        </select>

        <select
          className="user-filter-select"
          value={filters.aimScore !== undefined ? String(filters.aimScore) : ''}
          onChange={handleAimChange}
          aria-label="Lọc theo mốc mục tiêu AIM"
        >
          <option value="">Tất cả mốc AIM</option>
          {targetProfiles.map((profile) => (
            <option key={profile.id} value={profile.aimScore}>
              AIM {profile.aimScore}
            </option>
          ))}
        </select>

        <select
          className="user-filter-select"
          value={filters.isActive !== undefined ? String(filters.isActive) : ''}
          onChange={handleStatusChange}
          aria-label="Lọc theo trạng thái tài khoản"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Bị tạm khóa</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn-secondary user-filter-reset-btn"
            onClick={onResetFilters}
          >
            <RotateCcw size={14} />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>
    </div>
  );
};
