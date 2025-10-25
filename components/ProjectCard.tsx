import React from 'react';
import type { ProjectSuggestion } from '../types';

interface ProjectCardProps {
  project: ProjectSuggestion;
}

const getDifficultyClass = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-green-900/70 text-green-300';
    case 'Intermediate':
      return 'bg-yellow-900/70 text-yellow-300';
    case 'Advanced':
      return 'bg-red-900/70 text-red-300';
    default:
      return 'bg-slate-700 text-slate-300';
  }
};

// SVG Icons for different sections
const CollaborationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
    </svg>
);

const GithubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" viewBox="0 0 20 20" fill="currentColor" >
        <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.418 2.865 8.166 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.942.359.308.678.92.678 1.852 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0020 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
    </svg>
);

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg flex flex-col space-y-4 hover:border-sky-500 transition-all duration-300">
        {/* Header */}
        <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-sky-300">{project.title}</h3>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getDifficultyClass(project.difficulty)}`}>
                {project.difficulty}
            </span>
        </div>
        
        {/* Description */}
        <p className="text-slate-300 text-sm">{project.description}</p>

        {/* Technologies */}
        <div>
             <h4 className="font-semibold text-slate-400 text-sm mb-2">Technologies</h4>
             <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, index) => (
                <span key={index} className="px-2 py-1 text-xs font-mono rounded-md bg-sky-900/70 text-sky-300">
                    {tech}
                </span>
                ))}
            </div>
        </div>

        {/* Collaboration Corner */}
        <div className="bg-slate-700/40 p-3 rounded-lg">
            <h4 className="font-semibold text-teal-300 text-sm mb-1">
                <CollaborationIcon />
                Collaboration Corner
            </h4>
            <p className="text-slate-300 text-xs">{project.collaborationIdea}</p>
        </div>
        
        {/* GitHub Kickstart */}
        <div className="bg-slate-700/40 p-3 rounded-lg">
            <h4 className="font-semibold text-purple-300 text-sm mb-1">
                <GithubIcon />
                GitHub Kickstart
            </h4>
            <p className="text-slate-300 text-xs">{project.githubPrompt}</p>
        </div>

    </div>
  );
};

export default ProjectCard;