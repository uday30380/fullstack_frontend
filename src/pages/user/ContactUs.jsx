import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ContactUs = () => {
    const [status, setStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus('');
        
        try {
            // Simulated institutional synchronization delay for high-fidelity feel
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const response = await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                setStatus('Institutional Synchrony: Your inquiry has been logged in the central registry.');
                setFormData({ name: '', email: '', subject: '', message: '' });
                setTimeout(() => setStatus(''), 8000);
            } else {
                throw new Error('Registry Refusal');
            }
        } catch {
            setStatus('Dispatch Interference: The inquiry could not reach the repository.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const contactInfo = [
        { 
            icon: '📧', 
            label: 'Digital Correspondence', 
            value: 'udaykiranvempati123@gmail.com', 
            sub: '24/7 Academic Support',
            detail: 'Direct line to institutional administration'
        },
        { 
            icon: '📞', 
            label: 'Voice Terminal', 
            value: '8185892753', 
            sub: 'Mon-Fri, 9AM-6PM',
            detail: 'Real-time scholarly assistance'
        },
        { 
            icon: '🏛️', 
            label: 'Physical Repository', 
            value: 'KL University', 
            sub: 'Main Institutional Campus',
            detail: 'Vaddeswaram, Guntur, Andhra Pradesh'
        }
    ];

    return (
        <div className="relative min-h-screen pt-32 pb-24 px-6 overflow-hidden bg-bg-main selection:bg-primary/20">
            {/* Elite Nexus Background Architecture */}
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[180px] -z-10 animate-pulse-slow"></div>
            <div className="absolute -bottom-40 -left-20 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[160px] -z-10"></div>
            
            {/* Ambient Mesh Gradient */}
            <div className="absolute inset-0 opacity-[0.03] -z-10 pointer-events-none" 
                 style={{ backgroundImage: `radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)`, backgroundSize: '40px 40px' }}>
            </div>

            <div className="max-w-7xl mx-auto">
                <header className="max-w-3xl mx-auto text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h1 className="text-6xl md:text-8xl font-heading font-black text-text-main tracking-tighter mb-8 leading-[0.9]">
                            Contact <span className="text-primary italic relative">
                                Support
                                <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-primary/20 rounded-full"></span>
                            </span>
                        </h1>
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <span className="h-px w-8 bg-primary/30"></span>
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/60">Institutional Inquiry Portal</span>
                            <span className="h-px w-8 bg-primary/30"></span>
                        </div>
                        <p className="text-lg text-text-muted font-medium leading-relaxed">
                            Initialize a scholarly dialogue with our administrative nodes. Our response protocols are prioritized for institutional members.
                        </p>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
                    {/* Institutional Channels Sidebar */}
                    <motion.aside 
                        className="lg:col-span-5 space-y-6"
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        <h3 className="text-2xl font-heading font-black text-text-main px-4 mb-8">Scholarly <span className="text-primary">Channels</span></h3>
                        
                        <div className="space-y-4">
                            {contactInfo.map((item, idx) => (
                                <motion.div 
                                    key={idx} 
                                    whileHover={{ x: 8, scale: 1.02 }}
                                    className="glass-card p-8 group hover:border-primary/40 transition-all duration-300 relative overflow-hidden"
                                >
                                    <div className="absolute -right-4 -top-4 text-6xl opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                                        {item.icon}
                                    </div>
                                    <div className="flex gap-8 items-start">
                                        <div className="w-16 h-16 rounded-[22px] bg-primary/5 border border-primary/10 flex items-center justify-center text-3xl shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary mb-1.5">{item.label}</p>
                                            <p className="text-xl font-bold text-text-main group-hover:text-primary transition-colors mb-1">{item.value}</p>
                                            <p className="text-xs font-semibold text-text-muted italic flex items-center gap-2">
                                                <span className="w-1 h-px bg-primary/30"></span> {item.sub}
                                            </p>
                                            <div className="mt-4 pt-4 border-t border-primary/5">
                                                <p className="text-[11px] font-medium text-text-muted/70">{item.detail}</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="p-10 bg-primary/[0.02] rounded-[48px] border border-primary/10 relative overflow-hidden group hover:bg-primary/[0.04] transition-colors duration-500 mt-12">
                            <div className="absolute -right-6 -bottom-6 text-[160px] opacity-[0.03] rotate-12 items-center justify-center select-none group-hover:scale-110 transition-transform duration-700">📜</div>
                            <div className="relative z-10">
                                <h4 className="text-xl font-black text-text-main mb-4 font-heading tracking-tight">Academic Integrity Registry</h4>
                                <p className="text-[13px] text-text-muted leading-relaxed font-medium">
                                    All inquiries are logged in our institutional ledger. For copyright clearance or resource prioritization, please provide your faculty credentials for rapid processing.
                                </p>
                                <div className="mt-8 flex items-center gap-3">
                                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_var(--primary)]"></span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Node Level: Executive Admin</span>
                                </div>
                            </div>
                        </div>
                    </motion.aside>

                    {/* Inquiry Dispatch Directive Form */}
                    <motion.section 
                        className="lg:col-span-7"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        <div className="glass-card p-12 lg:p-20 border-white/80 shadow-feature relative overflow-hidden">
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                            
                            <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted ml-1">Scholar Identity</label>
                                        <div className="relative group">
                                            <input 
                                                required 
                                                type="text" 
                                                placeholder="Legal Academic Name" 
                                                className="premium-input h-16 !px-8 text-sm group-hover:border-primary/30 transition-all font-bold"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            />
                                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted ml-1">Digital Correspondence (Email)</label>
                                        <div className="relative group">
                                            <input 
                                                required 
                                                type="email" 
                                                placeholder="institutional@node.edu" 
                                                className="premium-input h-16 !px-8 text-sm group-hover:border-primary/30 transition-all font-bold"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            />
                                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted ml-1">Communication Logic Path</label>
                                    <div className="relative group">
                                        <select 
                                            className="premium-input h-16 !px-8 text-sm cursor-pointer appearance-none group-hover:border-primary/30 transition-all font-bold"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                            required
                                        >
                                            <option value="">Select Inquiry Directive</option>
                                            <option value="repository">Repository Access Issues</option>
                                            <option value="upload">Academic Asset Contribution</option>
                                            <option value="faculty">Faculty Privilege Inquiry</option>
                                            <option value="legal">Copyright & Legal Clearance</option>
                                            <option value="other">General Scholarly Inquiry</option>
                                        </select>
                                        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40 group-focus-within:text-primary transition-colors">
                                            ▼
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 rounded-full"></div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted ml-1">Inquiry Context (Dispatch Body)</label>
                                    <div className="relative group">
                                        <textarea 
                                            required 
                                            rows="6" 
                                            placeholder="Detailed context of your institutional inquiry..." 
                                            className="premium-input !p-8 text-sm min-h-[200px] resize-none leading-relaxed group-hover:border-primary/30 transition-all font-medium"
                                            value={formData.message}
                                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        ></textarea>
                                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 rounded-full"></div>
                                    </div>
                                </div>

                                <div className="pt-10">
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="premium-btn w-full !py-12 tracking-[0.4em] text-[11px] font-black group relative overflow-hidden"
                                    >
                                        <AnimatePresence mode="wait">
                                            {isSubmitting ? (
                                                <motion.span 
                                                    key="loading"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="flex items-center justify-center gap-4 relative z-10"
                                                >
                                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    SYNCHRONIZING DISPATCH...
                                                </motion.span>
                                            ) : (
                                                <motion.span 
                                                    key="idle"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="relative z-10"
                                                >
                                                    TRANSMIT INQUIRY DIRECTIVE
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                    </button>

                                    <AnimatePresence>
                                        {status && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-8 p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl overflow-hidden"
                                            >
                                                <p className="text-emerald-600 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3">
                                                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_var(--primary)]"></span>
                                                    {status}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </form>
                        </div>
                    </motion.section>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
