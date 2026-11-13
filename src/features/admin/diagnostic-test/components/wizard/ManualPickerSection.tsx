import React, { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, GripVertical, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminQuestionService } from '@/features/admin/question/services/adminQuestionService';
import type { QuestionListItem } from '@/features/admin/question/types';
import type { ExamQuestionItem } from '../../types';

interface ManualPickerSectionProps {
  selectedQuestions: ExamQuestionItem[];
  targetTotal: number;
  onAddQuestion: (question: ExamQuestionItem) => void;
  onRemoveQuestion: (questionId: number) => void;
  onReorderQuestions?: (newQuestions: ExamQuestionItem[]) => void;
}

/**
 * Giao diện Bước 2 - Phương thức A: Chọn câu hỏi thủ công từ Question Bank (khớp Ảnh 3).
 */
export const ManualPickerSection: React.FC<ManualPickerSectionProps> = ({
  selectedQuestions,
  targetTotal,
  onAddQuestion,
  onRemoveQuestion,
}) => {
  // State ngân hàng câu hỏi
  const [bankQuestions, setBankQuestions] = useState<QuestionListItem[]>([]);
  const [totalBankItems, setTotalBankItems] = useState(0);
  const [loading, setLoading] = useState(false);

  // Bộ lọc ngân hàng
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedPartId, setSelectedPartId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(0);
  const pageSize = 5;

  const fetchBankQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminQuestionService.getQuestions({
        page,
        size: pageSize,
        keyword: searchKeyword.trim() || undefined,
        partId: selectedPartId ? Number(selectedPartId) : undefined,
      });

      if (res.data) {
        setBankQuestions(res.data);
        if (res.pagination) {
          setTotalBankItems(res.pagination.totalItems);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchKeyword, selectedPartId]);

  useEffect(() => {
    fetchBankQuestions();
  }, [fetchBankQuestions]);

  const selectedIds = new Set(selectedQuestions.map((q) => q.questionId));

  const handleToggleQuestion = (q: QuestionListItem) => {
    if (selectedIds.has(q.id)) {
      onRemoveQuestion(q.id);
    } else {
      const partNo = q.partId || 1;
      const newItem: ExamQuestionItem = {
        questionId: q.id,
        orderNo: selectedQuestions.length + 1,
        points: 5,
        questionCode: `Q-P${partNo}-${String(q.id).padStart(4, '0')}`,
        questionName: q.name,
        partId: q.partId,
        partNumber: partNo,
        partName: q.partName || `Part ${partNo}`,
        section: q.section || 'LISTENING',
        difficulty: q.difficulty,
        abilityNames: q.abilityNames || [],
      };
      onAddQuestion(newItem);
    }
  };

  const isLack = selectedQuestions.length < targetTotal;
  const remainingCount = targetTotal - selectedQuestions.length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
      {/* CỘT TRÁI: NGÂN HÀNG CÂU HỎI */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Ngân hàng câu hỏi</h3>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Chọn câu hỏi phù hợp để thêm vào đề.</span>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', backgroundColor: '#F1F5F9', padding: '3px 8px', borderRadius: '6px' }}>
            {totalBankItems.toLocaleString()} câu
          </span>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '11px', color: '#94A3B8' }} />
            <input
              type="text"
              className="exam-search-input"
              style={{ height: '36px', fontSize: '13px', paddingLeft: '32px' }}
              placeholder="Tìm theo mã hoặc nội dung..."
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setPage(0);
              }}
            />
          </div>

          <select
            className="exam-select"
            style={{ height: '36px', fontSize: '13px', minWidth: '110px' }}
            value={selectedPartId || ''}
            onChange={(e) => {
              setSelectedPartId(e.target.value ? Number(e.target.value) : undefined);
              setPage(0);
            }}
          >
            <option value="">Tất cả Part</option>
            {[1, 2, 3, 4, 5, 6, 7].map((p) => (
              <option key={p} value={p}>
                Part {p}
              </option>
            ))}
          </select>
        </div>

        {/* Danh sách câu hỏi dạng Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '320px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748B', fontSize: '13px' }}>
              Đang tải câu hỏi...
            </div>
          ) : bankQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#94A3B8', fontSize: '13px' }}>
              Không tìm thấy câu hỏi phù hợp
            </div>
          ) : (
            bankQuestions.map((q) => {
              const isChecked = selectedIds.has(q.id);
              const partNo = q.partId || 1;
              const code = `Q-P${partNo}-${String(q.id).padStart(4, '0')}`;

              return (
                <div
                  key={q.id}
                  onClick={() => handleToggleQuestion(q)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px',
                    border: isChecked ? '1px solid #F45B0B' : '1px solid #E2E8F0',
                    backgroundColor: isChecked ? '#FFFBF9' : '#FFFFFF',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    style={{ accentColor: '#F45B0B', marginTop: '3px', cursor: 'pointer' }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#F45B0B', marginBottom: '2px' }}>
                      || {code}
                    </div>
                    <div style={{ fontSize: '13px', color: '#1E293B', fontWeight: 500, lineHeight: 1.4, marginBottom: '6px' }}>
                      {q.name}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', padding: '1px 6px', backgroundColor: '#F1F5F9', borderRadius: '4px', color: '#475569' }}>
                        {q.partName || `Part ${partNo}`}
                      </span>
                      {q.abilityNames && q.abilityNames.slice(0, 2).map((abName, i) => (
                        <span key={i} style={{ fontSize: '11px', padding: '1px 6px', backgroundColor: '#EFF6FF', borderRadius: '4px', color: '#2563EB' }}>
                          {abName}
                        </span>
                      ))}
                      <span style={{ fontSize: '11px', padding: '1px 6px', backgroundColor: '#F8FAFC', borderRadius: '4px', color: '#64748B' }}>
                        {q.section === 'LISTENING' ? 'Listening' : 'Reading'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Phân trang ngân hàng */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #F1F5F9', fontSize: '12px', color: '#64748B' }}>
          <span>
            {totalBankItems > 0 ? `${page * pageSize + 1}-${Math.min((page + 1) * pageSize, totalBankItems)} trong ${totalBankItems} câu` : '0 câu'}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              className="exam-btn-reset"
              style={{ width: '28px', height: '28px', padding: 0, justifyContent: 'center' }}
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              className="exam-btn-reset"
              style={{ width: '28px', height: '28px', padding: 0, justifyContent: 'center' }}
              disabled={(page + 1) * pageSize >= totalBankItems}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: CÂU HỎI ĐÃ CHỌN */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Câu hỏi đã chọn</h3>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Kéo mép thay đổi thứ tự hiển thị.</span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#F45B0B' }}>
            {selectedQuestions.length}/{targetTotal}
          </span>
        </div>

        {/* Danh sách đã chọn */}
        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '350px', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
          {selectedQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '13px' }}>
              Chưa có câu hỏi nào được chọn vào bộ đề.
            </div>
          ) : (
            selectedQuestions.map((q) => (
              <div
                key={q.questionId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <GripVertical size={16} style={{ color: '#94A3B8', cursor: 'grab' }} />
                <span style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: '#EFF6FF', color: '#2563EB', borderRadius: '4px', fontWeight: 600 }}>
                  Part {q.partNumber}
                </span>
                <span style={{ flex: 1, fontSize: '13px', color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {q.questionName}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveQuestion(q.questionId)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                  title="Xóa câu hỏi khỏi đề"
                >
                  <Trash2 size={15} className="hover:text-red-500" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Alert cảnh báo thiếu câu hỏi */}
        {isLack && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              backgroundColor: '#FEFCE8',
              border: '1px solid #FEF08A',
              borderRadius: '8px',
              color: '#854D0E',
              fontSize: '12px',
              marginTop: '14px',
            }}
          >
            <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
            <div>
              <strong>Chưa đủ số lượng yêu cầu</strong>: Cần chọn thêm {remainingCount} câu theo đúng ma trận.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
