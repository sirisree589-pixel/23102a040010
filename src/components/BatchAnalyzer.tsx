import { useState } from 'react';
import { Upload, BarChart3 } from 'lucide-react';
import { batchAnalyze, aggregateResults } from '../utils/sentimentAnalyzer';

export const BatchAnalyzer = () => {
  const [reviews, setReviews] = useState<string>('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    setLoading(true);
    const reviewList = reviews
      .split('\n')
      .filter(r => r.trim().length > 0);

    if (reviewList.length > 0) {
      const analyzed = batchAnalyze(reviewList);
      const aggregated = aggregateResults(analyzed);
      setResults(aggregated);
    }
    setLoading(false);
  };

  const sampleBatch = `This product exceeded my expectations! Amazing quality and fast shipping.
Worst purchase ever. Product broke after 2 days. Do not buy!
Good product for the price. Works as described.
Absolutely love it! Would definitely recommend to friends.
Poor quality materials. Not worth the money at all.`;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 size={24} className="text-blue-600" />
          <h3 className="text-xl font-bold text-gray-800">Batch Analysis</h3>
        </div>

        <textarea
          value={reviews}
          onChange={(e) => setReviews(e.target.value)}
          placeholder="Enter multiple reviews (one per line)..."
          className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
          disabled={loading}
        />

        <div className="flex gap-3">
          <button
            onClick={handleAnalyze}
            disabled={!reviews.trim() || loading}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Upload size={20} />
            {loading ? 'Analyzing...' : 'Analyze Batch'}
          </button>
          <button
            onClick={() => setReviews(sampleBatch)}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Load Sample
          </button>
        </div>
      </div>

      {results && (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-6">Analysis Results</h4>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{results.positive}</p>
              <p className="text-sm text-green-700 mt-1">Positive</p>
              <p className="text-xs text-green-600 mt-1">{results.positivePercentage.toFixed(1)}%</p>
            </div>
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{results.negative}</p>
              <p className="text-sm text-red-700 mt-1">Negative</p>
              <p className="text-xs text-red-600 mt-1">{results.negativePercentage.toFixed(1)}%</p>
            </div>
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-gray-600">{results.neutral}</p>
              <p className="text-sm text-gray-700 mt-1">Neutral</p>
              <p className="text-xs text-gray-600 mt-1">{results.neutralPercentage.toFixed(1)}%</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 w-32">Distribution:</span>
              <div className="flex-1 h-8 bg-gray-200 rounded-full overflow-hidden flex">
                <div
                  className="bg-green-500 h-full"
                  style={{ width: `${results.positivePercentage}%` }}
                />
                <div
                  className="bg-red-500 h-full"
                  style={{ width: `${results.negativePercentage}%` }}
                />
                <div
                  className="bg-gray-400 h-full"
                  style={{ width: `${results.neutralPercentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Average Sentiment Score</p>
                <p className="text-2xl font-bold text-blue-600">{results.avgScore.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Confidence</p>
                <p className="text-2xl font-bold text-blue-600">{results.avgConfidence.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
