import React from 'react';
import type { PartResponse } from '../types';
import { Layers, Headphones, BookOpen } from 'lucide-react';

interface PartListProps {
  parts: PartResponse[];
  selectedPartId: number | null;
  onSelectPart: (id: number) => void;
  isLoading: boolean;
}

/**
 * Component hiển thị danh sách 7 Parts ở cột bên trái
 */
export const PartList: React.FC<PartListProps> = ({ parts, selectedPartId, onSelectPart, isLoading }) => {
  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Đang tải danh sách Part...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
        <Layers size={18} className="text-gray-500" />
        <h3 className="font-semibold text-gray-700">Danh sách Part (TOEIC)</h3>
      </div>
      <div className="overflow-y-auto flex-1 p-2">
        {parts.map(part => {
          const isSelected = selectedPartId === part.id;
          const isListening = part.section === 'LISTENING';
          return (
            <button
              key={part.id}
              onClick={() => onSelectPart(part.id)}
              className={`w-full text-left px-4 py-3 rounded-md mb-1 transition-colors border ${
                isSelected 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-white border-transparent hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-sm">{part.name}</span>
                {isListening ? (
                  <Headphones size={14} className={isSelected ? 'text-blue-500' : 'text-purple-500'} />
                ) : (
                  <BookOpen size={14} className={isSelected ? 'text-blue-500' : 'text-green-500'} />
                )}
              </div>
              <div className="flex justify-between items-center text-xs mt-2">
                <span className={`px-2 py-0.5 rounded-full ${isListening ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                  {part.section}
                </span>
                <span className="text-gray-500">{part.totalQuestions} câu hỏi</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
