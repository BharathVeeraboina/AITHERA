import React from 'react';
import type { User, Student, Teacher, Admin } from '../types';

interface LoginScreenProps {
    onLogin: (user: User) => void;
    students: Student[];
    teachers: Teacher[];
    admin: Admin;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, students, teachers, admin }) => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 p-4">
            <div className="w-full max-w-md text-center">
                 <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                    AITHERA
                </h1>
                <p className="mt-4 text-lg text-slate-400">
                    Rise Beyond Limits: Your Journey to Success Starts Here
                </p>

                <div className="mt-10 bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
                    <h2 className="text-xl font-bold text-white mb-6">Select Your Role to Login</h2>
                    <div className="space-y-4">
                        {/* For simplicity, we log in as the first student/teacher. In a real app, this would be a user list or login form. */}
                        <button 
                            onClick={() => onLogin(students[0])} 
                            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
                        >
                            Student Dashboard
                        </button>
                        <button 
                            onClick={() => onLogin(teachers[0])}
                            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
                        >
                            Department Portal
                        </button>
                        <button 
                            onClick={() => onLogin(admin)}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
                        >
                            College Admin
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;