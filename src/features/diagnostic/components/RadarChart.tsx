import { useMemo } from 'react';
import type { AbilityRadar } from '../types/diagnosticTypes';

const LEVELS = [0.25, 0.5, 0.75, 1];

interface RadarChartProps {
    abilities: AbilityRadar[];
    size?: number;
}

export function RadarChart({ abilities, size = 300 }: RadarChartProps) {
    const center = size / 2;
    const radius = size * 0.36;
    const totalAxes = abilities.length;

    const levelPolygons = useMemo(() => {
        return LEVELS.map((lvl) => {
            const points = [];
            for (let i = 0; i < totalAxes; i++) {
                const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
                const x = center + radius * lvl * Math.cos(angle);
                const y = center + radius * lvl * Math.sin(angle);
                points.push(`${x},${y}`);
            }
            return points.join(' ');
        });
    }, [center, radius, totalAxes]);

    const axes = useMemo(() => {
        return abilities.map((_, i) => {
            const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            return { x, y };
        });
    }, [center, radius, totalAxes, abilities]);

    const { dataPoints, dataPointsStr } = useMemo(() => {
        const pts: { x: number; y: number; score: number; name: string }[] = [];
        const strArr: string[] = [];

        abilities.forEach((item, i) => {
            const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
            const normalizedScore = Math.max(0, Math.min(100, item.score)) / 100;
            const x = center + radius * normalizedScore * Math.cos(angle);
            const y = center + radius * normalizedScore * Math.sin(angle);

            pts.push({ x, y, score: item.score, name: item.name });
            strArr.push(`${x},${y}`);
        });

        return { dataPoints: pts, dataPointsStr: strArr.join(' ') };
    }, [abilities, center, radius, totalAxes]);

    return (
        <div className="radar-chart-container">
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="radar-chart-svg"
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

                {axes.map((ax, idx) => (
                    <line
                        key={idx}
                        x1={center}
                        y1={center}
                        x2={ax.x}
                        y2={ax.y}
                        stroke="#334155"
                        strokeWidth="1"
                        opacity={0.6}
                    />
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
                    <g key={idx}>
                        <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="4.5"
                            fill="#ffffff"
                            stroke="#a855f7"
                            strokeWidth="2.5"
                            className="radar-vertex-dot"
                        />
                    </g>
                ))}
            </svg>

            <div className="radar-legend-list">
                {abilities.map((item) => (
                    <div key={item.code} className="radar-legend-item">
                        <span className="radar-legend-name">{item.name}</span>
                        <span className={`radar-legend-score is-${item.status.toLowerCase()}`}>
                            {item.score}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
