/**
 * Phân loại bài học nhận từ Backend: bài giảng lý thuyết (VIDEO) hoặc bài thực hành (PRACTICE).
 */
export type LessonContentType = 'VIDEO' | 'PRACTICE';

/**
 * Phần kỹ năng TOEIC tương ứng với bài học (Nghe hiểu hoặc Đọc hiểu).
 */
export type LessonSectionType = 'LISTENING' | 'READING';

/**
 * Phân loại mã lỗi khi tải phòng học để giao diện hiển thị đúng màn hình phản hồi.
 */
export type LessonRoomErrorType = 'LOCKED' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'GENERIC';

/**
 * Một mục bài học tóm tắt hiển thị trong danh sách điều hướng của mô-đun.
 */
export interface LessonNavItem {
    /** Mã định danh bài học. */
    id: number;
    /** Thứ tự bài học trong mô-đun. */
    orderNo: number;
    /** Tiêu đề bài học. */
    title: string;
    /** Loại nội dung bài học. */
    lessonType: LessonContentType;
    /** Thời lượng bài học tính theo giây. */
    durationSeconds: number;
    /** Cờ xác định học viên đã hoàn thành bài học hay chưa. */
    isCompleted: boolean;
    /** Tỷ lệ phần trăm thời lượng đã xem thực tế (0 - 100). */
    watchPercent: number;
}

/**
 * Một phương án lựa chọn A/B/C/D trong câu hỏi ôn tập củng cố.
 */
export interface ReviewOptionItem {
    /** Ký hiệu đáp án (A, B, C, D). */
    key: string;
    /** Nội dung chữ của phương án lựa chọn. */
    text: string;
}

/**
 * Một mục từ vựng then chốt đi kèm phần giải thích đáp án.
 */
export interface ReviewVocabularyItem {
    /** Từ hoặc cụm từ tiếng Anh. */
    word: string;
    /** Từ loại (n, v, adj...). */
    type: string;
    /** Nghĩa tiếng Việt của từ vựng. */
    meaning: string;
}

/**
 * Thông tin giải thích chi tiết đáp án cho từng câu hỏi ôn tập.
 */
export interface ReviewExplanationItem {
    /** Nội dung lời thoại nghe hiểu (nếu là câu hỏi Nghe). */
    transcript?: string | null;
    /** Bản dịch tiếng Việt của câu hỏi hoặc ngữ cảnh. */
    translation?: string | null;
    /** Manh mối dẫn đến đáp án đúng. */
    clue?: string | null;
    /** Phân tích lý do chọn đáp án đúng. */
    analysis?: string | null;
    /** Danh sách từ vựng cần ghi nhớ. */
    vocabulary?: ReviewVocabularyItem[];
}

/**
 * Cấu trúc một câu hỏi ôn tập củng cố gắn trên bài giảng lý thuyết.
 */
export interface LessonReviewQuestion {
    /** Mã liên kết practice_questions. */
    id: number;
    /** Mã câu hỏi gốc trong ngân hàng câu hỏi. */
    questionId: number;
    /** Thứ tự câu hỏi trong bài. */
    orderNo: number;
    /** Điểm số của câu hỏi. */
    points: number;
    /** Nội dung câu hỏi chính. */
    questionText: string;
    /** Đường dẫn hình ảnh minh họa riêng của câu hỏi (nếu có). */
    imageUrl?: string | null;
    /** Đường dẫn âm thanh riêng của câu hỏi (nếu có). */
    audioUrl?: string | null;
    /** Đoạn văn hoặc ngữ cảnh chung của chùm câu hỏi (Part 3, 4, 6, 7). */
    parentContextText?: string | null;
    /** Hình ảnh ngữ cảnh chung của chùm câu hỏi (nếu có). */
    parentImageUrl?: string | null;
    /** Tệp âm thanh chung của chùm câu hỏi (nếu có). */
    parentAudioUrl?: string | null;
    /** Danh sách các phương án lựa chọn. */
    options: ReviewOptionItem[];
    /** Ký tự đáp án đúng (A, B, C hoặc D). */
    correctAnswer: string;
    /** Dữ liệu giải thích chi tiết đáp án (nếu có). */
    explanation?: ReviewExplanationItem | null;
}

/**
 * Dữ liệu hoàn chỉnh của một phòng học bài giảng trả về từ GET /api/users/lessons/{lessonId}.
 */
export interface LessonDetail {
    /** Mã bài học. */
    id: number;
    /** Mã mô-đun chứa bài học. */
    moduleId: number;
    /** Tiêu đề mô-đun. */
    moduleTitle: string;
    /** Tên phần thi TOEIC (Part 1 - Part 7). */
    partName: string;
    /** Kỹ năng Nghe hiểu hoặc Đọc hiểu. */
    section: LessonSectionType;
    /** Tiêu đề bài học. */
    title: string;
    /** Thứ tự hiển thị bài học trong mô-đun. */
    orderNo: number;
    /** Loại bài học (VIDEO hoặc PRACTICE). */
    lessonType: LessonContentType;
    /** Tài liệu lý thuyết, ghi chú và tóm tắt bài học. */
    descriptions?: string | null;
    /** Đường dẫn video bài giảng trên Cloudinary. */
    videoUrl?: string | null;
    /** Đường dẫn tệp âm thanh bổ trợ (nếu có). */
    audioUrl?: string | null;
    /** Đường dẫn hình ảnh sơ đồ minh họa (nếu có). */
    imageUrl?: string | null;
    /** Thời lượng bài giảng lưu trong CSDL (giây). */
    durationSeconds: number;
    /** Cờ đánh dấu bài học miễn phí. */
    isFree: boolean;
    /** Tên năng lực trọng tâm mà bài học rèn luyện. */
    abilityName?: string | null;
    /** Cờ xác định bài học thuộc mô-đun trong lộ trình cá nhân (false khi đang Học tự do từ Thư viện). */
    inRoadmap?: boolean;
    /** Tổng thời lượng xem thực tế đã tích lũy trên server (giây). */
    watchedSeconds: number;
    /** Mốc thời gian dừng xem gần nhất để tiếp tục xem (giây). */
    lastPositionSeconds: number;
    /** Tỷ lệ phần trăm xem tích lũy hiện tại (0 - 100). */
    watchPercent: number;
    /** Ngưỡng % tối thiểu cần xem để hoàn thành bài giảng (đọc động từ server). */
    requiredWatchPercent: number;
    /** Cờ đánh dấu bài giảng đã hoàn thành hay chưa. */
    isCompleted: boolean;
    /** Thời điểm bài giảng hoàn thành (ISO string hoặc null). */
    completedAt?: string | null;
    /** Tỷ lệ hoàn thành chung của mô-đun chứa bài giảng (%). */
    moduleProgressPercent: number;
    /** Số bài giảng lý thuyết đã hoàn thành trong mô-đun. */
    completedVideoLessons: number;
    /** Tổng số bài giảng lý thuyết của mô-đun. */
    totalVideoLessons: number;
    /** Ngưỡng % hoàn thành bài giảng để mở khóa bài kiểm tra vượt ải. */
    requiredCompletionRate: number;
    /** Cờ đánh dấu bài kiểm tra vượt ải của mô-đun đã được mở khóa hay chưa. */
    moduleTestUnlocked: boolean;
    /** Mã bài học liền trước trong mô-đun (nếu có). */
    prevLessonId?: number | null;
    /** Mã bài học liền sau trong mô-đun (nếu có). */
    nextLessonId?: number | null;
    /** Loại nội dung của bài học liền sau (nếu có). */
    nextLessonType?: LessonContentType | null;
    /** Danh sách toàn bộ bài học đã xuất bản trong cùng mô-đun. */
    moduleLessons: LessonNavItem[];
    /** Danh sách câu hỏi ôn tập củng cố đi kèm bài giảng. */
    reviewQuestions: LessonReviewQuestion[];
}

/**
 * Payload gửi lên PUT /api/users/lessons/{lessonId}/progress sau mỗi nhịp xem thực tế.
 */
export interface UpdateLessonProgressPayload {
    /** Số giây xem thực tế tăng thêm kể từ lần đồng bộ trước. */
    watchedSecondsDelta: number;
    /** Mốc thời gian hiện tại của video (giây) để lưu vị trí tạm dừng. */
    lastPositionSeconds: number;
    /** Thời lượng thực tế trình phát đọc được (dùng fallback nếu DB bằng 0). */
    reportedDurationSeconds?: number;
    /** Tốc độ phát hiện tại (0.5 - 2.0). */
    playbackRate?: number;
}

/**
 * Kết quả trả về từ PUT /api/users/lessons/{lessonId}/progress.
 */
export interface LessonProgressResult {
    /** Mã bài học vừa cập nhật. */
    lessonId: number;
    /** Tổng thời lượng xem thực tế mới (giây). */
    watchedSeconds: number;
    /** Mốc tạm dừng mới (giây). */
    lastPositionSeconds: number;
    /** Thời lượng chuẩn của video (giây). */
    durationSeconds: number;
    /** Tỷ lệ % xem thực tế sau cập nhật. */
    watchPercent: number;
    /** Ngưỡng % cần đạt để hoàn thành bài giảng. */
    requiredWatchPercent: number;
    /** Trạng thái hoàn thành hiện tại của bài giảng. */
    isCompleted: boolean;
    /** Cờ báo hiệu bài giảng vừa chạm mốc hoàn thành ở đúng nhịp lưu này. */
    justCompleted: boolean;
    /** Thời điểm hoàn thành bài giảng (nếu có). */
    completedAt?: string | null;
    /** Tỷ lệ hoàn thành chung mới của mô-đun (%). */
    moduleProgressPercent: number;
    /** Số bài giảng lý thuyết đã hoàn thành trong mô-đun. */
    completedVideoLessons: number;
    /** Tổng số bài giảng lý thuyết của mô-đun. */
    totalVideoLessons: number;
    /** Ngưỡng % hoàn thành cần đạt để mở bài thi vượt ải. */
    requiredCompletionRate: number;
    /** Trạng thái mở khóa bài thi vượt ải sau lần cập nhật này. */
    moduleTestUnlocked: boolean;
    /** Cờ báo hiệu bài thi vượt ải vừa được mở khóa nhờ lần hoàn thành này. */
    moduleTestJustUnlocked: boolean;
}

/**
 * Dữ liệu tiến độ lưu tạm trong localStorage khi học viên bị rớt mạng hoặc hết phiên đăng nhập.
 */
export interface PendingProgressDraft {
    /** Mã bài học tương ứng. */
    lessonId: number;
    /** Số giây xem thực tế chưa kịp đồng bộ lên máy chủ. */
    pendingDeltaSeconds: number;
    /** Mốc tạm dừng gần nhất tính bằng giây. */
    lastPositionSeconds: number;
    /** Thời lượng video trình phát đã ghi nhận. */
    reportedDurationSeconds: number;
    /** Tốc độ phát gần nhất. */
    playbackRate: number;
    /** Thời điểm lưu bản nháp cục bộ (timestamp ms). */
    savedAt: number;
}
