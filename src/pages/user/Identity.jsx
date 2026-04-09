import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleNext = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const msg = await response.text();
            setStatus({ type: 'success', message: msg });
            setStep(2);
        } catch {
            setStatus({ type: 'error', message: 'Failed to initialize recovery protocol.' });
        } finally {
            setLoading(false);
        }
    };

    const handleMeet = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setStatus({ type: 'error', message: 'Protocols do not match.' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: email, 
                    token: otp, 
                    newPassword: newPassword,
                    oldPassword: oldPassword 
                })
            });
            const msg = await response.text();
            
            if (response.ok) {
                setStatus({ type: 'success', message: 'Identity restored successfully. Overwriting existing nodes...' });
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setStatus({ type: 'error', message: msg });
            }
        } catch {
            setStatus({ type: 'error', message: 'Synchronization protocol failed.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md glass-card p-12 text-center"
            >
                <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-premium border border-primary/10">
                    {step === 1 ? '🔑' : '🛡️'}
                </div>
                <h2 className="text-3xl font-heading font-black tracking-tight text-bc mb-4">
                    {step === 1 ? 'Identity Recovery' : 'Restore Access'}
                </h2>
                <p className="text-bc-muted mb-10 text-sm font-bold opacity-70 uppercase tracking-widest leading-loose">
                    {step === 1 
                        ? 'Enter your academic email to receive a secure restoration node.' 
                        : 'Verify the dispatched node to synchronize new credentials.'}
                </p>

                {status.message && (
                    <div className={`p-4 rounded-xl mb-8 text-[10px] font-black uppercase tracking-widest border transition-all ${status.type === 'success' ? 'bg-green-500/5 text-green-600 border-green-500/20' : 'bg-red-500/5 text-red-600 border-red-500/20'}`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={step === 1 ? handleNext : handleMeet} className="space-y-6">
                    {step === 1 ? (
                        <div className="text-left space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">Institutional Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="premium-input !py-4 !px-6"
                                placeholder="scholar@university.edu"
                            />
                        </div>
                    ) : (
                        <div className="text-left space-y-4">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">Verification Node (OTP)</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="premium-input !py-4 !px-6 text-center tracking-[0.5em] text-xl"
                                    placeholder="000000"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">Legacy Protocol (Old Password)</label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="premium-input !py-4 !px-6"
                                    placeholder="Optional if forgotten"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">New Protocol (New Password)</label>
                                <input
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="premium-input !py-4 !px-6"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">Verify Protocol</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="premium-input !py-4 !px-6"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="premium-btn w-full !py-4 shadow-2xl shadow-primary/20 group"
                    >
                        {loading 
                            ? (step === 1 ? 'Initializing...' : 'Synchronizing...') 
                            : (step === 1 ? 'Next' : 'Meet')}
                    </button>
                    
                    <Link to="/login" className="block text-[10px] font-black uppercase tracking-[0.3em] text-bc-muted hover:text-primary transition-all mt-6">
                        {step === 1 ? 'Back to Authentication' : 'Return to Login'}
                    </Link>
                </form>
            </motion.div>
        </div>
    );
};

export const ResetPassword = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    
    const [otp, setOtp] = useState(params.get('token') || '');
    const [email, setEmail] = useState(params.get('email') || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setStatus({ type: 'error', message: 'Protocols do not match.' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token: otp, newPassword: password })
            });
            const msg = await response.text();
            
            if (response.ok) {
                setStatus({ type: 'success', message: 'Identity restored successfully. Redirecting...' });
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setStatus({ type: 'error', message: msg });
            }
        } catch {
            setStatus({ type: 'error', message: 'Secure link verification failed.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md glass-card p-12 text-center"
            >
                <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-premium border border-primary/10">
                    🛡️
                </div>
                <h2 className="text-3xl font-heading font-black tracking-tight text-bc mb-4">Restore Access</h2>
                <p className="text-bc-muted mb-10 text-sm font-bold opacity-70 uppercase tracking-widest leading-loose">
                    Establish your new academic credentials.
                </p>

                {status.message && (
                    <div className={`p-4 rounded-xl mb-8 text-[10px] font-black uppercase tracking-widest border transition-all ${status.type === 'success' ? 'bg-green-500/5 text-green-600 border-green-500/20' : 'bg-red-500/5 text-red-600 border-red-500/20'}`}>
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    {!params.get('email') && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">Institutional Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="premium-input !py-4 !px-6"
                                placeholder="scholar@university.edu"
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">Verification Node (OTP)</label>
                        <input
                            type="text"
                            required
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="premium-input !py-4 !px-6 text-center tracking-[0.5em] text-xl"
                            placeholder="000000"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">New Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="premium-input !py-4 !px-6"
                            placeholder="••••••••"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-2">Confirm Node</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="premium-input !py-4 !px-6"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="premium-btn w-full !py-4 shadow-2xl shadow-primary/20 mt-4 group"
                    >
                        {loading ? 'Synchronizing...' : 'Finalize Restoration'}
                    </button>
                    <Link to="/login" className="block text-center text-[10px] font-black uppercase tracking-[0.3em] text-bc-muted hover:text-primary transition-all mt-6">
                        Return to Hub
                    </Link>
                </form>
            </motion.div>
        </div>
    );
};
