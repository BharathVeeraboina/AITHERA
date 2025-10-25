import React, { useState, useCallback } from 'react';
import { ROLES, DIFFICULTY_LEVELS, LANGUAGES, TOP_COMPANIES, FAIQ_DOMAINS, CAREER_GUIDE_TOPICS } from '../constants';
import { 
    generateCodingChallenge, 
    evaluateCodeSolution,
    generateCampusTest,
    generateInterviewReview,
    generateFaiqs,
    generatePuzzle,
    generateCareerGuide
} from '../services/geminiService';
import type { 
    CodingChallenge, 
    ChallengeFeedback, 
    CompletedChallenge,
    CampusRecruitmentTest,
    InterviewReview,
    FAIQ,
    Puzzle,
    CareerGuide
} from '../types';

// Helper for unique IDs
const uid = () => `challenge_${Date.now()}`;

type HubView = 'coding' | 'campusTests' | 'reviews' | 'faiqs' | 'puzzles' | 'guides';

// A simple markdown-to-HTML parser for descriptions and guides
const SimpleMarkdown = ({ text }: { text: string }) => {
    const html = text
        .replace(/`([^`]+)`/g, '<code class="bg-slate-700 text-sky-300 font-mono rounded px-1 py-0.5">$&</code>')
        .replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre class="bg-slate-900/50 p-3 rounded-md my-2"><code class="language-$1">$2</code></pre>')
        .replace(/\n/g, '<br />')
        .replace(/### (.*)/g, '<h3 class="text-lg font-semibold mt-4 mb-2 text-sky-300">$1</h3>')
        .replace(/## (.*)/g, '<h2 class="text-xl font-bold mt-6 mb-3 text-sky-300">$1</h2>')
        .replace(/\* (.*)/g, '<li class="ml-5 list-disc">$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <div className="prose prose-sm prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
};

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4 my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
        <p className="text-sky-300">AI is crafting your content...</p>
    </div>
);


interface ChallengeBankFeatureProps {
    onChallengeComplete: (challenge: CompletedChallenge) => void;
    challengeHistory: CompletedChallenge[];
}

const ChallengeBankFeature: React.FC<ChallengeBankFeatureProps> = ({ onChallengeComplete, challengeHistory }) => {
    const [view, setView] = useState<HubView>('coding');
    
    // States for Coding Challenge
    const [role, setRole] = useState<string>(ROLES[0]);
    const [difficulty, setDifficulty] = useState<string>(DIFFICULTY_LEVELS[0]);
    const [language, setLanguage] = useState<string>(LANGUAGES[0]);
    const [currentChallenge, setCurrentChallenge] = useState<CodingChallenge | null>(null);
    const [userSolution, setUserSolution] = useState<string>('');
    const [feedback, setFeedback] = useState<ChallengeFeedback | null>(null);
    const [showHint, setShowHint] = useState<boolean>(false);

    // States for new features
    const [company, setCompany] = useState<string>(TOP_COMPANIES[0]);
    const [campusTest, setCampusTest] = useState<CampusRecruitmentTest | null>(null);
    const [interviewReview, setInterviewReview] = useState<InterviewReview | null>(null);
    const [faiqDomain, setFaiqDomain] = useState<string>(FAIQ_DOMAINS[0]);
    const [faiqCategory, setFaiqCategory] = useState<'Technical' | 'Behavioral' | 'HR'>('Technical');
    const [faiqs, setFaiqs] = useState<FAIQ[]>([]);
    const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
    const [guideTopic, setGuideTopic] = useState<string>(CAREER_GUIDE_TOPICS[0]);
    const [guide, setGuide] = useState<CareerGuide | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    // --- Handlers for all features ---
    const generateContent = useCallback(async (currentView: HubView) => {
        setIsLoading(true);
        setError(null);
        
        const resetState = { campusTest: null, interviewReview: null, faiqs: [], puzzle: null, guide: null };
        setCampusTest(resetState.campusTest);
        setInterviewReview(resetState.interviewReview);
        setFaiqs(resetState.faiqs);
        setPuzzle(resetState.puzzle);
        setGuide(resetState.guide);

        try {
            switch(currentView) {
                case 'campusTests':
                    setCampusTest(await generateCampusTest(company));
                    break;
                case 'reviews':
                    setInterviewReview(await generateInterviewReview(company));
                    break;
                case 'faiqs':
                    setFaiqs(await generateFaiqs(faiqDomain, faiqCategory));
                    break;
                case 'puzzles':
                    setPuzzle(await generatePuzzle());
                    break;
                case 'guides':
                    setGuide(await generateCareerGuide(guideTopic));
                    break;
            }
        } catch(err) {
            setError(err instanceof Error ? err.message : `Failed to generate content for ${currentView}.`);
        } finally {
            setIsLoading(false);
        }
    }, [company, faiqDomain, faiqCategory, guideTopic]);

    // Coding Challenge Handlers
    const handleGenerateChallenge = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setCurrentChallenge(null);
        setFeedback(null);
        setUserSolution('');
        setShowHint(false);
        try {
            const challenge = await generateCodingChallenge(role, difficulty);
            setCurrentChallenge(challenge);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate a challenge.");
        } finally {
            setIsLoading(false);
        }
    }, [role, difficulty]);

    const handleEvaluateSolution = useCallback(async () => {
        if (!userSolution.trim() || !currentChallenge) return;
        setIsEvaluating(true);
        setError(null);
        setFeedback(null);
        try {
            const result = await evaluateCodeSolution(currentChallenge, userSolution, language);
            setFeedback(result);
            const completed: CompletedChallenge = {
                id: uid(),
                challenge: currentChallenge,
                userSolution,
                feedback: result,
                completedAt: new Date().toISOString(),
                difficulty: difficulty,
            };
            onChallengeComplete(completed);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to evaluate the solution.");
        } finally {
            setIsEvaluating(false);
        }
    }, [currentChallenge, userSolution, language, onChallengeComplete, difficulty]);

    // --- Render functions for each tab ---
    
    const renderCodingChallenge = () => (
        <>
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-2xl mx-auto mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-sky-300 mb-2">Target Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md">
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-sky-300 mb-2">Difficulty</label>
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md">
                            {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>
                {error && <p className="text-red-400 text-center mb-4">{error}</p>}
                <div className="text-center">
                    <button onClick={handleGenerateChallenge} disabled={isLoading} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 disabled:bg-slate-600">
                        {isLoading ? 'Generating...' : '🚀 Generate Challenge'}
                    </button>
                </div>
            </div>
            {isLoading && <LoadingSpinner />}
            {currentChallenge && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                        <h2 className="text-2xl font-bold text-sky-300 mb-4">{currentChallenge.title}</h2>
                        <div className="text-slate-300 space-y-4 prose prose-invert"><SimpleMarkdown text={currentChallenge.description} /><div><strong>Examples:</strong>{currentChallenge.examples.map((ex, i) => (<pre key={i} className="bg-slate-900/50 p-2 rounded-md text-sm">Input: {ex.input}\nOutput: {ex.output}</pre>))}</div><div><strong>Constraints:</strong><ul className="list-disc pl-5">{currentChallenge.constraints.map((c, i) => <li key={i}>{c}</li>)}</ul></div></div>
                        <div className="mt-4"><button onClick={() => setShowHint(!showHint)} className="text-amber-400 text-sm">{showHint ? 'Hide' : 'Show'} Hint</button>{showHint && <p className="mt-2 text-sm text-amber-500 bg-slate-700/50 p-2 rounded-md">{currentChallenge.hint}</p>}</div>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold text-sky-400">Your Solution</h3><select value={language} onChange={e => setLanguage(e.target.value)} className="bg-slate-700 text-sm rounded-md p-1">{LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}</select></div>
                        <textarea value={userSolution} onChange={e => setUserSolution(e.target.value)} disabled={isEvaluating || !!feedback} rows={15} className="w-full bg-slate-700/50 font-mono text-sm p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-sky-500 disabled:bg-slate-800"></textarea>
                        {!feedback && !isEvaluating && <button onClick={handleEvaluateSolution} disabled={!userSolution.trim()} className="mt-4 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-full transition disabled:bg-slate-600">Submit & Evaluate</button>}
                        {isEvaluating && <div className="text-center py-4"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-400 mx-auto"></div><p className="mt-3 text-sky-300">AI is reviewing your code...</p></div>}
                        {feedback && (<div className="mt-4 space-y-4 animate-fade-in"><h3 className="text-xl font-bold text-white">AI Code Review</h3><div><h4 className="font-semibold text-green-400">Correctness</h4><p className="text-sm text-slate-300">{feedback.correctness}</p></div><div><h4 className="font-semibold text-blue-400">Efficiency (Big O)</h4><p className="text-sm text-slate-300">{feedback.efficiency}</p></div><div><h4 className="font-semibold text-purple-400">Code Quality</h4><p className="text-sm text-slate-300">{feedback.codeQuality}</p></div><div><h4 className="font-semibold text-sky-400">Suggested Solution</h4><div className="text-sm prose prose-invert"><SimpleMarkdown text={`\`\`\`${language.toLowerCase()}\n${feedback.suggestedSolution}\n\`\`\``} /></div></div></div>)}
                    </div>
                </div>
            )}
        </>
    );

    const renderCampusTests = () => (
         <>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8 max-w-2xl mx-auto">
                <p className="text-slate-400 mb-4">Get sample questions and mock test formats from top companies.</p>
                <div className="flex gap-4">
                    <select value={company} onChange={e => setCompany(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md"><option value="" disabled>Select Company</option>{TOP_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                    <button onClick={() => generateContent('campusTests')} disabled={isLoading} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-full transition disabled:bg-slate-600 whitespace-nowrap">Generate Test</button>
                </div>
            </div>
            {isLoading && <LoadingSpinner />}
            {campusTest && <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-6">
                <h2 className="text-2xl font-bold text-white">Campus Test Simulation: {campusTest.companyName}</h2>
                {campusTest.testFormat.map((section, i) => (<div key={i}><h3 className="text-xl font-semibold text-sky-300 border-b border-slate-600 pb-2 mb-3">{section.title}</h3><div className="space-y-4">{section.questions.map((q, qi) => (<details key={qi} className="bg-slate-700/50 p-3 rounded-lg"><summary className="cursor-pointer font-semibold">Question {qi+1}: {q.type}</summary><div className="mt-3 pt-3 border-t border-slate-600"><p className="mb-2">{q.questionText}</p>{q.options && <ul className="list-disc pl-5 text-sm space-y-1">{q.options.map((opt, oi) => <li key={oi}>{opt}</li>)}</ul>}<p className="mt-3 text-sm text-green-400 bg-slate-800 p-2 rounded-md"><strong>Answer:</strong> {q.answer}</p></div></details>))}</div></div>))}
            </div>}
        </>
    );

    const renderInterviewReviews = () => (
        <>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8 max-w-2xl mx-auto">
                <p className="text-slate-400 mb-4">Get insights from previous campus interview rounds.</p>
                <div className="flex gap-4">
                    <select value={company} onChange={e => setCompany(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md"><option value="" disabled>Select Company</option>{TOP_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                    <button onClick={() => generateContent('reviews')} disabled={isLoading} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-full transition disabled:bg-slate-600 whitespace-nowrap">Get Review</button>
                </div>
            </div>
            {isLoading && <LoadingSpinner />}
            {interviewReview && <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-4">
                <h2 className="text-2xl font-bold text-white">Interview Review: {interviewReview.companyName}</h2>
                <blockquote className="border-l-4 border-sky-500 pl-4 text-slate-300 italic">{interviewReview.summary}</blockquote>
                {interviewReview.rounds.map((round, i) => (<div key={i} className="bg-slate-700/50 p-4 rounded-lg"><h3 className="text-lg font-semibold text-sky-300">{round.roundName}</h3><p className="text-sm text-slate-400 mb-3">{round.description}</p><h4 className="text-sm font-semibold mb-2">Common Questions:</h4><ul className="list-disc pl-5 text-sm space-y-1">{round.commonQuestions.map((q, qi) => <li key={qi}>{q}</li>)}</ul></div>))}
            </div>}
        </>
    );
    
    const renderFaiqs = () => (
        <>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8 max-w-3xl mx-auto">
                <p className="text-slate-400 mb-4">Find frequently asked technical, behavioral, and HR questions.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select value={faiqDomain} onChange={e => setFaiqDomain(e.target.value)} className="bg-slate-700 p-2 rounded-md">{FAIQ_DOMAINS.map(d => <option key={d}>{d}</option>)}</select>
                    <select value={faiqCategory} onChange={e => setFaiqCategory(e.target.value as any)} className="bg-slate-700 p-2 rounded-md"><option value="Technical">Technical</option><option value="Behavioral">Behavioral</option><option value="HR">HR</option></select>
                    <button onClick={() => generateContent('faiqs')} disabled={isLoading} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-full transition disabled:bg-slate-600">Find</button>
                </div>
            </div>
            {isLoading && <LoadingSpinner />}
            {faiqs.length > 0 && <div className="space-y-3">{faiqs.map((f, i) => (<div key={i} className="bg-slate-800/50 p-4 rounded-lg"><p>{f.question}</p></div>))}</div>}
        </>
    );

    const renderPuzzles = () => (
        <>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8 max-w-2xl mx-auto text-center">
                <p className="text-slate-400 mb-4">Sharpen your logical reasoning with mind games and puzzles.</p>
                <button onClick={() => generateContent('puzzles')} disabled={isLoading} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-full transition disabled:bg-slate-600">Generate a Puzzle</button>
            </div>
            {isLoading && <LoadingSpinner />}
            {puzzle && <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-4">
                <h2 className="text-2xl font-bold text-white">{puzzle.title}</h2>
                <p className="text-slate-300">{puzzle.description}</p>
                <details className="bg-slate-700/50 p-3 rounded-lg"><summary className="cursor-pointer font-semibold text-amber-400">Hint</summary><p className="mt-2 pt-2 border-t border-slate-600">{puzzle.hint}</p></details>
                <details className="bg-slate-700/50 p-3 rounded-lg"><summary className="cursor-pointer font-semibold text-green-400">Solution</summary><p className="mt-2 pt-2 border-t border-slate-600">{puzzle.solution}</p></details>
            </div>}
        </>
    );

    const renderGuides = () => (
        <>
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8 max-w-2xl mx-auto">
                <p className="text-slate-400 mb-4">Access guides on resume tips, group discussions, and more.</p>
                <div className="flex gap-4">
                    <select value={guideTopic} onChange={e => setGuideTopic(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md">{CAREER_GUIDE_TOPICS.map(t => <option key={t}>{t}</option>)}</select>
                    <button onClick={() => generateContent('guides')} disabled={isLoading} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-full transition disabled:bg-slate-600 whitespace-nowrap">Get Guide</button>
                </div>
            </div>
            {isLoading && <LoadingSpinner />}
            {guide && <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700"><h2 className="text-2xl font-bold text-white mb-4">{guide.title}</h2><SimpleMarkdown text={guide.content} /></div>}
        </>
    );

    const tabContent = {
        coding: renderCodingChallenge,
        campusTests: renderCampusTests,
        reviews: renderInterviewReviews,
        faiqs: renderFaiqs,
        puzzles: renderPuzzles,
        guides: renderGuides,
    };

    const tabs: { id: HubView, label: string }[] = [
        { id: 'coding', label: 'Coding Challenge' },
        { id: 'campusTests', label: 'Campus Tests' },
        { id: 'reviews', label: 'Interview Reviews' },
        { id: 'faiqs', label: 'FAIQs' },
        { id: 'puzzles', label: 'Puzzles' },
        { id: 'guides', label: 'Guides' },
    ];
    
    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-sky-300 mb-2">Interview Preparation</h2>
                <p className="text-slate-400">All the tools you need for campus placement success.</p>
            </div>

            <div className="mb-6 overflow-x-auto">
                <div className="flex justify-center border-b border-slate-700">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setView(tab.id)} className={`px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${view === tab.id ? 'border-b-2 border-sky-400 text-sky-300' : 'text-slate-400 hover:text-white'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="mt-4">
                {error && <p className="text-red-400 text-center bg-red-900/50 p-3 rounded-lg">{error}</p>}
                {tabContent[view]()}
            </div>
        </div>
    );
};

export default ChallengeBankFeature;