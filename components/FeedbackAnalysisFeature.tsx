import React, { useState } from 'react';
import type { PlatformFeedback, AIFeedbackAnalysis } from '../types';
import { analyzePlatformFeedback } from '../services/geminiService';

interface FeedbackAnalysisFeatureProps {
    feedback: PlatformFeedback[];
}

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4 my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
        <p className="text-sky-300">AI is synthesizing user feedback...</p>
    </div>
);


const FeedbackAnalysisFeature: React.FC<FeedbackAnalysisFeatureProps> = ({ feedback }) => {
    const [analysis, setAnalysis] = useState<AIFeedbackAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await analyzePlatformFeedback(feedback);
            setAnalysis(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to analyze feedback.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div>
                    <h2 className="text-3xl font-bold text-sky-300 mb-2">Feedback & Analysis</h2>
                    <p className="text-slate-400">Review user feedback and use AI to generate actionable insights.</p>
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || feedback.length === 0}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-full transition disabled:bg-slate-600 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    {isLoading ? 'Analyzing...' : '🤖 Analyze with AI'}
                </button>
            </div>

            {/* AI Analysis Section */}
            {isLoading && <LoadingSpinner />}
            {error && <p className="text-red-400 text-center bg-red-900/50 p-3 rounded-lg">{error}</p>}
            {analysis && (
                <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 animate-fade-in">
                    <h3 className="text-2xl font-bold text-white mb-4">AI Analysis Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Positive Themes */}
                        <div>
                            <h4 className="font-semibold text-green-300 mb-2">✅ Positive Themes</h4>
                            <ul className="list-disc pl-5 space-y-1 text-slate-300 text-sm">{analysis.positiveThemes.map((item, i) => <li key={i}>{item}</li>)}</ul>
                        </div>
                        {/* Areas for Improvement */}
                        <div>
                            <h4 className="font-semibold text-amber-300 mb-2">💡 Areas for Improvement</h4>
                            <ul className="list-disc pl-5 space-y-1 text-slate-300 text-sm">{analysis.areasForImprovement.map((item, i) => <li key={i}>{item}</li>)}</ul>
                        </div>
                        {/* Actionable Suggestions */}
                        <div>
                            <h4 className="font-semibold text-sky-300 mb-2">🚀 Actionable Suggestions</h4>
                             <div className="space-y-3">
                                {analysis.actionableSuggestions.map((item, i) => (
                                    <div key={i} className="bg-slate-700/50 p-2 rounded-md">
                                        <p className="font-semibold text-white text-sm">{item.suggestion}</p>
                                        <p className="text-slate-400 text-xs">{item.reasoning}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Raw Feedback Section */}
            <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">All Submitted Feedback ({feedback.length})</h3>
                {feedback.length > 0 ? (
                     <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                        {feedback.map(f => (
                            <div key={f.id} className="bg-slate-700/50 p-4 rounded-md">
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="font-semibold capitalize text-sky-300">{f.feature.replace('-', ' ')}</span>
                                    <span className="text-yellow-400">{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</span>
                                    <span className="text-slate-400">{new Date(f.submittedAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-slate-200">{f.comment}</p>
                            </div>
                        ))}
                     </div>
                ) : (
                    <p className="text-slate-400 text-center">No feedback has been submitted yet.</p>
                )}
            </div>
        </div>
    );
};

export default FeedbackAnalysisFeature;