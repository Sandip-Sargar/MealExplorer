import { CacheEntry } from '../types';

/**
 * A robust in-memory LRU-like cache service.
 * Simulates the caching requirements of a web service layer.
 */
class CacheService {
  private cache: Map<string, CacheEntry<any>>;
  private readonly defaultTTL: number; // Time to live in ms
  private readonly maxSize: number;

  constructor(ttlSeconds: number = 300, maxSize: number = 50) {
    this.cache = new Map();
    this.defaultTTL = ttlSeconds * 1000;
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // Evict if full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expiry });
    console.debug(`[Cache] Set: ${key} (Expires in ${(ttl || this.defaultTTL) / 1000}s)`);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      console.debug(`[Cache] Expired: ${key}`);
      this.cache.delete(key);
      return null;
    }

    console.debug(`[Cache] Hit: ${key}`);
    // Refresh position in Map for LRU behavior (delete and re-set)
    this.cache.delete(key);
    this.cache.set(key, entry);
    
    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new CacheService(600, 100); // 10 min TTL, 100 items max