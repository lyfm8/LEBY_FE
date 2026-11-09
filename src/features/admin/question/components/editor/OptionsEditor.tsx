import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { QuestionOption } from '../../types';

interface OptionsEditorProps {
    options: QuestionOption[];
    correctKey: string;
    onOptionsChange: (options: QuestionOption[]) => void;
    onCorrectKeyChange: (key: string) => void;
    error?: string;
    allow3Options?: boolean;
}

export const OptionsEditor: React.FC<OptionsEditorProps> = ({
    options,
    correctKey,
    onOptionsChange,
    onCorrectKeyChange,
    error,
    allow3Options = true,
}) => {
    const handleOptionTextChange = (key: string, text: string) => {
        const next = options.map((opt) => (opt.key === key ? { ...opt, text } : opt));
        onOptionsChange(next);
    };

    const handleSetOptionCount = (count: 3 | 4) => {
        if (count === 3 && options.length > 3) {
            const next = options.slice(0, 3);
            if (correctKey === 'D') {
                onCorrectKeyChange('A');
            }
            onOptionsChange(next);
        } else if (count === 4 && options.length < 4) {
            const next = [...options, { key: 'D', text: '' }];
            onOptionsChange(next);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="form-label" style={{ fontWeight: 600, color: '#111827', margin: 0 }}>
                    Phương án trả lời <span style={{ color: '#dc2626' }}>*</span>
                </label>
                {allow3Options && (
                    <div style={{ display: 'flex', gap: '0.375rem', background: '#f3f4f6', padding: '0.25rem', borderRadius: '0.375rem' }}>
                        <button
                            type="button"
                            style={{
                                padding: '0.25rem 0.625rem',
                                border: 'none',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                backgroundColor: options.length === 3 ? '#ffffff' : 'transparent',
                                color: options.length === 3 ? '#ea580c' : '#6b7280',
                                boxShadow: options.length === 3 ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                            }}
                            onClick={() => handleSetOptionCount(3)}
                        >
                            3 đáp án (Part 2)
                        </button>
                        <button
                            type="button"
                            style={{
                                padding: '0.25rem 0.625rem',
                                border: 'none',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                backgroundColor: options.length === 4 ? '#ffffff' : 'transparent',
                                color: options.length === 4 ? '#ea580c' : '#6b7280',
                                boxShadow: options.length === 4 ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                            }}
                            onClick={() => handleSetOptionCount(4)}
                        >
                            4 đáp án (Part 1, 5, 6, 7)
                        </button>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {options.map((opt) => {
                    const isCorrect = correctKey.toUpperCase() === opt.key.toUpperCase();
                    return (
                        <div
                            key={opt.key}
                            className={`option-item-row ${isCorrect ? 'is-correct' : ''}`}
                        >
                            {/* Radio chọn đáp án đúng */}
                            <div
                                className={`option-radio-control ${isCorrect ? 'checked' : ''}`}
                                onClick={() => onCorrectKeyChange(opt.key)}
                                title="Bấm để chọn đây là đáp án đúng"
                            >
                                {isCorrect && <div className="option-radio-pip" />}
                            </div>

                            <span className="option-key-label">{opt.key}</span>

                            <input
                                type="text"
                                className="option-input-field"
                                placeholder={`Nhập nội dung phương án ${opt.key}...`}
                                value={opt.text}
                                onChange={(e) => handleOptionTextChange(opt.key, e.target.value)}
                            />

                            {isCorrect && (
                                <span className="option-correct-tag">
                                    <CheckCircle2 size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />
                                    Đáp án đúng
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {error && <div className="form-error">{error}</div>}
        </div>
    );
};
