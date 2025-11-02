export interface PreprocessedData {
  original: string;
  cleaned: string;
  tokens: string[];
  lemmatized: string[];
  features: TextFeatures;
  metadata: TextMetadata;
}

export interface TextFeatures {
  wordCount: number;
  sentenceCount: number;
  avgWordLength: number;
  avgSentenceLength: number;
  uniqueWords: number;
  lexicalDiversity: number;
  specialCharCount: number;
  uppercaseRatio: number;
  exclamationCount: number;
  questionCount: number;
}

export interface TextMetadata {
  language: string;
  readabilityScore: number;
  emotionalIntensity: number;
  subjectivity: number;
}

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'i', 'me', 'my', 'we', 'our', 'you',
  'your', 'they', 'them', 'this', 'these', 'those', 'but', 'or', 'not',
  'can', 'could', 'should', 'would', 'may', 'might', 'must', 'have'
]);

const LEMMA_MAP: Record<string, string> = {
  'amazing': 'amaze', 'amazing': 'amaze', 'amazed': 'amaze',
  'terrible': 'terrible', 'terribly': 'terrible',
  'good': 'good', 'better': 'good', 'best': 'good',
  'bad': 'bad', 'worse': 'bad', 'worst': 'bad',
  'happy': 'happy', 'happily': 'happy',
  'sad': 'sad', 'sadly': 'sad',
  'running': 'run', 'runs': 'run',
  'walked': 'walk', 'walking': 'walk', 'walks': 'walk',
  'bought': 'buy', 'buying': 'buy', 'buys': 'buy',
  'broken': 'break', 'breaking': 'break',
  'works': 'work', 'working': 'work', 'worked': 'work',
  'loved': 'love', 'loves': 'love', 'loving': 'love',
  'hated': 'hate', 'hates': 'hate', 'hating': 'hate',
  'recommend': 'recommend', 'recommended': 'recommend', 'recommends': 'recommend'
};

export const advancedPreprocess = (text: string): PreprocessedData => {
  const original = text;

  const cleaned = cleanText(text);
  const tokens = tokenize(cleaned);
  const filtered = tokens.filter(t => !STOP_WORDS.has(t.toLowerCase()));
  const lemmatized = filtered.map(t => getLemma(t));

  const features = extractAdvancedFeatures(original, tokens);
  const metadata = extractMetadata(original, cleaned);

  return {
    original,
    cleaned,
    tokens: filtered,
    lemmatized,
    features,
    metadata
  };
};

const cleanText = (text: string): string => {
  let cleaned = text.toLowerCase();

  cleaned = cleaned.replace(/https?:\/\/\S+/g, '');
  cleaned = cleaned.replace(/@\w+/g, '');
  cleaned = cleaned.replace(/#\w+/g, '');

  cleaned = cleaned.replace(/\b(\w+)(\1{2,})\b/g, '$1');

  cleaned = cleaned.replace(/[^\w\s.!?-]/g, ' ');

  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
};

const tokenize = (text: string): string[] => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const tokens: string[] = [];

  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/);
    tokens.push(...words.filter(w => w.length > 0));
  }

  return tokens;
};

const getLemma = (word: string): string => {
  return LEMMA_MAP[word.toLowerCase()] || word.toLowerCase();
};

const extractAdvancedFeatures = (original: string, tokens: string[]): TextFeatures => {
  const sentences = original.split(/[.!?]+/).filter(s => s.trim());
  const wordCount = tokens.length;
  const sentenceCount = sentences.length;
  const uniqueWords = new Set(tokens.map(t => t.toLowerCase())).size;

  const avgWordLength = wordCount > 0
    ? tokens.reduce((sum, token) => sum + token.length, 0) / wordCount
    : 0;

  const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0;

  const lexicalDiversity = wordCount > 0 ? uniqueWords / wordCount : 0;

  const specialCharCount = (original.match(/[!@#$%^&*()_+=\-[\]{};:'",.<>/?\\|`~]/g) || []).length;

  const uppercaseCount = (original.match(/[A-Z]/g) || []).length;
  const uppercaseRatio = original.length > 0 ? uppercaseCount / original.length : 0;

  const exclamationCount = (original.match(/!/g) || []).length;
  const questionCount = (original.match(/\?/g) || []).length;

  return {
    wordCount,
    sentenceCount,
    avgWordLength,
    avgSentenceLength,
    uniqueWords,
    lexicalDiversity,
    specialCharCount,
    uppercaseRatio,
    exclamationCount,
    questionCount
  };
};

const extractMetadata = (original: string, cleaned: string): TextMetadata => {
  const readabilityScore = calculateReadability(original);
  const emotionalIntensity = calculateEmotionalIntensity(original);
  const subjectivity = calculateSubjectivity(original);

  return {
    language: 'en',
    readabilityScore,
    emotionalIntensity,
    subjectivity
  };
};

const calculateReadability = (text: string): number => {
  const words = text.split(/\s+/).length;
  const sentences = (text.match(/[.!?]+/g) || []).length;
  const syllables = estimateSyllables(text);

  if (words === 0 || sentences === 0) return 0;

  const flesch = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return Math.max(0, Math.min(100, flesch));
};

const estimateSyllables = (text: string): number => {
  const words = text.toLowerCase().split(/\s+/);
  let syllableCount = 0;

  for (const word of words) {
    syllableCount += countSyllables(word);
  }

  return Math.max(1, syllableCount);
};

const countSyllables = (word: string): number => {
  word = word.toLowerCase();
  let count = 0;

  const vowels = 'aeiouy';
  let previousWasVowel = false;

  for (const char of word) {
    const isVowel = vowels.includes(char);
    if (isVowel && !previousWasVowel) {
      count++;
    }
    previousWasVowel = isVowel;
  }

  if (word.endsWith('e')) count--;
  if (word.endsWith('le') && word.length > 2 && !vowels.includes(word[word.length - 3])) {
    count++;
  }

  return Math.max(1, count);
};

const calculateEmotionalIntensity = (text: string): number => {
  const exclamations = (text.match(/!/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;
  const capitalizedWords = (text.match(/\b[A-Z][A-Z]+\b/g) || []).length;

  const baseScore = (exclamations * 0.3 + questions * 0.2 + capitalizedWords * 0.1);
  return Math.min(100, baseScore * 10);
};

const calculateSubjectivity = (text: string): number => {
  const subjectiveWords = [
    'amazing', 'terrible', 'wonderful', 'awful', 'perfect', 'horrible',
    'excellent', 'poor', 'fantastic', 'disgusting', 'love', 'hate',
    'believe', 'think', 'feel', 'opinion', 'personal', 'seem', 'appear'
  ];

  const words = text.toLowerCase().split(/\s+/);
  const matches = words.filter(w => subjectiveWords.some(sw => w.includes(sw))).length;

  return Math.min(100, (matches / Math.max(1, words.length)) * 100);
};
