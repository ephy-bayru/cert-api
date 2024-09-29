import { IBaseEntity } from '../interfaces/IBaseEntity';
import { PaginationOptions, PaginationResult } from '../interfaces/IPagination';
import { Repository, FindManyOptions, FindOptionsOrder } from 'typeorm';

export async function paginate<T extends IBaseEntity>(
  repository: Repository<T>,
  paginationOptions: PaginationOptions<T>,
): Promise<PaginationResult<T>> {
  const { options = {}, page = 1, limit = 10, sort } = paginationOptions;

  const findOptions: FindManyOptions<T> = {
    ...options,
    take: limit,
    skip: (page - 1) * limit,
  };

  if (sort && sort.length > 0) {
    const order = sort.reduce<Record<string, 'ASC' | 'DESC'>>((acc, curr) => {
      acc[curr.field as string] = curr.order;
      return acc;
    }, {});
    findOptions.order = order as FindOptionsOrder<T>;
  }

  try {
    const [data, total] = await repository.findAndCount(findOptions);
    return { data, total, page, limit };
  } catch (error: any) {
    throw new Error(`Pagination failed: ${error.message}`);
  }
}
