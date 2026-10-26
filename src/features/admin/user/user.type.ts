export interface User {
  id: number;
  email: string;
  fullName: string;
  dob: string | null;
  avatar: string | null;
  isActive: boolean;
  role: 'ADMIN' | 'STUDENT';
  learnerType: 'VISUAL' | 'AUDITORY' | 'READING_WRITING' | 'KINESTHETIC' | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
