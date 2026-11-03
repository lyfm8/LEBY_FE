import { http, HttpResponse } from 'msw';

export const adminHandlers = [
    // ── Admin: Dashboard ──
    http.get('*/api/v1/admin/dashboard/summary', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: {
                stats: {
                    totalUsers: 1500,
                    totalUsersGrowthPercent: 12,
                    activeUsersThisMonth: 1200,
                    activeUsersGrowthPercent: 5,
                    totalModules: 24,
                    totalTestsCompleted: 8500,
                },
                usersByMonth: [
                    { month: 'Tháng 1', count: 400 },
                    { month: 'Tháng 2', count: 600 },
                    { month: 'Tháng 3', count: 850 },
                ],
                aimDistribution: [
                    { aimName: 'TOEIC 450+', count: 300, percent: 20 },
                    { aimName: 'TOEIC 600+', count: 800, percent: 53 },
                ],
                moduleTestPassRate: { passPercent: 75, failPercent: 25 },
                recentActivities: [],
            },
        });
    }),

    // ── Admin: Parts ──
    http.get('*/api/v1/admin/parts', () => {
        return HttpResponse.json({
            success: true, message: 'OK',
            data: [
                { id: 1, name: 'Part 1: Photographs', partType: 'LISTENING', description: 'Nghe và chọn mô tả đúng cho bức ảnh', totalQuestions: 6, displayOrder: 1, abilities: [{ id: 10, name: 'Nghe hiểu tranh mô tả người', description: 'Kỹ năng nghe từ vựng liên quan đến hành động' }] },
                { id: 5, name: 'Part 5: Incomplete Sentences', partType: 'READING', description: 'Điền từ vào chỗ trống', totalQuestions: 30, displayOrder: 5, abilities: [{ id: 11, name: 'Ngữ pháp cơ bản', description: 'Thì, từ loại, mệnh đề' }, { id: 12, name: 'Từ vựng thông dụng', description: 'Từ vựng văn phòng, kinh doanh' }] },
            ],
            pagination: { totalItems: 2, totalPages: 1, pageSize: 10, page: 0 },
        });
    }),

    // ── Admin: Questions ──
    http.get('*/api/v1/admin/questions', () => {
        return HttpResponse.json({
            success: true, message: 'OK',
            data: [
                { id: 101, partId: 1, partName: 'Part 1', type: 'MULTIPLE_CHOICE', difficulty: 'EASY', content: '{"text":"What is the man doing?","image":"https://placehold.co/400x300"}', explanation: 'He is typing on a keyboard.', status: 'ACTIVE' },
                { id: 501, partId: 5, partName: 'Part 5', type: 'FILL_IN_THE_BLANK', difficulty: 'MEDIUM', content: '{"text":"Please ______ the form before Friday."}', explanation: 'submit is the correct verb form', status: 'ACTIVE' },
            ],
            pagination: { totalItems: 2, totalPages: 1, pageSize: 10, page: 0 },
        });
    }),

    // ── Admin: Modules ──
    http.get('*/api/v1/admin/modules', () => {
        return HttpResponse.json({
            success: true, message: 'OK',
            data: [
                { id: 1, title: 'Module 1: Basic Grammar', description: 'Nền tảng ngữ pháp cơ bản', orderIndex: 1, targetScore: 450, totalLessons: 5, status: 'PUBLISHED' },
                { id: 2, title: 'Module 2: Advanced Vocabulary', description: 'Từ vựng chuyên ngành', orderIndex: 2, targetScore: 600, totalLessons: 8, status: 'DRAFT' },
            ],
            pagination: { totalItems: 2, totalPages: 1, pageSize: 10, page: 0 },
        });
    }),

    // ── Admin: Target Profiles ──
    http.get('*/api/v1/admin/target-profiles', () => {
        return HttpResponse.json({
            success: true, message: 'OK',
            data: [
                { id: 1, name: 'AIM 450+', targetTotalScore: 450, description: 'Dành cho người mới bắt đầu', createdAt: '2026-01-01T00:00:00Z' },
                { id: 2, name: 'AIM 600+', targetTotalScore: 600, description: 'Dành cho sinh viên ra trường', createdAt: '2026-01-01T00:00:00Z' },
            ],
            pagination: { totalItems: 2, totalPages: 1, pageSize: 10, page: 0 },
        });
    }),

    // ── Admin: Module Target Thresholds ──
    http.get('*/api/v1/admin/module-target-thresholds', () => {
        return HttpResponse.json({
            success: true, message: 'OK',
            data: {
                profileIds: [1, 2],
                profileNames: ['AIM 450+', 'AIM 600+'],
                rows: [
                    { moduleId: 1, moduleTitle: 'Module 1: Basic Grammar', thresholds: { 1: 50, 2: 70 } },
                    { moduleId: 2, moduleTitle: 'Module 2: Advanced Vocabulary', thresholds: { 1: 40, 2: 60 } },
                ],
            },
        });
    }),

    // ── Admin: Diagnostic Tests ──
    http.get('*/api/v1/admin/diagnostic-tests', () => {
        return HttpResponse.json({
            success: true, message: 'OK',
            data: [
                { id: 1, title: 'Đề chẩn đoán đầu vào chuẩn 2026', description: 'Đề test đầy đủ 200 câu', status: 'ACTIVE', totalQuestions: 200, durationMinutes: 120 },
                { id: 2, title: 'Đề chẩn đoán Mini Test', description: 'Đề test rút gọn 100 câu', status: 'DRAFT', totalQuestions: 100, durationMinutes: 60 },
            ],
            pagination: { totalItems: 2, totalPages: 1, pageSize: 10, page: 0 },
        });
    }),

    // Catch-all cho các API admin khác (tránh crash)
    http.get('*/api/v1/admin/*', () => {
        return HttpResponse.json({ success: true, message: 'Mock', data: [], pagination: { totalItems: 0, totalPages: 0, pageSize: 10, page: 0 } });
    }),
];
