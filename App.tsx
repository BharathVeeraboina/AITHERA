import React, { useState, useCallback, useEffect } from 'react';
import { ROLES, SKILL_LEVELS, YEARS } from './constants';
import { generateRoadmap } from './services/geminiService';
import type { User, Student, Teacher, Admin, Roadmap, CompletedInterview, CompletedMilestone, Application, Integrations, PlatformFeedback, CompletedChallenge, StudentProfile } from './types';
import { mockStudents, mockTeachers, mockAdmin } from './data/mockData';

// Feature Components
import RoadmapForm from './components/RoadmapForm';
import RoadmapDisplay from './components/RoadmapDisplay';
import InterviewFeature from './components/InterviewFeature';
import ResumeBuilderFeature from './components/ResumeBuilderFeature';
import ProjectSuggestionFeature from './components/ProjectSuggestionFeature';
import ChallengeBankFeature from './components/ChallengeBankFeature';
import IndustryHubFeature from './components/IndustryHubFeature';
import CareerExplorerFeature from './components/CareerExplorerFeature';
import JobSearchFeature from './components/JobSearchFeature';
import DashboardFeature from './components/DashboardFeature';
import ProgressReportFeature from './components/ProgressReportFeature';
import SoftSkillsLabFeature from './components/SoftSkillsLabFeature';
import IntegrationsFeature from './components/IntegrationsFeature';
import FeedbackAnalysisFeature from './components/FeedbackAnalysisFeature';
import FullStackDeveloperRoadmap from './components/FullStackDeveloperRoadmap';

// Admin & Teacher Components
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import TeacherManagement from './components/TeacherManagement';
import StudentDataView from './components/StudentDataView';

// Common UI Components
import Sidebar from './components/Sidebar';
import FeedbackButton from './components/FeedbackButton';

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sky-400"></div>
        <p className="text-sky-300">AI is crafting your personalized path...</p>
    </div>
);

export type View = 
    | 'dashboard' | 'roadmap' | 'career' | 'jobs' | 'challenges' 
    | 'interview' | 'soft-skills' | 'projects' | 'resume' | 'industry' 
    | 'reports' | 'integrations' | 'feedback'
    // Admin & Teacher specific views
    | 'adminDashboard' | 'teacherManagement' | 'studentData' | 'studentDashboard';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [view, setView] = useState<View>('dashboard');
    const [loginNotification, setLoginNotification] = useState<string | null>(null);
    
    // "Database" of all users
    const [students, setStudents] = useState<Student[]>(mockStudents);
    const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
    
    // State for a teacher/admin viewing a specific student's data
    const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
    
    // State for Roadmap Generation (as it's a creation step)
    const [role, setRole] = useState<string>(ROLES[0]);
    const [year, setYear] = useState<number>(YEARS[0]);
    const [skillLevel, setSkillLevel] = useState<string>(SKILL_LEVELS[0]);
    const [isLoadingRoadmap, setIsLoadingRoadmap] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showFullStackRoadmap, setShowFullStackRoadmap] = useState<boolean>(false);
    
    useEffect(() => {
        if (loginNotification) {
            const timer = setTimeout(() => {
                setLoginNotification(null);
            }, 4000); // Hide after 4 seconds
            return () => clearTimeout(timer);
        }
    }, [loginNotification]);

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        setLoginNotification(`Login successful. Welcome, ${user.name} (${user.role}).`);
        if(user.role === 'admin') setView('adminDashboard');
        else setView('dashboard');
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setViewingStudent(null);
    };

    const updateStudentData = (studentId: string, updatedData: Partial<Student>) => {
        setStudents(prevStudents => 
            prevStudents.map(s => s.id === studentId ? { ...s, ...updatedData } : s)
        );
        if (viewingStudent?.id === studentId) {
            setViewingStudent(prev => prev ? { ...prev, ...updatedData } : null);
        }
    };

    // Handlers to update student progress data
    const handleToggleMilestone = (milestoneId: string) => {
        const student = viewingStudent || (currentUser?.role === 'student' ? currentUser as Student : null);
        if (!student) return;
        
        const isCompleted = student.completedMilestones.some(m => m.id === milestoneId);
        const updatedMilestones = isCompleted 
            ? student.completedMilestones.filter(m => m.id !== milestoneId)
            : [...student.completedMilestones, { id: milestoneId, completedAt: new Date().toISOString() }];
        
        updateStudentData(student.id, { completedMilestones: updatedMilestones });
    };

    const handleAddToInterviewHistory = (interview: CompletedInterview) => {
        const student = viewingStudent || (currentUser?.role === 'student' ? currentUser as Student : null);
        if (!student) return;
        const updatedHistory = [interview, ...student.interviewHistory];
        updateStudentData(student.id, { interviewHistory: updatedHistory });
    };
    
    const handleChallengeComplete = (challenge: CompletedChallenge) => {
        const student = viewingStudent || (currentUser?.role === 'student' ? currentUser as Student : null);
        if (!student) return;
        const updatedHistory = [challenge, ...student.challengeHistory];
        updateStudentData(student.id, { challengeHistory: updatedHistory });
    };

    const handleUpdateApplications = (updatedApps: Application[]) => {
       const student = viewingStudent || (currentUser?.role === 'student' ? currentUser as Student : null);
       if (!student) return;
       updateStudentData(student.id, { applications: updatedApps });
    };

    const handleUpdateIntegrations = (updatedIntegrations: Integrations) => {
       const student = viewingStudent || (currentUser?.role === 'student' ? currentUser as Student : null);
       if (!student) return;
       updateStudentData(student.id, { integrations: updatedIntegrations });
    };

    const handleFeedbackSubmit = ({ feature, rating, comment }: { feature: View, rating: number, comment: string }) => {
        const student = viewingStudent || (currentUser?.role === 'student' ? currentUser as Student : null);
        if (!student) return;

        const newFeedback: PlatformFeedback = {
            id: `fb_${Date.now()}`,
            feature,
            rating,
            comment,
            submittedAt: new Date().toISOString()
        };
        const updatedFeedback = [newFeedback, ...student.platformFeedback];
        updateStudentData(student.id, { platformFeedback: updatedFeedback });
        alert('Thank you for your feedback!');
    };
    
    const handleUpdateResume = (updatedResume: any) => {
        const student = viewingStudent || (currentUser?.role === 'student' ? currentUser as Student : null);
        if (!student) return;
        updateStudentData(student.id, { resumeData: updatedResume });
    };

    const handleUpdateProfile = (profile: StudentProfile) => {
        const student = viewingStudent || (currentUser?.role === 'student' ? currentUser as Student : null);
        if (!student) return;
        updateStudentData(student.id, { profile });
    };


    const handleGenerateRoadmap = useCallback(async () => {
        const student = viewingStudent || (currentUser?.role === 'student' ? currentUser as Student : null);
        if (!student) return;

        setIsLoadingRoadmap(true);
        setError(null);
        updateStudentData(student.id, { roadmap: null });

        try {
            const result = await generateRoadmap(role, year, skillLevel);
            updateStudentData(student.id, { roadmap: result });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoadingRoadmap(false);
        }
    }, [role, year, skillLevel, currentUser, viewingStudent]);

    if (!currentUser) {
        return <LoginScreen onLogin={handleLogin} students={students} teachers={teachers} admin={mockAdmin} />;
    }

    const studentForView = viewingStudent || (currentUser.role === 'student' ? currentUser as Student : null);

    const renderContent = () => {
        // Admin Views
        if (currentUser.role === 'admin') {
            switch(view) {
                case 'adminDashboard': return <AdminDashboard students={students} teachers={teachers} />;
                case 'teacherManagement': return <TeacherManagement teachers={teachers} students={students} setTeachers={setTeachers} />;
                case 'studentData': return <StudentDataView students={students} />;
                case 'feedback': return <FeedbackAnalysisFeature feedback={students.flatMap(s => s.platformFeedback)} />;
                default: setView('adminDashboard'); return null; // Default to admin dashboard
            }
        }
        
        // Teacher Views
        if (currentUser.role === 'teacher') {
             switch(view) {
                case 'dashboard': return <TeacherDashboard teacher={currentUser as Teacher} students={students} onSelectStudent={(s) => { setViewingStudent(s); setView('studentDashboard'); }} />;
                // When viewing a student, teachers see a version of the student's dashboard
                case 'studentDashboard': return studentForView ? <DashboardFeature student={studentForView} setView={setView} /> : <p>Select a student</p>;
                case 'resume': return studentForView ? <ResumeBuilderFeature currentUser={currentUser} student={studentForView} onUpdateResume={handleUpdateResume} /> : <p>Select a student</p>;
                case 'reports': return studentForView ? <ProgressReportFeature student={studentForView} /> : <p>Select a student</p>;
                default: setView('dashboard'); return null;
            }
        }

        // Student Views
        if (currentUser.role === 'student' && studentForView) {
            switch(view) {
                case 'roadmap':
                    return (
                        <>
                            <RoadmapForm role={role} setRole={setRole} year={year} setYear={setYear} skillLevel={skillLevel} setSkillLevel={setSkillLevel} onSubmit={handleGenerateRoadmap} isLoading={isLoadingRoadmap} />
                            <div className="mt-12">
                                {isLoadingRoadmap && <LoadingSpinner />}
                                {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center max-w-2xl mx-auto"><h3 className="font-bold">Generation Failed</h3><p>{error}</p></div>}
                                {studentForView.roadmap && <RoadmapDisplay roadmap={studentForView.roadmap} completedMilestones={studentForView.completedMilestones} onToggleMilestone={handleToggleMilestone} />}
                            </div>
                             <div className="text-center my-8">
                                <div className="relative flex py-5 items-center">
                                    <div className="flex-grow border-t border-slate-600"></div>
                                    <span className="flex-shrink mx-4 text-slate-400">Additional Resources</span>
                                    <div className="flex-grow border-t border-slate-600"></div>
                                </div>
                                <button 
                                    onClick={() => setShowFullStackRoadmap(!showFullStackRoadmap)}
                                    className="px-6 py-2 border border-sky-500 text-sky-300 rounded-full hover:bg-sky-500/20 transition"
                                >
                                    {showFullStackRoadmap ? 'Hide' : 'View'} Full Stack Roadmap (Demo)
                                </button>
                            </div>

                            {showFullStackRoadmap && <FullStackDeveloperRoadmap />}
                        </>
                    );
                case 'interview': return <InterviewFeature onAddToHistory={handleAddToInterviewHistory} />;
                case 'resume': return <ResumeBuilderFeature currentUser={currentUser} student={studentForView} onUpdateResume={handleUpdateResume} />;
                case 'projects': return <ProjectSuggestionFeature />;
                case 'challenges': return <ChallengeBankFeature onChallengeComplete={handleChallengeComplete} challengeHistory={studentForView.challengeHistory} />;
                case 'industry': return <IndustryHubFeature />;
                case 'career': return <CareerExplorerFeature student={studentForView} onUpdateProfile={handleUpdateProfile} />;
                case 'jobs': return <JobSearchFeature applications={studentForView.applications} onUpdateApplications={handleUpdateApplications}/>;
                case 'reports': return <ProgressReportFeature student={studentForView}/>;
                case 'soft-skills': return <SoftSkillsLabFeature />;
                case 'integrations': return <IntegrationsFeature integrations={studentForView.integrations} onUpdate={handleUpdateIntegrations} />;
                case 'feedback': return <FeedbackAnalysisFeature feedback={studentForView.platformFeedback} />;
                case 'dashboard':
                default:
                    return <DashboardFeature student={studentForView} setView={setView} />;
            }
        }
        return <p>An error occurred determining the view.</p>;
    }


    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex">
            {/* Login Notification Toast */}
            {loginNotification && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-md animate-fade-in-down">
                    <div className="bg-slate-800/80 backdrop-blur-sm border border-sky-500 text-sky-200 p-4 rounded-lg shadow-lg flex justify-between items-center">
                        <p className="font-semibold">{loginNotification}</p>
                        <button onClick={() => setLoginNotification(null)} className="text-2xl leading-none text-slate-400 hover:text-white">&times;</button>
                    </div>
                </div>
            )}

            <Sidebar currentUser={currentUser} onNavigate={setView} onLogout={handleLogout} />
          
            <div className="flex-1 flex flex-col h-screen">
                 <header className="text-center py-6 px-4 border-b border-slate-700/50 md:hidden flex justify-between items-center">
                    <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                        AITHERA
                    </h1>
                     <span className="text-sm text-slate-400">{currentUser.name} ({currentUser.role})</span>
                </header>
                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                   <div className="container mx-auto">
                    {viewingStudent && (
                        <div className="bg-sky-900/50 border border-sky-700 text-sky-200 p-3 rounded-lg mb-6 flex justify-between items-center">
                            <p>Viewing dashboard for: <strong>{viewingStudent.name}</strong></p>
                            <button onClick={() => { setViewingStudent(null); setView('dashboard'); }} className="text-sm font-semibold hover:underline">Back to My Dashboard</button>
                        </div>
                    )}
                    {renderContent()}
                  
                  </div>
                </main>
            </div>
            {currentUser.role === 'student' && <FeedbackButton currentView={view} onSubmitFeedback={handleFeedbackSubmit} />}
        </div>
    );
};

export default App;
