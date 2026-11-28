import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AuthGuard from '@/core/auth/auth.guard';
import { useAuth } from '@/features/auth/hooks/useAuth';
import LandingPage from '@/features/landing/LandingPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import OtpVerifyPage from '@/features/auth/pages/OtpVerifyPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';

// 1. Onboarding & Diagnostic
import TargetSelectionPage from '@/features/target/pages/TargetSelectionPage';
import DiagnosticRoomPage from '@/features/diagnostic/pages/DiagnosticRoomPage';
import DiagnosticResultPage from '@/features/diagnostic/pages/DiagnosticResultPage';
import DiagnosticReviewPage from '@/features/diagnostic/pages/DiagnosticReviewPage';
// Nhập các màn hình thuộc luồng Thi thử TOEIC chuẩn ETS 200 câu & Báo cáo đầu ra (UC17 & UC18)
import MockExamListPage from '@/features/mock-exam/pages/MockExamListPage';
import MockExamRoomPage from '@/features/mock-exam/pages/MockExamRoomPage';
import MockExamReportPage from '@/features/mock-exam/pages/MockExamReportPage';
import MockExamReviewPage from '@/features/mock-exam/pages/MockExamReviewPage';

// 2. Dashboard & Learning Path
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import LearningPathPage from '@/features/roadmap/pages/LearningPathPage';
import ModuleDetailPage from '@/features/roadmap/pages/ModuleDetailPage';
import CourseCatalogPage from '@/features/catalog/pages/CourseCatalogPage';

// 3. Lesson Room & Practice
import LessonRoomPage from '@/features/lesson/pages/LessonRoomPage';
import { PracticeRoomPage } from '@/features/practice/pages/PracticeRoomPage';

// 4. Module Test & Review
import ModuleTestRoomPage from '@/features/module-test/pages/ModuleTestRoomPage';
import ModuleTestReviewPage from '@/features/module-test/pages/ModuleTestReviewPage';
import ModuleTestResultPage from '@/features/module-test/pages/ModuleTestResultPage';

// 5. User Profile
import ProfilePage from '@/features/profile/pages/ProfilePage';

// 6. Admin
import { AdminDashboardPage } from '@/features/admin/dashboard/pages/AdminDashboardPage';
import { AdminUserPage } from '@/features/admin/user/pages/AdminUserPage';
import { AdminUserDetailPage } from '@/features/admin/user/pages/AdminUserDetailPage';
import { AdminPartPage } from '@/features/admin/part/pages/AdminPartPage';
import {
    AdminQuestionPage,
    QuestionStandaloneEditorPage,
    QuestionGroupEditorPage,
} from '@/features/admin/question';
import { AdminModulePage } from '@/features/admin/module/pages/AdminModulePage';
import { AdminModuleTestPage } from '@/features/admin/module/pages/AdminModuleTestPage';
import { AdminTargetPage } from '@/features/admin/target/pages/AdminTargetPage';
import { AdminThresholdPage } from '@/features/admin/threshold/pages/AdminThresholdPage';
import { AdminDiagnosticTestPage } from '@/features/admin/diagnostic-test/pages/AdminDiagnosticTestPage';
import { AdminLayout } from '@/features/admin/layout/AdminLayout';

/**
 * Điều hướng trang mặc định của cổng quản trị theo vai trò:
 * - ADMIN: vào AdminDashboardPage
 * - TEACHER: chuyển thẳng sang trang Quản lý Mô-đun & Bài học (không có quyền xem Dashboard tổng quan)
 */
function AdminIndexRoute() {
    const { user } = useAuth();
    if (user?.role === 'TEACHER') {
        return <Navigate to="/admin/modules" replace />;
    }
    return (
        <AuthGuard requireAuth={true} allowedRoles={['ADMIN']}>
            <AdminDashboardPage />
        </AuthGuard>
    );
}

/**
 * Cấu trúc routes của ứng dụng LEBY TOEIC Adaptive Learning.
 */
function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ── PUBLIC: Landing & Auth (UC01, UC02, UC04) ──────────────── */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-otp" element={<OtpVerifyPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* ── PROTECTED: Onboarding & Diagnostic (UC05 - UC07) ───────── */}
                <Route
                    path="/target-selection"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <TargetSelectionPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/onboarding/target"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <TargetSelectionPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/diagnostic/room"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <DiagnosticRoomPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/diagnostic/results/:attemptId"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <DiagnosticResultPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/diagnostic/results"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <DiagnosticResultPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/diagnostic/review/:attemptId"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <DiagnosticReviewPage />
                        </AuthGuard>
                    }
                />

                {/* ── PROTECTED: Phòng thi thử ETS 200 câu & Báo cáo đầu ra (UC17 & UC18) ── */}
                <Route
                    path="/mock-exam"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <MockExamListPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/mock-exam/room"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <MockExamRoomPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/mock-exam/room/:attemptId"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <MockExamRoomPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/mock-exam/report"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <MockExamReportPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/mock-exam/report/:attemptId"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <MockExamReportPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/mock-exam/results/:attemptId"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <MockExamReportPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/mock-exam/review/:attemptId"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <MockExamReviewPage />
                        </AuthGuard>
                    }
                />

                {/* ── PROTECTED: Trang chủ học tập & Lộ trình ────────────────── */}
                <Route
                    path="/dashboard"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <DashboardPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/home"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <DashboardPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/learning-path"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <LearningPathPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/catalog"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <CourseCatalogPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/modules/:moduleId"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <ModuleDetailPage />
                        </AuthGuard>
                    }
                />

                {/* ── PROTECTED: Phòng học bài giảng & Luyện tập ────────────── */}
                <Route
                    path="/modules/:moduleId/lessons/:lessonId"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <LessonRoomPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/modules/:moduleId/lessons/:lessonId/practice"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <PracticeRoomPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/lessons/:lessonId/practice"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <PracticeRoomPage />
                        </AuthGuard>
                    }
                />

                {/* ── PROTECTED: Phòng thi vượt ải module & Xem lại kết quả ─── */}
                <Route
                    path="/modules/:moduleId/test"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <ModuleTestRoomPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/modules/:moduleId/test/result/:attemptId"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <ModuleTestResultPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/modules/:moduleId/test/result"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <ModuleTestResultPage />
                        </AuthGuard>
                    }
                />
                <Route
                    path="/modules/:moduleId/test/review/:attemptId"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <ModuleTestReviewPage />
                        </AuthGuard>
                    }
                />

                {/* ── PROTECTED: Trang cá nhân & Năng lực ────────────────────── */}
                <Route
                    path="/profile"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']}>
                            <ProfilePage />
                        </AuthGuard>
                    }
                />

                {/* ── PROTECTED: Hệ thống Quản trị (Admin & Teacher) ────────────── */}
                <Route
                    path="/admin"
                    element={
                        <AuthGuard requireAuth={true} allowedRoles={['ADMIN', 'TEACHER']}>
                            <AdminLayout />
                        </AuthGuard>
                    }
                >
                    <Route index element={<AdminIndexRoute />} />
                    <Route
                        path="users"
                        element={
                            <AuthGuard requireAuth={true} allowedRoles={['ADMIN']}>
                                <AdminUserPage />
                            </AuthGuard>
                        }
                    />
                    <Route
                        path="users/:id"
                        element={
                            <AuthGuard requireAuth={true} allowedRoles={['ADMIN']}>
                                <AdminUserDetailPage />
                            </AuthGuard>
                        }
                    />
                    <Route path="parts" element={<AdminPartPage />} />
                    <Route path="questions" element={<AdminQuestionPage />} />
                    <Route path="questions/new" element={<QuestionStandaloneEditorPage />} />
                    <Route path="questions/:id/edit" element={<QuestionStandaloneEditorPage />} />
                    <Route path="question-groups/new" element={<QuestionGroupEditorPage />} />
                    <Route path="question-groups/:id/edit" element={<QuestionGroupEditorPage />} />
                    <Route path="modules" element={<AdminModulePage />} />
                    <Route path="module-tests" element={<AdminModuleTestPage />} />
                    <Route path="targets" element={<AdminTargetPage />} />
                    <Route path="thresholds" element={<AdminThresholdPage />} />
                    <Route path="diagnostic-tests" element={<AdminDiagnosticTestPage />} />
                </Route>

                {/* ── FALLBACK ────────────────────────────────────────────────── */}
                <Route path="/unauthorized" element={<div id="unauthorized-page">403 Unauthorized</div>} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
