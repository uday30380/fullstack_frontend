import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlToken = searchParams.get('token');
    const urlEmail = searchParams.get('email');
    
    const isFromLink = Boolean(urlToken && urlEmail);

    // If they came from a link with both tokens, jump straight to step 2 to allow them to enter their new password immediately.
    const [step, setStep] = useState(isFromLink ? 2 : 1);
    const [email, setEmail] = useState(urlEmail || '');
    const [otp, setOtp] = useState(urlToken || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (urlToken && urlEmail) {
            setMessage('Secure link verified. Please enter your new password.');
        } else if (urlToken || urlEmail) {
            setMessage('Recovery link detected. Please confirm your missing credentials.');
        }
    }, [urlToken, urlEmail]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Please enter your academic email');
            return;
        }
        setIsLoading(true);
        setError('');
        
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                const text = await response.text();
                setMessage(text);
                setStep(2);
            } else {
                setError('Failed to initiate recovery. Please verify your email.');
            }
        } catch {
            setError('Server connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        if (!otp || !newPassword || !confirmPassword) {
            setError('All fields are required');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token: otp, newPassword })
            });

            if (response.ok) {
                setMessage('Identity restoration successful. You can now log in.');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                const errText = await response.text();
                setError(errText || 'Invalid or expired OTP.');
            }
        } catch {
            setError('Server connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center p-6 overflow-hidden bg-white/20">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[140px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

            <motion.div
                className="w-full max-w-[480px] bg-white border border-zinc-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] rounded-[40px] overflow-hidden relative z-10"
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="p-12 pb-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                    <motion.div 
                        className="w-24 h-24 bg-white border-2 border-zinc-50 shadow-xl shadow-primary/5 rounded-[32px] flex items-center justify-center text-5xl mx-auto mb-8 relative z-10"
                        whileHover={{ y: -5, rotate: -5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        🔐
                    </motion.div>
                    <h2 className="text-4xl font-heading font-black tracking-tighter text-bc mb-3">
                        Recovery Mode
                    </h2>
                    <p className="text-bc-muted font-bold text-sm tracking-tight uppercase opacity-80">
                        {step === 1 ? 'Restore your identity access' : 'Enter One-Time Password'}
                    </p>
                </div>

                <div className="px-10 pb-10">
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }} 
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl text-xs font-bold text-center uppercase tracking-wider"
                            >
                                {error}
                            </motion.div>
                        )}
                        {message && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }} 
                                animate={{ opacity: 1, height: 'auto' }} 
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-700 rounded-2xl text-xs font-bold text-center uppercase tracking-wider"
                            >
                                {message}
                            </motion.div>
                        )}

                        {step === 1 ? (
                            <motion.form 
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleSendOtp}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-bc-muted ml-1">Academic Email</label>
                                    <input 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        className="premium-input !px-6 !py-4" 
                                        placeholder="scholar@university.edu" 
                                        required 
                                    />
                                </div>
                                
                                <button type="submit" disabled={isLoading} className="premium-btn w-full !py-5 !rounded-2xl shadow-2xl shadow-primary/30 group disabled:opacity-70 disabled:cursor-wait">
                                    <span className="relative z-10 uppercase tracking-[0.15em] text-xs font-black">
                                        {isLoading ? 'Sending OTP...' : 'Dispatch Recovery Code'}
                                    </span>
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form 
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleResetPassword}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-bc-muted ml-1">6-Digit OTP</label>
                                    <input 
                                        type="text" 
                                        value={otp} 
                                        onChange={(e) => setOtp(e.target.value)} 
                                        className={"premium-input !px-6 !py-4 text-center tracking-[0.5em] font-black " + (isFromLink ? "opacity-50 cursor-not-allowed" : "")} 
                                        placeholder={isFromLink ? "Secure Token Applied" : "Enter Code"} 
                                        maxLength={10}
                                        required 
                                        disabled={isFromLink}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-bc-muted ml-1">New Protocol</label>
                                    <input 
                                        type="password" 
                                        value={newPassword} 
                                        onChange={(e) => setNewPassword(e.target.value)} 
                                        className="premium-input !px-6 !py-4" 
                                        placeholder="••••••••" 
                                        required 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-bc-muted ml-1">Confirm Protocol</label>
                                    <input 
                                        type="password" 
                                        value={confirmPassword} 
                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                        className="premium-input !px-6 !py-4" 
                                        placeholder="••••••••" 
                                        required 
                                    />
                                </div>
                                
                                <button type="submit" disabled={isLoading} className="premium-btn w-full !py-5 !rounded-2xl shadow-2xl shadow-primary/30 group disabled:opacity-70 disabled:cursor-wait">
                                    <span className="relative z-10 uppercase tracking-[0.15em] text-xs font-black">
                                        {isLoading ? 'Verifying...' : 'Restore Identity'}
                                    </span>
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-10 bg-primary/[0.02] text-center border-t border-primary/10">
                    <p className="text-[11px] font-bold text-bc-muted">
                        Remember your credentials?
                        <Link to="/login" className="ml-3 text-primary font-black uppercase tracking-widest hover:underline underline-offset-4 decoration-2">
                            Return to Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
