import React from 'react';
import type { UsersByMonth, AimDistribution, ModuleTestPassRate } from '../types';

interface ChartSectionProps {
  usersByMonth: UsersByMonth[];
  aimDistribution: AimDistribution[];
  moduleTestPassRate: ModuleTestPassRate;
}

export const ChartSection: React.FC<ChartSectionProps> = ({ 
  usersByMonth, 
  aimDistribution, 
  moduleTestPassRate 
}) => {
  // Tìm max để tính tỉ lệ chiều cao cột CSS
  const maxUserCount = Math.max(...usersByMonth.map(u => u.count), 1);

  return (
    <div className="chart-section">
      {/* Biểu đồ học viên theo tháng */}
      <div className="chart-card">
        <h3 className="chart-title">Tăng trưởng học viên</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: '16rem', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
          {usersByMonth.map((item, index) => {
            const heightPercent = (item.count / maxUserCount) * 100;
            return (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', position: 'relative' }}>
                <div style={{ width: '100%', backgroundColor: '#3b82f6', borderTopLeftRadius: '2px', borderTopRightRadius: '2px', height: `${heightPercent}%`, minHeight: '4px' }}></div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', position: 'absolute', bottom: '-1.5rem' }}>{item.month}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>6 tháng gần nhất</div>
      </div>

      {/* Biểu đồ phân bố AIM và Tỉ lệ Pass */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Phân bố AIM */}
        <div className="chart-card" style={{ flex: 1 }}>
          <h3 className="chart-title">Phân bố mục tiêu (AIM)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {aimDistribution.map((aim, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 500, color: '#374151' }}>{aim.aimName}</span>
                  <span style={{ color: '#6b7280' }}>{aim.percent}% ({aim.count})</span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#f3f4f6', borderRadius: '9999px', height: '0.5rem' }}>
                  <div style={{ backgroundColor: '#a855f7', height: '0.5rem', borderRadius: '9999px', width: `${aim.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module Test Pass Rate */}
        <div className="chart-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 className="chart-title">Tỉ lệ Pass/Fail Test</h3>
          <div style={{ display: 'flex', height: '1rem', borderRadius: '9999px', overflow: 'hidden', marginBottom: '0.5rem' }}>
            <div style={{ backgroundColor: '#22c55e', height: '100%', width: `${moduleTestPassRate.passPercent}%` }}></div>
            <div style={{ backgroundColor: '#ef4444', height: '100%', width: `${moduleTestPassRate.failPercent}%` }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', color: '#16a34a', fontWeight: 500 }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e', marginRight: '0.5rem' }}></span>
              Pass ({moduleTestPassRate.passPercent}%)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: '#dc2626', fontWeight: 500 }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', marginRight: '0.5rem' }}></span>
              Fail ({moduleTestPassRate.failPercent}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
