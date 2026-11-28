import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminModuleTestService } from '../services/adminModuleTestService';
import type { ModuleTestOverviewItem } from '../types';

/**
 * Bộ lọc trạng thái cấu hình đề thi vượt ải trên trang danh sách tổng quan.
 */
export type ModuleTestStatusFilter = 'ALL' | 'CONFIGURED' | 'UNCONFIGURED';

/**
 * Custom hook quản lý tải danh sách tổng quan Bài thi vượt ải mô-đun và đồng bộ bộ lọc với URL.
 *
 * @returns Danh sách đã lọc, thống kê nhanh, trạng thái loading/error và các hàm điều khiển bộ lọc
 */
export const useModuleTestOverview = () => {
  // Đọc và cập nhật tham số tìm kiếm trên thanh địa chỉ URL để hỗ trợ reload/bookmark
  const [searchParams, setSearchParams] = useSearchParams();

  // Danh sách toàn bộ mô-đun tải về từ Backend
  const [items, setItems] = useState<ModuleTestOverviewItem[]>([]);
  // Trạng thái đang gọi API tải danh sách
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Thông báo lỗi nếu tải dữ liệu thất bại
  const [error, setError] = useState<string | null>(null);

  // Đọc giá trị từ khóa tìm kiếm hiện tại từ URL (mặc định chuỗi rỗng)
  const keyword = searchParams.get('q') ?? '';
  // Đọc giá trị Part đang lọc từ URL (null nếu xem tất cả Part)
  const partIdParam = searchParams.get('partId');
  const partId = partIdParam ? Number(partIdParam) : null;
  // Đọc bộ lọc trạng thái cấu hình đề từ URL (mặc định ALL)
  const rawStatus = searchParams.get('status');
  const statusFilter: ModuleTestStatusFilter =
    rawStatus === 'CONFIGURED' || rawStatus === 'UNCONFIGURED' ? rawStatus : 'ALL';
  // Đọc ID mô-đun đang mở cấu hình chi tiết trên URL (nếu có)
  const selectedModuleParam = searchParams.get('moduleId');
  const selectedModuleId = selectedModuleParam ? Number(selectedModuleParam) : null;

  /**
   * Hàm gọi API tải toàn bộ danh sách tổng quan bài thi vượt ải.
   */
  const fetchOverviews = useCallback(async () => {
    // Bật trạng thái đang tải và xóa lỗi cũ trước khi gọi API
    setIsLoading(true);
    setError(null);
    try {
      // Gọi API lấy danh sách tổng quan trạng thái bài thi vượt ải các mô-đun
      const res = await adminModuleTestService.getOverviewList();
      // Lưu dữ liệu trả về vào state (dùng mảng rỗng nếu data null)
      setItems(res.data ?? []);
    } catch {
      // Lưu thông báo lỗi thân thiện để người dùng bấm thử lại
      setError('Không thể tải danh sách bài thi vượt ải. Vui lòng kiểm tra kết nối và thử lại.');
    } finally {
      // Tắt trạng thái đang tải dù thành công hay thất bại
      setIsLoading(false);
    }
  }, []);

  // Tự động gọi API tải danh sách ngay khi mount trang lần đầu
  useEffect(() => {
    void fetchOverviews();
  }, [fetchOverviews]);

  /**
   * Cập nhật một tham số bộ lọc trên URL mà vẫn giữ nguyên các tham số khác.
   */
  const updateParam = useCallback(
    (key: string, value: string | null) => {
      // Tạo bản sao URLSearchParams hiện tại để cập nhật an toàn
      const next = new URLSearchParams(searchParams);
      if (!value || value === 'ALL') {
        // Xóa tham số khỏi URL nếu rỗng hoặc là giá trị mặc định
        next.delete(key);
      } else {
        // Ghi giá trị mới vào URL
        next.set(key, value);
      }
      // Cập nhật URL không đẩy thêm lịch sử trình duyệt thừa khi lọc
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Hàm cập nhật từ khóa tìm kiếm lên URL
  const setKeyword = useCallback(
    (value: string) => updateParam('q', value.trim() ? value : null),
    [updateParam]
  );

  // Hàm cập nhật bộ lọc Part lên URL
  const setPartId = useCallback(
    (value: number | null) => updateParam('partId', value ? String(value) : null),
    [updateParam]
  );

  // Hàm cập nhật bộ lọc trạng thái đã cấu hình / chưa cấu hình lên URL
  const setStatusFilter = useCallback(
    (value: ModuleTestStatusFilter) => updateParam('status', value),
    [updateParam]
  );

  // Hàm chọn một mô-đun để mở màn hình cấu hình chi tiết (hoặc đóng khi truyền null)
  const selectModule = useCallback(
    (moduleId: number | null) => updateParam('moduleId', moduleId ? String(moduleId) : null),
    [updateParam]
  );

  /**
   * Đặt lại toàn bộ bộ lọc tìm kiếm (từ khóa, Part, trạng thái) về mặc định trong 1 lần cập nhật URL.
   */
  const resetFilters = useCallback(() => {
    // Tạo bản sao URLSearchParams hiện tại để tránh mất moduleId nếu có
    const next = new URLSearchParams(searchParams);
    // Xóa tham số từ khóa tìm kiếm khỏi URL
    next.delete('q');
    // Xóa tham số lọc Part khỏi URL
    next.delete('partId');
    // Xóa tham số lọc trạng thái cấu hình đề khỏi URL
    next.delete('status');
    // Ghi lại URL đã đặt lại bộ lọc mà không thêm lịch sử trình duyệt thừa
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  // Tối ưu: Dùng useMemo để tránh lọc lại danh sách khi component re-render không đổi bộ lọc
  const filteredItems = useMemo(() => {
    // Chuẩn hóa từ khóa về chữ thường để tìm kiếm không phân biệt hoa/thường
    const normalizedKeyword = keyword.trim().toLowerCase();
    return items.filter((item) => {
      // Lọc theo từ khóa trên tên mô-đun, tên Part hoặc tên năng lực
      if (normalizedKeyword) {
        const matchesTitle = item.moduleTitle.toLowerCase().includes(normalizedKeyword);
        const matchesPart = (item.partName ?? '').toLowerCase().includes(normalizedKeyword);
        const matchesAbility = item.abilityNames.some((ab) =>
          ab.toLowerCase().includes(normalizedKeyword)
        );
        if (!matchesTitle && !matchesPart && !matchesAbility) return false;
      }
      // Lọc theo Part nếu người dùng đã chọn Part cụ thể
      if (partId !== null && item.partId !== partId) return false;
      // Lọc theo trạng thái đã có đề / chưa có đề
      if (statusFilter === 'CONFIGURED' && !item.hasTestConfigured) return false;
      if (statusFilter === 'UNCONFIGURED' && item.hasTestConfigured) return false;
      return true;
    });
  }, [items, keyword, partId, statusFilter]);

  // Tính nhanh các chỉ số tổng hợp hiển thị trên thanh thống kê đầu trang
  const summary = useMemo(() => {
    // Tổng số mô-đun trong hệ thống
    const total = items.length;
    // Số mô-đun đã được cấu hình bài thi vượt ải
    const configured = items.filter((item) => item.hasTestConfigured).length;
    // Số mô-đun chưa có đề vượt ải
    const unconfigured = total - configured;
    // Số mô-đun chưa có bài giảng nào (cần cảnh báo)
    const missingLessons = items.filter((item) => item.hasNoLessonsWarning).length;
    return { total, configured, unconfigured, missingLessons };
  }, [items]);

  // Trả về toàn bộ dữ liệu, bộ lọc và hàm điều khiển cho UI
  return {
    items,
    filteredItems,
    summary,
    isLoading,
    error,
    keyword,
    partId,
    statusFilter,
    selectedModuleId,
    setKeyword,
    setPartId,
    setStatusFilter,
    resetFilters,
    selectModule,
    refetch: fetchOverviews,
  };
};
