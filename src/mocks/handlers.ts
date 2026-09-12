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
                role: 'USER',
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
                role: 'USER',
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
                role: 'USER',
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
                role: 'USER',
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
                role: 'USER',
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
];
