import { useMemo, useState } from 'react';
import { BarChart3, Table2 } from 'lucide-react';
import type { AbilityRadar } from '../types/diagnosticTypes';

const LEVELS = [0.25, 0.5, 0.75, 1];

interface RadarChartProps {
    abilities: AbilityRadar[];
    size?: number;
    selectedPartNo?: number | null;
    onSelectPart?: (partNo: number) => void;
}

/**
 * Biểu đồ Radar 7 chiều trực quan hóa năng lực qua 7 Part TOEIC (UC07).
 * Hỗ trợ:
 * - Nhấn vào từng Part trên đồ thị hoặc chú thích để mở rộng chi tiết năng lực con (Luồng 5a).
 * - Chuyển đổi sang bảng số liệu thay thế nếu trình duyệt không hỗ trợ hoặc người dùng muốn đối chiếu (Ngoại lệ 4a).
 */
export function RadarChart({
    abilities,
    size = 300,
    selectedPartNo,
    onSelectPart,
}: RadarChartProps) {
    const [showFallbackTable, setShowFallbackTable] = useState(false);

    const center = size / 2;
    const radius = size * 0.34;
    const labelRadius = size * 0.44;
    const totalAxes = Math.max(abilities.length, 3);

    const levelPolygons = useMemo(() => {
        return LEVELS.map((lvl) => {
            const points = [];
            for (let i = 0; i < totalAxes; i++) {
                const angle = ((Math.PI * 2) / totalAxes) * i - Math.PI / 2;
                const x = center + radius * lvl * Math.cos(angle);
                const y = center + radius * lvl * Math.sin(angle);
                points.push(`${x},${y}`);
            }
            return points.join(' ');
        });
    }, [center, radius, totalAxes]);

    const axes = useMemo(() => {
        return abilities.map((item, i) => {
            const angle = ((Math.PI * 2) / totalAxes) * i - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            const lx = center + labelRadius * Math.cos(angle);
            const ly = center + labelRadius * Math.sin(angle);
            return { x, y, lx, ly, item };
        });
    }, [center, radius, labelRadius, totalAxes, abilities]);

    const { dataPoints, dataPointsStr } = useMemo(() => {
        const pts: { x: number; y: number; score: number; name: string; partNo: number }[] = [];
        const strArr: string[] = [];

        abilities.forEach((item, i) => {
            const angle = ((Math.PI * 2) / totalAxes) * i - Math.PI / 2;
            const normalizedScore = Math.max(0, Math.min(100, item.score)) / 100;
            const x = center + radius * normalizedScore * Math.cos(angle);
            const y = center + radius * normalizedScore * Math.sin(angle);

            pts.push({ x, y, score: item.score, name: item.name, partNo: item.partNo });
            strArr.push(`${x},${y}`);
        });

        return { dataPoints: pts, dataPointsStr: strArr.join(' ') };
    }, [abilities, center, radius, totalAxes]);

    if (abilities.length === 0) {
        return (
            <div className="radar-empty">
                Chưa đủ dữ liệu để kết xuất biểu đồ Radar.
            </div>
        );
    }

    return (
        <div className="radar-chart-container">
            <div className="radar-view-toggle">
                <button
                    type="button"
                    className={`radar-view-toggle__btn ${!showFallbackTable ? 'is-active' : ''}`}
                    onClick={() => setShowFallbackTable(false)}
                >
                    <BarChart3 size={13} />
                    <span>Biểu đồ Radar</span>
                </button>
                <button
                    type="button"
                    className={`radar-view-toggle__btn ${showFallbackTable ? 'is-active' : ''}`}
                    onClick={() => setShowFallbackTable(true)}
                >
                    <Table2 size={13} />
                    <span>Bảng số liệu</span>
                </button>
            </div>

            {showFallbackTable ? (
                <table className="radar-fallback-table" aria-label="Bảng số liệu năng lực 7 chiều">
                    <thead>
                        <tr>
                            <th>Phần thi</th>
                            <th>Điểm (%)</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {abilities.map((item) => (
                            <tr
                                key={item.code}
                                onClick={() => onSelectPart?.(item.partNo)}
                                className={selectedPartNo === item.partNo ? 'is-selected' : ''}
                            >
                                <td>{item.name}</td>
                                <td>{item.score}%</td>
                                <td>
                                    <span className={`radar-legend-score is-${item.status.toLowerCase()}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="radar-chart-svg"
                    role="img"
                    aria-label="Biểu đồ Radar 7 chiều đánh giá năng lực TOEIC"
                >
                    <defs>
                        <linearGradient id="radarFillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
                        </linearGradient>
                        <linearGradient id="radarStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#c084fc" />
                            <stop offset="100%" stopColor="#38bdf8" />
                        </linearGradient>
                    </defs>

                    {levelPolygons.map((poly, idx) => (
                        <polygon
                            key={idx}
                            points={poly}
                            fill="none"
                            stroke="#334155"
                            strokeWidth="1"
                            strokeDasharray={idx < LEVELS.length - 1 ? '3 3' : 'none'}
                            opacity={0.7}
                        />
                    ))}

                    {axes.map((ax) => (
                        <g
                            key={ax.item.code}
                            onClick={() => onSelectPart?.(ax.item.partNo)}
                            style={{ cursor: onSelectPart ? 'pointer' : 'default' }}
                        >
                            <line
                                x1={center}
                                y1={center}
                                x2={ax.x}
                                y2={ax.y}
                                stroke="#334155"
                                strokeWidth="1"
                                opacity={0.6}
                            />
                            <text
                                x={ax.lx}
                                y={ax.ly}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={selectedPartNo === ax.item.partNo ? '#fb923c' : '#cbd5e1'}
                                fontSize="11"
                                fontWeight={selectedPartNo === ax.item.partNo ? '700' : '600'}
                            >
                                {ax.item.name}
                            </text>
                        </g>
                    ))}

                    <polygon
                        points={dataPointsStr}
                        fill="url(#radarFillGrad)"
                        stroke="url(#radarStrokeGrad)"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                        className="radar-data-polygon"
                    />

                    {dataPoints.map((pt, idx) => (
                        <g
                            key={idx}
                            onClick={() => onSelectPart?.(pt.partNo)}
                            style={{ cursor: onSelectPart ? 'pointer' : 'default' }}
                        >
                            <circle
                                cx={pt.x}
                                cy={pt.y}
                                r={selectedPartNo === pt.partNo ? '6' : '4.5'}
                                fill="#ffffff"
                                stroke={selectedPartNo === pt.partNo ? '#ea580c' : '#a855f7'}
                                strokeWidth="2.5"
                                className="radar-vertex-dot"
                            />
                        </g>
                    ))}
                </svg>
            )}

            <div className="radar-legend-list">
                {abilities.map((item) => (
                    <button
                        key={item.code}
                        type="button"
                        onClick={() => onSelectPart?.(item.partNo)}
                        className={`radar-legend-item ${selectedPartNo === item.partNo ? 'is-selected' : ''}`}
                        title="Nhấn để xem chi tiết năng lực con thuộc phần này"
                    >
                        <span className="radar-legend-name">{item.name}</span>
                        <span className={`radar-legend-score is-${item.status.toLowerCase()}`}>
                            {item.score}%
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
