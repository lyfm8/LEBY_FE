import { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

const plans = [
    {
        id: 'basic',
        name: 'Basic Access',
        price: 'Miễn phí',
        isFree: true,
        tagline: 'Dành cho người mới làm quen',
        features: [
            'Diagnostic Test đầu vào chi tiết',
            'Bài học ngữ pháp căn bản',
            'Giới hạn 100 câu hỏi thực hành',
            'Báo cáo tiến độ cơ bản',
        ],
        btnText: 'Trải nghiệm ngay',
        btnClass: '',
        featured: false,
    },
    {
        id: 'premium',
        name: 'Premium Adaptive',
        price: '299,000đ',
        isFree: false,
        tagline: 'Tối ưu nhất để bứt phá điểm số',
        features: [
            'Full kho đề thi thử TOEIC',
            'AI Adaptive phân bổ độ khó liên tục',
            'Không giới hạn câu hỏi thực hành',
            'Chữa lỗi sai chi tiết từng câu',
            'Cam kết đầu ra theo mục tiêu',
        ],
        btnText: 'Kích hoạt Premium',
        btnClass: 'lby-pricing-card__btn--primary',
        featured: true,
        badge: 'Phổ biến',
    },
    {
        id: 'coaching',
        name: 'Private Coaching',
        price: '899,000đ',
        isFree: false,
        tagline: 'Đặc quyền kèm 1-1 cùng chuyên gia',
        features: [
            'Mọi tính năng của Premium',
            '2 buổi review 1-1 cùng giảng viên',
            'Chiến thuật làm bài độc quyền',
            'Ưu tiên hỗ trợ kỹ thuật 24/7',
        ],
        btnText: 'Liên hệ tư vấn',
        btnClass: '',
        featured: false,
    },
];

function PricingSection() {
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('lby-visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        cardRefs.current.forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <section
            className="lby-section lby-section--alt"
            id="pricing"
            aria-labelledby="pricing-heading"
        >
            <div className="lby-section__header">
                <span className="lby-section__eyebrow">Gói học linh hoạt</span>
                <h2 className="lby-section__title" id="pricing-heading">
                    Đầu tư xứng đáng cho tương lai
                </h2>
            </div>

            <div className="lby-pricing__grid">
                {plans.map((plan, index) => (
                    <div
                        key={plan.id}
                        className={`lby-pricing-card lby-reveal lby-reveal--delay-${index + 1} ${plan.featured ? 'lby-pricing-card--featured' : ''}`}
                        ref={(el) => { cardRefs.current[index] = el; }}
                        id={`pricing-card-${plan.id}`}
                    >
                        {/* Popular badge */}
                        {plan.badge && (
                            <div className="lby-pricing-card__badge" aria-label="Gói phổ biến">
                                {plan.badge}
                            </div>
                        )}

                        <div className="lby-pricing-card__name">{plan.name}</div>

                        <div className="lby-pricing-card__price">
                            {plan.isFree
                                ? <span className="lby-pricing-card__price-free">{plan.price}</span>
                                : (
                                    <>
                                        {plan.price}
                                        <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--lby-orange)' }}>/tháng</span>
                                    </>
                                )
                            }
                        </div>

                        <div className="lby-pricing-card__tagline">{plan.tagline}</div>

                        <ul className="lby-pricing-card__features" aria-label={`Tính năng gói ${plan.name}`}>
                            {plan.features.map((f, fi) => (
                                <li key={fi} className="lby-pricing-card__feature">
                                    <Check
                                        size={16}
                                        className="lby-pricing-card__feature-icon"
                                        aria-hidden="true"
                                    />
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            type="button"
                            className={`lby-pricing-card__btn ${plan.btnClass}`}
                            id={`pricing-btn-${plan.id}`}
                        >
                            {plan.btnText}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default PricingSection;
