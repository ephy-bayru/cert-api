import {
  DataSource,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  Repository,
  SaveOptions,
  DeleteResult,
  FindOptionsWhere,
  FindOptionsOrder,
  DeepPartial,
  QueryRunner,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { IBaseEntity } from 'src/common/interfaces/IBaseEntity';
import { IBaseRepository } from 'src/common/interfaces/IBaseRepository';
import { LoggerService } from 'src/common/services/logger.service';
import {
  PaginationOptions,
  PaginationResult,
} from 'src/common/interfaces/IPagination';

export class BaseRepository<T extends IBaseEntity>
  implements IBaseRepository<T>
{
  protected repository: Repository<T>;

  constructor(
    protected readonly dataSource: DataSource,
    protected readonly entity: EntityTarget<T>,
    protected readonly logger: LoggerService,
  ) {
    this.repository = this.dataSource.getRepository(this.entity);
  }

  async findOne(idOrOptions: string | FindOneOptions<T>): Promise<T> {
    try {
      let result: T | null;
      if (typeof idOrOptions === 'string') {
        result = await this.repository.findOne({
          where: { id: idOrOptions } as FindOptionsWhere<T>,
        });
      } else {
        result = await this.repository.findOne(idOrOptions);
      }

      if (!result) {
        const id = this.extractIdFromOptions(idOrOptions);
        throw new NotFoundException(`Entity with id ${id} not found`);
      }

      return result;
    } catch (error) {
      this.handleError('Error finding entity', error, { idOrOptions });
    }
  }

  private extractIdFromOptions(
    idOrOptions: string | FindOneOptions<T>,
  ): string {
    if (typeof idOrOptions === 'string') {
      return idOrOptions;
    }

    if (idOrOptions.where && 'id' in idOrOptions.where) {
      return idOrOptions.where['id'] as string;
    }

    return 'unknown';
  }

  async findAll(
    paginationOptions: PaginationOptions<T>,
  ): Promise<PaginationResult<T>> {
    const { page = 1, limit = 10, options = {}, sort = [] } = paginationOptions;

    try {
      const [data, total] = await this.repository.findAndCount({
        ...options,
        skip: (page - 1) * limit,
        take: limit,
        order: this.parseSortOption(sort),
      });

      return { data, total, page, limit };
    } catch (error) {
      this.handleError('Error finding all entities', error, {
        paginationOptions,
      });
    }
  }

  /**
   * Creates and immediately saves a new entity instance.
   */
  async create(entity: DeepPartial<T>): Promise<T> {
    try {
      return await this.repository.save(entity);
    } catch (error) {
      this.handleError('Error creating entity', error, { entity });
    }
  }

  async save(entity: T, options?: SaveOptions): Promise<T> {
    try {
      return await this.repository.save(entity, options);
    } catch (error) {
      this.handleError('Error saving entity', error, { entity });
    }
  }

  async update(
    criteria: string | FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    try {
      const result = await this.repository.update(criteria, partialEntity);
      if (result.affected === 0) {
        throw new NotFoundException('Entity not found');
      }
      return result;
    } catch (error) {
      this.handleError('Error updating entity', error, {
        criteria,
        partialEntity,
      });
    }
  }

  async delete(criteria: string | FindOptionsWhere<T>): Promise<DeleteResult> {
    try {
      const result = await this.repository.delete(criteria);
      if (result.affected === 0) {
        throw new NotFoundException('Entity not found');
      }
      return result;
    } catch (error) {
      this.handleError('Error deleting entity', error, { criteria });
    }
  }

  async count(options: FindManyOptions<T> = {}): Promise<number> {
    try {
      return await this.repository.count(options);
    } catch (error) {
      this.handleError('Error counting entities', error, { options });
    }
  }

  async exists(criteria: FindOptionsWhere<T>): Promise<boolean> {
    try {
      const count = await this.repository.count({ where: criteria });
      return count > 0;
    } catch (error) {
      this.handleError('Error checking if entity exists', error, { criteria });
    }
  }

  async search(
    paginationOptions: PaginationOptions<T>,
  ): Promise<PaginationResult<T>> {
    const { page = 1, limit = 10, sort = [], options = {} } = paginationOptions;

    try {
      const queryBuilder = this.createSearchQueryBuilder();
      this.applySearchOptions(queryBuilder, options);
      this.applySorting(queryBuilder, sort);

      const [data, total] = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return { data, total, page, limit };
    } catch (error) {
      this.handleError('Error searching entities', error, {
        paginationOptions,
      });
    }
  }

  /**
   * Properly wraps operations in a TypeORM transaction.
   * We ensure `operation(queryRunner)` is awaited so it returns a real value, not a Promise.
   */
  protected async transaction<R>(
    operation: (queryRunner: QueryRunner) => Promise<R>,
  ): Promise<R> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      this.logger.debug(
        'Starting transaction - creating queryRunner',
        'BaseRepository',
      );
  
      // Log to see if the operation was called
      this.logger.debug(
        'About to execute the operation callback inside the transaction',
        'BaseRepository',
      );
  
      const result = await operation(queryRunner);
  
      // Log the result from the operation
      this.logger.debug('Transaction operation result', 'BaseRepository', {
        result,
      });
  
      await queryRunner.commitTransaction();
      this.logger.debug('Transaction committed', 'BaseRepository', { result });
  
      return result;
    } catch (error) {
      // Log the raw error object (including driverError if present)
      this.logger.error('Transaction failed with error', 'BaseRepository', {
        error: this.formatFullError(error),
      });
  
      await queryRunner.rollbackTransaction();
      this.logger.debug('Transaction rolled back', 'BaseRepository');
      throw new InternalServerErrorException('Transaction failed. Please try again later.');
    } finally {
      await queryRunner.release();
      this.logger.debug('Transaction completed, queryRunner released', 'BaseRepository');
    }
  }
  

  protected handleError(
    message: string,
    error: unknown,
    context?: unknown,
  ): never {
    // Attempt to format the error with any driverError
    const fullError = this.formatFullError(error);
  
    this.logger.error(message, 'BaseRepository', { error: fullError, context });
    
    if (error instanceof NotFoundException) {
      throw error;
    }
    
    throw new InternalServerErrorException(message);
  }
  

  private parseSortOption(
    sort: Array<{ field: keyof T; order: 'ASC' | 'DESC' }>,
  ): FindOptionsOrder<T> {
    return sort.reduce((acc, { field, order }) => {
      (acc as any)[field] = order;
      return acc;
    }, {} as FindOptionsOrder<T>);
  }

  private createSearchQueryBuilder(): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder('entity');
  }

  private applySearchOptions(
    queryBuilder: SelectQueryBuilder<T>,
    options: FindManyOptions<T>,
  ): void {
    if (options.where) {
      queryBuilder.where(options.where);
    }

    if (options.relations && Array.isArray(options.relations)) {
      for (const relation of options.relations) {
        queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
      }
    }
  }

  private applySorting(
    queryBuilder: SelectQueryBuilder<T>,
    sort: Array<{ field: string; order: 'ASC' | 'DESC' }>,
  ): void {
    for (const { field, order } of sort) {
      queryBuilder.addOrderBy(`entity.${field}`, order);
    }
  }

  private formatFullError(error: any): any {
    if (!error || typeof error !== 'object') {
      return error;
    }
    const formatted: any = { ...error };
    // Some drivers nest the actual DB error in `error.driverError`.
    // We copy that out if it exists:
    if (error.driverError) {
      formatted.driverError = { ...error.driverError };
    }
    return formatted;
  }
  
}
