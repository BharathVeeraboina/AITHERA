import type { Student, Teacher, Admin, AIResumeAnalysis } from '../types';

// Initial empty state for the resume data
const initialResumeData = {
    personalDetails: {
        name: 'Jane Doe',
        email: 'jane.doe@email.com',
        phone: '555-123-4567',
        linkedin: 'linkedin.com/in/janedoe',
        github: 'github.com/janedoe'
    },
    summary: 'Proactive and results-driven Computer Science student with a passion for developing innovative software solutions. Experienced in full-stack development with a focus on creating responsive and user-friendly web applications. Seeking to leverage skills in JavaScript, React, and Node.js to contribute to a dynamic engineering team.',
    experience: [],
    education: [],
    projects: [],
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'SQL', 'HTML/CSS', 'Git', 'Agile Methodologies', 'REST APIs', 'Jest'],
};


export const mockStudents: Student[] = [
    {
        id: 'student_1',
        name: 'Alice Johnson',
        role: 'student',
        profile: {
            personal: {
                fullName: 'Alice Johnson',
                dateOfBirth: '2002-08-15',
                contactNumber: '123-456-7890',
                email: 'alice.j@email.com',
            },
            college: {
                collegeName: 'State University of Technology',
                branch: 'Computer Science & Engineering',
                yearOfStudy: 3,
                enrollmentNumber: 'SUT2022CS001',
                cgpa: '8.8',
                activeBacklogs: 0,
                collegeEmail: 'alice.j@sut.edu',
            },
            interests: {
                internshipExperience: 'Summer Intern at TechCorp - Worked on frontend development for their flagship product using React.',
                participatedInCampusInterview: 'No',
                preferredCompanies: 'Google, Microsoft',
                jobRoleInterests: 'Software Developer, Frontend Developer',
            },
            resumeUrl: 'alice_johnson_resume.pdf',
            isVerified: true,
        },
        roadmap: null,
        completedMilestones: [
            { id: '1-Fall Semester-Foundations of Programming', completedAt: '2023-10-15T10:00:00Z' }
        ],
        interviewHistory: [],
        challengeHistory: [],
        applications: [],
        integrations: { github: 'alice-j', linkedin: 'https://linkedin.com/in/alicej', leetcode: '', hackerrank: '', codechef: '' },
        resumeData: {
            ...initialResumeData,
            personalDetails: { ...initialResumeData.personalDetails, name: 'Alice Johnson', email: 'alice.j@email.com' }
        },
        platformFeedback: []
    },
    {
        id: 'student_2',
        name: 'Bob Williams',
        role: 'student',
        profile: {
            personal: {
                fullName: 'Bob Williams',
                dateOfBirth: '',
                contactNumber: '',
                email: 'bob.w@email.com',
            },
            college: {
                collegeName: '',
                branch: 'Mechanical Engineering',
                yearOfStudy: 4,
                enrollmentNumber: '',
                cgpa: '',
                activeBacklogs: '',
                collegeEmail: '',
            },
            interests: {
                internshipExperience: '',
                participatedInCampusInterview: '',
                preferredCompanies: '',
                jobRoleInterests: '',
            },
            isVerified: false,
        },
        roadmap: null,
        completedMilestones: [],
        interviewHistory: [],
        challengeHistory: [],
        applications: [],
        integrations: { github: 'bob-w', linkedin: '', leetcode: '', hackerrank: '', codechef: '' },
        resumeData: {
            ...initialResumeData,
            personalDetails: { ...initialResumeData.personalDetails, name: 'Bob Williams', email: 'bob.w@email.com' }
        },
        platformFeedback: []
    },
     {
        id: 'student_3',
        name: 'Charlie Brown',
        role: 'student',
        profile: {
            personal: {
                fullName: 'Charlie Brown',
                dateOfBirth: '',
                contactNumber: '',
                email: 'charlie.b@email.com',
            },
            college: {
                collegeName: '',
                branch: 'Electrical Engineering',
                yearOfStudy: 2,
                enrollmentNumber: '',
                cgpa: '',
                activeBacklogs: '',
                collegeEmail: '',
            },
            interests: {
                internshipExperience: '',
                participatedInCampusInterview: '',
                preferredCompanies: '',
                jobRoleInterests: '',
            },
            isVerified: false,
        },
        roadmap: null,
        completedMilestones: [],
        interviewHistory: [],
        challengeHistory: [],
        applications: [],
        integrations: { github: 'charlie-b', linkedin: '', leetcode: '', hackerrank: '', codechef: '' },
        resumeData: {
            ...initialResumeData,
            personalDetails: { ...initialResumeData.personalDetails, name: 'Charlie Brown', email: 'charlie.b@email.com' }
        },
        platformFeedback: []
    }
];

export const mockTeachers: Teacher[] = [
    {
        id: 'teacher_1',
        name: 'Dr. Evelyn Reed',
        role: 'teacher',
        studentIds: ['student_1', 'student_2']
    },
    {
        id: 'teacher_2',
        name: 'Mr. Johnathan Chen',
        role: 'teacher',
        studentIds: ['student_3']
    }
];

export const mockAdmin: Admin = {
    id: 'admin_1',
    name: 'Principal Thompson',
    role: 'admin'
};

export const mockAIAnalysis: AIResumeAnalysis = {
    ats: {
        score: 78,
        suggestions: [
            "Include more quantifiable results in your experience bullet points (e.g., 'Increased performance by 15%').",
            "Ensure skills listed in the job description are present in your skills section.",
            "Use standard section headers like 'Work Experience' instead of 'My Career Journey'."
        ]
    },
    keywords: {
        suggestedKeywords: ['CI/CD', 'Docker', 'Kubernetes', 'Agile', 'Microservices'],
        keywordAnalysis: "The job description emphasizes DevOps practices. Adding keywords like 'CI/CD' and 'Docker' will significantly improve your match score."
    },
    generatedSummary: "Results-oriented Software Developer with hands-on experience in building, testing, and deploying scalable web applications. Proficient in JavaScript, React, and Node.js, with a strong understanding of RESTful APIs and modern frontend frameworks. Eager to contribute to a collaborative team and solve complex technical challenges.",
    improvements: {
        overallFeedback: "This is a strong resume for a junior developer role. To elevate it, focus on showcasing the impact of your work with metrics and aligning your skills more closely with the target job description.",
        sectionFeedback: [
            {
                section: 'Summary',
                feedback: "The summary is good but could be more tailored. Try incorporating 1-2 key requirements from the job description directly."
            },
            {
                section: 'Experience',
                feedback: "Use the STAR (Situation, Task, Action, Result) method for bullet points. For example, instead of 'Developed a new feature', try 'Developed a new user authentication feature (Action) to improve security (Task), resulting in a 25% reduction in support tickets (Result)'."
            },
            {
                section: 'Projects',
                feedback: "Your project descriptions are clear. Add links to the live demo and GitHub repository for each project to allow recruiters to see your work."
            },
            {
                section: 'Skills',
                feedback: "Organize skills into categories like 'Languages', 'Frameworks/Libraries', and 'Tools' for better readability."
            },
            {
                section: 'Formatting',
                feedback: 'The resume has a clean, professional format. Ensure consistent font sizes and margins throughout the document.'
            },
             {
                section: 'Education',
                feedback: 'Your education section is clear. Consider adding relevant coursework if it aligns with the job description.'
            }
        ]
    }
};
