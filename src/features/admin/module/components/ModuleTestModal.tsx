import React, { useEffect, useState, useCallback } from 'react';
import { adminModuleTestService } from '../services/adminModuleTestService';
import { adminQuestionService } from '@/features/admin/question/services/adminQuestionService';
import type { QuestionListItemResponse, QuestionFilterParams } from '@/features/admin/question/types';
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
    <div className="modal-overlay">
      <div className="modal-content large" style={{ display: 'flex', flexDirection: 'column', height: '85vh', padding: 0 }}>
        {/* Header */}
        <div className="modal-header" style={{ padding: '1.5rem', marginBottom: 0 }}>
          <div>
            <h2 className="modal-title">Cấu hình Bài Kiểm Tra</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>{moduleName}</p>
          </div>
          <button onClick={onClose} className="modal-close">
            <X size={24} />
          </button>
        </div>

        {/* Body 2 cột */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* Cột trái: Đã chọn */}
          <div style={{ width: '33.333%', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', backgroundColor: '#eff6ff' }}>
              <h3 style={{ fontWeight: 600, color: '#374151', margin: 0 }}>Câu hỏi trong Bài Test ({selectedQuestions.length})</h3>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {isLoadingSelected ? (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '1rem 0', fontSize: '0.875rem' }}>Đang tải...</div>
              ) : selectedQuestions.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2.5rem 0', fontSize: '0.875rem', border: '2px dashed #e5e7eb', borderRadius: '0.5rem' }}>
                  Chưa có câu hỏi nào. Hãy chọn từ ngân hàng bên phải.
                </div>
              ) : (
                selectedQuestions.map((q, index) => (
                  <div key={q.id} style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.375rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9ca3af', width: '1.25rem' }}>{index + 1}.</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem', color: '#1f2937' }}>{q.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.questionSummary}</div>
                    </div>
                    <button 
                      onClick={() => removeSelected(q.id)}
                      className="btn-icon danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cột phải: Ngân hàng */}
          <div style={{ width: '66.666%', display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h3 style={{ fontWeight: 600, color: '#374151', margin: 0, whiteSpace: 'nowrap' }}>Ngân hàng câu hỏi</h3>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi..."
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearchBank(keyword)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '0.6rem', color: '#9ca3af' }} />
              </div>
              <button 
                onClick={() => handleSearchBank(keyword)}
                className="btn-secondary"
              >
                Tìm
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {isSearching ? (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '1rem 0', fontSize: '0.875rem' }}>Đang tìm kiếm...</div>
              ) : bankQuestions.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2.5rem 0', fontSize: '0.875rem' }}>Không tìm thấy câu hỏi nào.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {bankQuestions.map(q => {
                    const isSelected = selectedQuestions.some(sq => sq.id === q.id);
                    return (
                      <div 
                        key={q.id}
                        onClick={() => toggleQuestion(q)}
                        style={{ padding: '0.75rem', border: '1px solid', borderColor: isSelected ? '#3b82f6' : '#e5e7eb', backgroundColor: isSelected ? '#eff6ff' : 'white', borderRadius: '0.375rem', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}
                      >
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => {}} 
                          style={{ marginTop: '0.25rem' }}
                        />
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem', color: '#111827' }}>{q.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.questionSummary}</div>
                          <div className="badge badge-blue">
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
        <div className="modal-footer" style={{ padding: '1rem 1.5rem', backgroundColor: 'white' }}>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu Bài Test'}
          </button>
        </div>
      </div>
    </div>
  );
};
