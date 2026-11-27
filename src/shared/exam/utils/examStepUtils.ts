import type { BaseExamQuestion, ExamStep } from '../types/examTypes';

/**
 * Tạo khóa nhận diện audio duy nhất cho một câu đơn hoặc một chùm câu hỏi Listening.
 * Không dùng raw audioUrl làm key vì nhiều câu có thể trỏ cùng 1 tệp âm thanh mẫu.
 */
export function resolveStepAudioKey<TQuestion extends BaseExamQuestion>(
    question: TQuestion
): string | null {
    if (!question.audioUrl) return null;
    if (question.parentId !== null && question.parentId !== undefined) {
        return `parent_${question.parentId}`;
    }
    return `q_${question.questionId}`;
}

/**
 * Gom danh sách câu hỏi thành từng màn hình hiển thị theo thứ tự:
 * các câu liên tiếp có cùng {@code parentId} (Part 3, 4, 6, 7) được hiển thị chung một trang.
 */
export function buildExamSteps<TQuestion extends BaseExamQuestion>(
    questions: TQuestion[]
): ExamStep<TQuestion>[] {
    if (!questions || questions.length === 0) return [];

    const sorted = [...questions].sort((a, b) => a.orderNo - b.orderNo);
    const steps: ExamStep<TQuestion>[] = [];

    let cursor = 0;
    while (cursor < sorted.length) {
        const first = sorted[cursor];
        const groupQuestions: TQuestion[] = [first];
        let lookahead = cursor + 1;

        if (first.parentId !== null && first.parentId !== undefined) {
            while (lookahead < sorted.length) {
                const candidate = sorted[lookahead];
                const isSameGroup =
                    candidate.parentId === first.parentId &&
                    candidate.section === first.section &&
                    candidate.partNo === first.partNo;
                if (!isSameGroup) break;
                groupQuestions.push(candidate);
                lookahead++;
            }
        }

        const audioHolder = groupQuestions.find((item) => Boolean(item.audioUrl));
        const imageHolder = groupQuestions.find((item) => Boolean(item.imageUrl));
        const passageHolder = groupQuestions.find((item) => Boolean(item.passage));
        const instructionHolder = groupQuestions.find((item) => Boolean(item.instruction));

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

        cursor = lookahead;
    }

    return steps;
}

/**
 * Tạo bảng ánh xạ O(1) từ {@code orderNo} của câu hỏi sang {@code stepIndex} trên phòng thi.
 */
export function buildQuestionToStepMap<TQuestion extends BaseExamQuestion>(
    steps: ExamStep<TQuestion>[]
): Map<number, number> {
    const map = new Map<number, number>();
    for (const step of steps) {
        for (const question of step.questions) {
            map.set(question.orderNo, step.stepIndex);
        }
    }
    return map;
}

/**
 * Lấy danh sách tất cả {@code audioKey} thuộc phần Listening theo đúng thứ tự.
 */
export function getListeningAudioKeys<TQuestion extends BaseExamQuestion>(
    steps: ExamStep<TQuestion>[]
): string[] {
    const keys: string[] = [];
    const seen = new Set<string>();
    for (const step of steps) {
        if (step.section === 'LISTENING' && step.audioKey && step.audioUrl && !seen.has(step.audioKey)) {
            seen.add(step.audioKey);
            keys.push(step.audioKey);
        }
    }
    return keys;
}

/**
 * Kiểm tra toàn bộ bản ghi âm phần Nghe đã phát xong hết hay chưa.
 * Với các bài/mô-đun chỉ có Phần Đọc ({@code listeningAudioKeys.length === 0}), mặc định trả về {@code true}.
 */
export function checkAllListeningCompleted(
    listeningAudioKeys: string[],
    playedAudios: Set<string>
): boolean {
    if (listeningAudioKeys.length === 0) return true;
    return listeningAudioKeys.every((key) => playedAudios.has(key));
}
