export type OptionKey = 'A' | 'B' | 'C' | 'D';
export type SectionType = 'LISTENING' | 'READING';
export type DirectiveType = 'PASS' | 'CONFIRM' | 'ABILITY_DIAGNOSTIC' | 'FULL_PART';
export type AbilityStatus = 'WEAK' | 'DEVELOPING' | 'STABLE' | 'UNCERTAIN';

/** Phương án lựa chọn trắc nghiệm của một câu hỏi. */
export interface DiagnosticOption {
    key: OptionKey;
    text: string;
}

/** Dữ liệu câu hỏi trong phòng thi chẩn đoán (đã ẩn đáp án đúng). */
export interface DiagnosticQuestion {
    questionId: number;
    orderNo: number;
    parentId?: number | null;
    partId: number;
    partNo: number;
    partName: string;
    section: SectionType;
    title: string;
    instruction?: string | null;
    audioUrl?: string | null;
    imageUrl?: string | null;
    passage?: string | null;
    isGroupQuestion?: boolean;
    options: DiagnosticOption[];
}

/** Dữ liệu phòng thi chẩn đoán trả về từ Backend (UC06). */
export interface DiagnosticTest {
    testId: number;
    attemptId: number;
    targetProfileId?: number | null;
    title: string;
    description?: string | null;
    durationMinutes: number;
    startedAt?: string;
    remainingSeconds?: number;
    totalQuestions: number;
    questions: DiagnosticQuestion[];
}

/** Payload yêu cầu bắt đầu lượt thi chẩn đoán. */
export interface StartDiagnosticRequest {
    // ID đề thi muốn khởi tạo cụ thể (tùy chọn)
    diagnosticTestId?: number;
    // ID mục tiêu điểm TOEIC (AIM) áp dụng cho lượt thi
    targetProfileId?: number;
    // Cờ cho phép thi lại ngay cả khi đã hoàn thành bài chẩn đoán ở mốc AIM hiện tại
    forceRetake?: boolean;
}

/** Payload đồng bộ số giây làm bài còn lại lên máy chủ. */
export interface SyncDiagnosticTimerRequest {
    // ID lượt thi đang diễn ra trên phòng thi
    attemptId: number;
    // Số giây còn lại của đồng hồ đếm ngược
    remainingSeconds: number;
}

/** Một màn hình / bước hiển thị trong phòng thi (có thể là 1 câu đơn hoặc 1 chùm câu hỏi Part 3/4/6/7). */
export interface DiagnosticExamStep<TQuestion extends DiagnosticQuestion = DiagnosticQuestion> {
    // Chỉ số thứ tự của màn hình hiện tại (bắt đầu từ 0)
    stepIndex: number;
    // Nhóm kỹ năng của màn hình hiện tại: LISTENING hoặc READING
    section: SectionType;
    // Số thứ tự Part (1..7)
    partNo: number;
    // Tên hiển thị của Part
    partName: string;
    // Khóa định danh audio duy nhất theo câu hoặc chùm câu để tránh xung đột URL seed
    audioKey: string | null;
    // Đường dẫn file audio dùng chung cho câu đơn hoặc cả chùm câu Listening
    audioUrl: string | null;
    // Đường dẫn hình ảnh minh họa dùng chung (nếu có)
    imageUrl: string | null;
    // Đoạn văn đọc hiểu dùng chung cho chùm Part 6/7 (nếu có)
    passage: string | null;
    // Chỉ dẫn ngữ cảnh chung của câu hỏi hoặc chùm câu hỏi
    instruction: string | null;
    // Danh sách 1 câu đơn hoặc nhiều câu con thuộc cùng một chùm hiển thị trên cùng trang
    questions: TQuestion[];
}

/** Thông tin phiên làm bài trả về khi khởi tạo lượt thi. */
export interface StartDiagnosticResponse {
    attemptId: number;
    diagnosticTestId: number;
    targetProfileId?: number | null;
    startedAt: string;
    durationMinutes: number;
}

/** Đáp án một câu hỏi gửi kèm khi nộp bài chẩn đoán. */
export interface SubmitAnswerPayload {
    questionId: number;
    userAnswer: string | null;
    isFlagged: boolean;
}

/** Payload nộp bài kiểm tra chẩn đoán lên Backend. */
export interface SubmitDiagnosticRequest {
    attemptId: number;
    targetProfileId: number;
    durationSeconds: number;
    answers: SubmitAnswerPayload[];
}

/** Kết quả tóm tắt trả về ngay sau khi nộp bài thành công. */
export interface SubmitDiagnosticResponse {
    attemptId: number;
    totalCorrect: number;
    totalQuestions: number;
    learningPathId?: number | null;
}

/** Thống kê năng lực con thuộc một Part TOEIC (UC07 Luồng 5a). */
export interface PartAbilityBreakdown {
    abilityId: number;
    abilityName: string;
    partNo: number;
    partName: string;
    correctCount: number;
    totalCount: number;
    accuracyPercent: number;
    status: AbilityStatus;
}

/** Kết quả từng Part trong báo cáo UC07. */
export interface PartResult {
    partId: number;
    partNo: number;
    name: string;
    correctCount: number;
    totalQuestions: number;
    score: number;
    maxScore: number;
    directive: DirectiveType;
    directiveLabel: string;
    abilities: PartAbilityBreakdown[];
}

/** Một trục trên Biểu đồ Radar 7 chiều (UC07). */
export interface AbilityRadar {
    partNo: number;
    code: string;
    name: string;
    score: number;
    status: AbilityStatus;
}

/** Điểm số quy đổi và tỷ lệ đúng theo hai kỹ năng Listening / Reading. */
export interface SectionScores {
    listening: number;
    reading: number;
    listeningCorrect: number;
    listeningTotal: number;
    readingCorrect: number;
    readingTotal: number;
    listeningPercent: number;
    readingPercent: number;
}

/** Tổng hợp khuyến nghị sư phạm và lộ trình theo AIM. */
export interface AiRoadmapSummary {
    radarInsight: string;
    focusParts: number[];
    moduleCount: number;
    recommendedAction: string;
    secondaryAction: string;
}

/** Một mục từ vựng trọng tâm nằm trong lời giải chi tiết câu hỏi TOEIC. */
export interface DiagnosticVocabularyItem {
    // Từ vựng tiếng Anh
    word: string;
    // Từ loại (n, v, adj, adv...)
    type: string;
    // Nghĩa tiếng Việt tương ứng
    meaning: string;
}

/** Nội dung giải thích chi tiết của một câu hỏi phục vụ màn hình Xem lại. */
export interface DiagnosticExplanation {
    // Lời thoại băng nghe (chủ yếu cho Part 1-4)
    transcript?: string | null;
    // Bản dịch nghĩa tiếng Việt
    translation?: string | null;
    // Manh mối nhận diện đáp án đúng
    clue?: string | null;
    // Phân tích lý do chọn đáp án đúng và loại phương án bẫy
    analysis?: string | null;
    // Danh sách từ vựng học thuật đáng chú ý
    vocabulary?: DiagnosticVocabularyItem[] | null;
}

/** Câu hỏi đầy đủ trong chế độ Xem lại bài thi chẩn đoán (BR14). */
export interface DiagnosticReviewQuestion extends DiagnosticQuestion {
    // Ký hiệu đáp án học viên đã chọn (null nếu bỏ qua)
    userAnswer: OptionKey | null;
    // Ký hiệu đáp án đúng của hệ thống
    correctAnswer: OptionKey | null;
    // Kết quả câu hỏi đúng hay sai
    isCorrect: boolean;
    // Trạng thái gắn cờ đánh dấu đã lưu từ lúc thi
    isFlagged: boolean;
    // Lời giải chi tiết kèm transcript và từ vựng
    explanation: DiagnosticExplanation | null;
}

/** Dữ liệu tổng hợp của một phiên Xem lại bài thi chẩn đoán (UC07 - BR14). */
export interface DiagnosticReviewData {
    // ID lượt làm bài chẩn đoán
    attemptId: number;
    // ID đề thi gốc
    testId: number;
    // Tiêu đề bài thi chẩn đoán
    testTitle: string;
    // Thời điểm học viên hoàn thành bài thi
    completedAt: string;
    // Tổng số câu hỏi của bài thi
    totalQuestions: number;
    // Tổng số câu trả lời đúng
    correctCount: number;
    // Danh sách toàn bộ câu hỏi đã sắp xếp theo thứ tự trong đề
    questions: DiagnosticReviewQuestion[];
}

/** Báo cáo kết quả chẩn đoán chi tiết toàn diện phục vụ UC07. */
export interface DiagnosticResult {
    attemptId: number;
    testTitle: string;
    completedAt: string;
    learningPathId?: number | null;
    predictedScore: number;
    targetScore?: number | null;
    totalQuestions: number;
    correctAnswers: number;
    durationSeconds?: number | null;
    sectionScores: SectionScores;
    partResults: PartResult[];
    abilitiesRadar: AbilityRadar[];
    weakAbilities: PartAbilityBreakdown[];
    passedParts: string[];
    aiRoadmapSummary: AiRoadmapSummary;
}
