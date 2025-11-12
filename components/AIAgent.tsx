import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon, SparklesIcon, ArrowRightCircleIcon } from './icons';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const AIAgent: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<Message[]>([
        {
            role: 'model',
            text: 'Olá! Sou seu assistente de IA. Como posso ajudar com a análise financeira hoje?',
        }
    ]);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [history, isLoading]);
    
    const handleSend = async () => {
        if (!prompt.trim() || isLoading) return;
        
        const userMessage: Message = { role: 'user', text: prompt };
        setHistory(prev => [...prev, userMessage]);
        setPrompt('');
        setIsLoading(true);

        // Esta é uma resposta simulada. A integração real com a API Gemini seria implementada aqui.
        setTimeout(() => {
            const modelResponse: Message = {
                role: 'model',
                text: `Esta é uma resposta simulada para: "${userMessage.text}". A integração com a API do Gemini seria implementada aqui.`
            };
            setHistory(prev => [...prev, modelResponse]);
            setIsLoading(false);
        }, 1500);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <>
            {/* FAB */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary rounded-full text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-transform hover:scale-110"
                aria-label="Abrir assistente de IA"
            >
                <SparklesIcon className="w-7 h-7" />
            </button>
            
            {/* Modal */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-50 flex items-end justify-end p-0 sm:p-6"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-card w-full h-full sm:w-96 sm:h-[600px] rounded-none sm:rounded-2xl border border-border shadow-2xl flex flex-col animate-fade-in-up"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
                            <div className="flex items-center space-x-2">
                                <SparklesIcon className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-bold text-foreground">Assistente IA</h2>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-card-alt">
                                <CloseIcon />
                            </button>
                        </div>
                        
                        {/* Chat History */}
                        <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
                            {history.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs px-3 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card-alt text-foreground rounded-bl-none'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                             {isLoading && (
                                <div className="flex justify-start">
                                    <div className="max-w-xs px-3 py-2 rounded-2xl bg-card-alt text-foreground rounded-bl-none">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse"></div>
                                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-border flex-shrink-0">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Pergunte algo..."
                                    className="w-full bg-background border border-border rounded-full py-2.5 pl-4 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSend}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:bg-primary/50"
                                    disabled={!prompt.trim() || isLoading}
                                >
                                    <ArrowRightCircleIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
             <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px) scale(0.98); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
            `}</style>
        </>
    );
};

export default AIAgent;
