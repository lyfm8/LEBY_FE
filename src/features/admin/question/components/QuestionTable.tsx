import React, { useState } from 'react';
import {
    ChevronDown,
    ChevronRight,
    Edit2,
    Loader2,
    RotateCcw,
    Search,
    Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { QuestionListItem } from '../types';
import { GroupSubQuestionsList } from './list/GroupSubQuestionsList';
import { MediaKindIcon } from './media/MediaKindIcon';

interface QuestionTableProps {
    questions: QuestionListItem[];
    isLoading: boolean;
    onDelete: (id: number, name: string, isGroup: boolean) => void;
    onResetFilters: () => void;
}

export const QuestionTable: React.FC<QuestionTableProps> = ({
    questions,
    isLoading,
    onDelete,
    onResetFilters,
}) => {
    const navigate = useNavigate();
    const [expandedGroupIds, setExpandedGroupIds] = useState<Set<number>>(new Set());

    const toggleExpand = (id: number) => {
        const next = new Set(expandedGroupIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setExpandedGroupIds(next);
    };

    const formatDate = (isoString?: string): string => {
        if (!isoString) return '-';
        try {
            const d = new Date(isoString);
            return d.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        } catch {
            return isoString;
        }
    };

    const renderDifficultyBadge = (difficulty: number) => {
        const labels: Record<number, string> = {
            1: 'Rất dễ',
            2: 'Dễ',
            3: 'Vừa',
            4: 'Khó',
            5: 'Rất khó',
        };
        const text = labels[difficulty] || 'Vừa';
        return (
            <span className={`diff-badge diff-${difficulty}`}>
                {text}
            </span>
        );
    };

    if (isLoading) {
        return (
            <div className="question-empty-card">
                <Loader2
                    size={32}
                    className="empty-icon-bubble"
                    style={{ animation: 'spin 1s linear infinite', color: '#ea580c', backgroundColor: '#fffaf5' }}
                />
                <h3 className="empty-title">Đang tải dữ liệu...</h3>
                <p className="empty-desc">Hệ thống đang truy xuất kho ngân hàng câu hỏi từ cơ sở dữ liệu.</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="question-empty-card">
                <div className="empty-icon-bubble">
                    <Search size={24} />
                </div>
                <h3 className="empty-title">Không tìm thấy câu hỏi</h3>
                <p className="empty-desc">
                    Thử từ khóa khác hoặc xóa bớt bộ lọc để xem thêm kết quả trong ngân hàng câu hỏi.
                </p>
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={onResetFilters}
                >
                    <RotateCcw size={14} />
                    <span>Xóa bộ lọc & tìm lại</span>
                </button>
            </div>
        );
    }

    return (
        <div className="question-table-card">
            <div className="question-table-wrapper">
                <table className="question-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px', textAlign: 'center' }}></th>
                            <th>Mã & Nội dung câu hỏi</th>
                            <th>Part / Cấu trúc</th>
                            <th>Media</th>
                            <th>Độ khó</th>
                            <th>Cập nhật</th>
                            <th style={{ textAlign: 'right', paddingRight: '1.25rem' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {questions.map((q) => {
                            const isGroup = q.isGroup;
                            const isExpanded = expandedGroupIds.has(q.id);

                            return (
                                <React.Fragment key={q.id}>
                                    <tr className={isExpanded ? 'expanded-parent' : ''}>
                                        {/* Nút mở rộng chùm */}
                                        <td className="col-code-cell">
                                            {isGroup && (
                                                <button
                                                    type="button"
                                                    className="col-expand-btn"
                                                    onClick={() => toggleExpand(q.id)}
                                                    title={isExpanded ? 'Thu gọn' : 'Mở rộng chùm câu hỏi'}
                                                >
                                                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                </button>
                                            )}
                                        </td>

                                        {/* Mã & Tên & Nội dung tóm tắt */}
                                        <td style={{ maxWidth: '380px' }}>
                                            <div className="question-meta-row">
                                                <span className={`code-pill ${isGroup ? 'group' : 'standalone'}`}>
                                                    {isGroup ? `G-${q.id}` : `Q-${q.id}`}
                                                </span>
                                                {isGroup && (
                                                    <span className="group-counter-tag">
                                                        Chùm · {q.itemCount || 3} câu
                                                    </span>
                                                )}
                                            </div>
                                            <div className="question-item-name">{q.name}</div>
                                            {q.summary && (
                                                <div className="question-item-summary">{q.summary}</div>
                                            )}
                                        </td>

                                        {/* Part / Dạng cấu trúc */}
                                        <td>
                                            <div className="part-text-primary">{q.partName || '-'}</div>
                                            <div className="part-text-secondary">
                                                {isGroup ? 'Chùm MCQ' : 'Câu đơn MCQ'}
                                            </div>
                                        </td>

                                        {/* Media */}
                                        <td>
                                            {q.mediaKinds && q.mediaKinds.length > 0 ? (
                                                <div className="media-badges-group">
                                                    {q.mediaKinds.map((kind, idx) => (
                                                        <span key={idx} className="media-pill">
                                                            <MediaKindIcon kind={kind} size={13} />
                                                            <span>{kind}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ color: '#d1d5db' }}>—</span>
                                            )}
                                        </td>

                                        {/* Độ khó */}
                                        <td>{renderDifficultyBadge(q.difficulty || 3)}</td>

                                        {/* Ngày cập nhật */}
                                        <td style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                                            {formatDate(q.updatedAt)}
                                        </td>

                                        {/* Thao tác */}
                                        <td style={{ textAlign: 'right', paddingRight: '1.25rem' }}>
                                            <div className="table-actions">
                                                <button
                                                    type="button"
                                                    className="table-btn edit"
                                                    onClick={() =>
                                                        navigate(
                                                            isGroup
                                                                ? `/admin/question-groups/${q.id}/edit`
                                                                : `/admin/questions/${q.id}/edit`
                                                        )
                                                    }
                                                    title="Chỉnh sửa câu hỏi"
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="table-btn delete"
                                                    onClick={() => onDelete(q.id, q.name, isGroup)}
                                                    title="Xóa câu hỏi khỏi ngân hàng"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Hàng mở rộng nếu là chùm câu hỏi */}
                                    {isGroup && isExpanded && (
                                        <tr>
                                            <td colSpan={7} style={{ padding: 0 }}>
                                                <GroupSubQuestionsList groupId={q.id} />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
