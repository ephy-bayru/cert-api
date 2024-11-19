import { DocumentStatus } from '../entities/document-status.enum';

export interface DocumentFilters {
  page?: number;
  limit?: number;
  status?: DocumentStatus;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}

export interface DocumentSearchParams extends DocumentFilters {
  searchTerm?: string;
}
