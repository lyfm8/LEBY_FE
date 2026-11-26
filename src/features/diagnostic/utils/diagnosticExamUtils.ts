import type {
    DiagnosticExamStep,
    DiagnosticQuestion,
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
 * Tạo khóa nhận diện audio duy nhất cho một câu đơn hoặc một chùm câu hỏi Listening.
 * Tuyệt đối không lấy raw audioUrl làm key vì dữ liệu seed có thể dùng chung 1 file URL cho nhiều câu.
 */
export function resolveStepAudioKey(question: DiagnosticQuestion): string | null {
    // Nếu không có đường dẫn audio thì không cần tạo khóa audio
    if (!question.audioUrl) return null;
    // Nếu là câu hỏi chùm có parentId, dùng parentId để các câu con trong chùm chia sẻ đúng 1 lượt nghe
    if (question.parentId !== null && question.parentId !== undefined) {
        return `parent_${question.parentId}`;
    }
    // Với câu đơn, gắn khóa duy nhất theo questionId của chính câu hỏi đó
    return `q_${question.questionId}`;
}

/**
 * Gom danh sách câu hỏi thành các bước hiển thị theo từng trang:
 * các câu liên tiếp có cùng parentId (Part 3, 4, 6, 7) được hiển thị trên cùng 1 trang.
 */
export function buildExamSteps(questions: DiagnosticQuestion[]): DiagnosticExamStep[] {
    // Nếu danh sách rỗng thì trả về mảng rỗng ngay
    if (!questions || questions.length === 0) return [];

    // Sao chép mảng và sắp xếp tăng dần theo orderNo để bảo đảm đúng thứ tự đề thi
    const sorted = [...questions].sort((a, b) => a.orderNo - b.orderNo);
    // Khởi tạo mảng chứa các bước (mỗi bước tương ứng 1 trang câu đơn hoặc 1 chùm câu)
    const steps: DiagnosticExamStep[] = [];

    // Con trỏ duyệt qua từng phần tử trong danh sách đã sắp xếp
    let cursor = 0;
    // Vòng lặp gom nhóm câu hỏi liên tiếp có cùng câu hỏi cha
    while (cursor < sorted.length) {
        // Lấy câu hỏi đầu tiên làm gốc cho bước hiện tại
        const first = sorted[cursor];
        // Khởi tạo danh sách câu hỏi thuộc bước hiện tại
        const groupQuestions: DiagnosticQuestion[] = [first];
        // Dịch con trỏ sang phần tử tiếp theo để kiểm tra xem có thuộc cùng chùm hay không
        let lookahead = cursor + 1;

        // Chỉ gom nhóm khi câu gốc có parentId hợp lệ (câu hỏi chùm)
        if (first.parentId !== null && first.parentId !== undefined) {
            // Tiếp tục gộp các câu liền kề nếu trùng parentId, section và partNo
            while (lookahead < sorted.length) {
                // Lấy câu kế tiếp để so sánh
                const candidate = sorted[lookahead];
                // Kiểm tra điều kiện cùng chùm câu hỏi cha và cùng Part
                const isSameGroup =
                    candidate.parentId === first.parentId &&
                    candidate.section === first.section &&
                    candidate.partNo === first.partNo;
                // Dừng gom khi gặp câu thuộc chùm khác hoặc câu đơn mới
                if (!isSameGroup) break;
                // Thêm câu cùng chùm vào danh sách câu của trang hiện tại
                groupQuestions.push(candidate);
                // Tăng biến đếm để kiểm tra câu tiếp theo nữa
                lookahead++;
            }
        }

        // Tìm câu đầu tiên có audioUrl trong nhóm (nếu có)
        const audioHolder = groupQuestions.find((item) => Boolean(item.audioUrl));
        // Tìm câu đầu tiên có imageUrl trong nhóm (nếu có)
        const imageHolder = groupQuestions.find((item) => Boolean(item.imageUrl));
        // Tìm câu đầu tiên có passage trong nhóm (nếu có)
        const passageHolder = groupQuestions.find((item) => Boolean(item.passage));
        // Tìm câu đầu tiên có instruction trong nhóm (nếu có)
        const instructionHolder = groupQuestions.find((item) => Boolean(item.instruction));

        // Đóng gói thông tin trang/chùm câu hỏi vào mảng kết quả
        steps.push({
            stepIndex: steps.length,
            section: first.section,
            partNo: first.partNo,
            partName: first.partName,
            audioKey: audioHolder ? resolveStepAudioKey(audioHolder) : null,
            audioUrl: audioHolder?.audioUrl ?? null,
            imageUrl: imageHolder?.imageUrl ?? null,
            passage: passageHolder?.passage ?? null,
            instruction: instructionHolder?.instruction ?? null,
            questions: groupQuestions,
        });

        // Nhảy con trỏ tới vị trí câu chưa được gom tiếp theo
        cursor = lookahead;
    }

    // Trả về danh sách các bước hiển thị đã gom nhóm hoàn chỉnh
    return steps;
}

/**
 * Tạo bảng ánh xạ nhanh từ số thứ tự câu hỏi (orderNo) sang chỉ số màn hình (stepIndex).
 */
export function buildQuestionToStepMap(steps: DiagnosticExamStep[]): Map<number, number> {
    // Khởi tạo Map tra cứu O(1) khi học viên bấm chọn câu trên bảng Palette
    const map = new Map<number, number>();
    // Duyệt từng bước hiển thị
    for (const step of steps) {
        // Duyệt từng câu hỏi nằm trong bước đó
        for (const question of step.questions) {
            // Gán ánh xạ orderNo -> stepIndex
            map.set(question.orderNo, step.stepIndex);
        }
    }
    // Trả về Map đã xây dựng xong
    return map;
}

/**
 * Lấy danh sách tất cả audioKey thuộc phần Listening cần phát xong trước khi mở khóa lại Palette Nghe.
 */
export function getListeningAudioKeys(steps: DiagnosticExamStep[]): string[] {
    // Khởi tạo mảng chứa các khóa audio phần Nghe theo đúng thứ tự
    const keys: string[] = [];
    // Dùng Set để tránh đưa trùng khóa audio nếu có hai bước chung khóa
    const seen = new Set<string>();
    // Duyệt từng bước trong toàn bộ đề thi
    for (const step of steps) {
        // Chỉ lấy bước thuộc phần LISTENING và có audio hợp lệ
        if (step.section === 'LISTENING' && step.audioKey && step.audioUrl && !seen.has(step.audioKey)) {
            // Đánh dấu đã ghi nhận khóa audio này
            seen.add(step.audioKey);
            // Đưa vào danh sách audio bắt buộc phải chạy qua
            keys.push(step.audioKey);
        }
    }
    // Trả về danh sách khóa audio của toàn bộ phần Nghe
    return keys;
}

/**
 * Kiểm tra xem toàn bộ các file audio của phần Listening đã phát xong hết hay chưa.
 */
export function checkAllListeningCompleted(
    listeningAudioKeys: string[],
    playedAudios: Set<string>
): boolean {
    // Nếu đề không có câu Nghe nào thì coi như phần Nghe đã hoàn thành sẵn
    if (listeningAudioKeys.length === 0) return true;
    // Chỉ trả về true khi toàn bộ audioKey phần Nghe đều đã nằm trong tập playedAudios
    return listeningAudioKeys.every((key) => playedAudios.has(key));
}
