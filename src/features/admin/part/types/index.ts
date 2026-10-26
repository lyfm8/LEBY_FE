/**
 * @file Định nghĩa các kiểu dữ liệu cho tính năng Quản lý Part & Ability
 */

export type PartSectionType = 'LISTENING' | 'READING';

export interface PartResponse {
  id: number;
  name: string;
  description?: string;
  sections: PartSectionType;
}

export interface PartRequest {
  name: string;
  description?: string;
  sections: PartSectionType;
}

export interface AbilityResponse {
  id: number;
  name: string;
  description: string;
  sections: PartSectionType;
  partId: number;
}

export interface AbilityRequest {
  name: string;
  description?: string;
}

export type AbilityFormData = AbilityRequest;
export type PartFormData = PartRequest;
