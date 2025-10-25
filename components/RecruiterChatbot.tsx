import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { getChatbotResponse } from '../services/geminiService';

const uid = () => `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

interface RecruiterChatbotProps {
    onEnd: () => void;
}

const RecruiterChatbot: React.FC<RecruiterChatbotProps> = ({ onEnd }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    // Initial message from bot
    useEffect(() => {
        const getInitialMessage = async () => {
            try {
                const botResponse = await getChatbotResponse([]);
                setMessages([{ id: uid(), text: botResponse, sender: 'bot' }]);
            } catch (error) {
                setMessages([{ id: uid(), text: "Sorry, I'm having trouble connecting right now. Please try again later.", sender: 'bot' }]);
            } finally {
                setIsLoading(false);
            }
        };
        getInitialMessage();
    }, []);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: ChatMessage = { id: uid(), text: userInput, sender: 'user' };
        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const botResponseText = await getChatbotResponse(updatedMessages);
            const newBotMessage: ChatMessage = { id: uid(), text: botResponseText, sender: 'bot' };
            setMessages(prev => [...prev, newBotMessage]);
        } catch (error) {
             const errorMessage: ChatMessage = { id: uid(), text: "I seem to be having technical difficulties. Please try again in a moment.", sender: 'bot' };
             setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-2xl mx-auto flex flex-col h-[70vh]">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-sky-300">Recruiter Chat Simulation</h2>
                    <p className="text-xs text-slate-400">Chatting with Alex from Innovate Inc.</p>
                </div>
                <button onClick={onEnd} className="text-slate-400 hover:text-white text-sm">End Chat</button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-sky-800 flex-shrink-0"></div>}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && messages.length > 0 && (
                    <div className="flex items-end gap-2 justify-start">
                        <div className="w-8 h-8 rounded-full bg-sky-800 flex-shrink-0"></div>
                        <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-slate-700 rounded-bl-none">
                            <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
                 <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Ask a question..."
                        className="w-full bg-slate-700 text-white border-slate-600 rounded-full py-2 px-4 focus:ring-sky-500 focus:border-sky-500 transition"
                    />
                    <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-sky-600 hover:bg-sky-500 text-white font-bold p-2 rounded-full transition disabled:bg-slate-600 disabled:cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RecruiterChatbot;