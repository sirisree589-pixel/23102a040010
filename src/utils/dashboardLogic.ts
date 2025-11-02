export interface DashboardMetrics {
  totalReviews: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  averageSentimentScore: number;
  averageConfidence: number;
  topPositiveWords: WordFrequency[];
  topNegativeWords: WordFrequency[];
  sentimentTrend: TrendPoint[];
  wordCloud: WordFrequency[];
}

export interface WordFrequency {
  word: string;
  frequency: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface TrendPoint {
  timestamp: string;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  averageScore: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
  }[];
}

export interface SentimentDataPoint {
  label: 'Positive' | 'Negative' | 'Neutral';
  score: number;
  confidence: number;
  tokens: string[];
  positive: string[];
  negative: string[];
  timestamp: string;
}

export const generateDashboardMetrics = (reviews: SentimentDataPoint[]): DashboardMetrics => {
  const totalReviews = reviews.length;

  const positiveCount = reviews.filter(r => r.label === 'Positive').length;
  const negativeCount = reviews.filter(r => r.label === 'Negative').length;
  const neutralCount = reviews.filter(r => r.label === 'Neutral').length;

  const averageSentimentScore = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length
    : 0;

  const averageConfidence = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.confidence, 0) / reviews.length
    : 0;

  const topPositiveWords = extractTopWords(reviews, 'positive', 10);
  const topNegativeWords = extractTopWords(reviews, 'negative', 10);
  const wordCloud = extractWordCloud(reviews, 20);

  const sentimentTrend = generateTrendData(reviews);

  return {
    totalReviews,
    positiveCount,
    negativeCount,
    neutralCount,
    averageSentimentScore,
    averageConfidence,
    topPositiveWords,
    topNegativeWords,
    sentimentTrend,
    wordCloud
  };
};

const extractTopWords = (
  reviews: SentimentDataPoint[],
  type: 'positive' | 'negative',
  limit: number
): WordFrequency[] => {
  const wordFreq = new Map<string, number>();

  for (const review of reviews) {
    const words = type === 'positive' ? review.positive : review.negative;
    for (const word of words) {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    }
  }

  return Array.from(wordFreq.entries())
    .map(([word, frequency]) => ({
      word,
      frequency,
      sentiment: type
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit);
};

const extractWordCloud = (reviews: SentimentDataPoint[], limit: number): WordFrequency[] => {
  const wordFreq = new Map<string, { count: number; sentiment: string }>();

  for (const review of reviews) {
    const tokens = review.tokens || [];
    const sentiment = review.label.toLowerCase();

    for (const token of tokens) {
      if (token.length > 2) {
        const existing = wordFreq.get(token);
        wordFreq.set(token, {
          count: (existing?.count || 0) + 1,
          sentiment
        });
      }
    }
  }

  return Array.from(wordFreq.entries())
    .map(([word, data]) => ({
      word,
      frequency: data.count,
      sentiment: data.sentiment as 'positive' | 'negative' | 'neutral'
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit);
};

const generateTrendData = (reviews: SentimentDataPoint[]): TrendPoint[] => {
  const timeGroups = new Map<string, SentimentDataPoint[]>();

  for (const review of reviews) {
    const date = review.timestamp.split('T')[0];
    const group = timeGroups.get(date) || [];
    group.push(review);
    timeGroups.set(date, group);
  }

  return Array.from(timeGroups.entries())
    .map(([date, group]) => {
      const positiveCount = group.filter(r => r.label === 'Positive').length;
      const negativeCount = group.filter(r => r.label === 'Negative').length;
      const neutralCount = group.filter(r => r.label === 'Neutral').length;
      const averageScore = group.reduce((sum, r) => sum + r.score, 0) / group.length;

      return {
        timestamp: date,
        positiveCount,
        negativeCount,
        neutralCount,
        averageScore
      };
    })
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
};

export const generateSentimentDistributionChart = (metrics: DashboardMetrics): ChartData => {
  const total = metrics.totalReviews || 1;

  return {
    labels: ['Positive', 'Negative', 'Neutral'],
    datasets: [
      {
        label: 'Sentiment Distribution',
        data: [
          (metrics.positiveCount / total) * 100,
          (metrics.negativeCount / total) * 100,
          (metrics.neutralCount / total) * 100
        ],
        backgroundColor: ['#10b981', '#ef4444', '#6b7280'],
        borderColor: ['#059669', '#dc2626', '#4b5563']
      }
    ]
  };
};

export const generateTrendChart = (metrics: DashboardMetrics): ChartData => {
  const trend = metrics.sentimentTrend;

  return {
    labels: trend.map(t => t.timestamp),
    datasets: [
      {
        label: 'Positive Reviews',
        data: trend.map(t => t.positiveCount),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true
      },
      {
        label: 'Negative Reviews',
        data: trend.map(t => t.negativeCount),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true
      },
      {
        label: 'Neutral Reviews',
        data: trend.map(t => t.neutralCount),
        borderColor: '#6b7280',
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        fill: true
      }
    ]
  };
};

export const generateWordFrequencyChart = (
  metrics: DashboardMetrics,
  type: 'positive' | 'negative'
): ChartData => {
  const words = type === 'positive' ? metrics.topPositiveWords : metrics.topNegativeWords;
  const color = type === 'positive' ? '#10b981' : '#ef4444';

  return {
    labels: words.map(w => w.word),
    datasets: [
      {
        label: `Top ${type} Words`,
        data: words.map(w => w.frequency),
        backgroundColor: color,
        borderColor: color
      }
    ]
  };
};

export const generateSentimentScoreHistogram = (reviews: SentimentDataPoint[]): ChartData => {
  const bins = createHistogramBins(reviews, 10);

  return {
    labels: bins.map(b => `${b.min.toFixed(1)} - ${b.max.toFixed(1)}`),
    datasets: [
      {
        label: 'Distribution of Sentiment Scores',
        data: bins.map(b => b.count),
        backgroundColor: '#3b82f6',
        borderColor: '#1e40af'
      }
    ]
  };
};

const createHistogramBins = (reviews: SentimentDataPoint[], binCount: number) => {
  if (reviews.length === 0) {
    return [];
  }

  const scores = reviews.map(r => r.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const range = maxScore - minScore || 1;

  const bins: { min: number; max: number; count: number }[] = [];

  for (let i = 0; i < binCount; i++) {
    const min = minScore + (range / binCount) * i;
    const max = minScore + (range / binCount) * (i + 1);

    const count = scores.filter(s => s >= min && s <= max).length;
    bins.push({ min, max, count });
  }

  return bins;
};

export const calculateSentimentMetrics = (reviews: SentimentDataPoint[]) => {
  if (reviews.length === 0) {
    return {
      positivePercentage: 0,
      negativePercentage: 0,
      neutralPercentage: 0,
      avgScore: 0,
      avgConfidence: 0,
      medianScore: 0,
      stdDeviation: 0
    };
  }

  const total = reviews.length;
  const positive = reviews.filter(r => r.label === 'Positive').length;
  const negative = reviews.filter(r => r.label === 'Negative').length;
  const neutral = reviews.filter(r => r.label === 'Neutral').length;

  const scores = reviews.map(r => r.score);
  const avgScore = scores.reduce((a, b) => a + b, 0) / total;
  const avgConfidence = reviews.reduce((a, b) => a + b.confidence, 0) / total;

  const sortedScores = [...scores].sort((a, b) => a - b);
  const medianScore = total % 2 === 0
    ? (sortedScores[total / 2 - 1] + sortedScores[total / 2]) / 2
    : sortedScores[Math.floor(total / 2)];

  const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / total;
  const stdDeviation = Math.sqrt(variance);

  return {
    positivePercentage: (positive / total) * 100,
    negativePercentage: (negative / total) * 100,
    neutralPercentage: (neutral / total) * 100,
    avgScore,
    avgConfidence,
    medianScore,
    stdDeviation
  };
};

export const generateReportSummary = (reviews: SentimentDataPoint[], metrics: DashboardMetrics) => {
  const sentimentMetrics = calculateSentimentMetrics(reviews);

  return {
    report_date: new Date().toISOString(),
    total_reviews_analyzed: metrics.totalReviews,
    sentiment_summary: {
      positive: {
        count: metrics.positiveCount,
        percentage: sentimentMetrics.positivePercentage.toFixed(2)
      },
      negative: {
        count: metrics.negativeCount,
        percentage: sentimentMetrics.negativePercentage.toFixed(2)
      },
      neutral: {
        count: metrics.neutralCount,
        percentage: sentimentMetrics.neutralPercentage.toFixed(2)
      }
    },
    statistical_analysis: {
      average_sentiment_score: sentimentMetrics.avgScore.toFixed(3),
      median_sentiment_score: sentimentMetrics.medianScore.toFixed(3),
      standard_deviation: sentimentMetrics.stdDeviation.toFixed(3),
      average_confidence: sentimentMetrics.avgConfidence.toFixed(2)
    },
    key_insights: generateKeyInsights(metrics, sentimentMetrics),
    top_words: {
      positive: metrics.topPositiveWords.slice(0, 5),
      negative: metrics.topNegativeWords.slice(0, 5)
    }
  };
};

const generateKeyInsights = (metrics: DashboardMetrics, sentimentMetrics: ReturnType<typeof calculateSentimentMetrics>) => {
  const insights = [];

  if (sentimentMetrics.positivePercentage > 60) {
    insights.push('Predominantly positive sentiment detected in reviews');
  } else if (sentimentMetrics.negativePercentage > 60) {
    insights.push('Predominantly negative sentiment detected in reviews');
  } else {
    insights.push('Mixed sentiment distribution across reviews');
  }

  if (sentimentMetrics.stdDeviation > 1.5) {
    insights.push('High variance in sentiment scores indicates diverse opinions');
  } else {
    insights.push('Consistent sentiment pattern throughout reviews');
  }

  if (metrics.averageConfidence > 85) {
    insights.push('High confidence in sentiment classifications');
  } else if (metrics.averageConfidence < 65) {
    insights.push('Low confidence scores suggest ambiguous content');
  }

  return insights;
};
