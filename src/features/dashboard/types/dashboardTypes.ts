// Các trạng thái vòng đời học tập của học viên trên màn hình Dashboard cá nhân
export type DashboardState =
    | 'NEED_TARGET'
    | 'NEED_DIAGNOSTIC'
    | 'SYNCING_ROADMAP'
    | 'IN_PROGRESS'
    | 'COMPLETED';

// Phân loại lỗi khi gọi API Dashboard để hiển thị màn hình xử lý tương ứng
export type DashboardErrorType = 'UNAUTHORIZED' | 'GENERIC';

// Phân loại kỹ năng Nghe hiểu / Đọc hiểu của Phần thi TOEIC
export type DashboardSectionType = 'LISTENING' | 'READING';

// Phân loại bài học trong mô-đun (bài giảng video lý thuyết hoặc bài tập luyện tập)
export type DashboardLessonType = 'VIDEO' | 'PRACTICE';

// Trạng thái mở khóa tuần tự của chặng mô-đun trên lộ trình cá nhân
export type DashboardModuleStatus = 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED';

// 4 nhánh đánh giá kết quả từng Part sau bài thi chẩn đoán đầu vào
export type PartDirectiveType = 'PASS' | 'CONFIRM' | 'ABILITY_DIAGNOSTIC' | 'FULL_PART';

// Phân loại sự kiện trong danh sách lịch sử hoạt động gần đây
export type DashboardActivityType = 'VIDEO' | 'PRACTICE' | 'MODULE_TEST' | 'DIAGNOSTIC' | 'MOCK_EXAM';

// Thông tin hồ sơ cơ bản và mốc điểm TOEIC mục tiêu hiện tại của học viên
export interface DashboardUserProfile {
    fullName: string;
    avatar: string | null;
    role: string;
    targetProfileId: number | null;
    targetScore: number | null;
    targetDescription: string | null;
}

// Tình trạng bài thi chẩn đoán đầu vào gần nhất và điểm dự đoán theo từng kỹ năng
export interface DashboardDiagnosticInfo {
    hasCompletedDiagnostic: boolean;
    hasInProgressDiagnostic: boolean;
    latestAttemptId: number | null;
    predictedScore: number | null;
    listeningScore: number | null;
    readingScore: number | null;
    completedAt: string | null;
}

// Bộ chỉ số thống kê KPI tổng hợp từ dữ liệu thật phía Backend
export interface DashboardStats {
    roadmapProgressPercent: number;
    completedModules: number;
    totalModules: number;
    completedLessons: number;
    totalLessons: number;
    streakDays: number;
    isStudiedToday: boolean;
    totalStudyMinutes: number;
    weeklyStudyMinutes: number;
    weeklyActiveDays: number;
    predictedScore: number | null;
    targetScore: number | null;
    isPassedAllParts: boolean;
    canTakeFullMockTest: boolean;
}

// Thông tin từng bài giảng hoặc bài luyện tập trong khối mô-đun đang học
export interface DashboardLessonItem {
    id: number;
    orderNo: number;
    title: string;
    type: DashboardLessonType;
    durationSeconds: number;
    questionCount: number;
    watchPercent: number;
    isCompleted: boolean;
    isNextRecommended: boolean;
}

// Thông tin mô-đun đang mở khóa hiện tại trên lộ trình cá nhân
export interface DashboardCurrentModule {
    moduleId: number | null;
    learningPathItemId: number;
    orderNo: number;
    title: string;
    description: string | null;
    partName: string | null;
    section: DashboardSectionType | null;
    abilityName: string | null;
    reason: string | null;
    progressPercent: number;
    requiredCompletionRate: number;
    completedLessons: number;
    totalLessons: number;
    isModuleTestUnlocked: boolean;
    isUnderMaintenance: boolean;
    maintenanceMessage: string | null;
    continueLessonId: number | null;
    continueLessonTitle: string | null;
    continueLessonType: DashboardLessonType | null;
    upcomingLessons: DashboardLessonItem[];
}

// Thông tin tóm tắt từng chặng mô-đun sắp tới hiển thị ở cột phải
export interface DashboardModuleItem {
    moduleId: number | null;
    learningPathItemId: number;
    orderNo: number;
    sequence: number;
    title: string;
    description: string | null;
    partName: string | null;
    section: DashboardSectionType | null;
    status: DashboardModuleStatus;
    statusLabel: string;
    progressPercent: number;
    isLocked: boolean;
    isUnderMaintenance: boolean;
}

// Kết quả đánh giá từng Phần thi TOEIC (Part 1 đến Part 7)
export interface DashboardPartEvaluation {
    partId: number;
    partNo: number;
    name: string;
    section: DashboardSectionType;
    scorePercent: number;
    directive: PartDirectiveType;
    directiveLabel: string;
}

// Dữ liệu từng ngày trong biểu đồ tiến độ học tập 7 ngày gần nhất
export interface DashboardWeeklyDay {
    date: string;
    dayLabel: string;
    studyMinutes: number;
    completedLessons: number;
    testsSubmitted: number;
    isToday: boolean;
}

// Một mục lịch sử hoạt động học tập hoặc thi cử gần đây
export interface DashboardRecentActivity {
    id: string;
    type: DashboardActivityType;
    title: string;
    subtitle: string;
    timeAgo: string;
    timestamp: string | null;
    targetUrl: string | null;
}

// Cấu trúc dữ liệu tổng hợp toàn màn hình Dashboard học tập cá nhân
export interface DashboardSummary {
    dashboardState: DashboardState;
    user: DashboardUserProfile;
    diagnostic: DashboardDiagnosticInfo;
    stats: DashboardStats;
    currentModule: DashboardCurrentModule | null;
    upcomingModules: DashboardModuleItem[];
    partEvaluations: DashboardPartEvaluation[];
    weeklyProgress: DashboardWeeklyDay[];
    recentActivities: DashboardRecentActivity[];
}
