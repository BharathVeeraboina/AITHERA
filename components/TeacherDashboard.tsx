import React from 'react';
import type { Teacher, Student } from '../types';

interface TeacherDashboardProps {
    teacher: Teacher;
    students: Student[];
    onSelectStudent: (student: Student) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ teacher, students, onSelectStudent }) => {
    
    const mentoredStudents = students.filter(s => teacher.studentIds.includes(s.id));

    const getStudentAnalytics = (student: Student) => {
        const totalMilestones = student.roadmap?.years.reduce((acc, year) => acc + year.semesters.reduce((sAcc, sem) => sAcc + sem.milestones.length, 0), 0) || 0;
        const completedMilestones = student.completedMilestones.length;
        const interviewsCompleted = student.interviewHistory.length;
        const avgInterviewScore = interviewsCompleted > 0 ? student.interviewHistory.reduce((acc, i) => acc + i.feedback.overallScore, 0) / interviewsCompleted : 0;
        const challengesCompleted = student.challengeHistory.length;
        return { completedMilestones, totalMilestones, avgInterviewScore, challengesCompleted };
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
             <div className="text-left mb-8">
                <h1 className="text-3xl font-bold text-sky-300">Teacher Dashboard</h1>
                <p className="mt-2 text-lg text-slate-400">
                    Welcome, {teacher.name}. Here's an overview of your mentored students.
                </p>
            </div>
            
            <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">My Students ({mentoredStudents.length})</h2>
                <div className="space-y-4">
                    {mentoredStudents.map(student => {
                        const analytics = getStudentAnalytics(student);
                        return (
                            <div key={student.id} className="bg-slate-700/50 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-lg font-bold text-white">{student.name}</h3>
                                </div>
                                <div className="flex-1 grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-xs text-slate-400">Roadmap</p>
                                        <p className="font-bold text-lg">{analytics.completedMilestones}/{analytics.totalMilestones}</p>
                                    </div>
                                     <div>
                                        <p className="text-xs text-slate-400">Avg. Interview</p>
                                        <p className="font-bold text-lg">{analytics.avgInterviewScore.toFixed(1)}/10</p>
                                    </div>
                                     <div>
                                        <p className="text-xs text-slate-400">Challenges</p>
                                        <p className="font-bold text-lg">{analytics.challengesCompleted}</p>
                                    </div>
                                </div>
                                <div className="flex-1 text-center md:text-right">
                                    <button 
                                        onClick={() => onSelectStudent(student)}
                                        className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-md"
                                    >
                                        View Dashboard
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;