import React, { useState } from 'react';
import type { View } from '../App';

interface FeedbackModalProps {
    feature: View;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => void;
}

const StarRating = ({ rating, setRating }: { rating: number, setRating: (r: number) => void }) => {
    return (
        <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-4xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-slate-500 hover:text-yellow-300'}`}
                >
                    ★
                </button>
            ))}
        </div>
    );
};

const FeedbackModal: React.FC<FeedbackModalProps> = ({ feature, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        if (rating > 0 && comment.trim()) {
            onSubmit(rating, comment);
            onClose();
        } else {
            alert('Please provide a rating and a comment.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md border border-slate-700 p-8 m-4" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-sky-300 mb-2">Provide Feedback</h2>
                <p className="text-slate-400 mb-6">How was your experience with the <span className="font-semibold capitalize">{feature.replace('-', ' ')}</span> feature?</p>

                <div className="mb-6">
                    <StarRating rating={rating} setRating={setRating} />
                </div>

                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you liked or what could be improved..."
                    rows={5}
                    className="w-full bg-slate-700 text-slate-200 p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-sky-500 transition"
                />

                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="text-slate-400 hover:text-white px-4 py-2 rounded-md">Cancel</button>
                    <button onClick={handleSubmit} className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-6 py-2 rounded-md">Submit</button>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;