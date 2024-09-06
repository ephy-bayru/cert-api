import { FindManyOptions } from 'typeorm';

/**
 * Pagination options for fetching data.
 * @template T - The entity type.
 */
export interface PaginationOptions<T> {
  /**
   * TypeORM find options for filtering, relations, etc.
   */
  options?: FindManyOptions<T>;

  /**
   * The page number to retrieve. Defaults to 1.
   */
  page?: number;

  /**
   * The number of items per page. Defaults to 10.
   */
  limit?: number;

  /**
   * Sorting options for the query.
   * You can sort by multiple fields with ascending or descending order.
   */
  sort?: { field: keyof T; order: 'ASC' | 'DESC' }[];
}

/**
 * Result of paginated query.
 * @template T - The entity type.
 */
export interface PaginationResult<T> {
  /**
   * The data returned for the current page.
   */
  data: T[];

  /**
   * The total number of items available.
   */
  total: number;

  /**
   * The current page number.
   */
  page: number;

  /**
   * The number of items per page.
   */
  limit: number;
}
