import React from 'react';
import { TrendingUp, FileText, HelpCircle, Clock } from 'lucide-react';
import { DEFAULT_EXAM_CONFIGS } from '../../utils/matrixConstants';
import type { ExamTag, ExamType } from '../../types';

interface Step1Props {
  testType: ExamType;
  // Phân loại đề thi thử ETS (Luyện tập tự do vs Thi đầu ra)
  examTag: ExamTag;
  title: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  minDiagnosticQuestions?: number;
  onTypeChange: (type: ExamType) => void;
  // Callback cập nhật nhãn phân loại PRACTICE/OUTPUT khi admin chọn FULL_MOCK_TEST
  onExamTagChange: (tag: ExamTag) => void;
  onTitleChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onDurationChange: (val: number) => void;
  onTotalQuestionsChange: (val: number) => void;
  onCancel: () => void;
  onSaveDraft: () => void;
  onNext: () => void;
}

/**
 * Bước 1: Thiết lập thông tin cơ bản của bộ đề thi (khớp hoàn toàn với bản thảo demo Ảnh 2).
 */
export const Step1_ExamInfo: React.FC<Step1Props> = ({
  testType,
  examTag,
  title,
  description,
  durationMinutes,
  totalQuestions,
  minDiagnosticQuestions = DEFAULT_EXAM_CONFIGS.DIAGNOSTIC.totalQuestions,
  onTypeChange,
  onExamTagChange,
  onTitleChange,
  onDescriptionChange,
  onDurationChange,
  onTotalQuestionsChange,
  onCancel,
  onSaveDraft,
  onNext,
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
      {/* Cột chính bên trái: Form nhập liệu */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        {/* 01: Loại đề thi */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ color: '#F45B0B', fontWeight: 700, fontSize: '15px' }}>01</span>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Loại đề thi</span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0' }}>
          </p>

          <div className="radio-cards-grid">
            {/* Card 1: Đề chẩn đoán */}
            <div
              className={`exam-radio-card ${testType === 'DIAGNOSTIC' ? 'selected' : ''}`}
              onClick={() => onTypeChange('DIAGNOSTIC')}
            >
              <div className="radio-card-header">
                <div className="radio-card-title-wrap">
                  <TrendingUp size={20} className="text-orange-500" />
                  <span>Đề thi chẩn đoán</span>
                </div>
                <input
                  type="radio"
                  name="examType"
                  checked={testType === 'DIAGNOSTIC'}
                  onChange={() => onTypeChange('DIAGNOSTIC')}
                  style={{ accentColor: '#F45B0B', width: '18px', height: '18px' }}
                />
              </div>
              <p className="radio-card-desc">Đánh giá năng lực đầu vào của học viên.</p>
            </div>

            {/* Card 2: Đề thi thử */}
            <div
              className={`exam-radio-card ${testType === 'FULL_MOCK_TEST' ? 'selected' : ''}`}
              onClick={() => onTypeChange('FULL_MOCK_TEST')}
            >
              <div className="radio-card-header">
                <div className="radio-card-title-wrap">
                  <FileText size={20} className="text-orange-500" />
                  <span>Đề thi thử tổng hợp</span>
                </div>
                <input
                  type="radio"
                  name="examType"
                  checked={testType === 'FULL_MOCK_TEST'}
                  onChange={() => onTypeChange('FULL_MOCK_TEST')}
                  style={{ accentColor: '#F45B0B', width: '18px', height: '18px' }}
                />
              </div>
              <p className="radio-card-desc">Bài thi TOEIC tổng hợp theo cấu trúc ETS.</p>
            </div>
          </div>

          {/* Chọn mục đích sử dụng khi Admin tạo đề thi thử ETS 200 câu */}
          {testType === 'FULL_MOCK_TEST' && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #E2E8F0' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '10px' }}>
                Phân loại đề thi thử ETS
              </label>
              <div className="radio-cards-grid">
                {/* Lựa chọn 1: Đề luyện tập mở tự do */}
                <div
                  className={`exam-radio-card ${examTag === 'PRACTICE' ? 'selected' : ''}`}
                  onClick={() => onExamTagChange('PRACTICE')}
                >
                  <div className="radio-card-header">
                    <div className="radio-card-title-wrap">
                      <span>Đề luyện tập (PRACTICE)</span>
                    </div>
                    <input
                      type="radio"
                      name="examTag"
                      checked={examTag === 'PRACTICE'}
                      onChange={() => onExamTagChange('PRACTICE')}
                      style={{ accentColor: '#F45B0B', width: '17px', height: '17px' }}
                    />
                  </div>
                  <p className="radio-card-desc">Học viên làm tự do bất cứ lúc nào để rèn kỹ năng thi thật.</p>
                </div>

                {/* Lựa chọn 2: Đề thi đầu ra khóa cho tới khi hoàn thành lộ trình */}
                <div
                  className={`exam-radio-card ${examTag === 'OUTPUT' ? 'selected' : ''}`}
                  onClick={() => onExamTagChange('OUTPUT')}
                >
                  <div className="radio-card-header">
                    <div className="radio-card-title-wrap">
                      <span>Đề thi đầu ra (OUTPUT)</span>
                    </div>
                    <input
                      type="radio"
                      name="examTag"
                      checked={examTag === 'OUTPUT'}
                      onChange={() => onExamTagChange('OUTPUT')}
                      style={{ accentColor: '#F45B0B', width: '17px', height: '17px' }}
                    />
                  </div>
                  <p className="radio-card-desc">Mở khóa khi hoàn thành lộ trình; hiển thị Radar Trước/Sau &amp; Báo cáo.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 02: Thông tin cơ bản */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ color: '#F45B0B', fontWeight: 700, fontSize: '15px' }}>02</span>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Thông tin cơ bản</span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0' }}>
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Tên bộ đề */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Tên bộ đề thi <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                className="exam-search-input"
                style={{ paddingLeft: '14px', backgroundColor: '#FFFFFF' }}
                placeholder={DEFAULT_EXAM_CONFIGS[testType].titlePlaceholder}
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
              />
            </div>

            {/* Mô tả */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Mô tả đề thi <span style={{ fontSize: '12px', fontWeight: 400, color: '#94A3B8' }}>(không bắt buộc)</span>
              </label>
              <textarea
                className="exam-search-input"
                style={{
                  height: '80px',
                  padding: '10px 14px',
                  backgroundColor: '#FFFFFF',
                  resize: 'vertical',
                }}
                placeholder={DEFAULT_EXAM_CONFIGS[testType].descriptionPlaceholder}
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
              />
            </div>

            {/* Hàng 2 cột: Thời gian và Tổng số câu */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Thời gian làm bài <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min={1}
                    className="exam-search-input"
                    style={{ paddingLeft: '14px', paddingRight: '50px', backgroundColor: '#FFFFFF' }}
                    value={durationMinutes || ''}
                    onChange={(e) => onDurationChange(Number(e.target.value))}
                  />
                  <span style={{ position: 'absolute', right: '14px', top: '10px', fontSize: '13px', color: '#94A3B8' }}>
                    phút
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Tổng số câu hỏi <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min={1}
                    disabled={testType === 'FULL_MOCK_TEST'}
                    className="exam-search-input"
                    style={{
                      paddingLeft: '14px',
                      paddingRight: '50px',
                      backgroundColor: testType === 'FULL_MOCK_TEST' ? '#F1F5F9' : '#FFFFFF',
                      color: testType === 'FULL_MOCK_TEST' ? '#64748B' : '#0F172A',
                      cursor: testType === 'FULL_MOCK_TEST' ? 'not-allowed' : 'text',
                    }}
                    value={testType === 'FULL_MOCK_TEST' ? 200 : (totalQuestions || '')}
                    onChange={(e) => onTotalQuestionsChange(Math.max(1, Number(e.target.value) || 0))}
                  />
                  <span style={{ position: 'absolute', right: '14px', top: '10px', fontSize: '13px', color: '#94A3B8' }}>
                    câu
                  </span>
                </div>
                {testType === 'DIAGNOSTIC' && totalQuestions > 0 && totalQuestions < minDiagnosticQuestions && (
                  <p style={{ fontSize: '12px', color: '#D97706', margin: '6px 0 0 0', fontWeight: 500 }}>
                    Số câu tối thiểu phải &gt;={minDiagnosticQuestions}
                  </p>
                )}
              </div>
            </div>

            {/* Alert box xanh dương cho Mock Test */}
            {testType === 'FULL_MOCK_TEST' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '10px',
                  marginTop: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#1E40AF' }}>
                  <HelpCircle size={18} className="text-blue-600 flex-shrink-0" />
                  <span>
                    <strong>Cấu trúc đề thi thử TOEIC</strong>: Số lượng câu được cố định theo chuẩn ETS và không thể nhập tùy ý.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span style={{ padding: '3px 8px', backgroundColor: '#DBEAFE', color: '#1E40AF', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                    100 Listening
                  </span>
                  <span style={{ padding: '3px 8px', backgroundColor: '#DBEAFE', color: '#1E40AF', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                    100 Reading
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cột phụ bên phải: Card Lưu ý */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#D97706', fontWeight: 600, fontSize: '14px' }}>
            <Clock size={16} />
            <span>Lưu ý khi tạo đề</span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
            Bạn có thể lưu bản nháp ở bất kỳ bước nào và tiếp tục hoàn thiện sau.
          </p>
        </div>
      </div>

      {/* Wizard Footer */}
      <div className="wizard-footer" style={{ gridColumn: '1 / -1' }}>
        <button type="button" className="btn-outline-gray" onClick={onCancel}>
          Hủy
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" className="btn-outline-gray" onClick={onSaveDraft}>
            Lưu bản nháp
          </button>
          <button
            type="button"
            className="btn-primary-orange"
            disabled={!title.trim()}
            onClick={onNext}
          >
            <span>Tiếp tục</span>
            <span>&gt;</span>
          </button>
        </div>
      </div>
    </div>
  );
};

