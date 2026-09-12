import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/features/auth/authTypes';

interface AuthGuardProps {
    children: ReactNode;
    /** Nếu true, bắt buộc phải đăng nhập. Mặc định: true */
    requireAuth?: boolean;
    /** Danh sách role được phép truy cập. Nếu bỏ qua → mọi role đều được */
    allowedRoles?: UserRole[];
}

/**
 * Route guard dùng AuthContext (async-aware).
 *
 * Khác với tmdt đọc localStorage (sync), guard này chờ /me response
 * trước khi quyết định redirect, tránh flash redirect sai khi reload.
 */
function AuthGuard({ children, requireAuth = true, allowedRoles }: AuthGuardProps) {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    // Chờ session check hoàn tất trước khi render
    if (isLoading) {
        return (
            <div id="auth-loading" aria-label="Đang xác thực...">
                {/* Placeholder — sẽ được thay bằng spinner component sau */}
            </div>
        );
    }

    // Chưa đăng nhập → về login, lưu lại đường dẫn hiện tại để redirect sau khi login
    if (requireAuth && !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Đã đăng nhập nhưng không có quyền
    if (user && allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
}

export default AuthGuard;
