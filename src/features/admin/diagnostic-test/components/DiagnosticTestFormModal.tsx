import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { diagnosticTestSchema, type DiagnosticTestFormValues } from '../utils/schema';
import { adminQuestionService } from '@/features/admin/question/services/adminQuestionService';
import type { QuestionListItemResponse, QuestionFilterParams } from '@/features/admin/question/types';
import type { DiagnosticTestDetailResponse } from '../types';
import { X, Search, Trash2 } from 'lucide-react';

interface DiagnosticTestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DiagnosticTestFormValues) => void;
  data: DiagnosticTestDetailResponse | null;
  isLoading: boolean;
}

/**
 * Component Modal dùng chung cho việc Tạo mới (Create) và Cập nhật (Edit) đề thi chẩn đoán (Diagnostic Test).
 * 
 * NOTE: Giao diện sử dụng cấu trúc 2 cột song song (Dual-Column Layout):
 *  - Cột trái: Form nhập Title, Description và danh sách câu hỏi ĐÃ ĐƯỢC CHỌN (selected list).
 *  - Cột phải: Ngân hàng câu hỏi thu nhỏ (Question Picker) cho phép tìm kiếm và tích chọn/hủy tích câu hỏi.
 * 
 * @param isOpen Trạng thái hiển thị modal
 * @param onClose Hàm đóng modal
 * @param onSubmit Hàm gọi về Page cha để xử lý lưu data
 * @param data Data của đề thi hiện tại nếu đang ở chế độ Edit. Bằng null nếu ở chế độ Create.
 * @param isLoading Trạng thái đang call api lưu
 */
export const DiagnosticTestFormModal: React.FC<DiagnosticTestFormModalProps> = ({
  isOpen, onClose, onSubmit, data, isLoading
}) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<DiagnosticTestFormValues>({
    resolver: zodResolver(diagnosticTestSchema),
    defaultValues: {
      title: '',
      description: '',
      status: true,
      questionIds: []
    }
  });

  // Tối ưu: Lắng nghe sự thay đổi của array questionIds để tự động update UI phần danh sách "Câu hỏi đã chọn"
  const questionIds = watch('questionIds') || [];

  // Tối ưu: Cache thông tin tóm tắt câu hỏi (title, summary) dựa trên ID
  // Tại sao cần Cache? Khi backend trả về chi tiết đề thi, nó chỉ trả danh sách `questionIds` (dạng number[]). 
  // Cache này giúp chúng ta map ngược từ ID sang tên câu hỏi để hiển thị ở cột bên trái mà không cần phải gọi API lấy detail của từng câu.
  // Khi người dùng search trong ngân hàng bên phải, ta sẽ chủ động nạp dữ liệu vào cache này.
  const [selectedQuestionsCache, setSelectedQuestionsCache] = useState<Record<number, QuestionListItemResponse>>({});
  
  // State quản lý việc tìm kiếm ngân hàng câu hỏi bên cột phải
  const [bankQuestions, setBankQuestions] = useState<QuestionListItemResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [keyword, setKeyword] = useState('');

  // Lắng nghe sự thay đổi của data truyền vào (Edit/Create mode) để Reset Form
  useEffect(() => {
    if (isOpen) {
      if (data) {
        reset({
          title: data.title,
          description: data.description || '',
          status: data.status,
          questionIds: data.questionIds
        });
        // Ở chế độ Edit, ban đầu cache sẽ rỗng, UI sẽ hiển thị "Câu hỏi ID: [ID]"
        // Admin chỉ cần search câu hỏi thì cache sẽ tự động được bổ sung.
      } else {
        // Chế độ Create: xóa form
        reset({
          title: '',
          description: '',
          status: true,
          questionIds: []
        });
        setSelectedQuestionsCache({});
      }
      
      // Mở modal lên luôn tự động load ngân hàng trang 1
      handleSearchBank('');
    }
  }, [isOpen, data, reset]);

  /**
   * Gọi API tìm kiếm ngân hàng câu hỏi.
   * 
   * @param searchKeyword Từ khóa tìm kiếm (có thể rỗng)
   */
  const handleSearchBank = useCallback(async (searchKeyword = '') => {
    setIsSearching(true);
    try {
      // NOTE: Lấy 50 câu hỏi mỗi lần tìm kiếm để đủ view hiển thị
      const params: QuestionFilterParams = { page: 0, pageSize: 50, keyword: searchKeyword };
      const res = await adminQuestionService.getQuestions(params);
      
      if (res.success && res.data) {
        setBankQuestions(res.data);
        
        // Tối ưu: Khi lấy data về, cập nhật thêm vào dictionary `selectedQuestionsCache`
        // Điều này giúp map được ID sang thông tin chi tiết (ví dụ ID 104 -> "Câu hỏi chia động từ")
        const newCache = { ...selectedQuestionsCache };
        res.data.forEach(q => { newCache[q.id] = q; });
        setSelectedQuestionsCache(newCache);
      }
    } catch (error) {
      console.error('Failed to search bank:', error);
    } finally {
      setIsSearching(false);
    }
  }, [selectedQuestionsCache]);

  /**
   * Toggle (Chọn/Hủy Chọn) một câu hỏi từ ngân hàng vào đề thi.
   * Nếu đã có thì xóa khỏi mảng `questionIds`, chưa có thì push vào mảng.
   */
  const toggleQuestion = (question: QuestionListItemResponse) => {
    const isSelected = questionIds.includes(question.id);
    if (isSelected) {
      setValue('questionIds', questionIds.filter(id => id !== question.id), { shouldValidate: true });
    } else {
      setValue('questionIds', [...questionIds, question.id], { shouldValidate: true });
    }
  };

  /**
   * Xóa trực tiếp một câu hỏi khỏi danh sách đã chọn ở cột trái.
   */
  const removeQuestionId = (id: number) => {
    setValue('questionIds', questionIds.filter(qid => qid !== id), { shouldValidate: true });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="diagnostic-modal-content">
        {/* Header Modal */}
        <div className="modal-header">
          <h2 className="modal-title">
            {data ? 'Sửa Đề Thi Chẩn Đoán' : 'Tạo Đề Thi Chẩn Đoán Mới'}
          </h2>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="diagnostic-modal-body">
          
          {/* CỘT TRÁI: Form Input & Danh sách "Câu hỏi đã chọn" */}
          <div className="diagnostic-col-left">
            
            {/* Form Input (Top section) */}
            <form id="diagnostic-form" onSubmit={handleSubmit(onSubmit)} className="diagnostic-form-top">
              <div className="form-group">
                <label className="form-label">Tiêu đề đề thi <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  {...register('title')}
                  className="form-input"
                  placeholder="VD: Đề thi đầu vào tháng 9"
                />
                {errors.title && <p className="form-error">{errors.title.message}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="status"
                  {...register('status')}
                  style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
                />
                <label htmlFor="status" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                  Kích hoạt (Cho phép làm bài)
                </label>
              </div>
            </form>

            {/* Danh sách "Đã Chọn" (Bottom section) */}
            <div className="diagnostic-selected-area">
              <div className="diagnostic-selected-header">
                <h3>Câu hỏi đã chọn</h3>
                
                {/* HIỂN THỊ RÕ RÀNG TỔNG SỐ LƯỢNG - Đảm bảo Admin kiểm soát tốt đề thi dài (ví dụ 100 câu) */}
                <span className="diagnostic-selected-count">
                  {questionIds.length} câu
                </span>
              </div>
              
              <div className="diagnostic-selected-list">
                {errors.questionIds && <p className="form-error">{errors.questionIds.message}</p>}
                
                {questionIds.length === 0 ? (
                  <div className="diagnostic-selected-empty">
                    Chưa chọn câu hỏi nào.
                  </div>
                ) : (
                  questionIds.map((id, index) => {
                    // Truy xuất thông tin từ Cache
                    const qData = selectedQuestionsCache[id];
                    return (
                      <div key={id} className="diagnostic-selected-item">
                        <div className="index">{index + 1}.</div>
                        <div className="content">
                          {/* Nếu không có trong cache, chỉ hiển thị số ID để tránh lỗi vỡ UI */}
                          <div className="title">{qData ? qData.name : `Câu hỏi ID: ${id}`}</div>
                          {qData && <div className="desc">{qData.questionSummary}</div>}
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeQuestionId(id)}
                          className="remove-btn"
                          title="Xóa khỏi đề thi"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Ngân hàng câu hỏi (Picker) */}
          <div className="diagnostic-col-right">
            
            {/* Thanh tìm kiếm ngân hàng */}
            <div className="diagnostic-bank-header">
              <h3>Ngân hàng</h3>
              <div className="diagnostic-search-box">
                <input
                  type="text"
                  placeholder="Tìm câu hỏi..."
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchBank(keyword)}
                  className="diagnostic-search-input"
                />
                <Search size={16} className="diagnostic-search-icon" />
              </div>
              <button 
                type="button"
                onClick={() => handleSearchBank(keyword)}
                className="btn-search"
              >
                Tìm
              </button>
            </div>
            
            {/* Danh sách ngân hàng để Pick */}
            <div className="diagnostic-bank-list">
              {isSearching ? (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '1rem 0', fontSize: '0.875rem' }}>Đang tìm kiếm...</div>
              ) : bankQuestions.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2.5rem 0', fontSize: '0.875rem' }}>Không tìm thấy câu hỏi.</div>
              ) : (
                <div className="diagnostic-bank-grid">
                  {bankQuestions.map(q => {
                    const isSelected = questionIds.includes(q.id);
                    return (
                      <div 
                        key={q.id}
                        onClick={() => toggleQuestion(q)}
                        className={`diagnostic-bank-item ${isSelected ? 'selected' : ''}`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => {}} 
                        />
                        <div className="content">
                          <div className="title" title={q.name}>{q.name}</div>
                          <div className="desc" title={q.questionSummary}>{q.questionSummary}</div>
                          <div className="ability-tag">
                            {q.abilityName}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer: Action Buttons */}
        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Hủy
          </button>
          
          {/* Nút Submit liên kết với form qua id="diagnostic-form" */}
          <button
            form="diagnostic-form"
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Đang lưu...' : 'Lưu Đề Thi'}
          </button>
        </div>
      </div>
    </div>
  );
};

