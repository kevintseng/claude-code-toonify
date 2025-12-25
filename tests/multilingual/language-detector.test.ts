/**
 * Tests for LanguageDetector
 */

import { describe, test, expect } from '@jest/globals';
import { LanguageDetector } from '../../src/optimizer/multilingual/language-detector.js';
import { LANGUAGE_PROFILES } from '../../src/optimizer/multilingual/language-profiles.js';

describe('LanguageDetector', () => {
  const detector = new LanguageDetector();

  describe('detect', () => {
    test('should detect English', () => {
      const text = 'This is a simple English sentence with common words.';
      const result = detector.detect(text);

      expect(result.language.code).toBe('en');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('should detect Chinese', () => {
      const text = '这是一个中文句子，包含中文字符。';
      const result = detector.detect(text);

      expect(result.language.code).toBe('zh');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test('should detect Japanese', () => {
      const text = 'これは日本語の文章です。ひらがなとカタカナが含まれています。';
      const result = detector.detect(text);

      expect(result.language.code).toBe('ja');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test('should detect Spanish', () => {
      const text = 'Esta es una oración en español con acentos: áéíóú';
      const result = detector.detect(text);

      expect(result.language.code).toBe('es');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('should detect Arabic', () => {
      const text = 'هذه جملة باللغة العربية';
      const result = detector.detect(text);

      expect(result.language.code).toBe('ar');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test('should default to English for empty text', () => {
      const result = detector.detect('');

      expect(result.language.code).toBe('en');
      expect(result.confidence).toBe(0);
    });

    test('should default to English for ambiguous text', () => {
      const text = '123456789';
      const result = detector.detect(text);

      expect(result.language.code).toBe('en');
    });
  });

  describe('detectMixed', () => {
    test('should detect mixed English and Chinese', () => {
      const text = 'Hello world 你好世界';
      const languages = detector.detectMixed(text);

      const codes = languages.map(l => l.code);
      expect(codes).toContain('en');
      expect(codes).toContain('zh');
    });

    test('should detect single language as non-mixed', () => {
      const text = 'This is only English';
      const languages = detector.detectMixed(text);

      expect(languages).toHaveLength(1);
      expect(languages[0].code).toBe('en');
    });
  });

  describe('estimateTokens', () => {
    test('should apply language multiplier for Chinese', () => {
      const text = '这是中文';
      const baseTokens = 10;
      const estimated = detector.estimateTokens(text, baseTokens);

      // Chinese has 2.0x multiplier
      expect(estimated).toBeGreaterThan(baseTokens);
      expect(estimated).toBeLessThanOrEqual(baseTokens * 2.0);
    });

    test('should not multiply for English', () => {
      const text = 'This is English';
      const baseTokens = 10;
      const estimated = detector.estimateTokens(text, baseTokens);

      // English has 1.0x multiplier
      expect(estimated).toBe(baseTokens);
    });

    test('should handle low confidence gracefully', () => {
      const text = '???';
      const baseTokens = 3;
      const estimated = detector.estimateTokens(text, baseTokens);

      // Should return base tokens if confidence is low
      expect(estimated).toBe(baseTokens);
    });
  });

  describe('analyze', () => {
    test('should provide detailed analysis', () => {
      const text = 'Hello 你好 مرحبا';
      const baseTokens = 10;
      const analysis = detector.analyze(text);

      expect(analysis.primary).toBeDefined();
      expect(analysis.all.length).toBeGreaterThan(0);
      expect(analysis.estimatedMultiplier).toBeGreaterThan(1.0);
    });

    test('should detect mixed language', () => {
      const text = 'English and 日本語 mixed';
      const analysis = detector.analyze(text);

      expect(analysis.isMixed).toBe(true);
      expect(analysis.all.length).toBeGreaterThan(1);
    });
  });

  describe('estimateMultiplierForMixed', () => {
    test('should return 1.0 for empty array', () => {
      const multiplier = detector.estimateMultiplierForMixed([]);
      expect(multiplier).toBe(1.0);
    });

    test('should return language multiplier for single language', () => {
      const chinese = LANGUAGE_PROFILES.find(l => l.code === 'zh')!;
      const multiplier = detector.estimateMultiplierForMixed([chinese]);
      expect(multiplier).toBe(chinese.tokenMultiplier);
    });

    test('should weight toward higher multiplier for mixed', () => {
      const english = LANGUAGE_PROFILES.find(l => l.code === 'en')!;
      const tamil = LANGUAGE_PROFILES.find(l => l.code === 'ta')!;
      const multiplier = detector.estimateMultiplierForMixed([english, tamil]);

      // Should be between 1.0 and 4.5, weighted toward 4.5
      expect(multiplier).toBeGreaterThan(1.0);
      expect(multiplier).toBeLessThan(4.5);
      expect(multiplier).toBeGreaterThan((1.0 + 4.5) / 2); // > average
    });
  });
});
