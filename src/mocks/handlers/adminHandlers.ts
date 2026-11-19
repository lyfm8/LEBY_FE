import { http, HttpResponse } from 'msw';

export const adminHandlers = [
    // ── Admin: Dashboard Summary (A01) ──
    http.get('*/api/admin/dashboard/summary', () => {
        return HttpResponse.json({
            success: true,
            message: 'Lấy dữ liệu thống kê tổng quan thành công',
            data: {
                stats: {
                    totalUsers: 1250,
                    totalUsersGrowthPercent: 14.5,
                    activeUsersThisMonth: 820,
                    activeUsersGrowthPercent: 8.2,
                    learningPathCompletionRate: 68.4,
                    moduleTestPassRate: 76.5,
                    totalTestsCompleted: 3420,
                    totalModules: 28,
                },
                usersByMonth: [
                    { month: 'Tháng 06', newUsersCount: 180, testSubmissionsCount: 420 },
                    { month: 'Tháng 07', newUsersCount: 210, testSubmissionsCount: 510 },
                    { month: 'Tháng 08', newUsersCount: 260, testSubmissionsCount: 680 },
                    { month: 'Tháng 09', newUsersCount: 310, testSubmissionsCount: 820 },
                    { month: 'Tháng 10', newUsersCount: 390, testSubmissionsCount: 1050 },
                    { month: 'Tháng 11', newUsersCount: 450, testSubmissionsCount: 1280 },
                ],
                aimDistribution: [
                    { aimName: 'AIM 450', count: 280, percent: 22.4 },
                    { aimName: 'AIM 550', count: 450, percent: 36.0 },
                    { aimName: 'AIM 650', count: 320, percent: 25.6 },
                    { aimName: 'AIM 750', count: 140, percent: 11.2 },
                    { aimName: 'AIM 850', count: 60, percent: 4.8 },
                ],
                topDifficultModules: [
                    {
                        moduleId: 12,
                        moduleTitle: 'Mệnh đề quan hệ rút gọn nâng cao',
                        partName: 'Part 5',
                        totalAttempts: 120,
                        failCount: 46,
                        failPercent: 38.3,
                    },
                    {
                        moduleId: 7,
                        moduleTitle: 'Bẫy suy luận thông tin đa đoạn văn',
                        partName: 'Part 7',
                        totalAttempts: 98,
                        failCount: 35,
                        failPercent: 35.7,
                    },
                    {
                        moduleId: 3,
                        moduleTitle: 'Câu điều kiện hỗn hợp loại 2 và 3',
                        partName: 'Part 5',
                        totalAttempts: 145,
                        failCount: 42,
                        failPercent: 29.0,
                    },
                ],
                recentActivities: [
                    {
                        id: 101,
                        userId: 3,
                        fullName: 'Nguyễn Hải Nam',
                        avatar: 'https://res.cloudinary.com/leby-toeic/image/upload/v1714500102/avatars/student_nam.png',
                        action: 'Vượt ải Module: Ngữ pháp cơ bản Part 5',
                        aimTarget: 'AIM 650',
                        timeAgo: '15 phút trước',
                        timestamp: '2026-11-13T09:55:00',
                        resultBadge: 'PASS',
                        score: 85,
                    },
                    {
                        id: 102,
                        userId: 5,
                        fullName: 'Trần Thị Thu Hà',
                        avatar: null,
                        action: 'Nộp bài thi: Đề chẩn đoán đầu vào chuẩn 2026',
                        aimTarget: 'Chẩn đoán',
                        timeAgo: '42 phút trước',
                        timestamp: '2026-11-13T09:28:00',
                        resultBadge: 'DIAGNOSTIC',
                        score: null,
                    },
                    {
                        id: 103,
                        userId: 8,
                        fullName: 'Lê Hoàng Long',
                        avatar: null,
                        action: 'Đăng ký tài khoản học viên',
                        aimTarget: 'AIM 550',
                        timeAgo: '2 giờ trước',
                        timestamp: '2026-11-13T08:10:00',
                        resultBadge: 'NEW',
                        score: null,
                    },
                    {
                        id: 104,
                        userId: 2,
                        fullName: 'Phạm Minh Đức',
                        avatar: null,
                        action: 'Vượt ải Module: Bẫy từ đồng âm Part 1',
                        aimTarget: 'AIM 450',
                        timeAgo: '3 giờ trước',
                        timestamp: '2026-11-13T07:15:00',
                        resultBadge: 'FAIL',
                        score: 45,
                    },
                ],
            },
        });
    }),
    http.get('*/api/v1/admin/dashboard/summary', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: {
                stats: {
                    totalUsers: 1250,
                    totalUsersGrowthPercent: 14.5,
                    activeUsersThisMonth: 820,
                    activeUsersGrowthPercent: 8.2,
                    learningPathCompletionRate: 68.4,
                    moduleTestPassRate: 76.5,
                    totalTestsCompleted: 3420,
                    totalModules: 28,
                },
                usersByMonth: [
                    { month: 'Tháng 06', newUsersCount: 180, testSubmissionsCount: 420 },
                    { month: 'Tháng 07', newUsersCount: 210, testSubmissionsCount: 510 },
                    { month: 'Tháng 08', newUsersCount: 260, testSubmissionsCount: 680 },
                    { month: 'Tháng 09', newUsersCount: 310, testSubmissionsCount: 820 },
                    { month: 'Tháng 10', newUsersCount: 390, testSubmissionsCount: 1050 },
                    { month: 'Tháng 11', newUsersCount: 450, testSubmissionsCount: 1280 },
                ],
                aimDistribution: [
                    { aimName: 'AIM 450', count: 280, percent: 22.4 },
                    { aimName: 'AIM 550', count: 450, percent: 36.0 },
                    { aimName: 'AIM 650', count: 320, percent: 25.6 },
                    { aimName: 'AIM 750', count: 140, percent: 11.2 },
                    { aimName: 'AIM 850', count: 60, percent: 4.8 },
                ],
                topDifficultModules: [],
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
    http.get(/.*\/api\/(v1\/)?admin\/target-profiles/, () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: [
                { id: 1, name: 'AIM 450', aimScore: 450, targetTotalScore: 450, description: 'Mục tiêu Sơ cấp 450 TOEIC', totalUsers: 120, createdAt: '2026-01-01T00:00:00Z' },
                { id: 5, name: 'AIM 550', aimScore: 550, targetTotalScore: 550, description: 'Mục tiêu Tiền trung cấp 550 TOEIC', totalUsers: 250, createdAt: '2026-01-01T00:00:00Z' },
                { id: 2, name: 'AIM 650', aimScore: 650, targetTotalScore: 650, description: 'Mục tiêu Trung cấp 650 TOEIC', totalUsers: 340, createdAt: '2026-01-01T00:00:00Z' },
                { id: 6, name: 'AIM 750', aimScore: 750, targetTotalScore: 750, description: 'Mục tiêu Thành thạo 750 TOEIC', totalUsers: 180, createdAt: '2026-01-01T00:00:00Z' },
                { id: 3, name: 'AIM 800', aimScore: 800, targetTotalScore: 800, description: 'Mục tiêu Nâng cao 800 TOEIC', totalUsers: 95, createdAt: '2026-01-01T00:00:00Z' },
                { id: 4, name: 'AIM 990', aimScore: 990, targetTotalScore: 990, description: 'Mục tiêu Xuất sắc 990 TOEIC', totalUsers: 45, createdAt: '2026-01-01T00:00:00Z' },
            ],
            pagination: { totalItems: 6, totalPages: 1, pageSize: 10, page: 0 },
        });
    }),

    // ── Admin: Module Target Thresholds Matrix ──
    http.get(/.*\/api\/(v1\/)?admin\/module-target-thresholds(\/matrix)?/, ({ request }) => {
        const url = new URL(request.url);
        const filterPartId = url.searchParams.get('partId');

        const allRows = [
            {
                moduleId: 1,
                moduleTitle: 'Chinh phục bẫy hành động và bối cảnh Part 1',
                moduleSequence: 1,
                partId: 1,
                partName: 'Part 1: Photographs',
                defaultPassScore: 70,
                thresholds: { '1': 60, '5': 65, '2': 75, '6': 80, '3': 85, '4': 95 },
                isCustom: { '1': true, '5': true, '2': true, '6': true, '3': true, '4': true },
            },
            {
                moduleId: 2,
                moduleTitle: 'Phản xạ câu hỏi Wh-Questions thần tốc Part 2',
                moduleSequence: 2,
                partId: 2,
                partName: 'Part 2: Question - Response',
                defaultPassScore: 70,
                thresholds: { '1': 60, '5': 65, '2': 70, '6': 75, '3': 85, '4': 95 },
                isCustom: { '1': true, '5': true, '2': false, '6': true, '3': true, '4': true },
            },
            {
                moduleId: 3,
                moduleTitle: 'Phương pháp bắt Keyword & Ngữ điệu Part 3',
                moduleSequence: 3,
                partId: 3,
                partName: 'Part 3: Short Conversations',
                defaultPassScore: 75,
                thresholds: { '1': 60, '5': 65, '2': 70, '6': 75, '3': 80, '4': 90 },
                isCustom: { '1': true, '5': true, '2': true, '6': false, '3': true, '4': true },
            },
            {
                moduleId: 4,
                moduleTitle: 'Bí kíp đọc lướt câu hỏi & biểu đồ Part 4',
                moduleSequence: 4,
                partId: 4,
                partName: 'Part 4: Short Talks',
                defaultPassScore: 75,
                thresholds: { '1': 60, '5': 65, '2': 70, '6': 75, '3': 80, '4': 90 },
                isCustom: { '1': true, '5': true, '2': true, '6': false, '3': true, '4': true },
            },
            {
                moduleId: 5,
                moduleTitle: 'Làm chủ 12 thì và thể bị động Part 5',
                moduleSequence: 5,
                partId: 5,
                partName: 'Part 5: Incomplete Sentences',
                defaultPassScore: 80,
                thresholds: { '1': 65, '5': 70, '2': 75, '6': 80, '3': 85, '4': 95 },
                isCustom: { '1': true, '5': true, '2': true, '6': false, '3': true, '4': true },
            },
            {
                moduleId: 6,
                moduleTitle: 'Chiến thuật từ loại & Collocations công sở Part 5',
                moduleSequence: 6,
                partId: 5,
                partName: 'Part 5: Incomplete Sentences',
                defaultPassScore: 80,
                thresholds: { '1': 65, '5': 70, '2': 75, '6': 80, '3': 85, '4': 95 },
                isCustom: { '1': true, '5': true, '2': true, '6': false, '3': true, '4': true },
            },
            {
                moduleId: 7,
                moduleTitle: 'Kỹ năng tư duy điền câu văn bản Part 6',
                moduleSequence: 7,
                partId: 6,
                partName: 'Part 6: Text Completion',
                defaultPassScore: 75,
                thresholds: { '1': 60, '5': 65, '2': 75, '6': 80, '3': 85, '4': 95 },
                isCustom: { '1': true, '5': true, '2': false, '6': true, '3': true, '4': true },
            },
            {
                moduleId: 8,
                moduleTitle: 'Giải mã Email & Memos điều hành Part 7',
                moduleSequence: 8,
                partId: 7,
                partName: 'Part 7: Reading Comprehension',
                defaultPassScore: 80,
                thresholds: { '1': 65, '5': 70, '2': 75, '6': 80, '3': 85, '4': 95 },
                isCustom: { '1': true, '5': true, '2': true, '6': false, '3': true, '4': true },
            },
            {
                moduleId: 9,
                moduleTitle: 'Vượt bẫy văn bản đôi và ba Part 7',
                moduleSequence: 9,
                partId: 7,
                partName: 'Part 7: Reading Comprehension',
                defaultPassScore: 80,
                thresholds: { '1': 65, '5': 70, '2': 75, '6': 80, '3': 85, '4': 95 },
                isCustom: { '1': true, '5': true, '2': true, '6': false, '3': true, '4': true },
            },
            {
                moduleId: 10,
                moduleTitle: 'Tổng ôn thi vượt ải TOEIC toàn diện',
                moduleSequence: 10,
                partId: 5,
                partName: 'Part 5: Incomplete Sentences',
                defaultPassScore: 85,
                thresholds: { '1': 70, '5': 75, '2': 80, '6': 85, '3': 90, '4': 98 },
                isCustom: { '1': true, '5': true, '2': true, '6': false, '3': true, '4': true },
            },
        ];

        const rows = filterPartId
            ? allRows.filter((r) => r.partId === Number(filterPartId))
            : allRows;

        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: {
                profileIds: [1, 5, 2, 6, 3, 4],
                profileScores: [450, 550, 650, 750, 800, 990],
                profileNames: ['AIM 450', 'AIM 550', 'AIM 650', 'AIM 750', 'AIM 800', 'AIM 990'],
                rows,
            },
        });
    }),
    http.post('*/api/admin/module-target-thresholds/batch', () => {
        return HttpResponse.json({ success: true, message: 'Updated batch successfully', data: [] });
    }),
    http.put('*/api/admin/module-target-thresholds/single', () => {
        return HttpResponse.json({ success: true, message: 'Updated single successfully', data: null });
    }),
    http.delete('*/api/admin/module-target-thresholds/reset', () => {
        return HttpResponse.json({ success: true, message: 'Reset successfully' });
    }),
    http.put(/.*\/api\/(v1\/)?admin\/module-target-thresholds/, () => {
        return HttpResponse.json({ success: true, message: 'Updated batch successfully', data: [] });
    }),

    // ── Admin: Ability Evaluation Rules ──
    http.get('*/api/admin/ability-evaluation-rules', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: [
                { id: 1, abilityId: 1, abilityName: 'Human Actions Identification', partId: 1, partName: 'Part 1: Photographs', stableMin: 75.0, developingMax: 75.0, weakMax: 50.0, minEvidenceCount: 3 },
                { id: 2, abilityId: 2, abilityName: 'Object & Scene Recognition', partId: 1, partName: 'Part 1: Photographs', stableMin: 75.0, developingMax: 75.0, weakMax: 50.0, minEvidenceCount: 3 },
                { id: 3, abilityId: 3, abilityName: 'Wh-Questions Reflex', partId: 2, partName: 'Part 2: Question - Response', stableMin: 75.0, developingMax: 75.0, weakMax: 50.0, minEvidenceCount: 3 },
                { id: 4, abilityId: 4, abilityName: 'Yes/No & Choice Questions', partId: 2, partName: 'Part 2: Question - Response', stableMin: 75.0, developingMax: 75.0, weakMax: 50.0, minEvidenceCount: 3 },
                { id: 5, abilityId: 5, abilityName: 'Indirect & Evasive Responses', partId: 2, partName: 'Part 2: Question - Response', stableMin: 70.0, developingMax: 70.0, weakMax: 45.0, minEvidenceCount: 3 },
                { id: 6, abilityId: 6, abilityName: 'Specific Details & Keywords Tracking', partId: 3, partName: 'Part 3: Short Conversations', stableMin: 75.0, developingMax: 75.0, weakMax: 50.0, minEvidenceCount: 3 },
                { id: 7, abilityId: 7, abilityName: 'Purpose & Speaker Implication', partId: 3, partName: 'Part 3: Short Conversations', stableMin: 70.0, developingMax: 70.0, weakMax: 45.0, minEvidenceCount: 3 },
                { id: 8, abilityId: 8, abilityName: 'Public Announcements Comprehension', partId: 4, partName: 'Part 4: Short Talks', stableMin: 75.0, developingMax: 75.0, weakMax: 50.0, minEvidenceCount: 3 },
                { id: 9, abilityId: 9, abilityName: 'Voicemails & News Reports', partId: 4, partName: 'Part 4: Short Talks', stableMin: 75.0, developingMax: 75.0, weakMax: 50.0, minEvidenceCount: 3 },
                { id: 10, abilityId: 10, abilityName: 'Parts of Speech & Word Formation', partId: 5, partName: 'Part 5: Incomplete Sentences', stableMin: 80.0, developingMax: 80.0, weakMax: 55.0, minEvidenceCount: 3 },
                { id: 11, abilityId: 11, abilityName: 'Verb Tenses & Voice Consistency', partId: 5, partName: 'Part 5: Incomplete Sentences', stableMin: 80.0, developingMax: 80.0, weakMax: 55.0, minEvidenceCount: 3 },
                { id: 12, abilityId: 12, abilityName: 'Business Lexicon & Collocations', partId: 5, partName: 'Part 5: Incomplete Sentences', stableMin: 75.0, developingMax: 75.0, weakMax: 50.0, minEvidenceCount: 3 },
                { id: 13, abilityId: 13, abilityName: 'Contextual Sentence Insertion', partId: 6, partName: 'Part 6: Text Completion', stableMin: 70.0, developingMax: 70.0, weakMax: 45.0, minEvidenceCount: 3 },
                { id: 14, abilityId: 14, abilityName: 'Transitions & Discourse Markers', partId: 6, partName: 'Part 6: Text Completion', stableMin: 75.0, developingMax: 75.0, weakMax: 50.0, minEvidenceCount: 3 },
                { id: 15, abilityId: 15, abilityName: 'Business Emails & Memos Reading', partId: 7, partName: 'Part 7: Reading Comprehension', stableMin: 75.0, developingMax: 75.0, weakMax: 50.0, minEvidenceCount: 3 },
                { id: 16, abilityId: 16, abilityName: 'Cross-referencing Multi-passages', partId: 7, partName: 'Part 7: Reading Comprehension', stableMin: 70.0, developingMax: 70.0, weakMax: 45.0, minEvidenceCount: 3 },
            ],
        });
    }),
    http.post('*/api/admin/ability-evaluation-rules', () => {
        return HttpResponse.json({
            success: true,
            message: 'Created successfully',
            data: { id: 17, abilityId: 1, abilityName: 'New Rule', stableMin: 75.0, developingMax: 75.0, weakMax: 50.0, minEvidenceCount: 3 },
        });
    }),
    http.put('*/api/admin/ability-evaluation-rules/:id', () => {
        return HttpResponse.json({ success: true, message: 'Updated successfully', data: null });
    }),
    http.delete('*/api/admin/ability-evaluation-rules/:id', () => {
        return HttpResponse.json({ success: true, message: 'Deleted successfully' });
    }),

    // ── Admin: Target Part Thresholds ──
    http.get('*/api/admin/target-part-thresholds', () => {
        const parts = [
            { id: 1, name: 'Part 1: Photographs' },
            { id: 2, name: 'Part 2: Question - Response' },
            { id: 3, name: 'Part 3: Short Conversations' },
            { id: 4, name: 'Part 4: Short Talks' },
            { id: 5, name: 'Part 5: Incomplete Sentences' },
            { id: 6, name: 'Part 6: Text Completion' },
            { id: 7, name: 'Part 7: Reading Comprehension' },
        ];
        const profiles = [
            { id: 1, score: 450, name: 'AIM 450' },
            { id: 5, score: 550, name: 'AIM 550' },
            { id: 2, score: 650, name: 'AIM 650' },
            { id: 6, score: 750, name: 'AIM 750' },
            { id: 3, score: 800, name: 'AIM 800' },
            { id: 4, score: 990, name: 'AIM 990' },
        ];

        let id = 1;
        const data = [];
        for (const prof of profiles) {
            for (const part of parts) {
                let passScore = 55.0;
                let confirmingScore = 40.0;
                let fullPart = 25.0;

                if (prof.score === 450) {
                    passScore = 50.0 + (part.id <= 2 ? 5 : 0);
                    confirmingScore = 35.0;
                    fullPart = 20.0;
                } else if (prof.score === 550) {
                    passScore = 60.0 + (part.id <= 2 ? 5 : 0);
                    confirmingScore = 45.0;
                    fullPart = 25.0;
                } else if (prof.score === 650) {
                    passScore = 70.0 + (part.id <= 2 ? 5 : 0);
                    confirmingScore = 55.0;
                    fullPart = 30.0;
                } else if (prof.score === 750) {
                    passScore = 78.0 + (part.id <= 2 ? 4 : 0);
                    confirmingScore = 62.0;
                    fullPart = 38.0;
                } else if (prof.score === 800) {
                    passScore = 85.0 + (part.id <= 2 ? 3 : 0);
                    confirmingScore = 70.0;
                    fullPart = 45.0;
                } else {
                    passScore = 95.0 + (part.id <= 2 ? 3 : 0);
                    confirmingScore = 88.0;
                    fullPart = 65.0;
                }

                data.push({
                    id: id++,
                    targetProfileId: prof.id,
                    targetProfileScore: prof.score,
                    targetProfileName: prof.name,
                    partId: part.id,
                    partName: part.name,
                    passScore,
                    confirmingScore,
                    fullPartThreshold: fullPart,
                });
            }
        }

        return HttpResponse.json({
            success: true,
            message: 'OK',
            data,
        });
    }),
    http.post('*/api/admin/target-part-thresholds', () => {
        return HttpResponse.json({ success: true, message: 'Created successfully', data: null });
    }),
    http.put('*/api/admin/target-part-thresholds/:id', () => {
        return HttpResponse.json({ success: true, message: 'Updated successfully', data: null });
    }),
    http.delete('*/api/admin/target-part-thresholds/:id', () => {
        return HttpResponse.json({ success: true, message: 'Deleted successfully' });
    }),

    // Catch-all cho các API admin khác (tránh crash)
    http.get('*/api/admin/*', () => {
        return HttpResponse.json({ success: true, message: 'Mock', data: [], pagination: { totalItems: 0, totalPages: 0, pageSize: 10, page: 0 } });
    }),
    http.get('*/api/v1/admin/*', () => {
        return HttpResponse.json({ success: true, message: 'Mock', data: [], pagination: { totalItems: 0, totalPages: 0, pageSize: 10, page: 0 } });
    }),
];
