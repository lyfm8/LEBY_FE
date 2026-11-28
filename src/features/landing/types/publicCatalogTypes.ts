import type { SectionType } from '@/features/roadmap/types/roadmapTypes';

/**
 * Thông tin tối giản của một mô-đun công khai hiển thị trên Landing Page.
 * Chỉ giữ lại tên mô-đun và số lượng bài giảng, bài thực hành, bài test.
 */
export interface PublicCatalogModule {
    id: number;
    sequence: number;
    title: string;
    videoLessonCount: number;
    practiceLessonCount: number;
    testCount: number;
}

/**
 * Thông tin một phần thi TOEIC (Part 1 - Part 7) hiển thị công khai trên Landing Page.
 */
export interface PublicCatalogPart {
    partId: number;
    partName: string;
    section: SectionType;
    modules: PublicCatalogModule[];
}

/**
 * Dữ liệu tổng hợp chương trình 7 Part TOEIC từ GET /api/public/catalog.
 */
export interface PublicCatalogData {
    totalParts: number;
    totalModules: number;
    totalLessons: number;
    parts: PublicCatalogPart[];
}
