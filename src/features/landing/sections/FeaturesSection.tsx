import { useEffect, useRef } from 'react';
import { Activity, GitBranch, PlayCircle, BarChart2 } from 'lucide-react';

const features = [
    {
        icon: <Activity size={22} />,
        iconClass: 'lby-feature-card__icon-wrap--orange',
        title: 'Diagnostic Test cá nhân hóa',
        desc: 'Chỉ với 40 câu hỏi nhanh, AI định vị chính xác điểm mạnh và điểm yếu ở cả 7 phần thi.',
    },
    {
        icon: <GitBranch size={22} />,
        iconClass: 'lby-feature-card__icon-wrap--teal',
        title: 'Lộ trình học thông minh',
        desc: 'Tự động tinh chỉnh và thay đổi bài học dựa trên tốc độ và kết quả làm bài hằng ngày.',
    },
    {
        icon: <PlayCircle size={22} />,
        iconClass: 'lby-feature-card__icon-wrap--blue',
        title: 'Bài học Video & Practice',
        desc: 'Thư viện bài giảng cô đọng kết hợp hệ thống bài tập thực hành bám sát đề thi thật.',
    },
    {
        icon: <BarChart2 size={22} />,
        iconClass: 'lby-feature-card__icon-wrap--amber',
        title: 'Theo dõi tiến độ real-time',
        desc: 'Bảng dữ liệu phân tích trực quan hoá khả năng bứt phá mục tiêu của bạn.',
    },
];

function FeaturesSection() {
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Scroll reveal using IntersectionObserver
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('lby-visible');
                    }
                });
            },
            { threshold: 0.15 }
        );

        cardRefs.current.forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <section
            className="lby-section lby-section--alt"
            id="features"
            aria-labelledby="features-heading"
        >
            <div className="lby-section__header">
                <span className="lby-section__eyebrow">Tính năng vượt trội</span>
                <h2 className="lby-section__title" id="features-heading">
                    Đột phá điểm số nhờ công nghệ Adaptive
                </h2>
            </div>

            <div className="lby-features__grid">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className={`lby-feature-card lby-reveal lby-reveal--delay-${index + 1}`}
                        ref={(el) => { cardRefs.current[index] = el; }}
                        id={`feature-card-${index + 1}`}
                    >
                        <div className={`lby-feature-card__icon-wrap ${feature.iconClass}`} aria-hidden="true">
                            {feature.icon}
                        </div>
                        <h3 className="lby-feature-card__title">{feature.title}</h3>
                        <p className="lby-feature-card__desc">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default FeaturesSection;
