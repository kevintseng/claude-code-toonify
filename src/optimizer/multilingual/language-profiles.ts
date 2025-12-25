/**
 * Language profiles with token multipliers
 * Based on research: different languages require different numbers of tokens
 */

export interface LanguageProfile {
  code: string;
  name: string;
  nativeName: string;
  tokenMultiplier: number; // Relative to English (1.0)
  detectionPatterns: RegExp[];
  confidence: number; // How confident we are in the multiplier
}

/**
 * Token multipliers based on research and testing
 *
 * Sources:
 * - Anthropic: https://docs.anthropic.com/claude/docs/models-overview
 * - OpenAI tokenizer analysis
 * - Community research on multilingual token efficiency
 */
export const LANGUAGE_PROFILES: LanguageProfile[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    tokenMultiplier: 1.0,
    detectionPatterns: [
      /[a-zA-Z]{2,}/,  // At least 2 consecutive English letters
      /\b(the|is|are|was|were|have|has|had|do|does|did|a|an|and|or|but|in|on|at|to|for|of|with|be|this|that|from|as|by|they|we|you|he|she|it|not|can|will|would|could|should|may|might|must|hello|world)\b/i
    ],
    confidence: 1.0
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    tokenMultiplier: 1.7,
    detectionPatterns: [
      /[áéíóúüñ¿¡]/i,
      /\b(el|la|los|las|un|una|de|en|que|y|es|por)\b/i
    ],
    confidence: 0.9
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    tokenMultiplier: 1.8,
    detectionPatterns: [
      /[àâäéèêëïîôùûüÿç]/i,
      /\b(le|la|les|un|une|de|et|est|à|en|que)\b/i
    ],
    confidence: 0.9
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    tokenMultiplier: 1.6,
    detectionPatterns: [
      /[äöüß]/i,
      /\b(der|die|das|den|dem|des|ein|eine|und|ist|in)\b/i
    ],
    confidence: 0.9
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    tokenMultiplier: 2.0,
    detectionPatterns: [
      /[\u4e00-\u9fff]/,
      /[\u3400-\u4dbf]/ // CJK Extension A
    ],
    confidence: 0.95
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    tokenMultiplier: 2.5,
    detectionPatterns: [
      /[\u3040-\u309f]/, // Hiragana
      /[\u30a0-\u30ff]/, // Katakana
      /[\u4e00-\u9fff]/  // Kanji (overlaps with Chinese)
    ],
    confidence: 0.9
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    tokenMultiplier: 2.3,
    detectionPatterns: [
      /[\uac00-\ud7af]/, // Hangul Syllables
      /[\u1100-\u11ff]/  // Hangul Jamo
    ],
    confidence: 0.9
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    tokenMultiplier: 3.0,
    detectionPatterns: [
      /[\u0600-\u06ff]/, // Arabic
      /[\u0750-\u077f]/  // Arabic Supplement
    ],
    confidence: 0.85
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    tokenMultiplier: 4.5,
    detectionPatterns: [
      /[\u0b80-\u0bff]/ // Tamil
    ],
    confidence: 0.8
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    tokenMultiplier: 3.5,
    detectionPatterns: [
      /[\u0900-\u097f]/ // Devanagari
    ],
    confidence: 0.85
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    tokenMultiplier: 1.9,
    detectionPatterns: [
      /[\u0400-\u04ff]/, // Cyrillic
      /\b(и|в|не|на|я|что|он|с|как|а)\b/i
    ],
    confidence: 0.9
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    tokenMultiplier: 1.7,
    detectionPatterns: [
      /[àáâãäèéêëìíîïòóôõöùúûü]/i,
      /\b(o|a|os|as|de|em|que|e|é|do|da)\b/i
    ],
    confidence: 0.9
  },
  {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    tokenMultiplier: 4.0,
    detectionPatterns: [
      /[\u0e00-\u0e7f]/ // Thai
    ],
    confidence: 0.8
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    tokenMultiplier: 1.5,
    detectionPatterns: [
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i,
      /\b(và|của|có|là|này|được|trong|cho|người|từ|để|với|một|những|các|không|khi|trên)\b/i
    ],
    confidence: 0.9
  },
  {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    tokenMultiplier: 1.4,
    detectionPatterns: [
      /\b(yang|dan|di|ke|dari|ini|itu|untuk|dengan|pada|adalah|tidak|ada|atau|akan|juga|oleh|dalam)\b/i
    ],
    confidence: 0.85
  }
];

/**
 * Get language profile by code
 */
export function getLanguageProfile(code: string): LanguageProfile | null {
  return LANGUAGE_PROFILES.find(p => p.code === code) || null;
}

/**
 * Get all supported language codes
 */
export function getSupportedLanguages(): string[] {
  return LANGUAGE_PROFILES.map(p => p.code);
}

/**
 * Get token multiplier for a language code
 */
export function getTokenMultiplier(code: string): number {
  const profile = getLanguageProfile(code);
  return profile ? profile.tokenMultiplier : 1.0; // Default to English
}
