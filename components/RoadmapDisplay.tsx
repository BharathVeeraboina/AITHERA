import React from 'react';
import type { Roadmap, CompletedMilestone } from '../types';
import MilestoneItem from './MilestoneItem';

interface RoadmapDisplayProps {
  roadmap: Roadmap;
  completedMilestones: CompletedMilestone[];
  onToggleMilestone: (id: string) => void;
}

const RoadmapDisplay: React.FC<RoadmapDisplayProps> = ({ roadmap, completedMilestones, onToggleMilestone }) => {
  return (
    <div className="mt-12 w-full max-w-4xl mx-auto space-y-8">
      {roadmap.years.map((yearData) => (
        <div key={yearData.year} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <h2 className="text-3xl font-bold text-white mb-6 border-b-2 border-slate-600 pb-3">
            Year {yearData.year}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {yearData.semesters.map((semester) => (
              <div key={semester.name} className="bg-slate-800 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-sky-400 mb-4">{semester.name}</h3>
                <div className="space-y-4">
                  {semester.milestones.map((milestone, index) => {
                    const milestoneId = `${yearData.year}-${semester.name}-${milestone.title}`;
                    return (
                      <MilestoneItem 
                        key={index} 
                        milestone={milestone} 
                        milestoneId={milestoneId}
                        isCompleted={completedMilestones.some(m => m.id === milestoneId)}
                        onToggle={onToggleMilestone}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoadmapDisplay;