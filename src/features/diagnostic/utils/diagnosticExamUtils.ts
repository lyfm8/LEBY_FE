import type {
    OptionKey,
    SubmitDiagnosticRequest,
} from '../types/diagnosticTypes';

// Tiền tố khóa lưu nháp bài thi theo attemptId trong localStorage
const DRAFT_STORAGE_PREFIX = 'leby_diag_draft_';
// Khóa lưu tạm payload nộp bài khi phiên đăng nhập hết hạn 401
const PENDING_SUBMIT_KEY = 'leby_diag_pending_submit';

/** Cấu trúc dữ liệu nháp phòng thi được lưu real-time vào localStorage (BR12). */
export interface DiagnosticDraft {
    // Bản đồ đáp án theo số thứ tự câu hỏi (orderNo -> A/B/C/D)
    answers: Record<number, OptionKey | null>;
    // Danh sách số thứ tự các câu hỏi đang gắn cờ đánh dấu
    flagged: number[];
    // Danh sách khóa audio đã phát xong hết một lượt (BR13)
    playedAudios: string[];
    // Vị trí trang/chùm câu hỏi hiện tại để khôi phục đúng chỗ khi F5 reload
    currentStepIndex?: number;
}

/** Cấu trúc payload nộp bài chờ gửi lại sau khi đăng nhập lại (UC06 Ngoại lệ 9a). */
export interface PendingSubmitPayload {
    // ID học viên sở hữu lượt nộp bài
    userId: number;
    // Toàn bộ dữ liệu nộp bài cần gửi lại
    request: SubmitDiagnosticRequest;
}

/**
 * Đọc bản nháp bài thi từ localStorage theo attemptId.
 */
export function readDiagnosticDraft(attemptId: number): DiagnosticDraft | null {
    // Thực hiện đọc và parse JSON an toàn để tránh crash nếu dữ liệu lưu trữ bị hỏng
    try {
        // Lấy chuỗi JSON nháp từ localStorage theo key cố định của attemptId
        const raw = localStorage.getItem(`${DRAFT_STORAGE_PREFIX}${attemptId}`);
        // Trả về null nếu chưa từng có bản nháp nào
        if (!raw) return null;
        // Parse chuỗi JSON sang kiểu DiagnosticDraft
        return JSON.parse(raw) as DiagnosticDraft;
    } catch {
        // Trả về null nếu trình duyệt chặn storage hoặc JSON không hợp lệ
        return null;
    }
}

/**
 * Lưu bản nháp bài thi vào localStorage ngay khi học viên thay đổi đáp án, cờ hoặc audio.
 */
export function writeDiagnosticDraft(attemptId: number, draft: DiagnosticDraft): void {
    // Bảo vệ thao tác ghi storage bằng try/catch phòng trường hợp đầy bộ nhớ trình duyệt
    try {
        // Chuyển object nháp thành JSON và ghi xuống localStorage
        localStorage.setItem(`${DRAFT_STORAGE_PREFIX}${attemptId}`, JSON.stringify(draft));
    } catch {
        // Bỏ qua lỗi ghi storage để không gián đoạn quá trình làm bài
    }
}

/**
 * Xóa bản nháp bài thi khỏi localStorage sau khi nộp bài thành công hoặc làm lại lượt mới.
 */
export function clearDiagnosticDraft(attemptId: number): void {
    // Dọn dẹp key nháp của attemptId tương ứng
    try {
        // Xóa item theo tiền tố và attemptId
        localStorage.removeItem(`${DRAFT_STORAGE_PREFIX}${attemptId}`);
    } catch {
        // Không cần xử lý thêm khi xóa thất bại
    }
}

/**
 * Đọc payload nộp bài đang chờ xử lý sau khi đăng nhập lại.
 */
export function readPendingSubmit(): PendingSubmitPayload | null {
    // Đọc dữ liệu nộp bài tạm từ localStorage một cách an toàn
    try {
        // Lấy chuỗi JSON theo key pending submit
        const raw = localStorage.getItem(PENDING_SUBMIT_KEY);
        // Trả về null nếu không có giao dịch nộp bài chờ
        if (!raw) return null;
        // Parse JSON thành object PendingSubmitPayload
        return JSON.parse(raw) as PendingSubmitPayload;
    } catch {
        // Trả về null nếu dữ liệu bị lỗi định dạng
        return null;
    }
}

/**
 * Lưu tạm payload nộp bài trước khi gọi API để bảo toàn nếu hết hạn phiên 401 đúng lúc nộp.
 */
export function writePendingSubmit(payload: PendingSubmitPayload): void {
    // Ghi payload nộp bài tạm thời vào localStorage
    try {
        // Tuần tự hóa payload sang JSON trước khi lưu
        localStorage.setItem(PENDING_SUBMIT_KEY, JSON.stringify(payload));
    } catch {
        // Bỏ qua nếu bộ nhớ trình duyệt đầy
    }
}

/**
 * Xóa payload nộp bài tạm khi nộp thành công hoặc gặp lỗi không phải 401.
 */
export function clearPendingSubmit(): void {
    // Dọn key nộp bài tạm khỏi localStorage
    try {
        // Xóa bỏ dữ liệu chờ nộp bài
        localStorage.removeItem(PENDING_SUBMIT_KEY);
    } catch {
        // Không xử lý thêm
    }
}

/**
 * Kiểm tra có giao dịch nộp bài chẩn đoán chờ xử lý thuộc đúng tài khoản {@code userId} hay không.
 */
export function hasPendingDiagnosticSubmitForUser(userId: number): boolean {
    const pending = readPendingSubmit();
    return Boolean(pending && pending.userId === userId && pending.request?.attemptId);
}

export {
    resolveStepAudioKey,
    buildExamSteps,
    buildQuestionToStepMap,
    getListeningAudioKeys,
    checkAllListeningCompleted,
} from '../../../shared/exam/utils/examStepUtils';
