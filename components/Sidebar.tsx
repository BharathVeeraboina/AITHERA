import React, { useState } from 'react';
import type { View } from '../App';
import type { User } from '../types';

interface SidebarProps {
  currentUser: User;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

// Simple inline SVG icons
const Icons: { [key: string]: React.FC<{ className?: string }> } = {
  dashboard: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  roadmap: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 10V7m0 10L9 7" /></svg>,
  career: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  projects: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  challenges: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  interview: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  'soft-skills': ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  jobs: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  resume: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  reports: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  industry: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  integrations: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  feedback: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  adminDashboard: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  teacherManagement: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  studentData: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
  logout: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
};


const studentNav = [
  { title: 'Core', items: [ { view: 'dashboard', label: 'Dashboard', icon: 'dashboard' } ] },
  { title: 'Planning', items: [
      { view: 'roadmap', label: 'Roadmap', icon: 'roadmap' },
      { view: 'career', label: 'Student Profile', icon: 'career' },
      { view: 'projects', label: 'Projects', icon: 'projects' },
  ]},
  { title: 'Practice', items: [
      { view: 'challenges', label: 'Interview Preparation', icon: 'challenges' },
      { view: 'interview', label: 'Hire Slot', icon: 'interview' },
      { view: 'soft-skills', label: 'Soft Skills', icon: 'soft-skills' },
  ]},
  { title: 'Career Tools', items: [
      { view: 'jobs', label: 'Jobs', icon: 'jobs' },
      { view: 'resume', label: 'Resume', icon: 'resume' },
      { view: 'reports', label: 'Reports', icon: 'reports' },
      { view: 'industry', label: 'Industry Hub', icon: 'industry' },
      { view: 'integrations', label: 'Integrations', icon: 'integrations' },
  ]},
  { title: 'Platform', items: [ { view: 'feedback', label: 'Feedback', icon: 'feedback' } ]}
];

const teacherNav = [
    { title: 'Core', items: [ { view: 'dashboard', label: 'My Students', icon: 'dashboard' } ] },
    // Teachers can access these features when viewing a student
    { title: 'Student Tools', items: [
      { view: 'resume', label: 'Review Resumes', icon: 'resume' },
      { view: 'reports', label: 'View Reports', icon: 'reports' },
    ]}
];

const adminNav = [
    { title: 'Overview', items: [ { view: 'adminDashboard', label: 'College Dashboard', icon: 'adminDashboard' } ] },
    { title: 'Management', items: [
      { view: 'teacherManagement', label: 'Teachers', icon: 'teacherManagement' },
      { view: 'studentData', label: 'Students', icon: 'studentData' },
    ]},
    { title: 'Platform', items: [ { view: 'feedback', label: 'All Feedback', icon: 'feedback' } ]}
];


const NavItem: React.FC<{
  view: View;
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ view, label, icon, isActive, onClick }) => {
  const Icon = Icons[icon];
  const activeClass = "bg-sky-600/30 text-sky-300 border-sky-400";
  const inactiveClass = "text-slate-400 border-transparent hover:bg-slate-700/50 hover:text-white";
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md border-l-4 transition-all ${isActive ? activeClass : inactiveClass}`}
    >
      {Icon && <Icon className="h-5 w-5 mr-3" />}
      <span>{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentUser, onNavigate, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');

  let navGroups;
  switch (currentUser.role) {
    case 'teacher':
        navGroups = teacherNav;
        break;
    case 'admin':
        navGroups = adminNav;
        break;
    case 'student':
    default:
        navGroups = studentNav;
        break;
  }


  const NavContent = () => (
     <div className="flex flex-col flex-1">
        <div className="px-4 py-6">
             <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                AITHERA
            </h1>
            <div className="mt-2 text-sm text-slate-400 bg-slate-700/50 rounded-md p-2">
                <p>Welcome, <strong className="text-white">{currentUser.name}</strong></p>
                <p className="capitalize">{currentUser.role} View</p>
            </div>
        </div>
        <nav className="flex-1 px-2 space-y-1">
            {navGroups.map(group => (
                <div key={group.title} className="py-2">
                    <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{group.title}</h3>
                    <div className="mt-2 space-y-1">
                        {group.items.map(item => (
                            <NavItem
                                key={item.view}
                                view={item.view as View}
                                label={item.label}
                                icon={item.icon}
                                isActive={currentView === item.view}
                                onClick={() => {
                                    const view = item.view as View;
                                    setCurrentView(view);
                                    onNavigate(view);
                                    setIsOpen(false);
                                }}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
            <button onClick={onLogout} className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-400 hover:bg-slate-700/50 hover:text-white">
                <Icons.logout className="h-5 w-5 mr-3" />
                <span>Logout</span>
            </button>
        </div>
     </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="fixed top-4 left-4 z-20 p-2 bg-slate-800 rounded-md md:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-10 bg-slate-900/80 backdrop-blur-sm md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
      <div className={`fixed top-0 left-0 h-full w-64 bg-slate-800 border-r border-slate-700/50 transform transition-transform md:hidden z-20 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <NavContent />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-slate-800 border-r border-slate-700/50">
             <NavContent />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;