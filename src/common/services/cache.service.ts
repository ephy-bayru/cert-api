import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { serialize, deserialize } from '../utils/serialization-utils';
import { LoggerService } from './logger.service';

@Injectable()
export class CacheService {
  private readonly defaultTtl = 300;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly logger: LoggerService,
  ) {}

  async set(
    key: string,
    value: any,
    ttl: number = this.defaultTtl,
  ): Promise<void> {
    try {
      const serializedValue = serialize(value);
      await this.cacheManager.set(key, serializedValue, ttl);
      this.logger.log(
        `Cache set for key "${key}" with TTL: ${ttl} seconds`,
        'CacheService',
      );
    } catch (error) {
      this.logger.error(
        `Error setting cache for key "${key}": ${error.message}`,
        'CacheService',
        { key, ttl, error },
      );
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<string>(key);
      if (value) {
        this.logger.log(`Cache hit for key "${key}"`, 'CacheService');
        return deserialize<T>(value);
      } else {
        this.logger.debug(`Cache miss for key "${key}"`, 'CacheService');
        return null;
      }
    } catch (error) {
      this.logger.error(
        `Error getting cache for key "${key}": ${error.message}`,
        'CacheService',
        { key, error },
      );
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.log(`Cache deleted for key "${key}"`, 'CacheService');
    } catch (error) {
      this.logger.error(
        `Error deleting cache for key "${key}": ${error.message}`,
        'CacheService',
        { key, error },
      );
      throw error;
    }
  }

  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl: number = this.defaultTtl,
  ): Promise<T> {
    let value: T | null = null;
    try {
      value = await this.get<T>(key);
      if (!value) {
        value = await fetchFunction();
        await this.set(key, value, ttl);
        this.logger.log(
          `Cache set for key "${key}" after fetching with TTL: ${ttl} seconds`,
          'CacheService',
        );
      }
    } catch (error) {
      this.logger.error(
        `Error in getOrSet for key "${key}": ${error.message}`,
        'CacheService',
        { key, ttl, error },
      );
      if (!value) {
        value = await fetchFunction();
        this.logger.log(
          `Cache fallback: fetched value for key "${key}" directly due to cache error`,
          'CacheService',
        );
      }
    }
    return value;
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.cacheManager.store.keys(pattern);
      await Promise.all(keys.map((key) => this.cacheManager.del(key)));
      this.logger.log(`Cache deleted for pattern "${pattern}"`, 'CacheService');
    } catch (error) {
      this.logger.error(
        `Error deleting cache for pattern "${pattern}": ${error.message}`,
        'CacheService',
        { pattern, error },
      );
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.cacheManager.reset();
      this.logger.log('Cache cleared', 'CacheService');
    } catch (error) {
      this.logger.error(
        `Error clearing cache: ${error.message}`,
        'CacheService',
        { error },
      );
      throw error;
    }
  }

  async getTtl(key: string): Promise<number | undefined> {
    try {
      const ttl = await this.cacheManager.store.ttl(key);
      this.logger.log(`TTL for key "${key}": ${ttl}`, 'CacheService');
      return ttl;
    } catch (error) {
      this.logger.error(
        `Error getting TTL for key "${key}": ${error.message}`,
        'CacheService',
        { key, error },
      );
      throw error;
    }
  }
}
