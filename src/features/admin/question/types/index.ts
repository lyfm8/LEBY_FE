/**
 * @file Định nghĩa kiểu dữ liệu chuẩn cho Ngân hàng câu hỏi (UC A04).
 */

export type QuestionType = 'SINGLE_CHOICE' | 'FILL_IN_BLANK';
export type SectionType = 'LISTENING' | 'READING';
export type MediaKind = 'IMAGE' | 'AUDIO' | 'VIDEO';
export type QuestionStructureType = 'ALL' | 'STANDALONE' | 'GROUP';

export interface QuestionFilterParams {
    page?: number;
    size?: number;
    pageSize?: number; // Hỗ trợ tương thích ngược cho module Diagnostic / ModuleTest
    keyword?: string;
    section?: SectionType;
    partId?: number;
    abilityId?: number;
    difficulty?: number;
    structureType?: QuestionStructureType;
}

export interface QuestionOption {
    key: string;
    text: string;
}

export interface QuestionVocabularyItem {
    word: string;
    type: string;
    meaning: string;
}

export interface QuestionExplanation {
    transcript?: string;
    translation?: string;
    clue?: string;
    analysis?: string;
    vocabulary?: QuestionVocabularyItem[];
}

export interface QuestionMediaItem {
    mediaId: number;
    publicId?: string;
    url: string;
    kind: MediaKind;
    format?: string;
    bytes?: number;
    originalFilename?: string;
    duration?: number;
    width?: number;
    height?: number;
    orderNo?: number;
}

export interface QuestionAbilityItem {
    abilityId: number;
    abilityName: string;
    orderNo?: number;
    points?: number;
}

export interface QuestionGroupItem {
    id?: number;
    name: string;
    orderNo?: number;
    text?: string;
    options: QuestionOption[];
    correctKey: string;
    abilityIds: number[];
    difficulty: number;
    explanation?: QuestionExplanation;
    medias?: QuestionMediaItem[];
    abilities?: QuestionAbilityItem[];
}

export interface QuestionListItem {
    id: number;
    name: string;
    summary: string;
    questionSummary?: string; // Tương thích ngược với DiagnosticTest & ModuleTest
    type: QuestionType;
    partId: number;
    partName: string;
    section: SectionType;
    difficulty: number;
    isGroup: boolean;
    itemCount: number;
    abilityNames: string[];
    abilityName?: string; // Tương thích ngược với DiagnosticTest & ModuleTest
    mediaKinds: MediaKind[];
    updatedAt: string;
}

// Alias cho tương thích ngược với các module khác
export type QuestionListItemResponse = QuestionListItem;

export interface QuestionDetail {
    id: number;
    name: string;
    type: QuestionType;
    isGroup: boolean;
    partId: number;
    partName: string;
    section: SectionType;
    difficulty: number;
    descriptions?: string;
    text?: string;
    options?: QuestionOption[];
    correctKey?: string;
    instruction?: string;
    passage?: string;
    explanation?: QuestionExplanation;
    medias?: QuestionMediaItem[];
    abilities?: QuestionAbilityItem[];
    items?: QuestionGroupItem[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateStandaloneQuestionPayload {
    name: string;
    partId: number;
    abilityIds: number[];
    difficulty: number;
    text: string;
    options: QuestionOption[];
    correctKey: string;
    explanation?: QuestionExplanation;
    medias?: QuestionMediaItem[];
    descriptions?: string;
}

export type UpdateStandaloneQuestionPayload = CreateStandaloneQuestionPayload;

export interface CreateQuestionGroupPayload {
    name: string;
    partId: number;
    instruction?: string;
    passage?: string;
    transcript?: string;
    translation?: string;
    descriptions?: string;
    medias?: { mediaId: number; orderNo: number }[];
    items: {
        id?: number;
        name: string;
        orderNo: number;
        text: string;
        options: QuestionOption[];
        correctKey: string;
        abilityIds: number[];
        difficulty: number;
        explanation?: QuestionExplanation;
    }[];
}

export type UpdateQuestionGroupPayload = CreateQuestionGroupPayload;
