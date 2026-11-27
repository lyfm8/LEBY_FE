import type {
    BaseExamQuestion,
    ExamExplanation,
    OptionKey,
} from '../../../shared/exam/types/examTypes';

// Phân loại đề thi thử ETS 200 câu: đề luyện tập mở tự do hoặc đề thi đầu ra mở khóa sau lộ trình
export type ExamTag = 'PRACTICE' | 'OUTPUT';

// Trạng thái lượt làm bài thi thử từ máy chủ
export type MockExamAttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED' | 'ABANDONED';

// Thông tin từng đề thi thử hiển thị tại trang danh sách Phòng thi ETS (UC17)
export interface MockExamListItem {
    // ID định danh bộ đề thi trong bảng diagnostic_tests
    id: number;
    // Tiêu đề bộ đề thi thử ETS
    title: string;
    // Mô tả ngắn về bộ đề thi
    description: string | null;
    // Nhãn phân loại đề luyện tập hay đề thi đầu ra
    examTag: ExamTag;
    // Thời lượng làm bài chuẩn tính bằng phút
    durationMinutes: number;
    // Tổng số câu hỏi trong đề (chuẩn 200 câu)
    totalQuestions: number;
    // Cờ cho biết bộ đề hiện đang bị khóa với học viên hay không
    isLocked: boolean;
    // Lý do bị khóa để hiển thị thông báo rõ ràng trên UI
    lockReason: string | null;
    // Cờ cho biết học viên có phiên làm dở trên bộ đề này không
    hasInProgressAttempt: boolean;
    // ID lượt thi đang làm dở nếu có
    inProgressAttemptId: number | null;
    // Số lần học viên đã hoàn thành bộ đề này
    attemptCount: number;
    // Điểm TOEIC cao nhất học viên từng đạt ở bộ đề này
    bestScore: number | null;
}

// Một dòng trong bảng lịch sử các lượt làm bài thi thử ETS (UC17 & UC18)
export interface MockExamHistoryItem {
    // ID lượt thi
    attemptId: number;
    // ID bộ đề thi
    testId: number;
    // Tên bộ đề thi
    testTitle: string;
    // Phân loại PRACTICE hoặc OUTPUT
    examTag: ExamTag;
    // Trạng thái lượt thi
    status: MockExamAttemptStatus;
    // Thời điểm hoàn tất bài thi
    completedAt: string | null;
    // Tổng thời gian đã làm bài tính bằng giây
    durationSeconds: number | null;
    // Điểm kỹ năng Nghe quy đổi thang 5-495
    listeningScore: number | null;
    // Điểm kỹ năng Đọc quy đổi thang 5-495
    readingScore: number | null;
    // Tổng điểm TOEIC quy đổi 10-990
    totalToeicScore: number | null;
    // Tổng số câu trả lời đúng
    totalCorrect: number | null;
    // Tổng số câu hỏi của bài thi
    totalQuestions: number | null;
    // Cờ đạt hay chưa đạt mục tiêu AIM hiện tại
    isAimAchieved: boolean | null;
    // Cờ cho phép mở xem lại 200 câu & lời giải (đề OUTPUT chỉ mở khi đạt AIM)
    canViewReview?: boolean;
}

// Dữ liệu tổng hợp trả về cho trang danh sách & lịch sử Thi thử ETS
export interface MockExamListData {
    // Cờ cho biết học viên đã mở khóa đề thi đầu ra OUTPUT chưa
    isOutputExamUnlocked: boolean;
    // Thông báo giải thích lý do khóa đề OUTPUT nếu chưa hoàn thành lộ trình
    outputLockReason: string | null;
    // ID lượt thi thử đang dang dở gần nhất (nếu có) để hiện banner Tiếp tục
    activeAttemptId: number | null;
    // ID bộ đề đang làm dở
    activeTestId: number | null;
    // Tiêu đề bộ đề đang làm dở
    activeTestTitle: string | null;
    // Điểm mục tiêu AIM hiện tại của học viên
    userTargetScore: number | null;
    // Danh sách các bộ đề thi thử ETS đang ACTIVE
    exams: MockExamListItem[];
    // Danh sách lịch sử các lượt thi thử trước đó
    history: MockExamHistoryItem[];
}

// Payload gửi lên API bắt đầu lượt thi thử mới
export interface StartMockExamRequest {
    // ID bộ đề FULL_MOCK_TEST cần làm
    diagnosticTestId: number;
    // ID mục tiêu AIM tùy chọn nếu muốn chỉ định tường minh
    targetProfileId?: number;
}

// Phản hồi sau khi khởi tạo hoặc resume lượt thi thử từ máy chủ
export interface StartMockExamResponse {
    // ID lượt thi vừa khởi tạo hoặc khôi phục
    attemptId: number;
    // ID bộ đề thi
    diagnosticTestId: number;
    // ID hồ sơ mục tiêu AIM gắn với lượt thi
    targetProfileId: number | null;
    // Thời điểm bắt đầu làm bài
    startedAt: string;
    // Thời lượng làm bài tính bằng phút
    durationMinutes: number;
}

// Bản nháp đáp án của từng câu hỏi đã lưu trên máy chủ (BR12)
export interface MockExamDraftAnswer {
    // ID câu hỏi
    questionId: number;
    // Số thứ tự câu hỏi (1..200)
    orderNo: number;
    // Đáp án học viên đã chọn (A, B, C, D hoặc null)
    selectedOption: OptionKey | null;
    // Cờ đánh dấu xem lại câu hỏi
    isFlagged: boolean;
}

// Câu hỏi trong phòng thi thử ETS 200 câu kế thừa đầy đủ cấu trúc chuẩn phòng thi chung
export interface MockExamQuestion extends BaseExamQuestion {}

// Toàn bộ dữ liệu phòng thi thử ETS 200 câu tải từ máy chủ
export interface MockExamRoomData {
    // ID lượt thi hiện tại
    attemptId: number;
    // ID bộ đề thi
    testId: number;
    // ID mục tiêu AIM gắn với lượt thi
    targetProfileId: number | null;
    // Tiêu đề bộ đề thi
    title: string;
    // Mô tả đề thi
    description: string | null;
    // Phân loại đề luyện tập hoặc đề đầu ra
    examTag: ExamTag;
    // Thời lượng tối đa tính bằng phút (thường là 120 phút)
    durationMinutes: number;
    // Thời điểm bắt đầu phiên thi
    startedAt: string;
    // Số giây còn lại do máy chủ cấp để đồng bộ đồng hồ
    remainingSeconds: number;
    // Tổng số câu hỏi trong đề (200 câu)
    totalQuestions: number;
    // Danh sách đầy đủ câu hỏi không kèm đáp án đúng
    questions: MockExamQuestion[];
    // Danh sách đáp án nháp đã lưu từ máy chủ
    draftAnswers: MockExamDraftAnswer[];
}

// Một phần tử đáp án nháp gửi lên API lưu nháp tức thì (BR12)
export interface SaveMockExamDraftItem {
    // ID câu hỏi
    questionId: number;
    // Ký hiệu đáp án A/B/C/D hoặc rỗng khi bỏ chọn
    selectedOption: OptionKey | '';
    // Trạng thái gắn cờ câu hỏi
    isFlagged: boolean;
}

// Payload đồng bộ bản nháp đáp án lên máy chủ
export interface SaveMockExamDraftRequest {
    // ID lượt thi đang diễn ra
    attemptId: number;
    // Danh sách đáp án thay đổi cần lưu nháp
    answers: SaveMockExamDraftItem[];
}

// Một phần tử đáp án trong payload nộp bài chính thức
export interface SubmitMockExamAnswerItem {
    // ID câu hỏi
    questionId: number;
    // Đáp án chuỗi JSON dạng {"selected":"A"} hoặc null nếu bỏ trống
    userAnswer: string | null;
    // Cờ đánh dấu xem lại
    isFlagged: boolean;
}

// Payload nộp bài thi thử ETS 200 câu (UC17)
export interface SubmitMockExamRequest {
    // ID lượt thi cần nộp
    attemptId: number;
    // ID mục tiêu AIM gắn với phiên thi
    targetProfileId?: number;
    // Danh sách toàn bộ đáp án bài làm
    answers: SubmitMockExamAnswerItem[];
    // Tổng thời gian làm bài thực tế tính bằng giây
    durationSeconds: number;
    // Cờ xác nhận thu bài tự động khi hết giờ (BR07)
    isTimedOut: boolean;
}

// Kết quả tóm tắt trả về ngay sau khi nộp bài thi thử
export interface MockExamSubmitResponse {
    // ID lượt thi vừa chấm
    attemptId: number;
    // ID bộ đề
    testId: number;
    // Phân loại PRACTICE hoặc OUTPUT để FE điều hướng đúng trang kết quả
    examTag: ExamTag;
    // Điểm Listening quy đổi thang 5-495
    listeningScore: number;
    // Điểm Reading quy đổi thang 5-495
    readingScore: number;
    // Tổng điểm TOEIC quy đổi 10-990
    totalToeicScore: number;
    // Tổng số câu đúng
    totalCorrect: number;
    // Tổng số câu hỏi
    totalQuestions: number;
    // Cờ đạt mục tiêu AIM
    isAimAchieved: boolean | null;
}

// Điểm năng lực trên một trục Radar (Part 1-7)
export interface AbilityRadarPoint {
    // Số thứ tự Part (1..7)
    partNo: number;
    // Mã định danh trục radar
    code: string;
    // Tên hiển thị của Part trên biểu đồ radar
    name: string;
    // Tỷ lệ chính xác 0-100
    score: number;
    // Trạng thái phân loại năng lực
    status: string;
}

// Chi tiết từng kỹ năng con (Ability) trong bài thi thử đầu ra
export interface PartAbilityBreakdown {
    // ID năng lực con
    abilityId: number;
    // Tên kỹ năng năng lực
    abilityName: string;
    // Số thứ tự Part chứa năng lực này
    partNo: number;
    // Tên Part
    partName: string;
    // Số câu làm đúng
    correctCount: number;
    // Tổng số câu kiểm tra năng lực này
    totalCount: number;
    // Tỷ lệ đúng 0-100
    accuracyPercent: number;
    // Mức đánh giá (WEAK, DEVELOPING, STABLE, UNCERTAIN)
    status: string;
}

// Dữ liệu đối sánh từng Part trong Báo cáo kết quả thi thử (UC18)
export interface MockExamPartComparison {
    // ID Part
    partId: number;
    // Số thứ tự Part (1..7)
    partNo: number;
    // Tên Part
    name: string;
    // Số câu đúng ở lượt thi thử hiện tại
    correctCount: number;
    // Tổng số câu thuộc Part này
    totalQuestions: number;
    // Điểm phần trăm hiện tại (0-100)
    score: number;
    // Điểm phần trăm lúc chẩn đoán đầu vào (null nếu đề PRACTICE)
    beforeScore: number | null;
    // Mức chênh lệch so với đầu vào (null nếu đề PRACTICE)
    scoreDelta: number | null;
    // Danh sách chi tiết các kỹ năng con trong Part (rỗng nếu đề PRACTICE)
    abilities: PartAbilityBreakdown[];
}

// Báo cáo kết quả toàn diện sau khi hoàn thành thi thử ETS (UC18)
export interface MockExamReportData {
    // ID lượt thi
    attemptId: number;
    // ID bộ đề
    testId: number;
    // Tiêu đề bộ đề thi
    testTitle: string;
    // Phân loại PRACTICE hay OUTPUT quyết định hiển thị Radar & Khuyến nghị
    examTag: ExamTag;
    // Thời điểm hoàn thành
    completedAt: string | null;
    // Thời gian làm bài tính bằng giây
    durationSeconds: number | null;
    // Điểm Listening quy đổi ETS
    listeningScore: number;
    // Điểm Reading quy đổi ETS
    readingScore: number;
    // Tổng điểm TOEIC quy đổi 10-990
    totalToeicScore: number;
    // Số câu Nghe đúng
    listeningCorrect: number;
    // Tổng số câu Nghe
    listeningTotal: number;
    // Tỷ lệ đúng Nghe (0-100)
    listeningPercent: number;
    // Số câu Đọc đúng
    readingCorrect: number;
    // Tổng số câu Đọc
    readingTotal: number;
    // Tỷ lệ đúng Đọc (0-100)
    readingPercent: number;
    // Tổng số câu đúng cả đề
    totalCorrect: number;
    // Tổng số câu cả đề
    totalQuestions: number;
    // Mục tiêu AIM hiện tại của học viên
    targetScore: number | null;
    // Cờ đạt mục tiêu AIM
    isAimAchieved: boolean | null;
    // Cờ cho phép xem lại đáp án & lời giải (đề OUTPUT chỉ mở khi đạt AIM)
    canViewReview?: boolean;
    // Chênh lệch so với AIM (âm là còn thiếu, dương là vượt mục tiêu)
    scoreDifference: number | null;
    // Đường Radar trước lộ trình (màu xám — null nếu PRACTICE)
    beforeRadar: AbilityRadarPoint[] | null;
    // Đường Radar sau lộ trình (màu xanh dương — null nếu PRACTICE)
    afterRadar: AbilityRadarPoint[] | null;
    // Bảng phân tích 7 Part kèm chênh lệch Trước/Sau cho đề OUTPUT
    partResults: MockExamPartComparison[];
    // Danh sách các kỹ năng còn yếu cần củng cố thêm
    remainingWeakAbilities: PartAbilityBreakdown[];
    // Khuyến nghị cá nhân hóa bước tiếp theo (chỉ có cho đề OUTPUT)
    recommendations: string[];
    // Tiêu đề kết luận tổng quan (chỉ có cho đề OUTPUT)
    summaryHeadline: string | null;
    // Nội dung diễn giải kết quả đầu ra (chỉ có cho đề OUTPUT)
    summaryMessage: string | null;
}

// Câu hỏi chi tiết trong chế độ Xem lại đáp án & lời giải bài thi thử (BR14)
export interface MockExamReviewQuestion extends BaseExamQuestion {
    // Đáp án học viên đã chọn
    userAnswer: OptionKey | null;
    // Đáp án đúng của câu hỏi
    correctAnswer: OptionKey | null;
    // Trạng thái trả lời đúng hay sai
    isCorrect: boolean;
    // Cờ đánh dấu của học viên
    isFlagged: boolean;
    // Lời giải chi tiết & từ vựng trọng tâm
    explanation: ExamExplanation | null;
}

// Toàn bộ dữ liệu trang Xem lại chi tiết bài thi thử ETS (200 câu)
export interface MockExamReviewData {
    // ID lượt thi
    attemptId: number;
    // ID bộ đề
    testId: number;
    // Tiêu đề bộ đề thi
    testTitle: string;
    // Phân loại PRACTICE hoặc OUTPUT
    examTag: ExamTag;
    // Thời điểm hoàn thành
    completedAt: string | null;
    // Tổng số câu hỏi
    totalQuestions: number;
    // Tổng số câu trả lời đúng
    correctCount: number;
    // Danh sách 200 câu hỏi kèm lời giải
    questions: MockExamReviewQuestion[];
}
