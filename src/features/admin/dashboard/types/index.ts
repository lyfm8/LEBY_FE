/**
 * @file Các kiểu dữ liệu cho tính năng Admin Dashboard
 */

export interface DashboardStats {
  totalUsers: number;
  totalUsersGrowthPercent: number;
  activeUsersThisMonth: number;
  activeUsersGrowthPercent: number;
  totalModules: number;
  totalTestsCompleted: number;
}

export interface UsersByMonth {
  month: string;
  count: number;
}

export interface AimDistribution {
  aimName: string;
  count: number;
  percent: number;
}

export interface ModuleTestPassRate {
  passPercent: number;
  failPercent: number;
}

export type ResultBadgeType = 'PASS' | 'NEW' | 'SCORE';

export interface RecentActivity {
  userId: number;
  fullName: string;
  action: string;
  aimTarget: string;
  timeAgo: string;
  resultBadge: ResultBadgeType;
}

export interface DashboardSummary {
  stats: DashboardStats;
  usersByMonth: UsersByMonth[];
  aimDistribution: AimDistribution[];
  moduleTestPassRate: ModuleTestPassRate;
  recentActivities: RecentActivity[];
}
