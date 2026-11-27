/**
 * @file Các kiểu dữ liệu chuẩn hóa cho tính năng Admin Dashboard (A01).
 * Tuân thủ nghiêm ngặt Strict Typing (100% không dùng any) và khớp hoàn toàn với Backend DTOs.
 */

export interface DashboardStats {
  totalUsers: number;
  totalUsersGrowthPercent: number;
  activeUsersThisMonth: number;
  activeUsersGrowthPercent: number;
  learningPathCompletionRate: number;
  moduleTestPassRate: number;
  totalTestsCompleted: number;
  totalModules: number;
}

export interface UsersByMonth {
  month: string;
  newUsersCount: number;
  testSubmissionsCount: number;
}

export interface AimDistribution {
  aimName: string;
  count: number;
  percent: number;
}

export interface TopDifficultModule {
  moduleId: number;
  moduleTitle: string;
  partName: string;
  totalAttempts: number;
  failCount: number;
  failPercent: number;
}

export type ResultBadgeType = 'PASS' | 'FAIL' | 'NEW' | 'SCORE' | 'DIAGNOSTIC';

export interface RecentActivity {
  id?: number;
  userId: number | null;
  fullName: string;
  avatar?: string | null;
  action: string;
  aimTarget: string;
  timeAgo: string;
  timestamp?: string | null;
  resultBadge: ResultBadgeType | string;
  score?: number | null;
}

export interface DashboardSummary {
  stats: DashboardStats;
  usersByMonth: UsersByMonth[];
  aimDistribution: AimDistribution[];
  topDifficultModules: TopDifficultModule[];
  recentActivities: RecentActivity[];
}

export type TimeRangeFilter = 'all' | 'this_month' | '30d' | '7d';
