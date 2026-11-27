/**
 * Public API của module Xác thực (Auth Feature).
 */
export { AuthProvider, AuthContext } from './context/AuthContext';
export type { AuthContextValue } from './context/AuthContext';
export { useAuth } from './hooks/useAuth';
export { authService } from './services/authService';
export { getDefaultRouteByRole, canRoleAccessPath, resolvePostLoginRedirect } from './utils/authRedirect';
export { ForgotPasswordPage } from './pages/ForgotPasswordPage';
export * from './types/authTypes';
