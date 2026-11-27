import React, { useState, useEffect, useMemo } from 'react';
import type { AbilityResponse, PartResponse } from '@/features/admin/part/types';
import type {
  PracticeQuestionItemDto,
  PracticeQuestionResponse,
  SectionType,
} from '../../types';
import { QuestionBankPickerModal } from './QuestionBankPickerModal';
import { QuickCreateQuestionModal } from './QuickCreateQuestionModal';
import {
  Plus,
  Library,
  Save,
  ArrowUp,
  ArrowDown,
  Trash2,
  Layers,
  AlertCircle,
  Loader2,
  HelpCircle,
} from 'lucide-react';

/**
 * Giới hạn tối đa câu hỏi luyện tập trên 1 bài học (đồng bộ với Backend @Size(max = 100)).
 */
const MAX_PRACTICE_QUESTIONS = 100;

/**
 * Props đầu vào cho Tab Quản lý Câu hỏi ôn tập / luyện tập.
 */
interface LessonReviewQuestionsTabProps {
  // ID bài học hiện tại (undefined nếu bài học chưa được lưu)
  lessonId?: number;
  // ID Part của Module cha (dùng lọc sẵn Ngân hàng câu hỏi)
  partId?: number | null;
  // Tên Part của Module cha
  partName?: string | null;
  // Phân khu kỹ năng (LISTENING / READING)
  section?: SectionType | null;
  // ID Ability mặc định của Lesson hiện tại
  defaultAbilityId?: number | null;
  // Danh sách toàn bộ Part để truyền cho Modal chọn từ Ngân hàng
  parts: PartResponse[];
  // Danh sách toàn bộ Ability để truyền cho Modal chọn từ Ngân hàng
  abilities: AbilityResponse[];
  // Danh sách Ability đã lọc chặt theo mô-đun hiện tại cho Modal Tạo nhanh
  scopedAbilities: AbilityResponse[];
  // Danh sách câu hỏi luyện tập ban đầu tải từ máy chủ
  initialQuestions: PracticeQuestionResponse[];
  // Hàm callback gọi API lưu bộ câu hỏi luyện tập
  onSavePracticeQuestions: (items: PracticeQuestionItemDto[]) => Promise<void>;
  // Cờ đang trong quá trình lưu dữ liệu
  isSaving: boolean;
}

export const LessonReviewQuestionsTab: React.FC<LessonReviewQuestionsTabProps> = ({
  lessonId,
  partId,
  partName,
  section,
  defaultAbilityId,
  parts,
  abilities,
  scopedAbilities,
  initialQuestions,
  onSavePracticeQuestions,
  isSaving,
}) => {
  // State lưu danh sách câu hỏi luyện tập đang biên soạn cục bộ trên Tab 3
  const [questions, setQuestions] = useState<PracticeQuestionResponse[]>(initialQuestions);
  // Cờ đánh dấu danh sách có thay đổi chưa được bấm Lưu lên Backend
  const [isDirty, setIsDirty] = useState<boolean>(false);
  // Cờ mở/đóng Modal chọn câu hỏi từ Ngân hàng câu hỏi
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  // Cờ mở/đóng Modal tạo nhanh câu hỏi đơn lập
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState<boolean>(false);

  // Đồng bộ lại state cục bộ mỗi khi bài học được tải mới hoặc vừa lưu xong từ Backend
  useEffect(() => {
    // Nạp danh sách câu hỏi từ props initialQuestions
    setQuestions(initialQuestions);
    // Reset cờ dirty vì dữ liệu đã khớp với Backend
    setIsDirty(false);
  }, [initialQuestions, lessonId]);

  // Tập ID các câu hỏi hiện đang có trong danh sách (dùng để chống chọn trùng trong Modal)
  const existingQuestionIds = useMemo(() => {
    // Tạo Set từ questionId của từng phần tử để tra cứu O(1)
    return new Set<number>(questions.map((q) => q.questionId));
  }, [questions]);

  // Tính tổng điểm của toàn bộ bộ câu hỏi luyện tập hiện tại
  const totalPoints = useMemo(() => {
    // Cộng dồn points của tất cả các câu hỏi trong danh sách
    return questions.reduce((sum, item) => sum + (item.points || 0), 0);
  }, [questions]);

  // Trường hợp bài học mới tạo chưa được lưu: hiển thị thông báo ngắn gọn
  if (!lessonId) {
    return (
      <div className="tab-content-wrapper">
        <div className="tab-card pq-unsaved-card">
          <AlertCircle size={32} className="text-orange" />
          <h3 className="pq-unsaved-title">Chưa lưu bài học</h3>
          <p className="pq-unsaved-desc">
            Vui lòng lưu thông tin bài học trước khi thêm câu hỏi ôn tập.
          </p>
        </div>
      </div>
    );
  }

  /**
   * Thêm danh sách câu hỏi mới (từ Ngân hàng hoặc Tạo nhanh) vào cuối danh sách hiện tại.
   */
  const handleAppendQuestions = (incoming: PracticeQuestionResponse[]) => {
    setQuestions((prev) => {
      // Tập ID đã tồn tại để đảm bảo không bao giờ chèn trùng
      const existing = new Set(prev.map((item) => item.questionId));
      // Chỉ giữ lại các câu hỏi chưa có trong danh sách
      const uniqueIncoming = incoming.filter((item) => !existing.has(item.questionId));
      // Gộp mảng cũ + mới và giới hạn tối đa 100 câu theo quy chuẩn bảo mật
      const merged = [...prev, ...uniqueIncoming].slice(0, MAX_PRACTICE_QUESTIONS);
      // Đánh lại số thứ tự orderNo liên tục từ 1..N
      return merged.map((item, idx) => ({ ...item, orderNo: idx + 1 }));
    });
    // Đánh dấu danh sách đã thay đổi cần bấm Lưu
    setIsDirty(true);
  };

  /**
   * Di chuyển một câu hỏi lên hoặc xuống 1 vị trí trong danh sách.
   */
  const handleMoveQuestion = (index: number, direction: 'UP' | 'DOWN') => {
    // Tính vị trí đích sau khi dịch chuyển
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    // Bỏ qua nếu vị trí đích vượt ngoài giới hạn mảng
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    setQuestions((prev) => {
      // Sao chép mảng để hoán đổi vị trí an toàn
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      // Cập nhật lại số thứ tự orderNo chuẩn 1..N
      return next.map((item, idx) => ({ ...item, orderNo: idx + 1 }));
    });
    // Đánh dấu danh sách có thay đổi chưa lưu
    setIsDirty(true);
  };

  /**
   * Cập nhật điểm số của một câu hỏi trong danh sách (ràng buộc trong khoảng 1 - 100).
   */
  const handlePointsChange = (questionId: number, rawValue: string) => {
    // Chuyển chuỗi người dùng nhập sang số nguyên
    const parsed = Number.parseInt(rawValue, 10);
    // Kẹp giá trị an toàn trong khoảng [1, 100] (mặc định 10 nếu ô bị xóa trắng)
    const safePoints = Number.isNaN(parsed) ? 10 : Math.min(100, Math.max(1, parsed));

    setQuestions((prev) =>
      prev.map((item) =>
        item.questionId === questionId ? { ...item, points: safePoints } : item
      )
    );
    // Đánh dấu danh sách có thay đổi chưa lưu
    setIsDirty(true);
  };

  /**
   * Gỡ một câu hỏi khỏi danh sách luyện tập của bài học.
   */
  const handleRemoveQuestion = (questionId: number) => {
    setQuestions((prev) =>
      prev
        .filter((item) => item.questionId !== questionId)
        .map((item, idx) => ({ ...item, orderNo: idx + 1 }))
    );
    // Đánh dấu danh sách có thay đổi chưa lưu
    setIsDirty(true);
  };

  /**
   * Chuẩn hóa payload và gọi callback lưu toàn bộ bộ câu hỏi lên Backend.
   */
  const handleSave = async () => {
    // Chuyển danh sách hiển thị sang mảng DTO tối giản theo chuẩn SavePracticeQuestionsRequest
    const payload: PracticeQuestionItemDto[] = questions.map((item, idx) => ({
      questionId: item.questionId,
      orderNo: idx + 1,
      points: item.points,
    }));
    // Gửi yêu cầu lưu lên component cha (LessonEditorView -> useModuleLessonEditor)
    await onSavePracticeQuestions(payload);
    // Tắt cờ dirty sau khi lưu thành công
    setIsDirty(false);
  };

  return (
    <div className="tab-content-wrapper pq-tab-container">
      {/* Thanh công cụ quản lý bộ câu hỏi */}
      <div className="tab-card pq-main-card">
        <div className="pq-toolbar">
          <div className="pq-toolbar-stats">
            <h3 className="pq-section-heading">Bộ câu hỏi luyện tập</h3>
            <div className="pq-stats-pills">
              <span className="pq-stat-pill">
                <strong>{questions.length}</strong> / {MAX_PRACTICE_QUESTIONS} câu
              </span>
              <span className="pq-stat-pill">
                Tổng điểm: <strong>{totalPoints}</strong>
              </span>
              {isDirty && <span className="pq-dirty-pill">Chưa lưu thay đổi</span>}
            </div>
          </div>

          <div className="pq-toolbar-actions">
            {/* Nút mở Modal chọn câu hỏi từ Ngân hàng câu hỏi */}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsPickerOpen(true)}
              disabled={questions.length >= MAX_PRACTICE_QUESTIONS}
            >
              <Library size={15} />
              <span>Chọn từ Ngân hàng</span>
            </button>

            {/* Nút mở Modal tạo nhanh câu hỏi đơn (UC A05 Alt Flow 6) */}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsQuickCreateOpen(true)}
              disabled={questions.length >= MAX_PRACTICE_QUESTIONS}
            >
              <Plus size={15} />
              <span>Tạo câu hỏi nhanh</span>
            </button>

            {/* Nút Lưu bộ câu hỏi lên Backend */}
            <button
              type="button"
              className="btn-primary"
              onClick={() => void handleSave()}
              disabled={isSaving || !isDirty}
            >
              {isSaving ? (
                <>
                  <Loader2 size={15} className="spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>Lưu bộ câu hỏi</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4. Danh sách câu hỏi đã gắn hoặc trạng thái Rỗng (Empty State) */}
        {questions.length === 0 ? (
          <div className="pq-empty-state">
            <div className="pq-empty-icon">
              <HelpCircle size={32} />
            </div>
            <h4>Chưa có câu hỏi luyện tập nào</h4>
            <p>
              Chọn câu hỏi có sẵn từ Ngân hàng câu hỏi hoặc tạo nhanh câu hỏi mới để xây dựng bộ bài tập thực hành cho bài học này.
            </p>
            <div className="pq-empty-actions">
              <button type="button" className="btn-primary" onClick={() => setIsPickerOpen(true)}>
                <Library size={15} />
                <span>Chọn từ Ngân hàng câu hỏi</span>
              </button>
              <button type="button" className="btn-secondary" onClick={() => setIsQuickCreateOpen(true)}>
                <Plus size={15} />
                <span>Tạo câu hỏi nhanh</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="pq-list">
            {questions.map((item, index) => (
              <div key={item.questionId} className="pq-item-row">
                {/* Cột số thứ tự hiển thị */}
                <div className="pq-item-order">#{index + 1}</div>

                {/* Cột thông tin nội dung câu hỏi */}
                <div className="pq-item-content">
                  <div className="pq-item-header">
                    <span className="pq-question-name">{item.questionName}</span>
                    {/* Nhãn hiển thị chùm ngữ cảnh cha nếu câu này là câu con (Part 3, 4, 6, 7) */}
                    {item.parentName && (
                      <span className="pq-badge pq-badge-group" title={`Thuộc chùm: ${item.parentName}`}>
                        <Layers size={11} />
                        <span>{item.parentName}</span>
                      </span>
                    )}
                  </div>

                  {/* Đoạn trích đề bài nếu có */}
                  {item.questionSummary && (
                    <p className="pq-question-summary">{item.questionSummary}</p>
                  )}

                  {/* Các thẻ metadata Part, Độ khó, Ability */}
                  <div className="pq-meta-tags">
                    {item.partName && <span className="pq-meta-pill">{item.partName}</span>}
                    {item.difficulty !== null && (
                      <span className="pq-meta-pill">Độ khó {item.difficulty}/5</span>
                    )}
                    {item.abilityNames?.map((abName) => (
                      <span key={abName} className="pq-meta-pill pq-meta-ability">
                        {abName}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cột nhập điểm số */}
                <div className="pq-item-points">
                  <label className="pq-points-label" htmlFor={`pq-points-${item.questionId}`}>
                    Điểm
                  </label>
                  <input
                    id={`pq-points-${item.questionId}`}
                    type="number"
                    min={1}
                    max={100}
                    className="pq-points-input"
                    value={item.points}
                    onChange={(e) => handlePointsChange(item.questionId, e.target.value)}
                  />
                </div>

                {/* Cột thao tác: Lên, Xuống, Gỡ */}
                <div className="pq-item-actions">
                  <button
                    type="button"
                    className="pq-icon-btn"
                    title="Di chuyển lên"
                    disabled={index === 0}
                    onClick={() => handleMoveQuestion(index, 'UP')}
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    className="pq-icon-btn"
                    title="Di chuyển xuống"
                    disabled={index === questions.length - 1}
                    onClick={() => handleMoveQuestion(index, 'DOWN')}
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    type="button"
                    className="pq-icon-btn pq-icon-btn-danger"
                    title="Gỡ câu hỏi khỏi bài học"
                    onClick={() => handleRemoveQuestion(item.questionId)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal 1: Chọn câu hỏi từ Ngân hàng câu hỏi */}
      <QuestionBankPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        defaultPartId={partId}
        parts={parts}
        abilities={abilities}
        existingQuestionIds={existingQuestionIds}
        onConfirmSelect={handleAppendQuestions}
      />

      {/* Modal 2: Tạo nhanh câu hỏi trực tiếp từ bài học (hỗ trợ câu đơn & chùm theo Part cố định) */}
      <QuickCreateQuestionModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        partId={partId}
        partName={partName}
        section={section}
        defaultAbilityId={defaultAbilityId}
        scopedAbilities={scopedAbilities}
        onCreatedAndAttach={handleAppendQuestions}
      />
    </div>
  );
};
