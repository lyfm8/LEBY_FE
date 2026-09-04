import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AuthGuard from '@/core/auth/auth.guard';
import LandingPage from '@/features/landing/LandingPage';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import OtpVerifyPage from '@/features/auth/OtpVerifyPage';

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
                {/* ── PUBLIC: Landing (trang chủ mặc định cho khách) ─────── */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/landing" element={<LandingPage />} />

                {/* ── PUBLIC: Auth ─────────────────────────────────────── */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-otp" element={<OtpVerifyPage />} />

                {/* ── PROTECTED: User (sau khi đăng nhập) ─────────────── */}
                <Route
                    path="/home"
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
