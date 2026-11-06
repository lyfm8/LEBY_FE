import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { moduleFormSchema, type ModuleFormValues } from '../../utils/schema';
import type { ModuleResponse, CreateModuleRequest } from '../../types';
import { adminModuleService } from '../../services/adminModuleService';
import type { PartResponse, AbilityResponse } from '@/features/admin/part/types';
import {
  Save,
  RotateCcw,
  Sliders,
  Layers,
  BookOpen,
  Info,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

const DEFAULT_TOEIC_PARTS: PartResponse[] = [
  { id: 1, name: 'Part 1: Photographs', sections: 'LISTENING' },
  { id: 2, name: 'Part 2: Question-Response', sections: 'LISTENING' },
  { id: 3, name: 'Part 3: Conversations', sections: 'LISTENING' },
  { id: 4, name: 'Part 4: Talks', sections: 'LISTENING' },
  { id: 5, name: 'Part 5: Incomplete Sentences', sections: 'READING' },
  { id: 6, name: 'Part 6: Text Completion', sections: 'READING' },
  { id: 7, name: 'Part 7: Reading Comprehension', sections: 'READING' },
];

interface ModuleEditorViewProps {
  moduleId?: number; // Nếu có là edit, không có là create
  existingModule?: ModuleResponse | null;
  parts?: PartResponse[];
  onSave: (data: CreateModuleRequest, isEdit: boolean, id?: number) => Promise<void>;
  onCancel: () => void;
  onDelete?: (id: number) => void;
  isSubmitting: boolean;
}

export const ModuleEditorView: React.FC<ModuleEditorViewProps> = ({
  moduleId,
  existingModule,
  parts: partsProp,
  onSave,
  onCancel,
  onDelete,
  isSubmitting,
}) => {
  const isEdit = !!moduleId && !!existingModule;

  const [parts, setParts] = useState<PartResponse[]>(
    partsProp && partsProp.length > 0 ? partsProp : DEFAULT_TOEIC_PARTS
  );
  const [abilities, setAbilities] = useState<AbilityResponse[]>([]);
  const [selectedAbilityIds, setSelectedAbilityIds] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: '',
      type: 'THEORY',
      sequence: 1,
      status: 'DRAFT',
      defaultPassScore: 65,
      requiredCompletionRate: 80,
      descriptions: '',
      partId: null,
      abilityIds: [],
    },
  });

  const selectedPartId = watch('partId');
  const passScoreValue = watch('defaultPassScore');
  const completionRateValue = watch('requiredCompletionRate');

  // Đồng bộ khi partsProp từ cha thay đổi
  useEffect(() => {
    if (partsProp && partsProp.length > 0) {
      setParts(partsProp);
    }
  }, [partsProp]);

  // Luôn thử tải danh sách Parts mới nhất từ API /api/admin/parts
  useEffect(() => {
    adminModuleService
      .getParts()
      .then((res: any) => {
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];
        if (list.length > 0) {
          setParts(list);
        }
      })
      .catch((err) => {
        console.warn('Không thể nạp Parts từ API, dùng fallback danh sách chuẩn:', err);
      });
  }, []);

  // Tải Abilities theo Part được chọn
  useEffect(() => {
    if (selectedPartId) {
      adminModuleService
        .getAbilities(Number(selectedPartId))
        .then((res: any) => {
          const list = Array.isArray(res)
            ? res
            : Array.isArray(res?.data)
            ? res.data
            : [];
          setAbilities(list);
        })
        .catch((err) => {
          console.warn('Lỗi tải Năng lực theo Part:', err);
          setAbilities([]);
        });
    } else {
      setAbilities([]);
    }
  }, [selectedPartId]);

  // Nạp dữ liệu khi edit hoặc reset khi tạo mới
  useEffect(() => {
    if (isEdit && existingModule) {
      const abilityIds = existingModule.abilityIds || [];
      setSelectedAbilityIds(abilityIds);
      reset({
        title: existingModule.title,
        type: existingModule.type,
        sequence: existingModule.sequence,
        status: existingModule.status,
        defaultPassScore: existingModule.defaultPassScore ?? 65,
        requiredCompletionRate: existingModule.requiredCompletionRate ?? 80,
        descriptions: existingModule.descriptions || '',
        partId: existingModule.partId,
        abilityIds,
      });
    } else {
      setSelectedAbilityIds([]);
      reset({
        title: '',
        type: 'THEORY',
        sequence: 1,
        status: 'DRAFT',
        defaultPassScore: 65,
        requiredCompletionRate: 80,
        descriptions: '',
        partId: null,
        abilityIds: [],
      });
    }
  }, [isEdit, existingModule, reset]);

  const toggleAbility = (id: number) => {
    const updated = selectedAbilityIds.includes(id)
      ? selectedAbilityIds.filter((item) => item !== id)
      : [...selectedAbilityIds, id];
    setSelectedAbilityIds(updated);
    setValue('abilityIds', updated, { shouldDirty: true });
  };

  const handleFormSubmit = async (values: ModuleFormValues) => {
    const payload: CreateModuleRequest = {
      title: values.title.trim(),
      type: values.type,
      sequence: values.sequence,
      status: values.status,
      defaultPassScore: values.defaultPassScore,
      requiredCompletionRate: values.requiredCompletionRate,
      descriptions: values.descriptions || '',
      partId: values.partId || null,
      abilityIds: selectedAbilityIds,
    };
    await onSave(payload, isEdit, moduleId);
  };

  return (
    <div className="editor-pane-container">
      {/* 1. Header Toolbar */}
      <div className="editor-pane-header">
        <div className="editor-header-left">
          <div className="badge-type-pill">
            <Layers size={15} />
            <span>{isEdit ? 'Chỉnh sửa Module' : 'Tạo Module Mới'}</span>
          </div>
          <h1 className="editor-main-title">
            {isEdit ? existingModule?.title : 'Thiết lập Thông tin Mô-đun Học tập'}
          </h1>
        </div>

        <div className="editor-header-right">
          {isEdit && onDelete && (
            <button
              type="button"
              className="btn-danger-outline"
              onClick={() => onDelete(moduleId)}
              title="Xóa Module"
            >
              <Trash2 size={15} />
              <span>Xóa Module</span>
            </button>
          )}

          <button type="button" className="btn-secondary" onClick={onCancel}>
            <RotateCcw size={15} />
            <span>Hủy</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleSubmit(handleFormSubmit)}
            disabled={isSubmitting}
          >
            <Save size={15} />
            <span>{isSubmitting ? 'Đang lưu...' : 'Lưu Module'}</span>
          </button>
        </div>
      </div>

      {/* 2. Form Content */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="editor-pane-body">
        <div className="editor-form-grid">
          {/* Card 1: Thông tin cơ bản */}
          <div className="editor-card">
            <div className="card-header-row">
              <BookOpen size={16} className="text-orange" />
              <h3 className="card-section-title">Thông tin chung</h3>
            </div>

            <div className="form-group">
              <label className="form-label">
                Tên Module <span className="text-red">*</span>
              </label>
              <input
                {...register('title')}
                type="text"
                className="form-input"
                placeholder="VD: TOEIC Part 1 - Tổng quan & Kỹ năng cốt lõi"
              />
              {errors.title && <p className="form-error">{errors.title.message}</p>}
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Loại Module</label>
                <select {...register('type')} className="form-input">
                  <option value="THEORY">Lý thuyết (Theory)</option>
                  <option value="PRACTICE">Luyện tập (Practice)</option>
                  <option value="EXAM">Đề thi (Exam)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Thứ tự hiển thị (Sư phạm) <span className="text-red">*</span>
                </label>
                <input
                  {...register('sequence', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className="form-input"
                />
                {errors.sequence && <p className="form-error">{errors.sequence.message}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Trạng thái xuất bản</label>
              <div className="radio-pill-group">
                <label
                  className={`radio-pill ${watch('status') === 'DRAFT' ? 'selected' : ''}`}
                >
                  <input type="radio" value="DRAFT" {...register('status')} />
                  <span>Bản nháp (Draft)</span>
                </label>
                <label
                  className={`radio-pill ${
                    watch('status') === 'PUBLISHED' ? 'selected' : ''
                  }`}
                >
                  <input type="radio" value="PUBLISHED" {...register('status')} />
                  <span>Đã xuất bản (Published)</span>
                </label>
                <label
                  className={`radio-pill ${
                    watch('status') === 'ARCHIVED' ? 'selected' : ''
                  }`}
                >
                  <input type="radio" value="ARCHIVED" {...register('status')} />
                  <span>Tạm ẩn (Archived)</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mô tả mục tiêu bài học</label>
              <textarea
                {...register('descriptions')}
                rows={3}
                className="form-input textarea"
                placeholder="Cung cấp mục tiêu rèn luyện và chuẩn kiến thức cần đạt..."
              />
            </div>
          </div>

          {/* Card 2: Part & Năng lực (Ability) */}
          <div className="editor-card">
            <div className="card-header-row">
              <Layers size={16} className="text-orange" />
              <h3 className="card-section-title">Phần thi & Năng lực mục tiêu</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Phần thi TOEIC (Part)</label>
              <select
                {...register('partId', {
                  setValueAs: (v) => (v === '' ? null : Number(v)),
                })}
                className="form-input"
              >
                <option value="">-- Chọn Part tương ứng --</option>
                {parts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sections})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Năng lực rèn luyện (Ability)
                <span className="label-hint"> (Có thể chọn nhiều năng lực)</span>
              </label>

              {abilities.length > 0 ? (
                <div className="abilities-chip-grid">
                  {abilities.map((ab) => {
                    const isSelected = selectedAbilityIds.includes(ab.id);
                    return (
                      <button
                        key={ab.id}
                        type="button"
                        onClick={() => toggleAbility(ab.id)}
                        className={`ability-chip ${isSelected ? 'selected' : ''}`}
                      >
                        {isSelected && <CheckCircle2 size={13} />}
                        <span>{ab.name}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted text-sm italic">
                  {selectedPartId
                    ? 'Part này hiện chưa có danh mục Năng lực.'
                    : 'Vui lòng chọn Part ở trên để hiển thị danh sách Năng lực.'}
                </p>
              )}
            </div>
          </div>

          {/* Card 3: Tham số nghiệp vụ động */}
          <div className="editor-card full-width">
            <div className="card-header-row">
              <Sliders size={16} className="text-orange" />
              <h3 className="card-section-title">
                Tham số nghiệp vụ động (Cho phép tùy chỉnh 100%)
              </h3>
            </div>

            <div className="form-row-2 thresholds-row">
              {/* Điểm đỗ */}
              <div className="threshold-box">
                <div className="threshold-header">
                  <label className="form-label font-bold">
                    1. Điểm đỗ mặc định bài thi vượt ải
                  </label>
                  <div className="threshold-value-display">
                    <input
                      type="number"
                      min="50"
                      max="100"
                      {...register('defaultPassScore', { valueAsNumber: true })}
                      className="threshold-number-input"
                    />
                    <span className="unit">/ 100 điểm</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="50"
                  max="100"
                  value={passScoreValue || 65}
                  onChange={(e) =>
                    setValue('defaultPassScore', Number(e.target.value), {
                      shouldDirty: true,
                    })
                  }
                  className="threshold-slider"
                />

                <div className="slider-ticks">
                  <span>50đ (Cơ bản)</span>
                  <span>65đ (Chuẩn gợi ý)</span>
                  <span>100đ (Tối đa)</span>
                </div>

                <div className="threshold-note">
                  <Info size={13} />
                  <span>
                    Điểm số tối thiểu học viên cần đạt ở bài thi cuối Module để được cấp
                    chứng nhận hoàn thành và mở khóa nội dung tiếp theo.
                  </span>
                </div>
                {errors.defaultPassScore && (
                  <p className="form-error">{errors.defaultPassScore.message}</p>
                )}
              </div>

              {/* Tỷ lệ hoàn thành bài học */}
              <div className="threshold-box">
                <div className="threshold-header">
                  <label className="form-label font-bold">
                    2. Tỷ lệ bài giảng hoàn thành tối thiểu
                  </label>
                  <div className="threshold-value-display">
                    <input
                      type="number"
                      min="50"
                      max="100"
                      {...register('requiredCompletionRate', { valueAsNumber: true })}
                      className="threshold-number-input"
                    />
                    <span className="unit">%</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="50"
                  max="100"
                  value={completionRateValue || 80}
                  onChange={(e) =>
                    setValue('requiredCompletionRate', Number(e.target.value), {
                      shouldDirty: true,
                    })
                  }
                  className="threshold-slider"
                />

                <div className="slider-ticks">
                  <span>50%</span>
                  <span>80% (Chuẩn gợi ý)</span>
                  <span>100%</span>
                </div>

                <div className="threshold-note">
                  <Info size={13} />
                  <span>
                    Học viên phải học và hoàn thành đủ tỷ lệ phần trăm số bài giảng lý
                    thuyết trong Module này mới được phép bắt đầu bài thi vượt ải.
                  </span>
                </div>
                {errors.requiredCompletionRate && (
                  <p className="form-error">
                    {errors.requiredCompletionRate.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
