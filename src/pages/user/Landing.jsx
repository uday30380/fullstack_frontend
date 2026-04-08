import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
    const navigate = useNavigate();

    const handleEnter = () => {
        navigate('/home');
    };

    const stats = [
        { label: "Active Scholars", value: "12,400+", icon: "👥" },
        { label: "Digital Assets", value: "85,000+", icon: "📚" },
        { label: "Knowledge Cycles", value: "1.2M+", icon: "⚡" },
        { label: "Verified Nodes", value: "450+", icon: "🛡️" }
    ];

    const features = [
        {
            title: "Architectural Search",
            desc: "Locate precise academic materials with cross-domain semantic indexing.",
            icon: "🔍",
            size: "col-span-2"
        },
        {
            title: "Peer Sync",
            desc: "Real-time resource evaluation by institutional leads.",
            icon: "🤝",
            size: "col-span-1"
        },
        {
            title: "Elite Safety",
            desc: "Encrypted asset storage with role-based access protocols.",
            icon: "🔐",
            size: "col-span-1"
        },
        {
            title: "Neural Feed",
            desc: "Immediate administrative broadcasts and academic updates.",
            icon: "📡",
            size: "col-span-2"
        }
    ];

    return (
        <div className="relative min-h-screen w-full bg-background selection:bg-primary/20">
            {/* Immersive Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 45, 0],
                        x: [0, 30, 0],
                        y: [0, 20, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/4 -right-1/4 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[140px]"
                />
                <motion.div 
                    animate={{ 
                        scale: [1.1, 1, 1.1],
                        rotate: [0, -45, 0],
                        x: [0, -30, 0],
                        y: [0, -20, 0]
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-1/4 -left-1/4 w-[1000px] h-[1000px] bg-secondary/5 rounded-full blur-[140px]"
                />
            </div>

            {/* Content Container */}
            <div className="relative z-10">
                {/* Hero Section */}
                <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-32">
                    <motion.div
                        className="badge-premium mb-12"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Institutional Repository v3.0
                    </motion.div>

                    <div className="max-w-6xl mx-auto text-center space-y-12">
                        <motion.h1
                            className="text-7xl md:text-[10rem] font-heading font-black tracking-tighter text-text-main leading-[0.85] text-gradient"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            Elevate Your <br />
                            <span className="italic relative">
                                Academic Core.
                                <motion.div 
                                    className="absolute -bottom-4 left-0 h-4 bg-primary/10 -z-10"
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ delay: 1, duration: 1.2 }}
                                />
                            </span>
                        </motion.h1>

                        <motion.p
                            className="text-xl md:text-3xl text-text-muted max-w-3xl mx-auto leading-relaxed font-medium"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            The professional nexus for modern scholarship. Seamlessly integrate, 
                            discover, and master high-fidelity educational assets.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                        >
                            <button
                                className="premium-btn text-lg px-14 py-6 shadow-2xl shadow-primary/30 group"
                                onClick={handleEnter}
                            >
                                Enter Ecosystem
                                <svg viewBox="0 0 24 24" className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </button>
                            <button className="px-10 py-5 text-xs font-black uppercase tracking-[0.3em] text-text-muted hover:text-primary transition-all flex items-center gap-3">
                                <span className="w-8 h-px bg-current opacity-30"></span>
                                Institutional Overview
                            </button>
                        </motion.div>
                    </div>
                </section>

                {/* Institutional Pulse (Stats) */}
                <section className="py-32 bg-white/40 backdrop-blur-md border-y border-white/60">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-24">
                            {stats.map((s, idx) => (
                                <motion.div 
                                    key={idx}
                                    className="text-center space-y-3"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <div className="text-4xl mb-4">{s.icon}</div>
                                    <div className="text-4xl md:text-6xl font-heading font-black text-text-main tracking-tighter">{s.value}</div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">{s.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Bento */}
                <section className="py-48 px-6 max-w-7xl mx-auto">
                    <div className="text-center mb-24 space-y-6">
                        <h2 className="text-5xl md:text-7xl font-heading font-black tracking-tighter">Architectural <span className="text-primary italic">Excellence.</span></h2>
                        <p className="text-text-muted font-bold uppercase tracking-[0.4em] text-[11px] flex items-center justify-center gap-4">
                            <span className="w-12 h-px bg-primary/30"></span> Core System Capabilities <span className="w-12 h-px bg-primary/30"></span>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((f, idx) => (
                            <motion.div
                                key={idx}
                                className={`glass-bento p-12 group hover-glow ${f.size}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="text-5xl mb-10 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500 inline-block">{f.icon}</div>
                                <h3 className="text-3xl font-heading font-black text-text-main mb-4 group-hover:text-primary transition-colors">{f.title}</h3>
                                <p className="text-text-muted text-lg font-medium leading-relaxed">{f.desc}</p>
                                
                                <div className="mt-12 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                    Explore Spec <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-48 px-6">
                    <motion.div 
                        className="max-w-5xl mx-auto glass-card p-24 md:p-32 text-center relative overflow-hidden group border-primary/10"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent -z-10 group-hover:scale-110 transition-transform duration-1000"></div>
                        <h2 className="text-5xl md:text-8xl font-heading font-black tracking-tighter mb-10 leading-none">Ready to Synchronize?</h2>
                        <p className="text-xl md:text-2xl text-text-muted mb-16 max-w-2xl mx-auto font-medium">Join the institutional network and master your digital academic domain today.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <button className="premium-btn px-16 py-6 text-sm" onClick={() => navigate('/register')}>Establish Identity</button>
                            <button className="px-12 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-main hover:bg-primary/5 rounded-2xl transition-all" onClick={() => navigate('/login')}>Secure Login</button>
                        </div>
                    </motion.div>
                </section>
            </div>
        </div>
    );
};

export default Landing;
