import React, { useState, useEffect } from 'react';
import type { Integrations } from '../types';

interface IntegrationsFeatureProps {
    integrations: Integrations;
    onUpdate: (integrations: Integrations) => void;
}

const IntegrationCard = ({
    platform,
    username,
    url,
    onSave,
    placeholder,
    description,
    isUrl = false,
}: {
    platform: string;
    username: string;
    url: string;
    onSave: (value: string) => void;
    placeholder: string;
    description: string;
    isUrl?: boolean;
}) => {
    const [inputValue, setInputValue] = useState(isUrl ? url : username);
    const [isEditing, setIsEditing] = useState(false);
    
    useEffect(() => {
        setInputValue(isUrl ? url : username);
    }, [username, url, isUrl]);

    const handleSave = () => {
        onSave(inputValue);
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setInputValue(isUrl ? url : username);
        setIsEditing(false);
    };

    const isConnected = isUrl ? !!url : !!username;

    return (
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-white">{platform}</h3>
                    <p className="text-sm text-slate-400 mt-1">{description}</p>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-full ${isConnected ? 'bg-green-500/20 text-green-300' : 'bg-slate-700 text-slate-300'}`}>
                    {isConnected ? 'Connected' : 'Not Connected'}
                </div>
            </div>
            <div className="mt-4">
                {isConnected && !isEditing ? (
                    <div className="flex items-center justify-between bg-slate-700/50 p-3 rounded-md">
                        <p className="text-sky-300 truncate">{isUrl ? url : `Username: ${username}`}</p>
                        <button onClick={() => setIsEditing(true)} className="text-sm text-slate-300 hover:text-white">Edit</button>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={placeholder}
                            className="w-full bg-slate-700 p-2 rounded-md border border-slate-600 focus:ring-sky-500"
                        />
                         <div className="flex gap-2">
                            <button onClick={handleSave} className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-2 rounded-md">Save</button>
                            {isEditing && <button onClick={handleCancel} className="bg-slate-600 hover:bg-slate-500 text-white font-semibold px-4 py-2 rounded-md">Cancel</button>}
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};


const IntegrationsFeature: React.FC<IntegrationsFeatureProps> = ({ integrations, onUpdate }) => {

    const handleSave = (platform: keyof Integrations, value: string) => {
        onUpdate({ ...integrations, [platform]: value });
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-left mb-8">
                <h2 className="text-3xl font-bold text-sky-300 mb-2">Platform Integrations</h2>
                <p className="text-slate-400">Connect your external profiles to enhance your portfolio and track progress seamlessly.</p>
            </div>
            <div className="space-y-6">
                <IntegrationCard
                    platform="GitHub"
                    username={integrations.github}
                    url=""
                    onSave={(value) => handleSave('github', value)}
                    placeholder="your-github-username"
                    description="Import your project repositories directly into the resume builder."
                />
                <IntegrationCard
                    platform="LinkedIn"
                    username=""
                    url={integrations.linkedin}
                    onSave={(value) => handleSave('linkedin', value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                    description="Link your professional profile for easy access and resume enhancement."
                    isUrl
                />
                <IntegrationCard
                    platform="LeetCode"
                    username=""
                    url={integrations.leetcode}
                    onSave={(value) => handleSave('leetcode', value)}
                    placeholder="https://leetcode.com/your-username/"
                    description="Display your problem-solving stats on your dashboard."
                    isUrl
                />
                 <IntegrationCard
                    platform="HackerRank"
                    username=""
                    url={integrations.hackerrank}
                    onSave={(value) => handleSave('hackerrank', value)}
                    placeholder="https://www.hackerrank.com/profile/your-username"
                    description="Showcase your coding skills and rankings."
                    isUrl
                />
                <IntegrationCard
                    platform="CodeChef"
                    username=""
                    url={integrations.codechef}
                    onSave={(value) => handleSave('codechef', value)}
                    placeholder="https://www.codechef.com/users/your-username"
                    description="Track your competitive programming progress and ratings."
                    isUrl
                />
            </div>
        </div>
    );
};

export default IntegrationsFeature;