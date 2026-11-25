import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar } from 'lucide-react';
import { LEARNER_TYPE_LABELS, type ELearnerType } from '@/features/profile/types/profileTypes';
import { registerSchema, type RegisterFormValues } from '../schemas/authSchema';
import {
    formatDateInputMask,
    formatIsoToDdMmYy,
    getTodayIsoDate,
    parseDdMmYyToIso,
} from '../utils/dateFormat';

/**
 * Props cho component RegisterForm
 */
export interface RegisterFormProps {
    /** Hàm callback được gọi khi submit form hợp lệ */
    onSubmit: (values: RegisterFormValues) => Promise<void> | void;
    /** Dữ liệu khởi tạo (khôi phục từ bước trước nếu user quay lại từ màn OTP) */
    defaultValues?: Partial<RegisterFormValues>;
    /** Trạng thái đang gọi API gửi mã OTP đăng ký */
    isLoading?: boolean;
    /** Thông báo lỗi từ Backend (VD: email đã tồn tại trong hệ thống) */
    serverError?: string;
}

const LEARNER_TYPE_OPTIONS = Object.keys(LEARNER_TYPE_LABELS) as ELearnerType[];

/**
 * Presentational Component: Form đăng ký tài khoản học viên mới (UC01),
 * tích hợp thông tin cá nhân (ngày sinh định dạng dd/mm/yy và đối tượng học tập).
 */
export const RegisterForm: React.FC<RegisterFormProps> = ({
    onSubmit,
    defaultValues,
    isLoading = false,
    serverError,
}) => {
    const hiddenDateInputRef = useRef<HTMLInputElement>(null);

    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: defaultValues?.fullName ?? '',
            email: defaultValues?.email ?? '',
            dob: defaultValues?.dob ?? '',
            learnerType: defaultValues?.learnerType,
            password: defaultValues?.password ?? '',
            confirmPassword: defaultValues?.confirmPassword ?? '',
            terms: defaultValues ? true : false,
        },
    });

    const currentDobDisplay = watch('dob');
    const syncedIsoDob = parseDdMmYyToIso(currentDobDisplay || '') ?? '';
    const todayIso = getTodayIsoDate();

    const handleOpenNativePicker = () => {
        const picker = hiddenDateInputRef.current;
        if (!picker) return;
        if (typeof picker.showPicker === 'function') {
            picker.showPicker();
        } else {
            picker.click();
        }
    };

    return (
        <>
            <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Banner lỗi từ Backend (VD: Email đã đăng ký) */}
                {serverError && (
                    <div className="auth-form__banner" role="alert">
                        {serverError}
                    </div>
                )}

                {/* Họ và tên */}
                <div className="auth-form__group">
                    <label className="auth-form__label" htmlFor="reg-fullName">
                        Họ và tên
                    </label>
                    <input
                        id="reg-fullName"
                        type="text"
                        autoComplete="name"
                        placeholder="Nguyễn Văn A"
                        className={`auth-form__input${errors.fullName ? ' is-error' : ''}`}
                        {...register('fullName')}
                    />
                    {errors.fullName && <span className="auth-form__error">{errors.fullName.message}</span>}
                </div>

                {/* Email */}
                <div className="auth-form__group">
                    <label className="auth-form__label" htmlFor="reg-email">
                        Địa chỉ Email
                    </label>
                    <input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        placeholder="email@example.com"
                        className={`auth-form__input${errors.email ? ' is-error' : ''}`}
                        {...register('email')}
                    />
                    {errors.email && <span className="auth-form__error">{errors.email.message}</span>}
                </div>

                {/* Ngày sinh (dd/mm/yy) + Đối tượng học tập (2 cột) */}
                <div className="auth-form__row">
                    <div className="auth-form__group">
                        <label className="auth-form__label" htmlFor="reg-dob">
                            Ngày sinh
                        </label>
                        <Controller
                            name="dob"
                            control={control}
                            render={({ field }) => (
                                <div className="auth-form__date-wrap">
                                    <input
                                        id="reg-dob"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={10}
                                        placeholder="dd/mm/yy"
                                        className={`auth-form__input auth-form__date-input${errors.dob ? ' is-error' : ''}`}
                                        value={field.value}
                                        onChange={(e) => {
                                            const formatted = formatDateInputMask(e.target.value, field.value);
                                            field.onChange(formatted);
                                        }}
                                        onBlur={field.onBlur}
                                    />
                                    <button
                                        type="button"
                                        className="auth-form__date-picker-btn"
                                        onClick={handleOpenNativePicker}
                                        title="Chọn ngày từ lịch"
                                        aria-label="Mở lịch chọn ngày sinh"
                                    >
                                        <Calendar size={17} />
                                    </button>
                                    <input
                                        ref={hiddenDateInputRef}
                                        type="date"
                                        tabIndex={-1}
                                        aria-hidden="true"
                                        max={todayIso}
                                        value={syncedIsoDob}
                                        className="auth-form__date-native-hidden"
                                        onChange={(e) => {
                                            const formatted = formatIsoToDdMmYy(e.target.value);
                                            if (formatted) {
                                                setValue('dob', formatted, {
                                                    shouldValidate: true,
                                                    shouldDirty: true,
                                                });
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        />
                        {errors.dob && <span className="auth-form__error">{errors.dob.message}</span>}
                    </div>

                    <div className="auth-form__group">
                        <label className="auth-form__label" htmlFor="reg-learnerType">
                            Bạn là
                        </label>
                        <select
                            id="reg-learnerType"
                            className={`auth-form__input auth-form__select${errors.learnerType ? ' is-error' : ''}`}
                            defaultValue={defaultValues?.learnerType ?? ''}
                            {...register('learnerType')}
                        >
                            <option value="" disabled>
                                -- Chọn đối tượng --
                            </option>
                            {LEARNER_TYPE_OPTIONS.map((typeKey) => (
                                <option key={typeKey} value={typeKey}>
                                    {LEARNER_TYPE_LABELS[typeKey]}
                                </option>
                            ))}
                        </select>
                        {errors.learnerType && (
                            <span className="auth-form__error">{errors.learnerType.message}</span>
                        )}
                    </div>
                </div>

                {/* Mật khẩu & Xác nhận mật khẩu (2 cột) */}
                <div className="auth-form__row">
                    <div className="auth-form__group">
                        <label className="auth-form__label" htmlFor="reg-password">
                            Mật khẩu
                        </label>
                        <input
                            id="reg-password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Ít nhất 8 ký tự"
                            className={`auth-form__input${errors.password ? ' is-error' : ''}`}
                            {...register('password')}
                        />
                        {errors.password && <span className="auth-form__error">{errors.password.message}</span>}
                    </div>

                    <div className="auth-form__group">
                        <label className="auth-form__label" htmlFor="reg-confirmPassword">
                            Xác nhận mật khẩu
                        </label>
                        <input
                            id="reg-confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Nhập lại mật khẩu"
                            className={`auth-form__input${errors.confirmPassword ? ' is-error' : ''}`}
                            {...register('confirmPassword')}
                        />
                        {errors.confirmPassword && (
                            <span className="auth-form__error">{errors.confirmPassword.message}</span>
                        )}
                    </div>
                </div>

                {/* Đồng ý Điều khoản & Chính sách */}
                <div className="auth-form__group">
                    <label className="auth-form__terms">
                        <input
                            type="checkbox"
                            id="reg-terms"
                            className="auth-form__terms-checkbox"
                            {...register('terms')}
                        />
                        <span className="auth-form__terms-text">
                            Tôi đồng ý với các{' '}
                            <a href="#">Điều khoản Dịch vụ</a>
                            {' '}và{' '}
                            <a href="#">Chính sách Bảo mật</a>
                            {' '}của LEBY
                        </span>
                    </label>
                    {errors.terms && <span className="auth-form__error">{errors.terms.message}</span>}
                </div>

                {/* Nút Đăng ký & Gửi mã OTP */}
                <button
                    id="reg-submit-btn"
                    type="submit"
                    className="auth-form__submit"
                    disabled={isLoading}
                >
                    {isLoading ? 'Đang gửi mã OTP...' : 'Đăng ký tài khoản'}
                </button>
            </form>

            <p className="auth-card__footer">
                Đã có tài khoản?{' '}
                <Link to="/login">Đăng nhập ngay</Link>
            </p>
        </>
    );
};
