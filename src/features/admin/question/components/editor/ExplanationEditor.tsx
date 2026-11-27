import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import type { QuestionExplanation, QuestionVocabularyItem } from '../../types';

interface ExplanationEditorProps {
    explanation: QuestionExplanation;
    onChange: (explanation: QuestionExplanation) => void;
}

export const ExplanationEditor: React.FC<ExplanationEditorProps> = ({
    explanation,
    onChange,
}) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    const handleFieldChange = (field: keyof QuestionExplanation, value: any) => {
        onChange({
            ...explanation,
            [field]: value,
        });
    };

    const handleAddVocab = () => {
        const current = explanation.vocabulary || [];
        onChange({
            ...explanation,
            vocabulary: [...current, { word: '', type: 'n', meaning: '' }],
        });
    };

    const handleUpdateVocab = (index: number, field: keyof QuestionVocabularyItem, value: string) => {
        const current = [...(explanation.vocabulary || [])];
        if (current[index]) {
            current[index] = { ...current[index], [field]: value };
            onChange({ ...explanation, vocabulary: current });
        }
    };

    const handleRemoveVocab = (index: number) => {
        const current = (explanation.vocabulary || []).filter((_, idx) => idx !== index);
        onChange({ ...explanation, vocabulary: current });
    };

    return (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#fafbfc' }}>
            <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div>
                    <h4 style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                        Giải thích chi tiết đáp án & Dịch nghĩa
                    </h4>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                        Lời giải và từ vựng học thuật sẽ hiển thị cho học viên sau khi hoàn thành bài thi
                    </p>
                </div>
                <button type="button" style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.25rem' }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
            </div>

            {isExpanded && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.875rem' }}>
                        <div>
                            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                                Lời thoại / Transcript (nếu có)
                            </label>
                            <textarea
                                className="form-textarea"
                                style={{ minHeight: '70px', fontSize: '0.8125rem' }}
                                placeholder="Nhập lời thoại nghe..."
                                value={explanation.transcript || ''}
                                onChange={(e) => handleFieldChange('transcript', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                                Bản dịch Tiếng Việt
                            </label>
                            <textarea
                                className="form-textarea"
                                style={{ minHeight: '70px', fontSize: '0.8125rem' }}
                                placeholder="Nhập bản dịch nghĩa..."
                                value={explanation.translation || ''}
                                onChange={(e) => handleFieldChange('translation', e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.875rem' }}>
                        <div>
                            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                                Manh mối tìm đáp án (Clue)
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                style={{ fontSize: '0.8125rem' }}
                                placeholder="Dấu hiệu trong bài giúp chọn đáp án..."
                                value={explanation.clue || ''}
                                onChange={(e) => handleFieldChange('clue', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                                Phân tích ngữ pháp / Ngữ cảnh
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                style={{ fontSize: '0.8125rem' }}
                                placeholder="Tại sao đáp án này đúng, các phương án khác sai..."
                                value={explanation.analysis || ''}
                                onChange={(e) => handleFieldChange('analysis', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Từ vựng nổi bật */}
                    <div style={{ paddingTop: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>
                                Từ vựng học thuật quan trọng
                            </span>
                            <button
                                type="button"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    fontSize: '0.75rem',
                                    color: '#ea580c',
                                    fontWeight: 600,
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                                onClick={handleAddVocab}
                            >
                                <Plus size={14} /> Thêm từ vựng
                            </button>
                        </div>

                        {(!explanation.vocabulary || explanation.vocabulary.length === 0) ? (
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>
                                Chưa thêm từ vựng nào.
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {explanation.vocabulary.map((v, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            style={{ flex: 1, padding: '0.375rem 0.5rem', fontSize: '0.75rem' }}
                                            placeholder="Từ vựng (word)..."
                                            value={v.word}
                                            onChange={(e) => handleUpdateVocab(idx, 'word', e.target.value)}
                                        />
                                        <select
                                            className="form-select"
                                            style={{ width: '120px', padding: '0.375rem 0.5rem', fontSize: '0.75rem' }}
                                            value={v.type}
                                            onChange={(e) => handleUpdateVocab(idx, 'type', e.target.value)}
                                        >
                                            <option value="n">Danh từ (n)</option>
                                            <option value="v">Động từ (v)</option>
                                            <option value="adj">Tính từ (adj)</option>
                                            <option value="adv">Trạng từ (adv)</option>
                                            <option value="prep">Giới từ (prep)</option>
                                            <option value="conj">Liên từ (conj)</option>
                                            <option value="phrase">Cụm từ (phrase)</option>
                                        </select>
                                        <input
                                            type="text"
                                            className="form-input"
                                            style={{ flex: 1, padding: '0.375rem 0.5rem', fontSize: '0.75rem' }}
                                            placeholder="Nghĩa tiếng Việt..."
                                            value={v.meaning}
                                            onChange={(e) => handleUpdateVocab(idx, 'meaning', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="btn-icon danger"
                                            style={{ padding: '0.25rem' }}
                                            onClick={() => handleRemoveVocab(idx)}
                                            title="Xóa từ vựng"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
