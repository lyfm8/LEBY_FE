import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useConfirm, useToast } from '@/core/ui';
import { adminUserService } from '../services/adminUserService';
import { extractApiErrorMessage, isApiErrorCode, updateUserRoleSchema } from '../utils/schema';
import type { AdminUserDetailResponse, UserDetailTab } from '../types';

// Danh sách tab hợp lệ trên trang chi tiết để kiểm soát URL query param an toàn
const VALID_DETAIL_TABS: UserDetailTab[] = ['learning-path', 'diagnostic', 'module-test', 'mock-test'];

// Câu cảnh báo BR11 khi Admin tự khóa tài khoản của chính mình
const BR11_SELF_LOCK_WARNING =
  'Quy tắc an toàn hệ thống (BR11): Quản trị viên không thể tự khóa tài khoản của chính mình!';

// Câu cảnh báo ngoại lệ 7d khi học viên đang thi trực tuyến
const ACTIVE_EXAM_LOCK_WARNING =
  'Học viên này đang có một phiên thi trực tuyến đang diễn ra. Việc khóa tài khoản sẽ thu hồi quyền làm bài ngay lập tức. Bạn có chắc chắn muốn tiếp tục?';

/**
 * Custom hook quản lý tải chi tiết tài khoản người dùng, đồng bộ tab lên URL
 * và các thao tác quản trị nhanh trên trang /admin/users/:id.
 */
export function useAdminUserDetail() {
  // Đọc ID người dùng từ URL path param
  const { id } = useParams<{ id: string }>();
  // Hook điều hướng trang
  const navigate = useNavigate();
  // Hook đồng bộ tab đang xem lên URL (?tab=...)
  const [searchParams, setSearchParams] = useSearchParams();
  // Lấy thông tin Admin đang đăng nhập để kiểm tra BR11
  const { user: currentUser } = useAuth();
  // Hook hiển thị xác nhận chuẩn
  const confirm = useConfirm();
  // Hook hiển thị thông báo Toast
  const toast = useToast();

  // Chuyển ID từ chuỗi URL sang số nguyên hợp lệ
  const numericUserId = id ? Number(id) : NaN;
  // Kiểm tra ID có hợp lệ hay không
  const isValidId = Number.isInteger(numericUserId) && numericUserId > 0;

  // Trạng thái dữ liệu chi tiết trả về từ Backend
  const [detail, setDetail] = useState<AdminUserDetailResponse | null>(null);
  // Trạng thái đang tải dữ liệu
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Thông báo lỗi tải dữ liệu (dùng cho Error state)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Cờ đánh dấu người dùng không tồn tại (404 - Ngoại lệ 8a)
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  // Cờ đang thực hiện thao tác (khóa/mở khóa/đổi vai trò/reset pass)
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // Xác định tab đang chọn từ URL (?tab=...), mặc định mở tab Lộ trình học hiện tại
  const rawTab = searchParams.get('tab') as UserDetailTab | null;
  const activeTab: UserDetailTab =
    rawTab && VALID_DETAIL_TABS.includes(rawTab) ? rawTab : 'learning-path';

  // Đổi tab và cập nhật URL search param để giữ nguyên tab khi reload
  const handleTabChange = useCallback(
    (nextTab: UserDetailTab) => {
      // Tạo bản sao URLSearchParams hiện tại
      const nextParams = new URLSearchParams(searchParams);
      // Nếu là tab mặc định thì xóa query cho URL gọn, ngược lại ghi rõ tên tab
      if (nextTab === 'learning-path') {
        nextParams.delete('tab');
      } else {
        nextParams.set('tab', nextTab);
      }
      // Cập nhật URL không tạo lịch sử dư thừa
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  // Tải đầy đủ dữ liệu chi tiết người dùng từ Backend
  const fetchDetail = useCallback(async () => {
    // Nếu URL chứa ID không hợp lệ thì báo không tìm thấy ngay
    if (!isValidId) {
      setIsNotFound(true);
      setIsLoading(false);
      setErrorMessage('Mã người dùng không hợp lệ');
      return;
    }

    try {
      // Bật loading và reset cờ lỗi trước khi gọi API
      setIsLoading(true);
      setErrorMessage(null);
      setIsNotFound(false);

      // Gọi API lấy chi tiết tài khoản và toàn bộ tiến trình học tập
      const res = await adminUserService.getDetail(numericUserId);
      if (res.success && res.data) {
        setDetail(res.data);
      } else {
        setErrorMessage(res.message || 'Không thể tải thông tin chi tiết người dùng');
      }
    } catch (error: unknown) {
      // Nếu BE trả 404 -> hiển thị đúng thông điệp từ Backend (VD: "Dữ liệu người dùng không tồn tại" hoặc lỗi endpoint)
      if (isApiErrorCode(error, 404)) {
        const msg = extractApiErrorMessage(error, 'Dữ liệu người dùng không tồn tại');
        setIsNotFound(true);
        setErrorMessage(msg);
        return;
      }
      // Các lỗi mạng/server khác -> hiển thị Error state kèm nút Thử lại
      setErrorMessage(extractApiErrorMessage(error, 'Mất kết nối hoặc không thể tải chi tiết người dùng'));
    } finally {
      // Tắt loading sau khi xong
      setIsLoading(false);
    }
  }, [isValidId, numericUserId]);

  // Gọi API tải chi tiết khi ID thay đổi
  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  // Quay lại trang danh sách người dùng
  const handleBackToList = useCallback(() => {
    // Điều hướng về màn hình danh sách
    navigate('/admin/users');
  }, [navigate]);

  // Khóa hoặc mở khóa ngay tại trang chi tiết
  const handleToggleActive = useCallback(async () => {
    // Không làm gì nếu chưa có dữ liệu chi tiết
    if (!detail) {
      return;
    }
    const targetUser = detail.profile;

    // Suy ra trạng thái hoạt động ưu tiên boolean isActive, dự phòng status string
    const isUserActive = targetUser.isActive ?? targetUser.status === 'ACTIVE';

    // Kiểm tra quy tắc BR11 khi Admin tự thao tác khóa chính mình
    if (isUserActive && currentUser && currentUser.id === targetUser.id) {
      toast.warning(BR11_SELF_LOCK_WARNING);
      return;
    }

    const willLock = isUserActive;
    const displayName = targetUser.fullName || targetUser.email;

    try {
      // Khóa nút thao tác khi đang gửi request
      setIsActionLoading(true);

      let forceLock = false;
      if (willLock) {
        // Kiểm tra lại phiên thi trực tuyến mới nhất từ server
        const examStatusRes = await adminUserService.getActiveExamStatus(targetUser.id);
        if (examStatusRes.success && examStatusRes.data?.hasActiveExamSession) {
          const okForce = await confirm({
            title: 'Cảnh báo phiên thi trực tuyến',
            message: ACTIVE_EXAM_LOCK_WARNING,
            confirmText: 'Tiếp tục khóa',
            cancelText: 'Hủy',
          });
          if (!okForce) {
            return;
          }
          forceLock = true;
        } else {
          const ok = await confirm({
            title: 'Tạm khóa tài khoản',
            message: `Bạn có chắc chắn muốn tạm khóa tài khoản "${displayName}"?`,
            confirmText: 'Tạm khóa',
            cancelText: 'Hủy',
          });
          if (!ok) {
            return;
          }
        }
      } else {
        const ok = await confirm({
          title: 'Mở khóa tài khoản',
          message: `Bạn có chắc chắn muốn mở khóa tài khoản "${displayName}"?`,
          confirmText: 'Mở khóa',
          cancelText: 'Hủy',
        });
        if (!ok) {
          return;
        }
      }

      // Gửi request đổi trạng thái
      const res = await adminUserService.toggleActive(targetUser.id, forceLock);
      if (res.success) {
        toast.success(res.message || (willLock ? 'Tạm khóa tài khoản thành công' : 'Mở khóa tài khoản thành công'));
        // Tải lại chi tiết để cập nhật trạng thái tài khoản lẫn trạng thái DiagnosticAttempt (nếu bị ABANDONED)
        await fetchDetail();
      }
    } catch (error: unknown) {
      // Fallback 409 nếu học viên vừa vào phòng thi ngay trước khi bấm xác nhận
      if (isApiErrorCode(error, 409, 'USER_IN_ACTIVE_EXAM')) {
        const okForceRetry = await confirm({
          title: 'Cảnh báo phiên thi trực tuyến',
          message: ACTIVE_EXAM_LOCK_WARNING,
          confirmText: 'Tiếp tục khóa',
          cancelText: 'Hủy',
        });
        if (okForceRetry) {
          try {
            const retryRes = await adminUserService.toggleActive(targetUser.id, true);
            if (retryRes.success) {
              toast.success(retryRes.message || 'Tạm khóa tài khoản thành công');
              await fetchDetail();
            }
          } catch (retryError: unknown) {
            toast.error(extractApiErrorMessage(retryError, 'Không thể khóa tài khoản lúc này'));
          }
        }
        return;
      }

      if (isApiErrorCode(error, 404)) {
        const msg = extractApiErrorMessage(error, 'Dữ liệu người dùng không tồn tại');
        toast.error(msg);
        if (msg.includes('Dữ liệu người dùng không tồn tại')) {
          navigate('/admin/users');
        }
        return;
      }

      toast.error(extractApiErrorMessage(error, 'Không thể cập nhật trạng thái tài khoản'));
    } finally {
      // Mở lại nút thao tác
      setIsActionLoading(false);
    }
  }, [confirm, currentUser, detail, fetchDetail, navigate, toast]);

  // Nâng hoặc hạ quyền giữa STUDENT và TEACHER ngay trên trang chi tiết
  const handleToggleTeacherRole = useCallback(async () => {
    if (!detail || detail.profile.role === 'ADMIN') {
      return;
    }
    const targetUser = detail.profile;
    const nextRole: 'STUDENT' | 'TEACHER' = targetUser.role === 'STUDENT' ? 'TEACHER' : 'STUDENT';
    // Kiểm tra vai trò đích hợp lệ qua Zod schema trước khi gửi request
    const parsedRole = updateUserRoleSchema.safeParse({ role: nextRole });
    if (!parsedRole.success) {
      toast.error('Vai trò đích không hợp lệ');
      return;
    }
    const isUpgrade = nextRole === 'TEACHER';
    const displayName = targetUser.fullName || targetUser.email;

    const ok = await confirm({
      title: isUpgrade ? 'Nâng quyền lên Giáo viên' : 'Hạ quyền xuống Học viên',
      message: isUpgrade
        ? `Xác nhận nâng quyền "${displayName}" từ Học viên lên Giáo viên?`
        : `Xác nhận hạ quyền "${displayName}" từ Giáo viên xuống Học viên?`,
      confirmText: isUpgrade ? 'Nâng quyền' : 'Hạ quyền',
      cancelText: 'Hủy',
    });
    if (!ok) {
      return;
    }

    try {
      setIsActionLoading(true);
      const res = await adminUserService.updateRole(targetUser.id, parsedRole.data);
      if (res.success) {
        toast.success(isUpgrade ? 'Đã nâng quyền lên Giáo viên' : 'Đã hạ quyền xuống Học viên');
        await fetchDetail();
      }
    } catch (error: unknown) {
      if (isApiErrorCode(error, 404)) {
        const msg = extractApiErrorMessage(error, 'Dữ liệu người dùng không tồn tại');
        toast.error(msg);
        if (msg.includes('Dữ liệu người dùng không tồn tại')) {
          navigate('/admin/users');
        }
        return;
      }
      toast.error(extractApiErrorMessage(error, 'Không thể cập nhật vai trò người dùng'));
    } finally {
      setIsActionLoading(false);
    }
  }, [confirm, detail, fetchDetail, navigate, toast]);

  // Đặt lại mật khẩu ngẫu nhiên và gửi email ngay trên trang chi tiết
  const handleResetPassword = useCallback(async () => {
    if (!detail) {
      return;
    }
    const targetUser = detail.profile;
    const displayName = targetUser.fullName || targetUser.email;

    const ok = await confirm({
      title: 'Đặt lại mật khẩu ngẫu nhiên',
      message: `Hệ thống sẽ sinh mật khẩu mới ngẫu nhiên cho "${displayName}" và gửi về email ${targetUser.email}. Bạn có chắc chắn muốn tiếp tục?`,
      confirmText: 'Đặt lại mật khẩu',
      cancelText: 'Hủy',
    });
    if (!ok) {
      return;
    }

    try {
      setIsActionLoading(true);
      const res = await adminUserService.resetPassword(targetUser.id);
      if (res.success) {
        toast.success(res.message || `Đã đặt lại mật khẩu và gửi tới ${targetUser.email}`);
      }
    } catch (error: unknown) {
      if (isApiErrorCode(error, 404)) {
        const msg = extractApiErrorMessage(error, 'Dữ liệu người dùng không tồn tại');
        toast.error(msg);
        if (msg.includes('Dữ liệu người dùng không tồn tại')) {
          navigate('/admin/users');
        }
        return;
      }
      toast.error(extractApiErrorMessage(error, 'Đặt lại mật khẩu thất bại. Mật khẩu cũ vẫn được giữ nguyên'));
    } finally {
      setIsActionLoading(false);
    }
  }, [confirm, detail, navigate, toast]);

  // Trả về dữ liệu và hàm thao tác cho AdminUserDetailPage
  return {
    currentUserId: currentUser?.id ?? null,
    detail,
    activeTab,
    isLoading,
    errorMessage,
    isNotFound,
    isActionLoading,
    handleTabChange,
    handleBackToList,
    handleToggleActive,
    handleToggleTeacherRole,
    handleResetPassword,
    refetch: fetchDetail,
  };
}
