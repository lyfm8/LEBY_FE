import React, { useState, useMemo, useEffect } from 'react';
import type { AbilityResponse, PartResponse } from '@/features/admin/part/types';
import type {
  PracticeQuestionResponse,
  QuestionBankItem,
  QuestionStructureFilter,
} from '../../types';
import { useQuestionBankPicker } from '../../hooks/useQuestionBankPicker';
import { adminModuleService } from '../../services/adminModuleService';
import {
  Search,
  X,
  Check,
  Layers,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookOpenCheck,
} from 'lucide-react';
import { useToast } from '@/core/ui';

/**
 * Điểm số mặc định gán cho mỗi câu hỏi khi mới chọn từ Ngân hàng câu hỏi.
 */
const DEFAULT_PRACTICE_POINTS = 10;

/**
 * Props đầu vào cho Modal chọn câu hỏi từ Ngân hàng câu hỏi.
 */
interface QuestionBankPickerModalProps {
  // Cờ bật/tắt hiển thị Modal
  isOpen: boolean;
  // Hàm đóng Modal
  onClose: () => void;
  // ID Part mặc định của Module chứa bài học
  defaultPartId?: number | null;
  // Danh sách toàn bộ Part để render dropdown lọc
  parts: PartResponse[];
  // Danh sách toàn bộ Ability để render dropdown lọc
  abilities: AbilityResponse[];
  // Tập ID các câu hỏi đã gắn vào bài học hiện tại (để đánh dấu "Đã gắn")
  existingQuestionIds: Set<number>;
  // Callback trả danh sách câu hỏi vừa chọn (đã bóc tách câu con nếu là chùm) về Tab 3
  onConfirmSelect: (newQuestions: PracticeQuestionResponse[]) => void;
  // Tùy chọn tùy biến phụ đề Modal khi tái sử dụng cho Bài thi vượt ải
  modalSubtitle?: string;
  // Tùy chọn tùy biến nhãn nút xác nhận thêm
  confirmLabel?: string;
  // Tập tên năng lực của mô-đun để gắn nhãn phân biệt câu đúng/ngoài năng lực (tùy chọn)
  targetAbilityNames?: string[];
}

/**
 * Modal cho phép giáo viên/quản trị viên tìm kiếm, lọc và chọn nhiều câu hỏi từ Ngân hàng câu hỏi (UC A04)
 * để gắn vào bài học luyện tập (Tab 3 - UC A05).
 */
export const QuestionBankPickerModal: React.FC<QuestionBankPickerModalProps> = ({
  isOpen,
  onClose,
  defaultPartId,
  parts,
  abilities,
  existingQuestionIds,
  onConfirmSelect,
  modalSubtitle,
  confirmLabel,
  targetAbilityNames,
}) => {
  // Hook hiển thị thông báo Toast khi có lỗi bóc tách chùm câu hỏi
  const toast = useToast();

  // Map lưu các câu hỏi đã được người dùng tick chọn trong phiên mở Modal (key là question.id)
  const [selectedMap, setSelectedMap] = useState<Map<number, QuestionBankItem>>(new Map());
  // Cờ đang gọi API lấy chi tiết câu con cho các chùm câu hỏi vừa chọn
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  // Gọi custom hook quản lý gọi API tìm kiếm, lọc và phân trang Ngân hàng câu hỏi
  const {
    questions,
    isLoading,
    error,
    keyword,
    partId,
    abilityId,
    difficulty,
    structureType,
    page,
    totalPages,
    totalItems,
    setPage,
    updateKeyword,
    updatePartId,
    updateAbilityId,
    updateDifficulty,
    updateStructureType,
    refetch,
  } = useQuestionBankPicker({ isOpen, defaultPartId });

  // Xóa danh sách chọn tạm mỗi khi Modal đóng hoặc mở lại
  useEffect(() => {
    if (!isOpen) {
      // Đưa map chọn về rỗng để lần mở tiếp theo luôn sạch
      setSelectedMap(new Map());
    }
  }, [isOpen]);

  // Lọc danh sách Ability hiển thị theo Part đang chọn (nếu chưa chọn Part thì hiện tất cả)
  const filteredAbilities = useMemo(() => {
    // Nếu chưa chọn Part cụ thể thì trả về toàn bộ Ability
    if (partId === undefined) return abilities;
    // Lọc các Ability thuộc đúng Part đang chọn
    return abilities.filter((ab) => ab.partId === partId);
  }, [abilities, partId]);

  // Không render gì ra DOM nếu Modal đang đóng
  if (!isOpen) return null;

  /**
   * Bật/tắt chọn một dòng câu hỏi trong bảng Ngân hàng câu hỏi.
   */
  const handleToggleItem = (item: QuestionBankItem) => {
    // Nếu là câu đơn và đã gắn sẵn trong bài học rồi thì không cho chọn trùng
    if (!item.isGroup && existingQuestionIds.has(item.id)) return;
    // Cập nhật Map chọn theo cơ chế bất biến để React re-render chính xác
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (next.has(item.id)) {
        // Bỏ chọn nếu đã tồn tại trong Map
        next.delete(item.id);
      } else {
        // Thêm vào Map nếu chưa được chọn
        next.set(item.id, item);
      }
      return next;
    });
  };

  /**
   * Xác nhận thêm các câu hỏi đã chọn vào danh sách bài học.
   * Với chùm câu hỏi (isGroup = true), tự động gọi API lấy chi tiết câu con để hiển thị minh bạch trên Tab 3.
   */
  const handleConfirm = async () => {
    // Không làm gì nếu chưa chọn câu hỏi nào
    if (selectedMap.size === 0) return;

    // Bật trạng thái đang xử lý trên nút xác nhận
    setIsConfirming(true);
    try {
      // Mảng gom các câu hỏi có thể làm bài sau khi bóc tách chùm
      const resolvedQuestions: PracticeQuestionResponse[] = [];
      // Tập ID đã thêm trong lần xác nhận này để chống trùng
      const seenIds = new Set<number>(existingQuestionIds);

      // Duyệt tuần tự các mục giáo viên đã tick chọn
      for (const item of selectedMap.values()) {
        if (item.isGroup) {
          // Với chùm câu hỏi (Part 3, 4, 6, 7): gọi API lấy chi tiết để bóc tách từng câu con
          const detailRes = await adminModuleService.getQuestionDetail(item.id);
          const detail = detailRes.data;
          const subList = detail?.subQuestions ?? [];
          // Thêm từng câu con chưa tồn tại vào danh sách kết quả
          for (const sub of subList) {
            if (seenIds.has(sub.id)) continue;
            seenIds.add(sub.id);
            resolvedQuestions.push({
              questionId: sub.id,
              orderNo: 0,
              points: DEFAULT_PRACTICE_POINTS,
              questionName: sub.name,
              questionSummary: sub.text || '',
              questionType: detail?.type || item.type,
              partId: detail?.partId ?? item.partId,
              partName: detail?.partName ?? item.partName,
              section: detail?.section ?? item.section,
              difficulty: sub.difficulty ?? item.difficulty,
              parentId: item.id,
              parentName: item.name,
              abilityNames:
                sub.abilities && sub.abilities.length > 0
                  ? sub.abilities.map((a) => a.name)
                  : item.abilityNames,
            });
          }
        } else {
          // Với câu hỏi đơn lập (Part 1, 2, 5): thêm trực tiếp vào danh sách kết quả
          if (seenIds.has(item.id)) continue;
          seenIds.add(item.id);
          resolvedQuestions.push({
            questionId: item.id,
            orderNo: 0,
            points: DEFAULT_PRACTICE_POINTS,
            questionName: item.name,
            questionSummary: item.summary || '',
            questionType: item.type,
            partId: item.partId,
            partName: item.partName,
            section: item.section,
            difficulty: item.difficulty,
            parentId: null,
            parentName: null,
            abilityNames: item.abilityNames ?? [],
          });
        }
      }

      // Báo nếu tất cả câu con trong chùm chọn đều đã gắn trước đó
      if (resolvedQuestions.length === 0) {
        toast.info('Các câu hỏi bạn chọn đều đã có trong danh sách bài học.');
        onClose();
        return;
      }

      // Trả danh sách câu hỏi mới cho component cha (LessonReviewQuestionsTab)
      onConfirmSelect(resolvedQuestions);
      // Đóng Modal sau khi thêm thành công
      onClose();
    } catch {
      // Báo lỗi nếu quá trình lấy chi tiết chùm câu hỏi gặp sự cố mạng
      toast.error('Không thể tải chi tiết chùm câu hỏi. Vui lòng thử lại!');
    } finally {
      // Tắt trạng thái đang xử lý dù thành công hay thất bại
      setIsConfirming(false);
    }
  };

  return (
    <div className="pq-modal-backdrop" role="dialog" aria-modal="true" aria-label="Chọn câu hỏi từ Ngân hàng câu hỏi">
      <div className="pq-modal-panel pq-modal-panel-lg">
        {/* Phần đầu Modal: tiêu đề và nút đóng */}
        <div className="pq-modal-header">
          <div>
            <h3 className="pq-modal-title">Chọn câu hỏi từ Ngân hàng câu hỏi</h3>
            <p className="pq-modal-subtitle">
              {modalSubtitle ?? 'Tìm lọc theo Part, Năng lực hoặc Độ khó để thêm vào bài học.'}
            </p>
          </div>
          {/* Nút đóng Modal */}
          <button type="button" className="pq-modal-close-btn" onClick={onClose} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>

        {/* Thanh bộ lọc đa tiêu chí */}
        <div className="pq-picker-filters">
          {/* Ô tìm kiếm từ khóa */}
          <div className="pq-search-box">
            <Search size={15} className="pq-search-icon" />
            <input
              type="text"
              className="pq-search-input"
              placeholder="Tìm theo tên hoặc mã câu hỏi..."
              value={keyword}
              onChange={(e) => updateKeyword(e.target.value)}
            />
          </div>

          {/* Dropdown lọc theo Part */}
          <select
            className="pq-filter-select"
            value={partId ?? ''}
            onChange={(e) => updatePartId(e.target.value ? Number(e.target.value) : undefined)}
            aria-label="Lọc theo Part"
          >
            <option value="">Tất cả các Part</option>
            {parts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Dropdown lọc theo Ability */}
          <select
            className="pq-filter-select"
            value={abilityId ?? ''}
            onChange={(e) => updateAbilityId(e.target.value ? Number(e.target.value) : undefined)}
            aria-label="Lọc theo Năng lực"
          >
            <option value="">Tất cả Năng lực</option>
            {filteredAbilities.map((ab) => (
              <option key={ab.id} value={ab.id}>
                {ab.name}
              </option>
            ))}
          </select>

          {/* Dropdown lọc theo Độ khó */}
          <select
            className="pq-filter-select pq-filter-select-sm"
            value={difficulty ?? ''}
            onChange={(e) => updateDifficulty(e.target.value ? Number(e.target.value) : undefined)}
            aria-label="Lọc theo Độ khó"
          >
            <option value="">Mọi độ khó</option>
            <option value="1">Mức 1 (Dễ)</option>
            <option value="2">Mức 2</option>
            <option value="3">Mức 3 (Trung bình)</option>
            <option value="4">Mức 4</option>
            <option value="5">Mức 5 (Khó)</option>
          </select>

          {/* Dropdown lọc theo cấu trúc đơn/chùm */}
          <select
            className="pq-filter-select pq-filter-select-sm"
            value={structureType}
            onChange={(e) => updateStructureType(e.target.value as QuestionStructureFilter)}
            aria-label="Lọc loại câu hỏi"
          >
            <option value="ALL">Đơn &amp; Chùm</option>
            <option value="STANDALONE">Chỉ câu đơn</option>
            <option value="GROUP">Chỉ chùm câu hỏi</option>
          </select>
        </div>

        {/* Thân Modal: xử lý đủ 4 trạng thái Loading / Error / Empty / Success */}
        <div className="pq-modal-body">
          {/* Trạng thái 1: Đang tải (Skeleton rows) */}
          {isLoading && (
            <div className="pq-skeleton-list">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="pq-skeleton-row" />
              ))}
            </div>
          )}

          {/* Trạng thái 2: Lỗi gọi API kèm nút thử lại */}
          {!isLoading && error && (
            <div className="pq-state-box pq-state-error">
              <AlertCircle size={28} />
              <p>{error}</p>
              <button type="button" className="btn-secondary" onClick={() => void refetch()}>
                <RefreshCw size={14} />
                <span>Thử lại</span>
              </button>
            </div>
          )}

          {/* Trạng thái 3: Danh sách rỗng */}
          {!isLoading && !error && questions.length === 0 && (
            <div className="pq-state-box">
              <BookOpenCheck size={30} />
              <p>Không tìm thấy câu hỏi nào khớp với bộ lọc hiện tại.</p>
            </div>
          )}

          {/* Trạng thái 4: Hiển thị danh sách câu hỏi */}
          {!isLoading && !error && questions.length > 0 && (
            <div className="pq-picker-list">
              {questions.map((item) => {
                // Kiểm tra câu hỏi đơn này đã có trong bài học hay chưa
                const isAlreadyAttached = !item.isGroup && existingQuestionIds.has(item.id);
                // Kiểm tra câu hỏi này có đang được tick chọn trong phiên hiện tại không
                const isChecked = selectedMap.has(item.id);

                return (
                  <div
                    key={item.id}
                    className={`pq-picker-row ${isChecked ? 'selected' : ''} ${isAlreadyAttached ? 'attached' : ''}`}
                    onClick={() => handleToggleItem(item)}
                  >
                    {/* Ô checkbox chọn câu hỏi */}
                    <div className={`pq-checkbox ${isChecked ? 'checked' : ''} ${isAlreadyAttached ? 'disabled' : ''}`}>
                      {(isChecked || isAlreadyAttached) && <Check size={13} />}
                    </div>

                    {/* Cột thông tin chính của câu hỏi */}
                    <div className="pq-picker-row-main">
                      <div className="pq-picker-row-top">
                        <span className="pq-question-name">{item.name}</span>
                        {/* Nhãn phân biệt chùm câu hỏi */}
                        {item.isGroup && (
                          <span className="pq-badge pq-badge-group">
                            <Layers size={11} />
                            <span>Chùm {item.itemCount} câu</span>
                          </span>
                        )}
                        {/* Nhãn báo đã gắn vào bài học */}
                        {isAlreadyAttached && (
                          <span className="pq-badge pq-badge-attached">Đã gắn</span>
                        )}
                        {/* Nhãn cảnh báo nhẹ nếu câu hỏi nằm ngoài năng lực của mô-đun đang cấu hình */}
                        {targetAbilityNames &&
                          targetAbilityNames.length > 0 &&
                          (item.abilityNames ?? []).length > 0 &&
                          !(item.abilityNames ?? []).some((ab) => targetAbilityNames.includes(ab)) && (
                            <span className="pq-badge mt-badge-mismatch">Ngoài năng lực mô-đun</span>
                          )}
                      </div>

                      {/* Đoạn tóm tắt đề bài nếu có */}
                      {item.summary && <p className="pq-question-summary">{item.summary}</p>}

                      {/* Hàng metadata: Part, Độ khó và các Ability */}
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
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chân Modal: phân trang và nút xác nhận thêm */}
        <div className="pq-modal-footer">
          {/* Khu vực điều hướng phân trang */}
          <div className="pq-pagination">
            <span className="pq-pagination-info">
              Tổng {totalItems} mục {totalPages > 0 ? `• Trang ${page + 1}/${totalPages}` : ''}
            </span>
            <div className="pq-pagination-btns">
              {/* Nút về trang trước */}
              <button
                type="button"
                className="pq-page-btn"
                disabled={page <= 0 || isLoading}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                aria-label="Trang trước"
              >
                <ChevronLeft size={15} />
              </button>
              {/* Nút sang trang sau */}
              <button
                type="button"
                className="pq-page-btn"
                disabled={page + 1 >= totalPages || isLoading}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Trang sau"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Nhóm nút hành động Hủy và Thêm câu hỏi */}
          <div className="pq-modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isConfirming}>
              Hủy
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={selectedMap.size === 0 || isConfirming}
              onClick={() => void handleConfirm()}
            >
              {isConfirming ? (
                <>
                  <Loader2 size={15} className="spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>
                  {confirmLabel
                    ? `${confirmLabel} ${selectedMap.size > 0 ? `(${selectedMap.size} mục)` : ''}`
                    : `Thêm ${selectedMap.size > 0 ? `(${selectedMap.size} mục)` : ''} vào bài học`}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
