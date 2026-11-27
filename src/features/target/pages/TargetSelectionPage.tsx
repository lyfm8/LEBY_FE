import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TargetHeader } from '../components/TargetHeader';
import { TargetCard } from '../components/TargetCard';
import { ConfirmTargetChangeModal } from '../components/ConfirmTargetChangeModal';
import { targetService } from '../services/targetService';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { TargetProfile } from '../types/targetTypes';
import '../target.css';

const PENDING_TARGET_STORAGE_KEY = 'leby_pending_target_id';

/**
 * Smart / Container Component: Trang Chọn lần đầu hoặc Thay đổi mục tiêu điểm TOEIC (AIM) — UC05.
 * Hỗ trợ đầy đủ cả 2 kịch bản (Onboarding lần đầu và Đổi AIM khi đã học),
 * bao gồm các luồng ngoại lệ: chưa chọn mục tiêu (5a), chọn trùng AIM hiện tại (3a),
 * xác nhận đổi AIM / hạ AIM (4a, 4b, 7a), mất dữ liệu chẩn đoán (7b), lưu tạm khi hết phiên (8a).
 */
export default function TargetSelectionPage() {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    const currentTargetId = user?.targetProfileId ?? null;
    const currentTargetScore = user?.targetTotalScore ?? null;
    const isFirstTime = !user?.hasSelectedTarget;

    const [targets, setTargets] = useState<TargetProfile[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        let isMounted = true;
        targetService
            .getTargets()
            .then((res) => {
                if (!isMounted) return;
                if (res.success && res.data) {
                    setTargets(res.data);

                    // Luồng 8a: Khôi phục lựa chọn tạm nếu người dùng vừa đăng nhập lại sau khi hết phiên
                    const savedPendingId = sessionStorage.getItem(PENDING_TARGET_STORAGE_KEY);
                    if (savedPendingId) {
                        sessionStorage.removeItem(PENDING_TARGET_STORAGE_KEY);
                        const parsed = Number(savedPendingId);
                        if (res.data.some((t) => t.id === parsed)) {
                            setSelectedId(parsed);
                            return;
                        }
                    }

                    // Nếu đang đổi AIM, đánh dấu sẵn mốc AIM hiện tại để học viên dễ đối chiếu
                    if (currentTargetId && res.data.some((t) => t.id === currentTargetId)) {
                        setSelectedId(currentTargetId);
                    }
                } else {
                    setError(res.message || 'Không thể tải danh sách mục tiêu.');
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
    }, [currentTargetId]);

    /**
     * Xử lý khi học viên chọn một card mục tiêu: xóa thông báo lỗi cũ ngay để UX mượt hơn.
     */
    function handleSelectCard(id: number) {
        setSelectedId(id);
        if (error) {
            setError('');
        }
    }

    /**
     * Kiểm tra điều kiện hợp lệ trước khi gọi API hoặc mở hộp thoại xác nhận đổi AIM.
     */
    function handleConfirmClick() {
        setError('');

        // Luồng 5a: Chưa chọn mốc mục tiêu nào mà bấm Xác nhận
        if (selectedId === null) {
            setError('Vui lòng chọn một mốc mục tiêu điểm số trước khi tiếp tục.');
            return;
        }

        // Luồng 3a: Học viên chọn lại đúng mốc AIM hiện đang theo học
        if (!isFirstTime && currentTargetId !== null && selectedId === currentTargetId) {
            setError(
                'Bạn hiện đang học tập với mục tiêu này. Vui lòng chọn một mốc mục tiêu khác nếu muốn nâng cao điểm số.'
            );
            return;
        }

        // Luồng 4a / 7a: Khi đổi AIM, hiển thị hộp thoại xác nhận trước khi cập nhật & tái sinh lộ trình
        if (!isFirstTime) {
            setIsConfirmModalOpen(true);
            return;
        }

        // Lần đầu thiết lập mục tiêu: gửi thẳng API và điều hướng sang bài thi chẩn đoán
        void submitTargetSelection(selectedId);
    }

    /**
     * Gọi API lưu/đổi mục tiêu AIM và điều hướng theo chỉ dẫn redirectAction từ Backend.
     */
    async function submitTargetSelection(targetProfileId: number) {
        setIsSubmitting(true);
        setError('');

        // Lưu tạm lựa chọn phòng trường hợp phiên đăng nhập hết hạn khi đang gửi yêu cầu (Luồng 8a)
        sessionStorage.setItem(PENDING_TARGET_STORAGE_KEY, String(targetProfileId));

        try {
            const res = await targetService.selectTarget({ targetProfileId });
            if (res.success && res.data) {
                sessionStorage.removeItem(PENDING_TARGET_STORAGE_KEY);
                setIsConfirmModalOpen(false);

                // Đồng bộ ngay thông tin mục tiêu mới vào AuthContext toàn cục
                if (user) {
                    setUser({
                        ...user,
                        hasSelectedTarget: true,
                        targetProfileId: res.data.targetProfileId,
                        targetTotalScore: res.data.targetTotalScore,
                    });
                }

                // Rẽ nhánh điều hướng theo kết quả nghiệp vụ từ BE (BR01, BR02, Luồng 7b)
                if (res.data.redirectAction === 'GO_LEARNING_PATH') {
                    navigate('/learning-path', { replace: true });
                } else {
                    navigate('/diagnostic/room', { replace: true });
                }
            } else {
                sessionStorage.removeItem(PENDING_TARGET_STORAGE_KEY);
                setIsConfirmModalOpen(false);
                setError(res.message || 'Lỗi khi lưu mục tiêu học tập.');
            }
        } catch (err: unknown) {
            setIsConfirmModalOpen(false);

            if (axios.isAxiosError(err)) {
                const status = err.response?.status;
                // Nếu 401 -> giữ PENDING_TARGET_STORAGE_KEY để khôi phục sau khi đăng nhập lại (Luồng 8a)
                if (status !== 401) {
                    sessionStorage.removeItem(PENDING_TARGET_STORAGE_KEY);
                }

                // Luồng 7c: Hệ thống gặp gián đoạn khi tái sinh lộ trình
                if (!status || status >= 500) {
                    setError(
                        'Hệ thống đang khởi tạo lộ trình học mới cho bạn hoặc gặp gián đoạn tạm thời. Vui lòng thử lại hoặc làm mới trang sau ít giây.'
                    );
                } else {
                    const serverMessage = (err.response?.data as { message?: string } | undefined)?.message;
                    setError(serverMessage || 'Không thể lưu mục tiêu học tập. Vui lòng thử lại.');
                }
            } else {
                sessionStorage.removeItem(PENDING_TARGET_STORAGE_KEY);
                setError('Đã xảy ra lỗi kết nối. Vui lòng thử lại.');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    // Quay lại đúng trang trước đó khi học viên bấm Hủy (fallback về /learning-path nếu mở trực tiếp link)
    function handleCancelClick() {
        if (window.history.length > 1) {
            navigate(-1);
            return;
        }
        navigate('/learning-path');
    }

    const selectedTarget = targets.find((t) => t.id === selectedId) ?? null;

    return (
        <div className="target-page">
            <TargetHeader isFirstTime={isFirstTime} currentStep={1} totalSteps={3} />

            <main className="target-container">
                <div className="target-hero">
                    <h1 className="target-hero__title">
                        {isFirstTime ? 'Chọn mục tiêu TOEIC của bạn' : 'Thay đổi mục tiêu TOEIC (AIM)'}
                    </h1>
                    <p className="target-hero__subtitle">
                        {isFirstTime
                            ? 'LEBY sẽ cá nhân hóa toàn bộ khối lượng kiến thức, độ khó câu hỏi luyện tập và vận hành lộ trình học phù hợp nhất với đích đến của bạn.'
                            : 'Khi bạn đổi mục tiêu mới, lộ trình hiện tại sẽ được lưu vào lịch sử và hệ thống sẽ tự động phân tầng lại lộ trình tối ưu dựa trên năng lực của bạn.'}
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
                                    isCurrent={!isFirstTime && target.id === currentTargetId}
                                    onSelect={handleSelectCard}
                                />
                            ))}
                        </div>

                        <div className="target-actions">
                            {!isFirstTime && (
                                <button
                                    type="button"
                                    className="target-cancel-btn"
                                    onClick={handleCancelClick}
                                >
                                    Hủy &amp; quay lại
                                </button>
                            )}
                            <button
                                type="button"
                                className="target-submit-btn"
                                onClick={handleConfirmClick}
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? 'Đang lưu mục tiêu...'
                                    : isFirstTime
                                        ? 'Xác nhận mục tiêu'
                                        : 'Cập nhật mục tiêu'}
                            </button>
                        </div>
                    </>
                )}
            </main>

            <ConfirmTargetChangeModal
                isOpen={isConfirmModalOpen}
                currentScore={currentTargetScore}
                newScore={selectedTarget?.targetTotalScore ?? 0}
                isSubmitting={isSubmitting}
                onConfirm={() => {
                    if (selectedId !== null) {
                        void submitTargetSelection(selectedId);
                    }
                }}
                onCancel={() => setIsConfirmModalOpen(false)}
            />
        </div>
    );
}
