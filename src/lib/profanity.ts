/**
 * Comprehensive Arabic & English Profanity Filter
 * Designed specifically for live streams to prevent TikTok Live account bans.
 */

// Normalized Arabic letters helper to prevent evasion by vowel/letter swapping or repetition
function normalizeArabic(text: string): string {
  return text
    .toLowerCase()
    // Normalize Alef
    .replace(/[إأآا]/g, 'ا')
    // Normalize Taa Marbuta & Haa
    .replace(/ة/g, 'ه')
    // Normalize Yaa
    .replace(/[ىي]/g, 'ي')
    // Remove diacritics / tashkeel
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Remove tatweel (kashida)
    .replace(/\u0640/g, '')
    // Collapse repeated letters (e.g. حماررررر -> حمار)
    .replace(/(.)\1{2,}/g, '$1$1');
}

// Built-in Arabic & English bad words list
const DEFAULT_BLOCKED_WORDS = [
  // Common abusive / insulting words
  'شرموط', 'شرموطه', 'منيوك', 'منيوكه', 'عرص', 'عرصة', 'قحبة', 'قحبه',
  'كس', 'طيز', 'زب', 'نيك', 'ينيك', 'متناك', 'متناكه', 'سكس', 'اباحي',
  'قواد', 'ديوث', 'وسخ', 'واطي', 'حقير', 'كلب', 'حمار', 'يا ابن الكلب',
  'يا ابن الشرموطة', 'يا ابن المتناكة', 'يلعن', 'كس امك', 'كسمك', 'كسختك',
  'امك', 'ابوك', 'شاذ', 'لوطي', 'مخنث', 'خول', 'عرصات', 'شرايط',
  'بزاز', 'فحل', 'شهوة', 'صدرك', 'مؤخرتك', 'لحس', 'مص', 'بوس',
  // Inappropriate English / Franco
  'fuck', 'bitch', 'shit', 'asshole', 'dick', 'pussy', 'cunt', 'whore',
  'slut', 'porn', 'sex', 'nude', 'naked', 'blowjob', 'kosomk', 'sharmota',
  'menyouk', 'manyook', 'kossomk', '3ars', 'a7a'
];

export function getBlockedWordsList(customWordsText?: string): string[] {
  const customWords = customWordsText
    ? customWordsText
        .split(/[,،\n]+/)
        .map((w) => w.trim().toLowerCase())
        .filter(Boolean)
    : [];

  return Array.from(new Set([...DEFAULT_BLOCKED_WORDS, ...customWords]));
}

/**
 * Check if the text contains any blocked / inappropriate word
 */
export function containsProfanity(text: string, customWordsText?: string): boolean {
  if (!text) return false;
  const list = getBlockedWordsList(customWordsText);
  const normalized = normalizeArabic(text);

  for (const word of list) {
    const normWord = normalizeArabic(word);
    if (!normWord) continue;
    // Word boundary or substring match for slurs
    if (normalized.includes(normWord)) {
      return true;
    }
  }
  return false;
}

/**
 * Censors profanity by replacing matching words with ****
 */
export function censorProfanity(text: string, customWordsText?: string): {
  cleanText: string;
  hasProfanity: boolean;
} {
  if (!text) return { cleanText: '', hasProfanity: false };

  const list = getBlockedWordsList(customWordsText);
  let result = text;
  let detected = false;

  for (const word of list) {
    if (!word || word.length < 2) continue;
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    if (regex.test(result)) {
      detected = true;
      result = result.replace(regex, '****');
    }
  }

  return {
    cleanText: result,
    hasProfanity: detected,
  };
}
