/**
 * Các hàm tiện ích chuẩn hóa định dạng ngày sinh dd/mm/yy trên giao diện
 * và chuyển đổi sang định dạng ISO YYYY-MM-DD khớp với LocalDate của Backend.
 */

const DD_MM_YY_OR_YYYY_REGEX = /^(\d{2})\/(\d{2})\/(\d{2}|\d{4})$/;
const MIN_VALID_BIRTH_YEAR = 1900;

/**
 * Chuyển chuỗi ngày ISO (YYYY-MM-DD) sang định dạng hiển thị dd/mm/yy.
 *
 * @param isoDate Chuỗi ngày theo chuẩn ISO (ví dụ "2003-08-15")
 * @returns Chuỗi dạng "15/08/03", hoặc chuỗi rỗng nếu không hợp lệ
 */
export function formatIsoToDdMmYy(isoDate: string | null | undefined): string {
    if (!isoDate) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
    if (!match) return '';

    const [, yyyy, mm, dd] = match;
    return `${dd}/${mm}/${yyyy.slice(-2)}`;
}

/**
 * Lấy ngày hôm nay theo múi giờ máy khách ở định dạng YYYY-MM-DD.
 */
export function getTodayIsoDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Phân tích chuỗi ngày dd/mm/yy (hoặc dd/mm/yyyy) sang chuẩn ISO YYYY-MM-DD.
 * Áp dụng quy tắc cửa sổ năm hiện tại cho năm 2 chữ số (ví dụ năm 2026: 00..26 → 2000..2026, 27..99 → 1927..1999).
 *
 * @param displayDate Chuỗi người dùng nhập theo định dạng dd/mm/yy
 * @returns Chuỗi YYYY-MM-DD nếu ngày tồn tại hợp lệ trên lịch, ngược lại trả null
 */
export function parseDdMmYyToIso(displayDate: string): string | null {
    const trimmed = displayDate.trim();
    const match = DD_MM_YY_OR_YYYY_REGEX.exec(trimmed);
    if (!match) return null;

    const day = Number(match[1]);
    const month = Number(match[2]);
    const yearPart = match[3];

    let fullYear: number;
    if (yearPart.length === 2) {
        const twoDigits = Number(yearPart);
        const currentTwoDigits = new Date().getFullYear() % 100;
        fullYear = twoDigits <= currentTwoDigits ? 2000 + twoDigits : 1900 + twoDigits;
    } else {
        fullYear = Number(yearPart);
    }

    if (fullYear < MIN_VALID_BIRTH_YEAR || month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
    }

    // Kiểm tra ngày thực sự tồn tại trên lịch (tránh 30/02 bị JS tự tràn sang tháng 3)
    const candidate = new Date(fullYear, month - 1, day);
    if (
        candidate.getFullYear() !== fullYear ||
        candidate.getMonth() !== month - 1 ||
        candidate.getDate() !== day
    ) {
        return null;
    }

    return `${String(fullYear).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Kiểm tra chuỗi ngày ISO YYYY-MM-DD có nằm trong quá khứ (nhỏ hơn ngày hôm nay) hay không.
 */
export function isPastIsoDate(isoDate: string): boolean {
    return isoDate < getTodayIsoDate();
}

/**
 * Định dạng tự động chèn dấu "/" theo mẫu dd/mm/yy khi người dùng gõ chữ số,
 * đồng thời giữ thao tác xóa Backspace tự nhiên.
 */
export function formatDateInputMask(nextValue: string, prevValue: string): string {
    if (nextValue.length < prevValue.length) {
        return nextValue;
    }

    const digits = nextValue.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) {
        return digits;
    }
    if (digits.length <= 4) {
        return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}
