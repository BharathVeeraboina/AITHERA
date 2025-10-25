import React, { useState, useMemo } from 'react';
import type { SoftSkillSimulation, SimulationStep, SimulationChoice } from '../types';

interface SimulationPlayerProps {
    simulation: SoftSkillSimulation;
    onFinish: () => void;
}

const SimulationPlayer: React.FC<SimulationPlayerProps> = ({ simulation, onFinish }) => {
    const [currentStepId, setCurrentStepId] = useState<string>(simulation.startingStepId);
    const [userPath, setUserPath] = useState<{ step: SimulationStep, choice: SimulationChoice }[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [lastFeedback, setLastFeedback] = useState<string | null>(null);

    const currentStep = useMemo(() => {
        return simulation.steps.find(step => step.id === currentStepId);
    }, [currentStepId, simulation.steps]);

    const handleChoice = (choice: SimulationChoice) => {
        setLastFeedback(choice.feedback);
        setUserPath([...userPath, { step: currentStep!, choice }]);

        if (choice.nextStepId === 'END') {
            setIsFinished(true);
        } else {
            setCurrentStepId(choice.nextStepId);
        }
    };

    if (!currentStep && !isFinished) {
        return (
            <div className="text-center text-red-400">
                <p>Error: Simulation step not found. The scenario might be corrupted.</p>
                <button onClick={onFinish} className="mt-4 bg-sky-600 text-white py-2 px-4 rounded-md">Return to Lab</button>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-sky-300 mb-4">Simulation Complete</h2>
                <p className="text-slate-400 mb-6">Here's a summary of the path you took and the feedback received.</p>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                    {userPath.map((path, index) => (
                        <div key={index} className="bg-slate-700/50 p-3 rounded-lg">
                           <p className="text-slate-300 italic"><strong>Situation:</strong> "{path.step.situation}"</p>
                           <p className="mt-2 text-white"><strong>Your Choice:</strong> "{path.choice.text}"</p>
                           <p className="mt-2 text-amber-300 text-sm"><strong>Feedback:</strong> {path.choice.feedback}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-6 text-center">
                    <button onClick={onFinish} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-full transition">
                        Return to Soft Skills Lab
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-sky-300 mb-2">{simulation.title}</h2>
            <p className="text-sm text-slate-400 mb-6">{simulation.description}</p>
            
            <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700 min-h-[100px]">
                <p className="text-slate-200 leading-relaxed">{currentStep?.situation}</p>
            </div>

            {lastFeedback && (
                 <div className="my-4 p-3 bg-amber-900/30 border border-amber-700 rounded-lg text-amber-300 text-sm animate-fade-in">
                    <strong>Feedback:</strong> {lastFeedback}
                 </div>
            )}
            
            <div className="mt-6 space-y-3">
                <p className="text-slate-300 font-semibold">What do you do?</p>
                 {currentStep?.choices.map((choice, index) => (
                    <button
                        key={index}
                        onClick={() => handleChoice(choice)}
                        className="w-full text-left bg-sky-800/50 hover:bg-sky-700/50 p-4 rounded-md text-white transition"
                    >
                        {choice.text}
                    </button>
                ))}
            </div>

            <div className="text-right mt-6">
                <button onClick={onFinish} className="text-sm text-slate-500 hover:text-red-400">End Simulation</button>
            </div>
        </div>
    );
};

export default SimulationPlayer;