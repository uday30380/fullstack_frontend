import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10"></div>
            
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="glass-card p-16 max-w-xl border-primary/20 shadow-2xl shadow-primary/5"
            >
                <motion.h1 
                    className="text-[120px] font-black text-primary leading-none mb-4 tracking-tighter"
                    animate={{ rotate: [0, -2, 2, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                >
                    404
                </motion.h1>
                <h2 className="text-3xl font-black text-bc mb-4 uppercase tracking-tight">Access Denied: Path Not Found</h2>
                <p className="text-bc-muted mb-10 font-bold leading-relaxed">
                    The requested academic resource or internal directory does not exist or has been relocated to a secure vault.
                </p>
                <Link to="/home" className="btn-primary inline-flex px-12 py-4 rounded-full shadow-xl shadow-primary/20 group">
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        Return to Dashboard
                    </span>
                </Link>
            </motion.div>
        </div>
    );
};

export default NotFound;
