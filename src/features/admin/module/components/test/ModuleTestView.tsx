import React, { useState, useMemo } from 'react';
import type { AbilityResponse, PartResponse } from '@/features/admin/part/types';
import { useModuleTestConfig } from '../../hooks/useModuleTestConfig';
import { QuestionBankPickerModal } from '../editor/QuestionBankPickerModal';
import { QuickCreateQuestionModal } from '../editor/QuickCreateQuestionModal';
import { ModuleTestQuestionList } from './ModuleTestQuestionList';
import { AbilityMismatchConfirmModal } from './AbilityMismatchConfirmModal';
import {
  Award,
  ArrowLeft,
  Save,
  Clock,
  Hash,
  Shuffle,
  AlertTriangle,
  Info,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

/**
 * Props đầu vào cho màn hình cấu hình chi tiết Bài thi vượt ải mô-đun.
 * Dùng chung cho cả trang Quản lý Mô-đun và trang tổng quan Bài thi vượt ải.
 */
interface ModuleTestViewProps {
  // ID của mô-đun cần cấu hình bài thi vượt ải
  moduleId: number;
  // Tiêu đề mô-đun hiển thị ngay trong lúc chờ tải API
  moduleTitle: string;
  // Điểm đỗ mặc định (hiển thị tham chiếu nhanh)
  passScore?: number;
  // Tỷ lệ hoàn thành bài giảng tối thiểu để mở bài thi
  requiredCompletionRate?: number;
  // Danh sách toàn bộ Part dùng cho bộ lọc Modal Ngân hàng câu hỏi
  parts?: PartResponse[];
  // Danh sách toàn bộ Ability dùng cho Modal Ngân hàng câu hỏi & Modal Tạo nhanh
  abilities?: AbilityResponse[];
  // Callback quay lại màn hình trước đó
  onBack: () => void;
  // Callback mở nhanh màn hình cấu hình ngưỡng điểm đỗ (tùy chọn)
  onOpenThresholds?: () => void;
  // Callback thông báo cho trang cha làm mới danh sách sau khi lưu thành công
  onSaved?: () => void;
}

/**
 * Màn hình cấu hình đầy đủ cho Bài thi vượt ải của một mô-đun:
 * thiết lập số lượng câu hỏi, thời gian làm bài, bật/tắt xáo trộn, chọn chế độ thủ công hoặc sinh ngẫu nhiên,
 * và gán/tạo nhanh câu hỏi từ Ngân hàng câu hỏi.
 */
export const ModuleTestView: React.FC<ModuleTestViewProps> = ({
  moduleId,
  moduleTitle,
  passScore,
  requiredCompletionRate,
  parts = [],
  abilities = [],
  onBack,
  onOpenThresholds,
  onSaved,
}) => {
  // Gọi custom hook quản lý toàn bộ trạng thái tải, chỉnh sửa và lưu cấu hình bài thi vượt ải
  const {
    config,
    isLoading,
    loadError,
    durationMinutes,
    questionCount,
    shuffleQuestions,
    selectionMode,
    questions,
    fieldErrors,
    isDirty,
    isSaving,
    isAutoSelecting,
    isMismatchModalOpen,
    existingQuestionIds,
    mismatchCount,
    refetch,
    handleDurationChange,
    handleQuestionCountChange,
    handleShuffleChange,
    handleSelectionModeChange,
    handleAppendFromPicker,
    handleMoveQuestion,
    handleRemoveQuestion,
    handleAutoSelect,
    handleSave,
    handleConfirmMismatchSave,
    closeMismatchModal,
  } = useModuleTestConfig(moduleId, onSaved);

  // State bật/tắt Modal chọn câu hỏi từ Ngân hàng câu hỏi (tái sử dụng từ A05)
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  // State bật/tắt Modal tạo nhanh câu hỏi đúng Part/Ability của mô-đun (tái sử dụng từ A05)
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState<boolean>(false);

  // Lọc danh sách Ability theo đúng phạm vi của mô-đun (tuân thủ quy tắc phân cấp Ability)
  const scopedAbilities = useMemo(() => {
    const modAbilityIds = config?.abilityIds ?? [];
    if (modAbilityIds.length > 0) {
      // Ưu tiên lọc đúng các Ability mà mô-đun đang phụ trách đào tạo
      return abilities.filter((ab) => modAbilityIds.includes(ab.id));
    }
    if (config?.partId) {
      // Fallback theo Part của mô-đun nếu mô-đun chưa cấu hình Ability riêng
      return abilities.filter((ab) => ab.partId === config.partId);
    }
    return abilities;
  }, [abilities, config?.abilityIds, config?.partId]);

  // Lấy giá trị hiển thị ưu tiên từ dữ liệu Backend mới nhất, fallback sang props ban đầu
  const displayTitle = config?.moduleTitle || moduleTitle;
  const displayPassScore = config?.defaultPassScore ?? passScore ?? 65;
  const displayCompletionRate = config?.requiredCompletionRate ?? requiredCompletionRate ?? 80;
  const availableBankCount = config?.availableAbilityQuestionCount ?? 0;

  return (
    <div className="editor-pane-container">
      {/* Thanh tiêu đề trên cùng kèm nút Quay lại và nút Lưu cấu hình */}
      <div className="editor-pane-header">
        <div className="editor-header-left">
          <div className="badge-type-pill text-orange">
            <Award size={15} />
            <span>Bài thi vượt ải mô-đun</span>
          </div>
          <h1 className="editor-main-title">{displayTitle}</h1>
        </div>

        <div className="editor-header-right">
          <button type="button" className="btn-secondary" onClick={onBack} disabled={isSaving}>
            <ArrowLeft size={15} />
            <span>Quay lại</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={isLoading || isSaving || !!loadError}
          >
            {isSaving ? (
              <>
                <Loader2 size={15} className="spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>{isDirty ? 'Lưu cấu hình*' : 'Lưu cấu hình'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Thân màn hình cấu hình: xử lý đầy đủ trạng thái Loading, Error và Success */}
      <div className="editor-pane-body">
        {/* Trạng thái 1: Skeleton đang tải chi tiết cấu hình */}
        {isLoading && (
          <div className="editor-form-grid">
            <div className="editor-card">
              <div className="pq-skeleton-list">
                <div className="pq-skeleton-row" />
                <div className="pq-skeleton-row" />
                <div className="pq-skeleton-row" />
              </div>
            </div>
          </div>
        )}

        {/* Trạng thái 2: Báo lỗi tải dữ liệu kèm nút Thử lại */}
        {!isLoading && loadError && (
          <div className="editor-card pq-state-box pq-state-error">
            <AlertTriangle size={28} />
            <p>{loadError}</p>
            <button type="button" className="btn-secondary" onClick={() => void refetch()}>
              <RefreshCw size={14} />
              <span>Thử lại</span>
            </button>
          </div>
        )}

        {/* Trạng thái 3: Nội dung cấu hình đầy đủ */}
        {!isLoading && !loadError && config && (
          <div className="editor-form-grid">
            {/* Cảnh báo khi mô-đun chưa có bài giảng lý thuyết nào */}
            {config.hasNoLessonsWarning && (
              <div className="mt-banner-warning">
                <AlertTriangle size={18} className="mt-banner-icon" />
                <div>
                  <strong>Mô-đun chưa có bài giảng lý thuyết</strong>
                  <p>
                    Mô-đun này hiện chưa có bài giảng lý thuyết. Bạn nên bổ sung bài giảng trước khi
                    xuất bản bài thi vượt ải.
                  </p>
                </div>
              </div>
            )}

            {/* Thẻ 1: Tham số đề thi (Số câu, Thời gian, Xáo trộn, Phương thức sinh đề) */}
            <div className="editor-card">
              <div className="card-header-row">
                <Sliders size={16} className="text-orange" />
                <h3 className="card-section-title">Tham số đề thi vượt ải</h3>
              </div>

              {/* Lưới 2 cột nhập Số lượng câu hỏi và Thời gian làm bài */}
              <div className="mt-params-grid">
                {/* Ô nhập Số lượng câu hỏi */}
                <div className="form-group">
                  <label htmlFor="mt-question-count" className="form-label">
                    <Hash size={14} />
                    <span>Số lượng câu hỏi trong đề</span>
                  </label>
                  <input
                    id="mt-question-count"
                    type="number"
                    min={1}
                    max={100}
                    className={`form-input ${fieldErrors.questionCount ? 'input-error' : ''}`}
                    value={Number.isNaN(questionCount) ? '' : questionCount}
                    onChange={(e) => handleQuestionCountChange(Number(e.target.value))}
                  />
                  <span className="mt-field-helper">
                    Khuyến nghị từ 10 đến 40 câu (giá trị mẫu: 25 câu).
                  </span>
                  {fieldErrors.questionCount && (
                    <span className="mt-field-error">{fieldErrors.questionCount}</span>
                  )}
                </div>

                {/* Ô nhập Thời gian làm bài */}
                <div className="form-group">
                  <label htmlFor="mt-duration-minutes" className="form-label">
                    <Clock size={14} />
                    <span>Thời gian làm bài (phút)</span>
                  </label>
                  <input
                    id="mt-duration-minutes"
                    type="number"
                    min={1}
                    max={180}
                    className={`form-input ${fieldErrors.durationMinutes ? 'input-error' : ''}`}
                    value={Number.isNaN(durationMinutes) ? '' : durationMinutes}
                    onChange={(e) => handleDurationChange(Number(e.target.value))}
                  />
                  <span className="mt-field-helper">
                    Hệ thống tự động thu bài khi hết giờ (giá trị mẫu: 25 phút).
                  </span>
                  {fieldErrors.durationMinutes && (
                    <span className="mt-field-error">{fieldErrors.durationMinutes}</span>
                  )}
                </div>
              </div>

              {/* Khối bật/tắt tự động xáo trộn câu hỏi và đáp án */}
              <label className="mt-toggle-box" htmlFor="mt-shuffle-toggle">
                <div className="mt-toggle-info">
                  <Shuffle size={16} className="text-orange" />
                  <div>
                    <div className="mt-toggle-title">
                      Tự động xáo trộn câu hỏi và đáp án mỗi lần thi
                    </div>
                    <div className="mt-toggle-desc">
                      Giúp học viên thi lại không giới hạn số lần mà không học vẹt vị trí đáp án.
                    </div>
                  </div>
                </div>
                <input
                  id="mt-shuffle-toggle"
                  type="checkbox"
                  className="mt-toggle-checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => handleShuffleChange(e.target.checked)}
                />
              </label>

              {/* Khối chọn phương thức thiết lập bộ câu hỏi: Thủ công vs Sinh ngẫu nhiên */}
              <div className="mt-mode-group">
                <span className="form-label">Phương thức thiết lập bộ câu hỏi</span>
                <div className="mt-mode-cards">
                  <button
                    type="button"
                    className={`mt-mode-card ${selectionMode === 'MANUAL' ? 'active' : ''}`}
                    onClick={() => handleSelectionModeChange('MANUAL')}
                  >
                    <div className="mt-mode-card-title">
                      <CheckCircle2 size={15} />
                      <span>Chọn thủ công từ Ngân hàng câu hỏi</span>
                    </div>
                    <p className="mt-mode-card-desc">
                      Giáo viên chủ động chọn, sắp xếp và kiểm duyệt từng câu hỏi đưa vào đề thi.
                    </p>
                  </button>

                  <button
                    type="button"
                    className={`mt-mode-card ${selectionMode === 'RANDOM_BY_ABILITY' ? 'active' : ''}`}
                    onClick={() => handleSelectionModeChange('RANDOM_BY_ABILITY')}
                  >
                    <div className="mt-mode-card-title">
                      <Shuffle size={15} />
                      <span>Sinh đề ngẫu nhiên từ kho năng lực</span>
                    </div>
                    <p className="mt-mode-card-desc">
                      Hệ thống tự động bốc ngẫu nhiên {questionCount || 0} câu từ kho năng lực của
                      mô-đun mỗi khi học viên bắt đầu thi.
                    </p>
                  </button>
                </div>
              </div>

              {/* Thông số liên kết nhanh: Điểm đỗ, Điều kiện mở khóa, Năng lực phụ trách */}
              <div className="mt-meta-summary-row">
                <div className="mt-meta-chip">
                  <span>Điểm đỗ mặc định:</span>
                  <strong>{displayPassScore}/100</strong>
                </div>
                <div className="mt-meta-chip">
                  <span>Hoàn thành bài giảng tối thiểu:</span>
                  <strong>{displayCompletionRate}%</strong>
                </div>
                <div className="mt-meta-chip">
                  <span>Kho câu hỏi đúng năng lực:</span>
                  <strong className={availableBankCount < questionCount ? 'text-danger' : 'text-success'}>
                    {availableBankCount} câu
                  </strong>
                </div>
                {onOpenThresholds && (
                  <button type="button" className="btn-inline-link" onClick={onOpenThresholds}>
                    Điều chỉnh ngưỡng đỗ
                  </button>
                )}
              </div>
            </div>

            {/* Thẻ 2: Hiển thị danh sách câu hỏi (chế độ Thủ công) hoặc thẻ tóm tắt kho (chế độ Ngẫu nhiên) */}
            {selectionMode === 'MANUAL' ? (
              <ModuleTestQuestionList
                questions={questions}
                targetQuestionCount={questionCount}
                availableAbilityQuestionCount={availableBankCount}
                mismatchCount={mismatchCount}
                errorMessage={fieldErrors.questions}
                isAutoSelecting={isAutoSelecting}
                onOpenBankPicker={() => setIsPickerOpen(true)}
                onOpenQuickCreate={() => setIsQuickCreateOpen(true)}
                onAutoSelect={() => void handleAutoSelect()}
                onMoveQuestion={handleMoveQuestion}
                onRemoveQuestion={handleRemoveQuestion}
              />
            ) : (
              <div className="editor-card mt-random-summary-card">
                <div className="card-header-row">
                  <Info size={16} className="text-blue" />
                  <h3 className="card-section-title">Cơ chế sinh đề ngẫu nhiên theo năng lực</h3>
                </div>
                <p className="mt-random-desc">
                  Mỗi khi học viên vào làm bài thi vượt ải, hệ thống sẽ tự động lấy ngẫu nhiên{' '}
                  <strong>{questionCount} câu hỏi</strong> thuộc các năng lực mục tiêu của mô-đun
                  này:
                </p>

                {/* Danh sách các Ability của mô-đun */}
                <div className="pq-meta-tags">
                  {config.abilityNames.length > 0 ? (
                    config.abilityNames.map((name) => (
                      <span key={name} className="pq-meta-pill pq-meta-ability">
                        {name}
                      </span>
                    ))
                  ) : (
                    <span className="pq-meta-pill">
                      Lấy theo toàn bộ {config.partName || 'Part của mô-đun'}
                    </span>
                  )}
                </div>

                {/* Cảnh báo ngay nếu kho hiện tại chưa đủ số câu yêu cầu */}
                {availableBankCount < questionCount && (
                  <div className="mt-inline-alert mt-inline-alert-error mt-4">
                    <AlertTriangle size={15} />
                    <span>
                      Ngân hàng câu hỏi thuộc năng lực này hiện chỉ có {availableBankCount} câu,
                      chưa đủ {questionCount} câu yêu cầu. Bạn có thể tạo thêm câu hỏi ngay bên
                      dưới.
                    </span>
                  </div>
                )}

                <div className="mt-random-actions">
                  <button
                    type="button"
                    className="btn-secondary compact"
                    onClick={() => setIsQuickCreateOpen(true)}
                  >
                    <span>+ Bổ sung câu hỏi mới vào kho</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal chọn câu hỏi từ Ngân hàng câu hỏi (tái sử dụng từ A05) */}
      <QuestionBankPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        defaultPartId={config?.partId ?? null}
        parts={parts}
        abilities={abilities}
        existingQuestionIds={existingQuestionIds}
        onConfirmSelect={handleAppendFromPicker}
        modalSubtitle="Tìm lọc theo Part, Năng lực hoặc Độ khó để thêm vào đề thi vượt ải."
        confirmLabel="Thêm vào đề vượt ải"
        targetAbilityNames={config?.abilityNames ?? []}
      />

      {/* Modal tạo nhanh câu hỏi mới (tái sử dụng từ A05, giữ chặt phân cấp Part -> Ability) */}
      <QuickCreateQuestionModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        partId={config?.partId ?? null}
        partName={config?.partName ?? null}
        section={config?.section ?? null}
        defaultAbilityId={config?.abilityIds?.[0] ?? null}
        scopedAbilities={scopedAbilities}
        onCreatedAndAttach={handleAppendFromPicker}
      />

      {/* Hộp thoại xác nhận sư phạm khi đề chứa câu hỏi lệch năng lực mô-đun */}
      <AbilityMismatchConfirmModal
        isOpen={isMismatchModalOpen}
        mismatchCount={mismatchCount}
        moduleAbilityNames={config?.abilityNames ?? []}
        isSaving={isSaving}
        onCancel={closeMismatchModal}
        onConfirm={handleConfirmMismatchSave}
      />
    </div>
  );
};
