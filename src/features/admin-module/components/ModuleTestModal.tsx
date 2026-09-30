import React, { useEffect, useState, useCallback } from 'react';
import { adminModuleTestService } from '../services/adminModuleTestService';
import { adminQuestionService } from '@/features/admin-question/services/adminQuestionService';
import type { QuestionListItemResponse, QuestionFilterParams } from '@/features/admin-question/types';
import { X, Search, Trash2 } from 'lucide-react';

interface ModuleTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: number | null;
  moduleName: string;
}

export const ModuleTestModal: React.FC<ModuleTestModalProps> = ({
  isOpen, onClose, moduleId, moduleName
}) => {
  // State quản lý danh sách câu hỏi đang có của Module này
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionListItemResponse[]>([]);
  const [isLoadingSelected, setIsLoadingSelected] = useState(false);

  // State quản lý tìm kiếm từ Ngân hàng câu hỏi
  const [bankQuestions, setBankQuestions] = useState<QuestionListItemResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [keyword, setKeyword] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  // Tải danh sách câu hỏi hiện tại của bài Test
  useEffect(() => {
    if (isOpen && moduleId) {
      const fetchCurrentTestQuestions = async () => {
        setIsLoadingSelected(true);
        try {
          const res = await adminModuleTestService.getTestQuestions(moduleId);
          if (res.success && res.data) {
            setSelectedQuestions(res.data);
          }
        } catch (error) {
          console.error('Failed to fetch test questions:', error);
        } finally {
          setIsLoadingSelected(false);
        }
      };
      fetchCurrentTestQuestions();
      // Search mặc định ban đầu
      handleSearchBank();
    }
  }, [isOpen, moduleId]);

  // Tìm kiếm ngân hàng câu hỏi
  const handleSearchBank = useCallback(async (searchKeyword = '') => {
    setIsSearching(true);
    try {
      const params: QuestionFilterParams = { page: 0, pageSize: 20, keyword: searchKeyword };
      const res = await adminQuestionService.getQuestions(params);
      if (res.success && res.data) {
        setBankQuestions(res.data);
      }
    } catch (error) {
      console.error('Failed to search bank:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Xử lý Thêm / Bớt câu hỏi
  const toggleQuestion = (question: QuestionListItemResponse) => {
    const isSelected = selectedQuestions.some(q => q.id === question.id);
    if (isSelected) {
      setSelectedQuestions(prev => prev.filter(q => q.id !== question.id));
    } else {
      setSelectedQuestions(prev => [...prev, question]);
    }
  };

  const removeSelected = (id: number) => {
    setSelectedQuestions(prev => prev.filter(q => q.id !== id));
  };

  // Lưu lại (Gửi mảng ID về BE)
  const handleSave = async () => {
    if (!moduleId) return;
    setIsSaving(true);
    try {
      const questionIds = selectedQuestions.map(q => q.id);
      await adminModuleTestService.updateTestQuestions(moduleId, { questionIds });
      alert('Đã cập nhật bài Test thành công!');
      onClose();
    } catch (error) {
      console.error('Save test questions failed:', error);
      alert('Cập nhật thất bại. (Lưu ý: Không thể sửa bài Test nếu học viên đã làm)');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Cấu hình Bài Kiểm Tra</h2>
            <p className="text-sm text-gray-500 mt-1">{moduleName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body 2 cột */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Cột trái: Đã chọn */}
          <div className="w-1/3 border-r border-gray-200 bg-white flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-blue-50/30">
              <h3 className="font-semibold text-gray-700">Câu hỏi trong Bài Test ({selectedQuestions.length})</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {isLoadingSelected ? (
                <div className="text-center text-gray-500 py-4 text-sm">Đang tải...</div>
              ) : selectedQuestions.length === 0 ? (
                <div className="text-center text-gray-400 py-10 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                  Chưa có câu hỏi nào. Hãy chọn từ ngân hàng bên phải.
                </div>
              ) : (
                selectedQuestions.map((q, index) => (
                  <div key={q.id} className="p-3 border border-gray-200 rounded-md bg-white hover:border-blue-300 group flex items-start gap-2">
                    <div className="text-xs font-bold text-gray-400 mt-0.5 w-5">{index + 1}.</div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-800">{q.name}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{q.questionSummary}</div>
                    </div>
                    <button 
                      onClick={() => removeSelected(q.id)}
                      className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cột phải: Ngân hàng */}
          <div className="w-2/3 flex flex-col bg-slate-50">
            <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-4">
              <h3 className="font-semibold text-gray-700 whitespace-nowrap">Ngân hàng câu hỏi</h3>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi..."
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchBank(keyword)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500"
                />
                <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
              <button 
                onClick={() => handleSearchBank(keyword)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
              >
                Tìm
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {isSearching ? (
                <div className="text-center text-gray-500 py-4 text-sm">Đang tìm kiếm...</div>
              ) : bankQuestions.length === 0 ? (
                <div className="text-center text-gray-400 py-10 text-sm">Không tìm thấy câu hỏi nào.</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {bankQuestions.map(q => {
                    const isSelected = selectedQuestions.some(sq => sq.id === q.id);
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
                          onChange={() => {}} // dummy để ngăn warning, onClick ở cha đã xử lý
                          className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300"
                        />
                        <div>
                          <div className="font-medium text-sm text-gray-900">{q.name}</div>
                          <div className="text-xs text-gray-500 line-clamp-1 my-1">{q.questionSummary}</div>
                          <div className="text-xs text-blue-600 bg-blue-100 inline-block px-1.5 py-0.5 rounded">
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

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu Bài Test'}
          </button>
        </div>
      </div>
    </div>
  );
};
