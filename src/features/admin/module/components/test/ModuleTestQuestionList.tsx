import React from 'react';
import type { ModuleTestQuestionItem } from '../../types';
import {
  Library,
  Plus,
  Shuffle,
  ArrowUp,
  ArrowDown,
  Trash2,
  Lock,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  HelpCircle,
} from 'lucide-react';

/**
 * Props đầu vào cho khối quản lý danh sách câu hỏi trong Bài thi vượt ải (chế độ chọn thủ công).
 */
interface ModuleTestQuestionListProps {
  // Danh sách câu hỏi hiện đang nằm trong đề vượt ải
  questions: ModuleTestQuestionItem[];
  // Số lượng câu hỏi mục tiêu giáo viên đã thiết lập
  targetQuestionCount: number;
  // Số câu hỏi khả dụng đúng năng lực trong Ngân hàng câu hỏi
  availableAbilityQuestionCount: number;
  // Số lượng câu hỏi đang lệch năng lực của mô-đun
  mismatchCount: number;
  // Thông báo lỗi validation của danh sách câu hỏi (nếu có)
  errorMessage?: string;
  // Cờ đang chạy API tự động bốc câu hỏi ngẫu nhiên
  isAutoSelecting: boolean;
  // Callback mở Modal chọn câu hỏi từ Ngân hàng câu hỏi
  onOpenBankPicker: () => void;
  // Callback mở Modal tạo nhanh câu hỏi mới đúng Part/Ability của mô-đun
  onOpenQuickCreate: () => void;
  // Callback gọi API tự động bốc ngẫu nhiên N câu đúng năng lực
  onAutoSelect: () => void;
  // Callback di chuyển thứ tự câu hỏi lên/xuống
  onMoveQuestion: (index: number, direction: 'UP' | 'DOWN') => void;
  // Callback gỡ câu hỏi khỏi đề
  onRemoveQuestion: (questionId: number) => void;
}

/**
 * Thành phần hiển thị thanh công cụ chọn câu hỏi và danh sách câu hỏi đã gán cho Bài thi vượt ải.
 */
export const ModuleTestQuestionList: React.FC<ModuleTestQuestionListProps> = ({
  questions,
  targetQuestionCount,
  availableAbilityQuestionCount,
  mismatchCount,
  errorMessage,
  isAutoSelecting,
  onOpenBankPicker,
  onOpenQuickCreate,
  onAutoSelect,
  onMoveQuestion,
  onRemoveQuestion,
}) => {
  // Kiểm tra số câu hiện chọn đã khớp hoặc vượt mức mục tiêu chưa
  const isCountMatched = questions.length === targetQuestionCount;

  return (
    <div className="editor-card">
      {/* Thanh tiêu đề khối câu hỏi kèm các nút thao tác nhanh */}
      <div className="mt-section-header">
        <div>
          <h3 className="card-section-title">Bộ câu hỏi bài thi vượt ải</h3>
          <p className="mt-section-hint">
            Đang chọn <strong>{questions.length}</strong> / {targetQuestionCount} câu mục tiêu • Kho
            đúng năng lực hiện có <strong>{availableAbilityQuestionCount}</strong> câu khả dụng.
          </p>
        </div>

        {/* Nhóm nút: Chọn từ Ngân hàng, Tạo nhanh, Tự động bốc ngẫu nhiên */}
        <div className="mt-toolbar-actions">
          <button
            type="button"
            className="btn-secondary compact"
            onClick={onAutoSelect}
            disabled={isAutoSelecting}
            title="Tự động chọn ngẫu nhiên câu hỏi khớp năng lực mô-đun"
          >
            {isAutoSelecting ? (
              <>
                <Loader2 size={14} className="spin" />
                <span>Đang chọn...</span>
              </>
            ) : (
              <>
                <Shuffle size={14} />
                <span>Chọn nhanh {targetQuestionCount} câu</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn-secondary compact"
            onClick={onOpenQuickCreate}
          >
            <Plus size={14} />
            <span>Tạo câu hỏi mới</span>
          </button>

          <button
            type="button"
            className="btn-primary compact"
            onClick={onOpenBankPicker}
          >
            <Library size={14} />
            <span>Chọn từ ngân hàng</span>
          </button>
        </div>
      </div>

      {/* Thông báo lỗi nếu chưa chọn câu hỏi nào khi bấm Lưu */}
      {errorMessage && (
        <div className="mt-inline-alert mt-inline-alert-error">
          <AlertTriangle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Cảnh báo nhẹ khi số câu đã chọn đang khác số câu mục tiêu */}
      {!errorMessage && questions.length > 0 && !isCountMatched && (
        <div className="mt-inline-alert mt-inline-alert-info">
          <CheckCircle2 size={15} />
          <span>
            Số câu đang chọn ({questions.length} câu) khác số câu mục tiêu ({targetQuestionCount}{' '}
            câu). Bạn có thể bổ sung thêm hoặc điều chỉnh lại số câu mục tiêu.
          </span>
        </div>
      )}

      {/* Cảnh báo sư phạm khi có câu hỏi nằm ngoài năng lực đào tạo của mô-đun */}
      {mismatchCount > 0 && (
        <div className="mt-inline-alert mt-inline-alert-warning">
          <AlertTriangle size={15} />
          <span>
            Có <strong>{mismatchCount}</strong> câu hỏi nằm ngoài năng lực đào tạo của mô-đun này.
            Hệ thống sẽ yêu cầu xác nhận trước khi lưu.
          </span>
        </div>
      )}

      {/* Trạng thái rỗng khi chưa chọn câu hỏi nào */}
      {questions.length === 0 ? (
        <div className="mt-empty-questions">
          <HelpCircle size={32} className="mt-empty-icon" />
          <h4 className="mt-empty-title">Chưa có câu hỏi nào trong bài thi vượt ải</h4>
          <p className="mt-empty-desc">
            Chọn câu hỏi từ Ngân hàng câu hỏi hoặc nhấn nút Chọn nhanh để tự động lấy câu hỏi khớp
            năng lực mô-đun.
          </p>
        </div>
      ) : (
        /* Danh sách các câu hỏi đã chọn kèm thứ tự, nhãn năng lực và thao tác di chuyển/gỡ */
        <div className="mt-question-list">
          {questions.map((item, idx) => (
            <div
              key={item.questionId}
              className={`mt-question-row ${!item.isMatchingAbility ? 'is-mismatch' : ''}`}
            >
              {/* Số thứ tự câu hỏi trong đề */}
              <span className="mt-question-order">{String(idx + 1).padStart(2, '0')}</span>

              {/* Nội dung tóm tắt và metadata của câu hỏi */}
              <div className="mt-question-main">
                <div className="mt-question-top">
                  <span className="mt-question-name">{item.questionName}</span>

                  {/* Nhãn đánh dấu câu thuộc chùm câu hỏi */}
                  {item.parentName && (
                    <span className="pq-badge pq-badge-group">
                      <Layers size={11} />
                      <span>{item.parentName}</span>
                    </span>
                  )}

                  {/* Nhãn trạng thái khớp hay lệch năng lực mô-đun */}
                  {item.isMatchingAbility ? (
                    <span className="pq-badge mt-badge-match">Đúng năng lực</span>
                  ) : (
                    <span className="pq-badge mt-badge-mismatch">Ngoài năng lực</span>
                  )}

                  {/* Biểu tượng khóa nếu câu hỏi đã có lịch sử học viên làm bài */}
                  {item.hasAttemptHistory && (
                    <span
                      className="pq-badge mt-badge-locked"
                      title="Câu hỏi đã có lịch sử làm bài của học viên nên không thể gỡ bỏ"
                    >
                      <Lock size={11} />
                      <span>Đã có lượt thi</span>
                    </span>
                  )}
                </div>

                {/* Đoạn tóm tắt nội dung câu hỏi */}
                {item.questionSummary && (
                  <p className="pq-question-summary">{item.questionSummary}</p>
                )}

                {/* Hàng thẻ Part, Độ khó và các Năng lực gắn trên câu hỏi */}
                <div className="pq-meta-tags">
                  {item.partName && <span className="pq-meta-pill">{item.partName}</span>}
                  {item.difficulty !== null && (
                    <span className="pq-meta-pill">Độ khó {item.difficulty}/5</span>
                  )}
                  {item.abilityNames.map((abName) => (
                    <span key={abName} className="pq-meta-pill pq-meta-ability">
                      {abName}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cụm nút sắp xếp thứ tự và gỡ câu hỏi */}
              <div className="mt-question-actions">
                <button
                  type="button"
                  className="tree-icon-btn"
                  title="Di chuyển lên"
                  disabled={idx === 0}
                  onClick={() => onMoveQuestion(idx, 'UP')}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  className="tree-icon-btn"
                  title="Di chuyển xuống"
                  disabled={idx === questions.length - 1}
                  onClick={() => onMoveQuestion(idx, 'DOWN')}
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  className="tree-icon-btn delete-btn"
                  title={
                    item.hasAttemptHistory
                      ? 'Không thể gỡ câu hỏi đã có lịch sử làm bài'
                      : 'Gỡ khỏi đề thi'
                  }
                  disabled={item.hasAttemptHistory}
                  onClick={() => onRemoveQuestion(item.questionId)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
