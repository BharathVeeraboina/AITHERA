import React from 'react';
import type { Teacher, Student } from '../types';

interface TeacherManagementProps {
    teachers: Teacher[];
    students: Student[];
    setTeachers: (teachers: Teacher[]) => void; // A real app would use an API call
}

const TeacherManagement: React.FC<TeacherManagementProps> = ({ teachers, students, setTeachers }) => {
    
    // In a real app, these would be API calls and more complex state management
    const handleAddTeacher = () => {
        const name = prompt("Enter new teacher's name:");
        if (name) {
            const newTeacher: Teacher = {
                id: `teacher_${Date.now()}`,
                name,
                role: 'teacher',
                studentIds: []
            };
            setTeachers([...teachers, newTeacher]);
        }
    };

    const handleAssignStudent = (teacherId: string) => {
        const studentId = prompt("Enter student ID to assign (e.g., student_1):");
        if (studentId && students.some(s => s.id === studentId)) {
            setTeachers(teachers.map(t => 
                t.id === teacherId 
                ? { ...t, studentIds: [...new Set([...t.studentIds, studentId])] } 
                : t
            ));
        } else if (studentId) {
            alert("Student ID not found.");
        }
    };
    
    return (
        <div className="w-full max-w-5xl mx-auto">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-sky-300">Teacher Management</h1>
                <button onClick={handleAddTeacher} className="bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-md">
                    + Add Teacher
                </button>
            </div>
             <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
                <div className="space-y-4">
                    {teachers.map(teacher => (
                        <div key={teacher.id} className="bg-slate-700/50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white">{teacher.name}</h3>
                                <button onClick={() => handleAssignStudent(teacher.id)} className="text-sm bg-sky-600 hover:bg-sky-500 text-white py-1 px-3 rounded-md">
                                    Assign Student
                                </button>
                            </div>
                            <div className="mt-2">
                                <p className="text-xs text-slate-400">Mentoring:</p>
                                {teacher.studentIds.length > 0 ? (
                                    <ul className="list-disc pl-5 text-sm text-slate-300">
                                        {teacher.studentIds.map(id => {
                                            const student = students.find(s => s.id === id);
                                            return <li key={id}>{student ? student.name : `Unknown Student (${id})`}</li>;
                                        })}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">No students assigned.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </div>
    );
};

export default TeacherManagement;