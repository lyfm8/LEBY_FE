import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { diagnosticTestSchema, DiagnosticTestFormValues } from '../utils/schema';
import { adminQuestionService } from '@/features/admin-question/services/adminQuestionService';
import type { QuestionListItemResponse, QuestionFilterParams } from '@/features/admin-question/types';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <h2 className="text-xl font-bold text-gray-800">
            {data ? 'Sửa Đề Thi Chẩn Đoán' : 'Tạo Đề Thi Chẩn Đoán Mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* CỘT TRÁI: Form Input & Danh sách "Câu hỏi đã chọn" */}
          <div className="w-full md:w-5/12 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
            
            {/* Form Input (Top section) */}
            <form id="diagnostic-form" onSubmit={handleSubmit(onSubmit)} className="p-4 border-b border-gray-100 space-y-4 overflow-y-auto shrink-0 max-h-[40%]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề đề thi <span className="text-red-500">*</span></label>
                <input
                  {...register('title')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                  placeholder="VD: Đề thi đầu vào tháng 9"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="status"
                  {...register('status')}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="status" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Kích hoạt (Cho phép làm bài)
                </label>
              </div>
            </form>

            {/* Danh sách "Đã Chọn" (Bottom section) */}
            <div className="flex-1 flex flex-col overflow-hidden bg-blue-50/20">
              <div className="p-3 border-b border-gray-100 bg-blue-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">Câu hỏi đã chọn</h3>
                
                {/* HIỂN THỊ RÕ RÀNG TỔNG SỐ LƯỢNG - Đảm bảo Admin kiểm soát tốt đề thi dài (ví dụ 100 câu) */}
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                  {questionIds.length} câu
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {errors.questionIds && <p className="text-red-500 text-xs mb-2">{errors.questionIds.message}</p>}
                
                {questionIds.length === 0 ? (
                  <div className="text-center text-gray-400 py-6 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                    Chưa chọn câu hỏi nào.
                  </div>
                ) : (
                  questionIds.map((id, index) => {
                    // Truy xuất thông tin từ Cache
                    const qData = selectedQuestionsCache[id];
                    return (
                      <div key={id} className="p-2 border border-gray-200 rounded-md bg-white hover:border-blue-300 group flex items-start gap-2">
                        <div className="text-xs font-bold text-gray-400 mt-0.5 w-6 text-right shrink-0">{index + 1}.</div>
                        <div className="flex-1 min-w-0">
                          {/* Nếu không có trong cache, chỉ hiển thị số ID để tránh lỗi vỡ UI */}
                          <div className="font-medium text-sm text-gray-800">{qData ? qData.name : `Câu hỏi ID: ${id}`}</div>
                          {qData && <div className="text-xs text-gray-500 truncate">{qData.questionSummary}</div>}
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeQuestionId(id)}
                          className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
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
          <div className="w-full md:w-7/12 flex flex-col bg-slate-50">
            
            {/* Thanh tìm kiếm ngân hàng */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3 shrink-0">
              <h3 className="font-semibold text-gray-700 whitespace-nowrap">Ngân hàng</h3>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tìm câu hỏi..."
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchBank(keyword)}
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500"
                />
                <Search size={16} className="absolute left-3 top-2 text-gray-400" />
              </div>
              <button 
                type="button"
                onClick={() => handleSearchBank(keyword)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
              >
                Tìm
              </button>
            </div>
            
            {/* Danh sách ngân hàng để Pick */}
            <div className="flex-1 overflow-y-auto p-4">
              {isSearching ? (
                <div className="text-center text-gray-500 py-4 text-sm">Đang tìm kiếm...</div>
              ) : bankQuestions.length === 0 ? (
                <div className="text-center text-gray-400 py-10 text-sm">Không tìm thấy câu hỏi.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bankQuestions.map(q => {
                    const isSelected = questionIds.includes(q.id);
                    return (
                      <div 
                        key={q.id}
                        onClick={() => toggleQuestion(q)}
                        className={`p-3 border rounded-md cursor-pointer transition-colors flex items-start gap-3 ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => {}} 
                          className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 pointer-events-none"
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate" title={q.name}>{q.name}</div>
                          <div className="text-xs text-gray-500 truncate my-1" title={q.questionSummary}>{q.questionSummary}</div>
                          <div className="text-xs text-blue-600 bg-blue-100 inline-block px-1.5 py-0.5 rounded truncate max-w-full">
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
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
          >
            Hủy
          </button>
          
          {/* Nút Submit liên kết với form qua id="diagnostic-form" */}
          <button
            form="diagnostic-form"
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? 'Đang lưu...' : 'Lưu Đề Thi'}
          </button>
        </div>
      </div>
    </div>
  );
};

