import { http, HttpResponse } from 'msw';
import {
    mockTargetProfiles,
    mockDiagnosticTest,
    mockDiagnosticResult,
    mockDashboardSummary,
    mockRoadmapData,
    mockModuleDetail,
    mockLessonDetail,
    mockModuleTestData,
    mockModuleTestResult,
    mockModulePerformanceReport,
    mockProfileData,
} from './mockData';

export const handlers = [
        // ── Auth Handlers ──
    http.get('*/api/auth/me', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: {
                id: 1,
                email: 'nam.nguyen@leby.edu.vn',
                username: 'student_nam',
                fullName: 'Nguyễn Nam',
                role: 'ADMIN',
                dob: '2001-08-15',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            },
        });
    }),

    http.get('*/api/v1/auth/me', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: {
                id: 1,
                email: 'nam.nguyen@leby.edu.vn',
                username: 'student_nam',
                fullName: 'Nguyễn Nam',
                role: 'ADMIN',
                dob: '2001-08-15',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            },
        });
    }),

    http.post('*/api/auth/login', async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as { username?: string };
        return HttpResponse.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                id: 1,
                email: 'nam.nguyen@leby.edu.vn',
                username: body?.username || 'student_nam',
                fullName: 'Nguyễn Nam',
                role: 'ADMIN',
                dob: '2001-08-15',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            },
        });
    }),

    http.post('*/api/v1/auth/login', async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as { username?: string };
        return HttpResponse.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                id: 1,
                email: 'nam.nguyen@leby.edu.vn',
                username: body?.username || 'student_nam',
                fullName: 'Nguyễn Nam',
                role: 'ADMIN',
                dob: '2001-08-15',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            },
        });
    }),

    http.post('*/api/auth/logout', () => {
        return HttpResponse.json({
            success: true,
            message: 'Đăng xuất thành công',
            data: null,
        });
    }),

    http.post('*/api/v1/auth/logout', () => {
        return HttpResponse.json({
            success: true,
            message: 'Đăng xuất thành công',
            data: null,
        });
    }),

    http.post('*/api/auth/register', () => {
        return HttpResponse.json({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                id: 1,
                email: 'nam.nguyen@leby.edu.vn',
                username: 'student_nam',
                fullName: 'Nguyễn Nam',
                role: 'ADMIN',
                dob: '2001-08-15',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            },
        });
    }),

    http.post('*/api/auth/register/send-otp', () => {
        return HttpResponse.json({
            success: true,
            message: 'Mã OTP 6 số đã được gửi tới email của bạn (Mã mẫu: 123456)',
            data: null,
        });
    }),

// ── Target ──
    http.get('*/api/v1/targets', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: mockTargetProfiles,
        });
    }),

    http.post('*/api/v1/targets/select', async ({ request }) => {
        const body = (await request.json()) as { targetProfileId: number };
        const selected = mockTargetProfiles.find((t) => t.id === body.targetProfileId) ?? mockTargetProfiles[2];

        return HttpResponse.json({
            success: true,
            message: 'Thiết lập mục tiêu thành công',
            data: {
                planId: 101,
                userId: 1,
                targetProfileId: selected.id,
                targetTotalScore: selected.targetTotalScore,
            },
        });
    }),

    // ── Diagnostic ──
    http.get('*/api/v1/diagnostic/comprehensive-test', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: mockDiagnosticTest,
        });
    }),

    http.post('*/api/v1/diagnostic/submit', async () => {
        return HttpResponse.json({
            success: true,
            message: 'Chấm bài chẩn đoán thành công',
            data: {
                attemptId: 501,
                redirectUrl: '/diagnostic/results/501',
            },
        });
    }),

    http.get('*/api/v1/diagnostic/results/:attemptId', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: mockDiagnosticResult,
        });
    }),

    // ── Dashboard ──
    http.get('*/api/v1/dashboard/summary', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: mockDashboardSummary,
        });
    }),

    // ── Roadmap ──
    http.get('*/api/v1/roadmap', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: mockRoadmapData,
        });
    }),

    http.get('*/api/v1/modules/:moduleId', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: mockModuleDetail,
        });
    }),

    // ── Lesson ──
    http.get('*/api/v1/modules/:moduleId/lessons/:lessonId', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: mockLessonDetail,
        });
    }),

    http.post('*/api/v1/modules/:moduleId/lessons/:lessonId/complete', () => {
        return HttpResponse.json({
            success: true,
            message: 'Hoàn thành bài học thành công',
            data: {
                lessonId: 3,
                isCompleted: true,
                nextLessonId: 4,
            },
        });
    }),

    // ── Module Test ──
    http.get('*/api/v1/modules/:moduleId/test', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: mockModuleTestData,
        });
    }),

    http.post('*/api/v1/modules/:moduleId/test/submit', () => {
        return HttpResponse.json({
            success: true,
            message: 'Chấm bài module test thành công',
            data: mockModuleTestResult,
    mockModulePerformanceReport,
        });
    }),

        http.get('*/api/v1/modules/:moduleId/test/results/:attemptId', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: mockModulePerformanceReport,
        });
    }),

    http.get('*/api/v1/learning-results/latest', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: mockModulePerformanceReport,
        });
    }),

    http.get('*/api/v1/modules/:moduleId/test/review/:attemptId', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: mockModuleTestResult,
    mockModulePerformanceReport,
        });
    }),

    // ── Profile ──
    http.get('*/api/v1/users/profile', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: mockProfileData,
        });
    }),

    http.put('*/api/v1/users/profile', async ({ request }) => {
        const body = (await request.json()) as Partial<typeof mockProfileData.user>;
        const updated = { ...mockProfileData, user: { ...mockProfileData.user, ...body } };
        return HttpResponse.json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            data: updated,
        });
    }),

    http.post('*/api/v1/users/change-password', () => {
        return HttpResponse.json({
            success: true,
            message: 'Đổi mật khẩu thành công',
            data: { message: 'Đổi mật khẩu thành công' },
        });
    }),

    // ── Admin ──
    http.get('*/api/v1/admin/dashboard/summary', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: {
                stats: { totalUsers: 1500, totalUsersGrowthPercent: 12, activeUsersThisMonth: 1200, activeUsersGrowthPercent: 5, totalModules: 24, totalTestsCompleted: 8500 },
                usersByMonth: [{ month: 'Tháng 1', count: 400 }, { month: 'Tháng 2', count: 600 }, { month: 'Tháng 3', count: 850 }],
                aimDistribution: [{ aimName: 'TOEIC 450+', count: 300, percent: 20 }, { aimName: 'TOEIC 600+', count: 800, percent: 53 }],
                moduleTestPassRate: { passPercent: 75, failPercent: 25 },
                recentActivities: []
            }
        });
    }),
    
    // ── Admin: Users ──
    http.get('*/api/v1/admin/users', () => {
        return HttpResponse.json({ success: true, message: 'OK', data: [
            { id: 1, username: 'admin_leby', email: 'admin@leby.edu.vn', fullName: 'Admin LEBY', role: 'ADMIN', status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z' },
            { id: 2, username: 'student_nam', email: 'nam.nguyen@leby.edu.vn', fullName: 'Nguyễn Nam', role: 'USER', status: 'ACTIVE', createdAt: '2026-08-15T00:00:00Z' }
        ], pagination: { totalElements: 2, totalPages: 1, size: 10, page: 0 }
        });
    }),

    // ── Admin: Parts ──
    http.get('*/api/v1/admin/parts', () => {
        return HttpResponse.json({ success: true, message: 'OK', data: [
            { id: 1, name: 'Part 1: Photographs', partType: 'LISTENING', description: 'Nghe và chọn mô tả đúng cho bức ảnh', totalQuestions: 6, displayOrder: 1 },
            { id: 5, name: 'Part 5: Incomplete Sentences', partType: 'READING', description: 'Điền từ vào chỗ trống', totalQuestions: 30, displayOrder: 5 }
        ], pagination: { totalElements: 2, totalPages: 1, size: 10, page: 0 }
        });
    }),

    // ── Admin: Questions ──
    http.get('*/api/v1/admin/questions', () => {
        return HttpResponse.json({ success: true, message: 'OK', data: {
            content: [
                { id: 101, partId: 1, partName: 'Part 1', type: 'MULTIPLE_CHOICE', difficulty: 'EASY', content: '{"text":"What is the man doing?","image":"https://placehold.co/400x300"}', explanation: 'He is typing on a keyboard.', status: 'ACTIVE' },
                { id: 501, partId: 5, partName: 'Part 5', type: 'FILL_IN_THE_BLANK', difficulty: 'MEDIUM', content: '{"text":"Please ______ the form before Friday."}', explanation: 'submit is the correct verb form', status: 'ACTIVE' }
            ], totalElements: 2, totalPages: 1, size: 10, number: 0 }
        });
    }),

    // ── Admin: Modules ──
    http.get('*/api/v1/admin/modules', () => {
        return HttpResponse.json({ success: true, message: 'OK', data: {
            content: [
                { id: 1, title: 'Module 1: Basic Grammar', description: 'Nền tảng ngữ pháp cơ bản', orderIndex: 1, targetScore: 450, totalLessons: 5, status: 'PUBLISHED' },
                { id: 2, title: 'Module 2: Advanced Vocabulary', description: 'Từ vựng chuyên ngành', orderIndex: 2, targetScore: 600, totalLessons: 8, status: 'DRAFT' }
            ], totalElements: 2, totalPages: 1, size: 10, number: 0 }
        });
    }),

    // ── Admin: Target Profiles ──
    http.get('*/api/v1/admin/targets', () => {
        return HttpResponse.json({ success: true, message: 'OK', data: {
            content: [
                { id: 1, name: 'Mục tiêu 450+', aimScore: 450, description: 'Dành cho người mới bắt đầu', createdAt: '2026-01-01T00:00:00Z' },
                { id: 2, name: 'Mục tiêu 600+', aimScore: 600, description: 'Dành cho sinh viên ra trường', createdAt: '2026-01-01T00:00:00Z' }
            ], totalElements: 2, totalPages: 1, size: 10, number: 0 }
        });
    }),

    // ── Admin: Diagnostic Tests ──
    http.get('*/api/v1/admin/diagnostic-tests', () => {
        return HttpResponse.json({ success: true, message: 'OK', data: {
            content: [
                { id: 1, title: 'Đề chẩn đoán đầu vào chuẩn 2026', description: 'Đề test đầy đủ 200 câu', status: 'ACTIVE', totalQuestions: 200, estimatedMinutes: 120 },
                { id: 2, title: 'Đề chẩn đoán Mini Test', description: 'Đề test rút gọn 100 câu', status: 'DRAFT', totalQuestions: 100, estimatedMinutes: 60 }
            ], totalElements: 2, totalPages: 1, size: 10, number: 0 }
        });
    }),
    
    // Catch-all cho các API admin khác (tránh crash, trả về mảng rỗng)
    http.get('*/api/v1/admin/*', () => {
        return HttpResponse.json({ success: true, message: 'Mock', data: { content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 } });
    }),
];
