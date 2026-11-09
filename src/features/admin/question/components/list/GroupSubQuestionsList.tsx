import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Volume2 } from 'lucide-react';
import { adminQuestionService } from '../../services/adminQuestionService';
import type { QuestionDetail } from '../../types';

interface GroupSubQuestionsListProps {
    groupId: number;
}

export const GroupSubQuestionsList: React.FC<GroupSubQuestionsListProps> = ({ groupId }) => {
    const [detail, setDetail] = useState<QuestionDetail | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        adminQuestionService
            .getById(groupId)
            .then((res) => {
                if (isMounted && res.success && res.data) {
                    setDetail(res.data);
                }
            })
            .catch(() => {
                // Ignore
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });
        return () => {
            isMounted = false;
        };
    }, [groupId]);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem', gap: '0.5rem', color: '#6b7280', fontSize: '0.8125rem' }}>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', color: '#ea580c' }} />
                <span>Đang tải thông tin chi tiết chùm câu hỏi...</span>
            </div>
        );
    }

    if (!detail) {
        return (
            <div style={{ padding: '1rem', color: '#dc2626', fontSize: '0.8125rem', textAlign: 'center' }}>
                Không thể tải nội dung chi tiết của chùm câu hỏi này.
            </div>
        );
    }

    const audioMedia = detail.medias?.find((m) => m.kind === 'AUDIO');

    return (
        <div className="group-sub-panel">
            {/* Audio dùng chung cho cả chùm */}
            {audioMedia && (
                <div className="group-audio-card">
                    <Volume2 size={18} color="#ea580c" />
                    <span className="group-audio-title">Audio chung của chùm:</span>
                    <audio controls src={audioMedia.url} style={{ height: '32px', flex: 1, maxWidth: '360px' }}>
                        Trình duyệt không hỗ trợ phát audio
                    </audio>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: 'auto' }}>
                        {audioMedia.originalFilename || 'audio-clip.mp3'}
                    </span>
                </div>
            )}

            {/* Đoạn văn đọc hiểu chung nếu là Part 6/7 */}
            {detail.passage && (
                <div className="group-passage-card">
                    <span className="group-passage-label">Đoạn văn đọc hiểu chung (Passage):</span>
                    <div>{detail.passage}</div>
                </div>
            )}

            {/* Danh sách các câu hỏi con */}
            <div className="sub-questions-container">
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>
                    Danh sách {detail.items?.length || 0} câu hỏi con:
                </div>

                {(detail.items || []).map((sub, idx) => (
                    <div key={sub.id || idx} className="sub-question-row">
                        <div className="sub-q-left">
                            <span className="sub-q-badge">{idx + 1}</span>
                            <div>
                                <div className="sub-q-title">{sub.text || sub.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.125rem' }}>
                                    Độ khó: {sub.difficulty}/5
                                </div>
                            </div>
                        </div>

                        <div className="sub-q-correct">
                            <CheckCircle2 size={13} />
                            <span>Đáp án: {sub.correctKey}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
