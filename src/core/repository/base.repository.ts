import {
  DataSource,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  Repository,
  SaveOptions,
  UpdateResult,
  DeleteResult,
  FindOptionsWhere,
  FindOptionsOrder,
  DeepPartial,
} from 'typeorm';
import {
  PaginationOptions,
  PaginationResult,
} from 'src/common/interfaces/IPagination';
import { IBaseRepository } from 'src/common/interfaces/IBaseRepository';
import { LoggerService } from 'src/common/services/logger.service';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { IBaseEntity } from 'src/common/interfaces/IBaseEntity';

export class BaseRepository<T extends IBaseEntity & { id: string }>
  implements IBaseRepository<T>
{
  protected repository: Repository<T>;
  protected logger: LoggerService;

  constructor(
    protected dataSource: DataSource,
    protected entity: EntityTarget<T>,
    logger: LoggerService,
  ) {
    this.repository = this.dataSource.getRepository(this.entity);
    this.logger = logger;
  }

  async findOne(idOrOptions: string | FindOneOptions<T>): Promise<T | null> {
    try {
      if (typeof idOrOptions === 'string') {
        const where: FindOptionsWhere<T> = {
          id: idOrOptions,
        } as FindOptionsWhere<T>;
        return await this.repository.findOneBy(where);
      }
      return await this.repository.findOne(idOrOptions);
    } catch (error) {
      this.logger.logError('Error finding entity', { error, idOrOptions });
      throw error;
    }
  }

  async findAll(
    paginationOptions: PaginationOptions<T>,
  ): Promise<PaginationResult<T>> {
    const { page = 1, limit = 10, options = {}, sort = [] } = paginationOptions;

    const findOptions: FindManyOptions<T> = {
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    };

    if (sort.length > 0) {
      const order = sort.reduce<Record<string, 'ASC' | 'DESC'>>((acc, curr) => {
        acc[curr.field] = curr.order;
        return acc;
      }, {});
      findOptions.order = order as FindOptionsOrder<T>;
    }

    try {
      const [data, total] = await this.repository.findAndCount(findOptions);
      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.logError('Error finding all entities', {
        error,
        paginationOptions,
      });
      throw error;
    }
  }

  async create(entity: DeepPartial<T>, options?: SaveOptions): Promise<T> {
    try {
      const createdEntity = await this.repository.save(entity, options);
      this.logger.logInfo('Entity created', { entity: createdEntity });
      return createdEntity;
    } catch (error) {
      this.logger.logError('Error creating entity', { error, entity });
      throw error;
    }
  }

  async update(
    criteria: string | FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    try {
      const result = await this.repository.update(criteria, partialEntity);
      this.logger.logInfo('Entity updated', { criteria, partialEntity });
      return result;
    } catch (error) {
      this.logger.logError('Error updating entity', {
        error,
        criteria,
        partialEntity,
      });
      throw error;
    }
  }

  async delete(criteria: string | FindOptionsWhere<T>): Promise<DeleteResult> {
    try {
      const result = await this.repository.delete(criteria);
      this.logger.logInfo('Entity deleted', { criteria });
      return result;
    } catch (error) {
      this.logger.logError('Error deleting entity', { error, criteria });
      throw error;
    }
  }

  async count(options: FindManyOptions<T> = {}): Promise<number> {
    try {
      return await this.repository.count(options);
    } catch (error) {
      this.logger.logError('Error counting entities', { error, options });
      throw error;
    }
  }

  async exists(criteria: FindOptionsWhere<T>): Promise<boolean> {
    try {
      const count = await this.repository.count({ where: criteria });
      return count > 0;
    } catch (error) {
      this.logger.logError('Error checking if entity exists', {
        error,
        criteria,
      });
      throw error;
    }
  }

  async search(
    paginationOptions: PaginationOptions<T>,
  ): Promise<PaginationResult<T>> {
    const { page = 1, limit = 10, sort = [], options = {} } = paginationOptions;

    const queryBuilder = this.repository.createQueryBuilder('entity');

    if (options.where) {
      queryBuilder.where(options.where);
    }

    if (options.relations && Array.isArray(options.relations)) {
      options.relations.forEach((relation) => {
        queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
      });
    }

    if (sort.length > 0) {
      sort.forEach(({ field, order }) => {
        queryBuilder.addOrderBy(`entity.${String(field)}`, order);
      });
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    try {
      const [data, total] = await queryBuilder.getManyAndCount();
      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error) {
      this.logger.logError('Error searching entities', {
        error,
        paginationOptions,
      });
      throw error;
    }
  }
}
