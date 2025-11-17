import React, { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Loader2, Search, TrendingUp, Shield } from 'lucide-react';

export default function FakeNewsDetector() {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('text');

  const analyzeNews = async () => {
    if (!text && !url) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Analyze the following ${activeTab === 'text' ? 'news article text' : 'news article URL'} for potential fake news indicators. Provide your analysis in JSON format with the following structure:
{
  "credibility_score": (number 0-100),
  "verdict": "Real/Suspicious/Fake",
  "confidence": "Low/Medium/High",
  "key_indicators": ["indicator1", "indicator2", ...],
  "red_flags": ["flag1", "flag2", ...],
  "reasoning": "brief explanation",
  "recommendations": ["recommendation1", "recommendation2", ...]
}

${activeTab === 'text' ? `Article text: ${text}` : `Article URL: ${url}`}

Analyze for: sensational language, source credibility, logical consistency, emotional manipulation, verifiable facts, and bias.`
          }]
        })
      });
      
      const data = await response.json();
      const textContent = data.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('');
      
      const cleanJson = textContent.replace(/```json?/g, '').trim();
      const analysis = JSON.parse(cleanJson);
      setResult(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      setResult({ error: true, message: 'Failed to analyze. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict) => {
    switch(verdict?.toLowerCase()) {
      case 'real': return 'text-green-600 bg-green-50 border-green-200';
      case 'suspicious': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'fake': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getVerdictIcon = (verdict) => {
    switch(verdict?.toLowerCase()) {
      case 'real': return <CheckCircle className="w-6 h-6" />;
      case 'suspicious': return <AlertCircle className="w-6 h-6" />;
      case 'fake': return <XCircle className="w-6 h-6" />;
      default: return <Shield className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">Fake News Detector</h1>
          </div>
          <p className="text-gray-600">AI-powered analysis to help identify misinformation</p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'text' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Analyze Text
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'url' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Analyze URL
            </button>
          </div>

          {activeTab === 'text' ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the news article or claim here..."
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          ) : (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter article URL (e.g., https://example.com/article)"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          )}

          <button
            onClick={analyzeNews}
            disabled={loading || (!text && !url)}
            className="w-full mt-4 py-3 px-6 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
            ) : (
              <><Search className="w-5 h-5" /> Analyze Article</>
            )}
          </button>
        </div>

        {/* Results Section */}
        {result && !result.error && (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            {/* Verdict */}
            <div className={`border-2 rounded-lg p-6 ${getVerdictColor(result.verdict)}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getVerdictIcon(result.verdict)}
                  <div>
                    <h2 className="text-2xl font-bold">{result.verdict}</h2>
                    <p className="text-sm opacity-75">Confidence: {result.confidence}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{result.credibility_score}</div>
                  <p className="text-sm opacity-75">Credibility</p>
                </div>
              </div>
              <div className="w-full bg-white bg-opacity-50 rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all duration-500" 
                  style={{
                    width: `${result.credibility_score}%`,
                    backgroundColor: result.credibility_score > 70 ? '#16a34a' : result.credibility_score > 40 ? '#eab308' : '#dc2626'
                  }}
                />
              </div>
            </div>

            {/* Reasoning */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Analysis
              </h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{result.reasoning}</p>
            </div>

            {/* Key Indicators */}
            {result.key_indicators && result.key_indicators.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Indicators</h3>
                <div className="space-y-2">
                  {result.key_indicators.map((indicator, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{indicator}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Red Flags */}
            {result.red_flags && result.red_flags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Red Flags</h3>
                <div className="space-y-2">
                  {result.red_flags.map((flag, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Recommendations</h3>
                <div className="space-y-2">
                  {result.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-green-50 p-3 rounded-lg">
                      <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {result && result.error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <p className="text-red-800 font-medium">{result.message}</p>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>This tool uses AI to analyze content but is not 100% accurate.</p>
          <p>Always verify information from multiple reliable sources.</p>
        </div>
      </div>
    </div>
  );
}
