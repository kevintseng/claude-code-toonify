/**
 * Type definitions for prompt caching integration
 */

export interface CacheConfig {
  enabled: boolean;
  provider: 'anthropic' | 'openai' | 'auto';
  ttl?: '5min' | '1hour'; // Anthropic cache TTLs
  cacheStaticPrompts: boolean;
  minCacheableTokens?: number; // Minimum tokens to enable caching (default: 1024)
}

export interface CachedContent {
  staticPrefix: string;  // Cacheable system instructions
  dynamicContent: string; // Non-cacheable user data
  cacheBreakpoint: boolean;
  cacheMetadata?: CacheMetadata;
}

export interface CacheMetadata {
  provider: 'anthropic' | 'openai';
  estimatedCacheSize: number; // tokens
  cacheKey?: string;
  ttl?: string;
}

export interface CacheMetrics {
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number;
  estimatedCacheSavings: number; // tokens
  totalCacheableTokens: number;
  averageCacheReuseCount: number;
}

export interface CacheStrategy {
  name: string;
  shouldCache: (content: string, tokens: number) => boolean;
  formatCacheStructure: (content: CachedContent) => any;
}
