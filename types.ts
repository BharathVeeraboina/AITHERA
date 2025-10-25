// types.ts

// Core User and Role Types
export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
    id: string;
    name: string;
    role: UserRole;
}

// Types for Student Career Copilot Profile
export interface PersonalProfile {
    fullName: string;
    dateOfBirth: string; // YYYY-MM-DD
    contactNumber: string;
    email: string;
}

export interface CollegeProfile {
    collegeName: string;
    branch: string;
    yearOfStudy: number;
    enrollmentNumber: string;
    cgpa: string; // String to handle formats like 8.5/10
    activeBacklogs?: number | string; // string to allow empty input
    collegeEmail: string;
}

export interface CareerInterests {
    internshipExperience: string; // Textarea for details
    participatedInCampusInterview: 'Yes' | 'No' | '';
    preferredCompanies: string; // Comma separated string for simplicity
    jobRoleInterests: string; // Comma separated string
}

export interface StudentProfile {
    personal: PersonalProfile;
    college: CollegeProfile;
    interests: CareerInterests;
    resumeUrl?: string; // For the uploaded PDF name
    isVerified: boolean;
}

export interface Student extends User {
    role: 'student';
    profile: StudentProfile;
    roadmap: Roadmap | null;
    completedMilestones: CompletedMilestone[];
    interviewHistory: CompletedInterview[];
    challengeHistory: CompletedChallenge[];
    applications: Application[];
    integrations: Integrations;
    resumeData: ResumeData;
    platformFeedback: PlatformFeedback[];
    // Other student-specific data can go here
}

export interface Teacher extends User {
    role: 'teacher';
    studentIds: string[]; // List of student IDs this teacher mentors
}

export interface Admin extends User {
    role: 'admin';
}


export interface Milestone {
  title: string;
  description: string;
  technologies: string[];
}

export interface Semester {
  name: string;
  milestones: Milestone[];
}

export interface Year {
  year: number;
  semesters: Semester[];
}

export interface Roadmap {
  years: Year[];
}

export interface CompletedMilestone {
    id: string;
    completedAt: string; // ISO string date
}


// Types for Mock Interview Feature
export type InterviewType = 'General' | 'Behavioral Focus' | 'Technical Deep Dive' | 'Company-Specific' | 'Live Coding Assessment' | 'Full Simulation';

export interface InterviewQuestion {
  question: string;
  category: 'Technical' | 'Behavioral' | 'System Design' | 'Algorithm';
}

export interface Feedback {
  overallScore: number; // Score out of 10
  strengths: string;
  areasForImprovement: string;
  suggestedAnswer: string;
}

export interface CompletedInterview {
    id: string;
    question: InterviewQuestion;
    answer: string;
    feedback: Feedback;
    completedAt: string;
}

// Types for Recruiter Chatbot
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}


// Types for Resume Builder Feature
export interface PersonalDetails {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
}

export interface WorkExperience {
    id: string;
    jobTitle: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
}

export interface Education {
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    graduationDate: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    technologies: string;
    repoUrl: string;
    liveUrl: string;
}

export interface ResumeData {
    personalDetails: PersonalDetails;
    summary: string;
    experience: WorkExperience[];
    education: Education[];
    projects: Project[];
    skills: string[];
    teacherFeedback?: string; // New field for teacher comments
}

export interface ATSFeedback {
    score: number; // Score out of 100
    suggestions: string[];
}

export interface KeywordFeedback {
    suggestedKeywords: string[];
    keywordAnalysis: string;
}

export interface ResumeImprovementFeedback {
    overallFeedback: string;
    sectionFeedback: {
        section: 'Summary' | 'Experience' | 'Projects' | 'Skills' | 'Education' | 'Formatting';
        feedback: string;
    }[];
}

export interface AIResumeAnalysis {
    ats: ATSFeedback;
    keywords: KeywordFeedback;
    generatedSummary: string;
    improvements: ResumeImprovementFeedback;
}


// Types for Project Suggestion Feature
export interface ProjectSuggestion {
    title: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    technologies: string[];
    collaborationIdea: string;
    githubPrompt: string;
}

// Types for Challenge Bank Feature
export interface CodingChallenge {
    title: string;
    description: string;
    examples: {
        input: string;
        output: string;
    }[];
    constraints: string[];
    hint: string;
}

export interface ChallengeFeedback {
    correctness: string; // Assessment of logical correctness
    efficiency: string; // Big O time/space complexity analysis
    codeQuality: string; // Review of readability, style, and best practices
    suggestedSolution: string; // An optimal or alternative solution
}

export interface CompletedChallenge {
    id: string;
    challenge: CodingChallenge;
    userSolution: string;
    feedback: ChallengeFeedback;
    completedAt: string;
    difficulty: string;
}

// Types for Industry Hub Feature
export interface IndustryTrend {
    title: string;
    explanation: string;
}

export interface CompanyProfile {
    name: string;
    description: string;
    relevance: string; // Why they are a company to watch
}

export interface NetworkingResource {
    type: 'Online Community' | 'Event / Webinar' | 'Professional';
    name: string;
    description: string;
    link: string; // e.g., URL to a subreddit, event page, or a LinkedIn search query
}

export interface IndustryInsights {
    trends: IndustryTrend[];
    companies: CompanyProfile[];
    networking: NetworkingResource[];
}

// Types for Career Explorer Feature
export interface CareerPathStep {
    level: string; // e.g., 'Senior Developer', 'Tech Lead'
    description: string;
}

export interface AlternativeRole {
    name: string; // e.g., 'Product Manager'
    reason: string; // Why it's a good alternative
}

export interface CareerRoleDetails {
    roleName: string;
    description: string;
    responsibilities: string[];
    requiredSkills: {
        technical: string[];
        soft: string[];
    };
    careerProgression: CareerPathStep[];
    alternativePaths: AlternativeRole[];
}

// Types for Job Search Feature
export type JobType = 'Internship' | 'Full-Time' | 'Part-Time';
export type ApplicationStatus = 'Applied' | 'Interviewing' | 'Offer' | 'Rejected' | 'Saved';

export interface JobListing {
    id: string;
    title: string;
    company: string;
    location: string;
    type: JobType;
    description: string;
    requirements: string[];
    applyLink: string; // A fictional apply link
    postedDate: string; // ISO string date
    deadline: string; // ISO string date
}

export interface Application {
    job: JobListing;
    status: ApplicationStatus;
    appliedDate: string; // ISO string date
    deadline: string; // A fictional deadline date string
}

// Types for Performance Dashboard
export interface DashboardSuggestion {
    title: string;
    reasoning: string;
    actionableStep: string;
}

// Types for Progress Report Feature
export interface ProgressReport {
    overallSummary: string;
    keyAchievements: string[];
    strengthsDemonstrated: string;
    areasForFocus: string[];
    suggestedNextSteps: string;
}

// Types for Soft Skills Lab
export interface SimulationChoice {
    text: string; // The text on the button for the user to click
    feedback: string; // The immediate feedback or consequence of this choice
    nextStepId: string; // The ID of the next step, or a special "END" marker
}

export interface SimulationStep {
    id: string; // A unique ID for this step (e.g., "step_1")
    situation: string; // The text describing the current situation
    choices: SimulationChoice[];
}

export interface SoftSkillSimulation {
    title: string;
    description: string;
    startingStepId: string;
    steps: SimulationStep[];
}

// Types for Video & Audio Performance Analyzer
export interface AudioMetrics {
    wpm: number;
    filler_per_min: number;
    pause_per_min: number;
    avg_pause_sec: number;
    prosody_variability: {
        pitch_iqr_hz: number;
        volume_iqr_db: number;
    };
    jargon_density: number;
    clarity_flags: string[];
}

export interface VisualSignals {
    eye_contact_ratio: number | null;
    gaze_aversion_count: number | null;
    head_stability_index: number | null;
    gesture_rate_per_min: number | null;
    smile_ratio: number | null;
    talk_to_visual_sync: number | null;
    posture_change_count: number | null;
}

export interface KeyPerformanceDimensions {
    contentAndStructure: { score: number; explanation: string };
    clarityAndBrevity: { score: number; explanation: string };
    deliveryAndVocalPerformance: { score: number; explanation: string };
    bodyLanguageAndVisualEngagement: { score: number; explanation: string };
    slideAndVisualDesign: { score: number; explanation: string };
    audienceEngagementAndFit: { score: number; explanation: string };
    timeManagement: { score: number; explanation: string };
    confidenceAndPresence: { score: number; explanation: string };
    actionabilityAndImpact: { score: number; explanation: string };
    overallScore: number;
}


export interface ImprovementDrill {
    name: string;
    how_to: string;
    est_time_min: number;
}

export interface PerformanceImprovementPlan {
    focus_skills: [string, string];
    drills: ImprovementDrill[];
    quick_wins: [string, string, string];
    tomorrow_task: string;
}

export interface ManagerSummary {
    outcome: string;
    strengths: [string, string];
    risks: [string, string];
    next_action: string;
}

export interface PerformanceReport {
    session_id: string;
    timestamp: string;
    assumptions: string[];
    audio_metrics: AudioMetrics;
    visual_signals: VisualSignals;
    dimensions: KeyPerformanceDimensions;
    improvement_plan: PerformanceImprovementPlan;
    manager_summary: ManagerSummary;
}

// For Performance Analyzer Multimodal Input
export interface WordTimestamp {
    word: string;
    start_sec: number;
    end_sec: number;
}

export interface AudioFeatures {
    duration_sec: number;
    pause_spans_sec: [number, number][];
    rms_envelope: number[];
    pitch_hz: (number | null)[];
    filler_words: { text: string; start_sec: number }[];
}

export interface VideoSignals {
    fps: number;
    gaze_on_camera_ratio: number;
    gaze_aversion_spans_sec: [number, number][];
    head_pose_degrees: { t: number; yaw: number; pitch: number; roll: number }[];
    smile_prob: number[];
    gesture_events_sec: number[];
    posture_change_sec: number[];
    slide_sync_markers_sec: number[];
}

export interface MultimodalInput {
    transcript: string;
    word_timestamps: WordTimestamp[];
    audio_features: AudioFeatures;
    video_signals: VideoSignals;
}


// Types for Integrations Feature
export interface Integrations {
    github: string;
    linkedin: string;
    leetcode: string;
    hackerrank: string;
    codechef: string;
}

export interface GitHubRepo {
    id: number;
    name: string;
    html_url: string;
    description: string;
    language: string;
    stargazers_count: number;
}

// Types for Feedback Loop
export interface PlatformFeedback {
    id: string;
    feature: string; // The view name, e.g., 'roadmap', 'challenges'
    rating: number; // 1 to 5
    comment: string;
    submittedAt: string; // ISO string date
}

export interface AIFeedbackAnalysis {
    positiveThemes: string[];
    areasForImprovement: string[];
    actionableSuggestions: {
        suggestion: string;
        reasoning: string;
    }[];
}

// Types for Interview Prep Hub Expansion
export interface CampusQuestion {
    questionText: string;
    type: 'MCQ' | 'Coding' | 'Short Answer';
    options?: string[];
    answer?: string;
}

export interface CampusTestSection {
    title: string;
    questions: CampusQuestion[];
}

export interface CampusRecruitmentTest {
    companyName: string;
    testFormat: CampusTestSection[];
}

export interface InterviewReviewRound {
    roundName: string;
    description: string;
    commonQuestions: string[];
}

export interface InterviewReview {
    companyName: string;
    summary: string;
    rounds: InterviewReviewRound[];
}

export interface FAIQ {
    question: string;
    category: 'Technical' | 'Behavioral' | 'HR';
    domain: string;
}

export interface Puzzle {
    title: string;
    description: string;
    hint: string;
    solution: string;
}

export interface CareerGuide {
    title: string;
    content: string;
}
