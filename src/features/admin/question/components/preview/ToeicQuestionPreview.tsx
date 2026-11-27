import React, { useState } from 'react';
import { Eye, Volume2 } from 'lucide-react';
import type { QuestionDetail } from '../../types';

interface ToeicQuestionPreviewProps {
    question: Partial<QuestionDetail>;
}

export const ToeicQuestionPreview: React.FC<ToeicQuestionPreviewProps> = ({ question }) => {
    const isListening = question.section === 'LISTENING';
    const isReading = question.section === 'READING';
    const isGroup = question.isGroup || (question.items && question.items.length > 0);

    const audioMedia = question.medias?.find((m) => m.kind === 'AUDIO');
    const imageMedias = question.medias?.filter((m) => m.kind === 'IMAGE') || [];

    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

    const handleSelectOption = (questionIndex: number, key: string) => {
        setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: key }));
    };

    return (
        <div className="toeic-preview-card">
            {/* Header giả lập giao diện bài thi TOEIC */}
            <div className="toeic-preview-banner">
                <div className="toeic-preview-title">
                    <span style={{ backgroundColor: '#ea580c', color: 'white', fontSize: '0.6875rem', padding: '0.15rem 0.45rem', borderRadius: '0.25rem' }}>
                        {question.partName || (isListening ? 'Listening' : 'Reading')}
                    </span>
                    <span>Mô phỏng giao diện phòng thi TOEIC</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Eye size={14} /> Chế độ học viên làm bài
                </div>
            </div>

            <div>
                {/* 1. Phần thi LISTENING */}
                {isListening && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Audio bài nghe */}
                        {audioMedia && (
                            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Volume2 color="#2563eb" size={22} style={{ flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e40af', marginBottom: '0.25rem' }}>
                                        TOEIC Listening Audio Clip:
                                    </div>
                                    <audio controls src={audioMedia.url} style={{ width: '100%', height: '32px' }}>
                                        Trình duyệt không hỗ trợ audio.
                                    </audio>
                                </div>
                            </div>
                        )}

                        {/* Part 1: Ảnh lớn miêu tả tranh */}
                        {imageMedias.length > 0 && !isGroup && (
                            <div style={{ display: 'flex', justifyContent: 'center', margin: '0.75rem 0' }}>
                                <img
                                    src={imageMedias[0].url}
                                    alt="TOEIC Part 1 Photograph"
                                    style={{ maxHeight: '280px', borderRadius: '0.5rem', border: '1px solid #d1d5db', objectFit: 'contain' }}
                                />
                            </div>
                        )}

                        {/* Câu đơn (Part 1, Part 2) */}
                        {!isGroup && (
                            <div>
                                {question.text && (
                                    <p className="toeic-q-stem">{question.text}</p>
                                )}
                                <div className="toeic-options-list">
                                    {(question.options || []).map((opt) => (
                                        <label
                                            key={opt.key}
                                            className={`toeic-option-card ${selectedAnswers[0] === opt.key ? 'highlight-correct' : ''}`}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleSelectOption(0, opt.key)}
                                        >
                                            <input
                                                type="radio"
                                                name="preview-single-radio"
                                                checked={selectedAnswers[0] === opt.key}
                                                onChange={() => {}}
                                                style={{ accentColor: '#ea580c' }}
                                            />
                                            <span style={{ fontWeight: 700, color: '#374151' }}>({opt.key})</span>
                                            <span style={{ color: '#111827' }}>{opt.text || `Lựa chọn ${opt.key}`}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Chùm câu hỏi Part 3/4 */}
                        {isGroup && question.items && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '0.5rem' }}>
                                {question.instruction && (
                                    <div style={{ fontSize: '0.8125rem', fontStyle: 'italic', color: '#4b5563', backgroundColor: '#f9fafb', padding: '0.625rem 0.875rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}>
                                        {question.instruction}
                                    </div>
                                )}
                                {question.items.map((item, idx) => (
                                    <div key={idx} style={{ padding: '0.875rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', backgroundColor: '#fafbfc' }}>
                                        <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem', marginBottom: '0.625rem' }}>
                                            <span style={{ color: '#ea580c', fontWeight: 700, marginRight: '0.375rem' }}>Câu {idx + 1}.</span>
                                            {item.text || item.name}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem' }}>
                                            {item.options.map((opt) => (
                                                <label
                                                    key={opt.key}
                                                    className={`toeic-option-card ${selectedAnswers[idx + 1] === opt.key ? 'highlight-correct' : ''}`}
                                                    style={{ cursor: 'pointer', padding: '0.5rem 0.75rem' }}
                                                    onClick={() => handleSelectOption(idx + 1, opt.key)}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`preview-group-q-${idx}`}
                                                        checked={selectedAnswers[idx + 1] === opt.key}
                                                        onChange={() => {}}
                                                        style={{ accentColor: '#ea580c' }}
                                                    />
                                                    <span style={{ fontWeight: 700 }}>({opt.key})</span>
                                                    <span>{opt.text}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 2. Phần thi READING */}
                {isReading && (
                    <div>
                        {/* Part 5: Câu đơn điền từ */}
                        {!isGroup && (
                            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                                <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#111827', marginBottom: '1rem', lineHeight: 1.6, padding: '1rem', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                                    {question.text || 'The manager _____ the new budget.'}
                                </div>
                                <div className="toeic-options-list">
                                    {(question.options || []).map((opt) => (
                                        <label
                                            key={opt.key}
                                            className={`toeic-option-card ${selectedAnswers[0] === opt.key ? 'highlight-correct' : ''}`}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleSelectOption(0, opt.key)}
                                        >
                                            <input
                                                type="radio"
                                                name="preview-reading-single"
                                                checked={selectedAnswers[0] === opt.key}
                                                onChange={() => {}}
                                                style={{ accentColor: '#ea580c' }}
                                            />
                                            <span style={{ fontWeight: 700 }}>({opt.key})</span>
                                            <span>{opt.text}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Part 6 / Part 7: SPLIT-SCREEN READING */}
                        {isGroup && (
                            <div className="toeic-preview-split">
                                {/* Cột trái: Đoạn văn đọc hiểu */}
                                <div className="toeic-passage-view">
                                    {question.instruction && (
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                                            {question.instruction}
                                        </div>
                                    )}
                                    {imageMedias.length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                                            {imageMedias.map((img, i) => (
                                                <img
                                                    key={i}
                                                    src={img.url}
                                                    alt="Reading passage scan"
                                                    style={{ width: '100%', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {question.passage && (
                                        <div style={{ whiteSpace: 'pre-wrap' }}>
                                            {question.passage}
                                        </div>
                                    )}
                                </div>

                                {/* Cột phải: Các câu hỏi trắc nghiệm */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                                    {(question.items || []).map((item, idx) => (
                                        <div
                                            key={idx}
                                            style={{ padding: '0.875rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', backgroundColor: '#ffffff' }}
                                        >
                                            <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem', marginBottom: '0.625rem' }}>
                                                <span style={{ color: '#ea580c', fontWeight: 700, marginRight: '0.375rem' }}>
                                                    Câu {idx + 1}.
                                                </span>
                                                {item.text || item.name}
                                            </div>
                                            <div className="toeic-options-list">
                                                {item.options.map((opt) => (
                                                    <label
                                                        key={opt.key}
                                                        className={`toeic-option-card ${selectedAnswers[idx + 1] === opt.key ? 'highlight-correct' : ''}`}
                                                        style={{ cursor: 'pointer', padding: '0.45rem 0.65rem', fontSize: '0.8125rem' }}
                                                        onClick={() => handleSelectOption(idx + 1, opt.key)}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`preview-reading-q-${idx}`}
                                                            checked={selectedAnswers[idx + 1] === opt.key}
                                                            onChange={() => {}}
                                                            style={{ accentColor: '#ea580c' }}
                                                        />
                                                        <span style={{ fontWeight: 700 }}>({opt.key})</span>
                                                        <span>{opt.text}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
