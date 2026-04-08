import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const AuthCard = ({ mode, role, setRole, setUser }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        confirmPassword: '',
        dept: '',
        idNumber: '',
        secretCode: '',
        facultyPin: '',
        terms: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [loginFeedback, setLoginFeedback] = useState({ message: '', type: 'error' });

    const roles = [
        { id: 'Student', label: 'Scholar', icon: '👨‍🎓' },
        { id: 'Faculty', label: 'Academic', icon: '👨‍🏫' },
        { id: 'Admin', label: 'Architect', icon: '🛡️' }
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        if (loginFeedback.message) setLoginFeedback({ message: '', type: 'error' });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Required';
        if (!formData.password) newErrors.password = 'Required';

        if (role === 'Admin') {
            if (!formData.secretCode) newErrors.secretCode = 'Required';
        }

        if (mode === 'signup') {
            if (!formData.name) newErrors.name = 'Required';
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mismatch';
            if (!formData.terms) newErrors.terms = 'Required';

            if (role === 'Student' || role === 'Faculty') {
                if (!formData.dept) newErrors.dept = 'Required';
                if (!formData.idNumber) newErrors.idNumber = 'Required';
            }
            if (role === 'Faculty') {
                if (!formData.facultyPin || !/^\d{6}$/.test(formData.facultyPin)) {
                    newErrors.facultyPin = 'Must be 6 digits';
                }
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (validateForm()) {
            setIsLoading(true);
            setLoginFeedback({ message: '', type: 'error' });
            const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        name: formData.name,
                        password: formData.password,
                        role: role,
                        dept: formData.dept,
                        idNumber: formData.idNumber,
                        secretCode: formData.secretCode,
                        facultyPin: formData.facultyPin
                    })
                });

                if (response.ok) {
                    const user = await response.json();
                    if (user.role === 'Faculty' && user.status === 'Pending') {
                        setLoginFeedback({ 
                            message: 'Institutional Application Logged. Your scholarly credentials are now under administrative review.', 
                            type: 'success' 
                        });
                        return;
                    }

                    localStorage.setItem('edu_user', JSON.stringify(user));
                    setUser(user);
                    
                    if (user.role === 'Admin') navigate('/admin/dashboard');
                    else if (user.role === 'Faculty') navigate('/admin/upload');
                    else navigate('/home');
                } else {
                    const errorMsg = await response.text();
                    setLoginFeedback({ message: errorMsg || 'Authentication Protocol Rejected', type: 'error' });
                }
            } catch (err) {
                console.error('Auth error:', err);
                setLoginFeedback({ 
                    message: 'Repository connection failure. Verify backend server status.', 
                    type: 'error' 
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center p-4 lg:p-12 overflow-hidden mesh-gradient">
            {/* Background Decorative Elements */}
            <motion.div 
                animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -top-24 -right-24 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] -z-10"
            />
            <motion.div 
                animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-24 -left-24 w-[250px] h-[250px] bg-blue-500/20 rounded-full blur-[80px] -z-10"
            />

            <motion.div
                className="w-full max-w-[1100px] flex flex-col lg:flex-row glass-card rounded-[40px] md:rounded-[56px] overflow-hidden relative z-10 min-h-[700px]"
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Branding Sidebar */}
                <div className="hidden lg:flex w-[40%] bg-[#0f172a] p-16 flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3B82F6 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-transparent"></div>
                    
                    <div className="relative z-10">
                        <Link to="/" className="inline-flex items-center gap-3 mb-16 p-2 bg-white/5 border border-white/10 rounded-2xl">
                            <span className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-xl font-black shadow-glow">E</span>
                            <span className="text-2xl font-heading font-black tracking-tight text-white">Educate<span className="text-primary italic">.</span></span>
                        </Link>
                        
                        <div className="space-y-6">
                            <motion.h1 
                                className="text-5xl font-heading font-black leading-[1.1] text-white tracking-tighter"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                Secure Portal to <br />
                                <span className="text-primary italic">Academic Success.</span>
                            </motion.h1>
                            <p className="text-gray-400 text-lg leading-relaxed font-medium">
                                Access institutional archives, synchronize your curriculum, and lead scholarly discussions within the nexus.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0f172a] bg-zinc-800 flex items-center justify-center overflow-hidden">
                                            <div className="w-full h-full bg-primary/40"></div>
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Nexus Network</span>
                            </div>
                            <p className="text-xs text-gray-400 font-bold leading-relaxed">
                                Join over 5,000+ scholars and educators already active in the institutional repository.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Authentication Form Area */}
                <div className="flex-1 p-8 md:p-16 lg:p-20 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-12">
                            <div className="flex gap-8 items-center border-b border-zinc-100 mb-8 overflow-x-auto scrollbar-hide">
                                <Link
                                    to="/login"
                                    className={`pb-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative shrink-0 ${mode === 'login' ? 'text-primary' : 'text-zinc-300 hover:text-zinc-500'}`}
                                >
                                    Authentication
                                    {mode === 'login' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
                                </Link>
                                <Link
                                    to="/register"
                                    className={`pb-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative shrink-0 ${mode === 'signup' ? 'text-primary' : 'text-zinc-300 hover:text-zinc-500'}`}
                                >
                                    Establish Node
                                    {mode === 'signup' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
                                </Link>
                            </div>
                            
                            <h2 className="text-4xl font-heading font-black tracking-tight text-text-main mb-3">
                                {mode === 'login' ? 'Welcome Back' : 'Join the Nexus'}
                            </h2>
                            <p className="text-text-muted text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
                                <span className="w-6 h-px bg-primary/40"></span> {mode === 'login' ? 'Synchronize your scholarly profile' : 'Initialize your institutional credentials'}
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Role Selector */}
                            <div className="space-y-4">
                                <label className="premium-label !ml-0">Identity Protocol</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {roles.map(r => (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => setRole(r.id)}
                                            className={`flex flex-col items-center justify-center py-5 px-3 rounded-2xl border-2 transition-all duration-300 ${role === r.id ? 'bg-primary/5 border-primary shadow-glow scale-[1.02]' : 'bg-white border-zinc-100 hover:bg-zinc-50'}`}
                                        >
                                            <span className="text-2xl mb-2">{r.icon}</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${role === r.id ? 'text-primary' : 'text-zinc-500'}`}>{r.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${mode}-${role}`}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-5"
                                >
                                    {mode === 'signup' && (
                                        <div className="space-y-3">
                                            <label className="premium-label">Full Academic Identity</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleChange} className={`premium-input ${errors.name ? 'border-red-500' : ''}`} placeholder="Scholarly Identity" />
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <label className="premium-label">Digital Credentials (Email)</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className={`premium-input ${errors.email ? 'border-red-500' : ''}`} placeholder="institutional@domain.edu" />
                                    </div>

                                    {mode === 'signup' && (role === 'Student' || role === 'Faculty') && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <label className="premium-label">Institutional Division</label>
                                                <input type="text" name="dept" value={formData.dept} onChange={handleChange} className="premium-input !text-sm" placeholder="e.g. Science" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="premium-label">Reference ID</label>
                                                <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} className="premium-input !text-sm" placeholder="ID-001" />
                                            </div>
                                            {role === 'Faculty' && (
                                                <div className="col-span-2 space-y-3">
                                                    <label className="premium-label !text-primary/70">Terminal PIN (6-Digit Security Node)</label>
                                                    <input type="text" name="facultyPin" value={formData.facultyPin} onChange={handleChange} className={`premium-input border-primary/20 bg-primary/5 ${errors.facultyPin ? 'border-red-500' : ''}`} placeholder="000000" maxLength={6} />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center pr-2">
                                            <label className="premium-label">Authorization Protocol</label>
                                            <button type="button" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? "Cover" : "Reveal"}
                                            </button>
                                        </div>
                                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className={`premium-input ${errors.password ? 'border-red-500' : ''}`} placeholder="********" />
                                    </div>

                                    {mode === 'signup' && (
                                        <div className="space-y-3">
                                            <label className="premium-label">Verify Authorization Protocol</label>
                                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`premium-input ${errors.confirmPassword ? 'border-red-500' : ''}`} placeholder="********" />
                                        </div>
                                    )}

                                    {role === 'Admin' && (
                                        <div className="p-6 rounded-3xl bg-secondary/5 border-2 border-dashed border-primary/20">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-primary mb-2 block italic">Architect Secret Directive</label>
                                            <input type="password" name="secretCode" value={formData.secretCode} onChange={handleChange} className="w-full bg-transparent border-0 focus:ring-0 outline-none text-text-main font-black text-xl tracking-widest" placeholder="CORE-SECRET" />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${((mode === 'login' && formData.terms) || (mode === 'signup' && formData.terms)) ? 'bg-primary border-primary' : 'border-zinc-200 group-hover:border-primary/30'}`}>
                                                <input type="checkbox" name="terms" checked={formData.terms} onChange={handleChange} className="hidden" />
                                                {formData.terms && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-text-main transition-colors">
                                                {mode === 'login' ? 'Trust this terminal' : 'Institutional compliance'}
                                            </span>
                                        </label>
                                        {mode === 'login' && <Link to="/forgot" className="text-[9px] font-black uppercase tracking-widest text-primary/70 hover:text-primary">Forgot Key?</Link>}
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {loginFeedback.message && (
                                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className={`p-5 rounded-2xl flex items-center gap-4 ${loginFeedback.type === 'error' ? 'bg-red-500/10 text-red-600 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20'}`}>
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                        {loginFeedback.type === 'error' ? '⚠️ Conflict: ' : '🛡️ Success: '}
                                        {loginFeedback.message}
                                    </p>
                                </motion.div>
                            )}

                            <button type="submit" disabled={isLoading} className="premium-btn w-full !py-6 shadow-2xl group disabled:opacity-70">
                                <span className="relative z-10">
                                    {isLoading ? 'Synchronizing Node...' : (mode === 'login' ? `Initialize Authentication` : 'Launch Identity node')}
                                </span>
                                {!isLoading && <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>}
                            </button>
                        </form>

                        <div className="mt-12 text-center">
                            <p className="text-[11px] font-bold text-text-muted">
                                {mode === 'login' ? "Not yet in the nexus?" : "Already established identity?"}
                                <Link to={mode === 'login' ? "/register" : "/login"} className="ml-3 text-primary font-black uppercase tracking-widest hover:underline underline-offset-8">
                                    {mode === 'login' ? 'Enroll Now' : 'Authorize Now'}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export const Login = ({ setUser }) => {
    const [localRole, setLocalRole] = useState('Student');
    return <AuthCard mode="login" role={localRole} setRole={setLocalRole} setUser={setUser} />;
};

export const Register = ({ setUser }) => {
    const [localRole, setLocalRole] = useState('Student');
    return <AuthCard mode="signup" role={localRole} setRole={setLocalRole} setUser={setUser} />;
};
