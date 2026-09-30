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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Biểu đồ học viên theo tháng */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-100 lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Tăng trưởng học viên</h3>
        {/* CSS Bar Chart đơn giản */}
        <div className="flex items-end h-48 space-x-2 pb-2 border-b border-gray-200">
          {usersByMonth.map((item, index) => {
            const heightPercent = (item.count / maxUserCount) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col justify-end items-center group relative">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-800 text-white text-xs py-1 px-2 rounded transition-opacity pointer-events-none whitespace-nowrap">
                  {item.count.toLocaleString()} HV
                </div>
                {/* Bar */}
                <div 
                  className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors" 
                  style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                ></div>
                <span className="text-xs text-gray-500 mt-2 absolute -bottom-6">{item.month}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-8 text-center text-sm text-gray-500">6 tháng gần nhất</div>
      </div>

      {/* Biểu đồ phân bố AIM và Tỉ lệ Pass */}
      <div className="flex flex-col gap-6">
        {/* Phân bố AIM */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100 flex-1">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Phân bố mục tiêu (AIM)</h3>
          <div className="space-y-4">
            {aimDistribution.map((aim, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{aim.aimName}</span>
                  <span className="text-gray-500">{aim.percent}% ({aim.count})</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${aim.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module Test Pass Rate */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100 flex-1 flex flex-col justify-center">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Tỉ lệ Pass/Fail Test</h3>
          <div className="flex h-4 rounded-full overflow-hidden mb-2">
            <div className="bg-green-500 h-full" style={{ width: `${moduleTestPassRate.passPercent}%` }}></div>
            <div className="bg-red-500 h-full" style={{ width: `${moduleTestPassRate.failPercent}%` }}></div>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <div className="flex items-center text-green-600 font-medium">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
              Pass ({moduleTestPassRate.passPercent}%)
            </div>
            <div className="flex items-center text-red-600 font-medium">
              <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
              Fail ({moduleTestPassRate.failPercent}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
