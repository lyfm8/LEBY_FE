import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardCheck, FileQuestion, RotateCcw, Video } from 'lucide-react';
import { usePublicCatalog } from '../hooks/usePublicCatalog';
import type { PublicCatalogPart } from '../types/publicCatalogTypes';

/**
 * Tách nhãn số thứ tự Part (VD: "PART 1") và kỹ năng để render khối chữ khổ lớn.
 */
function extractPartCode(partName: string, fallbackIndex: number): string {
    const match = /part\s*(\d+)/i.exec(partName);
    const num = match ? match[1] : String(fallbackIndex + 1);
    return `PART ${num}`;
}

/**
 * Khối hiển thị chữ Part khổ lớn đóng khung hình học thay thế hình ảnh minh họa.
 */
function PartVisualTile({ part, index }: { part: PublicCatalogPart; index: number }) {
    const partCode = extractPartCode(part.partName, index);
    const sectionLabel = part.section === 'LISTENING' ? 'Listening' : 'Reading';
    const moduleCount = part.modules.length;

    return (
        <div className="lby-curriculum-row__visual" aria-hidden="true">
            <div className="lby-part-display-frame">
                <div className="lby-part-display-frame__accent" />
                <div className="lby-part-display-frame__card">
                    <span className="lby-part-display-frame__section">{sectionLabel}</span>
                    <div className="lby-part-display-frame__label">{partCode}</div>
                    <span className="lby-part-display-frame__count">
                        {moduleCount > 0 ? `${moduleCount} mô-đun` : 'Đang cập nhật'}
                    </span>
                </div>
            </div>
        </div>
    );
}

/**
 * Khối nội dung danh sách mô-đun của từng Part: chỉ hiển thị tên Part, tên các mô-đun
 * và số lượng bài giảng, bài thực hành, bài kiểm tra.
 */
function PartContentBlock({ part }: { part: PublicCatalogPart }) {
    return (
        <div className="lby-curriculum-row__content">
            <h3 className="lby-curriculum-row__part-title">{part.partName}</h3>

            {part.modules.length > 0 ? (
                <ul className="lby-curriculum-modules" aria-label={`Danh sách mô-đun ${part.partName}`}>
                    {part.modules.map((mod) => (
                        <li key={mod.id} className="lby-curriculum-module-item">
                            <div className="lby-curriculum-module-item__name">{mod.title}</div>
                            <div className="lby-curriculum-module-item__stats">
                                <span className="lby-curriculum-stat">
                                    <Video size={14} aria-hidden="true" />
                                    <span>{mod.videoLessonCount} bài học</span>
                                </span>
                                <span className="lby-curriculum-stat-sep" aria-hidden="true">
                                    ·
                                </span>
                                <span className="lby-curriculum-stat">
                                    <FileQuestion size={14} aria-hidden="true" />
                                    <span>{mod.practiceLessonCount} thực hành</span>
                                </span>
                                <span className="lby-curriculum-stat-sep" aria-hidden="true">
                                    ·
                                </span>
                                <span className="lby-curriculum-stat">
                                    <ClipboardCheck size={14} aria-hidden="true" />
                                    <span>{mod.testCount} test</span>
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="lby-curriculum-empty-part">
                    Đang cập nhật mô-đun học tập
                </div>
            )}
        </div>
    );
}

function CurriculumSection() {
    const { data, isLoading, error, refetch } = usePublicCatalog();
    const rowRefs = useRef<(HTMLElement | null)[]>([]);

    useEffect(() => {
        if (!data?.parts?.length) {
            return;
        }
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

        rowRefs.current.forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [data]);

    const parts = data?.parts ?? [];

    return (
        <section
            className="lby-section lby-section--alt lby-curriculum"
            id="curriculum"
            aria-labelledby="curriculum-heading"
        >
            <div className="lby-section__header lby-curriculum__header">
                <h2 className="lby-section__title" id="curriculum-heading">
                    Nội dung 7 phần thi TOEIC
                </h2>
                <p className="lby-curriculum__subtitle">
                    Toàn cảnh cấu trúc chương trình được chia theo từng Part, giúp bạn nắm rõ hệ thống mô-đun trước khi làm bài đánh giá đầu vào.
                </p>
            </div>

            {isLoading && (
                <div className="lby-curriculum__list" aria-busy="true" aria-label="Đang tải chương trình học">
                    {[0, 1].map((idx) => (
                        <div
                            key={idx}
                            className={`lby-curriculum-row ${idx % 2 === 1 ? 'is-reversed' : ''}`}
                        >
                            <div className="lby-curriculum-row__content">
                                <div className="lby-curriculum-skeleton lby-curriculum-skeleton--title" />
                                <div className="lby-curriculum-skeleton lby-curriculum-skeleton--card" />
                                <div className="lby-curriculum-skeleton lby-curriculum-skeleton--card" />
                            </div>
                            <div className="lby-curriculum-row__visual">
                                <div className="lby-curriculum-skeleton lby-curriculum-skeleton--visual" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && error && (
                <div className="lby-curriculum__state" role="alert">
                    <p>{error}</p>
                    <button type="button" className="lby-curriculum__retry-btn" onClick={refetch}>
                        <RotateCcw size={15} aria-hidden="true" />
                        <span>Thử tải lại</span>
                    </button>
                </div>
            )}

            {!isLoading && !error && parts.length === 0 && (
                <div className="lby-curriculum__state">
                    <p>Nội dung chương trình học đang được cập nhật.</p>
                </div>
            )}

            {!isLoading && !error && parts.length > 0 && (
                <>
                    <div className="lby-curriculum__list">
                        {parts.map((part, index) => {
                            const isReversed = index % 2 === 1;
                            return (
                                <article
                                    key={part.partId}
                                    className={`lby-curriculum-row lby-reveal ${isReversed ? 'is-reversed' : ''}`}
                                    ref={(el) => {
                                        rowRefs.current[index] = el;
                                    }}
                                    id={`curriculum-part-${part.partId}`}
                                >
                                    {isReversed ? (
                                        <>
                                            <PartVisualTile part={part} index={index} />
                                            <PartContentBlock part={part} />
                                        </>
                                    ) : (
                                        <>
                                            <PartContentBlock part={part} />
                                            <PartVisualTile part={part} index={index} />
                                        </>
                                    )}
                                </article>
                            );
                        })}
                    </div>

                    <div className="lby-curriculum__cta-wrap">
                        <Link to="/register" className="lby-hero__btn-primary">
                            Bắt đầu miễn phí
                            <ArrowRight size={18} aria-hidden="true" />
                        </Link>
                    </div>
                </>
            )}
        </section>
    );
}

export default CurriculumSection;
