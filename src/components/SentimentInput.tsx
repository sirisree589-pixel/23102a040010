import { useState } from 'react';
import { MessageSquare } from 'lucide-react';

interface SentimentInputProps {
  onAnalyze: (text: string) => void;
  loading: boolean;
}

export const SentimentInput = ({ onAnalyze, loading }: SentimentInputProps) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAnalyze(text);
    }
  };

  const sampleReviews = [
    "This product is absolutely amazing! Best purchase I've ever made. Highly recommend!",
    "Terrible quality. Broke after one day. Complete waste of money. Very disappointed.",
    "The product arrived on time and works as expected. Nothing special but does the job."
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
            Enter Amazon Review Text
          </label>
          <textarea
            id="review"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste an Amazon review here..."
            className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim() || loading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <MessageSquare size={20} />
          {loading ? 'Analyzing...' : 'Analyze Sentiment'}
        </button>
      </form>

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Try sample reviews:</p>
        <div className="space-y-2">
          {sampleReviews.map((review, index) => (
            <button
              key={index}
              onClick={() => setText(review)}
              className="w-full text-left px-4 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              {review}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
