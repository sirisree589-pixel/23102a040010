import express, { Request, Response } from 'express';
import { analyzeSentiment, batchAnalyze, aggregateResults } from '../utils/sentimentAnalyzer';
import { advancedPreprocess } from '../utils/advancedPreprocessing';
import { createBertModel, analyzeWithBert } from '../utils/bertModel';

export const createRouter = () => {
  const router = express.Router();
  const model = createBertModel();

  router.post('/analyze', (req: Request, res: Response) => {
    try {
      const { text, useAdvanced = false } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          error: 'Invalid input: text field is required and must be a string'
        });
      }

      const basicAnalysis = analyzeSentiment(text);

      let preprocessed = null;
      if (useAdvanced) {
        preprocessed = advancedPreprocess(text);
      }

      const bertPrediction = analyzeWithBert(text, model);

      const result = {
        basic_analysis: basicAnalysis,
        bert_prediction: bertPrediction,
        advanced_preprocessing: preprocessed,
        timestamp: new Date().toISOString(),
        text_length: text.length
      };

      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: 'Analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  router.post('/batch-analyze', (req: Request, res: Response) => {
    try {
      const { reviews, useAdvanced = false } = req.body;

      if (!Array.isArray(reviews) || reviews.length === 0) {
        return res.status(400).json({
          error: 'Invalid input: reviews must be a non-empty array'
        });
      }

      if (!reviews.every(r => typeof r === 'string')) {
        return res.status(400).json({
          error: 'Invalid input: all reviews must be strings'
        });
      }

      const basicAnalyses = batchAnalyze(reviews);
      const aggregated = aggregateResults(basicAnalyses);

      let advancedAnalyses = null;
      if (useAdvanced) {
        advancedAnalyses = reviews.map(review => advancedPreprocess(review));
      }

      const bertAnalyses = reviews.map(review => analyzeWithBert(review, model));

      const result = {
        count: reviews.length,
        basic_aggregate: aggregated,
        basic_individual: basicAnalyses,
        bert_predictions: bertAnalyses,
        advanced_preprocessing: advancedAnalyses,
        timestamp: new Date().toISOString()
      };

      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: 'Batch analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  router.post('/compare', (req: Request, res: Response) => {
    try {
      const { text1, text2 } = req.body;

      if (!text1 || !text2) {
        return res.status(400).json({
          error: 'Both text1 and text2 are required'
        });
      }

      const analysis1 = analyzeSentiment(text1);
      const analysis2 = analyzeSentiment(text2);

      const bert1 = analyzeWithBert(text1, model);
      const bert2 = analyzeWithBert(text2, model);

      const comparison = {
        text1: {
          basic: analysis1,
          bert: bert1
        },
        text2: {
          basic: analysis2,
          bert: bert2
        },
        sentiment_difference: analysis1.score - analysis2.score,
        similarity_score: calculateSimilarity(text1, text2),
        timestamp: new Date().toISOString()
      };

      res.json(comparison);
    } catch (error) {
      res.status(500).json({
        error: 'Comparison failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  router.post('/extract-features', (req: Request, res: Response) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({
          error: 'Text field is required'
        });
      }

      const preprocessed = advancedPreprocess(text);

      const features = {
        text_analysis: preprocessed.features,
        metadata: preprocessed.metadata,
        tokens_count: preprocessed.tokens.length,
        lemmatized_count: preprocessed.lemmatized.length,
        unique_tokens: new Set(preprocessed.tokens).size,
        tokens: preprocessed.tokens.slice(0, 50),
        timestamp: new Date().toISOString()
      };

      res.json(features);
    } catch (error) {
      res.status(500).json({
        error: 'Feature extraction failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  router.post('/sentiment-distribution', (req: Request, res: Response) => {
    try {
      const { reviews } = req.body;

      if (!Array.isArray(reviews) || reviews.length === 0) {
        return res.status(400).json({
          error: 'Reviews array is required and must not be empty'
        });
      }

      const analyses = batchAnalyze(reviews);
      const distribution = calculateDistribution(analyses);

      const result = {
        distribution,
        total_reviews: reviews.length,
        timestamp: new Date().toISOString()
      };

      res.json(result);
    } catch (error) {
      res.status(500).json({
        error: 'Distribution calculation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  router.get('/model-info', (req: Request, res: Response) => {
    res.json({
      model_type: 'Hybrid Sentiment Analysis',
      components: [
        'Basic Sentiment Analyzer (Lexicon-based)',
        'Advanced Preprocessing Pipeline',
        'BERT-inspired Neural Model',
        'Feature Extraction Engine'
      ],
      supported_languages: ['English'],
      max_text_length: 512,
      classes: ['positive', 'negative', 'neutral'],
      features: {
        text_preprocessing: true,
        feature_extraction: true,
        bert_classification: true,
        batch_processing: true,
        text_comparison: true
      }
    });
  });

  router.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  return router;
};

const calculateSimilarity = (text1: string, text2: string): number => {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return union.size === 0 ? 0 : intersection.size / union.size;
};

interface SentimentAnalysisResult {
  label: string;
  score: number;
}

const calculateDistribution = (analyses: SentimentAnalysisResult[]) => {
  const distribution = {
    positive: 0,
    negative: 0,
    neutral: 0,
    positivePercentage: 0,
    negativePercentage: 0,
    neutralPercentage: 0
  };

  for (const analysis of analyses) {
    if (analysis.label === 'Positive') distribution.positive++;
    else if (analysis.label === 'Negative') distribution.negative++;
    else distribution.neutral++;
  }

  const total = analyses.length;
  distribution.positivePercentage = (distribution.positive / total) * 100;
  distribution.negativePercentage = (distribution.negative / total) * 100;
  distribution.neutralPercentage = (distribution.neutral / total) * 100;

  return distribution;
};
