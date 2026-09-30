/**
 * @file Các kiểu dữ liệu cho tính năng quản lý người dùng (Admin User)
 */

export interface UserFilterParams {
  page: number;
  pageSize: number;
  keyword?: string;
  isActive?: boolean;
  role?: string;
  aimScore?: number;
}

export interface UserListItemResponse {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  learnerType: string;
  aimTarget: string | null;
  createdAt: string;
}

export interface UserDetailResponse extends UserListItemResponse {
  dob?: string;
  avatar?: string;
  username: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  fullName: string;
  password?: string;
  role: string;
  isActive: boolean;
}

export interface UpdateUserRequest {
  username: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
}
