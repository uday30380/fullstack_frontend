import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ messages = [], onDismiss }) => (
    <div className="fixed bottom-8 right-8 z-[200] flex flex-col items-end gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
            {messages.map((msg) => {
                const isError = msg.type === 'error';
                const isWarning = msg.type === 'warning';
                const accentColor = isError ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-primary';
                const bgColor = isError ? 'bg-rose-50' : isWarning ? 'bg-amber-50' : 'bg-primary/10';
                const textColor = isError ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-primary';
                const icon = isError ? '⚠️' : isWarning ? '🔔' : '✨';
                const label = isError ? 'Critical Fault' : isWarning ? 'System Alert' : 'Scholar Directive';

                return (
                    <motion.div
                        key={msg.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: 20 }}
                        className="pointer-events-auto min-w-[320px] bg-white border border-gray-100 p-5 rounded-[24px] shadow-2xl shadow-gray-200/50 flex items-center justify-between group overflow-hidden relative"
                        onAnimationComplete={() => {
                            setTimeout(() => onDismiss && onDismiss(msg.id), 5000);
                        }}
                    >
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentColor}`}></div>
                        <div className="flex items-center gap-4 pl-2">
                            <div className={`w-10 h-10 rounded-2xl ${bgColor} ${textColor} flex items-center justify-center flex-shrink-0 text-xl group-hover:scale-110 transition-transform`}>
                                {icon}
                            </div>
                            <div>
                                <p className="text-sm font-black text-text-main leading-tight">{msg.text}</p>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${textColor} mt-0.5 opacity-80`}>{label}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => onDismiss && onDismiss(msg.id)}
                            className="w-8 h-8 rounded-xl hover:bg-gray-100 text-text-muted flex items-center justify-center transition-all font-black text-xs"
                        >
                            ✕
                        </button>
                    </motion.div>
                );
            })}
        </AnimatePresence>
    </div>
);

export default Toast;
