import type { UserRole } from '../types/authTypes';

/**
 * Các đường dẫn công khai / xác thực — không bao giờ redirect ngược về đây sau khi đăng nhập thành công.
 */
const NON_REDIRECTABLE_PATHS = [
    '/',
    '/landing',
    '/login',
    '/register',
    '/verify-otp',
    '/forgot-password',
    '/unauthorized',
];

/**
 * Xác định trang đích mặc định sau khi đăng nhập thành công theo đúng vai trò người dùng:
 * - ADMIN   → /admin (Cổng Quản trị - Tổng quan hệ thống)
 * - TEACHER → /admin/modules (Cổng Giảng viên - Quản lý Mô-đun & Bài học)
 * - STUDENT → /dashboard (Bảng điều khiển học tập của học viên)
 *
 * @param role Vai trò tài khoản từ Backend
 * @returns Đường dẫn trang chủ tương ứng với vai trò
 */
export function getDefaultRouteByRole(role: UserRole): string {
    switch (role) {
        case 'ADMIN':
            return '/admin';
        case 'TEACHER':
            return '/admin/modules';
        case 'STUDENT':
        default:
            return '/dashboard';
    }
}

/**
 * Kiểm tra xem vai trò hiện tại có được phép quay lại đường dẫn `pathname` trước đó hay không.
 * Dùng để chặn lỗi điều hướng chéo vai trò (VD: trước đó bị chặn ở /admin/users, rồi đăng nhập bằng tài khoản STUDENT).
 *
 * @param role     Vai trò tài khoản vừa đăng nhập
 * @param pathname Đường dẫn người dùng định vào trước khi bị chuyển sang /login
 * @returns true nếu vai trò được phép vào đường dẫn đó
 */
export function canRoleAccessPath(role: UserRole, pathname: string): boolean {
    if (!pathname || NON_REDIRECTABLE_PATHS.includes(pathname)) {
        return false;
    }

    // Nhánh /admin tổng quan và /admin/users chỉ dành riêng cho ADMIN
    if (pathname === '/admin' || pathname === '/admin/' || pathname.startsWith('/admin/users')) {
        return role === 'ADMIN';
    }

    // Các nhánh quản lý học liệu & cấu hình (/admin/modules, /admin/parts, /admin/questions...) cho phép ADMIN và TEACHER
    if (pathname.startsWith('/admin/')) {
        return role === 'ADMIN' || role === 'TEACHER';
    }

    // Các trang học tập của người dùng đều mở cho STUDENT, TEACHER, ADMIN
    return true;
}

/**
 * Tính toán đường dẫn đích an toàn ngay sau khi đăng nhập thành công.
 * Ưu tiên trả về trang user đang truy cập dở nếu hợp lệ với vai trò; ngược lại đưa về trang mặc định theo vai trò.
 *
 * @param role         Vai trò tài khoản vừa xác thực
 * @param fromPathname Đường dẫn trước đó (nếu bị AuthGuard đẩy về /login)
 * @returns Đường dẫn đích hợp lệ
 */
export function resolvePostLoginRedirect(role: UserRole, fromPathname?: string): string {
    if (fromPathname && canRoleAccessPath(role, fromPathname)) {
        return fromPathname;
    }
    return getDefaultRouteByRole(role);
}
