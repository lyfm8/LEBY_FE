import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AuthGuard from '@/core/auth/auth.guard';

/**
 * Cấu trúc routes của ứng dụng.
 *
 * Thêm pages vào đây khi đã tạo xong giao diện.
 * Placeholder <div> sẽ được thay bằng component thật.
 */
function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ── PUBLIC: Auth ─────────────────────────────────────── */}
                <Route path="/login" element={<div id="login-page">Login Page (TODO)</div>} />
                <Route path="/register" element={<div id="register-page">Register Page (TODO)</div>} />

                {/* ── PROTECTED: User ──────────────────────────────────── */}
                <Route
                    path="/"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['USER', 'ADMIN', 'STAFF']}>
                            <div id="home-page">Home Page (TODO)</div>
                        </AuthGuard>
                    }
                />

                {/* ── FALLBACK ──────────────────────────────────────────── */}
                <Route path="/unauthorized" element={<div id="unauthorized-page">403 Unauthorized</div>} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
