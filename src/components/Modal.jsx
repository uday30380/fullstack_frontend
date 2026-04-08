import { AnimatePresence, motion } from 'framer-motion';

const Modal = ({ isOpen, onClose, children }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 10 }}
                    className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden glass-card border-white/40"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-10">
                        {children}
                    </div>
                    <button 
                        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-text-muted hover:text-primary transition-all duration-300 border border-gray-100 hover:scale-110 active:scale-95" 
                        onClick={onClose}
                    >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

export default Modal;
