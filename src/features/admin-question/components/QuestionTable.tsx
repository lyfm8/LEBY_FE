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
    return <div className="text-center py-10 text-gray-500">Đang tải danh sách câu hỏi...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3 font-medium">Mã CH</th>
            <th className="px-6 py-3 font-medium">Nội dung tóm tắt</th>
            <th className="px-6 py-3 font-medium">Part / Kỹ năng</th>
            <th className="px-6 py-3 font-medium">Năng lực (Ability)</th>
            <th className="px-6 py-3 font-medium text-center">Độ khó</th>
            <th className="px-6 py-3 font-medium text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {questions.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                Không có câu hỏi nào khớp với bộ lọc
              </td>
            </tr>
          ) : (
            questions.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {q.name}
                </td>
                <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={q.questionSummary}>
                  {q.questionSummary}
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-900">{q.partName}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{q.section}</div>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                    {q.abilityName}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-0.5 text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < q.difficulty ? 'opacity-100' : 'opacity-20'}>★</span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => onEdit(q.id)}
                    className="text-blue-600 hover:text-blue-800 p-1 mr-2 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(q.id)}
                    className="text-red-500 hover:text-red-700 p-1 transition-colors"
                    title="Xóa câu hỏi"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
