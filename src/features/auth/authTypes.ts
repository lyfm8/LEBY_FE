// ─── Request types (khớp với BE DTO) ─────────────────────────────────────────

export interface SendOtpRequest {
    email: string;
    /** "REGISTER" | "FORGOT_PASSWORD" */
    purpose: string;
}

export interface RegisterRequest {
    email: string;
    username: string;
    fullName: string;
    password: string;
    confirmPassword: string;
    otp: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

// ─── Response types (khớp với AuthResponse.java) ─────────────────────────────

export type UserRole = 'USER' | 'ADMIN' | 'STAFF';

export interface AuthUser {
    id: number;
    email: string;
    username: string;
    fullName: string;
    dob: string | null;
    avatar: string | null;
    role: UserRole;
}
