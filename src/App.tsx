import { useState } from 'react';
import { Brain, FileText, BarChart3 } from 'lucide-react';
import { SentimentInput } from './components/SentimentInput';
import { SentimentResult } from './components/SentimentResult';
import { BatchAnalyzer } from './components/BatchAnalyzer';
import { analyzeSentiment, SentimentResult as Result } from './utils/sentimentAnalyzer';

type Tab = 'single' | 'batch';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('single');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = (text: string) => {
    setLoading(true);
    setTimeout(() => {
      const analysis = analyzeSentiment(text);
      setResult(analysis);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain size={48} className="text-blue-600" />
            <h1 className="text-5xl font-bold text-gray-800">
              Amazon Review Sentiment Analyzer
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Natural Language Processing powered sentiment analysis for Amazon product reviews
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            <Brain size={16} />
            Powered by Machine Learning & NLP
          </div>
        </header>

        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-2 inline-flex gap-2">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'single'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText size={20} />
              Single Review
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'batch'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 size={20} />
              Batch Analysis
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {activeTab === 'single' ? (
            <>
              <SentimentInput onAnalyze={handleAnalyze} loading={loading} />
              {result && <SentimentResult result={result} />}
            </>
          ) : (
            <BatchAnalyzer />
          )}
        </div>

        <footer className="mt-16 text-center text-gray-600 text-sm">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-3xl mx-auto">
            <h3 className="font-semibold text-gray-800 mb-3">About This Project</h3>
            <p className="mb-4">
              This sentiment analysis tool uses Natural Language Processing (NLP) techniques to analyze
              Amazon product reviews. It performs text preprocessing, feature extraction, and sentiment
              classification to determine if a review is positive, negative, or neutral.
            </p>
            <div className="flex justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Text Preprocessing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Feature Extraction</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Sentiment Classification</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
