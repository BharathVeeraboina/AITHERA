import React, { useState, useEffect } from 'react';
import { ROLES } from '../constants';
import type { ResumeData, PersonalDetails, WorkExperience, Education, Project, Integrations, GitHubRepo, AIResumeAnalysis, User, Student } from '../types';
import { analyzeResumeWithAI } from '../services/geminiService';
import { fetchGitHubRepos } from '../services/githubService';
import { mockAIAnalysis } from '../data/mockData';

// Helper to create a unique ID
const uid = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// SVG Icons for the Analysis Section
const ImprovementIcons: { [key: string]: React.FC<{ className?: string }> } = {
    Summary: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    Experience: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    Projects: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 002 2z" /></svg>,
    Skills: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Education: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-5.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" /></svg>,
    Formatting: ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
};


// Sub-components for form sections for better organization
const PersonalDetailsForm = ({ data, setData }: { data: PersonalDetails, setData: (d: PersonalDetails) => void }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(data).map((key) => (
            <div key={key}>
                <label className="text-sm text-sky-300 capitalize">{key}</label>
                <input
                    type="text"
                    value={data[key as keyof PersonalDetails]}
                    onChange={(e) => setData({ ...data, [key]: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-700 rounded-md border border-slate-600 focus:ring-sky-500"
                />
            </div>
        ))}
    </div>
);

// Generic component for adding/editing list items (Experience, Education, Projects)
const ListItemForm = <T extends { id: string }>({
    items,
    setItems,
    title,
    renderForm,
    newItem,
}: {
    items: T[];
    setItems: (items: T[]) => void;
    title: string;
    renderForm: (item: T, onChange: (updatedItem: T) => void) => React.ReactNode;
    newItem: () => T;
}) => {
    const handleUpdate = (updatedItem: T) => {
        setItems(items.map(item => item.id === updatedItem.id ? updatedItem : item));
    };
    const handleAdd = () => setItems([...items, newItem()]);
    const handleRemove = (id: string) => setItems(items.filter(item => item.id !== id));

    return (
        <div>
            {items.map(item => (
                <div key={item.id} className="p-4 mb-4 bg-slate-900/50 rounded-lg relative">
                    <button onClick={() => handleRemove(item.id)} className="absolute top-2 right-2 text-red-400">&times;</button>
                    {renderForm(item, handleUpdate)}
                </div>
            ))}
            <button onClick={handleAdd} className="text-sky-400 font-semibold">+ Add {title}</button>
        </div>
    );
};

// Resume Preview Component
const ResumePreview = ({ resume }: { resume: ResumeData }) => (
    <div id="resume-preview" className="bg-white text-gray-800 p-8 font-serif">
        <header className="text-center mb-6">
            <h1 className="text-4xl font-bold">{resume.personalDetails.name}</h1>
            <p className="text-sm">
                {resume.personalDetails.email} | {resume.personalDetails.phone} | {resume.personalDetails.linkedin} | {resume.personalDetails.github}
            </p>
        </header>
        <section>
            <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Professional Summary</h2>
            <p className="text-sm">{resume.summary}</p>
        </section>
        <section className="mt-4">
            <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
                {resume.skills.map(skill => <span key={skill} className="bg-gray-200 text-sm px-2 py-1 rounded">{skill}</span>)}
            </div>
        </section>
        <section className="mt-4">
            <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Experience</h2>
            {resume.experience.map(exp => (
                <div key={exp.id} className="mb-3">
                    <h3 className="font-bold">{exp.jobTitle} | {exp.company}</h3>
                    <p className="text-sm italic">{exp.startDate} - {exp.endDate} | {exp.location}</p>
                    <ul className="list-disc pl-5 mt-1 text-sm">
                        {exp.description.split('\n').filter(Boolean).map((line, i) => <li key={i}>{line.replace(/^- /, '').trim()}</li>)}
                    </ul>
                </div>
            ))}
        </section>
        <section className="mt-4">
            <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Projects</h2>
            {resume.projects.map(proj => (
                 <div key={proj.id} className="mb-3">
                    <h3 className="font-bold">{proj.name}</h3>
                    <p className="text-sm italic">{proj.technologies}</p>
                    <p className="text-sm italic">Repo: {proj.repoUrl} | Live: {proj.liveUrl}</p>
                     <ul className="list-disc pl-5 mt-1 text-sm">
                        {proj.description.split('\n').filter(Boolean).map((line, i) => <li key={i}>{line.replace(/^- /, '').trim()}</li>)}
                    </ul>
                </div>
            ))}
        </section>
        <section className="mt-4">
            <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Education</h2>
            {resume.education.map(edu => (
                <div key={edu.id} className="mb-2">
                    <h3 className="font-bold">{edu.institution} - {edu.degree} in {edu.fieldOfStudy}</h3>
                    <p className="text-sm italic">Graduated: {edu.graduationDate}</p>
                </div>
            ))}
        </section>
        {resume.teacherFeedback && (
            <section className="mt-4 bg-yellow-100 p-4 border-l-4 border-yellow-500">
                <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-1 mb-2">Teacher Feedback</h2>
                <p className="text-sm italic">{resume.teacherFeedback}</p>
            </section>
        )}
    </div>
);

const GitHubImportModal = ({ username, onImport, onClose }: { username: string, onImport: (repos: GitHubRepo[]) => void, onClose: () => void }) => {
    const [repos, setRepos] = useState<GitHubRepo[]>([]);
    const [selectedRepos, setSelectedRepos] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadRepos = async () => {
            try {
                const fetchedRepos = await fetchGitHubRepos(username);
                setRepos(fetchedRepos);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setIsLoading(false);
            }
        };
        loadRepos();
    }, [username]);

    const handleToggleRepo = (repoId: number) => {
        setSelectedRepos(prev => 
            prev.includes(repoId) ? prev.filter(id => id !== repoId) : [...prev, repoId]
        );
    };

    const handleConfirmImport = () => {
        const toImport = repos.filter(repo => selectedRepos.includes(repo.id));
        onImport(toImport);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl border border-slate-700">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Import from GitHub (@{username})</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                    {isLoading && <p>Loading repositories...</p>}
                    {error && <p className="text-red-400">{error}</p>}
                    <div className="space-y-2">
                        {repos.map(repo => (
                            <div key={repo.id} onClick={() => handleToggleRepo(repo.id)} className={`p-3 rounded-md cursor-pointer flex items-center gap-3 transition ${selectedRepos.includes(repo.id) ? 'bg-sky-800/50' : 'bg-slate-700/50 hover:bg-slate-700'}`}>
                                <input type="checkbox" checked={selectedRepos.includes(repo.id)} readOnly className="pointer-events-none" />
                                <div>
                                    <p className="font-semibold text-sky-300">{repo.name}</p>
                                    <p className="text-sm text-slate-400">{repo.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="p-4 border-t border-slate-700 text-right">
                    <button onClick={onClose} className="text-slate-400 px-4 py-2 mr-2">Cancel</button>
                    <button onClick={handleConfirmImport} className="bg-sky-600 text-white px-4 py-2 rounded-md">Import ({selectedRepos.length})</button>
                </div>
            </div>
        </div>
    );
};

const CircularProgress = ({ score }: { score: number }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = () => {
        if (score < 50) return '#f87171'; // red-400
        if (score < 80) return '#facc15'; // amber-400
        return '#34d399'; // emerald-400
    };

    return (
        <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
                <circle
                    className="text-slate-700"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="64"
                    cy="64"
                />
                <circle
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke={getColor()}
                    fill="transparent"
                    r={radius}
                    cx="64"
                    cy="64"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                />
            </svg>
            <span className="absolute text-3xl font-bold text-white">{score}</span>
        </div>
    );
};

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


interface ResumeBuilderFeatureProps {
    currentUser: User;
    student: Student;
    onUpdateResume: (resume: ResumeData) => void;
}

const ResumeBuilderFeature: React.FC<ResumeBuilderFeatureProps> = ({ currentUser, student, onUpdateResume }) => {
    const [role, setRole] = useState(ROLES[0]);
    const [resumeData, setResumeData] = useState<ResumeData>(student.resumeData);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [jobDescription, setJobDescription] = useState('');
    const [analysis, setAnalysis] = useState<AIResumeAnalysis | null>(null);
    const [activeTab, setActiveTab] = useState<'preview' | 'analysis'>('preview');
    const [teacherFeedback, setTeacherFeedback] = useState(student.resumeData.teacherFeedback || '');

    // Sync local state if student prop changes
    React.useEffect(() => {
        setResumeData(student.resumeData);
        setTeacherFeedback(student.resumeData.teacherFeedback || '');
    }, [student]);
    
    // Auto-save resume data on change
    React.useEffect(() => {
        const handler = setTimeout(() => {
            if (JSON.stringify(resumeData) !== JSON.stringify(student.resumeData)) {
                 onUpdateResume(resumeData);
            }
        }, 1000); // Debounce saves
        return () => clearTimeout(handler);
    }, [resumeData, onUpdateResume, student.resumeData]);
    
    const handleSaveTeacherFeedback = () => {
        onUpdateResume({ ...resumeData, teacherFeedback });
        alert("Feedback saved!");
    };

    const handleAnalyzeResume = async () => {
        if (!jobDescription.trim()) {
            setError('Please paste a job description to analyze against.');
            return;
        }
        setIsAnalyzing(true);
        setError('');
        setAnalysis(null);
        try {
            const result = await analyzeResumeWithAI(resumeData, jobDescription, role);
            setAnalysis(result);
            setActiveTab('analysis');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleApplySummary = () => {
        if (analysis) {
            setResumeData(prev => ({ ...prev, summary: analysis.generatedSummary }));
            alert('Summary updated!');
        }
    };

    const handleAddKeywords = () => {
        if (analysis) {
            setResumeData(prev => ({
                ...prev,
                skills: [...new Set([...prev.skills, ...analysis.keywords.suggestedKeywords])]
            }));
            alert('Keywords added to your skills list!');
        }
    };
    
    const handlePrint = () => {
        const printContent = document.getElementById('resume-preview')?.innerHTML;
        const windowUrl = 'about:blank';
        const uniqueName = new Date();
        const windowName = 'Print' + uniqueName.getTime();
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

        if (printWindow) {
            printWindow.document.write(`<html><head><title>Print Resume</title></head><body>${printContent}</body></html>`);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };
    
    const handleImportFromGitHub = (repos: GitHubRepo[]) => {
        const newProjects: Project[] = repos.map(repo => ({
            id: uid(),
            name: repo.name,
            description: repo.description || '',
            technologies: repo.language || '',
            repoUrl: repo.html_url,
            liveUrl: '',
        }));
        setResumeData(prev => ({ ...prev, projects: [...prev.projects, ...newProjects] }));
        setIsImporting(false);
    };
    
    const AnalysisDisplay = () => {
        if (isAnalyzing) {
             return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div></div>
        }
        
        const displayData = analysis || mockAIAnalysis;
        const isExample = !analysis;

        return (
            <div className="p-4 space-y-6 max-h-[80vh] overflow-y-auto relative">
                {isExample && (
                    <div className="sticky top-0 bg-slate-900/80 backdrop-blur-sm p-3 rounded-lg border border-sky-700 mb-4 z-10">
                        <p className="text-sky-300 text-sm font-semibold">🌟 This is a Demo Analysis</p>
                        <p className="text-slate-400 text-xs mt-1">Paste a job description and click 'Analyze with AI' to get personalized feedback on your resume.</p>
                    </div>
                )}
                <section>
                    <h3 className="text-xl font-bold text-sky-300 mb-3">ATS Compatibility Rating</h3>
                    <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex-shrink-0">
                            <CircularProgress score={displayData.ats.score} />
                            <p className="text-center text-sm text-slate-400 mt-1">Score: {displayData.ats.score}/100</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">Suggestions to Improve:</h4>
                            <ul className="list-disc pl-5 mt-2 text-sm text-slate-300 space-y-1">{displayData.ats.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
                        </div>
                    </div>
                </section>
                <section>
                    <h3 className="text-xl font-bold text-sky-300 mb-3">Keyword Optimization</h3>
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                        <p className="text-sm text-slate-300 mb-3">{displayData.keywords.keywordAnalysis}</p>
                        <h4 className="font-semibold text-white mb-2">Suggested Keywords:</h4>
                        <div className="flex flex-wrap gap-2">{displayData.keywords.suggestedKeywords.map(k => <span key={k} className="bg-sky-800 text-sky-200 text-xs font-mono px-2 py-1 rounded">{k}</span>)}</div>
                        <button onClick={handleAddKeywords} disabled={isExample} className="mt-4 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold py-2 px-4 rounded-md disabled:bg-slate-600 disabled:cursor-not-allowed">Add to Skills</button>
                    </div>
                </section>
                <section>
                    <h3 className="text-xl font-bold text-sky-300 mb-3">AI-Generated Executive Summary</h3>
                     <div className="bg-slate-700/50 p-4 rounded-lg">
                        <blockquote className="border-l-4 border-sky-500 pl-4 text-slate-300 italic">{displayData.generatedSummary}</blockquote>
                        <button onClick={handleApplySummary} disabled={isExample} className="mt-4 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold py-2 px-4 rounded-md disabled:bg-slate-600 disabled:cursor-not-allowed">Use this Summary</button>
                    </div>
                </section>
                <section>
                     <h3 className="text-xl font-bold text-sky-300 mb-3">Resume Optimization Feedback</h3>
                     <div className="bg-slate-700/50 p-4 rounded-lg space-y-4">
                         <div>
                             <h4 className="font-semibold text-white">Overall Feedback:</h4>
                             <p className="text-sm text-slate-300">{displayData.improvements.overallFeedback}</p>
                         </div>
                         <div className="space-y-3">
                             {displayData.improvements.sectionFeedback.map((fb, i) => {
                                const Icon = ImprovementIcons[fb.section];
                                return (
                                    <details key={i} className="bg-slate-800/50 p-3 rounded-lg" open>
                                        <summary className="font-semibold cursor-pointer flex items-center gap-3 text-white">
                                            {Icon && <Icon className="w-5 h-5 text-sky-400 flex-shrink-0" />}
                                            <span>{fb.section}</span>
                                        </summary>
                                        <p className="mt-2 text-sm text-slate-300 border-t border-slate-700 pt-2">{fb.feedback}</p>
                                    </details>
                                );
                             })}
                         </div>
                     </div>
                </section>

                <div className="mt-6 pt-4 border-t border-slate-700/50 text-xs text-slate-500 flex items-start justify-center gap-2">
                    <InfoIcon />
                    <p><strong>Disclaimer:</strong> AI analysis provides suggestions and is not a guarantee of job placement. Always review and tailor the advice to your personal experience and the specific job application.</p>
                </div>
            </div>
        );
    };

    return (
        <>
        {isImporting && student.integrations.github && (
            <GitHubImportModal username={student.integrations.github} onImport={handleImportFromGitHub} onClose={() => setIsImporting(false)} />
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-sky-300 mb-2">AI Resume Optimizer</h2>
                    <p className="text-slate-400">Build resume and analyze it against a job description for tailored feedback.</p>
                </div>
                
                <div className="bg-slate-900/50 p-4 rounded-lg">
                    <label className="block font-medium text-sky-300 mb-2">1. Target Role & Job Description</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md mb-3">
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste the full job description here..." rows={6} className="w-full bg-slate-700 text-sm p-2 rounded-md border border-slate-600 focus:ring-sky-500"></textarea>
                </div>
                
                 <div className="bg-slate-900/50 p-4 rounded-lg">
                    <label className="block font-medium text-sky-300 mb-2">2. Resume Details for {student.name}</label>
                    <div className="space-y-4">
                        <details className="bg-slate-800/50 p-3 rounded-lg"><summary className="font-semibold cursor-pointer">Personal Details</summary><div className="mt-4"><PersonalDetailsForm data={resumeData.personalDetails} setData={(d) => setResumeData({...resumeData, personalDetails: d})} /></div></details>
                        <details className="bg-slate-800/50 p-3 rounded-lg"><summary className="font-semibold cursor-pointer">Skills</summary><div className="mt-4"><input type="text" value={resumeData.skills.join(', ')} onChange={e => setResumeData({...resumeData, skills: e.target.value.split(',').map(s => s.trim())})} className="w-full mt-1 p-2 bg-slate-700 rounded-md" placeholder="Comma-separated skills"/></div></details>
                        <details className="bg-slate-800/50 p-3 rounded-lg" open><summary className="font-semibold cursor-pointer">Experience</summary><div className="mt-4"><ListItemForm<WorkExperience> items={resumeData.experience} setItems={(items) => setResumeData({...resumeData, experience: items})} title="Experience" newItem={() => ({id: uid(), jobTitle: '', company: '', location: '', startDate: '', endDate: '', description: ''})} renderForm={(item, onChange) => (<div className="space-y-2 text-sm"><input value={item.jobTitle} onChange={e => onChange({...item, jobTitle: e.target.value})} placeholder="Job Title" className="w-full p-2 bg-slate-700 rounded-md" /><input value={item.company} onChange={e => onChange({...item, company: e.target.value})} placeholder="Company" className="w-full p-2 bg-slate-700 rounded-md" /><textarea value={item.description} onChange={e => onChange({...item, description: e.target.value})} placeholder="Description..." className="w-full p-2 bg-slate-700 rounded-md" rows={3}></textarea></div>)} /></div></details>
                        <details className="bg-slate-800/50 p-3 rounded-lg" open><summary className="font-semibold cursor-pointer">Projects & Portfolio</summary><div className="mt-4"><button onClick={() => setIsImporting(true)} disabled={!student.integrations.github} className="mb-4 text-sm bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-md disabled:bg-slate-700 disabled:cursor-not-allowed">Import from GitHub</button><ListItemForm<Project> items={resumeData.projects} setItems={(items) => setResumeData({...resumeData, projects: items})} title="Project" newItem={() => ({id: uid(), name: '', description: '', technologies: '', repoUrl: '', liveUrl: ''})} renderForm={(item, onChange) => (<div className="space-y-2 text-sm"><input value={item.name} onChange={e => onChange({...item, name: e.target.value})} placeholder="Project Name" className="w-full p-2 bg-slate-700 rounded-md" /><input value={item.technologies} onChange={e => onChange({...item, technologies: e.target.value})} placeholder="Technologies (e.g., React, Node.js)" className="w-full p-2 bg-slate-700 rounded-md" /><textarea value={item.description} onChange={e => onChange({...item, description: e.target.value})} placeholder="Project description..." className="w-full p-2 bg-slate-700 rounded-md" rows={3}></textarea><input value={item.repoUrl} onChange={e => onChange({...item, repoUrl: e.target.value})} placeholder="GitHub Repo URL" className="w-full p-2 bg-slate-700 rounded-md" /><input value={item.liveUrl} onChange={e => onChange({...item, liveUrl: e.target.value})} placeholder="Live Demo URL" className="w-full p-2 bg-slate-700 rounded-md" /></div>)} /></div></details>
                        <details className="bg-slate-800/50 p-3 rounded-lg"><summary className="font-semibold cursor-pointer">Education</summary><div className="mt-4"><ListItemForm<Education> items={resumeData.education} setItems={(items) => setResumeData({...resumeData, education: items})} title="Education" newItem={() => ({id: uid(), institution: '', degree: '', fieldOfStudy: '', graduationDate: ''})} renderForm={(item, onChange) => (<div className="space-y-2 text-sm"><input value={item.institution} onChange={e => onChange({...item, institution: e.target.value})} placeholder="Institution" className="w-full p-2 bg-slate-700 rounded-md" /><input value={item.degree} onChange={e => onChange({...item, degree: e.target.value})} placeholder="Degree" className="w-full p-2 bg-slate-700 rounded-md" /></div>)} /></div></details>
                    </div>
                </div>

                {currentUser.role === 'teacher' && (
                    <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-700">
                        <label className="block font-medium text-yellow-200 mb-2">Teacher Feedback</label>
                        <textarea value={teacherFeedback} onChange={(e) => setTeacherFeedback(e.target.value)} placeholder={`Provide feedback for ${student.name}...`} rows={4} className="w-full bg-slate-700 text-sm p-2 rounded-md border border-slate-600 focus:ring-yellow-500"></textarea>
                        <button onClick={handleSaveTeacherFeedback} className="mt-2 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold py-2 px-4 rounded-md">Save Feedback</button>
                    </div>
                )}
                
                 <div className="mt-6 text-center">
                     <button onClick={handleAnalyzeResume} disabled={isAnalyzing} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 disabled:bg-slate-600">
                         {isAnalyzing ? 'Analyzing...' : '🤖 Analyze with AI'}
                     </button>
                     {error && <p className="text-red-400 mt-4">{error}</p>}
                 </div>

            </div>
            
            <div className="bg-slate-800 p-2 rounded-2xl shadow-lg border border-slate-700">
                 <div className="flex justify-between items-center p-4 border-b border-slate-700">
                     <div className="flex bg-slate-900/50 p-1 rounded-lg">
                        <button onClick={() => setActiveTab('preview')} className={`px-4 py-1 rounded-md text-sm font-semibold ${activeTab === 'preview' ? 'bg-slate-700 text-sky-300' : 'text-slate-400'}`}>Preview</button>
                        <button onClick={() => setActiveTab('analysis')} className={`px-4 py-1 rounded-md text-sm font-semibold ${activeTab === 'analysis' ? 'bg-slate-700 text-sky-300' : 'text-slate-400'}`}>AI Analysis</button>
                     </div>
                     <button onClick={handlePrint} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md text-sm">Print</button>
                 </div>
                 <div className="p-4 bg-gray-200">
                    {activeTab === 'preview' ? <ResumePreview resume={resumeData} /> : <AnalysisDisplay />}
                 </div>
            </div>
        </div>
        </>
    );
};

export default ResumeBuilderFeature;