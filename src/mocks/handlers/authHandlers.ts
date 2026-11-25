import { http, HttpResponse } from 'msw';

// State lưu thông tin user mock hiện tại (mặc định là học viên để vào thẳng trang User)
let currentMockUser = {
    id: 1,
    email: 'demo@leby.edu.vn',
    fullName: 'Nguyễn Hải Nam (Học viên)',
    role: 'STUDENT',
    dob: '2001-08-15',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    learnerType: 'UNIVERSITY_STUDENT',
    hasSelectedTarget: true,
    targetProfileId: 3,
    targetTotalScore: 650,
};

export const authHandlers = [
    http.get('*/api/auth/me', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: currentMockUser,
        });
    }),

    http.get('*/api/v1/auth/me', () => {
        return HttpResponse.json({
            success: true,
            message: 'OK',
            data: currentMockUser,
        });
    }),

    http.post('*/api/auth/login', async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as { email?: string };
        const email = body?.email?.trim().toLowerCase() || 'demo@leby.edu.vn';
        const isAdmin = email.includes('admin');

        currentMockUser = {
            id: isAdmin ? 1 : 2,
            email: email,
            fullName: isAdmin ? 'Võ Hoàng Quân (Admin)' : 'Nguyễn Hải Nam (Học viên)',
            role: isAdmin ? 'ADMIN' : 'STUDENT',
            dob: '2001-08-15',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            learnerType: isAdmin ? 'WORKING' : 'UNIVERSITY_STUDENT',
            hasSelectedTarget: true,
            targetProfileId: 3,
            targetTotalScore: 650,
        };

        return HttpResponse.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: currentMockUser,
        });
    }),

    http.post('*/api/v1/auth/login', async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as { email?: string };
        const email = body?.email?.trim().toLowerCase() || 'demo@leby.edu.vn';
        const isAdmin = email.includes('admin');

        currentMockUser = {
            id: isAdmin ? 1 : 2,
            email: email,
            fullName: isAdmin ? 'Võ Hoàng Quân (Admin)' : 'Nguyễn Hải Nam (Học viên)',
            role: isAdmin ? 'ADMIN' : 'STUDENT',
            dob: '2001-08-15',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            learnerType: isAdmin ? 'WORKING' : 'UNIVERSITY_STUDENT',
            hasSelectedTarget: true,
            targetProfileId: 3,
            targetTotalScore: 650,
        };

        return HttpResponse.json({
            success: true,
            message: 'Đăng nhập thành công',
            data: currentMockUser,
        });
    }),

    http.post('*/api/auth/logout', () => {
        return HttpResponse.json({ success: true, message: 'Đăng xuất thành công', data: null });
    }),

    http.post('*/api/v1/auth/logout', () => {
        return HttpResponse.json({ success: true, message: 'Đăng xuất thành công', data: null });
    }),

    http.post('*/api/auth/register', async ({ request }) => {
        const body = (await request.json().catch(() => ({}))) as {
            email?: string;
            fullName?: string;
            dob?: string;
            learnerType?: string;
        };
        currentMockUser = {
            ...currentMockUser,
            email: body.email?.trim() || currentMockUser.email,
            fullName: body.fullName?.trim() || currentMockUser.fullName,
            dob: body.dob || '2003-08-15',
            learnerType: body.learnerType || 'UNIVERSITY_STUDENT',
            hasSelectedTarget: false,
            targetProfileId: null as unknown as number,
            targetTotalScore: null as unknown as number,
        };
        return HttpResponse.json({
            success: true,
            message: 'Đăng ký thành công',
            data: currentMockUser,
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
