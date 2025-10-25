import React, { useState, useMemo } from 'react';
import type { Student } from '../types';

interface StudentDataViewProps {
    students: Student[];
}

const StudentDataView: React.FC<StudentDataViewProps> = ({ students }) => {
    const [filterName, setFilterName] = useState('');

    const filteredStudents = useMemo(() => {
        return students.filter(student =>
            student.name.toLowerCase().includes(filterName.toLowerCase())
        );
    }, [students, filterName]);

    const getStudentAnalytics = (student: Student) => {
        const totalMilestones = student.roadmap?.years.reduce((acc, year) => acc + year.semesters.reduce((sAcc, sem) => sAcc + sem.milestones.length, 0), 0) || 0;
        const roadmapProgress = totalMilestones > 0 ? (student.completedMilestones.length / totalMilestones) * 100 : 0;
        const challengesCompleted = student.challengeHistory.length;
        const interviewsCompleted = student.interviewHistory.length;
        const avgInterviewScore = interviewsCompleted > 0
            ? student.interviewHistory.reduce((acc, i) => acc + i.feedback.overallScore, 0) / interviewsCompleted
            : 0;
        return { roadmapProgress, challengesCompleted, avgInterviewScore };
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-sky-300 mb-6">All Student Data</h1>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Filter by student name..."
                    value={filterName}
                    onChange={e => setFilterName(e.target.value)}
                    className="w-full max-w-sm bg-slate-700 p-2 rounded-md"
                />
            </div>

            <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-600 text-slate-300">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3 text-center">Roadmap Progress</th>
                            <th className="p-3 text-center">Challenges Solved</th>
                            <th className="p-3 text-center">Avg. Interview Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map(student => {
                            const analytics = getStudentAnalytics(student);
                            return (
                                <tr key={student.id} className="border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50">
                                    <td className="p-3 font-semibold text-white">{student.name}</td>
                                    <td className="p-3 text-center">
                                        <div className="w-full bg-slate-600 rounded-full h-2.5">
                                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${analytics.roadmapProgress.toFixed(0)}%` }}></div>
                                        </div>
                                        <span className="text-xs">{analytics.roadmapProgress.toFixed(0)}%</span>
                                    </td>
                                    <td className="p-3 text-center font-semibold">{analytics.challengesCompleted}</td>
                                    <td className="p-3 text-center font-semibold">{analytics.avgInterviewScore.toFixed(1)} / 10</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentDataView;