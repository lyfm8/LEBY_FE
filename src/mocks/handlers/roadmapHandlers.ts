import { http, HttpResponse } from 'msw';
import {
    mockDashboardSummary,
    mockRoadmapData,
    mockModuleDetail,
    mockLessonDetail,
} from '../mockData';

export const roadmapHandlers = [
    // ── Dashboard ──
    http.get('*/api/v1/dashboard/summary', () => {
        return HttpResponse.json({ success: true, message: 'OK', data: mockDashboardSummary });
    }),

    // ── Roadmap ──
    http.get('*/api/v1/roadmap', () => {
        return HttpResponse.json({ success: true, message: 'OK', data: mockRoadmapData });
    }),

    http.get('*/api/v1/modules/:moduleId', () => {
        return HttpResponse.json({ success: true, message: 'OK', data: mockModuleDetail });
    }),

    // ── Lesson ──
    http.get('*/api/v1/modules/:moduleId/lessons/:lessonId', () => {
        return HttpResponse.json({ success: true, message: 'OK', data: mockLessonDetail });
    }),

    http.post('*/api/v1/modules/:moduleId/lessons/:lessonId/complete', () => {
        return HttpResponse.json({
            success: true,
            message: 'Hoàn thành bài học thành công',
            data: { lessonId: 3, isCompleted: true, nextLessonId: 4 },
        });
    }),
];
