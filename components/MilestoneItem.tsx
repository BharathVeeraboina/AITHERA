import React from 'react';
import type { Milestone } from '../types';

interface MilestoneItemProps {
  milestone: Milestone;
  milestoneId: string;
  isCompleted: boolean;
  onToggle: (id: string) => void;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const MilestoneItem: React.FC<MilestoneItemProps> = ({ milestone, milestoneId, isCompleted, onToggle }) => {
  return (
    <div className={`p-4 rounded-lg transition-all duration-300 ${isCompleted ? 'bg-green-900/30' : 'bg-slate-700/50'}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 mt-1">
          <button
            onClick={() => onToggle(milestoneId)}
            aria-label={`Mark '${milestone.title}' as ${isCompleted ? 'incomplete' : 'complete'}`}
            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted ? 'bg-green-500 border-green-400 text-white' : 'bg-slate-800 border-slate-600 text-transparent'}`}
          >
            <CheckIcon />
          </button>
        </div>
        <div className="flex-1">
          <h4 className={`font-bold text-lg ${isCompleted ? 'text-green-300 line-through' : 'text-sky-300'}`}>
            {milestone.title}
          </h4>
          <p className={`mt-1 text-slate-300 text-sm ${isCompleted ? 'opacity-60' : ''}`}>
            {milestone.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {milestone.technologies.map((tech, index) => (
              <span key={index} className={`px-2 py-1 text-xs font-mono rounded-md ${isCompleted ? 'bg-green-800/50 text-green-300/70' : 'bg-sky-900/70 text-sky-300'}`}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneItem;