import React, { useState, useCallback } from 'react';
import { INDUSTRY_TOPICS } from '../constants';
import { getIndustryInsights } from '../services/geminiService';
import type { IndustryInsights } from '../types';

// Icons for different sections
const TrendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const CompanyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const NetworkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4 my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
        <p className="text-sky-300">Scanning the tech horizon for insights...</p>
    </div>
);

const IndustryHubFeature: React.FC = () => {
    const [topic, setTopic] = useState<string>(INDUSTRY_TOPICS[0]);
    const [insights, setInsights] = useState<IndustryInsights | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFetchInsights = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setInsights(null);
        try {
            const results = await getIndustryInsights(topic);
            setInsights(results);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [topic]);

    return (
        <div className="w-full max-w-6xl mx-auto">
            {/* Input Form */}
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 mb-10">
                <h2 className="text-2xl font-bold text-sky-300 mb-2">Industry Insights Hub</h2>
                <p className="text-slate-400 mb-6">Select a tech sector to get AI-curated trends, company profiles, and networking resources.</p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-full sm:w-2/3">
                        <label htmlFor="industry-topic" className="sr-only">Industry Topic</label>
                        <select
                            id="industry-topic"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="w-full bg-slate-700 text-white border-slate-600 rounded-md shadow-sm p-3 focus:ring-sky-500 focus:border-sky-500 transition"
                        >
                            {INDUSTRY_TOPICS.map((t) => (<option key={t} value={t}>{t}</option>))}
                        </select>
                    </div>
                    <div className="w-full sm:w-1/3">
                        <button
                            onClick={handleFetchInsights}
                            disabled={isLoading}
                            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-6 rounded-full transition-transform transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Curating...' : '📰 Get Insights'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div>
                {isLoading && <LoadingSpinner />}
                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center max-w-2xl mx-auto">
                        <h3 className="font-bold">Failed to Fetch Insights</h3>
                        <p>{error}</p>
                    </div>
                )}
                {insights && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Emerging Trends */}
                        <div className="space-y-4">
                            <h3 className="flex items-center text-xl font-bold text-green-300"><TrendIcon /><span className="ml-2">Emerging Trends</span></h3>
                            {insights.trends.map((trend, i) => (
                                <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                                    <h4 className="font-semibold text-white">{trend.title}</h4>
                                    <p className="text-sm text-slate-300 mt-1">{trend.explanation}</p>
                                </div>
                            ))}
                        </div>

                        {/* Companies to Watch */}
                        <div className="space-y-4">
                             <h3 className="flex items-center text-xl font-bold text-blue-300"><CompanyIcon /><span className="ml-2">Companies to Watch</span></h3>
                            {insights.companies.map((co, i) => (
                                <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                                    <h4 className="font-semibold text-white">{co.name}</h4>
                                    <p className="text-sm text-slate-400 mt-1">{co.description}</p>
                                    <p className="text-xs text-slate-300 mt-2 p-2 bg-slate-700/50 rounded-md"><strong>Why they matter:</strong> {co.relevance}</p>
                                </div>
                            ))}
                        </div>

                        {/* Networking & Resources */}
                        <div className="space-y-4">
                            <h3 className="flex items-center text-xl font-bold text-purple-300"><NetworkIcon /><span className="ml-2">Networking & Resources</span></h3>
                            {insights.networking.map((res, i) => (
                                <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                                    <h4 className="font-semibold text-white">{res.name} <span className="text-xs font-mono bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded-full">{res.type}</span></h4>
                                    <p className="text-sm text-slate-400 mt-1">{res.description}</p>
                                    <a href={res.link} target="_blank" rel="noopener noreferrer" className="text-sm text-sky-400 hover:underline mt-2 inline-block">Visit Resource &rarr;</a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IndustryHubFeature;