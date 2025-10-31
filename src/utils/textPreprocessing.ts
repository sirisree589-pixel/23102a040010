export const preprocessText = (text: string): string => {
  let processed = text.toLowerCase();

  processed = processed.replace(/[^\w\s]/g, ' ');

  processed = processed.replace(/\s+/g, ' ').trim();

  return processed;
};

export const removeStopWords = (text: string): string => {
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'i', 'me', 'my', 'we', 'our'
  ]);

  return text
    .split(' ')
    .filter(word => !stopWords.has(word) && word.length > 2)
    .join(' ');
};

export const extractFeatures = (text: string) => {
  const words = text.split(' ');
  const wordCount = words.length;
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount || 0;
  const uniqueWords = new Set(words).size;
  const lexicalDiversity = uniqueWords / wordCount || 0;

  return {
    wordCount,
    avgWordLength,
    uniqueWords,
    lexicalDiversity
  };
};
