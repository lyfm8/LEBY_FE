import type { DiagnosticQuestion, OptionKey } from '../types/diagnosticTypes';

interface QuestionCardProps {
    question: DiagnosticQuestion;
    selectedOption: OptionKey | null;
    onSelectOption: (option: OptionKey) => void;
}

export function QuestionCard({ question, selectedOption, onSelectOption }: QuestionCardProps) {
    return (
        <div className="diag-question-card">
            <h2 className="diag-question-card__title">{question.title}</h2>

            {question.passage && (
                <div className="diag-question-card__passage">
                    <p>{question.passage}</p>
                </div>
            )}

            {question.imageUrl && (
                <div className="diag-question-card__image-box">
                    <img
                        src={question.imageUrl}
                        alt="Question context"
                        className="diag-question-card__image"
                    />
                </div>
            )}

            <div className="diag-options-list" role="radiogroup" aria-label="Các phương án trả lời">
                {question.options.map((opt) => {
                    const isSelected = selectedOption === opt.key;
                    return (
                        <button
                            key={opt.key}
                            type="button"
                            className={`diag-option-item ${isSelected ? 'is-selected' : ''}`}
                            onClick={() => onSelectOption(opt.key)}
                            role="radio"
                            aria-checked={isSelected}
                        >
                            <span className="diag-option-item__badge">{opt.key}</span>
                            <span className="diag-option-item__text">{opt.text}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
