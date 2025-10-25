import React, { useState, useEffect, useMemo } from 'react';
import { generateDashboardSuggestions } from '../services/geminiService';
import type { Student, DashboardSuggestion, StudentProfile } from '../types';
import type { View } from '../App';

interface DashboardFeatureProps {
    student: Student;
    setView: (view: View) => void;
}

// Icons for different sections
const SuggestionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const RoadmapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 10V7m0 10L9 7" /></svg>;
const ChallengeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
const InterviewIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const LinkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>;


const LoadingSpinner: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center space-y-4 my-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-sky-400"></div>
        <p className="text-sky-300">{text}</p>
    </div>
);

const getActionForSuggestion = (suggestion: DashboardSuggestion): { view: View; label: string } | null => {
    const text = (suggestion.title + ' ' + suggestion.actionableStep).toLowerCase();
    if (text.includes('challenge')) return { view: 'challenges', label: 'Go to Challenges' };
    if (text.includes('interview')) return { view: 'interview', label: 'Go to Interview' };
    if (text.includes('roadmap')) return { view: 'roadmap', label: 'Go to Roadmap' };
    if (text.includes('soft skill')) return { view: 'soft-skills', label: 'Go to Soft Skills' };
    if (text.includes('project')) return { view: 'projects', label: 'Go to Projects' };
    if (text.includes('resume')) return { view: 'resume', label: 'Go to Resume' };
    return null;
};

// Helper to calculate profile completion
const calculateProfileCompletion = (profile: StudentProfile): number => {
    const requiredFields = [
        profile.personal.fullName,
        profile.personal.dateOfBirth,
        profile.personal.contactNumber,
        profile.personal.email,
        profile.college.collegeName,
        profile.college.branch,
        profile.college.yearOfStudy,
        profile.college.enrollmentNumber,
        profile.college.cgpa,
        profile.college.collegeEmail,
        profile.interests.participatedInCampusInterview,
        profile.interests.jobRoleInterests,
    ];
    const totalFields = requiredFields.length;
    const filledFields = requiredFields.filter(field => field && String(field).trim() !== '').length;
    return Math.round((filledFields / totalFields) * 100);
};

const DashboardFeature: React.FC<DashboardFeatureProps> = ({ student, setView }) => {
    const { roadmap, completedMilestones, interviewHistory, integrations, challengeHistory, profile } = student;
    const [suggestions, setSuggestions] = useState<DashboardSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const analytics = useMemo(() => {
        const totalMilestones = roadmap?.years.reduce((acc, year) => acc + year.semesters.reduce((sAcc, sem) => sAcc + sem.milestones.length, 0), 0) || 0;
        const roadmapProgress = totalMilestones > 0 ? (completedMilestones.length / totalMilestones) * 100 : 0;

        const challengesCompleted = challengeHistory.length;
        const challengeDifficultyCounts = challengeHistory.reduce((acc, ch) => {
            acc[ch.difficulty] = (acc[ch.difficulty] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const interviewsCompleted = interviewHistory.length;
        const avgInterviewScore = interviewsCompleted > 0 ? interviewHistory.reduce((acc, i) => acc + i.feedback.overallScore, 0) / interviewsCompleted : 0;
        
        return { totalMilestones, roadmapProgress, challengesCompleted, challengeDifficultyCounts, interviewsCompleted, avgInterviewScore };
    }, [roadmap, completedMilestones, challengeHistory, interviewHistory]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            setIsLoading(true);
            setError(null);

            const summary = `
- Roadmap: ${completedMilestones.length} of ${analytics.totalMilestones} milestones completed.
- Coding Challenges: ${analytics.challengesCompleted} completed. Breakdown: ${JSON.stringify(analytics.challengeDifficultyCounts)}.
- Mock Interviews: ${analytics.interviewsCompleted} completed with an average score of ${analytics.avgInterviewScore.toFixed(1)}/10.
- Common interview feedback themes (areas for improvement): ${[...new Set(interviewHistory.map(i => i.feedback.areasForImprovement))].join('; ')}
            `;
            
            if (analytics.challengesCompleted === 0 && analytics.interviewsCompleted === 0) {
                 setIsLoading(false);
                 return;
            }

            try {
                const result = await generateDashboardSuggestions(summary);
                setSuggestions(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to get AI suggestions.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSuggestions();
    }, [analytics.totalMilestones, analytics.challengesCompleted, analytics.interviewsCompleted, analytics.avgInterviewScore, JSON.stringify(analytics.challengeDifficultyCounts), JSON.stringify(interviewHistory), JSON.stringify(completedMilestones)]);
    
    const hasIntegrations = Object.values(integrations).some(val => val);
    const profileCompletion = useMemo(() => calculateProfileCompletion(profile), [profile]);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                     <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                        Performance Dashboard
                    </h1>
                     <span className={`px-3 py-1 text-xs font-bold rounded-full ${profile.isVerified ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                        {profile.isVerified ? '✓ Verified' : 'Not Verified'}
                    </span>
                </div>
                <p className="mt-2 text-lg text-slate-400">
                    {student.name}'s progress at a glance, with personalized AI-powered insights.
                </p>
            </div>
            
             {/* Profile Completion CTA */}
            {profileCompletion < 100 && (
                <div className="bg-sky-900/50 border border-sky-700 p-6 rounded-2xl shadow-lg">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-sky-200">Complete Your Career Profile!</h3>
                            <p className="text-sky-300/80 mt-1">Fill out your profile to unlock personalized career recommendations and improve your placement readiness.</p>
                            <div className="mt-3 flex items-center gap-3">
                                <div className="w-full bg-slate-700 rounded-full h-2.5">
                                    <div className="bg-sky-400 h-2.5 rounded-full" style={{ width: `${profileCompletion}%` }}></div>
                                </div>
                                <span className="text-sm font-semibold text-sky-300">{profileCompletion}%</span>
                            </div>
                        </div>
                        <button onClick={() => setView('career')} className="bg-white text-sky-700 font-bold py-2 px-6 rounded-full transition-transform transform hover:scale-105 whitespace-nowrap">
                            Complete Profile &rarr;
                        </button>
                    </div>
                </div>
            )}


            {/* AI Suggestions Section */}
            <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
                <h2 className="flex items-center text-2xl font-bold text-sky-300 mb-4"><SuggestionIcon /><span className="ml-2">AI-Powered Suggestions</span></h2>
                {isLoading && <LoadingSpinner text="Analyzing your progress..." />}
                {error && <p className="text-red-400">{error}</p>}
                {!isLoading && suggestions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {suggestions.map((s, i) => {
                            const action = getActionForSuggestion(s);
                            return (
                                <div key={i} className="bg-slate-700/50 p-4 rounded-lg flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-semibold text-white">{s.title}</h3>
                                        <p className="text-sm text-slate-300 my-2">{s.reasoning}</p>
                                        <p className="text-sm font-semibold text-sky-400 bg-slate-800 p-2 rounded-md">Next Step: {s.actionableStep}</p>
                                    </div>
                                    {action && (
                                        <button 
                                            onClick={() => setView(action.view)}
                                            className="mt-4 w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-md text-sm transition"
                                        >
                                            {action.label} &rarr;
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
                 {!isLoading && !error && suggestions.length === 0 && (
                    <p className="text-slate-400">Complete some challenges or interviews to get personalized suggestions from AI!</p>
                 )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                {/* Roadmap Progress */}
                <div className="lg:col-span-1 xl:col-span-1 bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h3 className="flex items-center font-bold text-lg text-green-300 mb-3"><RoadmapIcon /><span className="ml-2">Roadmap Progress</span></h3>
                    {roadmap ? (
                        <>
                            <p className="text-3xl font-bold text-white">{completedMilestones.length} <span className="text-xl text-slate-400">/ {analytics.totalMilestones} Milestones</span></p>
                            <div className="w-full bg-slate-700 rounded-full h-2.5 mt-3">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${analytics.roadmapProgress}%` }}></div>
                            </div>
                        </>
                    ) : <p className="text-slate-400">Generate a roadmap to track progress.</p>}
                </div>

                {/* Challenge Analytics */}
                <div className="lg:col-span-1 xl:col-span-1 bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h3 className="flex items-center font-bold text-lg text-purple-300 mb-3"><ChallengeIcon /><span className="ml-2">Challenge Analytics</span></h3>
                    <p className="text-3xl font-bold text-white">{analytics.challengesCompleted} <span className="text-xl text-slate-400">Completed</span></p>
                    <div className="flex space-x-4 mt-3 text-sm">
                        {Object.entries(analytics.challengeDifficultyCounts).map(([diff, count]) => (
                            <div key={diff}>
                                <span className="font-semibold text-slate-300">{diff}:</span>
                                <span className="text-white ml-1">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Interview Readiness */}
                <div className="lg:col-span-1 xl:col-span-1 bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h3 className="flex items-center font-bold text-lg text-yellow-300 mb-3"><InterviewIcon /><span className="ml-2">Interview Readiness</span></h3>
                     <p className="text-3xl font-bold text-white">{analytics.interviewsCompleted} <span className="text-xl text-slate-400">Sessions</span></p>
                     {analytics.interviewsCompleted > 0 && (
                        <p className="mt-3 text-slate-300">Average Score: <span className="font-bold text-white">{analytics.avgInterviewScore.toFixed(1)}/10</span></p>
                     )}
                </div>

                 {/* External Profiles */}
                <div className="lg:col-span-1 xl:col-span-1 bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h3 className="flex items-center font-bold text-lg text-teal-300 mb-3">External Profiles</h3>
                    {hasIntegrations ? (
                         <div className="space-y-2">
                             {integrations.github && <a href={`https://github.com/${integrations.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-sm p-2 bg-slate-700/50 rounded-md hover:bg-slate-700"><span>GitHub: <strong>{integrations.github}</strong></span><LinkIcon/></a>}
                             {integrations.linkedin && <a href={integrations.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-sm p-2 bg-slate-700/50 rounded-md hover:bg-slate-700"><span>LinkedIn Profile</span><LinkIcon/></a>}
                             {integrations.leetcode && <a href={integrations.leetcode} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-sm p-2 bg-slate-700/50 rounded-md hover:bg-slate-700"><span>LeetCode Profile</span><LinkIcon/></a>}
                             {integrations.hackerrank && <a href={integrations.hackerrank} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between text-sm p-2 bg-slate-700/50 rounded-md hover:bg-slate-700"><span>HackerRank Profile</span><LinkIcon/></a>}
                         </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-slate-400 text-sm mb-3">Connect your professional profiles.</p>
                            <button onClick={() => setView('integrations')} className="bg-teal-600/50 text-teal-200 font-semibold py-2 px-4 rounded-md text-sm">Go to Integrations</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardFeature;