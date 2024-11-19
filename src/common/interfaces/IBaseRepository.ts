import {
  FindOneOptions,
  FindManyOptions,
  SaveOptions,
  UpdateResult,
  DeleteResult,
  FindOptionsWhere,
  DeepPartial,
} from 'typeorm';
import { PaginationOptions, PaginationResult } from './IPagination';
import { IBaseEntity } from './IBaseEntity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

/**
 * Represents a base repository interface.
 * @template T - The entity type.
 */
export interface IBaseRepository<T extends IBaseEntity> {
  findOne(id: string | FindOneOptions<T>): Promise<T | null>;
  findAll(
    paginationOptions: PaginationOptions<T>,
  ): Promise<PaginationResult<T>>;
  create(entity: DeepPartial<T>): T;
  update(
    criteria: string | FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult>;
  delete(criteria: string | FindOptionsWhere<T>): Promise<DeleteResult>;
  count(options?: FindManyOptions<T>): Promise<number>;
  exists(criteria: FindOptionsWhere<T>): Promise<boolean>;
  search(paginationOptions: PaginationOptions<T>): Promise<PaginationResult<T>>;
}
