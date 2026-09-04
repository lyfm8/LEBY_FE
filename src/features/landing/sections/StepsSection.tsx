import { useEffect, useRef } from 'react';

const steps = [
    {
        number: '01',
        title: 'Chọn mục tiêu',
        desc: 'Đặt điểm đích mong muốn (từ 450 đến 850+/990).',
    },
    {
        number: '02',
        title: 'Làm bài đánh giá',
        desc: 'AI phân tích trình độ xuất phát điểm chỉ trong 30 phút.',
    },
    {
        number: '03',
        title: 'Nhận lộ trình',
        desc: 'Nhận bài học và bài tập thích ứng cá nhân hóa hoàn toàn.',
    },
    {
        number: '04',
        title: 'Học & kiểm tra',
        desc: 'Theo sát tiến độ để tự tin tối đa trước ngày thi thật.',
    },
];

function StepsSection() {
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

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

        itemRefs.current.forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <section
            className="lby-section"
            id="steps"
            aria-labelledby="steps-heading"
        >
            <div className="lby-section__header">
                <span className="lby-section__eyebrow">Lộ trình đơn giản</span>
                <h2 className="lby-section__title" id="steps-heading">
                    4 Bước chinh phục TOEIC cùng LEBY
                </h2>
            </div>

            <div className="lby-steps__grid">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className={`lby-step-item lby-reveal lby-reveal--delay-${index + 1}`}
                        ref={(el) => { itemRefs.current[index] = el; }}
                        id={`step-item-${index + 1}`}
                    >
                        <div className="lby-step-item__number" aria-hidden="true">
                            {step.number}
                        </div>
                        <h3 className="lby-step-item__title">{step.title}</h3>
                        <p className="lby-step-item__desc">{step.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default StepsSection;
