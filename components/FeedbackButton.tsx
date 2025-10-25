import React, { useState } from 'react';
import type { View } from '../App';
import FeedbackModal from './FeedbackModal';

interface FeedbackButtonProps {
    currentView: View;
    onSubmitFeedback: (feedback: { feature: View; rating: number; comment: string }) => void;
}

const FeedbackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);


const FeedbackButton: React.FC<FeedbackButtonProps> = ({ currentView, onSubmitFeedback }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = (rating: number, comment: string) => {
        onSubmitFeedback({ feature: currentView, rating, comment });
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 right-6 bg-sky-600 hover:bg-sky-500 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 z-40"
                aria-label="Provide Feedback"
            >
                <FeedbackIcon />
            </button>

            {isModalOpen && (
                <FeedbackModal
                    feature={currentView}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                />
            )}
        </>
    );
};

export default FeedbackButton;