import type { TargetProfile } from '@/features/target/types/targetTypes';
import type { DiagnosticTest, DiagnosticResult, DiagnosticQuestion } from '@/features/diagnostic/types/diagnosticTypes';
import type { DashboardSummary } from '@/features/dashboard/types/dashboardTypes';
import type { RoadmapData, ModuleDetailData } from '@/features/roadmap/types/roadmapTypes';
import type { LessonDetail } from '@/features/lesson/types/lessonTypes';
import type { ModuleTestData, ModuleTestResult, ModuleTestOption, ModuleTestPerformanceReport } from '@/features/module-test/types/moduleTestTypes';
import type { ProfileData } from '@/features/profile/types/profileTypes';

// ── 1. Target Profiles ─────────────────────────────────────────
export const mockTargetProfiles: TargetProfile[] = [
    {
        id: 1,
        targetTotalScore: 450,
        level: 'CƠ BẢN',
        description: 'Đạt chuẩn tốt nghiệp Đại học hoặc phục vụ công việc căn bản.',
        status: true,
    },
    {
        id: 2,
        targetTotalScore: 550,
        level: 'TRUNG CẤP',
        description: 'Đủ điều kiện làm việc trong môi trường đa quốc gia.',
        status: true,
    },
    {
        id: 3,
        targetTotalScore: 650,
        level: 'NÂNG CAO',
        description: 'Mục tiêu vàng cho quản lý và nhân sự công nghệ.',
        status: true,
        isRecommended: true,
    },
    {
        id: 4,
        targetTotalScore: 750,
        level: 'CHUYÊN SÂU',
        description: 'Thành thạo giao tiếp thuyết trình chuyên sâu.',
        status: true,
    },
    {
        id: 5,
        targetTotalScore: 850,
        level: 'THÀNH THẠO',
        description: 'Làm chủ hoàn toàn kỹ năng nghe đọc học thuật.',
        status: true,
    },
];

// ── 2. Diagnostic Questions & Results ──────────────────────────
const generateMockQuestions = (): DiagnosticQuestion[] => {
    const list: DiagnosticQuestion[] = [];
    const total = 100;

    for (let i = 1; i <= total; i++) {
        let partNo = 1;
        let partName = 'Photographs';
        let section: 'LISTENING' | 'READING' = 'LISTENING';
        let audioUrl: string | undefined = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        let imageUrl: string | undefined = undefined;
        let passage: string | undefined = undefined;

        if (i <= 6) {
            partNo = 1;
            partName = 'Photographs';
            imageUrl = 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1000&auto=format&fit=crop&q=80';
        } else if (i <= 31) {
            partNo = 2;
            partName = 'Question-Response';
        } else if (i <= 70) {
            partNo = 3;
            partName = 'Conversations';
            passage = 'Conversation between a project manager and a client discussing deadline and deliverables.';
        } else if (i <= 100) {
            partNo = 4;
            partName = 'Short Talks';
            passage = 'A public announcement at the central train station regarding weather delays.';
        }

        if (i === 15) {
            list.push({
                questionId: 15,
                orderNo: 15,
                partId: 1,
                partNo: 1,
                partName: 'Photographs',
                section: 'LISTENING',
                title: 'Câu hỏi 15: Look at the picture and select the best statement that describes what you see.',
                audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1000&auto=format&fit=crop&q=80',
                options: [
                    { key: 'A', text: 'The team is having a presentation in the hall.' },
                    { key: 'B', text: 'Some documents are being printed by the assistant.' },
                    { key: 'C', text: 'They are discussing some plans around a monitor.' },
                    { key: 'D', text: 'Most desks are empty at the moment.' },
                ],
            });
            continue;
        }

        list.push({
            questionId: i,
            orderNo: i,
            partId: partNo,
            partNo: partNo,
            partName: partName,
            section: section,
            title: `Câu hỏi ${i}: ${partNo <= 4 ? 'Listen and select the most appropriate response or description.' : 'Choose the best word or phrase to complete the statement.'}`,
            audioUrl: audioUrl,
            imageUrl: imageUrl,
            passage: passage,
            options: [
                { key: 'A', text: `Option A statement for question ${i}` },
                { key: 'B', text: `Option B statement for question ${i}` },
                { key: 'C', text: `Option C statement for question ${i}` },
                { key: 'D', text: `Option D statement for question ${i}` },
            ],
        });
    }

    return list;
};

export const mockDiagnosticTest: DiagnosticTest = {
    testId: 1,
    attemptId: 501,
    title: 'Bài đánh giá tổng hợp — Tier 1',
    description: 'Bài kiểm tra chẩn đoán toàn diện giúp xác định chính xác năng lực TOEIC ban đầu.',
    durationMinutes: 45,
    totalQuestions: 100,
    questions: generateMockQuestions(),
};

export const mockDiagnosticResult: DiagnosticResult = {
    attemptId: 501,
    testTitle: 'Bài đánh giá tổng hợp — Chẩn đoán toàn diện',
    completedAt: '2026-09-07T16:15:00Z',
    predictedScore: 550,
    targetScore: 650,
    totalQuestions: 100,
    correctAnswers: 58,
    sectionScores: {
        listening: 305,
        reading: 245,
        listeningPercent: 45,
        readingPercent: 61,
    },
    partResults: [
        {
            partNo: 1,
            name: 'Part 1: Photographs',
            score: 90,
            maxScore: 100,
            directive: 'PASS',
            directiveLabel: 'PASS',
            aiFeedback: 'Kỹ năng nghe miêu tả tranh xuất sắc, tiếp tục duy trì phát huy.',
        },
        {
            partNo: 2,
            name: 'Part 2: Question-Response',
            score: 75,
            maxScore: 100,
            directive: 'PASS',
            directiveLabel: 'PASS',
            aiFeedback: 'Khá ổn, cần lưu ý thêm một số bẫy thông tin đồng âm.',
        },
        {
            partNo: 3,
            name: 'Part 3: Conversations',
            score: 55,
            maxScore: 100,
            directive: 'CONFIRM',
            directiveLabel: 'CONFIRM',
            aiFeedback: 'Khả năng bắt keyword còn chậm. Cần cải thiện chiến thuật đọc đề trước.',
        },
        {
            partNo: 4,
            name: 'Part 4: Short Talks',
            score: 35,
            maxScore: 100,
            directive: 'WEAK',
            directiveLabel: 'WEAK',
            aiFeedback: 'Từ vựng độc thoại còn mỏng. Hệ thống sẽ tối ưu hóa lộ trình nghe cho bạn.',
        },
        {
            partNo: 5,
            name: 'Part 5: Incomplete Sentences',
            score: 80,
            maxScore: 100,
            directive: 'PASS',
            directiveLabel: 'PASS',
            aiFeedback: 'Ngữ pháp nền tảng tốt. Tập trung tối ưu thời gian làm bài dưới 15 giây/câu.',
        },
        {
            partNo: 6,
            name: 'Part 6: Text Completion',
            score: 62,
            maxScore: 100,
            directive: 'CONFIRM',
            directiveLabel: 'CONFIRM',
            aiFeedback: 'Cần cải thiện kỹ năng đọc hiểu văn cảnh và liên kết từ loại.',
        },
        {
            partNo: 7,
            name: 'Part 7: Reading Comprehension',
            score: 40,
            maxScore: 100,
            directive: 'FULL_PART',
            directiveLabel: 'FULL PART',
            aiFeedback: 'Yếu nhất phần đọc hiểu dài. Cần tăng tốc độ đọc quét (scanning) & từ vựng.',
        },
    ],
    abilitiesRadar: [
        { code: 'P1_P2_BASIC', name: 'Nghe miêu tả tranh & hỏi đáp', score: 85, status: 'STABLE' },
        { code: 'P3_P4_DETAIL', name: 'Nghe thông tin chi tiết', score: 42, status: 'WEAK' },
        { code: 'P5_GRAMMAR', name: 'Ngữ pháp & Cấu trúc', score: 80, status: 'STABLE' },
        { code: 'P5_P6_VOCAB', name: 'Từ vựng ngữ cảnh', score: 58, status: 'DEVELOPING' },
        { code: 'P7_SCANNING', name: 'Đọc quét & Bắt ý chính', score: 38, status: 'WEAK' },
        { code: 'P7_INFERENCE', name: 'Đọc hiểu suy luận logic', score: 45, status: 'WEAK' },
    ],
    aiRoadmapSummary: {
        radarInsight: 'Phân tích AI cho thấy khối lượng kỹ năng nghe hiểu nhóm (Part 3-4) đang là rào cản chính hạn chế điểm mục tiêu của bạn.',
        roadmapDays: 48,
        focusParts: [4, 7],
        recommendedAction: 'Bắt đầu lộ trình học thích ứng',
        secondaryAction: 'Làm bài đánh giá chuyên sâu Part 7',
    },
};

// ── 3. Dashboard Summary ───────────────────────────────────────
export const mockDashboardSummary: DashboardSummary = {
    greeting: 'Chào Nam, ngày học mới hiệu quả!',
    user: {
        fullName: 'Nguyễn Nam',
        targetScore: 650,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'Học viên Premium',
    },
    stats: {
        predictedScore: 590,
        scoreDiff: 40,
        streakDays: 8,
        weeklyHours: 4.5,
        completedModules: 12,
        totalModules: 16,
    },
    partEvaluations: [
        { partNo: 1, name: 'Part 1: Mô tả tranh', section: 'LISTENING', scorePercent: 90, status: 'PASS' },
        { partNo: 2, name: 'Part 2: Hỏi & Đáp', section: 'LISTENING', scorePercent: 75, status: 'PASS' },
        { partNo: 3, name: 'Part 3: Đoạn hội thoại', section: 'LISTENING', scorePercent: 55, status: 'CONFIRM' },
        { partNo: 4, name: 'Part 4: Bài nói ngắn', section: 'LISTENING', scorePercent: 35, status: 'WEAK' },
        { partNo: 5, name: 'Part 5: Hoàn thành câu', section: 'READING', scorePercent: 80, status: 'PASS' },
        { partNo: 6, name: 'Part 6: Hoàn thành đoạn văn', section: 'READING', scorePercent: 62, status: 'CONFIRM' },
        { partNo: 7, name: 'Part 7: Đọc hiểu văn bản', section: 'READING', scorePercent: 40, status: 'WEAK' },
    ],
    recentActivities: [
        {
            id: 1,
            title: 'Hoàn thành Luyện tập nhanh Part 5',
            subtitle: 'Hôm nay, 10:15 • 18/20 câu chính xác • Điểm thích ứng +12',
            type: 'PRACTICE',
        },
        {
            id: 2,
            title: "Xem Video bài giảng: 'Bẫy bối cảnh thì hiện tại hoàn thành'",
            subtitle: 'Hôm qua, 15:30 • 15 phút theo dõi',
            type: 'VIDEO',
        },
        {
            id: 3,
            title: 'Làm bài thi thử Diagnostic Test đầu vào',
            subtitle: '04 Tháng 10 • Kết quả dự đoán ban đầu: 550',
            type: 'TEST',
        },
    ],
    nextModules: [
        {
            id: 1,
            moduleId: 2,
            sequence: 5,
            title: 'Mục 5: Kỹ thuật bắt key nhanh Part 4',
            description: 'Giúp bứt phá kỹ năng nghe hiểu đoạn độc thoại ngắn.',
            section: 'Listening',
            status: 'IN_PROGRESS',
            statusLabel: 'HỌC TIẾP',
        },
        {
            id: 2,
            moduleId: 3,
            sequence: 6,
            title: 'Mục 6: Phân tích liên kết đoạn văn Part 7',
            description: 'Tập trung giải quyết bài tập đọc hiểu email phức hợp.',
            section: 'Reading',
            status: 'UNLOCKED',
            statusLabel: 'CHƯA MỞ',
        },
        {
            id: 3,
            moduleId: 4,
            sequence: 7,
            title: 'Mục 7: Chiến thuật tóm ý nhanh văn bản',
            description: 'Khóa cho đến khi hoàn thành mục 6.',
            section: 'Reading',
            status: 'LOCKED',
            statusLabel: 'ĐANG KHÓA',
        },
    ],
};

// ── 4. Roadmap Data ────────────────────────────────────────────
export const mockRoadmapData: RoadmapData = {
    learningPathId: 1,
    version: 1,
    targetScore: 650,
    progressPercent: 40,
    modules: [
        {
            id: 1,
            orderNo: 1,
            title: 'Module 1: Ngữ pháp cốt lõi Part 5',
            description: 'Các thì cơ bản và bẫy động từ',
            section: 'READING',
            totalLessons: 6,
            completedLessons: 6,
            progressPercent: 100,
            status: 'COMPLETED',
            statusLabel: 'HOÀN THÀNH',
        },
        {
            id: 2,
            orderNo: 2,
            title: 'Module 2: Kỹ năng bắt key nhanh Part 4',
            description: 'Phân bổ bối cảnh độc thoại ngắn',
            section: 'LISTENING',
            totalLessons: 6,
            completedLessons: 3,
            progressPercent: 50,
            status: 'IN_PROGRESS',
            statusLabel: 'SẴN SÀNG',
        },
        {
            id: 3,
            orderNo: 3,
            title: 'Module 3: Đọc hiểu email phức hợp Part 7',
            description: 'Tập trung liên kết nội dung đa đoạn',
            section: 'READING',
            totalLessons: 8,
            completedLessons: 0,
            progressPercent: 0,
            status: 'LOCKED',
            statusLabel: 'ĐANG KHÓA',
        },
        {
            id: 4,
            orderNo: 4,
            title: 'Module 4: Giải đề thực tế TOEIC RC',
            description: 'Chuyên sâu nâng cao chiến thuật bứt tốc',
            section: 'READING',
            totalLessons: 10,
            completedLessons: 0,
            progressPercent: 0,
            status: 'LOCKED',
            statusLabel: 'ĐANG KHÓA',
        },
    ],
};

// ── 5. Module Detail Data ──────────────────────────────────────
export const mockModuleDetail: ModuleDetailData = {
    moduleId: 2,
    title: 'Module 2: Part 5 — Incomplete Sentences — Vocabulary',
    partName: 'Part 5',
    description: 'Khắc phục điểm yếu ngữ pháp bối cảnh và từ loại.',
    status: 'IN_PROGRESS',
    statusLabel: 'SẴN SÀNG',
    totalLessons: 6,
    completedLessons: 3,
    progressPercent: 50,
    lessons: [
        {
            id: 1,
            orderNo: 1,
            title: 'Khái niệm nền tảng Incomplete Sentences',
            type: 'VIDEO',
            durationText: '12:45',
            isCompleted: true,
            isLocked: false,
        },
        {
            id: 2,
            orderNo: 2,
            title: 'Luyện tập ngữ pháp & từ vựng bối cảnh',
            type: 'PRACTICE',
            durationText: '15 câu hỏi',
            isCompleted: true,
            isLocked: false,
        },
        {
            id: 3,
            orderNo: 3,
            title: 'Bẫy từ loại liên quan đến cụm danh từ',
            type: 'VIDEO',
            durationText: '18:20',
            isCompleted: false,
            isLocked: false,
        },
        {
            id: 4,
            orderNo: 4,
            title: 'Chiến thuật loại trừ phương án sai nhanh',
            type: 'VIDEO',
            durationText: '15:10',
            isCompleted: false,
            isLocked: true,
        },
        {
            id: 5,
            orderNo: 5,
            title: 'Luyện tập tổng hợp bẫy Part 5',
            type: 'PRACTICE',
            durationText: '20 câu hỏi',
            isCompleted: false,
            isLocked: true,
        },
    ],
    moduleTest: {
        id: 201,
        title: 'Bài kiểm tra tổng hợp Module 2',
        description: 'Kiểm tra đánh giá khả năng hấp thụ kiến thức trước khi mở khóa Module kế tiếp.',
        passScore: 65,
        targetScore: 650,
        isUnlocked: true,
        totalQuestions: 25,
        durationMinutes: 20,
    },
};

// ── 6. Lesson Detail Data ──────────────────────────────────────
export const mockLessonDetail: LessonDetail = {
    id: 3,
    moduleId: 2,
    moduleTitle: 'Module 2: Part 5 — Incomplete Sentences — Vocabulary',
    title: 'Bài 3: Bẫy từ loại liên quan đến cụm danh từ',
    type: 'VIDEO',
    durationSeconds: 1100,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Video bài giảng chuyên sâu phân tích cấu trúc cụm danh từ: Mạo từ / Tính từ sở hữu + Trạng từ + Tính từ + Danh từ chính. Nhận diện ngay phương án sai trong 5 giây.',
    instructions: 'Hãy lắng nghe giảng viên hướng dẫn mẹo nhận biết đuôi từ loại (-tion, -ment, -able, -ive, -ly) và ghi chú vào sổ tay.',
    nextLessonId: 4,
    prevLessonId: 2,
    practiceQuestions: [
        {
            id: 1,
            orderNo: 1,
            title: 'The newly appointed director presented an ______ report on quarterly revenue.',
            options: [
                { key: 'A', text: 'impress' },
                { key: 'B', text: 'impressive' },
                { key: 'C', text: 'impressively' },
                { key: 'D', text: 'impression' },
            ],
            correctAnswer: 'B',
            explanation: 'Đứng trước danh từ "report" và sau mạo từ "an", ta cần một Tính từ để bổ nghĩa. "impressive" (adj) là đáp án đúng.',
        },
        {
            id: 2,
            orderNo: 2,
            title: 'Employees must submit their travel expenses ______ by Friday afternoon.',
            options: [
                { key: 'A', text: 'prompt' },
                { key: 'B', text: 'promptly' },
                { key: 'C', text: 'promptness' },
                { key: 'D', text: 'prompted' },
            ],
            correctAnswer: 'B',
            explanation: 'Vị trí này bổ nghĩa cho động từ "submit", cần một Trạng từ (Adv). "promptly" (kịp thời, ngay ngắn) là phương án chính xác.',
        },
    ],
};

// ── 7. Module Test Data & Results ──────────────────────────────
export const mockModuleTestData: ModuleTestData = {
    testId: 201,
    moduleId: 2,
    moduleTitle: 'Kiểm tra Module: Part 5 — Vocabulary',
    topic: 'Chủ đề: Từ loại & Cấu trúc câu cơ bản',
    currentAIM: 650,
    passScore: 65,
    durationMinutes: 20,
    totalQuestions: 25,
    questions: [
        {
            questionId: 1,
            orderNo: 1,
            partNo: 5,
            title: 'The accounting team needs to verify all financial statements ______ before filing.',
            options: [
                { key: 'A', text: 'careful' },
                { key: 'B', text: 'carefully' },
                { key: 'C', text: 'caring' },
                { key: 'D', text: 'carefulness' },
            ],
        },
        {
            questionId: 8,
            orderNo: 8,
            partNo: 5,
            title: 'Question 8: The supervisor requested a ______ analysis of the marketing budget before submitting the proposal to the board of directors.',
            options: [
                { key: 'A', text: 'The supervisor requested a comprehensive analysis of the marketing budget.' },
                { key: 'B', text: 'The supervisor requested a comprehend analysis of the marketing budget.' },
                { key: 'C', text: 'The supervisor requested a comprehensively analysis of the marketing budget.' },
                { key: 'D', text: 'The supervisor requested a comprehensiveness analysis of the marketing budget.' },
            ],
        },
        ...Array.from({ length: 23 }, (_, idx) => {
            const num = idx >= 7 ? idx + 2 : idx + 2;
            if (num === 8) return null;
            return {
                questionId: num,
                orderNo: num,
                partNo: 5,
                title: `Question ${num}: Please select the most appropriate option to complete the statement regarding business operations.`,
                options: [
                    { key: 'A', text: `Appropriate noun/verb phrase for sentence ${num}` },
                    { key: 'B', text: `Incorrect form option for sentence ${num}` },
                    { key: 'C', text: `Secondary adjective phrase for sentence ${num}` },
                    { key: 'D', text: `Alternative adverb modifier for sentence ${num}` },
                ] as ModuleTestOption[],
            };
        }).filter((item): item is NonNullable<typeof item> => item !== null),
    ],
};

export const mockModuleTestResult: ModuleTestResult = {
    attemptId: 901,
    moduleId: 2,
    moduleTitle: 'Kiểm tra Module: Part 5 — Vocabulary',
    score: 85,
    passScore: 65,
    isPassed: true,
    correctCount: 21,
    totalQuestions: 25,
    completedAt: '2026-09-07T16:45:00Z',
    nextModuleId: 3,
    detailedAnswers: [
        {
            questionId: 8,
            orderNo: 8,
            questionTitle: 'Question 8: The supervisor requested a ______ analysis of the marketing budget before submitting the proposal to the board of directors.',
            selectedOption: 'A',
            correctOption: 'A',
            isCorrect: true,
            explanation: 'Trước danh từ "analysis" cần một tính từ bổ nghĩa. "comprehensive" (toàn diện, sâu rộng) là tính từ chính xác. Các phương án khác: comprehend (v), comprehensively (adv), comprehensiveness (n).',
            options: [
                { key: 'A', text: 'The supervisor requested a comprehensive analysis of the marketing budget.' },
                { key: 'B', text: 'The supervisor requested a comprehend analysis of the marketing budget.' },
                { key: 'C', text: 'The supervisor requested a comprehensively analysis of the marketing budget.' },
                { key: 'D', text: 'The supervisor requested a comprehensiveness analysis of the marketing budget.' },
            ],
        },
        {
            questionId: 1,
            orderNo: 1,
            questionTitle: 'The accounting team needs to verify all financial statements ______ before filing.',
            selectedOption: 'B',
            correctOption: 'B',
            isCorrect: true,
            explanation: 'Cần trạng từ "carefully" để bổ nghĩa cho động từ "verify".',
            options: [
                { key: 'A', text: 'careful' },
                { key: 'B', text: 'carefully' },
                { key: 'C', text: 'caring' },
                { key: 'D', text: 'carefulness' },
            ],
        },
    ],
};


// ── 7.1 Module Test Performance Report (Báo cáo kết quả kiểm tra học tập) ──
export const mockModulePerformanceReport: ModuleTestPerformanceReport = {
    attemptId: 901,
    moduleId: 2,
    moduleTitle: 'Part 5 — Vocabulary',
    completedAt: '14:32 - 12/10/2024',
    score: 78,
    maxScore: 100,
    passScore: 65,
    isPassed: true,
    diffFromPass: 13,
    aiFeedback: {
        title: 'Chúc mừng! Bạn đã hoàn thành xuất sắc và mở khóa Module tiếp theo.',
        content: 'AI nhận diện bạn đã khắc phục tốt mảng từ loại (Part 5), tuy nhiên nên chú ý ôn thêm về trạng từ chỉ mức độ ở Module 2.',
    },
    metrics: {
        accuracyRate: 78,
        correctAnswers: 19,
        totalQuestions: 25,
        durationFormatted: '09:15',
        speedComparison: 'Nhanh hơn 35% học viên khác',
        competencyStatus: 'ĐẠT CHUẨN',
        gapResolvedPercent: 80,
    },
    history: [
        {
            attemptNumber: 2,
            isLatest: true,
            completedAt: '12/10/2024',
            score: 78,
            maxScore: 100,
            isPassed: true,
            durationFormatted: '09:15',
        },
        {
            attemptNumber: 1,
            isLatest: false,
            completedAt: '10/10/2024',
            score: 52,
            maxScore: 100,
            isPassed: false,
            durationFormatted: '14:20',
        },
    ],
    nextModuleId: 3,
};

// ── 8. Profile Data ────────────────────────────────────────────
export const mockProfileData: ProfileData = {
    user: {
        id: 1,
        username: 'student_nam',
        email: 'nam.nguyen@leby.edu.vn',
        fullName: 'Nguyễn Nam',
        dob: '2001-08-15',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        learnerType: 'Học thích ứng cấp tốc',
        role: 'Học viên Premium',
        createdAt: '2026-08-01',
    },
    target: {
        planId: 101,
        targetTotalScore: 650,
        level: 'NÂNG CAO',
        createdAt: '2026-08-01',
    },
    skills: [
        { code: 'P1_P2_BASIC', name: 'Nghe miêu tả tranh & hỏi đáp', partNo: 1, accuracyRate: 0.85, evidenceCount: 45, status: 'STABLE' },
        { code: 'P3_P4_DETAIL', name: 'Nghe thông tin chi tiết', partNo: 3, accuracyRate: 0.42, evidenceCount: 60, status: 'WEAK' },
        { code: 'P5_GRAMMAR', name: 'Ngữ pháp & Cấu trúc câu', partNo: 5, accuracyRate: 0.80, evidenceCount: 75, status: 'STABLE' },
        { code: 'P5_P6_VOCAB', name: 'Từ vựng bối cảnh & Từ loại', partNo: 6, accuracyRate: 0.58, evidenceCount: 55, status: 'DEVELOPING' },
        { code: 'P7_SCANNING', name: 'Đọc quét & Bắt ý chính', partNo: 7, accuracyRate: 0.38, evidenceCount: 50, status: 'WEAK' },
        { code: 'P7_INFERENCE', name: 'Đọc hiểu suy luận logic', partNo: 7, accuracyRate: 0.45, evidenceCount: 40, status: 'WEAK' },
    ],
    learningSummary: {
        totalHours: 24.5,
        streakDays: 8,
        completedModules: 12,
        totalModules: 16,
    },
};
