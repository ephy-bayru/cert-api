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
} from 'typeorm';
import {
  PaginationOptions,
  PaginationResult,
} from 'src/common/interfaces/IPagination';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { IBaseRepository } from 'src/common/interfaces/IBaseRepository';

export class BaseRepository<T> implements IBaseRepository<T> {
  protected repository: Repository<T>;

  constructor(
    private dataSource: DataSource,
    private entity: EntityTarget<T>,
  ) {
    this.repository = this.dataSource.getRepository(this.entity);
  }

  async findOne(idOrOptions: number | FindOneOptions<T>): Promise<T | null> {
    if (typeof idOrOptions === 'number') {
      const findOptions: FindOptionsWhere<T> = {} as FindOptionsWhere<T>;
      findOptions['id'] = idOrOptions;
      return this.repository.findOne({
        where: findOptions,
      });
    }
    return this.repository.findOne(idOrOptions);
  }

  /**
   * Finds all entities based on the provided options, with pagination and sorting.
   *
   * @param paginationOptions - The options to filter, paginate, and limit the entities.
   * @returns A promise that resolves to a pagination result containing the array of found entities.
   */
  async findAll(
    paginationOptions: PaginationOptions<T>,
  ): Promise<PaginationResult<T>> {
    const { page = 1, limit = 10, options = {}, sort } = paginationOptions;

    // Create the base find options
    const findOptions: FindManyOptions<T> = {
      ...options,
      skip: (page - 1) * limit,
      take: limit,
    };

    // Add sorting if available, using string conversion for `keyof T`
    if (sort) {
      findOptions.order = sort.reduce((acc, curr) => {
        acc[curr.field as string] = curr.order;
        return acc;
      }, {} as FindOptionsOrder<T>);
    }

    const [data, total] = await this.repository.findAndCount(findOptions);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async create(entity: Partial<T>, options?: SaveOptions): Promise<T> {
    return this.repository.save(entity as any, options);
  }

  async update(
    criteria: number | FindOptionsWhere<T>,
    partialEntity: Partial<T>,
  ): Promise<UpdateResult> {
    const transformedEntity: QueryDeepPartialEntity<T> =
      partialEntity as QueryDeepPartialEntity<T>;

    return this.repository.update(criteria, transformedEntity);
  }

  async delete(criteria: number | FindOptionsWhere<T>): Promise<DeleteResult> {
    return this.repository.delete(criteria);
  }

  async count(options: FindManyOptions<T> = {}): Promise<number> {
    return this.repository.count(options);
  }

  async exists(criteria: FindOneOptions<T>): Promise<boolean> {
    const count = await this.repository.count(criteria);
    return count > 0;
  }

  /**
   * Searches for entities based on the provided pagination and sorting options.
   *
   * @param paginationOptions - The options to paginate, sort, and filter the entities.
   * @returns A promise that resolves to an object containing the data, total count, page number, and limit.
   */
  async search(
    paginationOptions: PaginationOptions<T>,
  ): Promise<PaginationResult<T>> {
    const { page = 1, limit = 10, sort, options = {} } = paginationOptions;

    // Create the base query using TypeORM's QueryBuilder and apply filtering options
    const queryBuilder = this.repository.createQueryBuilder('entity');

    // Apply filtering options (e.g., where conditions)
    if (options.where) {
      queryBuilder.where(options.where);
    }

    // Apply relations if they exist and are in object form
    if (options.relations && typeof options.relations === 'object') {
      Object.keys(options.relations).forEach((relation) => {
        queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
      });
    }

    // Handle sorting
    if (sort) {
      sort.forEach(({ field, order }) => {
        queryBuilder.addOrderBy(`entity.${String(field)}`, order);
      });
    }

    // Apply pagination
    queryBuilder.skip((page - 1) * limit).take(limit);

    // Execute the query and get the results
    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
