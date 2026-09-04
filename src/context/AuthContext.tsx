import { createContext, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/features/auth/authService';
import type { AuthUser } from '@/features/auth/authTypes';

interface AuthContextValue {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setUser: (user: AuthUser | null) => void;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

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
