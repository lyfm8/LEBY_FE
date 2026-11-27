/**
 * Bộ khung tải dữ liệu (Skeleton Loader) mô phỏng đúng bố cục 2 cột của phòng học bài giảng.
 * Giúp giao diện giữ ổn định khung nhìn trong khi chờ API tải nội dung bài giảng.
 */
export function LessonRoomSkeleton() {
    // Trả về cấu trúc khung giả lập gồm thanh tiêu đề, khung video 16:9, khối ghi chú và danh sách bài bên phải
    return (
        <div className="lesson-page" aria-busy="true" aria-label="Đang tải nội dung bài giảng">
            {/* Thanh tiêu đề giả lập */}
            <header className="lesson-header">
                <div className="lesson-header__left">
                    {/* Nút quay lại giả lập */}
                    <div className="lesson-skeleton-block is-pill" style={{ width: '132px', height: '36px' }} />
                    <div className="lesson-skeleton-stack">
                        {/* Dòng tên mô-đun giả lập */}
                        <div className="lesson-skeleton-block" style={{ width: '160px', height: '12px' }} />
                        {/* Dòng tiêu đề bài giảng giả lập */}
                        <div className="lesson-skeleton-block" style={{ width: '280px', height: '20px' }} />
                    </div>
                </div>
                <div className="lesson-header__right">
                    {/* Huy hiệu trạng thái tiến độ giả lập */}
                    <div className="lesson-skeleton-block is-pill" style={{ width: '150px', height: '36px' }} />
                </div>
            </header>

            {/* Thân trang 2 cột giả lập */}
            <main className="lesson-body">
                <div className="lesson-workspace">
                    {/* Cột chính bên trái: trình phát 16:9 và thẻ ghi chú */}
                    <div className="lesson-main-column">
                        {/* Khung video 16:9 giả lập */}
                        <div className="lesson-skeleton-block lesson-skeleton-video" />
                        {/* Thẻ nội dung lý thuyết giả lập */}
                        <div className="lesson-notes-card">
                            <div className="lesson-skeleton-block" style={{ width: '40%', height: '20px', marginBottom: '14px' }} />
                            <div className="lesson-skeleton-block" style={{ width: '100%', height: '14px', marginBottom: '10px' }} />
                            <div className="lesson-skeleton-block" style={{ width: '88%', height: '14px', marginBottom: '10px' }} />
                            <div className="lesson-skeleton-block" style={{ width: '72%', height: '14px' }} />
                        </div>
                    </div>

                    {/* Cột phụ bên phải: thanh tiến độ mô-đun và danh sách bài học */}
                    <aside className="lesson-sidebar-column">
                        <div className="lesson-sidebar-card">
                            <div className="lesson-skeleton-block" style={{ width: '65%', height: '18px', marginBottom: '12px' }} />
                            <div className="lesson-skeleton-block" style={{ width: '100%', height: '8px', marginBottom: '20px' }} />
                            {/* Vòng lặp tạo 4 dòng bài học giả lập */}
                            {[1, 2, 3, 4].map((itemKey) => (
                                <div
                                    key={itemKey}
                                    className="lesson-skeleton-block"
                                    style={{ width: '100%', height: '54px', marginBottom: '10px', borderRadius: '12px' }}
                                />
                            ))}
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
