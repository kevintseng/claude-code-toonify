/**
 * Tokenizer adapter with multilingual support
 */

import { encoding_for_model, type Tiktoken } from 'tiktoken';
import { LanguageDetector, type LanguageDetectionResult } from './language-detector.js';
import type { LanguageProfile } from './language-profiles.js';

export interface TokenEstimate {
  tokens: number;
  language: LanguageProfile;
  confidence: number;
  baseTokens: number;
  multiplier: number;
}

export class MultilingualTokenizer {
  private baseTokenizer: Tiktoken;
  private languageDetector: LanguageDetector;
  private cacheEnabled: boolean;
  private cache: Map<string, TokenEstimate>;

  constructor(
    model: string = 'gpt-4',
    cacheEnabled: boolean = true
  ) {
    this.baseTokenizer = encoding_for_model(model as any);
    this.languageDetector = new LanguageDetector();
    this.cacheEnabled = cacheEnabled;
    this.cache = new Map();
  }

  /**
   * Count tokens with language awareness
   */
  encode(text: string): TokenEstimate {
    // Check cache first
    if (this.cacheEnabled && this.cache.has(text)) {
      return this.cache.get(text)!;
    }

    // Get base token count
    const baseTokens = this.baseTokenizer.encode(text).length;

    // Detect language
    const detection = this.languageDetector.detect(text);

    // Apply language multiplier
    const multiplier = detection.language.tokenMultiplier;
    const adjustedTokens = Math.ceil(baseTokens * multiplier);

    const estimate: TokenEstimate = {
      tokens: adjustedTokens,
      language: detection.language,
      confidence: detection.confidence,
      baseTokens,
      multiplier
    };

    // Cache result
    if (this.cacheEnabled) {
      // Limit cache size to prevent memory issues
      if (this.cache.size > 1000) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey !== undefined) {
          this.cache.delete(firstKey);
        }
      }
      this.cache.set(text, estimate);
    }

    return estimate;
  }

  /**
   * Simple token count (just returns number for compatibility)
   */
  count(text: string): number {
    return this.encode(text).tokens;
  }

  /**
   * Get base tokens without language adjustment
   */
  countBase(text: string): number {
    return this.baseTokenizer.encode(text).length;
  }

  /**
   * Analyze language distribution in text
   */
  analyze(text: string): {
    estimate: TokenEstimate;
    allLanguages: LanguageProfile[];
    isMixed: boolean;
  } {
    const analysis = this.languageDetector.analyze(text);
    const baseTokens = this.baseTokenizer.encode(text).length;

    return {
      estimate: {
        tokens: Math.ceil(baseTokens * analysis.estimatedMultiplier),
        language: analysis.primary.language,
        confidence: analysis.primary.confidence,
        baseTokens,
        multiplier: analysis.estimatedMultiplier
      },
      allLanguages: analysis.all,
      isMixed: analysis.isMixed
    };
  }

  /**
   * Clear token cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Free tokenizer resources
   */
  free(): void {
    this.baseTokenizer.free();
    this.cache.clear();
  }
}
