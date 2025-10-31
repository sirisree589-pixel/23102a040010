import { ThumbsUp, ThumbsDown, Minus, TrendingUp } from 'lucide-react';
import { SentimentResult as Result } from '../utils/sentimentAnalyzer';

interface SentimentResultProps {
  result: Result;
}

export const SentimentResult = ({ result }: SentimentResultProps) => {
  const getSentimentColor = () => {
    switch (result.label) {
      case 'Positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSentimentIcon = () => {
    switch (result.label) {
      case 'Positive':
        return <ThumbsUp size={32} />;
      case 'Negative':
        return <ThumbsDown size={32} />;
      default:
        return <Minus size={32} />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className={`border-2 rounded-xl p-6 ${getSentimentColor()}`}>
        <div className="flex items-center gap-4 mb-4">
          {getSentimentIcon()}
          <div>
            <h3 className="text-2xl font-bold">{result.label} Sentiment</h3>
            <p className="text-sm opacity-75">Confidence: {result.confidence.toFixed(2)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white bg-opacity-50 rounded-lg p-4">
            <p className="text-sm opacity-75 mb-1">Sentiment Score</p>
            <p className="text-3xl font-bold">{result.score}</p>
          </div>
          <div className="bg-white bg-opacity-50 rounded-lg p-4">
            <p className="text-sm opacity-75 mb-1">Comparative Score</p>
            <p className="text-3xl font-bold">{result.comparative.toFixed(3)}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {result.positive.length > 0 && (
          <div className="bg-white border-2 border-green-200 rounded-xl p-6">
            <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
              <ThumbsUp size={20} />
              Positive Words ({result.positive.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.positive.map((word, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {result.negative.length > 0 && (
          <div className="bg-white border-2 border-red-200 rounded-xl p-6">
            <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
              <ThumbsDown size={20} />
              Negative Words ({result.negative.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.negative.map((word, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          Text Features
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{result.features.wordCount}</p>
            <p className="text-sm text-gray-600 mt-1">Word Count</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{result.features.avgWordLength.toFixed(1)}</p>
            <p className="text-sm text-gray-600 mt-1">Avg Word Length</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{result.features.uniqueWords}</p>
            <p className="text-sm text-gray-600 mt-1">Unique Words</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{result.features.lexicalDiversity.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-1">Diversity Score</p>
          </div>
        </div>
      </div>
    </div>
  );
};
