/**
 * Tests for MultilingualTokenizer
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { MultilingualTokenizer } from '../../src/optimizer/multilingual/tokenizer-adapter.js';

describe('MultilingualTokenizer', () => {
  let tokenizer: MultilingualTokenizer;

  beforeEach(() => {
    tokenizer = new MultilingualTokenizer('gpt-4', true);
  });

  afterEach(() => {
    tokenizer.free();
  });

  describe('encode', () => {
    test('should encode English text', () => {
      const text = 'This is a simple English sentence.';
      const result = tokenizer.encode(text);

      expect(result.language.code).toBe('en');
      expect(result.tokens).toBeGreaterThan(0);
      expect(result.baseTokens).toBeGreaterThan(0);
      expect(result.multiplier).toBe(1.0); // English multiplier
      expect(result.confidence).toBeGreaterThan(0);
    });

    test('should encode Chinese text with multiplier', () => {
      const text = '这是一个中文句子。';
      const result = tokenizer.encode(text);

      expect(result.language.code).toBe('zh');
      expect(result.tokens).toBeGreaterThan(result.baseTokens);
      expect(result.multiplier).toBe(2.0); // Chinese multiplier
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('should encode Japanese text with multiplier', () => {
      const text = 'これは日本語の文章です。';
      const result = tokenizer.encode(text);

      expect(result.language.code).toBe('ja');
      expect(result.tokens).toBeGreaterThan(result.baseTokens);
      expect(result.multiplier).toBe(2.5); // Japanese multiplier
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('should encode Spanish text with multiplier', () => {
      const text = 'Esta es una oración en español.';
      const result = tokenizer.encode(text);

      expect(result.language.code).toBe('es');
      expect(result.tokens).toBeGreaterThan(result.baseTokens);
      expect(result.multiplier).toBe(1.7); // Spanish multiplier
    });

    test('should handle mixed language text', () => {
      const text = 'Hello 你好 world 世界';
      const result = tokenizer.encode(text);

      // Should detect at least one language
      expect(result.language).toBeDefined();
      expect(result.tokens).toBeGreaterThan(0);
      expect(result.multiplier).toBeGreaterThanOrEqual(1.0);
    });

    test('should use cache for repeated text', () => {
      const text = 'Cache test text';

      const result1 = tokenizer.encode(text);
      const result2 = tokenizer.encode(text);

      // Results should be identical (from cache)
      expect(result2).toEqual(result1);
    });
  });

  describe('count', () => {
    test('should return token count for English', () => {
      const text = 'Simple count test';
      const count = tokenizer.count(text);

      expect(count).toBeGreaterThan(0);
      expect(typeof count).toBe('number');
    });

    test('should return adjusted count for Chinese', () => {
      const text = '计数测试';
      const count = tokenizer.count(text);
      const baseCount = tokenizer.countBase(text);

      expect(count).toBeGreaterThan(baseCount);
    });

    test('should handle empty string', () => {
      const count = tokenizer.count('');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('countBase', () => {
    test('should return base token count without language adjustment', () => {
      const text = '这是中文';
      const baseCount = tokenizer.countBase(text);
      const adjustedCount = tokenizer.count(text);

      // Base count should be less than adjusted count for non-English
      expect(baseCount).toBeLessThanOrEqual(adjustedCount);
    });

    test('should match count for English', () => {
      const text = 'English text';
      const baseCount = tokenizer.countBase(text);
      const adjustedCount = tokenizer.count(text);

      // For English (multiplier 1.0), should be the same
      expect(baseCount).toBe(adjustedCount);
    });
  });

  describe('analyze', () => {
    test('should provide detailed analysis for single language', () => {
      const text = 'This is English text for analysis.';
      const analysis = tokenizer.analyze(text);

      expect(analysis.estimate).toBeDefined();
      expect(analysis.estimate.tokens).toBeGreaterThan(0);
      expect(analysis.allLanguages).toBeDefined();
      expect(analysis.allLanguages.length).toBeGreaterThan(0);
      expect(analysis.isMixed).toBe(false);
    });

    test('should detect mixed language', () => {
      const text = 'English and これは日本語です mixed content';
      const analysis = tokenizer.analyze(text);

      expect(analysis.isMixed).toBe(true);
      expect(analysis.allLanguages.length).toBeGreaterThan(1);

      const codes = analysis.allLanguages.map(l => l.code);
      expect(codes).toContain('en');
      expect(codes).toContain('ja');
    });

    test('should provide accurate token estimate', () => {
      const text = '这是中文测试';
      const analysis = tokenizer.analyze(text);

      expect(analysis.estimate.tokens).toBeGreaterThan(0);
      expect(analysis.estimate.baseTokens).toBeGreaterThan(0);
      expect(analysis.estimate.multiplier).toBeGreaterThanOrEqual(1.0);
      expect(analysis.estimate.language.code).toBe('zh');
    });

    test('should handle Arabic text', () => {
      const text = 'هذا نص عربي';
      const analysis = tokenizer.analyze(text);

      expect(analysis.estimate.language.code).toBe('ar');
      expect(analysis.estimate.multiplier).toBe(3.0);
      expect(analysis.isMixed).toBe(false);
    });
  });

  describe('cache management', () => {
    test('should cache results', () => {
      const text = 'Cached text example';

      // First call - should compute
      const result1 = tokenizer.encode(text);

      // Second call - should use cache
      const result2 = tokenizer.encode(text);

      expect(result1).toEqual(result2);
    });

    test('should clear cache', () => {
      const text = 'Cache clear test';

      tokenizer.encode(text);
      tokenizer.clearCache();

      // After clear, should still work
      const result = tokenizer.encode(text);
      expect(result.tokens).toBeGreaterThan(0);
    });

    test('should limit cache size', () => {
      // Create tokenizer with cache enabled
      const cachedTokenizer = new MultilingualTokenizer('gpt-4', true);

      // Add many different texts to exceed cache limit (1000)
      // This test just ensures no errors occur
      for (let i = 0; i < 1100; i++) {
        cachedTokenizer.encode(`Test text number ${i}`);
      }

      // Should still work after cache eviction
      const result = cachedTokenizer.encode('Final test');
      expect(result.tokens).toBeGreaterThan(0);

      cachedTokenizer.free();
    });

    test('should work without cache', () => {
      const noCacheTokenizer = new MultilingualTokenizer('gpt-4', false);

      const text = 'No cache test';
      const result1 = noCacheTokenizer.encode(text);
      const result2 = noCacheTokenizer.encode(text);

      // Results should still be consistent
      expect(result1.tokens).toBe(result2.tokens);

      noCacheTokenizer.free();
    });
  });

  describe('resource management', () => {
    test('should free resources properly', () => {
      const tempTokenizer = new MultilingualTokenizer();

      tempTokenizer.encode('Test before free');
      tempTokenizer.free();

      // After free, creating new tokenizer should still work
      const newTokenizer = new MultilingualTokenizer();
      const result = newTokenizer.encode('Test after free');
      expect(result.tokens).toBeGreaterThan(0);
      newTokenizer.free();
    });
  });

  describe('edge cases', () => {
    test('should handle very short text', () => {
      const result = tokenizer.encode('Hi');
      expect(result.tokens).toBeGreaterThan(0);
    });

    test('should handle very long text', () => {
      const longText = 'This is a very long text. '.repeat(100);
      const result = tokenizer.encode(longText);
      expect(result.tokens).toBeGreaterThan(100);
    });

    test('should handle text with special characters', () => {
      const text = 'Special chars: @#$%^&*()_+-=[]{}|;:,.<>?';
      const result = tokenizer.encode(text);
      expect(result.tokens).toBeGreaterThan(0);
    });

    test('should handle numbers only', () => {
      const text = '123456789';
      const result = tokenizer.encode(text);
      expect(result.tokens).toBeGreaterThan(0);
      // Should default to English
      expect(result.language.code).toBe('en');
    });

    test('should handle mixed scripts', () => {
      const text = 'English 中文 日本語 العربية';
      const analysis = tokenizer.analyze(text);

      expect(analysis.isMixed).toBe(true);
      expect(analysis.allLanguages.length).toBeGreaterThan(1);
    });
  });

  describe('consistency', () => {
    test('count should equal encode.tokens', () => {
      const text = 'Consistency check';
      const count = tokenizer.count(text);
      const encoded = tokenizer.encode(text);

      expect(count).toBe(encoded.tokens);
    });

    test('countBase should equal encode.baseTokens', () => {
      const text = 'Base consistency check';
      const baseCount = tokenizer.countBase(text);
      const encoded = tokenizer.encode(text);

      expect(baseCount).toBe(encoded.baseTokens);
    });

    test('analyze.estimate should match encode', () => {
      const text = 'Analysis consistency check';
      const encoded = tokenizer.encode(text);
      const analyzed = tokenizer.analyze(text);

      expect(analyzed.estimate.tokens).toBe(encoded.tokens);
      expect(analyzed.estimate.baseTokens).toBe(encoded.baseTokens);
      expect(analyzed.estimate.multiplier).toBe(encoded.multiplier);
    });
  });
});
