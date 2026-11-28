/**
 * Định nghĩa kiểu dữ liệu cho tính năng Lộ trình học thích ứng và Chi tiết Module.
 * Đồng bộ 100% với DTO Response của Backend (RoadmapResponse & UserModuleDetailResponse).
 */

// Trạng thái tiến độ của từng mô-đun trên lộ trình tuần tự
export type ModuleStatus = 'COMPLETED' | 'IN_PROGRESS' | 'UNLOCKED' | 'LOCKED';

// Trạng thái tổng thể của một phiên bản lộ trình học
export type LearningPathStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';

// Kỹ năng chính của phần thi TOEIC (Nghe hiểu hoặc Đọc hiểu)
export type SectionType = 'LISTENING' | 'READING';

// Phân loại bài học trong một mô-đun (Bài giảng lý thuyết hoặc Bài tập thực hành)
export type LessonType = 'VIDEO' | 'PRACTICE';

// Phân loại trạng thái lỗi khi truy cập màn hình Chi tiết Module để hiển thị thông báo phù hợp
export type ModuleDetailErrorType = 'LOCKED' | 'NOT_FOUND' | 'GENERIC';

// Cấu trúc dữ liệu cho từng chặng mô-đun hiển thị trên trục thời gian lộ trình
export interface ModuleItem {
    // ID của mô-đun dùng để điều hướng sang trang chi tiết
    id: number;
    // ID bản ghi LearningPathItem trong cơ sở dữ liệu
    learningPathItemId?: number;
    // Thứ tự chặng trên lộ trình cá nhân (1, 2, 3...)
    orderNo: number;
    // Thứ tự sư phạm chuẩn hóa của mô-đun
    sequence: number;
    // Tên tiêu đề của mô-đun
    title: string;
    // Mô tả ngắn mục tiêu kiến thức của mô-đun
    description: string;
    // ID phần thi TOEIC liên kết
    partId?: number;
    // Tên phần thi TOEIC (VD: Part 1, Part 5...)
    partName: string;
    // Kỹ năng của phần thi (LISTENING hoặc READING)
    section: SectionType;
    // ID năng lực trọng tâm mà mô-đun bổ trợ (có thể null nếu học toàn phần)
    abilityId?: number | null;
    // Tên năng lực trọng tâm cần khắc phục
    abilityName?: string | null;
    // Lý do sư phạm giải thích vì sao mô-đun xuất hiện trong lộ trình
    reason?: string | null;
    // Tổng số bài học đã xuất bản trong mô-đun
    totalLessons: number;
    // Số bài học học viên đã hoàn thành
    completedLessons: number;
    // Tỷ lệ phần trăm hoàn thành bài học (0 - 100)
    progressPercent: number;
    // Trạng thái mở khóa hiện tại của mô-đun
    status: ModuleStatus;
    // Nhãn tiếng Việt tương ứng với trạng thái để hiển thị lên badge
    statusLabel: string;
}

// Cấu trúc dữ liệu tổng quan của Lộ trình học cá nhân
export interface RoadmapData {
    // ID lộ trình hiện hành của học viên
    learningPathId: number;
    // Số phiên bản lộ trình (tăng dần mỗi lần đổi mục tiêu)
    version: number;
    // Trạng thái lộ trình (ACTIVE, COMPLETED, ARCHIVED)
    status: LearningPathStatus;
    // ID hồ sơ mục tiêu điểm TOEIC hiện tại
    targetProfileId: number;
    // Điểm mục tiêu TOEIC (VD: 450, 550, 650, 750, 850)
    targetScore: number;
    // Mô tả ngắn về mốc mục tiêu
    targetDescription?: string | null;
    // ID lượt thi chẩn đoán đã sinh ra lộ trình này
    diagnosticAttemptId?: number | null;
    // Tiến độ hoàn thành tổng thể toàn lộ trình (%)
    progressPercent: number;
    // Tổng số mô-đun có trong lộ trình
    totalModules: number;
    // Số mô-đun đã vượt ải thành công
    completedModules: number;
    // Cờ xác nhận học viên đã đạt chuẩn toàn bộ 7 phần thi ngay ở bài chẩn đoán
    isPassedAllParts?: boolean;
    // Danh sách các chặng mô-đun được sắp xếp tuần tự
    modules: ModuleItem[];
}

// Cấu trúc dữ liệu từng bài giảng hoặc bài tập thực hành trong trang Chi tiết Module
export interface ModuleLessonItem {
    // ID bài học
    id: number;
    // Số thứ tự hiển thị của bài học trong mô-đun
    orderNo: number;
    // Tiêu đề bài học
    title: string;
    // Loại bài học (VIDEO hoặc PRACTICE)
    type: LessonType;
    // Thời lượng bài giảng tính bằng giây
    durationSeconds: number;
    // Chuỗi thời lượng dự phòng nếu có
    durationText?: string;
    // Số câu hỏi trắc nghiệm đi kèm (câu ôn tập cho bài giảng hoặc câu luyện tập cho bài thực hành)
    questionCount?: number;
    // Cờ đánh dấu bài học miễn phí
    isFree: boolean;
    // Cờ đánh dấu học viên đã hoàn thành bài học
    isCompleted: boolean;
    // Cờ đánh dấu bài học đang khóa
    isLocked: boolean;
    // Tên năng lực trọng tâm của bài học
    abilityName?: string | null;
}

// Thông tin cấu hình động và trạng thái vượt ải của bài kiểm tra cuối mô-đun
export interface ModuleTestInfo {
    // ID mô-đun gắn với bài kiểm tra
    id: number;
    // Tiêu đề bài kiểm tra vượt ải
    title: string;
    // Mô tả ngắn mục tiêu bài kiểm tra
    description: string;
    // Điểm đỗ yêu cầu theo mốc điểm mục tiêu hiện tại
    passScore: number;
    // Mốc điểm mục tiêu TOEIC hiện tại của học viên
    targetScore: number;
    // Cờ xác nhận bài kiểm tra đã mở khóa đủ điều kiện làm bài hay chưa
    isUnlocked: boolean;
    // Tổng số câu hỏi của bài kiểm tra
    totalQuestions: number;
    // Thời gian làm bài tính bằng phút
    durationMinutes: number;
    // Cờ xác nhận học viên đã từng vượt qua bài kiểm tra này hay chưa
    hasPassed: boolean;
    // Điểm số cao nhất học viên từng đạt (thang 100)
    bestScore?: number | null;
    // ID lượt thi gần nhất để điều hướng xem lại kết quả
    lastAttemptId?: number | null;
}

// Chế độ quyền truy cập mô-đun trả về từ Backend (trong lộ trình hay học tự do từ Thư viện)
export type ModuleAccessMode = 'ROADMAP_OPEN' | 'ROADMAP_LOCKED' | 'FREE_STUDY' | 'PREVIEW_ONLY';

// Cấu trúc dữ liệu trả về đầy đủ cho màn hình Chi tiết Module
export interface ModuleDetailData {
    // ID mô-đun
    moduleId: number;
    // Tiêu đề mô-đun
    title: string;
    // Tên phần thi TOEIC liên kết
    partName: string;
    // Kỹ năng nghe hoặc đọc
    section: SectionType;
    // Mô tả mục tiêu bài học của mô-đun
    description: string;
    // Tên năng lực trọng tâm của mô-đun
    abilityName?: string | null;
    // Trạng thái hiện tại của mô-đun trên lộ trình
    status: ModuleStatus;
    // Nhãn tiếng Việt tương ứng trạng thái
    statusLabel: string;
    // Cờ xác định mô-đun có thuộc lộ trình cá nhân hay đang mở ở chế độ Học tự do
    inRoadmap?: boolean;
    // Chế độ quyền truy cập của mô-đun
    accessMode?: ModuleAccessMode;
    // Tổng số bài học đã xuất bản trong mô-đun
    totalLessons: number;
    // Tổng số bài học học viên đã hoàn thành
    completedLessons: number;
    // Tổng số bài giảng video lý thuyết
    totalVideoLessons: number;
    // Số bài giảng video lý thuyết đã hoàn thành
    completedVideoLessons: number;
    // Phần trăm tiến độ hoàn thành mô-đun (0 - 100)
    progressPercent: number;
    // Tỷ lệ bài giảng tối thiểu (%) cần hoàn thành để mở bài kiểm tra vượt ải
    requiredCompletionRate: number;
    // Danh sách bài học đã xuất bản sắp xếp theo thứ tự
    lessons: ModuleLessonItem[];
    // Thông tin bài kiểm tra vượt ải cuối mô-đun (null khi mở ở chế độ Học tự do ngoài lộ trình)
    moduleTest: ModuleTestInfo | null;
}
