import { http, HttpResponse } from 'msw';
import { mockModuleTestData, mockModuleTestResult, mockModulePerformanceReport } from '../mockData';

export const moduleTestHandlers = [
    http.get('*/api/v1/modules/:moduleId/test', () => {
        return HttpResponse.json({ success: true, message: 'OK', data: mockModuleTestData });
    }),

    http.post('*/api/v1/modules/:moduleId/test/submit', () => {
        return HttpResponse.json({
            success: true,
            message: 'Chấm bài module test thành công',
            data: mockModuleTestResult,
        });
    }),

    http.get('*/api/v1/modules/:moduleId/test/results/:attemptId', () => {
        return HttpResponse.json({ success: true, message: 'OK', data: mockModulePerformanceReport });
    }),

    http.get('*/api/v1/learning-results/latest', () => {
        return HttpResponse.json({ success: true, message: 'OK', data: mockModulePerformanceReport });
    }),

    http.get('*/api/v1/modules/:moduleId/test/review/:attemptId', () => {
        return HttpResponse.json({ success: true, message: 'OK', data: mockModuleTestResult });
    }),
];
