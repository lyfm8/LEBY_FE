/**
 * @file Định nghĩa các kiểu dữ liệu cho tính năng Quản lý Part & Ability
 */

export type PartSectionType = 'LISTENING' | 'READING';
export type AbilityStatusType = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

export interface PartResponse {
  id: number;
  name: string;
  section: PartSectionType;
  totalQuestions: number;
}

export interface AbilityResponse {
  id: number;
  name: string;
  description: string;
  status: AbilityStatusType;
  totalQuestions: number;
}

export interface AbilityFormData {
  name: string;
  description: string;
  status: AbilityStatusType;
}
