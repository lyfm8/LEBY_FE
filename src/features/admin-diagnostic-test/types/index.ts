export interface DiagnosticTestListItemResponse {
  id: number;
  title: string;
  description: string;
  status: boolean;
  totalQuestions: number;
}

export interface DiagnosticTestDetailResponse extends DiagnosticTestListItemResponse {
  questionIds: number[];
}

export interface CreateDiagnosticTestRequest {
  title: string;
  description?: string;
  status: boolean;
  questionIds: number[];
}
