import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Toast from '../../components/Toast';
import { authFetch, getApiUrl } from '../../utils/storage';

import { getYouTubeThumbnail } from '../../utils/youtube';

const FILTER_SUBJECTS = ['All', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'History', 'Web Dev'];
const FILTER_DEPARTMENTS = ['All', 'Engineering', 'Science', 'Arts'];
const FILTER_TYPES = ['All', 'Textbook', 'Notes', 'Video'];

const BrowseResources = ({ user, setUser }) => {
    const role = user?.role || 'guest';
    const joinedPinState = (!user?.joinedPin || user?.joinedPin === 'undefined') ? '' : user.joinedPin;

    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('popular');
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toasts, setToasts] = useState([]);
    
    const [pinInput, setPinInput] = useState(joinedPinState);
    const [isSyncingPin, setIsSyncingPin] = useState(false);

    const [filters, setFilters] = useState({
        subject: 'All',
        department: 'All',
        type: 'All'
    });

    const showToast = React.useCallback((text, type = 'success') => {
        const id = Date.now();
        // Prevent duplicate connection failure toasts
        if (type === 'error' && text.includes('Central node unreachable')) {
            setToasts(prev => {
                if (prev.some(t => t.text.includes('Central node unreachable'))) return prev;
                return [...prev, { id, text, type }];
            });
        } else {
            setToasts(prev => [...prev, { id, text, type }]);
        }
    }, []);

    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    const loadDocs = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const activePin = role === 'Faculty'
                ? (user?.facultyPin || '')
                : ((!user?.joinedPin || user?.joinedPin === 'undefined') ? '' : user.joinedPin);
            const url = `/api/resources?role=${encodeURIComponent(role)}&joinedPin=${encodeURIComponent(activePin)}`;
            const response = await authFetch(url);

            if (!response.ok) throw new Error('Repository Synchronization Failed');
            const data = await response.json();
            // deduplicate by ID to ensure no "doubles" in the UI
            const uniqueResources = Array.from(new Map(data.map(item => [item.id, item])).values());
            setResources(uniqueResources);
        } catch (error) {
            console.error("Failed to fetch resources:", error);
            showToast('Synchronous connection failure. Central node unreachable.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [role, user?.joinedPin, user?.facultyPin, showToast]);

    useEffect(() => {
        loadDocs();
    }, [loadDocs]);

    const handleJoinFaculty = async (nextPin = pinInput) => {
        if (!user?.email) {
            showToast('Authentication required for node affiliation.', 'error');
            return;
        }
        setIsSyncingPin(true);
        try {
            const response = await authFetch('/api/auth/join-faculty', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, pin: nextPin })
            });

            if (response.ok) {
                const updatedUser = await response.json();
                // We preserve the token from local storage but update the user object
                const local = JSON.parse(localStorage.getItem('edu_user') || '{}');
                const merged = { ...updatedUser, token: local.token };
                localStorage.setItem('edu_user', JSON.stringify(merged));
                setUser(merged);
                showToast(nextPin ? 'Established scholarly affiliation successfully.' : 'Reset to Global repository.', 'success');
            } else {
                const msg = await response.text();
                showToast(msg || 'Node affiliation rejected.', 'error');
            }
        } catch {
            showToast('Connectivity failure during node sync.', 'error');
        } finally {
            setIsSyncingPin(false);
        }
    };

    const filteredResources = resources.filter(res => {
        const matchesSearch = (res.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (res.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubject = filters.subject === 'All' || res.subject === filters.subject;
        const matchesDept = filters.department === 'All' || res.department === filters.department;
        const matchesType = filters.type === 'All' || (res.type || '').toLowerCase() === filters.type.toLowerCase();

        return matchesSearch && matchesSubject && matchesDept && matchesType;
    }).sort((a, b) => {
        if (sortBy === 'highest_rated') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'alphabetical') return (a.title || '').localeCompare(b.title || '');
        return (b.id || 0) - (a.id || 0); // Default to newest
    });

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
            <Toast messages={toasts} onDismiss={removeToast} />
            
            {/* Elite Navigation Hub */}
            <header className="mb-16 space-y-10">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                    <div className="space-y-4">
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-4">
                            <span className="w-12 h-1 bg-primary rounded-full shadow-glow"></span>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-primary/60">Institutional Registry</h2>
                        </motion.div>
                        <h1 className="text-6xl font-heading font-black tracking-tighter text-bc leading-none">Resource Browser</h1>
                    </div>

                    {/* Node Affiliation Controller for Students */}
                    {role === 'Student' && (
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }} 
                            animate={{ y: 0, opacity: 1 }}
                            className="glass-card p-6 border-primary/20 shadow-2xl shadow-primary/5 flex flex-col md:flex-row items-center gap-6"
                        >
                            <div className="text-left">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-text-muted mb-1 flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${user?.joinedPin ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                                    {user?.joinedPin ? 'Encrypted Faculty Node' : 'Global Admin Node'}
                                </p>
                                <h3 className="text-sm font-black text-bc italic opacity-80">{user?.joinedPin ? `Connected to ${user.joinedPin}` : 'Not Affiliated'}</h3>
                            </div>
                            <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-100 rounded-2xl p-1.5 focus-within:border-primary/30 transition-all">
                                <input 
                                    type="text" 
                                    maxLength={6} 
                                    placeholder="Enter Access PIN" 
                                    value={pinInput}
                                    onChange={(e) => setPinInput(e.target.value)}
                                    className="bg-transparent border-0 outline-none text-xs font-black uppercase tracking-widest px-4 w-40 placeholder:text-zinc-300"
                                />
                                <button 
                                    onClick={handleJoinFaculty}
                                    disabled={isSyncingPin}
                                    className="premium-btn !h-10 !px-6 text-[9px] uppercase !tracking-[0.2em] shadow-xl"
                                >
                                    {isSyncingPin ? 'SYNCING...' : 'JOINT NODE'}
                                </button>
                                {user?.joinedPin && (
                                    <button 
                                        onClick={() => { setPinInput(''); handleJoinFaculty(''); }}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                                        title="Terminate Affiliation"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Filter Matrix */}
                <div className="glass-card p-8 border-primary/5 shadow-premium grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    <div className="space-y-4">
                        <label className="premium-label tracking-[0.4em]">Archive Domain</label>
                        <select className="premium-input !h-14 text-sm !font-black !appearance-none" value={filters.subject} onChange={(e) => setFilters({...filters, subject: e.target.value})}>
                            {FILTER_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="space-y-4">
                        <label className="premium-label tracking-[0.4em]">Classification</label>
                        <select className="premium-input !h-14 text-sm !font-black !appearance-none" value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
                            {FILTER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="space-y-4">
                        <label className="premium-label tracking-[0.4em]">Sort Logic</label>
                        <select className="premium-input !h-14 text-sm !font-black !appearance-none" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="popular">Most Popular</option>
                            <option value="highest_rated">Highest Rated</option>
                            <option value="alphabetical">Alpha-Order</option>
                        </select>
                    </div>
                    <div className="lg:col-span-2 space-y-4">
                        <label className="premium-label tracking-[0.4em]">Target Keyword</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Execute search across archive..." 
                                className="premium-input !h-14 text-sm !font-black !pl-12"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </div>
                    </div>
                </div>
            </header>

            {/* Results Grid */}
            <main>
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-6">
                        <span className="text-xs font-black text-bc-muted uppercase tracking-widest">{filteredResources.length} Assets Identified</span>
                        <div className="h-4 w-px bg-zinc-200"></div>
                        <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                             <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-zinc-400'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                             </button>
                             <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-zinc-400'}`}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                             </button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-32 text-center">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-16 h-16 border-4 border-primary border-t-transparent rounded-[24px] mx-auto mb-8 shadow-glow-sm"></motion.div>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted">Accessing Library Node...</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
                        {filteredResources.map((res, idx) => (
                            <motion.div 
                                key={res.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`glass-card group p-0 overflow-hidden flex flex-col hover:border-primary/40 transition-all duration-500 shadow-feature-hover ${viewMode === 'list' ? 'md:flex-row md:h-48' : ''}`}
                            >
                                <div className={`${viewMode === 'grid' ? 'h-52 w-full' : 'h-full w-72 flex-shrink-0'} bg-zinc-950 relative overflow-hidden`}>
                                    {res.thumbnailPath ? (
                                        <img src={getApiUrl(`/api/resources/files/${res.thumbnailPath}`)} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt="" />

                                    ) : (res.type === 'Video' && res.youtubeUrl) ? (
                                        <img 
                                            src={getYouTubeThumbnail(res.youtubeUrl)}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                                            alt="" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-6xl opacity-30 select-none">{res.type === 'Video' ? '🎬' : '📄'}</div>
                                    )}
                                    <div className="absolute top-4 left-4 px-4 py-1.5 bg-zinc-900/80 backdrop-blur-md rounded-xl text-[9px] font-black text-white uppercase tracking-widest border border-white/10">{res.type}</div>
                                </div>
                                
                                <div className="p-8 flex flex-col flex-1">
                                    <div className="flex justify-between items-start gap-4 mb-4">
                                        <h3 className="text-xl font-heading font-black text-text-main leading-tight group-hover:text-primary transition-colors line-clamp-2">{res.title}</h3>
                                        <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                                            <span className="text-amber-600 font-black text-[10px]">{res.rating || '5.0'}</span>
                                            <span className="text-amber-500 text-[10px]">★</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-text-muted italic opacity-80 mb-8 line-clamp-2 font-medium leading-relaxed">\"{res.description}\"</p>
                                    
                                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-zinc-100">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-primary/60">{res.subject}</div>
                                        <Link to={`/resource/${res.id}`} className="premium-btn !h-10 !px-8 text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-xl shadow-primary/20">
                                            Initialize Asset
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        
                        {filteredResources.length === 0 && (
                            <div className="col-span-full py-40 text-center opacity-40 select-none">
                                <div className="text-8xl mb-10">🔬</div>
                                <h3 className="text-4xl font-heading font-black tracking-tighter text-bc mb-4 uppercase">Archive Node Null</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted">Clear filters or establishing new node affiliation</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default BrowseResources;
