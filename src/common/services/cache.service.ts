import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { serialize, deserialize } from '../utils/serialization-utils';
import { LoggerService } from './logger.service';

@Injectable()
export class CacheService {
  private readonly defaultTtl = 300;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private logger: LoggerService,
  ) {}

  /**
   * Stores a value in the cache with an optional TTL.
   * @param key - Cache key.
   * @param value - Value to be cached.
   * @param ttl - Time to live in seconds (optional, default is 300 seconds).
   */
  async set(
    key: string,
    value: any,
    ttl: number = this.defaultTtl,
  ): Promise<void> {
    try {
      const serializedValue = serialize(value);
      await this.cacheManager.set(key, serializedValue, ttl);
      this.logger.logInfo(
        `Cache set for key "${key}" with TTL: ${ttl} seconds`,
      );
    } catch (error) {
      this.logger.logError(
        `Error setting cache for key "${key}": ${error.message}`,
        { key, ttl, error },
      );
      throw error;
    }
  }

  /**
   * Retrieves a cached value by key.
   * @param key - Cache key.
   * @returns The cached value or null if not found.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<string>(key);
      if (value) {
        this.logger.logInfo(`Cache hit for key "${key}"`);
        return deserialize<T>(value);
      } else {
        this.logger.logDebug(`Cache miss for key "${key}"`);
        return null;
      }
    } catch (error) {
      this.logger.logError(
        `Error getting cache for key "${key}": ${error.message}`,
        { key, error },
      );
      return null;
    }
  }

  /**
   * Deletes a cached value by key.
   * @param key - Cache key.
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.logInfo(`Cache deleted for key "${key}"`);
    } catch (error) {
      this.logger.logError(
        `Error deleting cache for key "${key}": ${error.message}`,
        { key, error },
      );
      throw error;
    }
  }

  /**
   * Retrieves a cached value or executes the fetch function and stores the result in the cache.
   * @param key - Cache key.
   * @param fetchFunction - A function to fetch the value if it is not found in the cache.
   * @param ttl - Time to live in seconds (optional, default is 300 seconds).
   * @returns The cached or freshly fetched value.
   */
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
        this.logger.logInfo(
          `Cache set for key "${key}" after fetching with TTL: ${ttl} seconds`,
        );
      }
    } catch (error) {
      this.logger.logError(
        `Error in getOrSet for key "${key}": ${error.message}`,
        { key, ttl, error },
      );
      // Fetch the value directly if cache operation fails
      if (!value) {
        value = await fetchFunction();
        this.logger.logWarn(
          `Cache fallback: fetched value for key "${key}" directly due to cache error`,
        );
      }
    }
    return value;
  }
}
