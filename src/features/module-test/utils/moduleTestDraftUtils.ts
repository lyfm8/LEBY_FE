import type { OptionKey, SubmitModuleTestRequest } from '../types/moduleTestTypes';

const DRAFT_STORAGE_PREFIX = 'leby_modtest_draft_';
const PENDING_SUBMIT_PREFIX = 'leby_modtest_pending_submit_';

/** Dữ liệu nháp phòng thi vượt ải mô-đun lưu cục bộ (cô lập theo userId + attemptId). */
export interface ModuleTestLocalDraft {
    userId: number;
    answers: Record<number, OptionKey | null>;
    flagged: number[];
    playedAudios: string[];
    currentStepIndex: number;
    secondsLeft?: number;
}

interface PendingModuleTestSubmitPayload {
    userId: number;
    request: SubmitModuleTestRequest;
}

function buildDraftKey(userId: number, attemptId: number): string {
    return `${DRAFT_STORAGE_PREFIX}u${userId}_a${attemptId}`;
}

function buildPendingSubmitKey(userId: number, moduleId: number): string {
    return `${PENDING_SUBMIT_PREFIX}u${userId}_m${moduleId}`;
}

function removeLegacyKey(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch {
        // Bỏ qua nếu trình duyệt chặn localStorage
    }
}

export function readModuleTestDraft(userId: number, attemptId: number): ModuleTestLocalDraft | null {
    removeLegacyKey(`${DRAFT_STORAGE_PREFIX}${attemptId}`);
    try {
        const raw = localStorage.getItem(buildDraftKey(userId, attemptId));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<ModuleTestLocalDraft>;
        if (parsed.userId !== userId) {
            return null;
        }
        return {
            userId,
            answers: parsed.answers ?? {},
            flagged: Array.isArray(parsed.flagged) ? parsed.flagged : [],
            playedAudios: Array.isArray(parsed.playedAudios) ? parsed.playedAudios : [],
            currentStepIndex: typeof parsed.currentStepIndex === 'number' ? parsed.currentStepIndex : 0,
            secondsLeft: typeof parsed.secondsLeft === 'number' ? parsed.secondsLeft : undefined,
        };
    } catch {
        return null;
    }
}

export function writeModuleTestDraft(
    userId: number,
    attemptId: number,
    draft: Omit<ModuleTestLocalDraft, 'userId'>
): void {
    try {
        const payload: ModuleTestLocalDraft = { userId, ...draft };
        localStorage.setItem(buildDraftKey(userId, attemptId), JSON.stringify(payload));
    } catch {
        // Bỏ qua khi bộ nhớ trình duyệt bị hạn chế
    }
}

export function clearModuleTestDraft(userId: number, attemptId: number): void {
    removeLegacyKey(`${DRAFT_STORAGE_PREFIX}${attemptId}`);
    try {
        localStorage.removeItem(buildDraftKey(userId, attemptId));
    } catch {
        // Không xử lý thêm
    }
}

export function readPendingModuleTestSubmit(
    userId: number,
    moduleId: number
): SubmitModuleTestRequest | null {
    removeLegacyKey(`${PENDING_SUBMIT_PREFIX}${moduleId}`);
    try {
        const raw = localStorage.getItem(buildPendingSubmitKey(userId, moduleId));
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<PendingModuleTestSubmitPayload>;
        if (parsed.userId !== userId || !parsed.request) {
            return null;
        }
        return parsed.request;
    } catch {
        return null;
    }
}

export function writePendingModuleTestSubmit(
    userId: number,
    moduleId: number,
    payload: SubmitModuleTestRequest
): void {
    try {
        const wrapped: PendingModuleTestSubmitPayload = { userId, request: payload };
        localStorage.setItem(buildPendingSubmitKey(userId, moduleId), JSON.stringify(wrapped));
    } catch {
        // Bỏ qua nếu trình duyệt chặn lưu trữ
    }
}

export function clearPendingModuleTestSubmit(userId: number, moduleId: number): void {
    removeLegacyKey(`${PENDING_SUBMIT_PREFIX}${moduleId}`);
    try {
        localStorage.removeItem(buildPendingSubmitKey(userId, moduleId));
    } catch {
        // Không xử lý thêm
    }
}
