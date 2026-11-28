import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthCard } from '../components/AuthCard';
import { LoginForm } from '../components/LoginForm';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { getDefaultRouteByRole, resolvePostLoginRedirect } from '../utils/authRedirect';
import { hasPendingDiagnosticSubmitForUser } from '@/features/diagnostic/utils/diagnosticExamUtils';
import type { UserRole } from '../types/authTypes';
import type { LoginFormValues } from '../schemas/authSchema';
import '../auth.css';

function canStudentSubmitDiagnostic(role: UserRole, hasSelectedTarget?: boolean): boolean {
    if (role === 'STUDENT' && hasSelectedTarget === false) {
        return false;
    }
    return true;
}

interface LoginLocationState {
    from?: { pathname?: string };
    successMessage?: string;
}

/**
 * Smart / Container Component: Trang Đăng nhập tài khoản LEBY (UC02).
 * Điều phối phân luồng sau đăng nhập theo đúng vai trò:
 * - ADMIN   → /admin (Cổng Quản trị)
 * - TEACHER → /admin/modules (Cổng Giảng viên)
 * - STUDENT → /dashboard (hoặc trang đang truy cập dở nếu hợp lệ với vai trò STUDENT)
 */
export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoading: isAuthLoading, setUser } = useAuth();

    const state = (location.state as LoginLocationState | null) ?? null;
    const fromPathname = state?.from?.pathname;
    const infoMessage = state?.successMessage;

    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Nếu người dùng đã có phiên đăng nhập hợp lệ, tự động đưa thẳng về trang chủ đúng vai trò
    useEffect(() => {
        if (!isAuthLoading && user) {
            navigate(getDefaultRouteByRole(user.role, user.hasSelectedTarget), { replace: true });
        }
    }, [isAuthLoading, user, navigate]);

    /**
     * Xử lý xác thực người dùng khi gửi form đăng nhập.
     */
    const handleLogin = async (data: LoginFormValues) => {
        setIsLoading(true);
        setServerError('');

        try {
            // Bước 1: Gửi request đăng nhập lên Backend (BE cấp HTTP-Only Cookie + trả thông tin user kèm role)
            const res = await authService.login({
                email: data.email.trim(),
                password: data.password,
            });

            // Bước 2: Cập nhật AuthContext và điều hướng an toàn theo đúng vai trò (chống điều hướng chéo 403)
            if (res.success && res.data) {
                setUser(res.data);

                // UC06 Ngoại lệ 9a: Nếu học viên bị hết phiên đúng lúc nộp bài chẩn đoán,
                // chỉ điều hướng lại /diagnostic/room khi payload pending khớp đúng userId vừa đăng nhập
                const hasPendingDiagnosticSubmit = hasPendingDiagnosticSubmitForUser(res.data.id);
                if (hasPendingDiagnosticSubmit && canStudentSubmitDiagnostic(res.data.role, res.data.hasSelectedTarget)) {
                    navigate('/diagnostic/room', { replace: true });
                    return;
                }

                const targetPath = resolvePostLoginRedirect(
                    res.data.role,
                    fromPathname,
                    res.data.hasSelectedTarget
                );
                navigate(targetPath, { replace: true });
            } else {
                setServerError(res.message ?? 'Đăng nhập thất bại. Vui lòng thử lại.');
            }
        } catch (error: unknown) {
            // Bước 3: Bắt và hiển thị đúng thông điệp lỗi từ Backend (sai mật khẩu, tài khoản bị khóa...)
            if (axios.isAxiosError(error) && error.response?.data?.message) {
                setServerError(String(error.response.data.message));
            } else {
                setServerError('Email hoặc mật khẩu không đúng.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthCard
            id="login-page"
            title="Đăng nhập vào LEBY"
            subtitle="Rèn luyện TOEIC nghiêm túc và bài bản"
        >
            <LoginForm
                onSubmit={handleLogin}
                isLoading={isLoading}
                serverError={serverError}
                infoMessage={infoMessage}
            />
        </AuthCard>
    );
};

export default LoginPage;
