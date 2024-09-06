import {
  FindOneOptions,
  FindManyOptions,
  SaveOptions,
  UpdateResult,
  DeleteResult,
  FindOptionsWhere,
} from 'typeorm';
import { PaginationOptions, PaginationResult } from './IPagination';

/**
 * Represents a base repository interface.
 * @template T - The entity type.
 */
export interface IBaseRepository<T> {
  /**
   * Finds an entity by its id or options.
   * @param id - The id or options to find the entity.
   * @returns A promise that resolves to the found entity or null if not found.
   */
  findOne(id: number | FindOneOptions<T>): Promise<T | null>;

  /**
   * Retrieves all entities based on the provided options and pagination parameters.
   * @param paginationOptions - Pagination options including repository, options, page, and limit.
   * @returns A promise that resolves to a pagination result containing the array of found entities and pagination details.
   */
  findAll(
    paginationOptions: PaginationOptions<T>,
  ): Promise<PaginationResult<T>>;

  /**
   * Creates a new entity.
   * @param entity - The entity to create.
   * @param options - Optional save options.
   * @returns A promise that resolves to the created entity.
   */
  create(entity: Partial<T>, options?: SaveOptions): Promise<T>;

  /**
   * Updates an entity based on provided criteria.
   * @param criteria - The criteria to match the entity.
   * @param partialEntity - The updated entity data.
   * @returns A promise that resolves to the update result.
   */
  update(
    criteria: number | FindOptionsWhere<T>,
    partialEntity: Partial<T>,
  ): Promise<UpdateResult>;

  /**
   * Deletes an entity based on provided criteria.
   * @param criteria - The criteria to match the entity.
   * @returns A promise that resolves to the delete result.
   */
  delete(criteria: number | FindOptionsWhere<T>): Promise<DeleteResult>;

  /**
   * Counts the number of entities, with optional filtering options.
   * @param options - Optional filtering options.
   * @returns A promise that resolves to the count of entities.
   */
  count(options?: FindManyOptions<T>): Promise<number>;

  /**
   * Checks if an entity exists based on provided criteria.
   * @param criteria - The criteria to match the entity.
   * @returns A promise that resolves to a boolean indicating if the entity exists.
   */
  exists(criteria: FindOptionsWhere<T>): Promise<boolean>;

  /**
   * Performs a search to fetch paginated entities, with optional sorting.
   * @param paginationOptions - Pagination options including repository, options, page, and limit.
   * @returns A promise that resolves to an object containing the paginated data and metadata.
   */
  search(paginationOptions: PaginationOptions<T>): Promise<PaginationResult<T>>;
}
