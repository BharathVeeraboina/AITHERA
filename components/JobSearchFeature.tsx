import React, { useState, useMemo, useCallback } from 'react';
import { ROLES, JOB_TYPES } from '../constants';
import { generateJobListings } from '../services/geminiService';
import type { JobListing, Application, ApplicationStatus, JobType } from '../types';

interface JobSearchFeatureProps {
    applications: Application[];
    onUpdateApplications: (apps: Application[]) => void;
}

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4 my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
        <p className="text-sky-300">Curating job opportunities...</p>
    </div>
);

const JobSearchFeature: React.FC<JobSearchFeatureProps> = ({ applications, onUpdateApplications }) => {
    const [view, setView] = useState<'search' | 'tracker'>('search');
    const [role, setRole] = useState(ROLES[0]);
    const [jobListings, setJobListings] = useState<JobListing[]>([]);
    const [filters, setFilters] = useState({ location: '', type: 'all', postedDate: '', deadline: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFetchJobs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setJobListings([]);
        try {
            const listings = await generateJobListings(role);
            setJobListings(listings);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch jobs.");
        } finally {
            setIsLoading(false);
        }
    }, [role]);

    const filteredJobs = useMemo(() => {
        return jobListings.filter(job => {
            const locationMatch = job.location.toLowerCase().includes(filters.location.toLowerCase());
            const typeMatch = filters.type === 'all' || job.type === filters.type;
            const postedDateMatch = !filters.postedDate || (job.postedDate && job.postedDate >= filters.postedDate);
            const deadlineMatch = !filters.deadline || (job.deadline && job.deadline <= filters.deadline);
            return locationMatch && typeMatch && postedDateMatch && deadlineMatch;
        });
    }, [jobListings, filters]);

    const handleAddToTracker = (job: JobListing) => {
        if (applications.some(app => app.job.id === job.id)) {
            alert("This job is already in your tracker.");
            return;
        }
        const newApp: Application = {
            job,
            status: 'Saved',
            appliedDate: new Date().toISOString(),
            deadline: job.deadline // Use the deadline from the job listing
        };
        onUpdateApplications([newApp, ...applications]);
        setView('tracker');
    };

    const handleStatusChange = (jobId: string, newStatus: ApplicationStatus) => {
        const updatedApps = applications.map(app => 
            app.job.id === jobId ? { ...app, status: newStatus } : app
        );
        onUpdateApplications(updatedApps);
    };

    const handleRemove = (jobId: string) => {
        onUpdateApplications(applications.filter(app => app.job.id !== jobId));
    };
    
    const getStatusColor = (status: ApplicationStatus) => ({
        'Saved': 'bg-gray-600',
        'Applied': 'bg-blue-600',
        'Interviewing': 'bg-yellow-600',
        'Offer': 'bg-green-600',
        'Rejected': 'bg-red-600',
    }[status]);

    const renderSearchView = () => (
        <>
            <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 mb-8">
                 <h2 className="text-2xl font-bold text-sky-300 mb-2">Find Opportunities</h2>
                 <p className="text-slate-400 mb-6">Select a target role to find relevant job and internship listings.</p>
                 <div className="flex flex-col sm:flex-row gap-4">
                     <select value={role} onChange={e => setRole(e.target.value)} className="w-full sm:w-1/2 bg-slate-700 p-2 rounded-md">
                         {ROLES.map(r => <option key={r}>{r}</option>)}
                     </select>
                     <button onClick={handleFetchJobs} disabled={isLoading} className="w-full sm:w-1/2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-full transition disabled:bg-slate-600">
                         {isLoading ? "Searching..." : "Find Jobs"}
                     </button>
                 </div>
            </div>
            
            {isLoading && <LoadingSpinner />}
            {error && <p className="text-red-400 text-center">{error}</p>}
            
            {jobListings.length > 0 && (
                <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                     <input type="text" placeholder="Filter by location..." value={filters.location} onChange={e => setFilters({...filters, location: e.target.value})} className="w-full p-2 bg-slate-700 rounded-md"/>
                     <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} className="w-full p-2 bg-slate-700 rounded-md">
                        <option value="all">All Types</option>
                        {JOB_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                     </select>
                     <div>
                        <label htmlFor="posted-date-filter" className="text-xs text-slate-400">Posted After</label>
                        <input id="posted-date-filter" type="date" value={filters.postedDate} onChange={e => setFilters({...filters, postedDate: e.target.value})} className="w-full p-1.5 bg-slate-700 rounded-md text-slate-300"/>
                     </div>
                     <div>
                        <label htmlFor="deadline-filter" className="text-xs text-slate-400">Deadline Before</label>
                        <input id="deadline-filter" type="date" value={filters.deadline} onChange={e => setFilters({...filters, deadline: e.target.value})} className="w-full p-1.5 bg-slate-700 rounded-md text-slate-300"/>
                     </div>
                </div>
                <div className="space-y-4">
                    {filteredJobs.map(job => (
                        <div key={job.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                             <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-white">{job.title}</h3>
                                    <p className="text-sky-300">{job.company} - <span className="text-slate-400">{job.location}</span></p>
                                </div>
                                <button onClick={() => handleAddToTracker(job)} className="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-3 py-1 rounded-md whitespace-nowrap">+ To Tracker</button>
                             </div>
                             <div className="flex justify-between items-center text-xs text-slate-400 mt-2 mb-2 border-y border-slate-700 py-1">
                                <span>Posted: <span className="text-slate-300 font-semibold">{job.postedDate}</span></span>
                                <span>Deadline: <span className="text-amber-300 font-semibold">{job.deadline}</span></span>
                             </div>
                             <p className="text-sm text-slate-300 my-2">{job.description}</p>
                        </div>
                    ))}
                     {filteredJobs.length === 0 && <p className="text-center text-slate-400 py-8">No jobs match your current filters.</p>}
                </div>
                </>
            )}
        </>
    );
    
    const renderTrackerView = () => (
        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
             <h2 className="text-2xl font-bold text-sky-300 mb-6">Application Tracker</h2>
             {applications.length === 0 ? (
                 <p className="text-slate-400 text-center">No applications tracked yet. Find some jobs to get started!</p>
             ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-600 text-slate-300">
                            <tr>
                                <th className="p-2">Role</th>
                                <th className="p-2">Company</th>
                                <th className="p-2">Status</th>
                                <th className="p-2">Deadline</th>
                                <th className="p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map(app => (
                                <tr key={app.job.id} className="border-b border-slate-700">
                                    <td className="p-2 font-semibold">{app.job.title}</td>
                                    <td className="p-2 text-slate-300">{app.job.company}</td>
                                    <td className="p-2">
                                        <select value={app.status} onChange={e => handleStatusChange(app.job.id, e.target.value as ApplicationStatus)} className={`w-full text-white text-xs p-1 rounded border-0 ${getStatusColor(app.status)}`}>
                                            <option value="Saved">Saved</option>
                                            <option value="Applied">Applied</option>
                                            <option value="Interviewing">Interviewing</option>
                                            <option value="Offer">Offer</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </td>
                                    <td className="p-2 text-amber-300">{app.deadline}</td>
                                    <td className="p-2"><button onClick={() => handleRemove(app.job.id)} className="text-red-400">Remove</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             )}
        </div>
    );

    return (
        <div className="w-full max-w-5xl mx-auto">
             <div className="flex justify-center mb-6 bg-slate-800/50 p-1 rounded-lg">
                <button onClick={() => setView('search')} className={`w-1/2 py-2 rounded-md font-semibold ${view === 'search' ? 'bg-slate-700 text-sky-300' : 'text-slate-400'}`}>Job Search</button>
                <button onClick={() => setView('tracker')} className={`w-1/2 py-2 rounded-md font-semibold ${view === 'tracker' ? 'bg-slate-700 text-sky-300' : 'text-slate-400'}`}>Tracker ({applications.length})</button>
             </div>
             {view === 'search' ? renderSearchView() : renderTrackerView()}
        </div>
    );
};

export default JobSearchFeature;