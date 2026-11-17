import { createContext, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { AuthUser } from '../types/authTypes';

/**
 * Interface định nghĩa dữ liệu và các hàm thao tác của AuthContext.
 */
export interface AuthContextValue {
    /** Thông tin người dùng đã xác thực (null nếu chưa đăng nhập hoặc token hết hạn) */
    user: AuthUser | null;
    /** Trạng thái kiểm tra session ban đầu khi khởi chạy ứng dụng */
    isLoading: boolean;
    /** Cờ đánh dấu người dùng đã đăng nhập hay chưa */
    isAuthenticated: boolean;
    /** Hàm cập nhật thông tin user sau khi login hoặc refresh */
    setUser: (user: AuthUser | null) => void;
    /** Hàm thực hiện đăng xuất và xóa phiên làm việc */
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provider quản lý trạng thái xác thực toàn cục cho ứng dụng LEBY.
 *
 * @param children Các component con được bọc bởi AuthProvider
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session: gọi /me một lần khi app mount.
    // Nếu Cookie còn hợp lệ → BE trả về user, nếu không → 401 → user = null.
    useEffect(() => {
        authService
            .me()
            .then((res) => {
                if (res.success) {
                    setUser(res.data);
                }
            })
            .catch(() => {
                // 401 = chưa đăng nhập hoặc session hết hạn — không cần log error
                setUser(null);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const logout = useCallback(async () => {
        await authService.logout().catch(() => {
            // Dù BE fail, vẫn clear state phía FE
        });
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: user !== null,
                setUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
