
import React from 'react';
import { ROLES, SKILL_LEVELS, YEARS } from '../constants';

interface RoadmapFormProps {
  role: string;
  setRole: (role: string) => void;
  year: number;
  setYear: (year: number) => void;
  skillLevel: string;
  setSkillLevel: (level: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const RoadmapForm: React.FC<RoadmapFormProps> = ({
  role,
  setRole,
  year,
  setYear,
  skillLevel,
  setSkillLevel,
  onSubmit,
  isLoading
}) => {
  return (
    <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Role Selection */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-sky-300 mb-2">
            Desired Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-slate-700 text-white border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 transition"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Year Selection */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-sky-300 mb-2">
            Current Year
          </label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full bg-slate-700 text-white border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 transition"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>Year {y}</option>
            ))}
          </select>
        </div>
        
        {/* Skill Level Selection */}
        <div>
          <label htmlFor="skillLevel" className="block text-sm font-medium text-sky-300 mb-2">
            Skill Level
          </label>
          <select
            id="skillLevel"
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
            className="w-full bg-slate-700 text-white border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 transition"
          >
            {SKILL_LEVELS.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-full transition-transform transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isLoading ? 'Generating...' : '✨ Generate My Roadmap'}
        </button>
      </div>
    </div>
  );
};

export default RoadmapForm;
