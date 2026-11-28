import type { LearningPathStatus, LessonType, ModuleStatus, SectionType } from '@/features/roadmap/types/roadmapTypes';

/**
 * Chế độ quyền truy cập của từng mô-đun trên màn hình Thư viện khóa học 7 Part.
 * Đồng bộ 100% với enum ECatalogAccessMode của Backend.
 */
export type CatalogAccessMode = 'ROADMAP_OPEN' | 'ROADMAP_LOCKED' | 'FREE_STUDY' | 'PREVIEW_ONLY';

/**
 * Giá trị bộ lọc kỹ năng đồng bộ trên thanh URL (?section=...).
 */
export type CatalogSectionFilter = 'ALL' | SectionType;

/**
 * Giá trị bộ lọc phạm vi học đồng bộ trên thanh URL (?scope=...).
 */
export type CatalogScopeFilter = 'ALL' | 'ROADMAP' | 'FREE_STUDY';

/**
 * Thông tin đề cương xem trước của một bài học trong mô-đun.
 * Chỉ chứa siêu dữ liệu cơ bản (thứ tự, tiêu đề, loại bài, thời lượng, nhãn miễn phí).
 */
export interface CatalogLessonPreview {
    /** Mã định danh bài học. */
    id: number;
    /** Thứ tự hiển thị của bài học trong mô-đun. */
    orderNo: number;
    /** Tiêu đề bài học. */
    title: string;
    /** Loại bài học: bài giảng lý thuyết hoặc bài tập thực hành. */
    type: LessonType;
    /** Thời lượng bài giảng tính bằng giây (0 nếu chưa cập nhật hoặc là bài thực hành). */
    durationSeconds: number;
    /** Cờ xác định bài học đang mở miễn phí. */
    isFree: boolean;
}

/**
 * Thông tin chi tiết của một mô-đun hiển thị trong Thư viện khóa học 7 Part.
 */
export interface CatalogModuleItem {
    /** Mã định danh mô-đun. */
    id: number;
    /** Thứ tự sư phạm chuẩn hóa của mô-đun. */
    sequence: number;
    /** Tên tiêu đề mô-đun. */
    title: string;
    /** Mô tả mục tiêu kiến thức của mô-đun. */
    description: string;
    /** Mã phần thi TOEIC mà mô-đun thuộc về. */
    partId: number | null;
    /** Tên phần thi TOEIC (Part 1 - Part 7). */
    partName: string;
    /** Nhóm kỹ năng: Nghe hiểu hoặc Đọc hiểu. */
    section: SectionType;
    /** Danh sách tên các nhóm năng lực mà mô-đun rèn luyện. */
    abilities: string[];
    /** Cờ xác định mô-đun có nằm trong lộ trình cá nhân của học viên hay không. */
    inRoadmap: boolean;
    /** Số thứ tự chặng trên lộ trình cá nhân (null nếu ngoài lộ trình). */
    roadmapOrderNo: number | null;
    /** Lý do sư phạm vì sao mô-đun xuất hiện trong lộ trình (nếu có). */
    roadmapReason: string | null;
    /** Chế độ quyền truy cập hiện tại của mô-đun đối với học viên. */
    accessMode: CatalogAccessMode;
    /** Nhãn phân loại tiếng Việt hiển thị trên thẻ (Trọng tâm cần học / Đã nắm vững • Học tự do...). */
    categoryLabel: string;
    /** Trạng thái chi tiết của mô-đun (null nếu học viên chưa có lộ trình). */
    status: ModuleStatus | null;
    /** Nhãn trạng thái tiếng Việt hiển thị lên huy hiệu. */
    statusLabel: string;
    /** Cờ xác định học viên có quyền vào học mô-đun này ngay hay không. */
    canAccess: boolean;
    /** Lý do hiển thị khi mô-đun đang bị khóa quyền truy cập. */
    lockReason: string | null;
    /** Tỷ lệ phần trăm tiến độ hoàn thành (0 - 100). */
    progressPercent: number;
    /** Tổng số bài học đã xuất bản trong mô-đun. */
    totalLessons: number;
    /** Số bài học học viên đã hoàn thành thực tế. */
    completedLessons: number;
    /** Số lượng bài giảng lý thuyết trong mô-đun. */
    videoLessonCount: number;
    /** Số lượng bài tập thực hành trong mô-đun. */
    practiceLessonCount: number;
    /** Tổng thời lượng các bài giảng lý thuyết tính bằng giây. */
    totalDurationSeconds: number;
    /** Danh sách đề cương các bài học để xem trước. */
    lessonPreviews: CatalogLessonPreview[];
}

/**
 * Thông tin nhóm mô-đun theo từng Phần thi TOEIC (Part 1 đến Part 7).
 */
export interface CatalogPartGroup {
    /** Mã định danh phần thi TOEIC. */
    partId: number;
    /** Tên phần thi TOEIC. */
    partName: string;
    /** Mô tả ngắn gọn về phần thi TOEIC. */
    partDescription: string;
    /** Kỹ năng chính: Nghe hiểu hoặc Đọc hiểu. */
    section: SectionType;
    /** Tổng số mô-đun đã xuất bản thuộc phần thi này. */
    totalModules: number;
    /** Số mô-đun nằm trong lộ trình trọng tâm của học viên. */
    roadmapModulesCount: number;
    /** Số mô-đun thuộc lộ trình đã hoàn thành. */
    completedModulesCount: number;
    /** Số mô-đun mở ở chế độ Học tự do. */
    freeStudyModulesCount: number;
    /** Danh sách các mô-đun thuộc phần thi sắp xếp theo trình tự sư phạm. */
    modules: CatalogModuleItem[];
}

/**
 * Dữ liệu tổng hợp toàn bộ Thư viện khóa học 7 Part trả về từ GET /api/users/catalog.
 */
export interface CourseCatalogData {
    /** Cờ xác định học viên đã hoàn thành đánh giá đầu vào và có lộ trình hay chưa. */
    hasLearningPath: boolean;
    /** Trạng thái lộ trình hiện hành của học viên (null nếu chưa có lộ trình). */
    learningPathStatus: LearningPathStatus | null;
    /** Mốc điểm TOEIC mục tiêu hiện tại của học viên (null nếu chưa thiết lập). */
    targetScore: number | null;
    /** Mô tả mốc điểm mục tiêu của học viên. */
    targetDescription: string | null;
    /** Tổng số phần thi TOEIC trong thư viện (7 Part). */
    totalParts: number;
    /** Tổng số mô-đun đã xuất bản trên toàn hệ thống. */
    totalModules: number;
    /** Tổng số bài học đã xuất bản trên toàn hệ thống. */
    totalLessons: number;
    /** Tổng số mô-đun trọng tâm nằm trong lộ trình cá nhân. */
    roadmapModuleCount: number;
    /** Số mô-đun trọng tâm học viên đã hoàn thành vượt ải. */
    completedRoadmapModuleCount: number;
    /** Số mô-đun nằm ngoài lộ trình được mở ở chế độ Học tự do. */
    freeStudyModuleCount: number;
    /** Danh sách 7 phần thi kèm các mô-đun trực thuộc. */
    parts: CatalogPartGroup[];
}
