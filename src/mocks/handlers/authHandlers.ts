import { http, HttpResponse } from 'msw';

export const authHandlers = [
    http.get('*/api/auth/me', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: {
                id: 1,
                email: 'nam.nguyen@leby.edu.vn',
                fullName: 'Nguyễn Nam',
                role: 'ADMIN',
                dob: '2001-08-15',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            },
        });
    }),

    http.get('*/api/v1/auth/me', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: {
                id: 1,
                email: 'nam.nguyen@leby.edu.vn',
                fullName: 'Nguyễn Nam',
                role: 'ADMIN',
                dob: '2001-08-15',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            },
        });
    }),

    http.post('*/api/auth/login', async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as { email?: string };
        return HttpResponse.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                id: 1,
                email: body?.email || 'nam.nguyen@leby.edu.vn',
                fullName: 'Nguyễn Nam',
                role: 'ADMIN',
                dob: '2001-08-15',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            },
        });
    }),

    http.post('*/api/v1/auth/login', async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as { email?: string };
        return HttpResponse.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                id: 1,
                email: body?.email || 'nam.nguyen@leby.edu.vn',
                fullName: 'Nguyễn Nam',
                role: 'ADMIN',
                dob: '2001-08-15',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            },
        });
    }),

    http.post('*/api/auth/logout', () => {
        return HttpResponse.json({ success: true, message: 'Đăng xuất thành công', data: null });
    }),

    http.post('*/api/v1/auth/logout', () => {
        return HttpResponse.json({ success: true, message: 'Đăng xuất thành công', data: null });
    }),

    http.post('*/api/auth/register', () => {
        return HttpResponse.json({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                id: 1,
                email: 'nam.nguyen@leby.edu.vn',
                fullName: 'Nguyễn Nam',
                role: 'ADMIN',
                dob: '2001-08-15',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            },
        });
    }),

    http.post('*/api/auth/register/send-otp', () => {
        return HttpResponse.json({
            success: true,
            message: 'Mã OTP 6 số đã được gửi tới email của bạn (Mã mẫu: 123456)',
            data: null,
        });
    }),
];
