import React from 'react';

const roadmapData = {
  left: [
    {
      title: "Web Frontend",
      color: "border-blue-500/50",
      subsections: [
        { title: "Basics", items: ["Javascript", "HTML", "CSS"] },
        { title: "Frameworks", items: ["Vue.js", "React", "AngularJS", "SVELTE"] },
        { title: "Styles", items: ["Tailwind CSS", "Bootstrap"] },
      ],
    },
    {
      title: "Mobile",
      color: "border-purple-500/50",
      subsections: [
        { title: "Platform", items: ["Android SDK", "Objective-C", "Swift"] },
        { title: "Cross Platform", items: ["Flutter", "Unity", "Ionic"] },
      ],
    },
    {
      title: "Database",
      color: "border-yellow-500/50",
      subsections: [
        { title: "RDBMS", items: ["MySQL", "PostgreSQL"] },
        { title: "NoSQL", items: ["mongoDB", "cassandra"] },
      ],
    },
    {
      title: "Infrastructure",
      color: "border-slate-500/50",
      subsections: [{ title: "Tools", items: ["NGINX", "CLOUDFLARE"] }],
    },
  ],
  right: [
    {
      title: "Backend",
      color: "border-green-500/50",
      subsections: [
        { title: "Programming", items: ["Python", "Java", "C++"] },
        { title: "Middleware", items: ["redis", "elastic", "kafka", "RabbitMQ"] },
        { title: "Communication", items: ["gRPC", "REST API"] },
      ],
    },
    {
      title: "Cloud",
      color: "border-indigo-500/50",
      subsections: [
        { title: "Cloud Service Providers", items: ["Azure", "googlecloud", "aws"] },
        { title: "Container", items: ["docker", "kubernetes"] },
      ],
    },
    {
      title: "UI/UX",
      color: "border-pink-500/50",
      subsections: [{ title: "Tools", items: ["Figma", "Adobe Xd", "Sketch"] }],
    },
    {
      title: "CI/CD DevOps",
      color: "border-fuchsia-500/50",
      subsections: [
        { title: "CI/CD", items: ["Jenkins", "git"] },
        { title: "IaC", items: ["ANSIBLE", "CHEF", "Terraform"] },
      ],
    },
  ],
};

// Extracted props to an interface to resolve TypeScript error with the 'key' prop.
interface SectionCardProps {
  section: typeof roadmapData.left[0];
}

// FIX: Explicitly type the component as React.FC to allow React-specific props like 'key'.
const SectionCard: React.FC<SectionCardProps> = ({ section }) => (
  <div className={`bg-slate-800/50 border-2 ${section.color} rounded-2xl p-4 space-y-3`}>
    <h3 className="text-xl font-bold text-center text-sky-300">{section.title}</h3>
    {section.subsections.map((sub, index) => (
      <div key={index} className="bg-slate-700/50 rounded-lg p-3">
        {sub.title && <h4 className="text-sm font-semibold text-slate-300 mb-2">{sub.title}</h4>}
        <div className="flex flex-wrap gap-2">
          {sub.items.map(item => (
            <span key={item} className="bg-slate-800 text-sky-200 text-xs font-semibold px-3 py-1 rounded-full">{item}</span>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const FullStackDeveloperRoadmap: React.FC = () => {
    return (
        <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 shadow-lg w-full max-w-7xl mx-auto animate-fade-in">
            <header className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-2">Full Stack Developer Roadmap</h2>
                <p className="text-slate-400">A visual guide to the technologies and skills for full-stack development.</p>
            </header>
            
            <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 md:gap-8">
                {/* Left Column */}
                <div className="flex-1 space-y-6">
                    {roadmapData.left.map(section => <SectionCard key={section.title} section={section} />)}
                </div>

                {/* Center Column with Icons */}
                <div className="hidden md:flex flex-col items-center justify-around text-slate-500 py-16">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <div key={num} className="relative w-8 h-8 flex items-center justify-center my-4">
                            <div className="absolute w-px h-24 bg-slate-700 -top-12"></div>
                            <span className="bg-slate-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-10">{num}</span>
                        </div>
                    ))}
                </div>

                {/* Right Column */}
                <div className="flex-1 space-y-6">
                    {roadmapData.right.map(section => <SectionCard key={section.title} section={section} />)}
                </div>
            </div>
        </div>
    );
};

export default FullStackDeveloperRoadmap;