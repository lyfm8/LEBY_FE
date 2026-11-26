import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/core/ui';
import { adminUserService } from '../services/adminUserService';
import { extractApiErrorMessage } from '../utils/schema';
import type { TargetProfileOption, UserFilterParams, UserListItemResponse, UserRole } from '../types';

// Số dòng mặc định hiển thị trên mỗi trang
const DEFAULT_PAGE_SIZE = 10;

// Đọc bộ lọc ban đầu từ URL Search Params để giữ trạng thái khi reload hoặc chia sẻ link
function parseFiltersFromSearchParams(searchParams: URLSearchParams): UserFilterParams {
  // Đọc tham số page và chuyển về số nguyên không âm
  const rawPage = Number(searchParams.get('page') ?? '0');
  const page = Number.isFinite(rawPage) && rawPage >= 0 ? Math.floor(rawPage) : 0;

  // Đọc từ khóa tìm kiếm (nếu rỗng thì để undefined)
  const rawKeyword = searchParams.get('keyword');
  const keyword = rawKeyword && rawKeyword.trim().length > 0 ? rawKeyword : undefined;

  // Đọc tham số vai trò và chỉ nhận các giá trị hợp lệ của UserRole
  const rawRole = searchParams.get('role');
  const role: UserRole | undefined =
    rawRole === 'STUDENT' || rawRole === 'TEACHER' || rawRole === 'ADMIN' ? rawRole : undefined;

  // Đọc trạng thái hoạt động ('true' | 'false')
  const rawActive = searchParams.get('isActive');
  const isActive = rawActive === 'true' ? true : rawActive === 'false' ? false : undefined;

  // Đọc mốc điểm AIM dạng số
  const rawAim = searchParams.get('aimScore');
  const parsedAim = rawAim ? Number(rawAim) : NaN;
  const aimScore = Number.isFinite(parsedAim) && parsedAim > 0 ? parsedAim : undefined;

  // Trả về object bộ lọc hoàn chỉnh cho hook
  return {
    page,
    size: DEFAULT_PAGE_SIZE,
    keyword,
    role,
    isActive,
    aimScore,
  };
}

/**
 * Custom hook quản lý state, đồng bộ URL, tải danh sách và xuất Excel cho trang Quản lý tài khoản (/admin/users).
 */
export function useAdminUsers() {
  // Hook đọc và cập nhật query parameters trên thanh địa chỉ URL
  const [searchParams, setSearchParams] = useSearchParams();
  // Hook hiển thị thông báo Toast
  const toast = useToast();

  // Trạng thái danh sách người dùng trả về từ Backend
  const [users, setUsers] = useState<UserListItemResponse[]>([]);
  // Danh sách các mốc AIM lấy động từ DB để hiển thị trong bộ lọc
  const [targetProfiles, setTargetProfiles] = useState<TargetProfileOption[]>([]);
  // Tổng số trang hiện có
  const [totalPages, setTotalPages] = useState<number>(0);
  // Tổng số bản ghi khớp bộ lọc
  const [totalItems, setTotalItems] = useState<number>(0);
  // Trạng thái đang tải danh sách
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Thông báo lỗi nếu tải danh sách thất bại (dùng hiển thị Error state + nút Thử lại)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Trạng thái đang xuất file Excel
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Suy ra bộ lọc hiện tại trực tiếp từ URL Search Params
  const filters = useMemo(() => parseFiltersFromSearchParams(searchParams), [searchParams]);

  // Kiểm tra xem người dùng có đang áp dụng ít nhất một điều kiện tìm kiếm/lọc hay không
  const hasActiveFilters = useMemo(() => {
    return Boolean(
      (filters.keyword && filters.keyword.trim().length > 0) ||
        filters.role !== undefined ||
        filters.isActive !== undefined ||
        filters.aimScore !== undefined
    );
  }, [filters]);

  // Nạp danh sách các mốc AIM từ Backend một lần khi khởi tạo
  useEffect(() => {
    // Định nghĩa hàm async tải target profiles
    const loadTargets = async () => {
      try {
        // Gọi API lấy danh mục AIM
        const res = await adminUserService.getTargetProfiles();
        // Lưu dữ liệu vào state nếu thành công
        if (res.success && res.data) {
          setTargetProfiles(res.data);
        }
      } catch {
        // Không làm gián đoạn màn hình chính nếu danh mục lọc AIM tạm thời lỗi
      }
    };
    // Kích hoạt gọi API
    void loadTargets();
  }, []);

  // Hàm tải danh sách người dùng từ API theo bộ lọc hiện tại
  const fetchUsers = useCallback(async () => {
    try {
      // Bật trạng thái loading và xóa thông báo lỗi cũ trước khi gọi API
      setIsLoading(true);
      setErrorMessage(null);
      // Gọi API phân trang và lọc
      const res = await adminUserService.getUsers(filters);
      // Cập nhật state danh sách và thông tin phân trang nếu thành công
      if (res.success && res.data) {
        setUsers(res.data);
        setTotalPages(res.pagination?.totalPages ?? 0);
        setTotalItems(res.pagination?.totalItems ?? res.data.length);
      } else {
        setErrorMessage(res.message || 'Không thể tải danh sách tài khoản');
      }
    } catch (error: unknown) {
      // Chuyển sang Error state để người dùng có thể bấm "Thử lại"
      setErrorMessage(extractApiErrorMessage(error, 'Mất kết nối hoặc không thể tải danh sách tài khoản'));
    } finally {
      // Luôn tắt trạng thái loading khi request hoàn tất
      setIsLoading(false);
    }
  }, [filters]);

  // Tự động tải lại danh sách mỗi khi bộ lọc trên URL thay đổi
  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  // Cập nhật các tham số lọc mới lên URL Search Params
  const handleFilterChange = useCallback(
    (newFilters: Partial<UserFilterParams>) => {
      // Gộp bộ lọc cũ với thay đổi mới
      const merged: UserFilterParams = { ...filters, ...newFilters };
      // Tạo đối tượng URLSearchParams sạch sẽ để không lưu param rỗng trên URL
      const nextParams = new URLSearchParams();
      if (merged.keyword && merged.keyword.trim().length > 0) {
        nextParams.set('keyword', merged.keyword.trim());
      }
      if (merged.role) {
        nextParams.set('role', merged.role);
      }
      if (merged.isActive !== undefined) {
        nextParams.set('isActive', String(merged.isActive));
      }
      if (merged.aimScore !== undefined) {
        nextParams.set('aimScore', String(merged.aimScore));
      }
      if (merged.page > 0) {
        nextParams.set('page', String(merged.page));
      }
      // Ghi đè URL mới (replace: true để không làm phình lịch sử Back trình duyệt khi gõ tìm kiếm)
      setSearchParams(nextParams, { replace: true });
    },
    [filters, setSearchParams]
  );

  // Xóa toàn bộ bộ lọc và đưa trang về mặc định
  const handleResetFilters = useCallback(() => {
    // Đặt searchParams rỗng để URL quay về /admin/users sạch sẽ
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // Xử lý xuất danh sách người dùng khớp bộ lọc hiện tại sang file Excel (.xlsx) (Luồng 3a)
  const handleExportExcel = useCallback(async () => {
    // Tránh bấm xuất liên tiếp nhiều lần khi đang xử lý
    if (isExporting) {
      return;
    }

    try {
      // Bật trạng thái đang xuất file
      setIsExporting(true);
      // Gọi API tải tệp Excel theo đúng điều kiện lọc hiện tại (không phân trang)
      const blob = await adminUserService.exportUsersExcel({
        keyword: filters.keyword,
        role: filters.role,
        isActive: filters.isActive,
        aimScore: filters.aimScore,
      });

      // Tạo đường dẫn tạm và kích hoạt trình duyệt tải xuống tệp .xlsx
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const todayIso = new Date().toISOString().slice(0, 10);
      link.href = downloadUrl;
      link.download = `danh-sach-nguoi-dung-${todayIso}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Giải phóng bộ nhớ URL tạm ngay sau khi kích hoạt tải
      URL.revokeObjectURL(downloadUrl);

      // Thông báo xuất tệp thành công
      toast.success('Xuất danh sách Excel thành công');
    } catch (error: unknown) {
      // Nếu lỗi trả về dạng Blob JSON thì đọc text JSON để lấy đúng thông báo lỗi
      if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const parsed = JSON.parse(text) as { message?: string };
          if (parsed.message) {
            toast.error(parsed.message);
            return;
          }
        } catch {
          // Bỏ qua nếu dữ liệu Blob không phải JSON hợp lệ
        }
      }
      // Hiển thị thông báo lỗi mặc định nếu không đọc được chi tiết
      toast.error(extractApiErrorMessage(error, 'Không thể xuất file Excel. Vui lòng thử lại'));
    } finally {
      // Tắt trạng thái đang xuất
      setIsExporting(false);
    }
  }, [filters, isExporting, toast]);

  // Trả về state và handler cho AdminUserPage và các component con
  return {
    users,
    targetProfiles,
    filters,
    hasActiveFilters,
    totalPages,
    totalItems,
    isLoading,
    errorMessage,
    isExporting,
    handleFilterChange,
    handleResetFilters,
    handleExportExcel,
    refetch: fetchUsers,
  };
}
