import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ROLES, INTERVIEW_TYPES, MENTORS, LANGUAGES } from '../constants';
import { generateInterviewQuestions, evaluateAnswer, generateCodingChallenge, evaluateCodeSolution } from '../services/geminiService';
import type { InterviewQuestion, Feedback, CompletedInterview, InterviewType, CodingChallenge, ChallengeFeedback } from '../types';
import RecruiterChatbot from './RecruiterChatbot';

const uid = () => `interview_${Date.now()}`;
const ASSESSMENT_DURATION = 1800; // 30 minutes in seconds
const SIMULATION_DURATION = 3600; // 60 minutes in seconds

type SimulationStage = 
    | { type: 'qa', questions: InterviewQuestion[], title: string }
    | { type: 'coding', challenge: CodingChallenge, title: string };


// A simple markdown-to-HTML parser for descriptions
const SimpleMarkdown = ({ text }: { text: string }) => {
    const html = text
        .replace(/`([^`]+)`/g, '<code class="bg-slate-700 text-sky-300 font-mono rounded px-1 py-0.5">$&</code>')
        .replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre class="bg-slate-900/50 p-3 rounded-md my-2 text-sm"><code class="language-$1">$2</code></pre>')
        .replace(/\n/g, '<br />');
    return <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: html }} />;
};

const SessionTypeIcons: { [key in string]: React.FC<{ className: string }> } = {
    'Full Simulation': ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    'Live Coding Assessment': ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    'Technical Deep Dive': ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    'Behavioral Focus': ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V10a2 2 0 012-2h8z" /></svg>,
    'General': ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>,
    'Company-Specific': ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
};


interface InterviewFeatureProps {
    onAddToHistory: (interview: CompletedInterview) => void;
}

const InterviewFeature: React.FC<InterviewFeatureProps> = ({ onAddToHistory }) => {
    const [role, setRole] = useState<string>(ROLES[0]);
    const [interviewType, setInterviewType] = useState<InterviewType>('Full Simulation');
    const [companyName, setCompanyName] = useState<string>('');
    const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
    
    // State for Q&A interviews
    const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [currentAnswer, setCurrentAnswer] = useState<string>('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    
    // State for Live Coding Assessment
    const [currentChallenge, setCurrentChallenge] = useState<CodingChallenge | null>(null);
    const [userSolution, setUserSolution] = useState<string>('');
    const [codeFeedback, setCodeFeedback] = useState<ChallengeFeedback | null>(null);
    const [language, setLanguage] = useState<string>(LANGUAGES[0]);
    const [showHint, setShowHint] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    
    // State for Full Simulation
    const [simulationStages, setSimulationStages] = useState<SimulationStage[]>([]);
    const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
    const [simulationTimeLeft, setSimulationTimeLeft] = useState<number | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    // State for booking
    const [scheduleWithMentor, setScheduleWithMentor] = useState<boolean>(false);
    const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [bookingConfirmation, setBookingConfirmation] = useState<string | null>(null);

    // State for chatbot
    const [isChatbotActive, setIsChatbotActive] = useState<boolean>(false);

    const selectedMentor = useMemo(() => MENTORS.find(m => m.id === selectedMentorId), [selectedMentorId]);

    // Timer effect for coding assessment and full simulation
    useEffect(() => {
        if (!isSessionActive) return;

        let timer: ReturnType<typeof setInterval>;
        if (interviewType === 'Live Coding Assessment' && timeLeft !== null && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => (prev ? prev - 1 : 0)), 1000);
        } else if (interviewType === 'Full Simulation' && simulationTimeLeft !== null && simulationTimeLeft > 0) {
             timer = setInterval(() => setSimulationTimeLeft(prev => (prev ? prev - 1 : 0)), 1000);
        }

        return () => clearInterval(timer);
    }, [isSessionActive, interviewType, timeLeft, simulationTimeLeft]);

    const handleStartInterview = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setFeedback(null);
        setCurrentAnswer('');
        setBookingConfirmation(null);
        setCurrentChallenge(null);
        setCodeFeedback(null);
        setUserSolution('');
        setTimeLeft(null);
        setSimulationStages([]);
        setSimulationTimeLeft(null);
        setCurrentStageIndex(0);

        if (interviewType === 'Company-Specific' && !companyName.trim()) {
            setError("Please enter a company name for this interview type.");
            setIsLoading(false);
            return;
        }

        if (scheduleWithMentor) {
            if (!selectedMentorId || !selectedTime) {
                setError("Please select a mentor and a time slot to schedule.");
                setIsLoading(false);
                return;
            }
            const mentor = MENTORS.find(m => m.id === selectedMentorId);
            setBookingConfirmation(`✅ Your session with ${mentor?.name} at ${selectedTime} is confirmed. You can start this self-practice session now.`);
        }

        try {
            if (interviewType === 'Full Simulation') {
                // Generate all stages upfront for the simulation
                const [behavioralQuestions, codingChallenge, technicalQuestions] = await Promise.all([
                    generateInterviewQuestions(role, 'Behavioral Focus'),
                    generateCodingChallenge(role, 'Intermediate'),
                    generateInterviewQuestions(role, 'Technical Deep Dive')
                ]);
                const stages: SimulationStage[] = [
                    { type: 'qa', questions: behavioralQuestions.slice(0, 3), title: 'Behavioral Round' },
                    { type: 'coding', challenge: codingChallenge, title: 'Live Coding Challenge' },
                    { type: 'qa', questions: technicalQuestions.slice(0, 3), title: 'Technical Q&A' },
                ];
                setSimulationStages(stages);
                setQuestions(stages[0].type === 'qa' ? stages[0].questions : []);
                setCurrentQuestionIndex(0);
                setSimulationTimeLeft(SIMULATION_DURATION);
                setIsSessionActive(true);

            } else if (interviewType === 'Live Coding Assessment') {
                const challenge = await generateCodingChallenge(role, 'Intermediate');
                setCurrentChallenge(challenge);
                setIsSessionActive(true);
                setTimeLeft(ASSESSMENT_DURATION);
            } else {
                const fetchedQuestions = await generateInterviewQuestions(role, interviewType, companyName);
                if (fetchedQuestions.length > 0) {
                    setQuestions(fetchedQuestions);
                    setCurrentQuestionIndex(0);
                    setIsSessionActive(true);
                } else {
                    setError("Could not fetch any questions. Please try again.");
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [role, interviewType, companyName, scheduleWithMentor, selectedMentorId, selectedTime]);

    const handleAnswerSubmit = useCallback(async () => {
        if (!currentAnswer.trim()) {
            setError("Please provide an answer.");
            return;
        }
        setIsEvaluating(true);
        setError(null);
        setFeedback(null);
        try {
            const currentQuestion = questions[currentQuestionIndex];
            const result = await evaluateAnswer(role, currentQuestion.question, currentAnswer);
            setFeedback(result);
            
            const completedInterview: CompletedInterview = {
                id: uid(),
                question: currentQuestion,
                answer: currentAnswer,
                feedback: result,
                completedAt: new Date().toISOString()
            };
            onAddToHistory(completedInterview);

        } catch (err) {
             setError(err instanceof Error ? err.message : "Failed to get feedback.");
        } finally {
            setIsEvaluating(false);
        }
    }, [currentAnswer, questions, currentQuestionIndex, role, onAddToHistory]);
    
    const handleEvaluateSolution = useCallback(async () => {
        if (!userSolution.trim() || !currentChallenge) return;
        setIsEvaluating(true);
        setError(null);
        setCodeFeedback(null);
        if (interviewType === 'Live Coding Assessment') setTimeLeft(null); // Stop the individual timer
        try {
            const result = await evaluateCodeSolution(currentChallenge, userSolution, language);
            setCodeFeedback(result);
            // Note: We are not adding coding assessments to the regular interview history for now.
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to evaluate the solution.");
        } finally {
            setIsEvaluating(false);
        }
    }, [currentChallenge, userSolution, language, interviewType]);

    const handleNextQuestion = () => {
        const isLastQuestionInStage = currentQuestionIndex >= questions.length - 1;

        if (interviewType !== 'Full Simulation' && isLastQuestionInStage) {
            handleEndInterview();
            return;
        }
        
        if (!isLastQuestionInStage) {
            setCurrentQuestionIndex(prev => prev + 1);
            setCurrentAnswer('');
            setFeedback(null);
            setError(null);
        }
    };

    const handleNextStage = () => {
        if (currentStageIndex < simulationStages.length - 1) {
            const nextStageIndex = currentStageIndex + 1;
            const nextStage = simulationStages[nextStageIndex];
            
            // Reset relevant states before moving to the next stage
            setFeedback(null);
            setCodeFeedback(null);
            setCurrentAnswer('');
            setUserSolution('');
            setError(null);
            
            if (nextStage.type === 'qa') {
                setQuestions(nextStage.questions);
                setCurrentQuestionIndex(0);
                setCurrentChallenge(null);
            } else if (nextStage.type === 'coding') {
                setCurrentChallenge(nextStage.challenge);
                setQuestions([]);
                setCurrentQuestionIndex(0);
            }
            setCurrentStageIndex(nextStageIndex);
        } else {
            handleEndInterview(); // Simulation is over
        }
    };

    const handleEndInterview = () => {
        setIsSessionActive(false);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setCurrentAnswer('');
        setFeedback(null);
        setInterviewType('Full Simulation');
        setCompanyName('');
        setScheduleWithMentor(false);
        setSelectedMentorId(null);
        setSelectedTime(null);
        setBookingConfirmation(null);
        setIsChatbotActive(false);
        setCurrentChallenge(null);
        setUserSolution('');
        setCodeFeedback(null);
        setTimeLeft(null);
        setShowHint(false);
        setSimulationStages([]);
        setCurrentStageIndex(0);
        setSimulationTimeLeft(null);
    };
    
    // UI Rendering
    if (isChatbotActive) {
        return <RecruiterChatbot onEnd={() => setIsChatbotActive(false)} />;
    }

    if (!isSessionActive) {
        return (
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-sky-300 mb-2">Hire Slot</h2>
                <p className="text-slate-400 mb-6">Practice a mock interview. Select your desired role and session type to begin.</p>
                
                <div className="space-y-6">
                     <div>
                        <label className="block text-sm font-medium text-sky-300 mb-2">
                            Session Type
                        </label>
                         <div className="space-y-3">
                            {INTERVIEW_TYPES.map(type => {
                                const Icon = SessionTypeIcons[type.id];
                                return (
                                    <button
                                        key={type.id}
                                        onClick={() => setInterviewType(type.id as InterviewType)}
                                        className={`w-full p-4 rounded-lg text-left transition border-2 flex items-center gap-4 ${interviewType === type.id ? 'bg-sky-900/50 border-sky-500' : 'bg-slate-700/50 border-transparent hover:border-slate-500'}`}
                                    >
                                        {Icon && (
                                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-slate-800/50 rounded-lg">
                                                <Icon className="w-6 h-6 text-sky-400" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-white">{type.name}</p>
                                            <p className="text-xs text-slate-400 mt-1">{type.description}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="role-interview" className="block text-sm font-medium text-sky-300 mb-2">
                            Target Role
                        </label>
                        <select
                            id="role-interview"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-slate-700 text-white border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 transition"
                        >
                            {ROLES.map((r) => (<option key={r} value={r}>{r}</option>))}
                        </select>
                    </div>

                    {interviewType === 'Company-Specific' && (
                         <div className="animate-fade-in">
                            <label htmlFor="company-name" className="block text-sm font-medium text-sky-300 mb-2">Company Name</label>
                            <input id="company-name" type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g., Google, Amazon"
                                className="w-full bg-slate-700 text-white border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 transition" />
                        </div>
                    )}
                </div>

                {/* Mentor Scheduling Section */}
                <div className="mt-8 border-t border-slate-700 pt-6">
                    <div className="flex items-center">
                        <input 
                            type="checkbox" 
                            id="schedule-mentor" 
                            checked={scheduleWithMentor} 
                            onChange={(e) => setScheduleWithMentor(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                        />
                        <label htmlFor="schedule-mentor" className="ml-3 block text-sm font-medium text-white">
                            Schedule a session with a mentor?
                        </label>
                    </div>

                    {scheduleWithMentor && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                            <div>
                                <label htmlFor="mentor-select" className="block text-sm font-medium text-sky-300 mb-2">Mentor</label>
                                <select 
                                    id="mentor-select" 
                                    value={selectedMentorId || ''} 
                                    onChange={(e) => {
                                        setSelectedMentorId(e.target.value);
                                        setSelectedTime(null); // Reset time when mentor changes
                                    }}
                                    className="w-full bg-slate-700 text-white border-slate-600 rounded-md"
                                >
                                    <option value="" disabled>Select a mentor</option>
                                    {MENTORS.map(mentor => (
                                        <option key={mentor.id} value={mentor.id}>{mentor.name} - {mentor.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="time-select" className="block text-sm font-medium text-sky-300 mb-2">Available Time</label>
                                <select 
                                    id="time-select" 
                                    value={selectedTime || ''}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    disabled={!selectedMentor}
                                    className="w-full bg-slate-700 text-white border-slate-600 rounded-md disabled:bg-slate-800"
                                >
                                    <option value="" disabled>Select a time</option>
                                    {selectedMentor?.timeSlots.map(time => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>


                <div className="mt-8 text-center">
                    {error && <p className="text-red-400 mb-4">{error}</p>}
                    {bookingConfirmation && !isSessionActive && <p className="text-green-400 mb-4 animate-fade-in">{bookingConfirmation}</p>}
                    <button
                        onClick={handleStartInterview}
                        disabled={isLoading}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Preparing...' : '🚀 Start Session'}
                    </button>
                </div>
                 
                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-slate-600"></div>
                    <span className="flex-shrink mx-4 text-slate-400">OR</span>
                    <div className="flex-grow border-t border-slate-600"></div>
                </div>
                
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">Recruiter & HR Simulation</h3>
                    <p className="text-slate-400 text-sm mt-1 mb-4">Practice communication by chatting with an AI recruiter.</p>
                    <button onClick={() => setIsChatbotActive(true)} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105">
                        💬 Chat with a Recruiter Bot
                    </button>
                </div>
            </div>
        );
    }
    
    // Reusable UI components for Q&A and Coding
    const QAndAView = () => {
        const currentQuestion = questions[currentQuestionIndex];
        const isLastQuestionInStage = currentQuestionIndex >= questions.length - 1;
        const getCategoryChipClass = (category: string) => ({
            'Technical': 'bg-blue-900/50 text-blue-300',
            'Behavioral': 'bg-purple-900/50 text-purple-300',
            'System Design': 'bg-teal-900/50 text-teal-300',
            'Algorithm': 'bg-rose-900/50 text-rose-300',
        }[category] || 'bg-slate-700 text-slate-300');

        return (
            <div className="space-y-8">
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-white">Question {currentQuestionIndex + 1} / {questions.length}</h2>
                        {interviewType !== 'Full Simulation' && <button onClick={handleEndInterview} className="text-slate-400 hover:text-red-400 transition-colors text-sm">End Session</button>}
                    </div>
                    <div className="mb-4">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getCategoryChipClass(currentQuestion.category)}`}>
                            {currentQuestion.category}
                        </span>
                    </div>
                    <p className="text-xl text-slate-200 leading-relaxed">{currentQuestion.question}</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="text-xl font-semibold text-sky-400 mb-4">Your Answer</h3>
                    <textarea value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)} placeholder="Type your answer here..." disabled={!!feedback || isEvaluating} rows={8} className="w-full bg-slate-700/50 text-slate-200 p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-sky-500 transition disabled:bg-slate-800" />
                    {error && !feedback && <p className="text-red-400 mt-2">{error}</p>}
                    
                    {!feedback && (
                        <div className="mt-4 text-right">
                            <button onClick={handleAnswerSubmit} disabled={isEvaluating} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-full transition disabled:bg-slate-600">
                                {isEvaluating ? 'Evaluating...' : 'Submit Answer'}
                            </button>
                        </div>
                    )}
                    
                    {isEvaluating && <div className="text-center py-6"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-400 mx-auto"></div><p className="text-sky-300 mt-3">AI is analyzing your response...</p></div>}
                    
                    {feedback && (
                         <div className="mt-6 border-t-2 border-slate-700 pt-6 animate-fade-in">
                            <h3 className="text-2xl font-bold text-white mb-4">Feedback</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <div className="md:col-span-1 flex flex-col items-center justify-center bg-slate-700/50 p-4 rounded-lg"><p className="text-slate-300 text-sm mb-1">Overall Score</p><p className="text-4xl font-bold text-sky-300">{feedback.overallScore}<span className="text-2xl text-slate-400">/10</span></p></div>
                                <div className="md:col-span-3 bg-slate-700/50 p-4 rounded-lg"><h4 className="font-semibold text-green-400 mb-2">✅ Strengths</h4><p className="text-slate-300 text-sm">{feedback.strengths}</p></div>
                            </div>
                            <div className="bg-slate-700/50 p-4 rounded-lg mb-4"><h4 className="font-semibold text-amber-400 mb-2">💡 Areas for Improvement</h4><p className="text-slate-300 text-sm">{feedback.areasForImprovement}</p></div>
                            <div className="bg-slate-700/50 p-4 rounded-lg"><h4 className="font-semibold text-sky-400 mb-2">⭐ Suggested Answer</h4><p className="text-slate-300 text-sm leading-relaxed">{feedback.suggestedAnswer}</p></div>
                             {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

                            <div className="mt-4 text-right">
                                {isLastQuestionInStage ? (
                                    interviewType === 'Full Simulation' ? 
                                    <button onClick={handleNextStage} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-full transition">Next Stage &rarr;</button> :
                                    <button onClick={handleEndInterview} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-full transition">Finish Interview</button>
                                ) : (
                                    <button onClick={handleNextQuestion} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-full transition">Next Question</button>
                                )}
                            </div>
                         </div>
                    )}
                </div>
            </div>
        );
    };

    const CodingAssessmentView = ({ isSimulation }: { isSimulation: boolean }) => {
        const timer = isSimulation ? null : timeLeft; // Only use individual timer in standalone mode
        const minutes = timer !== null ? Math.floor(timer / 60) : 0;
        const seconds = timer !== null ? timer % 60 : 0;
        return (
            <div className="space-y-6">
                {!isSimulation && <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Live Coding Assessment</h2>
                    <div className="flex items-center gap-4">
                        <div className={`text-lg font-mono px-3 py-1 rounded-md ${timer < 300 ? 'bg-red-500/20 text-red-300' : 'bg-slate-700 text-white'}`}>
                           ⏳ {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </div>
                        <button onClick={handleEndInterview} className="text-slate-400 hover:text-red-400 transition-colors text-sm">End Session</button>
                    </div>
                </div>}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 h-fit lg:max-h-[75vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold text-sky-300 mb-4">{currentChallenge.title}</h3>
                        <div className="text-slate-300 space-y-4"><SimpleMarkdown text={currentChallenge.description} /><div><strong>Examples:</strong>{currentChallenge.examples.map((ex, i) => (<pre key={i} className="bg-slate-900/50 p-2 rounded-md text-sm mt-2">Input: {ex.input}<br/>Output: {ex.output}</pre>))}</div><div><strong>Constraints:</strong><ul className="list-disc pl-5 text-sm">{currentChallenge.constraints.map((c, i) => <li key={i}>{c}</li>)}</ul></div></div>
                        <div className="mt-4 border-t border-slate-700 pt-4"><button onClick={() => setShowHint(!showHint)} className="text-amber-400 text-sm">{showHint ? 'Hide' : 'Show'} Hint</button>{showHint && <p className="mt-2 text-sm text-amber-500 bg-slate-700/50 p-2 rounded-md">{currentChallenge.hint}</p>}</div>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold text-sky-400">Your Solution</h3><select value={language} onChange={e => setLanguage(e.target.value)} className="bg-slate-700 text-sm rounded-md p-1">{LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}</select></div>
                        <textarea value={userSolution} onChange={e => setUserSolution(e.target.value)} disabled={isEvaluating || !!codeFeedback} rows={15} className="w-full bg-slate-900/50 font-mono text-sm p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-sky-500 disabled:bg-slate-800"></textarea>
                        {error && !codeFeedback && <p className="text-red-400 mt-2">{error}</p>}
                        {isEvaluating && <div className="text-center py-4"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-400 mx-auto"></div><p className="mt-3 text-sky-300">AI is reviewing your code...</p></div>}
                        {!codeFeedback && !isEvaluating && <button onClick={handleEvaluateSolution} disabled={!userSolution.trim()} className="mt-4 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-full transition disabled:bg-slate-600">Submit & Evaluate</button>}
                        {codeFeedback && (
                            <div className="mt-4 space-y-4 animate-fade-in max-h-[60vh] overflow-y-auto">
                               <h3 className="text-xl font-bold text-white">AI Code Review</h3>
                                <div><h4 className="font-semibold text-green-400">Correctness</h4><p className="text-sm text-slate-300">{codeFeedback.correctness}</p></div>
                                <div><h4 className="font-semibold text-blue-400">Efficiency (Big O)</h4><p className="text-sm text-slate-300">{codeFeedback.efficiency}</p></div>
                                <div><h4 className="font-semibold text-purple-400">Code Quality</h4><p className="text-sm text-slate-300">{codeFeedback.codeQuality}</p></div>
                                <div><h4 className="font-semibold text-sky-400">Suggested Solution</h4><SimpleMarkdown text={`\`\`\`${language.toLowerCase()}\n${codeFeedback.suggestedSolution}\n\`\`\``} /></div>
                                <button onClick={isSimulation ? handleNextStage : handleEndInterview} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-full transition">{isSimulation ? 'Next Stage →' : 'Back to Setup'}</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Main Session View
    if (isSessionActive) {
        if (interviewType === 'Full Simulation') {
            const currentStage = simulationStages[currentStageIndex];
            const simMinutes = Math.floor(simulationTimeLeft / 60);
            const simSeconds = simulationTimeLeft % 60;

            return (
                <div className="w-full max-w-7xl mx-auto space-y-6">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-white">Full Interview Simulation</h2>
                            <p className="text-sky-300 text-sm">Stage {currentStageIndex + 1}/{simulationStages.length}: {currentStage.title}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`text-lg font-mono px-3 py-1 rounded-md ${simulationTimeLeft < 600 ? 'bg-red-500/20 text-red-300' : 'bg-slate-700 text-white'}`}>
                               ⏳ Total Time: {String(simMinutes).padStart(2, '0')}:{String(simSeconds).padStart(2, '0')}
                            </div>
                            <button onClick={handleEndInterview} className="text-slate-400 hover:text-red-400 transition-colors text-sm">End Simulation</button>
                        </div>
                    </div>
                    {currentStage.type === 'qa' && questions.length > 0 && <QAndAView />}
                    {currentStage.type === 'coding' && currentChallenge && <CodingAssessmentView isSimulation={true} />}
                </div>
            );
        }

        if (interviewType === 'Live Coding Assessment' && currentChallenge) {
            return <div className="w-full max-w-7xl mx-auto"><CodingAssessmentView isSimulation={false} /></div>;
        }

        if (questions.length > 0) {
            return <div className="w-full max-w-4xl mx-auto"><QAndAView /></div>;
        }
    }
    
    // Fallback or initial loading state, should ideally not be seen unless something is wrong.
    return <div>Loading session...</div>;
};

export default InterviewFeature;