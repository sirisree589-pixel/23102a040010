import Sentiment from 'sentiment';
import { preprocessText, removeStopWords, extractFeatures } from './textPreprocessing';

const sentiment = new Sentiment();

export interface SentimentResult {
  score: number;
  comparative: number;
  label: 'Positive' | 'Negative' | 'Neutral';
  confidence: number;
  tokens: string[];
  positive: string[];
  negative: string[];
  features: {
    wordCount: number;
    avgWordLength: number;
    uniqueWords: number;
    lexicalDiversity: number;
  };
}

export const analyzeSentiment = (text: string): SentimentResult => {
  const preprocessed = preprocessText(text);
  const withoutStopWords = removeStopWords(preprocessed);

  const result = sentiment.analyze(text);
  const features = extractFeatures(preprocessed);

  const confidence = Math.min(Math.abs(result.comparative) * 100, 100);

  let label: 'Positive' | 'Negative' | 'Neutral';
  if (result.score > 0) {
    label = 'Positive';
  } else if (result.score < 0) {
    label = 'Negative';
  } else {
    label = 'Neutral';
  }

  return {
    score: result.score,
    comparative: result.comparative,
    label,
    confidence,
    tokens: result.tokens,
    positive: result.positive,
    negative: result.negative,
    features
  };
};

export const batchAnalyze = (reviews: string[]): SentimentResult[] => {
  return reviews.map(review => analyzeSentiment(review));
};

export const aggregateResults = (results: SentimentResult[]) => {
  const total = results.length;
  const positive = results.filter(r => r.label === 'Positive').length;
  const negative = results.filter(r => r.label === 'Negative').length;
  const neutral = results.filter(r => r.label === 'Neutral').length;

  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / total;
  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / total;

  return {
    total,
    positive,
    negative,
    neutral,
    positivePercentage: (positive / total) * 100,
    negativePercentage: (negative / total) * 100,
    neutralPercentage: (neutral / total) * 100,
    avgScore,
    avgConfidence
  };
};
