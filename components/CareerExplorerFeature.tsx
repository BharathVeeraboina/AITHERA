import React, { useState, useMemo } from 'react';
import type { Student, StudentProfile, PersonalProfile, CollegeProfile, CareerInterests } from '../types';

interface CareerExplorerFeatureProps {
    student: Student;
    onUpdateProfile: (profile: StudentProfile) => void;
}

// Helper to check if the profile has all required information
const isProfileComplete = (profile: StudentProfile): boolean => {
    const { personal, college, interests } = profile;
    const requiredFields = [
        personal.fullName, personal.dateOfBirth, personal.contactNumber, personal.email,
        college.collegeName, college.branch, college.yearOfStudy, college.enrollmentNumber, college.cgpa, college.collegeEmail,
        interests.jobRoleInterests, interests.participatedInCampusInterview
    ];
    return requiredFields.every(field => field && String(field).trim() !== '');
};

const ProfileDisplay: React.FC<{ profile: StudentProfile; onEdit: () => void }> = ({ profile, onEdit }) => {
    const renderField = (label: string, value: any) => (
        <div>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-slate-200">{value || 'Not provided'}</p>
        </div>
    );

    return (
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-white">Your Career Profile</h2>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${profile.isVerified ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                        {profile.isVerified ? '✓ Verified' : 'Not Verified'}
                    </span>
                </div>
                <button onClick={onEdit} className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-md">Edit Profile</button>
            </div>
            <div className="space-y-6">
                <section>
                    <h3 className="text-lg font-semibold text-sky-300 border-b border-slate-600 pb-2 mb-3">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">{renderField("Full Name", profile.personal.fullName)}{renderField("Date of Birth", profile.personal.dateOfBirth)}{renderField("Contact", profile.personal.contactNumber)}{renderField("Email", profile.personal.email)}</div>
                </section>
                <section>
                    <h3 className="text-lg font-semibold text-sky-300 border-b border-slate-600 pb-2 mb-3">College Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">{renderField("College", profile.college.collegeName)}{renderField("Branch", profile.college.branch)}{renderField("Year of Study", profile.college.yearOfStudy)}{renderField("Enrollment No.", profile.college.enrollmentNumber)}{renderField("CGPA", profile.college.cgpa)}{renderField("Active Backlogs", profile.college.activeBacklogs)}{renderField("College Email", profile.college.collegeEmail)}</div>
                </section>
                <section>
                    <h3 className="text-lg font-semibold text-sky-300 border-b border-slate-600 pb-2 mb-3">Career Interests</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">{renderField("Internship Experience", profile.interests.internshipExperience)}{renderField("Participated in Campus Interviews?", profile.interests.participatedInCampusInterview)}{renderField("Preferred Companies", profile.interests.preferredCompanies)}{renderField("Job Role Interests", profile.interests.jobRoleInterests)}{profile.resumeUrl && renderField("Resume", profile.resumeUrl)}</div>
                </section>
            </div>
        </div>
    );
};

const FormInput: React.FC<{ label: string; name: string; value: any; onChange: (e: React.ChangeEvent<any>) => void; error?: string; required?: boolean; type?: string; placeholder?: string }> = ({ label, name, value, onChange, error, required, type = "text", placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-sky-300 mb-1">{label} {required && <span className="text-red-400">*</span>}</label>
        <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} className={`w-full bg-slate-700 p-2 rounded-md border ${error ? 'border-red-500' : 'border-slate-600'} focus:ring-sky-500 focus:border-sky-500`} />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
);

const CareerExplorerFeature: React.FC<CareerExplorerFeatureProps> = ({ student, onUpdateProfile }) => {
    const [isEditing, setIsEditing] = useState(!isProfileComplete(student.profile));
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<StudentProfile>(student.profile);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (section: keyof StudentProfile, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as any),
                [name]: value
            }
        }));
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: ''}));
        }
    };

    const validateStep = (step: number) => {
        const newErrors: Record<string, string> = {};
        const { personal, college } = formData;
        if (step === 1) {
            if (!personal.fullName) newErrors.fullName = "Full Name is required.";
            if (!personal.dateOfBirth) newErrors.dateOfBirth = "Date of Birth is required.";
            if (!/^\d{10}$/.test(personal.contactNumber.replace(/[^0-9]/g, ''))) newErrors.contactNumber = "Enter a valid 10-digit contact number.";
            if (!/\S+@\S+\.\S+/.test(personal.email)) newErrors.email = "Enter a valid email address.";
        }
        if (step === 2) {
            if (!college.collegeName) newErrors.collegeName = "College Name is required.";
            if (!college.branch) newErrors.branch = "Branch is required.";
            if (!college.enrollmentNumber) newErrors.enrollmentNumber = "Enrollment Number is required.";
            if (!college.cgpa) newErrors.cgpa = "CGPA is required.";
            if (!/\S+@\S+\.\S+/.test(college.collegeEmail)) newErrors.collegeEmail = "Enter a valid college email.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(s => s + 1);
        }
    };
    const handleBack = () => setCurrentStep(s => s - 1);

    const handleSave = () => {
        if (validateStep(1) && validateStep(2)) {
            const finalProfile = { ...formData, isVerified: formData.college.collegeEmail.endsWith('.edu') };
            onUpdateProfile(finalProfile);
            setIsEditing(false);
        }
    };
    
     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // In a real app, you'd upload this. Here we just store its name.
            setFormData(prev => ({ ...prev, resumeUrl: file.name }));
        }
    };

    if (!isEditing) {
        return <ProfileDisplay profile={student.profile} onEdit={() => setIsEditing(true)} />;
    }

    const progress = useMemo(() => Math.round(((currentStep - 1) / 3) * 100), [currentStep]);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
                <h2 className="text-2xl font-bold text-sky-300 mb-2">AITHERA</h2>
                <p className="text-slate-400 mb-6">Complete your profile to get the most out of the platform.</p>

                {/* Progress Bar */}
                <div className="mb-8">
                     <div className="flex justify-between text-sm font-semibold text-slate-300 mb-1">
                        <span>Step {currentStep} of 3</span>
                        <span>{progress}% Complete</span>
                     </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div className="bg-sky-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="space-y-6">
                    {currentStep === 1 && (<>
                        <h3 className="text-lg font-semibold text-white">1. Personal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="Full Name" name="fullName" value={formData.personal.fullName} onChange={e => handleInputChange('personal', e)} error={errors.fullName} required />
                            <FormInput label="Date of Birth" name="dateOfBirth" type="date" value={formData.personal.dateOfBirth} onChange={e => handleInputChange('personal', e)} error={errors.dateOfBirth} required />
                            <FormInput label="Contact Number" name="contactNumber" value={formData.personal.contactNumber} onChange={e => handleInputChange('personal', e)} error={errors.contactNumber} placeholder="e.g., 9876543210" required />
                            <FormInput label="Email ID" name="email" type="email" value={formData.personal.email} onChange={e => handleInputChange('personal', e)} error={errors.email} placeholder="e.g., student@email.com" required />
                        </div>
                    </>)}
                    {currentStep === 2 && (<>
                         <h3 className="text-lg font-semibold text-white">2. College Information</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="College Name" name="collegeName" value={formData.college.collegeName} onChange={e => handleInputChange('college', e)} error={errors.collegeName} required />
                            <FormInput label="Branch" name="branch" value={formData.college.branch} onChange={e => handleInputChange('college', e)} error={errors.branch} required />
                            <FormInput label="Year of Study" name="yearOfStudy" type="number" value={formData.college.yearOfStudy} onChange={e => handleInputChange('college', e)} error={errors.yearOfStudy} required />
                            <FormInput label="Enrollment Number" name="enrollmentNumber" value={formData.college.enrollmentNumber} onChange={e => handleInputChange('college', e)} error={errors.enrollmentNumber} required />
                            <FormInput label="CGPA" name="cgpa" value={formData.college.cgpa} onChange={e => handleInputChange('college', e)} error={errors.cgpa} placeholder="e.g., 8.5" required />
                            <FormInput label="College Email ID" name="collegeEmail" type="email" value={formData.college.collegeEmail} onChange={e => handleInputChange('college', e)} error={errors.collegeEmail} placeholder="e.g., name@college.edu" required />
                            <FormInput label="Active Backlogs (Optional)" name="activeBacklogs" type="number" value={formData.college.activeBacklogs} onChange={e => handleInputChange('college', e)} />
                         </div>
                    </>)}
                     {currentStep === 3 && (<>
                        <h3 className="text-lg font-semibold text-white">3. Career & Company Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2"><label className="block text-sm font-medium text-sky-300 mb-1">Internship Experience (Optional)</label><textarea name="internshipExperience" value={formData.interests.internshipExperience} onChange={e => handleInputChange('interests', e)} rows={4} className="w-full bg-slate-700 p-2 rounded-md border border-slate-600" /></div>
                            <div><label className="block text-sm font-medium text-sky-300 mb-1">Campus Interview Participation <span className="text-red-400">*</span></label><select name="participatedInCampusInterview" value={formData.interests.participatedInCampusInterview} onChange={e => handleInputChange('interests', e)} className="w-full bg-slate-700 p-2 rounded-md border border-slate-600"><option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option></select></div>
                            <FormInput label="Preferred Companies (Optional)" name="preferredCompanies" value={formData.interests.preferredCompanies} onChange={e => handleInputChange('interests', e)} placeholder="e.g., Google, Microsoft" />
                             <FormInput label="Job Role Interests" name="jobRoleInterests" value={formData.interests.jobRoleInterests} onChange={e => handleInputChange('interests', e)} placeholder="e.g., SDE, Data Analyst" required />
                            <div><label className="block text-sm font-medium text-sky-300 mb-1">Upload Resume (PDF, Optional)</label><input type="file" accept=".pdf" onChange={handleFileChange} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-900/50 file:text-sky-300 hover:file:bg-sky-800/50"/>{formData.resumeUrl && <p className="mt-2 text-xs text-green-400">File attached: {formData.resumeUrl}</p>}</div>
                        </div>
                    </>)}
                </div>

                {/* Navigation */}
                <div className="mt-8 flex justify-between items-center">
                    {currentStep > 1 ? (<button onClick={handleBack} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-6 rounded-full transition">&larr; Back</button>) : <div/>}
                    {currentStep < 3 ? (<button onClick={handleNext} className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-6 rounded-full transition">Next &rarr;</button>) : (<button onClick={handleSave} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-full transition">Save Profile</button>)}
                </div>
            </div>
        </div>
    );
};

export default CareerExplorerFeature;