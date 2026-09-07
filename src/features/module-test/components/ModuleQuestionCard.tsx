import { Info } from 'lucide-react';
import type { ModuleTestQuestion, TestOptionKey } from '../types/moduleTestTypes';

interface ModuleQuestionCardProps {
    question: ModuleTestQuestion;
    selectedOption: TestOptionKey | null;
    passScore: number;
    targetScore: number;
    onSelectOption: (key: TestOptionKey) => void;
}

export function ModuleQuestionCard({
    question,
    selectedOption,
    passScore,
    targetScore,
    onSelectOption,
}: ModuleQuestionCardProps) {
    return (
        <div className="mtest-q-card">
            <div className="mtest-q-card__meta">
                <span className="mtest-q-card__part-tag">PART {question.partNo}</span>
                <span className="mtest-q-card__guide">Chọn từ thích hợp điền vào chỗ trống</span>
            </div>

            <h2 className="mtest-q-card__title">{question.title}</h2>

            <div className="mtest-options-list" role="radiogroup">
                {question.options.map((opt) => {
                    const isSelected = selectedOption === opt.key;

                    return (
                        <button
                            key={opt.key}
                            type="button"
                            className={`mtest-option-btn ${isSelected ? 'is-selected' : ''}`}
                            onClick={() => onSelectOption(opt.key)}
                            role="radio"
                            aria-checked={isSelected}
                        >
                            <span className="mtest-option-badge">{opt.key}</span>
                            <span className="mtest-option-text">{opt.text}</span>
                        </button>
                    );
                })}
            </div>

            {/* Hộp thông tin yêu cầu vượt qua */}
            <div className="mtest-req-box">
                <Info size={18} className="mtest-req-icon" />
                <p className="mtest-req-text">
                    <strong>Yêu cầu vượt qua:</strong> Bạn cần đạt tối thiểu {passScore}/100 điểm để pass qua
                    bài test này — Đang nhắm mục tiêu: AIM {targetScore}
                </p>
            </div>
        </div>
    );
}
