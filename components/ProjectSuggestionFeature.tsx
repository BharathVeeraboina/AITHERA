import React, { useState, useCallback } from 'react';
import { ROLES } from '../constants';
import { generateProjectSuggestions } from '../services/geminiService';
import type { ProjectSuggestion } from '../types';
import ProjectCard from './ProjectCard';

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4 my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
        <p className="text-sky-300">AI is brainstorming project ideas...</p>
    </div>
);

const ProjectSuggestionFeature: React.FC = () => {
    const [role, setRole] = useState<string>(ROLES[0]);
    const [skills, setSkills] = useState<string>('e.g., React, Python, SQL');
    const [projects, setProjects] = useState<ProjectSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSuggestProjects = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setProjects([]);
        try {
            const results = await generateProjectSuggestions(role, skills);
            setProjects(results);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [role, skills]);

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Input Form */}
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 mb-10">
                <h2 className="text-2xl font-bold text-sky-300 mb-2">Project Suggestion Hub</h2>
                <p className="text-slate-400 mb-6">Tell us your target role and skills, and our AI will suggest relevant portfolio projects.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label htmlFor="role-project" className="block text-sm font-medium text-sky-300 mb-2">
                            Target Role
                        </label>
                        <select
                            id="role-project"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-slate-700 text-white border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 transition"
                        >
                            {ROLES.map((r) => (<option key={r} value={r}>{r}</option>))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="skills-project" className="block text-sm font-medium text-sky-300 mb-2">
                            Your Skills
                        </label>
                        <input
                            id="skills-project"
                            type="text"
                            value={skills}
                             onFocus={() => skills === 'e.g., React, Python, SQL' && setSkills('')}
                             onBlur={() => skills === '' && setSkills('e.g., React, Python, SQL')}
                            onChange={(e) => setSkills(e.target.value)}
                            className="w-full bg-slate-700 text-white border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 transition"
                        />
                    </div>
                </div>
                <div className="text-center">
                    <button
                        onClick={handleSuggestProjects}
                        disabled={isLoading}
                        className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Thinking...' : '💡 Suggest Projects'}
                    </button>
                </div>
            </div>

            {/* Results */}
            <div>
                {isLoading && <LoadingSpinner />}
                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center max-w-2xl mx-auto">
                        <h3 className="font-bold">Suggestion Failed</h3>
                        <p>{error}</p>
                    </div>
                )}
                {projects.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {projects.map((project, index) => (
                            <ProjectCard key={index} project={project} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectSuggestionFeature;