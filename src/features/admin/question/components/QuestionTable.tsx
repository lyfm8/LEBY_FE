import React from 'react';
import type { QuestionListItemResponse } from '../types';
import { Edit2, Trash2 } from 'lucide-react';

interface QuestionTableProps {
  questions: QuestionListItemResponse[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}

export const QuestionTable: React.FC<QuestionTableProps> = ({ questions, onEdit, onDelete, isLoading }) => {
  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '2.5rem', color: '#6b7280' }}>Đang tải dữ liệu...</div>;
  }

  return (
    <div className="table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Tên / Nội dung câu hỏi</th>
            <th>Section & Part</th>
            <th>Loại</th>
            <th>Độ khó</th>
            <th style={{ textAlign: 'right' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {questions.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                Không tìm thấy câu hỏi nào
              </td>
            </tr>
          ) : (
            questions.map((q) => (
              <tr key={q.id}>
                <td>
                  <div className="question-text" title={q.name}>{q.name}</div>
                  <div className="question-detail-text">Thuộc: {q.abilities?.map(a => a.name).join(', ') || 'Chưa phân loại'}</div>
                </td>
                <td>
                  <span className={`badge ${q.section === 'LISTENING' ? 'badge-blue' : 'badge-orange'}`}>
                    {q.section}
                  </span>
                  <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#6b7280' }}>
                    Part {q.part?.name || '?'}
                  </div>
                </td>
                <td>
                  <span className="badge badge-gray">{q.type}</span>
                </td>
                <td>
                  <span className={`badge ${
                    q.difficulty === 'EASY' ? 'badge-green' :
                    q.difficulty === 'MEDIUM' ? 'badge-blue' :
                    q.difficulty === 'HARD' ? 'badge-orange' : 'badge-red'
                  }`}>
                    {q.difficulty}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => onEdit(q.id)}
                      className="btn-icon primary"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(q.id)}
                      className="btn-icon danger"
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
