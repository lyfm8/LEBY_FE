import { http, HttpResponse } from 'msw';
import { mockTargetProfiles, mockDiagnosticTest, mockDiagnosticResult } from '../mockData';

let currentMockTargetId: number | null = 3;

export const diagnosticHandlers = [
    // ── Target (UC05 - chuẩn endpoint không có tiền tố /v1) ──
    http.get('*/api/targets', () => {
        return HttpResponse.json({ success: true, message: 'OK', data: mockTargetProfiles });
    }),

    http.post('*/api/targets/select', async ({ request }) => {
        const body = (await request.json()) as { targetProfileId: number };
        const selected = mockTargetProfiles.find((t) => t.id === body.targetProfileId);
        if (!selected) {
            return HttpResponse.json(
                { success: false, message: 'Mục tiêu học tập không tồn tại' },
                { status: 404 }
            );
        }

        if (currentMockTargetId !== null && selected.id === currentMockTargetId) {
            return HttpResponse.json(
                {
                    success: false,
                    message:
                        'Bạn hiện đang học tập với mục tiêu này. Vui lòng chọn một mốc mục tiêu khác nếu muốn nâng cao điểm số',
                },
                { status: 400 }
            );
        }

        const isChangingExistingTarget = currentMockTargetId !== null;
        currentMockTargetId = selected.id;

        return HttpResponse.json({
            success: true,
            message: isChangingExistingTarget
                ? 'Đổi mục tiêu AIM thành công. Lộ trình học mới đã được khởi tạo'
                : 'Thiết lập mục tiêu AIM thành công',
            data: {
                userId: 1,
                targetProfileId: selected.id,
                targetTotalScore: selected.targetTotalScore,
                redirectAction: isChangingExistingTarget ? 'GO_LEARNING_PATH' : 'GO_DIAGNOSTIC',
                learningPathId: isChangingExistingTarget ? 101 : null,
            },
        });
    }),

    // ── Diagnostic ──
    http.get('*/api/v1/diagnostic/comprehensive-test', () => {
        return HttpResponse.json({ success: true, message: 'OK', data: mockDiagnosticTest });
    }),

    http.post('*/api/v1/diagnostic/submit', async () => {
        return HttpResponse.json({
            success: true,
            message: 'Chấm bài chẩn đoán thành công',
            data: { attemptId: 501, redirectUrl: '/diagnostic/results/501' },
        });
    }),

    http.get('*/api/v1/diagnostic/results/:attemptId', () => {
        return HttpResponse.json({ success: true, message: 'OK', data: mockDiagnosticResult });
    }),
];
