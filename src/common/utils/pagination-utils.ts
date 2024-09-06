import { PaginationOptions, PaginationResult } from '../interfaces/IPagination';
import { Repository, FindManyOptions, FindOptionsOrder } from 'typeorm';

export async function paginate<T>(
  repository: Repository<T>,
  paginationOptions: PaginationOptions<T>,
): Promise<PaginationResult<T>> {
  const { options = {}, page = 1, limit = 10, sort } = paginationOptions;

  const findOptions: FindManyOptions<T> = {
    ...options,
    take: limit,
    skip: (page - 1) * limit,
  };

  if (sort) {
    findOptions.order = sort.reduce((acc, curr) => {
      const field = curr.field;
      acc[field as string] = curr.order;
      return acc;
    }, {} as FindOptionsOrder<T>);
  }

  try {
    const [data, total] = await repository.findAndCount(findOptions);
    return { data, total, page, limit };
  } catch (error) {
    throw new Error(`Pagination failed: ${error.message}`);
  }
}
