/**
 * Khung xương tải (Skeleton Loader) mô phỏng chính xác bố cục màn hình Dashboard thật:
 * Sub-header, lưới 4 thẻ chỉ số KPI và bố cục 2 cột nội dung chính.
 */
export function DashboardSkeleton() {
    // Khởi tạo sẵn 4 vị trí cho lưới thẻ thống kê KPI
    const kpiPlaceholders = [1, 2, 3, 4];
    // Khởi tạo sẵn 4 vị trí cho danh sách bài học mô phỏng trong khối mô-đun hiện tại
    const lessonPlaceholders = [1, 2, 3, 4];
    // Khởi tạo sẵn 3 vị trí cho các thẻ chặng học ở cột bên phải
    const roadmapPlaceholders = [1, 2, 3];

    return (
        <div className="db-skeleton" aria-busy="true" aria-label="Đang tải bảng điều khiển học tập">
            {/* Mô phỏng thanh tiêu đề chào mừng phía trên */}
            <div className="db-sub-header">
                <div className="db-skeleton__header-left">
                    <div className="db-skel db-skel--xs" />
                    <div className="db-skel db-skel--title" />
                </div>
                <div className="db-skeleton__header-right">
                    <div className="db-skel db-skel--pill" />
                    <div className="db-skel db-skel--pill" />
                </div>
            </div>

            <div className="db-container">
                {/* Mô phỏng lưới 4 thẻ chỉ số KPI */}
                <div className="db-stats-grid">
                    {kpiPlaceholders.map((item) => (
                        <div key={item} className="stat-card db-skeleton__card">
                            <div className="db-skel db-skel--sm" />
                            <div className="db-skel db-skel--metric" />
                            <div className="db-skel db-skel--xs" />
                        </div>
                    ))}
                </div>

                {/* Mô phỏng bố cục 2 cột chính của Dashboard */}
                <div className="db-content-grid">
                    <div className="db-content-left">
                        {/* Mô phỏng thẻ Mô-đun đang học tiếp theo */}
                        <div className="db-card db-skeleton__focus">
                            <div className="db-skel db-skel--sm" />
                            <div className="db-skel db-skel--title" />
                            <div className="db-skel db-skel--bar" />
                            <div className="db-skeleton__list">
                                {lessonPlaceholders.map((row) => (
                                    <div key={row} className="db-skel db-skel--row" />
                                ))}
                            </div>
                        </div>

                        {/* Mô phỏng khối biểu đồ tiến độ theo tuần */}
                        <div className="db-card db-skeleton__chart">
                            <div className="db-skel db-skel--sm" />
                            <div className="db-skel db-skel--chart-body" />
                        </div>
                    </div>

                    <div className="db-content-right">
                        {/* Mô phỏng khối Lộ trình tiếp theo ở cột bên phải */}
                        <div className="db-roadmap-card db-skeleton__sidebar">
                            <div className="db-skel db-skel--sm" />
                            {roadmapPlaceholders.map((card) => (
                                <div key={card} className="db-skel db-skel--sidebar-item" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
