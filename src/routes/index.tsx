import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AuthGuard from '@/core/auth/auth.guard';
import LandingPage from '@/features/landing/LandingPage';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import OtpVerifyPage from '@/features/auth/OtpVerifyPage';

// 1. Onboarding & Diagnostic
import TargetSelectionPage from '@/features/target/pages/TargetSelectionPage';
import DiagnosticRoomPage from '@/features/diagnostic/pages/DiagnosticRoomPage';
import DiagnosticResultPage from '@/features/diagnostic/pages/DiagnosticResultPage';

// 2. Dashboard & Learning Path
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import LearningPathPage from '@/features/roadmap/pages/LearningPathPage';
import ModuleDetailPage from '@/features/roadmap/pages/ModuleDetailPage';

// 3. Lesson Room & Practice
import LessonRoomPage from '@/features/lesson/pages/LessonRoomPage';

// 4. Module Test & Review
import ModuleTestRoomPage from '@/features/module-test/pages/ModuleTestRoomPage';
import ModuleTestReviewPage from '@/features/module-test/pages/ModuleTestReviewPage';
import ModuleTestResultPage from '@/features/module-test/pages/ModuleTestResultPage';

// 5. User Profile
import ProfilePage from '@/features/profile/pages/ProfilePage';

/**
 * Cấu trúc routes của ứng dụng LEBY TOEIC Adaptive Learning.
 */
function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ── PUBLIC: Landing & Auth ─────────────────────────────────── */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-otp" element={<OtpVerifyPage />} />

                {/* ── ONBOARDING & DIAGNOSTIC ────────────────────────────────── */}
                <Route path="/target-selection" element={<TargetSelectionPage />} />
                <Route path="/onboarding/target" element={<TargetSelectionPage />} />
                <Route path="/diagnostic/room" element={<DiagnosticRoomPage />} />
                <Route path="/diagnostic/results/:attemptId" element={<DiagnosticResultPage />} />
                <Route path="/diagnostic/results" element={<DiagnosticResultPage />} />

                {/* ── PROTECTED: Trang chủ học tập & Lộ trình ────────────────── */}
                <Route
                    path="/dashboard"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['USER', 'ADMIN', 'STAFF']}>
                            <DashboardPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/home"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['USER', 'ADMIN', 'STAFF']}>
                            <DashboardPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/learning-path"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['USER', 'ADMIN', 'STAFF']}>
                            <LearningPathPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/modules/:moduleId"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['USER', 'ADMIN', 'STAFF']}>
                            <ModuleDetailPage />
                        </AuthGuard>
                    }
                />

                {/* ── PROTECTED: Phòng học bài giảng & Luyện tập ────────────── */}
                <Route
                    path="/modules/:moduleId/lessons/:lessonId"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['USER', 'ADMIN', 'STAFF']}>
                            <LessonRoomPage />
                        </AuthGuard>
                    }
                />

                {/* ── PROTECTED: Phòng thi vượt ải module & Xem lại kết quả ─── */}
                <Route
                    path="/modules/:moduleId/test"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['USER', 'ADMIN', 'STAFF']}>
                            <ModuleTestRoomPage />
                        </AuthGuard>
                    }
                />
                                <Route
                    path="/results"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['USER', 'ADMIN', 'STAFF']}>
                            <ModuleTestResultPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/learning-results"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['USER', 'ADMIN', 'STAFF']}>
                            <ModuleTestResultPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/modules/:moduleId/test/result/:attemptId"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['USER', 'ADMIN', 'STAFF']}>
                            <ModuleTestResultPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/modules/:moduleId/test/result"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['USER', 'ADMIN', 'STAFF']}>
                            <ModuleTestResultPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/modules/:moduleId/test/review/:attemptId"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['USER', 'ADMIN', 'STAFF']}>
                            <ModuleTestReviewPage />
                        </AuthGuard>
                    }
                />

                {/* ── PROTECTED: Trang cá nhân & Năng lực ────────────────────── */}
                <Route
                    path="/profile"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['USER', 'ADMIN', 'STAFF']}>
                            <ProfilePage />
                        </AuthGuard>
                    }
                />

                {/* ── FALLBACK ────────────────────────────────────────────────── */}
                <Route path="/unauthorized" element={<div id="unauthorized-page">403 Unauthorized</div>} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
