import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TargetHeader } from '../components/TargetHeader';
import { TargetCard } from '../components/TargetCard';
import { targetService } from '../services/targetService';
import type { TargetProfile } from '../types/targetTypes';
import '../target.css';

export default function TargetSelectionPage() {
    const navigate = useNavigate();
    const [targets, setTargets] = useState<TargetProfile[]>([]);
    const [selectedId, setSelectedId] = useState<number>(3);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        let isMounted = true;
        targetService
            .getTargets()
            .then((res) => {
                if (isMounted && res.success && res.data) {
                    setTargets(res.data);
                    const recommended = res.data.find((t) => t.isRecommended);
                    if (recommended) {
                        setSelectedId(recommended.id);
                    }
                }
            })
            .catch(() => {
                if (isMounted) {
                    setError('Không thể tải danh sách mục tiêu. Vui lòng thử lại.');
                }
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    async function handleConfirm() {
        if (!selectedId) return;
        setIsSubmitting(true);
        setError('');

        try {
            const res = await targetService.selectTarget({ targetProfileId: selectedId });
            if (res.success) {
                navigate('/diagnostic/room');
            } else {
                setError(res.message || 'Lỗi khi lưu mục tiêu.');
            }
        } catch {
            setError('Đã xảy ra lỗi kết nối. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="target-page">
            <TargetHeader currentStep={1} totalSteps={3} />

            <main className="target-container">
                <div className="target-hero">
                    <h1 className="target-hero__title">Chọn mục tiêu TOEIC của bạn</h1>
                    <p className="target-hero__subtitle">
                        LEBY sẽ cá nhân hóa toàn bộ khối lượng kiến thức, độ khó câu hỏi luyện tập và vận
                        hành lộ trình học phù hợp nhất với đích đến của bạn.
                    </p>
                </div>

                {error && (
                    <div className="target-banner-error" role="alert">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="target-loading">
                        <div className="target-spinner" />
                        <p>Đang tải mục tiêu cá nhân hóa...</p>
                    </div>
                ) : (
                    <>
                        <div className="target-cards-grid" role="group" aria-label="Danh sách mục tiêu TOEIC">
                            {targets.map((target) => (
                                <TargetCard
                                    key={target.id}
                                    target={target}
                                    isSelected={target.id === selectedId}
                                    onSelect={setSelectedId}
                                />
                            ))}
                        </div>

                        <div className="target-actions">
                            <button
                                type="button"
                                className="target-submit-btn"
                                onClick={handleConfirm}
                                disabled={isSubmitting || !selectedId}
                            >
                                {isSubmitting ? 'Đang lưu mục tiêu...' : 'Xác nhận mục tiêu'}
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
