import { FindOptionsOrder, FindOptionsWhere } from 'typeorm';
import { IBaseEntity } from './IBaseEntity';

export interface SortOption<T> {
  field: Extract<keyof T, string>;
  order: 'ASC' | 'DESC';
}

export interface PaginationOptions<T extends IBaseEntity> {
  options: {
    where: FindOptionsWhere<T>;
    order?: FindOptionsOrder<T>;
    [key: string]: any;
  };
  page?: number;
  limit?: number;
  sort?: SortOption<T>[];
  search?: string;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
