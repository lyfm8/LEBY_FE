import { useState } from 'react';
import { BarChart3, Hexagon } from 'lucide-react';
import type { AbilityRadarPoint, MockExamPartComparison } from '../types/mockExamTypes';

// Props đầu vào cho biểu đồ đối sánh năng lực 7 Part Trước vs Sau lộ trình (UC18)
interface BeforeAfterRadarProps {
    // Chuỗi điểm 7 Part từ bài thi chẩn đoán đầu vào (đường màu xám)
    beforeData: AbilityRadarPoint[];
    // Chuỗi điểm 7 Part từ bài thi thử đầu ra hiện tại (đường màu xanh dương)
    afterData: AbilityRadarPoint[];
    // Dữ liệu chi tiết 7 Part để hiển thị bảng đối sánh khi chuyển tab Fallback
    partResults: MockExamPartComparison[];
    // Số thứ tự Part đang được click lọc
    selectedPartNo?: number | null;
    // Callback khi người dùng click chọn một Part trên biểu đồ
    onSelectPart?: (partNo: number) => void;
}

// Các vòng đồng tâm tỷ lệ phần trăm vẽ lưới nhện Radar
const RADAR_RINGS = [20, 40, 60, 80, 100];
// Kích thước hộp viewBox SVG cố định giúp giữ nguyên tỷ lệ sắc nét trên mọi kích thước màn hình
const SVG_SIZE = 420;
// Tọa độ tâm X của biểu đồ Radar
const CENTER_X = SVG_SIZE / 2;
// Tọa độ tâm Y của biểu đồ Radar
const CENTER_Y = SVG_SIZE / 2;
// Bán kính tối đa của trục Radar tính từ tâm
const MAX_RADIUS = 136;

// Chuyển điểm giá trị 0..100 trên trục index sang tọa độ (x, y) trong SVG
function polarToCartesian(axisIndex: number, totalAxes: number, valuePercent: number): { x: number; y: number } {
    // Tính góc theo radian bắt đầu từ đỉnh 12 giờ (-PI/2) đi theo chiều kim đồng hồ
    const angle = (Math.PI * 2 * axisIndex) / totalAxes - Math.PI / 2;
    // Chuẩn hóa giá trị tỷ lệ trong khoảng [0, 100]
    const clamped = Math.max(0, Math.min(100, valuePercent));
    // Tính bán kính điểm dữ liệu tương ứng trên trục
    const radius = (clamped / 100) * MAX_RADIUS;
    // Trả về tọa độ X, Y đã quy đổi
    return {
        x: CENTER_X + radius * Math.cos(angle),
        y: CENTER_Y + radius * Math.sin(angle),
    };
}

// Tạo chuỗi points cho thẻ <polygon> SVG từ mảng giá trị điểm từng Part
function buildPolygonPoints(pointsData: AbilityRadarPoint[]): string {
    // Tổng số trục thường là 7 cho đủ Part 1..7
    const total = pointsData.length;
    // Trả về chuỗi rỗng nếu chưa có đủ tối thiểu 3 trục
    if (total < 3) return '';
    // Nối từng tọa độ x,y cách nhau bằng dấu cách
    return pointsData
        .map((point, index) => {
            const { x, y } = polarToCartesian(index, total, point.score);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');
}

// Biểu đồ Radar kép đối sánh Năng lực Trước (Màu xám) vs Sau (Màu xanh dương) kèm bảng đối sánh Fallback (UC18)
export function BeforeAfterRadar({
    beforeData,
    afterData,
    partResults,
    selectedPartNo = null,
    onSelectPart,
}: BeforeAfterRadarProps) {
    // Chế độ xem: Biểu đồ mạng nhện hoặc Bảng đối sánh số liệu chi tiết
    const [viewMode, setViewMode] = useState<'RADAR' | 'TABLE'>('RADAR');

    // Sắp xếp nhất quán cả 2 mảng theo partNo tăng dần để các trục trùng khít nhau
    const sortedAfter = [...afterData].sort((a, b) => a.partNo - b.partNo);
    // Tạo Map tra cứu nhanh điểm trước lộ trình theo partNo
    const beforeByPart = new Map<number, AbilityRadarPoint>(
        beforeData.map((item) => [item.partNo, item])
    );
    // Tạo mảng điểm Trước khớp đúng thứ tự trục với mảng Sau
    const alignedBefore: AbilityRadarPoint[] = sortedAfter.map((afterItem) => {
        const matched = beforeByPart.get(afterItem.partNo);
        return (
            matched ?? {
                partNo: afterItem.partNo,
                code: afterItem.code,
                name: afterItem.name,
                score: 0,
                status: 'UNCERTAIN',
            }
        );
    });

    // Số trục của biểu đồ (mặc định 7 Part TOEIC)
    const axisCount = sortedAfter.length;
    // Chuỗi tọa độ đa giác Trước (Xám)
    const beforePolygon = buildPolygonPoints(alignedBefore);
    // Chuỗi tọa độ đa giác Sau (Xanh dương)
    const afterPolygon = buildPolygonPoints(sortedAfter);

    return (
        <div className="mock-radar-card">
            <div className="mock-radar-card__header">
                <div>
                    <h2 className="mock-radar-card__title">
                        Biểu đồ năng lực Trước &amp; Sau lộ trình (7 Part)
                    </h2>
                    <p className="mock-radar-card__subtitle">
                        So sánh trực tiếp kết quả Chẩn đoán đầu vào (xám) với Bài thi đầu ra hôm nay
                        (xanh dương). Bấm vào một Part để lọc chi tiết bên dưới.
                    </p>
                </div>

                <div className="mock-radar-toggle" role="tablist" aria-label="Chế độ xem đối sánh">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={viewMode === 'RADAR'}
                        className={`mock-radar-toggle__btn ${viewMode === 'RADAR' ? 'is-active' : ''}`}
                        onClick={() => setViewMode('RADAR')}
                    >
                        <Hexagon size={15} />
                        <span>Biểu đồ Radar</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={viewMode === 'TABLE'}
                        className={`mock-radar-toggle__btn ${viewMode === 'TABLE' ? 'is-active' : ''}`}
                        onClick={() => setViewMode('TABLE')}
                    >
                        <BarChart3 size={15} />
                        <span>Bảng đối sánh</span>
                    </button>
                </div>
            </div>

            {/* Chú giải 2 lớp dữ liệu Trước và Sau */}
            <div className="mock-radar-legend">
                <div className="mock-radar-legend__item">
                    <span className="mock-radar-legend__swatch is-before" />
                    <span>Trước lộ trình (Chẩn đoán đầu vào)</span>
                </div>
                <div className="mock-radar-legend__item">
                    <span className="mock-radar-legend__swatch is-after" />
                    <span>Sau lộ trình (Thi đầu ra ETS)</span>
                </div>
            </div>

            {viewMode === 'RADAR' && axisCount >= 3 ? (
                <div className="mock-radar-canvas-wrap">
                    <svg
                        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
                        className="mock-radar-svg"
                        role="img"
                        aria-label="Biểu đồ Radar đối sánh 7 Part TOEIC trước và sau lộ trình"
                    >
                        {/* Vẽ 5 vòng lưới đồng tâm tương ứng mốc 20% - 100% */}
                        {RADAR_RINGS.map((ringValue) => {
                            // Tạo tập đỉnh cho đa giác lưới ở mức ringValue
                            const ringPoints = sortedAfter
                                .map((_, idx) => {
                                    const pt = polarToCartesian(idx, axisCount, ringValue);
                                    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
                                })
                                .join(' ');
                            return (
                                <polygon
                                    key={ringValue}
                                    points={ringPoints}
                                    fill="none"
                                    stroke="#e2e8f0"
                                    strokeWidth="1"
                                />
                            );
                        })}

                        {/* Vẽ các đường trục nối từ tâm tới từng đỉnh Part */}
                        {sortedAfter.map((axis, idx) => {
                            const outer = polarToCartesian(idx, axisCount, 100);
                            return (
                                <line
                                    key={axis.partNo}
                                    x1={CENTER_X}
                                    y1={CENTER_Y}
                                    x2={outer.x}
                                    y2={outer.y}
                                    stroke="#cbd5e1"
                                    strokeWidth="1"
                                    strokeDasharray="3 3"
                                />
                            );
                        })}

                        {/* Nhãn giá trị thang phần trăm dọc trục đỉnh 12 giờ */}
                        {RADAR_RINGS.map((ringValue) => {
                            const labelPos = polarToCartesian(0, axisCount, ringValue);
                            return (
                                <text
                                    key={`lbl-${ringValue}`}
                                    x={labelPos.x + 6}
                                    y={labelPos.y + 3}
                                    fontSize="10"
                                    fill="#94a3b8"
                                    fontWeight={600}
                                >
                                    {ringValue}%
                                </text>
                            );
                        })}

                        {/* Lớp 1: Đường năng lực Chẩn đoán đầu vào (Màu xám nét đứt theo UC18) */}
                        <polygon
                            points={beforePolygon}
                            fill="rgba(148, 163, 184, 0.22)"
                            stroke="#64748b"
                            strokeWidth="2"
                            strokeDasharray="5 4"
                        />

                        {/* Lớp 2: Đường năng lực Đầu ra (Màu xanh dương đậm theo UC18) */}
                        <polygon
                            points={afterPolygon}
                            fill="rgba(37, 99, 235, 0.24)"
                            stroke="#2563eb"
                            strokeWidth="2.5"
                        />

                        {/* Các điểm tròn nút dữ liệu của đường Đầu vào */}
                        {alignedBefore.map((point, idx) => {
                            const pos = polarToCartesian(idx, axisCount, point.score);
                            return (
                                <circle
                                    key={`before-pt-${point.partNo}`}
                                    cx={pos.x}
                                    cy={pos.y}
                                    r="3.5"
                                    fill="#64748b"
                                    stroke="#ffffff"
                                    strokeWidth="1.5"
                                />
                            );
                        })}

                        {/* Các điểm tròn nút dữ liệu và nhãn Part có thể click của đường Đầu ra */}
                        {sortedAfter.map((point, idx) => {
                            const pos = polarToCartesian(idx, axisCount, point.score);
                            const labelPos = polarToCartesian(idx, axisCount, 122);
                            const beforeScore = alignedBefore[idx]?.score ?? 0;
                            const delta = point.score - beforeScore;
                            const isSelected = selectedPartNo === point.partNo;
                            const anchor =
                                labelPos.x < CENTER_X - 18
                                    ? 'end'
                                    : labelPos.x > CENTER_X + 18
                                      ? 'start'
                                      : 'middle';
                            return (
                                <g key={`after-pt-${point.partNo}`}>
                                    <circle
                                        cx={pos.x}
                                        cy={pos.y}
                                        r={isSelected ? 6 : 4.5}
                                        fill="#2563eb"
                                        stroke="#ffffff"
                                        strokeWidth="1.8"
                                        style={{ cursor: onSelectPart ? 'pointer' : 'default' }}
                                        onClick={() => onSelectPart?.(point.partNo)}
                                    />
                                    <g
                                        style={{ cursor: onSelectPart ? 'pointer' : 'default' }}
                                        onClick={() => onSelectPart?.(point.partNo)}
                                    >
                                        <text
                                            x={labelPos.x}
                                            y={labelPos.y - 4}
                                            textAnchor={anchor}
                                            fontSize="12"
                                            fontWeight={isSelected ? 800 : 700}
                                            fill={isSelected ? '#2563eb' : '#0f172a'}
                                        >
                                            Part {point.partNo}
                                        </text>
                                        <text
                                            x={labelPos.x}
                                            y={labelPos.y + 11}
                                            textAnchor={anchor}
                                            fontSize="11"
                                            fontWeight={700}
                                            fill={delta > 0 ? '#16a34a' : delta < 0 ? '#dc2626' : '#475569'}
                                        >
                                            {point.score}% ({delta >= 0 ? `+${delta}%` : `${delta}%`})
                                        </text>
                                    </g>
                                </g>
                            );
                        })}
                    </svg>
                </div>
            ) : (
                <div className="mock-radar-table-wrap">
                    <table className="mock-compare-table">
                        <thead>
                            <tr>
                                <th>Phần thi</th>
                                <th>Trước lộ trình</th>
                                <th>Sau lộ trình</th>
                                <th>Tiến bộ</th>
                                <th>Số câu đúng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {partResults.map((part) => {
                                // Tính chênh lệch hiển thị kèm dấu +/-
                                const delta = part.scoreDelta ?? 0;
                                // Kiểm tra dòng có đang được chọn lọc hay không
                                const isSelected = selectedPartNo === part.partNo;
                                return (
                                    <tr
                                        key={part.partNo}
                                        className={isSelected ? 'is-selected' : ''}
                                        onClick={() => onSelectPart?.(part.partNo)}
                                        style={{ cursor: onSelectPart ? 'pointer' : 'default' }}
                                    >
                                        <td className="mock-compare-table__name">{part.name}</td>
                                        <td>
                                            {part.beforeScore !== null ? `${part.beforeScore}%` : '—'}
                                        </td>
                                        <td>
                                            <strong>{part.score}%</strong>
                                        </td>
                                        <td>
                                            {part.scoreDelta !== null ? (
                                                <span
                                                    className={`mock-delta-pill ${
                                                        delta > 0
                                                            ? 'is-up'
                                                            : delta < 0
                                                              ? 'is-down'
                                                              : 'is-flat'
                                                    }`}
                                                >
                                                    {delta > 0 ? `+${delta}%` : `${delta}%`}
                                                </span>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td>
                                            {part.correctCount}/{part.totalQuestions}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
