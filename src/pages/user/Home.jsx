import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/storage';

const Home = ({ user }) => {
    const role = user.role || 'guest';
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [latestBroadcast, setLatestBroadcast] = useState(null);
    const [featuredResources, setFeaturedResources] = useState([]);

    async function fetchFeatured(userRole, pin) {
        try {
            const url = `/api/resources/featured?role=${userRole || 'guest'}&joinedPin=${pin || ''}`;
            const response = await authFetch(url);

            if (response.ok) {
                const data = await response.json();
                setFeaturedResources(data);
            }
        } catch {
            console.error("Featured asset synchronization failure");
        }
    }

    async function fetchLatestBroadcast(userRole) {
        try {
            const response = await authFetch(`/api/notifications/role/${userRole}`);
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    setLatestBroadcast(data[0]); // Get the most recent
                }
            }
        } catch {
            console.error("Failed to fetch feedback");
        }
    }

    useEffect(() => {
        const initializeHome = async () => {
            if (role !== 'guest') {
                await fetchLatestBroadcast(role);
            }
            const activePin = (role === 'Faculty') ? user?.facultyPin : (user?.joinedPin || '');
            await fetchFeatured(role, activePin);
        };
        initializeHome();
    }, [role, user?.joinedPin, user?.facultyPin]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/browse?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    const displayResources = featuredResources.length > 0 
        ? featuredResources 
        : [
            { id: 1, title: "Architectural Core", author: "Registry", type: "SLOT", rating: "0.0", icon: "🏛️" },
            { id: 2, title: "Knowledge Hub", author: "Registry", type: "SLOT", rating: "0.0", icon: "📚" },
            { id: 3, title: "Elite Network", author: "Registry", type: "SLOT", rating: "0.0", icon: "⚡" },
        ].slice(0, 3 - featuredResources.length).concat(featuredResources).sort((a,b) => (a.featuredOrder || 0) - (b.featuredOrder || 0));

    return (
        <div className="flex flex-col gap-32 pb-32">
            {/* Hero & Broadcast Section */}
            <section className="relative min-h-[600px] flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent -z-10"></div>
                
                {/* Dynamic Broadcast Banner */}
                <AnimatePresence>
                    {latestBroadcast && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl w-full px-6 mb-16"
                        >
                            <Link to="/profile" className="flex items-center gap-4 p-4 glass-bento border-primary/20 bg-primary/[0.02] hover:bg-primary/[0.05] transition-all group">
                                <span className="flex h-10 w-10 rounded-xl bg-primary text-white items-center justify-center text-lg shadow-lg shadow-primary/20">📢</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Broadcast</span>
                                        <span className="w-1 h-1 rounded-full bg-primary/30"></span>
                                        <span className="text-[10px] font-bold text-text-muted uppercase">{new Date(latestBroadcast.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="text-sm font-black text-text-main truncate group-hover:text-primary transition-colors">{latestBroadcast.title}</h4>
                                </div>
                                <svg className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="max-w-5xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="badge-premium mb-10"
                    >
                        Institutional Knowledge Node
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-heading font-black tracking-tighter text-text-main mb-8 leading-[0.9] text-gradient"
                    >
                        Master Your <br />
                        <span className="text-primary italic">Digital Frontier.</span>
                    </motion.h1>

                    <motion.form
                        onSubmit={handleSearch}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative max-w-3xl mx-auto mt-16 group"
                    >
                        <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none text-text-muted/40 group-focus-within:text-primary transition-colors">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Initialize query across institutional data streams..."
                            className="premium-input pl-20 pr-44 py-8 text-xl shadow-2xl shadow-primary/5 hover-glow group-hover:border-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="absolute right-4 top-4 bottom-4 px-10 bg-primary text-white font-heading font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 uppercase tracking-[0.2em] text-[10px]">
                            Search
                        </button>
                    </motion.form>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap items-center justify-center gap-4 mt-10"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mr-2">Trending:</span>
                        {['Neural Nets', 'Quantum v2', 'Logic Sys', 'Bio-Sync'].map(tag => (
                            <button 
                                key={tag} 
                                onClick={() => { setSearchTerm(tag); }}
                                className="px-4 py-2 rounded-full bg-white border border-gray-100 text-[10px] font-black uppercase tracking-widest text-text-muted hover:border-primary/30 hover:text-primary transition-all"
                            >
                                {tag}
                            </button>
                        ))}
                    </motion.div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full space-y-48">
                {/* Top Categories Bento */}
                <section>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-20 gap-8">
                        <div>
                            <h2 className="text-5xl font-heading font-black tracking-tighter text-text-main">Elite Domains</h2>
                            <p className="text-text-muted mt-4 text-xl font-medium">Curated access points for major multidisciplinary archives.</p>
                        </div>
                        <button onClick={() => navigate('/browse')} className="badge-premium animate-pulse hover:animate-none">
                            Browse All Archives
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { icon: "💻", title: "CS", color: "bg-cat-blue", desc: "Digital Logic & Dev" },
                            { icon: "📐", title: "Math", color: "bg-cat-yellow", desc: "Calculus & Algebra" },
                            { icon: "🔬", title: "Physics", color: "bg-cat-purple", desc: "Quantum & Waves" },
                            { icon: "🧬", title: "Biology", color: "bg-cat-pink", desc: "Organic Systems" },
                        ].map((cat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-bento p-10 flex flex-col items-center text-center group cursor-pointer hover:border-primary/20 group hover-glow"
                                onClick={() => navigate(`/browse?subject=${encodeURIComponent(cat.title)}`)}
                            >
                                <div className={`w-24 h-24 rounded-3xl ${cat.color} flex items-center justify-center text-5xl mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-700`}>
                                    {cat.icon}
                                </div>
                                <h3 className="text-2xl font-heading font-black text-text-main group-hover:text-primary transition-colors">{cat.title}</h3>
                                <p className="text-[10px] font-black text-text-muted mt-2 uppercase tracking-[0.2em]">{cat.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Featured Bento */}
                <section>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-20 gap-8">
                        <div>
                            <h2 className="text-5xl font-heading font-black tracking-tighter text-text-main text-gradient">Featured Assets</h2>
                            <p className="text-text-muted mt-4 text-xl font-medium">Premium materials verified for institutional excellence.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {displayResources.map((res, idx) => (
                            <motion.div
                                key={res.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="glass-card overflow-hidden group hover:border-primary/30 hover-glow flex flex-col"
                            >
                                <div className="h-64 bg-zinc-50/50 flex items-center justify-center relative overflow-hidden p-0">
                                     <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent"></div>
                                     {res.thumbnailPath ? (
                                         <img 
                                            src={`/api/resources/files/${res.thumbnailPath}`} 
                                            alt="" 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                                         />
                                     ) : (res.type === 'Video' && res.youtubeUrl) ? (
                                         <img 
                                            src={`https://img.youtube.com/vi/${res.youtubeUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/)?.[2]}/hqdefault.jpg`}
                                            alt="" 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                                         />
                                     ) : (
                                         <span className="text-8xl group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-700 opacity-80">{res.icon || ((res.type || '').toLowerCase() === 'video' ? '🎬' : '📄')}</span>
                                     )}
                                     <div className="absolute top-6 right-6 badge-premium py-1 group-hover:bg-primary group-hover:text-white transition-colors z-10">{res.type}</div>
                                </div>
                                <div className="p-10 flex flex-grow flex-col">
                                    <div className="mb-8">
                                        <h3 className="text-3xl font-heading font-black text-text-main leading-tight mb-4 group-hover:text-primary transition-colors">{res.title}</h3>
                                        <p className="text-text-muted font-bold text-sm flex items-center gap-2">
                                            <span className="w-6 h-px bg-primary/40"></span>
                                            {res.author}
                                        </p>
                                    </div>
                                    
                                    <div className="mt-auto pt-8 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-primary font-black text-xl">★</span>
                                            <span className="text-text-main font-black tracking-tighter text-lg">{res.rating}</span>
                                        </div>
                                        <Link to={`/resource/${res.id}`} className="premium-btn !px-6 !py-3 !rounded-xl !tracking-[0.2em] !text-[9px]">
                                            Initialize Access
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Final CTA Bento */}
                <section>
                    <motion.div 
                        className="glass-card p-16 md:p-32 text-center bg-primary group relative overflow-hidden"
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-orange-400 opacity-95 group-hover:scale-110 transition-transform duration-1000 -z-10"></div>
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
                        
                        <h2 className="text-5xl md:text-[5rem] font-heading font-black tracking-tighter text-white mb-10 leading-none">Expand the Network.</h2>
                        <p className="text-white/80 text-xl font-medium mb-16 max-w-2xl mx-auto">Help us evolve the institutional knowledge base. Your contributions define the future of this repository.</p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                            <Link to="/admin/upload" className="px-12 py-6 bg-white text-primary font-heading font-black rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs">
                                Contribute Assets
                            </Link>
                            <Link to="/contact" className="px-10 py-5 text-white font-black uppercase tracking-[0.3em] text-[10px] hover:bg-white/10 rounded-xl transition-all">
                                Faculty Interface
                            </Link>
                        </div>
                    </motion.div>
                </section>
            </div>
        </div>
    );
};

export default Home;
