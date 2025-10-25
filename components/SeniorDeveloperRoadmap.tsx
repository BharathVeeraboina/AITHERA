import React from 'react';

const roadmapData = [
  {
    category: "Code Quality",
    nodes: [
      {
        title: "Coding Standards",
        path: "main",
        items: ["Exception Handling", "Testing Frameworks", "Coding Styles"]
      },
      {
        title: "Code Reviews",
        path: "main",
        items: ["Pair Programming", "Mob Programming", "Pull Requests / Merge Requests", "Writing Good Reviews"]
      },
      {
        title: "Technical Debt",
        path: "optional",
        items: []
      },
      {
        title: "Refactoring",
        path: "main",
        items: []
      }
    ]
  },
  {
    category: "Secure Code",
    nodes: [
      {
        title: "Secure Code",
        path: "main",
        items: ["Web Security", "Database Security", "Network Protocols", "Email Security", "Data Security", "Data Privacy"]
      }
    ]
  },
  {
    category: "Decision Making",
    nodes: [
      {
        title: "Mental Models",
        path: "main",
        items: ["Inversion", "Second Order Thinking", "Map != Territory", "Circle of Competence"]
      },
      {
        title: "Decisiveness",
        path: "main",
        items: []
      },
      {
        title: "Saying No",
        path: "main",
        items: []
      },
      {
        title: "Decision Fatigue",
        path: "optional",
        items: []
      }
    ]
  }
];

const PathIndicator: React.FC<{ path: 'main' | 'optional' }> = ({ path }) => (
  <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full ${path === 'main' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
    {path === 'main' ? 'Main Path' : 'Optional Path'}
  </div>
);

const NodeCard: React.FC<{ node: { title: string; path: 'main' | 'optional'; items: string[] } }> = ({ node }) => (
  <div className={`relative bg-slate-700/50 p-4 rounded-lg border-2 ${node.path === 'main' ? 'border-green-500/50' : 'border-yellow-500/50'}`}>
    <PathIndicator path={node.path} />
    <h4 className="font-bold text-lg text-sky-300 mb-3 pr-20">{node.title}</h4>
    {node.items.length > 0 && (
      <ul className="space-y-2">
        {node.items.map(item => (
          <li key={item} className="text-sm text-slate-200 bg-slate-800/60 p-2 rounded-md transition-colors hover:bg-slate-800">{item}</li>
        ))}
      </ul>
    )}
  </div>
);

const CategoryColumn: React.FC<{ category: typeof roadmapData[0] }> = ({ category }) => (
  <div className="flex flex-col gap-6">
    <h3 className="text-2xl font-bold text-white text-center">{category.category}</h3>
    <div className="space-y-6">
      {category.nodes.map(node => <NodeCard key={node.title} node={node} />)}
    </div>
  </div>
);

const SeniorDeveloperRoadmap: React.FC = () => {
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg w-full max-w-7xl mx-auto animate-fade-in">
            <header className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-2">Senior Developer Roadmap</h2>
                <p className="text-slate-400">An overview of key areas for growth, based on community insights from <a href="https://github.com/glennsantos/senior-developer-roadmap" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">this roadmap</a>.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {roadmapData.map(category => (
                    <CategoryColumn key={category.category} category={category} />
                ))}
            </div>
        </div>
    );
};

export default SeniorDeveloperRoadmap;