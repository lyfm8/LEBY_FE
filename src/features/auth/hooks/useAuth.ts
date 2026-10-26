import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

/**
 * Hook để truy cập AuthContext từ bất kỳ component nào.
 * Phải được dùng bên trong <AuthProvider>.
 *
 * @example
 * const { user, isLoading, logout } = useAuth();
 */
export function useAuth() {
    const ctx = useContext(AuthContext);

    if (!ctx) {
        throw new Error('useAuth must be used inside <AuthProvider>');
    }

    return ctx;
}
