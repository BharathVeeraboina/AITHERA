import React, { useMemo } from 'react';
import type { Student, Teacher } from '../types';

interface AdminDashboardProps {
    students: Student[];
    teachers: Teacher[];
}

const StatCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
        <h3 className="text-sm font-semibold text-sky-300 uppercase tracking-wider">{title}</h3>
        <p className="text-4xl font-bold text-white mt-2">{value}</p>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
    </div>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ students, teachers }) => {
    const analytics = useMemo(() => {
        const totalStudents = students.length;
        const totalTeachers = teachers.length;

        const allInterviews = students.flatMap(s => s.interviewHistory);
        const avgInterviewScore = allInterviews.length > 0
            ? allInterviews.reduce((acc, i) => acc + i.feedback.overallScore, 0) / allInterviews.length
            : 0;

        const allApplications = students.flatMap(s => s.applications);
        const applicationStatusCounts = allApplications.reduce((acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const totalChallenges = students.reduce((sum, s) => sum + s.challengeHistory.length, 0);

        return {
            totalStudents,
            totalTeachers,
            avgInterviewScore,
            totalApplications: allApplications.length,
            applicationStatusCounts,
            totalChallenges,
        };
    }, [students, teachers]);
    
    const appStatusColors: Record<string, string> = {
        'Applied': 'bg-blue-500',
        'Interviewing': 'bg-yellow-500',
        'Offer': 'bg-green-500',
        'Rejected': 'bg-red-500',
        'Saved': 'bg-gray-500',
    };

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="text-left mb-8">
                <h1 className="text-3xl font-bold text-sky-300">Principal's Dashboard</h1>
                <p className="mt-2 text-lg text-slate-400">
                    A high-level overview of career development activities across the institution.
                </p>
            </div>
            
            {/* Top-level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={analytics.totalStudents} description="Actively using the platform." />
                <StatCard title="Total Teachers" value={analytics.totalTeachers} description="Mentoring students." />
                <StatCard title="Avg. Interview Score" value={analytics.avgInterviewScore.toFixed(1)} description="Across all mock interviews." />
                <StatCard title="Total Challenges" value={analytics.totalChallenges} description="Solved by students." />
            </div>

            {/* Application Status */}
            <div className="mt-8 bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4">Job Application Funnel ({analytics.totalApplications} Total)</h2>
                 {analytics.totalApplications > 0 ? (
                    <div className="w-full flex rounded-full h-8 bg-slate-700">
                        {/* Fix: Use Object.keys to avoid type inference issues with Object.entries. */}
                        {Object.keys(analytics.applicationStatusCounts).map(status => {
                             const count = analytics.applicationStatusCounts[status];
                             const percentage = (count / analytics.totalApplications) * 100;
                             return (
                                <div 
                                    key={status} 
                                    className={`${appStatusColors[status]} h-full flex items-center justify-center text-white text-xs font-bold`} 
                                    style={{ width: `${percentage}%` }}
                                    title={`${status}: ${count} (${percentage.toFixed(1)}%)`}
                                >
                                    {percentage > 10 ? status : ''}
                                </div>
                             )
                        })}
                    </div>
                ) : (
                    <p className="text-slate-400">No job applications have been tracked yet.</p>
                )}
            </div>

             {/* Add more sections as needed, e.g., departmental breakdowns, teacher performance, etc. */}
        </div>
    );
};

export default AdminDashboard;