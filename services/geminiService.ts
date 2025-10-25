

import { GoogleGenAI, Type } from "@google/genai";
import type { Roadmap, InterviewQuestion, Feedback, AIResumeAnalysis, ResumeData, ProjectSuggestion, CodingChallenge, ChallengeFeedback, IndustryInsights, CareerRoleDetails, JobListing, DashboardSuggestion, ProgressReport, SoftSkillSimulation, PlatformFeedback, AIFeedbackAnalysis, InterviewType, ChatMessage, PerformanceReport, CampusRecruitmentTest, InterviewReview, FAIQ, Puzzle, CareerGuide, MultimodalInput } from '../types';
import { ROLES } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Generic helper to call Gemini with a schema and parse the JSON response
async function callGeminiWithSchema(prompt: string, schema: object) {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error calling Gemini API:", error, { prompt });
        throw new Error("The AI failed to generate a valid response. Please try again.");
    }
}

const roadmapSchema = {
  type: Type.OBJECT,
  properties: {
    years: {
      type: Type.ARRAY,
      description: "An array of 4 academic years.",
      items: {
        type: Type.OBJECT,
        properties: {
          year: { type: Type.INTEGER, description: "The academic year number (e.g., 1, 2, 3, 4)." },
          semesters: {
            type: Type.ARRAY,
            description: "The semesters within the academic year, typically 'Fall' and 'Spring'.",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "The name of the semester (e.g., 'Fall Semester')." },
                milestones: {
                  type: Type.ARRAY,
                  description: "2-3 key learning milestones for the semester.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING, description: "The title of the milestone." },
                      description: { type: Type.STRING, description: "A brief description of the milestone, explaining its importance." },
                      technologies: {
                        type: Type.ARRAY,
                        description: "A list of relevant technologies, frameworks, or concepts to learn.",
                        items: { type: Type.STRING }
                      }
                    },
                    required: ["title", "description", "technologies"]
                  }
                }
              },
              required: ["name", "milestones"]
            }
          }
        },
        required: ["year", "semesters"]
      }
    }
  },
  required: ["years"]
};

const questionsSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      description: "An array of exactly 5 interview questions.",
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING, description: "The interview question text." },
          category: { type: Type.STRING, enum: ["Technical", "Behavioral", "System Design", "Algorithm"], description: "The category of the question." }
        },
        required: ["question", "category"]
      }
    }
  },
  required: ["questions"]
};

const feedbackSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.INTEGER, description: "A score from 1 to 10 evaluating the answer." },
    strengths: { type: Type.STRING, description: "A paragraph highlighting the strengths of the answer." },
    areasForImprovement: { type: Type.STRING, description: "A paragraph suggesting areas for improvement." },
    suggestedAnswer: { type: Type.STRING, description: "An example of a better or more complete answer." }
  },
  required: ["overallScore", "strengths", "areasForImprovement", "suggestedAnswer"]
};

const resumeAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        ats: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.INTEGER, description: "ATS compatibility score from 0 to 100." },
                suggestions: {
                    type: Type.ARRAY,
                    description: "3-4 specific suggestions to improve the ATS score.",
                    items: { type: Type.STRING }
                }
            },
            required: ["score", "suggestions"]
        },
        keywords: {
            type: Type.OBJECT,
            properties: {
                suggestedKeywords: {
                    type: Type.ARRAY,
                    description: "A list of 5-10 important keywords missing from the resume but present in the job description.",
                    items: { type: Type.STRING }
                },
                keywordAnalysis: { type: Type.STRING, description: "A brief analysis of keyword usage and why the suggestions are important." }
            },
            required: ["suggestedKeywords", "keywordAnalysis"]
        },
        generatedSummary: { type: Type.STRING, description: "A professionally written 2-4 sentence executive summary based on the resume content." },
        improvements: {
            type: Type.OBJECT,
            properties: {
                overallFeedback: { type: Type.STRING, description: "A general summary of feedback for the resume." },
                sectionFeedback: {
                    type: Type.ARRAY,
                    description: "An array of specific feedback points for different resume sections.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            section: { type: Type.STRING, enum: ['Summary', 'Experience', 'Projects', 'Skills', 'Education', 'Formatting'], description: "The section of the resume." },
                            feedback: { type: Type.STRING, description: "Actionable feedback for this section." }
                        },
                        required: ["section", "feedback"]
                    }
                }
            },
            required: ["overallFeedback", "sectionFeedback"]
        }
    },
    required: ["ats", "keywords", "generatedSummary", "improvements"]
};

const projectSuggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        projects: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    difficulty: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] },
                    technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                    collaborationIdea: { type: Type.STRING },
                    githubPrompt: { type: Type.STRING }
                },
                required: ["title", "description", "difficulty", "technologies", "collaborationIdea", "githubPrompt"]
            }
        }
    },
    required: ["projects"]
};

const codingChallengeSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING, description: "A detailed description of the problem, including what the function should do. Use markdown for formatting." },
        examples: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    input: { type: Type.STRING },
                    output: { type: Type.STRING }
                },
                required: ["input", "output"]
            }
        },
        constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
        hint: { type: Type.STRING }
    },
    required: ["title", "description", "examples", "constraints", "hint"]
};

const challengeFeedbackSchema = {
    type: Type.OBJECT,
    properties: {
        correctness: { type: Type.STRING, description: "Assessment of logical correctness." },
        efficiency: { type: Type.STRING, description: "Big O time/space complexity analysis." },
        codeQuality: { type: Type.STRING, description: "Review of readability, style, and best practices." },
        suggestedSolution: { type: Type.STRING, description: "An optimal or alternative solution in the same language." }
    },
    required: ["correctness", "efficiency", "codeQuality", "suggestedSolution"]
};

const industryInsightsSchema = {
    type: Type.OBJECT,
    properties: {
        trends: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["title", "explanation"] } },
        companies: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, relevance: { type: Type.STRING } }, required: ["name", "description", "relevance"] } },
        networking: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, name: { type: Type.STRING }, description: { type: Type.STRING }, link: { type: Type.STRING } }, required: ["type", "name", "description", "link"] } }
    },
    required: ["trends", "companies", "networking"]
};

const careerRoleDetailsSchema = {
    type: Type.OBJECT,
    properties: {
        roleName: { type: Type.STRING },
        description: { type: Type.STRING },
        responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
        requiredSkills: { type: Type.OBJECT, properties: { technical: { type: Type.ARRAY, items: { type: Type.STRING } }, soft: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["technical", "soft"] },
        careerProgression: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { level: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["level", "description"] } },
        alternativePaths: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, reason: { type: Type.STRING } }, required: ["name", "reason"] } }
    },
    required: ["roleName", "description", "responsibilities", "requiredSkills", "careerProgression", "alternativePaths"]
};

const jobListingsSchema = {
    type: Type.OBJECT,
    properties: {
        jobs: {
            type: Type.ARRAY,
            description: "An array of 5-10 job listings.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    company: { type: Type.STRING },
                    location: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['Internship', 'Full-Time', 'Part-Time'] },
                    description: { type: Type.STRING },
                    requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
                    applyLink: { type: Type.STRING },
                    postedDate: { type: Type.STRING, description: "A date in YYYY-MM-DD format." },
                    deadline: { type: Type.STRING, description: "A date in YYYY-MM-DD format." }
                },
                required: ["id", "title", "company", "location", "type", "description", "requirements", "applyLink", "postedDate", "deadline"]
            }
        }
    },
    required: ["jobs"]
};

const dashboardSuggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            description: "An array of 3 personalized suggestions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    reasoning: { type: Type.STRING },
                    actionableStep: { type: Type.STRING }
                },
                required: ["title", "reasoning", "actionableStep"]
            }
        }
    },
    required: ["suggestions"]
};

const progressReportSchema = {
    type: Type.OBJECT,
    properties: {
        overallSummary: { type: Type.STRING },
        keyAchievements: { type: Type.ARRAY, items: { type: Type.STRING } },
        strengthsDemonstrated: { type: Type.STRING },
        areasForFocus: { type: Type.ARRAY, items: { type: Type.STRING } },
        suggestedNextSteps: { type: Type.STRING }
    },
    required: ["overallSummary", "keyAchievements", "strengthsDemonstrated", "areasForFocus", "suggestedNextSteps"]
};

const softSkillSimulationSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        startingStepId: { type: Type.STRING },
        steps: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    situation: { type: Type.STRING },
                    choices: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING },
                                feedback: { type: Type.STRING },
                                nextStepId: { type: Type.STRING }
                            },
                            required: ["text", "feedback", "nextStepId"]
                        }
                    }
                },
                required: ["id", "situation", "choices"]
            }
        }
    },
    required: ["title", "description", "startingStepId", "steps"]
};

const keyPerformanceDimensionsSchema = {
    type: Type.OBJECT,
    properties: {
        contentAndStructure: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER, minimum: 1, maximum: 5 }, explanation: { type: Type.STRING } }, required: ["score", "explanation"] },
        clarityAndBrevity: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER, minimum: 1, maximum: 5 }, explanation: { type: Type.STRING } }, required: ["score", "explanation"] },
        deliveryAndVocalPerformance: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER, minimum: 1, maximum: 5 }, explanation: { type: Type.STRING } }, required: ["score", "explanation"] },
        bodyLanguageAndVisualEngagement: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER, minimum: 1, maximum: 5 }, explanation: { type: Type.STRING } }, required: ["score", "explanation"] },
        slideAndVisualDesign: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER, minimum: 1, maximum: 5 }, explanation: { type: Type.STRING } }, required: ["score", "explanation"] },
        audienceEngagementAndFit: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER, minimum: 1, maximum: 5 }, explanation: { type: Type.STRING } }, required: ["score", "explanation"] },
        timeManagement: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER, minimum: 1, maximum: 5 }, explanation: { type: Type.STRING } }, required: ["score", "explanation"] },
        confidenceAndPresence: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER, minimum: 1, maximum: 5 }, explanation: { type: Type.STRING } }, required: ["score", "explanation"] },
        actionabilityAndImpact: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER, minimum: 1, maximum: 5 }, explanation: { type: Type.STRING } }, required: ["score", "explanation"] },
        overallScore: { type: Type.NUMBER, minimum: 1, maximum: 5 },
    },
    required: ["contentAndStructure", "clarityAndBrevity", "deliveryAndVocalPerformance", "bodyLanguageAndVisualEngagement", "slideAndVisualDesign", "audienceEngagementAndFit", "timeManagement", "confidenceAndPresence", "actionabilityAndImpact", "overallScore"],
};


const performanceReportSchema = {
    type: Type.OBJECT,
    properties: {
        session_id: { type: Type.STRING },
        timestamp: { type: Type.STRING, format: "date-time" },
        assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
        audio_metrics: {
            type: Type.OBJECT,
            properties: {
                wpm: { type: Type.NUMBER },
                filler_per_min: { type: Type.NUMBER },
                pause_per_min: { type: Type.NUMBER },
                avg_pause_sec: { type: Type.NUMBER },
                prosody_variability: {
                    type: Type.OBJECT,
                    properties: {
                        pitch_iqr_hz: { type: Type.NUMBER },
                        volume_iqr_db: { type: Type.NUMBER },
                    },
                    required: ["pitch_iqr_hz", "volume_iqr_db"],
                },
                jargon_density: { type: Type.NUMBER },
                clarity_flags: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["wpm", "filler_per_min", "pause_per_min", "avg_pause_sec", "prosody_variability", "jargon_density", "clarity_flags"],
        },
        visual_signals: {
            type: Type.OBJECT,
            properties: {
                eye_contact_ratio: { type: Type.NUMBER },
                gaze_aversion_count: { type: Type.NUMBER },
                head_stability_index: { type: Type.NUMBER },
                gesture_rate_per_min: { type: Type.NUMBER },
                smile_ratio: { type: Type.NUMBER },
                talk_to_visual_sync: { type: Type.NUMBER },
                posture_change_count: { type: Type.NUMBER },
            },
            required: ["eye_contact_ratio", "gaze_aversion_count", "head_stability_index", "gesture_rate_per_min", "smile_ratio", "talk_to_visual_sync", "posture_change_count"],
        },
        dimensions: keyPerformanceDimensionsSchema,
        improvement_plan: {
            type: Type.OBJECT,
            properties: {
                focus_skills: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 2, maxItems: 2 },
                drills: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            how_to: { type: Type.STRING },
                            est_time_min: { type: Type.NUMBER },
                        },
                        required: ["name", "how_to", "est_time_min"],
                    },
                    minItems: 3,
                    maxItems: 5,
                },
                quick_wins: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 3, maxItems: 3 },
                tomorrow_task: { type: Type.STRING },
            },
            required: ["focus_skills", "drills", "quick_wins", "tomorrow_task"],
        },
        manager_summary: {
            type: Type.OBJECT,
            properties: {
                outcome: { type: Type.STRING },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 2, maxItems: 2 },
                risks: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 2, maxItems: 2 },
                next_action: { type: Type.STRING },
            },
            required: ["outcome", "strengths", "risks", "next_action"],
        },
    },
    required: ["session_id", "timestamp", "assumptions", "audio_metrics", "visual_signals", "dimensions", "improvement_plan", "manager_summary"],
};

const feedbackAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        positiveThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
        areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
        actionableSuggestions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    suggestion: { type: Type.STRING },
                    reasoning: { type: Type.STRING }
                },
                required: ["suggestion", "reasoning"]
            }
        }
    },
    required: ["positiveThemes", "areasForImprovement", "actionableSuggestions"]
};

// --- New Schemas for Interview Prep Hub ---

const campusTestSchema = {
    type: Type.OBJECT,
    properties: {
        companyName: { type: Type.STRING },
        testFormat: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    questions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                questionText: { type: Type.STRING },
                                type: { type: Type.STRING, enum: ['MCQ', 'Coding', 'Short Answer'] },
                                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                answer: { type: Type.STRING }
                            },
                            required: ["questionText", "type"]
                        }
                    }
                },
                required: ["title", "questions"]
            }
        }
    },
    required: ["companyName", "testFormat"]
};

const interviewReviewSchema = {
    type: Type.OBJECT,
    properties: {
        companyName: { type: Type.STRING },
        summary: { type: Type.STRING },
        rounds: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    roundName: { type: Type.STRING },
                    description: { type: Type.STRING },
                    commonQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["roundName", "description", "commonQuestions"]
            }
        }
    },
    required: ["companyName", "summary", "rounds"]
};

const faiqsSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    category: { type: Type.STRING, enum: ['Technical', 'Behavioral', 'HR'] },
                    domain: { type: Type.STRING }
                },
                required: ["question", "category", "domain"]
            }
        }
    },
    required: ["questions"]
};

const puzzleSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        hint: { type: Type.STRING },
        solution: { type: Type.STRING }
    },
    required: ["title", "description", "hint", "solution"]
};

const careerGuideSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        content: { type: Type.STRING, description: "The content of the guide, formatted with markdown for headings, lists, and bold text." }
    },
    required: ["title", "content"]
};

// --- API Functions ---

export const generateRoadmap = async (role: string, year: number, skillLevel: string): Promise<Roadmap> => {
    const prompt = `Generate a 4-year learning roadmap for a student aiming for a "${role}" role, who is currently in year ${year} and has a "${skillLevel}" skill level. Focus on practical skills and portfolio-worthy milestones for each semester. Provide 2-3 milestones per semester.`;
    return callGeminiWithSchema(prompt, roadmapSchema);
};

export const generateInterviewQuestions = async (role: string, interviewType: InterviewType, companyName?: string): Promise<InterviewQuestion[]> => {
    const prompt = `Generate 5 interview questions for a student interviewing for a "${role}" position. The interview type is "${interviewType}". ${companyName ? `The interview is specifically for the company: "${companyName}". Tailor questions accordingly.` : ''}`;
    const data = await callGeminiWithSchema(prompt, questionsSchema);
    return data.questions;
};

export const evaluateAnswer = async (role: string, question: string, answer: string): Promise<Feedback> => {
    const prompt = `Evaluate the following answer to an interview question for a "${role}" role.\n\nQuestion: "${question}"\n\nAnswer: "${answer}"\n\nProvide a score from 1-10, strengths, areas for improvement, and a suggested better answer.`;
    return callGeminiWithSchema(prompt, feedbackSchema);
};

export const analyzeResumeWithAI = async (resumeData: ResumeData, jobDescription: string, role: string): Promise<AIResumeAnalysis> => {
    const prompt = `Analyze the following resume for a "${role}" position against the provided job description. Provide an ATS score, keyword suggestions, a generated summary, and section-by-section improvement feedback.\n\nJob Description:\n${jobDescription}\n\nResume Data:\n${JSON.stringify(resumeData)}`;
    return callGeminiWithSchema(prompt, resumeAnalysisSchema);
};

export const generateProjectSuggestions = async (role: string, skills: string): Promise<ProjectSuggestion[]> => {
    const prompt = `Suggest 3 unique portfolio projects for a student targeting a "${role}" role with the following skills: ${skills}. For each project, provide a title, description, difficulty, technologies, a collaboration idea, and a GitHub prompt.`;
    const data = await callGeminiWithSchema(prompt, projectSuggestionsSchema);
    return data.projects;
};

export const generateCodingChallenge = async (role: string, difficulty: string): Promise<CodingChallenge> => {
    const prompt = `Generate a coding challenge suitable for a student preparing for a "${role}" role. The difficulty should be "${difficulty}". Provide a title, detailed description, examples, constraints, and a hint.`;
    return callGeminiWithSchema(prompt, codingChallengeSchema);
};

export const evaluateCodeSolution = async (challenge: CodingChallenge, userSolution: string, language: string): Promise<ChallengeFeedback> => {
    const prompt = `Evaluate the following code solution in ${language} for the given challenge.\n\nChallenge: ${JSON.stringify(challenge)}\n\nSolution:\n\`\`\`${language.toLowerCase()}\n${userSolution}\n\`\`\`\n\nProvide feedback on correctness, efficiency (Big O), code quality, and a suggested optimal solution.`;
    return callGeminiWithSchema(prompt, challengeFeedbackSchema);
};

export const getIndustryInsights = async (topic: string): Promise<IndustryInsights> => {
    const prompt = `Provide industry insights for the topic: "${topic}". Include 3 emerging trends, 3 interesting companies to watch with their relevance, and 3 networking resources (e.g., communities, events).`;
    return callGeminiWithSchema(prompt, industryInsightsSchema);
};

export const getCareerRoleDetails = async (role: string): Promise<CareerRoleDetails> => {
    const prompt = `Provide a detailed breakdown for the career role of a "${role}". Include a role description, key responsibilities, required technical and soft skills, a typical career progression path, and alternative career paths.`;
    return callGeminiWithSchema(prompt, careerRoleDetailsSchema);
};

export const generateJobListings = async (role: string): Promise<JobListing[]> => {
    const prompt = `Generate a list of 8 fictional but realistic job/internship listings for a student looking for a "${role}" position. Provide diverse companies, locations, and types (Full-Time, Internship). Ensure each has a unique ID, a posted date, and a deadline within the next month.`;
    const data = await callGeminiWithSchema(prompt, jobListingsSchema);
    return data.jobs;
};

export const generateDashboardSuggestions = async (summary: string): Promise<DashboardSuggestion[]> => {
    const prompt = `Based on this student's progress summary, generate 3 personalized and actionable suggestions to help them improve.\n\nSummary:\n${summary}`;
    const data = await callGeminiWithSchema(prompt, dashboardSuggestionsSchema);
    return data.suggestions;
};

export const generateProgressReportSummary = async (summary: string): Promise<ProgressReport> => {
    const prompt = `Based on the following activity data, generate a comprehensive progress report. Provide an overall summary, key achievements, strengths demonstrated, areas for focus, and suggested next steps.\n\nData:\n${summary}`;
    return callGeminiWithSchema(prompt, progressReportSchema);
};

export const generateSoftSkillSimulation = async (scenario: string): Promise<SoftSkillSimulation> => {
    const prompt = `Create a branching, text-based soft skill simulation for the following scenario: "${scenario}". The simulation should have a title, description, a starting step ID, and a series of steps. Each step must have a situation and 2-3 choices. Each choice needs text, immediate feedback, and a nextStepId. One path should lead to a positive outcome, others less so. Use "END" as the nextStepId to conclude a path. Create at least 4-5 steps in total to form a meaningful scenario.`;
    return callGeminiWithSchema(prompt, softSkillSimulationSchema);
};

export const getPerformanceReport = async (input: MultimodalInput): Promise<PerformanceReport> => {
    const systemInstruction = `You are an expert communications analyst. Implement a video+audio rehearsal analyzer that scores delivery and returns a structured performance report + improvement plan based on key performance dimensions.
GOAL: Given a rehearsal session (video+audio, or derived features), produce: 1) objective audio metrics, 2) visual behavior signals, 3) a 9-dimension score with explanations, 4) concrete, prioritized improvements and micro-drills, 5) a concise manager-ready summary. Return JSON ONLY that conforms to the provided schema.
SCORING DIMENSIONS:
- Content & Structure: Logical flow, clarity, story.
- Clarity & Brevity: WPM (ideal 130-170), filler words (<6/min), conciseness.
- Delivery / Vocal Performance: Tone, pace variation, pauses.
- Body Language / Visual Engagement: Eye contact, gestures, posture.
- Slide & Visual Design: Readability, visual alignment, words/slide (<30).
- Audience Engagement & Fit: Persona match, Q&A handling.
- Time Management: Adherence to time, pacing.
- Confidence & Presence: Combined score of non-verbal cues.
- Actionability / Impact: Clear call-to-action.
CONSTRAINTS: Return JSON ONLY. No prose outside JSON. If any input is missing, set related outputs to null and add a clear note in "assumptions". Be conservative with claims; prefer measurable signals over guesswork. Keep manager_summary <= 5 lines total.`;
    
    const prompt = `
    Mode: A
    transcript: "${input.transcript}"
    word_timestamps: ${JSON.stringify(input.word_timestamps)}
    audio_features: ${JSON.stringify(input.audio_features)}
    video_signals: ${JSON.stringify(input.video_signals)}
    Please return the PerformanceReport JSON only.
    `;
    
    // Using a separate `generateContent` call to include a system instruction.
     try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: performanceReportSchema,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error calling Gemini API for Performance Report:", error, { prompt });
        throw new Error("The AI failed to generate a valid performance report. Please check your inputs and try again.");
    }
};

export const analyzePlatformFeedback = async (feedback: PlatformFeedback[]): Promise<AIFeedbackAnalysis> => {
    const prompt = `Analyze the following user feedback for a student career platform. Identify the main positive themes, areas for improvement, and generate 3 concrete, actionable suggestions for the development team with reasoning.\n\nFeedback Data:\n${JSON.stringify(feedback)}`;
    return callGeminiWithSchema(prompt, feedbackAnalysisSchema);
};

export const getChatbotResponse = async (messages: ChatMessage[]): Promise<string> => {
    const history = messages.map(m => `${m.sender === 'user' ? 'User' : 'Recruiter'}: ${m.text}`).join('\n');
    const prompt = `You are a friendly and professional tech recruiter named Alex from Innovate Inc. Your goal is to have a natural conversation, ask about the student's interests, and answer their questions about the company or roles. Keep your responses concise and conversational. Continue the following conversation:\n\n${history}\nRecruiter:`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting chatbot response:", error);
        return "I'm sorry, I'm having trouble connecting right now. Could you repeat that?";
    }
};

// --- New API Functions for Interview Prep Hub ---

export const generateCampusTest = async (companyName: string): Promise<CampusRecruitmentTest> => {
    const prompt = `Generate a realistic but fictional campus recruitment test format for the company "${companyName}". Include 2-3 sections like 'Quantitative Aptitude', 'Technical MCQs', and 'Coding Round'. For each section, provide 2-3 sample questions with type, options (for MCQs), and the correct answer.`;
    return callGeminiWithSchema(prompt, campusTestSchema);
};

export const generateInterviewReview = async (companyName: string): Promise<InterviewReview> => {
    const prompt = `Generate a summary of a previous year's campus interview process for "${companyName}". Include a brief overall summary and details for 2-3 distinct rounds (e.g., 'Technical Round 1', 'HR Round'). For each round, describe its focus and list 3-4 commonly asked questions.`;
    return callGeminiWithSchema(prompt, interviewReviewSchema);
};

export const generateFaiqs = async (domain: string, category: string): Promise<FAIQ[]> => {
    const prompt = `Generate a list of 8 frequently asked interview questions (FAIQs). The questions should be for the domain "${domain}" and the category "${category}".`;
    const data = await callGeminiWithSchema(prompt, faiqsSchema);
    return data.questions;
};

export const generatePuzzle = async (): Promise<Puzzle> => {
    const prompt = `Generate a classic logic puzzle or brain teaser question often used in technical interviews. Provide a title, a clear description of the puzzle, a subtle hint, and the detailed solution.`;
    return callGeminiWithSchema(prompt, puzzleSchema);
};

export const generateCareerGuide = async (topic: string): Promise<CareerGuide> => {
    const prompt = `Write a concise and helpful career guide for a student on the topic: "${topic}". Use markdown for formatting, including headings, bullet points, and bold text to make it easy to read and actionable.`;
    return callGeminiWithSchema(prompt, careerGuideSchema);
};
