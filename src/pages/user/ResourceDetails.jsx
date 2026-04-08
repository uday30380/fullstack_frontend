import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Toast from '../../components/Toast';
import { authFetch, isBookmarked as checkBookmarked, addBookmark, removeBookmark, addDownload } from '../../utils/storage';

const ResourceDetails = ({ user: activeUser }) => {
    const { id: _id } = useParams();
    const [resource, setResource] = useState(null);
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isBookmarked, setIsBookmarked] = useState(false);
    const [ratingInput, setRatingInput] = useState(5);
    const [commentInput, setCommentInput] = useState('');
    const [toasts, setToasts] = useState([]);

    const encodeFilePath = React.useCallback((path) => {
        return (path || '')
            .split('/')
            .filter(Boolean)
            .map(segment => encodeURIComponent(segment))
            .join('/');
    }, []);

    const getYouTubeEmbedUrl = (url) => {
        if (!url) return null;
        const playlistMatch = url.match(/[?&]list=([^#&?]+)/);
        if (playlistMatch) return `https://www.youtube.com/embed/videoseries?list=${playlistMatch[1]}`;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    useEffect(() => {
        const loadDetails = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/resources/${_id}`);
                if (!response.ok) throw new Error('Not Found');
                const resData = await response.json();
                setResource(resData);
                
                const feedbackRes = await fetch(`/api/feedback/resource/${_id}`);
                if (feedbackRes.ok) setComments(await feedbackRes.json());

                if (resData) {
                    const bookmarked = await checkBookmarked(resData.id);
                    setIsBookmarked(bookmarked);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadDetails();
    }, [_id]);

    const showToast = React.useCallback((text, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, text, type }]);
    }, []);

    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    const handleBookmarkToggle = async () => {
        if (isBookmarked) {
            await removeBookmark(resource.id);
            showToast('Expunged from collection');
        } else {
            await addBookmark(resource);
            showToast('Archived to institutional vault');
        }
        setIsBookmarked(!isBookmarked);
    };

    const handleDownload = async () => {
        if (!resource.resourcePath) {
            showToast('Electronic payload unavailable for this asset.', 'error');
            return;
        }

        const encodedPath = encodeFilePath(resource.resourcePath);
        const downloadUrl = `/api/resources/files/${encodedPath}?download=true&name=${encodeURIComponent(resource.title || 'resource')}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = resource.title || 'resource';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Executing high-speed load...', 'success');

        const result = await addDownload(resource);
        if (result.success) {
            setResource(prev => prev ? { ...prev, downloads: (prev.downloads || 0) + 1 } : prev);
        } else {
            showToast(`Download started, but history sync failed: ${result.error}`, 'error');
        }
    };

    const handleReviewSubmit = async () => {
        if (!commentInput.trim() || ratingInput === 0) {
            showToast('Academic rating and feedback mandatory.', 'error');
            return;
        }

        const currentUser = activeUser || JSON.parse(localStorage.getItem('edu_user') || '{}');
        if (!currentUser?.token || !currentUser?.id) {
            showToast('Please sign in again before submitting a rating.', 'error');
            return;
        }

        const newFeedback = {
            resourceId: resource.id,
            resourceTitle: resource.title,
            userEmail: currentUser.email,
            userId: currentUser.id,
            rating: ratingInput,
            content: commentInput.trim(),
            date: new Date().toISOString()
        };

        try {
            const response = await authFetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newFeedback)
            });

            if (response.ok) {
                const saved = await response.json();
                const updatedComments = [saved, ...comments];
                setComments(updatedComments);
                const nextAverage = updatedComments.reduce((sum, item) => sum + (item.rating || 0), 0) / updatedComments.length;
                setResource(prev => prev ? { ...prev, rating: Math.round(nextAverage * 10) / 10 } : prev);
                showToast('Scholarly perspective logged and archived. Check your email for confirmation.', 'success');
                setCommentInput('');
                setRatingInput(5);
            } else {
                const errorText = await response.text();
                showToast(errorText || 'Submission rejected by institutional node.', 'error');
            }
        } catch (error) {
            console.error("Feedback creation error:", error);
            showToast('Terminal connectivity failure.', 'error');
        }
    };

    const role = activeUser?.role || 'guest';

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-32 text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-20 h-20 border-4 border-primary border-t-transparent rounded-[32px] mx-auto mb-8 shadow-glow-sm"></motion.div>
                <h2 className="text-3xl font-heading font-black text-bc-muted uppercase tracking-[0.4em]">Accessing Archive...</h2>
            </div>
        );
    }

    if (!resource) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-32 text-center">
                <div className="text-8xl mb-10 opacity-20">🕳️</div>
                <h2 className="text-4xl font-heading font-black text-bc mb-6 uppercase tracking-tighter">Identity Not Found</h2>
                <p className="text-bc-muted mb-12 max-w-md mx-auto">The requested academic asset has been expunged or is currently under institutional quarantine.</p>
                <Link to="/browse" className="premium-btn px-12 h-14">Return to Registry</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-12">
            <Toast messages={toasts} onDismiss={removeToast} />
            
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 pb-12 border-b border-zinc-100/50"
            >
                <div className="space-y-6 flex-1">
                    <Link to="/browse" className="group inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.5em] text-text-muted hover:text-primary transition-all p-3 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-primary/20">
                        <svg className="w-5 h-5 transition-transform group-hover:-translate-x-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        Registry Navigation Node
                    </Link>
                    <div className="flex items-center gap-6">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-12 bg-primary rounded-full shadow-glow"></motion.div>
                        <div>
                            <h1 className="text-5xl lg:text-7xl font-heading font-black text-text-main leading-none tracking-tighter">{resource.title}</h1>
                            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary/80 mt-4 flex items-center gap-3">
                                {resource.type} PROTOCOL <span className="w-1.5 h-1.5 bg-primary/40 rounded-full"></span> {resource.department}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-5">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleBookmarkToggle}
                        className={`w-16 h-16 rounded-[28px] flex items-center justify-center transition-all border-2 shadow-feature-hover ${
                            isBookmarked 
                            ? 'bg-zinc-900 border-zinc-900 text-white' 
                            : 'bg-white border-zinc-100 text-text-muted hover:border-primary/40'
                        }`}
                        title={isBookmarked ? 'Expunge Archive' : 'Identify to Persona'}
                    >
                        <svg className="w-7 h-7" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                        </svg>
                    </motion.button>
                    {role !== 'guest' && (
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleDownload} 
                            className="premium-btn flex items-center gap-5 px-12 !h-16 text-xs uppercase tracking-[0.4em] shadow-xl shadow-primary/20"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12m0 0l4-4m-4 4l-4-4" /></svg>
                            Execute Registry Load
                        </motion.button>
                    )}
                </div>
            </motion.header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <main className="lg:col-span-8 space-y-12">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-0 overflow-hidden border-primary/5 shadow-2xl shadow-primary/10 group"
                    >
                        <div className="bg-zinc-50 border-b border-zinc-100 px-8 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400 group-hover:bg-red-500 transition-colors"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-400 group-hover:bg-amber-500 transition-colors"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-400 group-hover:bg-emerald-500 transition-colors"></div>
                                </div>
                                <span className="ml-6 text-[10px] font-black uppercase tracking-[0.4em] text-text-muted italic">Payload Visualization Interface</span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-black text-primary/60 uppercase tracking-widest">
                                <span className="animate-pulse w-2 h-2 bg-primary rounded-full"></span>
                                Live Sync
                            </div>
                        </div>

                        <div className="aspect-video bg-zinc-950 flex items-center justify-center relative overflow-hidden">
                            {resource.type === 'Video' ? (
                                resource.youtubeUrl ? (
                                    <iframe
                                        className="w-full h-full"
                                        src={getYouTubeEmbedUrl(resource.youtubeUrl)}
                                        title="Academic Series Content"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : resource.resourcePath ? (
                                    <video className="w-full h-full" controls preload="metadata">
                                        <source src={`/api/resources/files/${resource.resourcePath}`} type="video/mp4" />
                                    </video>
                                ) : (
                                    <div className="p-20 text-center">
                                        <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary text-5xl mx-auto mb-8">📴</div>
                                        <h3 className="text-2xl font-black text-white/40 uppercase tracking-widest">Content Stream Offline</h3>
                                    </div>
                                )
                            ) : (
                                <div className="w-full h-full bg-white flex flex-col items-center justify-center">
                                    {resource.thumbnailPath ? (
                                        <div className="relative w-full h-full group">
                                        <img className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700" src={`/api/resources/files/${encodeFilePath(resource.thumbnailPath)}`} alt={resource.title} />
                                            <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px] group-hover:backdrop-blur-0 transition-all duration-500 flex flex-col items-center justify-center p-12 text-center text-white">
                                                <div className="p-12 glass-card border-white/30 shadow-2xl relative">
                                                    <div className="text-7xl mb-8">📄</div>
                                                    <h3 className="text-3xl font-black mb-2 uppercase tracking-tighter">{resource.title}</h3>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Institutional Document Hub</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-20 text-center space-y-8 max-w-2xl">
                                            <div className="text-8xl">📑</div>
                                            <h2 className="text-4xl font-black text-zinc-900 leading-tight tracking-tighter">{resource.title}</h2>
                                            <p className="text-lg text-zinc-500 font-medium leading-relaxed italic">"{resource.description}"</p>
                                            <div className="h-px bg-zinc-100 w-24 mx-auto"></div>
                                            {resource.resourcePath && (
                                                <a href={`/api/resources/files/${encodeFilePath(resource.resourcePath)}`} target="_blank" rel="noopener" className="btn-secondary px-10 py-5 inline-flex items-center gap-4 text-xs">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    Access Full Institutional Volume
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <div className="glass-card p-12 border-primary/5 shadow-feature-hover">
                        <div className="flex items-center justify-between mb-16">
                            <h3 className="text-4xl font-heading font-black text-text-main flex items-center gap-6">
                                <span className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-3xl text-primary shadow-inner">🗨️</span>
                                Academic Dialogue
                            </h3>
                            <div className="text-right">
                                <div className="text-4xl font-black text-text-main tracking-tighter">{comments.length}</div>
                                <label className="premium-label !ml-0 text-right">Appraisals</label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-20">
                            <div className="space-y-12">
                                <div className="space-y-6">
                                    <label className="premium-label !ml-0">Scholarly Assessment</label>
                                    <div className="flex gap-5 p-5 bg-zinc-50/80 rounded-3xl border border-zinc-100 shadow-inner">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <motion.button
                                                key={star}
                                                whileHover={{ scale: 1.25, rotate: 5 }}
                                                whileTap={{ scale: 0.9 }}
                                                className={`text-4xl transition-all ${star <= ratingInput ? 'text-primary drop-shadow-[0_0_12px_rgba(249,115,22,0.4)]' : 'text-zinc-200'}`}
                                                onClick={() => setRatingInput(star)}
                                            >
                                                ★
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <textarea
                                        className="premium-input min-h-[220px] !p-10 !rounded-[40px] text-lg font-bold leading-relaxed bg-white shadow-inner border-zinc-100"
                                        placeholder="Articulate your academic findings regarding this asset..."
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                    ></textarea>
                                </div>

                                {role === 'guest' ? (
                                    <div className="p-10 bg-zinc-900 rounded-[32px] text-center border-4 border-zinc-800 shadow-2xl">
                                        <p className="text-white text-xs font-black uppercase tracking-[0.4em] mb-4">Identity Verification Mandatory</p>
                                        <Link to="/login" className="premium-btn w-full !h-14">Initialize Auth Protocol</Link>
                                    </div>
                                ) : (
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="premium-btn w-full !py-7 text-xs !tracking-[0.5em] shadow-2xl shadow-primary/30 group" 
                                        onClick={handleReviewSubmit}
                                    >
                                        Confirm Perspective Logic
                                        <svg className="w-5 h-5 group-hover:translate-x-3 transition-transform ml-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                    </motion.button>
                                )}
                            </div>

                            <div className="space-y-10">
                                <label className="premium-label !ml-0">Institutional History</label>
                                <div className="space-y-8 max-h-[600px] overflow-y-auto pr-6 scrollbar-hide">
                                    {comments.length > 0 ? (
                                        comments.map((c, idx) => (
                                            <motion.div 
                                                key={c.id} 
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="p-8 bg-zinc-50/50 rounded-[32px] border border-zinc-100 hover:border-primary/20 transition-all group"
                                            >
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-[18px] bg-zinc-900 text-white flex items-center justify-center font-black text-sm shadow-xl">
                                                            {c.userEmail ? c.userEmail.charAt(0).toUpperCase() : 'S'}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-black text-text-main truncate max-w-[150px]">{c.userEmail}</div>
                                                            <div className="text-[8px] font-black uppercase tracking-widest text-primary/60">Scholarly Verified</div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black border border-primary/20 shadow-sm">
                                                        ★ {c.rating}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-text-muted leading-relaxed font-semibold italic opacity-90">"{c.content}"</p>
                                                {c.adminReply && (
                                                    <div className="mt-8 p-6 bg-white rounded-3xl border-l-4 border-primary shadow-sm">
                                                        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary mb-3">Institutional Feedback Hub</p>
                                                        <p className="text-xs font-black text-text-main italic text-bc leading-relaxed">"{c.adminReply}"</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="py-24 text-center opacity-30 select-none">
                                            <div className="text-9xl mb-10">📜</div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.5em]">Academic Silence</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <aside className="lg:col-span-4 space-y-12">
                    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="sticky top-24">
                        <div className="glass-card p-12 border-primary/15 shadow-2xl shadow-primary/5 space-y-12">
                            <div className="flex items-center justify-between">
                                <div className="px-5 py-2 rounded-2xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-xl">
                                    {resource.type}
                                </div>
                                <div className="flex items-center gap-3 bg-amber-500/10 px-4 py-2 rounded-2xl border border-amber-500/20">
                                    <span className="text-amber-600 font-black text-sm">{resource.rating || '5.0'}</span>
                                    <span className="text-amber-500 animate-pulse">★</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="premium-label">Archive Dynamics</label>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="p-8 rounded-[36px] bg-zinc-50 border border-zinc-100 hover:border-primary/20 transition-all shadow-inner">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-3 opacity-60">IMPACT</div>
                                        <div className="text-3xl font-black text-text-main leading-none">
                                            {resource.downloads || 0}
                                            <span className="text-[8px] font-bold text-primary ml-2 uppercase">Nodes</span>
                                        </div>
                                    </div>
                                    <div className="p-8 rounded-[36px] bg-zinc-50 border border-zinc-100 hover:border-primary/20 transition-all shadow-inner">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-3 opacity-60">PAYLOAD</div>
                                        <div className="text-3xl font-black text-text-main leading-none">
                                            {resource.size || '4.8MB'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-primary/[0.03] rounded-[36px] border border-primary/10 flex items-center gap-6">
                                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-3xl shadow-xl border border-zinc-100">🎓</div>
                                <div className="min-w-0">
                                    <label className="premium-label !ml-0 !mb-1">Lead Curator</label>
                                    <div className="text-lg font-black text-text-main italic truncate">{resource.uploader || 'Executive Admin'}</div>
                                </div>
                            </div>

                            <div className="space-y-6 px-4">
                                <div className="flex justify-between items-center py-4 border-b border-zinc-100">
                                    <span className="premium-label !ml-0 !mb-0 tracking-widest text-zinc-400">Department</span>
                                    <span className="text-[11px] font-black text-text-main">{resource.department}</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-zinc-100">
                                    <span className="premium-label !ml-0 !mb-0 tracking-widest text-zinc-400">Domain</span>
                                    <span className="text-[11px] font-black text-text-main">{resource.subject}</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-zinc-100">
                                    <span className="premium-label !ml-0 !mb-0 tracking-widest text-zinc-400">Recorded</span>
                                    <span className="text-[11px] font-black text-text-main">{resource.uploadDate ? new Date(resource.uploadDate).toLocaleDateString() : 'Mar 2026'}</span>
                                </div>
                            </div>

                            {role !== 'guest' ? (
                                <div className="pt-10 space-y-5">
                                    <motion.button 
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleDownload} 
                                        className="premium-btn w-full !py-8 text-sm !tracking-[0.5em] shadow-2xl shadow-primary/30 group"
                                    >
                                        Execute Registry Load
                                        <svg className="w-5 h-5 ml-4 group-hover:translate-y-3 transition-transform" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12m0 0l4-4m-4 4l-4-4" /></svg>
                                    </motion.button>
                                    <button 
                                        onClick={handleBookmarkToggle} 
                                        className={`w-full py-6 rounded-[32px] text-[10px] font-black uppercase tracking-[0.3em] transition-all border-2 ${
                                            isBookmarked ? 'bg-zinc-900 border-zinc-900 text-white shadow-xl' : 'bg-white text-bc-muted border-black/5 hover:border-primary/20'
                                        }`}
                                    >
                                        {isBookmarked ? 'Expunge From Persona' : 'Identify to Archive'}
                                    </button>
                                </div>
                            ) : (
                                <div className="pt-10">
                                    <div className="p-10 bg-zinc-950 rounded-[42px] border-4 border-zinc-900 shadow-2xl relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-40"></div>
                                        <div className="relative z-10 text-center">
                                            <p className="text-white text-[10px] font-black uppercase tracking-[0.5em] mb-8 opacity-60">Authentication Protocol Required</p>
                                            <Link to="/login" className="premium-btn w-full !h-16 text-[10px] shadow-glow">Initialize Session</Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </aside>
            </div>
        </div>
    );
};

export default ResourceDetails;
