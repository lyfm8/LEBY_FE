import type { OptionKey } from '../../../shared/exam/types/examTypes';
import type { SubmitMockExamRequest } from '../types/mockExamTypes';

// Tập ký hiệu đáp án hợp lệ chuẩn TOEIC phục vụ xác thực bản nháp cục bộ
const VALID_OPTIONS: ReadonlySet<string> = new Set(['A', 'B', 'C', 'D']);

// Type guard kiểm tra chuỗi có khớp đáp án A, B, C hoặc D hay không
function isValidOptionKey(value: string): value is OptionKey {
    // Đối chiếu chính xác với tập phương án chuẩn A-D
    return VALID_OPTIONS.has(value);
}

// Cấu trúc dữ liệu nháp phòng thi thử ETS lưu cục bộ trên trình duyệt (BR12)
export interface LocalMockExamDraftState {
    // Bản đồ đáp án theo thứ tự câu hỏi (orderNo -> OptionKey | null)
    answers: Record<number, OptionKey | null>;
    // Danh sách các số thứ tự câu hỏi đang được gắn cờ
    flagged: number[];
    // Danh sách audioKey đã nghe xong hết một lượt (BR08)
    playedAudios: string[];
    // Chỉ số bước hiển thị câu hỏi hiện tại trong phòng thi
    currentStepIndex: number;
    // Số giây làm bài còn lại được ghi nhận gần nhất
    secondsLeft?: number;
    // Dấu thời gian cập nhật bản nháp gần nhất (epoch ms)
    updatedAt: number;
}

// Tiền tố khóa localStorage cho bản nháp làm bài theo userId và attemptId
const DRAFT_PREFIX = 'leby_mock_exam_draft';
// Tiền tố khóa localStorage cho hàng đợi nộp bài lại khi rớt mạng (BR12)
const PENDING_SUBMIT_PREFIX = 'leby_mock_exam_pending_submit';

// Tạo khóa lưu trữ bản nháp riêng biệt theo từng học viên và lượt thi
function buildDraftKey(userId: number, attemptId: number): string {
    // Kết hợp prefix cùng ID học viên và ID lượt thi để tránh ghi đè chéo tài khoản
    return `${DRAFT_PREFIX}_u${userId}_a${attemptId}`;
}

// Tạo khóa lưu trữ payload nộp bài đang chờ đồng bộ lại khi mất kết nối mạng
function buildPendingSubmitKey(userId: number): string {
    // Kết hợp prefix và userId hiện tại
    return `${PENDING_SUBMIT_PREFIX}_u${userId}`;
}

// Chuyển ký hiệu đáp án chọn (A/B/C/D) thành chuỗi JSON chuẩn Backend yêu cầu
export function toMockExamJsonAnswer(option: OptionKey | null | undefined): string | null {
    // Trả về null nếu câu hỏi đang bỏ trống đáp án
    if (!option) return null;
    // Đóng gói theo cấu trúc {"selected":"A"} khớp Diagnostic & Mock Exam Backend
    return JSON.stringify({ selected: option });
}

// Trích xuất an toàn OptionKey từ giá trị thô chuỗi ký tự hoặc chuỗi JSON
export function parseMockExamOptionKey(raw: unknown): OptionKey | null {
    // Bỏ qua ngay nếu đầu vào không phải chuỗi hợp lệ
    if (typeof raw !== 'string') return null;
    // Loại bỏ khoảng trắng thừa hai đầu
    const trimmed = raw.trim();
    // Kiểm tra nhanh nếu giá trị là chuỗi rỗng
    if (!trimmed) return null;
    // Trường hợp server trả thẳng một chữ cái A/B/C/D
    if (isValidOptionKey(trimmed.toUpperCase())) {
        // Ép kiểu an toàn sau khi đã xác thực bằng type guard
        return trimmed.toUpperCase() as OptionKey;
    }
    // Trường hợp dữ liệu được lưu ở dạng JSON {"selected":"A"}
    if (trimmed.startsWith('{')) {
        // Dùng try/catch tránh vỡ luồng khi JSON bị hỏng cục bộ
        try {
            // Giải mã chuỗi JSON
            const parsed: unknown = JSON.parse(trimmed);
            // Kiểm tra thuộc tính selected có tồn tại và là chuỗi hay không
            if (
                typeof parsed === 'object' &&
                parsed !== null &&
                'selected' in parsed &&
                typeof (parsed as { selected: unknown }).selected === 'string'
            ) {
                // Chuẩn hóa chữ hoa để kiểm tra hợp lệ A/B/C/D
                const candidate = (parsed as { selected: string }).selected.trim().toUpperCase();
                // Trả về giá trị nếu nằm trong A, B, C, D
                if (isValidOptionKey(candidate)) return candidate as OptionKey;
            }
        } catch {
            // Trả về null nếu JSON không parse được
            return null;
        }
    }
    // Mặc định trả về null nếu không khớp định dạng đáp án hợp lệ
    return null;
}

// Đọc bản nháp phòng thi thử đã lưu cục bộ trên trình duyệt của học viên
export function readMockExamLocalDraft(
    userId: number,
    attemptId: number
): LocalMockExamDraftState | null {
    // Đọc dữ liệu thô từ localStorage theo khóa người dùng và lượt thi
    try {
        // Lấy chuỗi JSON từ localStorage
        const raw = localStorage.getItem(buildDraftKey(userId, attemptId));
        // Nếu chưa từng lưu nháp thì trả về null
        if (!raw) return null;
        // Giải mã JSON sang cấu trúc đối tượng JS
        const parsed: unknown = JSON.parse(raw);
        // Xác thực cấu trúc tối thiểu là object khác null
        if (typeof parsed !== 'object' || parsed === null) return null;
        // Ép kiểu trung gian sau kiểm tra cơ bản để trích xuất từng trường an toàn
        const data = parsed as Partial<LocalMockExamDraftState>;
        // Khởi tạo đối tượng answers hợp lệ với mọi OptionKey được chuẩn hóa
        const safeAnswers: Record<number, OptionKey | null> = {};
        // Nếu answers tồn tại và là object thì lọc lại từng giá trị hợp lệ
        if (data.answers && typeof data.answers === 'object') {
            // Duyệt từng cặp [orderNo, option] trong bản nháp cục bộ
            for (const [key, value] of Object.entries(data.answers)) {
                // Chuyển khóa chuỗi sang số thứ tự câu hỏi
                const orderNo = Number(key);
                // Chỉ nhận các khóa số hợp lệ và giá trị option chuẩn A/B/C/D hoặc null
                if (Number.isFinite(orderNo) && orderNo > 0) {
                    // Lưu trực tiếp nếu null hoặc đã parse đúng OptionKey
                    safeAnswers[orderNo] = value === null ? null : parseMockExamOptionKey(value);
                }
            }
        }
        // Chuẩn hóa mảng cờ đánh dấu chỉ chứa các số nguyên dương
        const safeFlagged = Array.isArray(data.flagged)
            ? data.flagged.filter((item): item is number => typeof item === 'number' && item > 0)
            : [];
        // Chuẩn hóa danh sách khóa âm thanh đã nghe xong hết một lượt
        const safeAudios = Array.isArray(data.playedAudios)
            ? data.playedAudios.filter((item): item is string => typeof item === 'string')
            : [];
        // Trả về bản nháp hoàn chỉnh đã làm sạch kiểu dữ liệu
        return {
            answers: safeAnswers,
            flagged: safeFlagged,
            playedAudios: safeAudios,
            currentStepIndex:
                typeof data.currentStepIndex === 'number' && data.currentStepIndex >= 0
                    ? data.currentStepIndex
                    : 0,
            secondsLeft:
                typeof data.secondsLeft === 'number' && data.secondsLeft >= 0
                    ? data.secondsLeft
                    : undefined,
            updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
        };
    } catch {
        // Trả về null nếu localStorage bị khóa hoặc dữ liệu bị lỗi
        return null;
    }
}

// Lưu trạng thái làm bài thi thử hiện tại vào localStorage (phòng khi mất mạng/F5)
export function saveMockExamLocalDraft(
    userId: number,
    attemptId: number,
    state: LocalMockExamDraftState
): void {
    // Bọc try/catch để tránh lỗi QuotaExceededError làm gián đoạn luồng chọn đáp án
    try {
        // Ghi đè chuỗi JSON trạng thái mới nhất vào localStorage
        localStorage.setItem(buildDraftKey(userId, attemptId), JSON.stringify(state));
    } catch {
        // Bỏ qua êm ái khi trình duyệt không cho phép ghi bộ nhớ cục bộ
    }
}

// Xóa bản nháp cục bộ sau khi đã nộp bài thành công lên máy chủ
export function clearMockExamLocalDraft(userId: number, attemptId: number): void {
    // Bọc try/catch bảo vệ thao tác xóa storage
    try {
        // Gỡ bỏ khóa nháp tương ứng khỏi localStorage
        localStorage.removeItem(buildDraftKey(userId, attemptId));
    } catch {
        // Không ném lỗi khi trình duyệt chặn truy cập storage
    }
}

// Lưu tạm payload nộp bài vào localStorage khi submit thất bại do sự cố mạng (BR12)
export function savePendingMockExamSubmit(
    userId: number,
    payload: SubmitMockExamRequest
): void {
    // Bọc try/catch để đảm bảo an toàn khi storage đầy
    try {
        // Lưu toàn bộ payload nộp bài kèm danh sách đáp án
        localStorage.setItem(buildPendingSubmitKey(userId), JSON.stringify(payload));
    } catch {
        // Bỏ qua nếu không thể lưu cục bộ
    }
}

// Đọc lại payload nộp bài đang treo do mất kết nối ở lần nộp trước
export function readPendingMockExamSubmit(userId: number): SubmitMockExamRequest | null {
    // Bọc try/catch phòng dữ liệu bị sửa hỏng ngoài ý muốn
    try {
        // Lấy chuỗi JSON payload pending từ localStorage
        const raw = localStorage.getItem(buildPendingSubmitKey(userId));
        // Trả về null nếu không có yêu cầu nào đang chờ gửi lại
        if (!raw) return null;
        // Giải mã JSON sang cấu trúc SubmitMockExamRequest
        const parsed: unknown = JSON.parse(raw);
        // Xác thực sơ bộ có chứa attemptId số hợp lệ
        if (
            typeof parsed === 'object' &&
            parsed !== null &&
            'attemptId' in parsed &&
            typeof (parsed as { attemptId: unknown }).attemptId === 'number'
        ) {
            // Trả về payload hợp lệ để hook phòng thi tự động thử nộp lại
            return parsed as SubmitMockExamRequest;
        }
        // Trả về null nếu dữ liệu không hợp lệ
        return null;
    } catch {
        // Trả về null khi lỗi giải mã JSON
        return null;
    }
}

// Xóa hàng đợi nộp bài sau khi máy chủ đã xác nhận lưu bài thành công
export function clearPendingMockExamSubmit(userId: number): void {
    // Bọc try/catch bảo vệ thao tác dọn dẹp storage
    try {
        // Xóa khóa pending submit của học viên hiện tại
        localStorage.removeItem(buildPendingSubmitKey(userId));
    } catch {
        // Bỏ qua lỗi storage nếu phát sinh
    }
}

// Định dạng số giây làm bài (ví dụ 5420) thành chuỗi đọc thân thiện "90 phút 20 giây"
export function formatMockExamDuration(durationSeconds: number | null | undefined): string {
    // Hiển thị dấu gạch ngang nếu chưa có dữ liệu thời gian
    if (durationSeconds === null || durationSeconds === undefined || durationSeconds < 0) {
        // Trả về placeholder chuẩn giao diện
        return '—';
    }
    // Tính số phút nguyên đã sử dụng
    const mins = Math.floor(durationSeconds / 60);
    // Tính số giây lẻ còn dư
    const secs = Math.floor(durationSeconds % 60);
    // Nếu dưới 1 phút thì chỉ hiển thị giây
    if (mins === 0) {
        // Trả về định dạng chỉ có giây
        return `${secs} giây`;
    }
    // Trả về định dạng phút kèm giây hai chữ số
    return `${mins} phút ${secs} giây`;
}
