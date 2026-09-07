import { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { PracticeQuestion } from '../types/lessonTypes';

interface PracticeQuestionViewProps {
    questions: PracticeQuestion[];
}

export function PracticeQuestionView({ questions }: PracticeQuestionViewProps) {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [showExplanations, setShowExplanations] = useState<Record<number, boolean>>({});

    function handleSelect(questionId: number, key: string) {
        setSelectedAnswers((prev) => ({ ...prev, [questionId]: key }));
        setShowExplanations((prev) => ({ ...prev, [questionId]: true }));
    }

    return (
        <div className="practice-view">
            <h3 className="practice-view__heading">Bài tập thực hành rèn luyện tại chỗ</h3>

            <div className="practice-questions-list">
                {questions.map((q) => {
                    const selected = selectedAnswers[q.id];
                    const isAnswered = selected !== undefined;
                    const isCorrect = selected === q.correctAnswer;

                    return (
                        <div key={q.id} className="practice-q-card">
                            <h4 className="practice-q-card__title">
                                Câu {q.orderNo}: {q.title}
                            </h4>

                            <div className="practice-options-grid">
                                {q.options.map((opt) => {
                                    const isChosen = selected === opt.key;
                                    let optionClass = '';

                                    if (isAnswered) {
                                        if (opt.key === q.correctAnswer) {
                                            optionClass = 'is-correct';
                                        } else if (isChosen) {
                                            optionClass = 'is-wrong';
                                        }
                                    }

                                    return (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            className={`practice-opt-btn ${isChosen ? 'is-chosen' : ''} ${optionClass}`}
                                            onClick={() => handleSelect(q.id, opt.key)}
                                        >
                                            <span className="practice-opt-key">{opt.key}</span>
                                            <span className="practice-opt-text">{opt.text}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {showExplanations[q.id] && (
                                <div className={`practice-explain-box ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
                                    <div className="practice-explain-header">
                                        {isCorrect ? (
                                            <>
                                                <CheckCircle2 size={18} className="is-correct" />
                                                <span>Chính xác! Đáp án đúng: {q.correctAnswer}</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={18} className="is-wrong" />
                                                <span>Chưa đúng! Đáp án đúng: {q.correctAnswer}</span>
                                            </>
                                        )}
                                    </div>
                                    <p className="practice-explain-text">{q.explanation}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
