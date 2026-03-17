import React, { useEffect } from 'react';

interface LevelModalProps {
    banda: number;
    title: string;
    type: 'up' | 'down';
    onClose: () => void;
}

export default function LevelModal({ banda, title, type, onClose }: LevelModalProps) {
    useEffect(() => {
        if (type === 'up') {
            const audio = new Audio('/audios/sounds-effect/Random_levelup.ogg');
            audio.volume = 0.5;
            audio.play().catch(e => console.error("Error playing sound", e));
        }
        
        const timer = setTimeout(() => {
            onClose();
        }, 3000); // 3 seconds visible

        return () => clearTimeout(timer);
    }, [onClose, type]);

    const isUp = type === 'up';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`border-4 p-8 md:p-12 rounded-2xl transform scale-in-center overflow-hidden relative flex flex-col items-center text-center max-w-sm mx-4 ${isUp ? 'bg-gradient-to-b from-[#fdfaff] to-[#f5ecff] border-[#815a9b] shadow-[0_0_50px_rgba(129,90,155,0.5)]' : 'bg-gradient-to-b from-gray-100 to-gray-300 border-gray-600 shadow-[0_0_50px_rgba(75,85,99,0.5)]'}`}>
                
                {/* Shine effect background */}
                <div className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent -translate-x-[150%] animate-[shimmer_2s_infinite]`}></div>

                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-[inset_0_4px_8px_rgba(0,0,0,0.2),_0_4px_12px_rgba(0,0,0,0.4)] animate-bounce text-white relative z-10 border-4 ${isUp ? 'bg-[#815a9b] border-[#fdfaff]' : 'bg-gray-600 border-gray-100'}`}>
                    {isUp ? (
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 11l7-7 7 7M5 19l7-7 7 7" /></svg>
                    ) : (
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" /></svg>
                    )}
                </div>
                
                <h2 className={`text-3xl md:text-4xl font-black uppercase tracking-wider mb-2 drop-shadow-sm relative z-10 ${isUp ? 'text-[#5e4171]' : 'text-gray-800'}`}>
                    {isUp ? '¡Nivel Aumentado!' : 'Nivel Reducido'}
                </h2>
                
                <div className={`bg-white/60 px-6 py-3 rounded-full border-2 mt-4 relative z-10 ${isUp ? 'border-[#815a9b]/30' : 'border-gray-500/30'}`}>
                    <p className="text-xl font-bold text-gray-800">
                        {isUp ? 'Has alcanzado la ' : 'Has descendido a la '}
                        <span className={isUp ? 'text-[#815a9b]' : 'text-gray-700'}>Banda {banda}</span>
                    </p>
                    <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mt-1">"{title}"</p>
                </div>
                
                <div className="mt-8 flex gap-3 justify-center relative z-10">
                    <div className={`w-3 h-3 rounded-full animate-ping [animation-delay:0ms] ${isUp ? 'bg-[#815a9b]' : 'bg-gray-600'}`}></div>
                    <div className={`w-3 h-3 rounded-full animate-ping [animation-delay:150ms] ${isUp ? 'bg-[#815a9b]' : 'bg-gray-600'}`}></div>
                    <div className={`w-3 h-3 rounded-full animate-ping [animation-delay:300ms] ${isUp ? 'bg-[#815a9b]' : 'bg-gray-600'}`}></div>
                </div>
            </div>
        </div>
    );
}
