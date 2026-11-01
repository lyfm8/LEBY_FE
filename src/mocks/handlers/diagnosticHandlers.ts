import { http, HttpResponse } from 'msw';
import { mockTargetProfiles, mockDiagnosticTest, mockDiagnosticResult } from '../mockData';

export const diagnosticHandlers = [
    // ── Target ──
    http.get('*/api/v1/targets', () => {
        return HttpResponse.json({ success: true, message: 'OK', data: mockTargetProfiles });
    }),

    http.post('*/api/v1/targets/select', async ({ request }) => {
        const body = (await request.json()) as { targetProfileId: number };
        const selected = mockTargetProfiles.find((t) => t.id === body.targetProfileId) ?? mockTargetProfiles[2];
        return HttpResponse.json({
            success: true,
            message: 'Thiết lập mục tiêu thành công',
            data: {
                planId: 101,
                userId: 1,
                targetProfileId: selected.id,
                targetTotalScore: selected.targetTotalScore,
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
