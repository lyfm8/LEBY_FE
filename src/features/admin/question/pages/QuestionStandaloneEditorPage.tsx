import React from 'react';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStandaloneQuestionEditor } from '../hooks/useStandaloneQuestionEditor';
import { AbilityPicker } from '../components/editor/AbilityPicker';
import { ExplanationEditor } from '../components/editor/ExplanationEditor';
import { OptionsEditor } from '../components/editor/OptionsEditor';
import { MediaUploader } from '../components/media/MediaUploader';
import { ToeicQuestionPreview } from '../components/preview/ToeicQuestionPreview';
import '../admin-question.css';

/**
 * Presentational Page Component: Biên soạn / Chỉnh sửa câu hỏi đơn (Part 1, 2, 5).
 * Toàn bộ logic (state form, validation, API submission, preview) được quản lý bởi useStandaloneQuestionEditor.
 */
export const QuestionStandaloneEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    isEditMode,
    name,
    setName,
    partId,
    setPartId,
    abilityIds,
    setAbilityIds,
    difficulty,
    setDifficulty,
    text,
    setText,
    options,
    setOptions,
    correctKey,
    setCorrectKey,
    explanation,
    setExplanation,
    medias,
    setMedias,
    descriptions,
    setDescriptions,
    isLoadingInitial,
    isSaving,
    formError,
    showPreview,
    setShowPreview,
    parts,
    abilities,
    selectedPart,
    isLoadingParts,
    isLoadingAbilities,
    hasValidName,
    hasValidOptions,
    isReadyToSubmit,
    handleSubmit,
  } = useStandaloneQuestionEditor(id);

  if (isLoadingInitial) {
    return (
      <div className="question-empty-card">
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#ea580c' }} />
        <h3 className="empty-title">Đang tải dữ liệu câu hỏi...</h3>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="admin-editor-page">
      {/* Top Navigation Bar */}
      <div className="editor-top-nav">
        <div className="editor-title-group">
          <button
            type="button"
            onClick={() => navigate('/admin/questions')}
            className="btn-back-circle"
            title="Quay lại ngân hàng câu hỏi"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="editor-heading">
              {isEditMode ? `Chỉnh sửa câu hỏi đơn (Q-${id})` : 'Tạo câu hỏi đơn mới'}
            </h1>
            <p className="editor-subheading">
              Biên soạn câu hỏi độc lập (Part 1, 2, 5) kèm nội dung, đáp án và media riêng.
            </p>
          </div>
        </div>

        <div>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{showPreview ? 'Ẩn xem trước' : 'Xem trước bài thi'}</span>
          </button>
        </div>
      </div>

      {/* Thông báo lỗi validation */}
      {formError && (
        <div className="admin-alert-banner error">
          <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{formError}</span>
        </div>
      )}

      {/* Khung xem trước TOEIC Simulation nếu được bật */}
      {showPreview && (
        <div style={{ marginBottom: '1.5rem' }}>
          <ToeicQuestionPreview
            question={{
              name,
              partName: selectedPart?.name,
              section: selectedPart?.sections,
              text,
              options,
              correctKey,
              medias,
              isGroup: false,
            }}
          />
        </div>
      )}

      {/* Layout 2 cột: Nội dung chính & Thuộc tính Sidebar */}
      <div className="editor-layout-grid">
        {/* CỘT TRÁI: Nội dung câu hỏi, Đáp án, Media, Lời giải */}
        <div className="editor-col-main">
          {/* 1. Nội dung đề bài */}
          <div className="editor-card">
            <div className="editor-card-header">
              <h3 className="editor-card-title">Nội dung câu hỏi / Đề bài</h3>
            </div>
            <div className="editor-card-body">
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
                Với câu hỏi Part 1 hoặc Part 2 chỉ nghe audio, bạn có thể để trống hoặc ghi hướng dẫn ngắn.
              </p>
              <textarea
                className="form-textarea"
                style={{ minHeight: '90px' }}
                placeholder="Ví dụ: When will the delivery arrive? hoặc The manager _____ the new budget."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          </div>

          {/* 2. Phương án trả lời và đáp án đúng */}
          <div className="editor-card">
            <div className="editor-card-header">
              <h3 className="editor-card-title">Đáp án</h3>
            </div>
            <div className="editor-card-body">
              <OptionsEditor
                options={options}
                correctKey={correctKey}
                onOptionsChange={setOptions}
                onCorrectKeyChange={setCorrectKey}
                allow3Options={true}
              />
            </div>
          </div>

          {/* 3. Tệp đa phương tiện Media riêng */}
          <div className="editor-card">
            <div className="editor-card-header">
              <h3 className="editor-card-title">Media riêng</h3>
            </div>
            <div className="editor-card-body">
              <MediaUploader
                medias={medias}
                onChange={setMedias}
                maxFiles={3}
                allowedKinds={
                  selectedPart?.sections === 'READING'
                    ? ['IMAGE', 'VIDEO']
                    : ['AUDIO', 'IMAGE', 'VIDEO']
                }
                label="Tệp âm thanh / hình ảnh"
                hint={
                  selectedPart?.sections === 'LISTENING'
                    ? 'Part 1, 2 bắt buộc có tệp âm thanh (Audio MP3/WAV). Part 1 có thể kèm ảnh minh họa.'
                    : 'Phần Reading chỉ đính kèm hình ảnh minh họa (nếu có).'
                }
              />
            </div>
          </div>

          {/* 4. Giải thích chi tiết đáp án */}
          <div className="editor-card">
            <div className="editor-card-body" style={{ padding: '0.75rem' }}>
              <ExplanationEditor explanation={explanation} onChange={setExplanation} />
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Thuộc tính câu hỏi & Metadata */}
        <div className="editor-col-sidebar">
          <div className="editor-card">
            <div className="editor-card-header">
              <h3 className="editor-card-title">Thông tin câu hỏi</h3>
            </div>
            <div className="editor-card-body">
              {/* Tên câu hỏi */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Mã gợi nhớ câu hỏi <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: Q-0248 Delivery time"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Phần thi (Part) */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Phần thi (Part) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  className="form-select"
                  value={partId || ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined;
                    setPartId(val);
                    setAbilityIds([]);
                    // Gợi ý mặc định 3 đáp án khi chọn Part 2, vẫn cho phép người dùng đổi 3 hoặc 4 đáp án
                    const pickedPart = parts.find((p) => p.id === val);
                    if (pickedPart?.name?.toLowerCase().includes('part 2') && options.length > 3) {
                      setOptions(options.slice(0, 3));
                      if (correctKey.toUpperCase() === 'D') setCorrectKey('A');
                    }
                  }}
                  disabled={isLoadingParts}
                  required
                >
                  <option value="">-- Chọn Phần thi --</option>
                  {parts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sections})
                    </option>
                  ))}
                </select>
                {selectedPart && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ea580c', marginTop: '0.25rem' }}>
                    Kỹ năng: {selectedPart.sections}
                  </span>
                )}
              </div>

              {/* Kỹ năng (Ability) */}
              <AbilityPicker
                abilities={abilities}
                selectedIds={abilityIds}
                onChange={setAbilityIds}
                isLoading={isLoadingAbilities}
              />

              {/* Mức độ khó */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Độ khó: <span style={{ color: '#ea580c', fontWeight: 700 }}>{difficulty}/5</span>
                </label>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      style={{
                        flex: 1,
                        padding: '0.5rem 0',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        borderRadius: '0.375rem',
                        border: difficulty === lvl ? '1px solid #ea580c' : '1px solid #d1d5db',
                        backgroundColor: difficulty === lvl ? '#ea580c' : '#ffffff',
                        color: difficulty === lvl ? '#ffffff' : '#374151',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onClick={() => setDifficulty(lvl)}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ghi chú nội bộ */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Ghi chú nội bộ
                </label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '60px' }}
                  placeholder="Ghi chú dành riêng cho giáo viên..."
                  value={descriptions}
                  onChange={(e) => setDescriptions(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Pre-flight Checklist Card */}
          <div className="editor-card">
            <div className="editor-card-header">
              <h3 className="editor-card-title">Kiểm tra trước khi lưu</h3>
            </div>
            <div className="editor-card-body">
              <div className="preflight-list">
                <div className={`preflight-check-item ${hasValidName ? 'passed' : ''}`}>
                  <CheckCircle2 size={16} color={hasValidName ? '#15803d' : '#9ca3af'} />
                  <span>Đã có mã / tên gợi nhớ câu hỏi</span>
                </div>
                <div className={`preflight-check-item ${partId ? 'passed' : ''}`}>
                  <CheckCircle2 size={16} color={partId ? '#15803d' : '#9ca3af'} />
                  <span>Đã chọn Phần thi (Part)</span>
                </div>
                <div className={`preflight-check-item ${abilityIds.length > 0 ? 'passed' : ''}`}>
                  <CheckCircle2 size={16} color={abilityIds.length > 0 ? '#15803d' : '#9ca3af'} />
                  <span>Đã chọn ít nhất 1 kỹ năng đánh giá</span>
                </div>
                <div className={`preflight-check-item ${hasValidOptions ? 'passed' : ''}`}>
                  <CheckCircle2 size={16} color={hasValidOptions ? '#15803d' : '#9ca3af'} />
                  <span>Đủ các phương án trả lời & 1 đáp án đúng</span>
                </div>
              </div>

              <div className={`preflight-banner ${isReadyToSubmit ? 'ready' : 'pending'}`}>
                {isReadyToSubmit ? '✓ Sẵn sàng lưu vào ngân hàng' : '⚠ Còn một số trường chưa hoàn tất'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thanh hành động dưới chân */}
      <div className="editor-footer-bar">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate('/admin/questions')}
          disabled={isSaving}
        >
          Hủy bỏ
        </button>

        <button
          type="submit"
          className="btn-primary"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>{isEditMode ? 'Cập nhật câu hỏi' : 'Lưu câu hỏi đơn'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
