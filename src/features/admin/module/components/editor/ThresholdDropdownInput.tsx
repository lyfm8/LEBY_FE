import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface ThresholdPreset {
  value: number;
  label: string;
  isRecommended?: boolean;
}

export const SCORE_PRESETS: ThresholdPreset[] = [
  { value: 50, label: 'Cơ bản' },
  { value: 60, label: 'Tiêu chuẩn' },
  { value: 65, label: 'Chuẩn gợi ý', isRecommended: true },
  { value: 70, label: 'Khá' },
  { value: 80, label: 'Nâng cao' },
];

export const RATE_PRESETS: ThresholdPreset[] = [
  { value: 50, label: 'Cơ bản' },
  { value: 60, label: 'Tiêu chuẩn' },
  { value: 70, label: 'Khá' },
  { value: 80, label: 'Chuẩn gợi ý', isRecommended: true },
  { value: 90, label: 'Nâng cao' },
];

interface ThresholdDropdownInputProps {
  value: number;
  onChange: (val: number) => void;
  unit: 'đ' | '%';
  presets: ThresholdPreset[];
  min?: number;
  max?: number;
  size?: 'normal' | 'large';
  title?: string;
}

/**
 * Ô nhập tham số ngưỡng (điểm đỗ / tỷ lệ bài giảng) tích hợp nút thả xuống
 * để chọn nhanh 4-5 mốc chuẩn hoặc tự do gõ số tùy biến.
 */
export const ThresholdDropdownInput: React.FC<ThresholdDropdownInputProps> = ({
  value,
  onChange,
  unit,
  presets,
  min = 50,
  max = 100,
  size = 'normal',
  title = 'Chọn nhanh mốc chuẩn',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(spaceBelow < 190);
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(0);
      return;
    }
    const num = Number(raw);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  const handleSelectPreset = (presetVal: number) => {
    onChange(presetVal);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`threshold-dropdown-input-wrapper ${size === 'large' ? 'size-large' : ''}`}
    >
      <div className="threshold-input-box">
        <input
          type="number"
          min={min}
          max={max}
          value={value === 0 ? '' : value}
          onChange={handleInputChange}
          className="threshold-raw-input"
          placeholder="--"
        />
        <span className="threshold-unit-label">{unit}</span>

        <div className="threshold-input-divider" />

        <button
          type="button"
          className={`threshold-toggle-btn ${isOpen ? 'active' : ''}`}
          onClick={toggleDropdown}
          title={title}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <ChevronDown
            size={11}
            strokeWidth={2.2}
            className={`threshold-chevron ${isOpen ? 'rotate' : ''}`}
          />
        </button>
      </div>

      {isOpen && (
        <div
          className={`threshold-preset-popover ${openUpward ? 'drop-up' : 'drop-down'}`}
          role="listbox"
        >
          <div className="threshold-popover-header">Mốc gợi ý chuẩn</div>
          <div className="threshold-preset-list">
            {presets.map((p) => {
              const isSelected = value === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  className={`threshold-preset-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectPreset(p.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="preset-item-val">
                    <span className="preset-num">{p.value}</span>
                    <span className="preset-unit">{unit}</span>
                  </div>

                  <div className="preset-item-info">
                    <span className="preset-label">{p.label}</span>
                    {p.isRecommended && (
                      <span className="preset-badge-star">Khuyên dùng</span>
                    )}
                  </div>

                  {isSelected && (
                    <Check size={14} className="preset-check-icon" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

