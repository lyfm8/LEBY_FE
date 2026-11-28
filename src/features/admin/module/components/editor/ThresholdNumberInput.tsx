import React from 'react';

interface ThresholdNumberInputProps {
  // Giá trị số hiện tại của ô nhập liệu
  value: number;
  // Callback trả giá trị số mới về component cha mỗi khi thay đổi
  onChange: (val: number) => void;
  // Đơn vị hiển thị bên phải con số ('đ' hoặc '%')
  unit: 'đ' | '%';
  // Giới hạn nhỏ nhất hợp lệ (mặc định 50)
  min?: number;
  // Giới hạn lớn nhất hợp lệ (mặc định 100)
  max?: number;
  // Kích thước hiển thị: 'normal' cho bảng, 'large' cho form chi tiết
  size?: 'normal' | 'large';
  // Tự động ép giá trị vào khoảng [min, max] khi rời khỏi ô nhập liệu hay không
  clampOnBlur?: boolean;
  // Nhãn trợ năng mô tả ô nhập liệu cho trình đọc màn hình
  ariaLabel?: string;
}

/**
 * Ô nhập tham số ngưỡng dạng số kèm đơn vị ('đ' hoặc '%'),
 * thay thế cho dropdown gợi ý cũ để quản trị viên nhập số trực tiếp.
 */
export const ThresholdNumberInput: React.FC<ThresholdNumberInputProps> = ({
  // Giải nén giá trị số hiện tại từ props
  value,
  // Giải nén callback cập nhật giá trị từ props
  onChange,
  // Giải nén đơn vị hiển thị ('đ' hoặc '%')
  unit,
  // Gán giá trị mặc định cho giới hạn dưới là 50 nếu không truyền
  min = 50,
  // Gán giá trị mặc định cho giới hạn trên là 100 nếu không truyền
  max = 100,
  // Gán kích thước mặc định là 'normal' nếu không truyền
  size = 'normal',
  // Mặc định tắt ép ngưỡng tự động khi blur để form có thể tự hiển thị lỗi validation
  clampOnBlur = false,
  // Giải nén nhãn trợ năng tùy chọn
  ariaLabel,
}) => {
  // Xử lý khi người dùng gõ hoặc xóa ký tự trong ô input số
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Lấy chuỗi thô từ phần tử input
    const raw = e.target.value;
    // Nếu người dùng xóa trắng ô nhập, truyền 0 để giữ trạng thái rỗng tạm thời
    if (raw === '') {
      onChange(0);
      return;
    }
    // Ép kiểu chuỗi sang số để kiểm tra hợp lệ
    const num = Number(raw);
    // Chỉ gọi callback cập nhật khi giá trị là số hợp lệ
    if (!Number.isNaN(num)) {
      onChange(num);
    }
  };

  // Xử lý khi người dùng rời khỏi ô nhập liệu để chuẩn hóa giá trị trong [min, max] nếu bật clampOnBlur
  const handleInputBlur = () => {
    // Bỏ qua nếu component cha tự xử lý validation qua schema (ví dụ react-hook-form + Zod)
    if (!clampOnBlur) {
      return;
    }
    // Giới hạn giá trị nằm trong đoạn [min, max] trước khi hiển thị ổn định trên bảng
    const clamped = Math.max(min, Math.min(max, value || min));
    // Chỉ gọi onChange nếu giá trị sau khi chuẩn hóa khác với giá trị hiện tại
    if (clamped !== value) {
      onChange(clamped);
    }
  };

  // Xác định class kích thước lớn khi được dùng trong form tạo/sửa Module
  const wrapperClass = `threshold-number-input-wrapper ${size === 'large' ? 'size-large' : ''}`;

  return (
    // Vỏ bọc ngoài kiểm soát kích thước tổng thể của ô nhập
    <div className={wrapperClass}>
      {/* Khung viền bo tròn chứa ô nhập số và nhãn đơn vị */}
      <div className="threshold-input-box">
        {/* Ô nhập số thuần cho phép gõ trực tiếp giá trị ngưỡng */}
        <input
          type="number"
          min={min}
          max={max}
          value={value === 0 ? '' : value}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className="threshold-raw-input"
          placeholder="--"
          aria-label={ariaLabel}
        />
        {/* Nhãn đơn vị ('đ' hoặc '%') đặt ngay cạnh giá trị số */}
        <span className="threshold-unit-label">{unit}</span>
      </div>
    </div>
  );
};
