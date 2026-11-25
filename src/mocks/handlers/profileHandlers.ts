import { http, HttpResponse } from 'msw';
import { mockProfileData } from '../mockData';

export const profileHandlers = [
    http.get('*/api/users/profile', () => {
        return HttpResponse.json({ success: true, message: 'OK', data: mockProfileData });
    }),

    http.put('*/api/users/profile', async ({ request }) => {
        const body = (await request.json()) as Partial<typeof mockProfileData.user>;
        const updated = { ...mockProfileData, user: { ...mockProfileData.user, ...body } };
        return HttpResponse.json({ success: true, message: 'Cập nhật thông tin thành công', data: updated });
    }),

    http.post('*/api/users/change-password', () => {
        return HttpResponse.json({
            success: true,
            message: 'Đổi mật khẩu thành công',
            data: { message: 'Đổi mật khẩu thành công' },
        });
    }),
];
