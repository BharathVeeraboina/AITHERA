import React, { useState, useCallback, useEffect } from 'react';
import { generateProgressReportSummary } from '../services/geminiService';
import type { Student, ProgressReport, CompletedChallenge, CompletedInterview } from '../types';

interface ProgressReportFeatureProps {
    student: Student;
}

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4 my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
        <p className="text-sky-300">AI is compiling your progress report...</p>
    </div>
);

const ActivityChart = ({ data }: { data: { label: string; count: number }[] }) => {
    const maxValue = Math.max(...data.map(d => d.count), 1);
    const colors = ['bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-blue-500'];

    return (
        <div className="space-y-3">
            {data.map((item, index) => (
                <div key={item.label} className="flex items-center">
                    <div className="w-1/4 text-sm text-slate-300">{item.label}</div>
                    <div className="w-3/4 bg-slate-700 rounded-full h-5">
                        <div
                            className={`${colors[index % colors.length]} h-5 rounded-full text-xs text-white flex items-center justify-end pr-2 transition-all duration-500`}
                            style={{ width: `${(item.count / maxValue) * 100}%` }}
                        >
                            {item.count > 0 ? item.count : ''}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ProgressReportFeature: React.FC<ProgressReportFeatureProps> = ({ student }) => {
    const { completedMilestones, interviewHistory, applications, challengeHistory } = student;
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [activePreset, setActivePreset] = useState<'today' | 'week' | 'month' | 'custom'>('week');
    const [report, setReport] = useState<ProgressReport | null>(null);
    const [reportData, setReportData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        handlePresetChange('week'); // Set default date range to "This Week" on load
    }, []);
    
    const toISODateString = (date: Date) => date.toISOString().split('T')[0];

    const handlePresetChange = (preset: 'today' | 'week' | 'month') => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let start = new Date(today);
        let end = new Date(today);

        switch (preset) {
            case 'today':
                // Start and end are already today
                break;
            case 'week':
                const dayOfWeek = today.getDay();
                start.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Adjust for week starting on Monday
                end.setDate(start.getDate() + 6);
                break;
            case 'month':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
        }
        setStartDate(toISODateString(start));
        setEndDate(toISODateString(end));
        setActivePreset(preset);
    };

    const handleGenerateReport = useCallback(async () => {
        if (!startDate || !endDate) {
            setError("Please select a valid date range.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setReport(null);

        const fromDate = new Date(startDate);
        const toDate = new Date(endDate);
        toDate.setHours(23, 59, 59, 999); // Make end date inclusive

        const filterByDate = <T extends { completedAt?: string; appliedDate?: string }>(items: T[]): T[] => {
            return items.filter(item => {
                const itemDateStr = item.completedAt || item.appliedDate;
                if (!itemDateStr) return false;
                const itemDate = new Date(itemDateStr);
                return itemDate >= fromDate && itemDate <= toDate;
            });
        };

        const milestonesInPeriod = filterByDate(completedMilestones);
        const challengesInPeriod = filterByDate(challengeHistory);
        const interviewsInPeriod = filterByDate(interviewHistory);
        const applicationsInPeriod = filterByDate(applications);
        
        setReportData({
            milestones: milestonesInPeriod.length,
            challenges: challengesInPeriod.length,
            interviews: interviewsInPeriod.length,
            applications: applicationsInPeriod.length,
        });

        const summary = `
- Reporting Period: From ${startDate} to ${endDate}.
- Roadmap Milestones Completed: ${milestonesInPeriod.length}.
- Coding Challenges Completed: ${challengesInPeriod.length}.
- Mock Interviews Completed: ${interviewsInPeriod.length}.
- Job Applications Sent: ${applicationsInPeriod.length}.
- Details of challenges: ${JSON.stringify(challengesInPeriod.map((c: CompletedChallenge) => ({ title: c.challenge.title, difficulty: c.difficulty })))}.
- Details of interviews: ${JSON.stringify(interviewsInPeriod.map((i: CompletedInterview) => ({ score: i.feedback.overallScore, improvement_areas: i.feedback.areasForImprovement })))}.
        `;
        
        try {
            const result = await generateProgressReportSummary(summary);
            setReport(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to generate report.");
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate, completedMilestones, challengeHistory, interviewHistory, applications]);

    const handlePrint = () => {
        const printContent = document.getElementById('report-content')?.innerHTML;
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=800');
            if (printWindow) {
                printWindow.document.write('<html><head><title>Progress Report</title>');
                printWindow.document.write('<style>body{font-family:sans-serif;color:black;} h2,h3{color:#0ea5e9;} ul{list-style-type:disc;padding-left:20px;} section{margin-bottom: 24px; border-bottom: 1px solid #ccc; padding-bottom: 16px;}</style>');
                printWindow.document.write('</head><body>');
                printWindow.document.write(printContent);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
            }
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 mb-10">
                <h2 className="text-2xl font-bold text-sky-300 mb-2">Insight Dashboard</h2>
                <p className="text-slate-400 mb-6">Select a date range to generate a detailed report of {student.name}'s activities and achievements.</p>
                
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-700/50 rounded-full p-1">
                        <button onClick={() => handlePresetChange('today')} className={`w-full sm:w-1/3 rounded-full py-2 font-semibold transition ${activePreset === 'today' ? 'bg-sky-600 text-white' : 'text-slate-300'}`}>Today</button>
                        <button onClick={() => handlePresetChange('week')} className={`w-full sm:w-1/3 rounded-full py-2 font-semibold transition ${activePreset === 'week' ? 'bg-sky-600 text-white' : 'text-slate-300'}`}>This Week</button>
                        <button onClick={() => handlePresetChange('month')} className={`w-full sm:w-1/3 rounded-full py-2 font-semibold transition ${activePreset === 'month' ? 'bg-sky-600 text-white' : 'text-slate-300'}`}>This Month</button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                        <div className="w-full sm:w-auto">
                            <label htmlFor="start-date" className="text-sm text-slate-400">Start Date</label>
                            <input type="date" id="start-date" value={startDate} onChange={e => { setStartDate(e.target.value); setActivePreset('custom'); }} className="w-full bg-slate-700 p-2 rounded-md text-slate-200" />
                        </div>
                        <span className="hidden sm:block text-slate-400 mt-5">-</span>
                        <div className="w-full sm:w-auto">
                            <label htmlFor="end-date" className="text-sm text-slate-400">End Date</label>
                            <input type="date" id="end-date" value={endDate} onChange={e => { setEndDate(e.target.value); setActivePreset('custom'); }} className="w-full bg-slate-700 p-2 rounded-md text-slate-200" />
                        </div>
                    </div>
                </div>

                <div className="text-center mt-6">
                    <button onClick={handleGenerateReport} disabled={isLoading} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full transition disabled:bg-slate-600">
                        {isLoading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>

            {isLoading && <LoadingSpinner />}
            {error && <p className="text-red-400 text-center bg-red-900/50 p-3 rounded-lg">{error}</p>}
            
            {report && reportData && (
                <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 animate-fade-in">
                    <div id="report-content">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-white">Progress Report</h2>
                                <p className="text-sky-300">{student.name}</p>
                                <p className="text-slate-400 text-sm">For the period: {startDate} to {endDate}</p>
                            </div>
                            <button onClick={handlePrint} className="hidden sm:block bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md">Print</button>
                        </div>
                        
                        <section>
                             <h3 className="text-xl font-bold text-sky-400 mb-4">Activity Snapshot</h3>
                             <ActivityChart data={[
                                { label: 'Milestones', count: reportData.milestones },
                                { label: 'Challenges', count: reportData.challenges },
                                { label: 'Interviews', count: reportData.interviews },
                                { label: 'Applications', count: reportData.applications },
                             ]}/>
                        </section>
                        
                        <section>
                             <h3 className="text-xl font-bold text-sky-400 mb-3">Overall Summary</h3>
                             <p className="text-slate-300 leading-relaxed">{report.overallSummary}</p>
                        </section>
                         <section>
                             <h3 className="text-xl font-bold text-sky-400 mb-3">Key Achievements</h3>
                             <ul className="list-disc pl-5 space-y-2 text-slate-300">{report.keyAchievements.map((item, i) => <li key={i}>{item}</li>)}</ul>
                        </section>
                         <section>
                             <h3 className="text-xl font-bold text-sky-400 mb-3">Strengths Demonstrated</h3>
                              <p className="text-slate-300">{report.strengthsDemonstrated}</p>
                        </section>
                        <section>
                             <h3 className="text-xl font-bold text-sky-400 mb-3">Areas for Focus</h3>
                            <ul className="list-disc pl-5 space-y-2 text-slate-300">{report.areasForFocus.map((item, i) => <li key={i}>{item}</li>)}</ul>
                        </section>
                        <section className="bg-sky-900/50 p-4 rounded-lg border border-sky-700">
                             <h3 className="text-xl font-bold text-sky-300 mb-3">Suggested Next Steps</h3>
                            <p className="text-sky-200">{report.suggestedNextSteps}</p>
                        </section>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProgressReportFeature;