import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getPerformanceReport, generateSoftSkillSimulation } from '../services/geminiService';
import type { SoftSkillSimulation, PerformanceReport, MultimodalInput, KeyPerformanceDimensions } from '../types';
import SimulationPlayer from './SimulationPlayer';

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-4 my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
        <p className="text-sky-300">AI is working its magic...</p>
    </div>
);

const skillScenarios = {
    Communication: [
        "Giving constructive feedback to a peer",
        "Handling a disagreement over a project's direction",
        "Clarifying ambiguous requirements from a project manager",
        "Negotiating a deadline extension",
    ],
    Teamwork: [
        "Resolving a conflict with a team member",
        "Encouraging a quiet team member to share ideas",
        "Taking ownership of a mistake that affected the team",
        "Collaborating on a code review effectively",
    ],
    Leadership: [
        "Motivating the team during a difficult phase",
        "Delegating tasks fairly and effectively",
        "Mediating a dispute between two team members",
        "Presenting the team's work to stakeholders",
    ],
};

const PerformanceReportDashboard: React.FC<{ report: PerformanceReport; onRestart: () => void; }> = ({ report, onRestart }) => {
    const { audio_metrics, visual_signals, dimensions, improvement_plan, manager_summary, assumptions } = report;

    const MetricCard: React.FC<{ title: string, value: string | number, unit?: string, helpText?: string }> = ({ title, value, unit, helpText }) => (
        <div className="bg-slate-800/50 p-3 rounded-lg text-center relative group">
            <h4 className="text-xs text-slate-400">{title}</h4>
            <p className="text-2xl font-bold text-white">{value}<span className="text-base text-slate-300 ml-1">{unit}</span></p>
            {helpText && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-xs text-white p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{helpText}</div>}
        </div>
    );

    const DimensionScore: React.FC<{ title: string, dimension: { score: number, explanation: string } }> = ({ title, dimension }) => (
        <details className="bg-slate-800/50 p-3 rounded-lg" open>
            <summary className="font-semibold cursor-pointer flex justify-between items-center text-white">
                <span>{title}</span>
                <span className="text-xl font-bold text-sky-300">{dimension.score.toFixed(1)}/5</span>
            </summary>
            <p className="mt-2 text-sm text-slate-300 border-t border-slate-700 pt-2">{dimension.explanation}</p>
        </details>
    );

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-sky-300">Performance Report</h2>
                <button onClick={onRestart} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-full transition">Practice Again</button>
            </div>
            
            {assumptions.length > 0 && (
                <div className="bg-yellow-900/30 border border-yellow-700 p-4 rounded-lg text-yellow-300 text-sm">
                    <h4 className="font-bold">AI Assumptions</h4>
                    <ul className="list-disc pl-5 mt-1">{assumptions.map((a, i) => <li key={i}>{a}</li>)}</ul>
                </div>
            )}

            {/* Manager Summary */}
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                <h3 className="font-bold text-lg text-white mb-4">Manager-Ready Summary</h3>
                <blockquote className="border-l-4 border-sky-500 pl-4 text-slate-200 italic mb-4">{manager_summary.outcome}</blockquote>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div><h4 className="font-semibold text-green-400">Strengths</h4><ul className="list-disc pl-5 mt-1"> {manager_summary.strengths.map((s,i) => <li key={i}>{s}</li>)} </ul></div>
                    <div><h4 className="font-semibold text-red-400">Top Risks</h4><ul className="list-disc pl-5 mt-1"> {manager_summary.risks.map((r,i) => <li key={i}>{r}</li>)} </ul></div>
                    <div><h4 className="font-semibold text-slate-300">Next Action</h4><p>{manager_summary.next_action}</p></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    {/* Key Performance Dimensions */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h3 className="font-bold text-lg text-white mb-4">Key Performance Dimensions (Overall: {dimensions.overallScore.toFixed(1)}/5)</h3>
                        <div className="space-y-3">
                            <DimensionScore title="Content & Structure" dimension={dimensions.contentAndStructure} />
                            <DimensionScore title="Clarity & Brevity" dimension={dimensions.clarityAndBrevity} />
                            <DimensionScore title="Delivery & Vocal Performance" dimension={dimensions.deliveryAndVocalPerformance} />
                            <DimensionScore title="Body Language & Visual Engagement" dimension={dimensions.bodyLanguageAndVisualEngagement} />
                            <DimensionScore title="Slide & Visual Design" dimension={dimensions.slideAndVisualDesign} />
                            <DimensionScore title="Audience Engagement & Fit" dimension={dimensions.audienceEngagementAndFit} />
                            <DimensionScore title="Time Management" dimension={dimensions.timeManagement} />
                            <DimensionScore title="Confidence & Presence" dimension={dimensions.confidenceAndPresence} />
                            <DimensionScore title="Actionability & Impact" dimension={dimensions.actionabilityAndImpact} />
                        </div>
                    </div>
                     {/* Improvement Plan */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h3 className="font-bold text-lg text-white mb-4">Improvement Plan</h3>
                        <div className="space-y-4">
                            <div><h4 className="font-semibold text-sky-300">Focus Skills: {improvement_plan.focus_skills.join(', ')}</h4></div>
                            <div>
                                <h4 className="font-semibold text-slate-300 mb-2">3 Quick Wins (Fix in &lt;15 mins):</h4>
                                <ul className="list-decimal pl-5 space-y-1 text-sm">{improvement_plan.quick_wins.map((w,i) => <li key={i}>{w}</li>)}</ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-300 mb-2">Drills:</h4>
                                <div className="space-y-2">{improvement_plan.drills.map((d,i) => <div key={i} className="bg-slate-700/50 p-3 rounded-md text-sm"><p className="font-bold">{d.name} ({d.est_time_min} min)</p><p className="text-xs text-slate-400 mt-1">{d.how_to}</p></div>)}</div>
                            </div>
                            <div><h4 className="font-semibold text-slate-300">Tomorrow's Task:</h4><p className="text-sm bg-slate-700/50 p-3 rounded-md mt-1">{improvement_plan.tomorrow_task}</p></div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                     {/* Audio Metrics */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h3 className="font-bold text-lg text-white mb-4">Audio Metrics</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <MetricCard title="Pace" value={audio_metrics.wpm.toFixed(0)} unit="WPM" helpText="Ideal is 130-170 WPM"/>
                            <MetricCard title="Filler Words" value={audio_metrics.filler_per_min.toFixed(1)} unit="/min" helpText="Words like 'um', 'uh', 'like'"/>
                            <MetricCard title="Pause Rate" value={audio_metrics.pause_per_min.toFixed(1)} unit="/min" helpText="How often you pause"/>
                            <MetricCard title="Avg. Pause" value={audio_metrics.avg_pause_sec.toFixed(2)} unit="sec" helpText="Average duration of pauses"/>
                            <MetricCard title="Jargon Density" value={`${(audio_metrics.jargon_density * 100).toFixed(0)}%`} helpText="Ratio of technical to common words"/>
                            <MetricCard title="Pitch Range" value={audio_metrics.prosody_variability.pitch_iqr_hz.toFixed(0)} unit="Hz" helpText="Vocal variety in pitch"/>
                        </div>
                        {audio_metrics.clarity_flags.length > 0 && <div className="mt-4"><h4 className="font-semibold text-amber-400 text-sm">Clarity Flags:</h4><ul className="list-disc pl-5 text-sm text-amber-300/80">{audio_metrics.clarity_flags.map((f,i) => <li key={i}>{f}</li>)}</ul></div>}
                    </div>

                     {/* Visual Signals */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h3 className="font-bold text-lg text-white mb-4">Visual Signals</h3>
                        <div className="grid grid-cols-2 gap-3">
                             <MetricCard title="Eye Contact" value={visual_signals.eye_contact_ratio !== null ? `${(visual_signals.eye_contact_ratio * 100).toFixed(0)}%` : 'N/A'} helpText="Time spent looking at camera"/>
                             <MetricCard title="Gaze Aversions" value={visual_signals.gaze_aversion_count ?? 'N/A'} unit="/session" helpText="Looking away from camera"/>
                             <MetricCard title="Gestures" value={visual_signals.gesture_rate_per_min ?? 'N/A'} unit="/min" helpText="Hand or arm movements"/>
                             <MetricCard title="Smile Ratio" value={visual_signals.smile_ratio !== null ? `${(visual_signals.smile_ratio * 100).toFixed(0)}%` : 'N/A'} helpText="Time spent smiling"/>
                             <MetricCard title="Posture Shifts" value={visual_signals.posture_change_count ?? 'N/A'} unit="/session" helpText="Noticeable changes in posture"/>
                             <MetricCard title="Slide Sync" value={visual_signals.talk_to_visual_sync !== null ? `${(visual_signals.talk_to_visual_sync * 100).toFixed(0)}%` : 'N/A'} helpText="Speech aligned with visuals"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const SoftSkillsLabFeature: React.FC = () => {
    const [view, setView] = useState<'selection' | 'simulation' | 'recording' | 'analyzerDashboard'>('selection');
    
    // Simulation state
    const [activeSimulation, setActiveSimulation] = useState<SoftSkillSimulation | null>(null);

    // Analyzer state
    const [stream, setStream] = useState<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
    const [report, setReport] = useState<PerformanceReport | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const videoPreviewRef = useRef<HTMLVideoElement>(null);
    const timerRef = useRef<number | null>(null);

    // Get camera/mic stream when entering recording view
    useEffect(() => {
        if (view === 'recording') {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(mediaStream => {
                    setStream(mediaStream);
                    if (videoPreviewRef.current) {
                        videoPreviewRef.current.srcObject = mediaStream;
                    }
                })
                .catch(err => {
                    setError('Camera and microphone access is required. Please enable permissions and refresh.');
                    console.error("getUserMedia error:", err);
                });
        } else {
            // Cleanup stream when leaving view
            stream?.getTracks().forEach(track => track.stop());
            setStream(null);
        }

        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
    }, [view]);

    // Timer effect
    useEffect(() => {
        if (isRecording) {
            timerRef.current = window.setInterval(() => {
                setRecordingSeconds(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = null;
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRecording]);

    const handleStartSimulation = useCallback(async (scenario: string) => {
        setIsLoading(true);
        setError(null);
        setActiveSimulation(null);
        try {
            const simulationData = await generateSoftSkillSimulation(scenario);
            setActiveSimulation(simulationData);
            setView('simulation');
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create simulation.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleStartRecording = () => {
        if (!stream) return;
        setIsRecording(true);
        setRecordedUrl(null);
        setRecordingSeconds(0);
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        const chunks: Blob[] = [];
        
        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };
        
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setRecordedUrl(url);
        };
        
        recorder.start();
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleAnalyzePerformance = async () => {
        if (!recordedUrl) return;
        setIsLoading(true);
        setError(null);
        setReport(null);
        
        try {
            // In a real app, this transcript would be generated from the recorded audio using a Speech-to-Text API.
            const mockTranscript = "Hello everyone, today I want to talk about the future of AI. It's a very interesting topic. Um, as we can see, the progress has been, uh, very fast. In conclusion, we should be excited. Thank you.";
            const words = mockTranscript.split(/\s+/).filter(Boolean);
            const wordTimestamps = words.map((word, i) => {
                const start = (i / words.length) * recordingSeconds;
                return { word, start_sec: start, end_sec: start + 0.5 };
            });

            const mockInput: MultimodalInput = {
                transcript: mockTranscript,
                word_timestamps: wordTimestamps,
                audio_features: {
                    duration_sec: recordingSeconds,
                    pause_spans_sec: [[recordingSeconds * 0.3, recordingSeconds * 0.3 + 0.8]],
                    rms_envelope: [],
                    pitch_hz: [],
                    filler_words: [{ text: 'um', start_sec: recordingSeconds * 0.1 }],
                },
                video_signals: {
                    fps: 30,
                    gaze_on_camera_ratio: 0.8,
                    gaze_aversion_spans_sec: [[recordingSeconds * 0.6, recordingSeconds * 0.6 + 1.2]],
                    head_pose_degrees: [],
                    smile_prob: [],
                    gesture_events_sec: [recordingSeconds * 0.2, recordingSeconds * 0.75],
                    posture_change_sec: [],
                    slide_sync_markers_sec: [],
                }
            };

            const result = await getPerformanceReport(mockInput);
            setReport(result);
            setView('analyzerDashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to analyze. Please check your inputs and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetAnalyzer = () => {
        setView('selection');
        setReport(null);
        setError(null);
        setRecordedUrl(null);
        setIsRecording(false);
        setRecordingSeconds(0);
    };
    
    if (isLoading) return <LoadingSpinner />;
    
    if (view === 'simulation' && activeSimulation) {
        return <SimulationPlayer simulation={activeSimulation} onFinish={() => setView('selection')} />;
    }
    
    if (view === 'analyzerDashboard' && report) {
        return <PerformanceReportDashboard report={report} onRestart={resetAnalyzer} />;
    }
    
    if (view === 'recording') {
        return (
             <div className="w-full max-w-4xl mx-auto">
                 <button onClick={() => setView('selection')} className="text-sky-400 text-sm mb-4">&larr; Back to Soft Skills Lab</button>
                 <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-sky-300 mb-2">Recording Booth</h2>
                        <p className="text-slate-400">Record your presentation. When you're done, click Analyze to get your report.</p>
                    </div>
                     {error && <p className="text-red-400 bg-red-900/30 p-3 rounded-md">{error}</p>}
                     
                     <div className="bg-slate-900/50 rounded-lg aspect-video">
                        <video ref={videoPreviewRef} autoPlay muted playsInline className={`w-full h-full rounded-lg ${recordedUrl ? 'hidden' : 'block'}`} />
                        {recordedUrl && <video src={recordedUrl} controls className="w-full h-full rounded-lg" />}
                     </div>

                     <div className="text-center">
                        {isRecording ? (
                            <div className="flex items-center justify-center gap-4">
                                <button onClick={handleStopRecording} className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-full">
                                    Stop Recording
                                </button>
                                <div className="text-2xl font-mono text-white bg-slate-700 px-4 py-2 rounded-md">
                                    {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:{String(recordingSeconds % 60).padStart(2, '0')}
                                </div>
                            </div>
                        ) : (
                            <button onClick={handleStartRecording} disabled={!stream} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-full disabled:bg-slate-600">
                                Start Recording
                            </button>
                        )}
                    </div>
                     
                    {recordedUrl && !isLoading && (
                        <div className="border-t border-slate-700 pt-6 space-y-4 animate-fade-in text-center">
                            <h3 className="text-lg font-semibold text-white">Ready for Analysis</h3>
                            <p className="text-sm text-slate-400">Your recording is ready. Click below to get your AI-powered performance report.</p>
                            <div className="flex justify-center gap-4">
                                <button onClick={handleStartRecording} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-6 rounded-full">
                                    Record Again
                                </button>
                                <button onClick={handleAnalyzePerformance} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-full">
                                    Analyze Performance
                                </button>
                            </div>
                        </div>
                    )}
                 </div>
             </div>
        );
    }
    
    // Default view: 'selection'
    return (
        <div className="w-full max-w-5xl mx-auto space-y-10">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-sky-300 mb-2">Soft Skills Lab</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">Practice crucial workplace scenarios or hone your presentation skills in a safe, AI-powered environment.</p>
            </div>
            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center max-w-2xl mx-auto">
                    <h3 className="font-bold">Error</h3>
                    <p>{error}</p>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-sky-800 to-slate-800 p-6 rounded-2xl border border-sky-600 flex flex-col items-center text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Video & Audio Performance Analyzer</h3>
                    <p className="text-slate-300 text-sm mb-4">Record yourself presenting and get detailed AI feedback on delivery, structure, and confidence.</p>
                    <button onClick={() => setView('recording')} className="mt-auto bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-6 rounded-full">
                        Start Analyzing
                    </button>
                </div>
                
                 <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-4">Interactive Scenarios</h3>
                    <p className="text-sm text-slate-400 mb-4">Navigate text-based workplace situations to improve communication, teamwork, and leadership.</p>
                     <details>
                        <summary className="font-semibold cursor-pointer text-sky-400">Choose a scenario</summary>
                         <div className="mt-4 space-y-3">
                             {Object.entries(skillScenarios).map(([category, scenarios]) => (
                                 <div key={category}>
                                     <h4 className="font-semibold text-slate-300 mb-2">{category}</h4>
                                     {scenarios.map(scenario => (
                                        <button key={scenario} onClick={() => handleStartSimulation(scenario)} className="w-full text-left bg-slate-700/50 hover:bg-slate-600/50 p-3 rounded-md text-sky-300 transition text-sm">
                                            {scenario}
                                        </button>
                                     ))}
                                 </div>
                             ))}
                        </div>
                     </details>
                </div>
            </div>
        </div>
    );
};

export default SoftSkillsLabFeature;
