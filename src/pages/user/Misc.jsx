import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import RoleBadge from '../../components/RoleBadge';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch, getDownloads, getBookmarks, getFeedback, getApiUrl } from '../../utils/storage';

import { Link } from 'react-router-dom';

export const Profile = ({ user, setUser }) => {
    const [activeTab, setActiveTab] = useState('downloads');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editForm, setEditForm] = useState({
        name: user.name || '',
        dept: user.dept || '',
        idNumber: user.idNumber || '',
        facultyPin: user.facultyPin || ''
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [syncPin, setSyncPin] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const avatarUrl = user.avatarPath 
        ? getApiUrl(`/api/resources/files/${user.avatarPath.split('/').map(segment => encodeURIComponent(segment)).join('/')}?v=${user.lastUpdated || 'initial'}`)
        : null;


    const userInfo = {
        name: user.name || 'Scholar User',
        email: user.email || 'scholar@edu.com',
        role: user.role || 'Student',
        dept: user.dept || 'Engineering',
        id: user.id,
        avatar: avatarUrl
    };
    

    const [downloads, setDownloads] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [feedback, setFeedback] = useState([]);

    useEffect(() => {
        const loadProfileData = async () => {
            const [dl, bm, fb] = await Promise.all([
                getDownloads(),
                getBookmarks(),
                getFeedback()
            ]);
            setDownloads(dl);
            setBookmarks(bm);
            setFeedback(fb);

            // Self-Healing Identity Protocol: Retroactively issue Faculty PIN if missing or fetch it
            if (user.role === 'Faculty' && !user.facultyPin) {
                const triggerSync = async () => {
                    try {
                        const res = await authFetch(`/api/auth/profile/${user.email}`);
                        if (res.ok) {
                            const freshUser = await res.json();
                            if (freshUser.facultyPin) {
                                const updated = { ...user, facultyPin: freshUser.facultyPin };
                                localStorage.setItem('edu_user', JSON.stringify(updated));
                                setUser(updated);
                            }
                        }
                    } catch { /* empty */ }
                };
                triggerSync();
            }
        };
        if (user.role !== 'guest') {
            loadProfileData();
        }
    }, [user, setUser]);

    const handleEditToggle = () => {
        if (!isEditMode) {
            setEditForm({
                name: user.name || '',
                dept: user.dept || '',
                idNumber: user.idNumber || '',
                facultyPin: user.facultyPin || ''
            });
        }
        setIsEditMode(!isEditMode);
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        
        if (!userInfo.id) {
            console.error("Identity synchronization halted: Institutional ID missing.");
            alert("Administrative Alert: Your session is non-persistent or missing an institutional ID. Please re-authenticate.");
            return;
        }

        setIsSaving(true);
        try {
            // 1. Update Metadata
            const res = await authFetch(`/api/users/${userInfo.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            
            if (res.ok) {
                let updatedUser = await res.json();
                
                // 2. Upload Avatar if selected
                if (avatarFile) {
                    const formData = new FormData();
                    formData.append('file', avatarFile);
                    const avatarRes = await authFetch(`/api/users/${userInfo.id}/avatar`, {
                        method: 'POST',
                        body: formData
                    });
                    if (avatarRes.ok) {
                        updatedUser = await avatarRes.json();
                    }
                }

                // 3. Update Sync
                const finalUser = {
                    ...user,
                    ...updatedUser,
                    lastUpdated: Date.now() // Trigger fresh load only on change
                };
                localStorage.setItem('edu_user', JSON.stringify(finalUser));
                setUser(finalUser);
                setIsEditMode(false);
            } else {
                console.error("Profile sync rejected by central node.");
            }
        } catch {
            console.error("Profile sync failure");
        } finally {
            setIsSaving(false);
        }
    };

    if (user.role === 'guest') {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-12 text-center max-w-lg"
                >
                    <div className="text-6xl mb-6">🔒</div>
                    <h2 className="text-3xl font-black text-bc mb-4">Identity Verification Required</h2>
                    <p className="text-bc-muted mb-8 font-medium">Please authenticate your account to access your personal academic vault and history.</p>
                    <Link to="/login" className="btn-primary inline-flex px-10 py-4">Authenticate Now</Link>
                </motion.div>
            </div>
        );
    }

    const tabs = [
        { id: 'downloads', label: 'History', icon: '⬇️' },
        { id: 'bookmarks', label: 'Collection', icon: '🔖' },
        { id: 'feedback', label: 'Insights', icon: '⭐' }
    ];

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <AnimatePresence mode="wait">
                    {!isEditMode ? (
                        <motion.div 
                            key="view-mode"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-8"
                        >
                            {/* Profile Header */}
                            <div className="glass-card p-12 relative overflow-hidden border-primary/20 shadow-premium">
                                <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[10rem] font-black select-none pointer-events-none italic tracking-tighter">
                                    ELITE
                                </div>
                                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
                                
                                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 relative z-10">
                                    <div className="relative group">
                                        <motion.div 
                                            whileHover={{ scale: 1.02 }}
                                            className="w-48 h-48 rounded-[48px] bg-white ring-[12px] ring-white shadow-2xl overflow-hidden border-2 border-zinc-100 flex items-center justify-center text-7xl font-heading font-black text-primary"
                                        >
                                            {userInfo.avatar ? (
                                                <img 
                                                    key={userInfo.avatar}
                                                    src={userInfo.avatar} 
                                                    alt="" 
                                                    className="w-full h-full object-cover" 
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 ${userInfo.avatar ? 'hidden' : ''}`}>
                                                <span>{userInfo.name.charAt(0).toUpperCase()}</span>
                                            </div>
                                        </motion.div>
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -bottom-4 -right-4 p-5 rounded-3xl bg-primary text-white shadow-2xl shadow-primary/40 border-4 border-white font-black text-[10px] tracking-[0.3em] uppercase italic"
                                        >
                                            Nexus Tier
                                        </motion.div>
                                    </div>

                                    <div className="flex-1 text-center lg:text-left space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-center lg:justify-start">
                                                <h1 className="text-6xl font-heading font-black text-text-main tracking-tighter leading-none italic">{userInfo.name}</h1>
                                                <RoleBadge role={userInfo.role} />
                                            </div>
                                            <p className="text-bc-muted font-bold tracking-widest uppercase text-[10px] flex items-center justify-center lg:justify-start gap-4 opacity-60">
                                                <span className="w-10 h-px bg-primary/30"></span>
                                                {userInfo.dept} Division
                                            </p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8 py-2">
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">✉️</div>
                                                <span className="text-sm font-bold text-bc/80 tracking-tight">{userInfo.email}</span>
                                            </div>
                                            {user.idNumber && (
                                                <div className="flex items-center gap-4 group">
                                                    <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">🆔</div>
                                                    <span className="text-sm font-bold text-bc/80 tracking-tight">{user.idNumber}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {user.role === 'Faculty' && (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="inline-flex flex-col sm:flex-row items-center gap-6 p-4 px-8 bg-zinc-900 text-white rounded-[32px] shadow-2xl shadow-zinc-900/20"
                                            >
                                                <div className="flex flex-col items-center sm:items-start">
                                                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40 mb-1">Institutional Node PIN</span>
                                                    <span className="text-2xl font-heading font-black tracking-[0.5em] text-primary transition-all hover:tracking-[0.6em] cursor-default">{user.facultyPin || 'SYNCING'}</span>
                                                </div>
                                                <div className="flex gap-3 h-12">
                                                    <button onClick={() => { 
                                                        if (!user.facultyPin) return alert("Terminal not ready.");
                                                        navigator.clipboard.writeText(user.facultyPin); 
                                                        alert("Node Identifier Logged."); 
                                                    }} className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all" title="Log ID">📋</button>
                                                    <button onClick={async () => {
                                                        const res = await authFetch(`/api/auth/profile/${user.email}`);
                                                        if (res.ok) {
                                                            const freshUser = await res.json();
                                                            const updated = { ...user, facultyPin: freshUser.facultyPin };
                                                            localStorage.setItem('edu_user', JSON.stringify(updated));
                                                            setUser(updated);
                                                            alert("Terminal Synchronized.");
                                                        }
                                                    }} className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all" title="Sync Node">🔄</button>
                                                </div>
                                            </motion.div>
                                        )}
                                        
                                        <div className="pt-4">
                                            <button 
                                                onClick={handleEditToggle}
                                                className="premium-btn px-12 py-5 text-[11px] !tracking-[0.4em] group"
                                            >
                                                <span>CURATE SCHOLAR IDENTITY</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {user.role === 'Student' && (
                                    <div className="mt-12 pt-10 border-t border-zinc-100/50 flex flex-col xl:flex-row items-center justify-between gap-10">
                                        <div className="flex-1 text-center lg:text-left">
                                            <h3 className="text-2xl font-heading font-black text-text-main tracking-tight italic mb-2">Node <span className="text-primary italic">Affiliation</span></h3>
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-bc-muted opacity-60 max-w-md">
                                                {user.joinedPin && user.joinedPin !== 'undefined' 
                                                    ? `Biometric link established with Faculty Branch: ${user.joinedPin}` 
                                                    : 'Operative in Independent Discovery Mode (Central Repository Only)'}
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                                            <div className="relative group flex-1 sm:w-80">
                                                <input 
                                                    type="text" 
                                                    placeholder={user.joinedPin && user.joinedPin !== 'undefined' ? `Active Node: ${user.joinedPin}` : "Input Node PIN..."} 
                                                    className={`premium-input h-16 !px-8 text-sm font-black tracking-[0.2em] uppercase placeholder:opacity-30 ${user.joinedPin && user.joinedPin !== 'undefined' ? 'border-primary/40 bg-primary/[0.02]' : 'bg-white/50'}`}
                                                    value={syncPin}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === 'undefined') setSyncPin(''); 
                                                        else setSyncPin(val);
                                                    }}
                                                />
                                            </div>
                                            <button 
                                                disabled={isSyncing || !syncPin}
                                                onClick={async () => {
                                                    if (!syncPin) return;
                                                    setIsSyncing(true);
                                                    try {
                                                        const res = await authFetch('/api/auth/join-faculty', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ email: user.email, pin: syncPin })
                                                        });
                                                        if (res.ok) {
                                                            const updatedUser = { ...user, joinedPin: syncPin };
                                                            localStorage.setItem('edu_user', JSON.stringify(updatedUser));
                                                            setUser(updatedUser);
                                                            setSyncPin('');
                                                            alert("Node Synchronization Finalized.");
                                                        } else {
                                                            const err = await res.text();
                                                            alert(`Sync Rejected: ${err}`);
                                                        }
                                                    } catch {
                                                        alert("Terminal failure during cross-node sync.");
                                                    } finally {
                                                        setIsSyncing(false);
                                                    }
                                                }}
                                                className="premium-btn px-12 py-5 text-[10px] !tracking-[0.4em] font-black shadow-xl shadow-primary/10 disabled:opacity-30"
                                            >
                                                {isSyncing ? 'SYNCING...' : 'ESTABLISH LINK'}
                                            </button>
                                            {user.joinedPin && user.joinedPin !== 'undefined' && (
                                                <button 
                                                    onClick={async () => {
                                                        await authFetch('/api/auth/join-faculty', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ email: user.email, pin: '' })
                                                        });
                                                        const updatedUser = { ...user, joinedPin: '' };
                                                        localStorage.setItem('edu_user', JSON.stringify(updatedUser));
                                                        setUser(updatedUser);
                                                        alert("Affiliation Terminated. Returning to Global Access.");
                                                    }}
                                                    className="w-16 h-16 bg-red-500/5 text-red-500 border-2 border-red-500/20 rounded-[28px] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center font-black group"
                                                    title="Sever Affiliation"
                                                >
                                                    <span className="group-hover:scale-125 transition-transform">✕</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Activity Tabs */}
                            <div className="glass-card p-0 overflow-hidden shadow-premium border-primary/5">
                                <div className="p-6 bg-zinc-50/50 backdrop-blur-md border-b border-zinc-100">
                                    <div className="flex bg-zinc-200/50 p-2 rounded-[32px] relative gap-3 border border-white">
                                        {tabs.map(tab => (
                                            <button
                                                key={tab.id}
                                                className={`relative flex-1 flex items-center justify-center gap-4 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-700 z-10 rounded-2xl ${activeTab === tab.id ? 'text-white' : 'text-text-muted hover:text-text-main'}`}
                                                onClick={() => setActiveTab(tab.id)}
                                            >
                                                {activeTab === tab.id && (
                                                    <motion.div 
                                                        layoutId="activeTabIndicator" 
                                                        className="absolute inset-0 bg-zinc-900 rounded-2xl shadow-2xl shadow-zinc-900/20"
                                                        transition={{ type: "spring", bounce: 0.15, duration: 0.8 }}
                                                    />
                                                )}
                                                <span className="relative z-10 text-xl hidden sm:inline group-hover:scale-110 transition-transform">{tab.icon}</span>
                                                <span className="relative z-10">{tab.label}</span>
                                                <span className={`relative z-10 ml-2 px-3 py-1 rounded-xl text-[10px] font-black transition-colors ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-zinc-300 text-bc-muted'}`}>
                                                    {tab.id === 'downloads' ? downloads.length : tab.id === 'bookmarks' ? bookmarks.length : feedback.length}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-10">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeTab}
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -30 }}
                                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                        >
                                            {activeTab === 'downloads' && (
                                                <div className="space-y-6">
                                                    {downloads.length > 0 ? downloads.map((d, idx) => (
                                                        <motion.div 
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.1 }}
                                                            key={d.id} 
                                                            className="flex items-center justify-between p-8 rounded-[40px] bg-white border border-zinc-100 shadow-sm group hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-700"
                                                        >
                                                            <div className="flex items-center gap-8">
                                                                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform shadow-inner">⬇️</div>
                                                                <div>
                                                                    <div className="font-heading font-black text-text-main text-2xl tracking-tighter mb-1">{d.resourceTitle}</div>
                                                                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted opacity-60 flex items-center gap-3">
                                                                        <span className="w-6 h-px bg-zinc-200"></span>
                                                                        Accessed: {d.actionDate ? new Date(d.actionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Mar 31, 2026'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Link to={`/resource/${d.resourceId}`} className="premium-btn py-4 px-10 text-[10px] !tracking-widest !rounded-2xl shadow-none hover:shadow-lg">RE-ACCESS</Link>
                                                        </motion.div>
                                                    )) : (
                                                        <div className="py-32 text-center">
                                                            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="w-24 h-24 bg-primary/5 rounded-[32px] flex items-center justify-center text-6xl mx-auto mb-10 opacity-30 italic">📁</motion.div>
                                                            <h3 className="text-3xl font-heading font-black text-text-main mb-3 tracking-tighter">Registry Void</h3>
                                                            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-text-muted opacity-40">Your scholarly download logs are currently empty</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {activeTab === 'bookmarks' && (
                                                <div className="space-y-6">
                                                    {bookmarks.length > 0 ? bookmarks.map((b, idx) => (
                                                        <motion.div 
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.1 }}
                                                            key={b.id} 
                                                            className="flex items-center justify-between p-8 rounded-[40px] bg-white border border-zinc-100 shadow-sm group hover:border-orange-400/30 hover:shadow-xl hover:shadow-orange-400/5 transition-all duration-700"
                                                        >
                                                            <div className="flex items-center gap-8">
                                                                <div className="w-16 h-16 rounded-3xl bg-orange-400/10 flex items-center justify-center text-3xl group-hover:-rotate-12 transition-transform shadow-inner">🔖</div>
                                                                <div>
                                                                    <div className="font-heading font-black text-text-main text-2xl tracking-tighter mb-1">{b.resourceTitle}</div>
                                                                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted opacity-60 flex items-center gap-3">
                                                                        <span className="w-6 h-px bg-zinc-200"></span>
                                                                        Vaulted: {b.actionDate ? new Date(b.actionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Mar 31, 2026'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Link to={`/resource/${b.resourceId}`} className="premium-btn py-4 px-10 text-[10px] !tracking-widest !rounded-2xl shadow-none hover:shadow-lg !bg-orange-500 hover:!bg-orange-600">EXAMINE</Link>
                                                        </motion.div>
                                                    )) : (
                                                        <div className="py-32 text-center">
                                                            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="w-24 h-24 bg-orange-400/5 rounded-[32px] flex items-center justify-center text-6xl mx-auto mb-10 opacity-30 grayscale">📍</motion.div>
                                                            <h3 className="text-3xl font-heading font-black text-text-main mb-3 tracking-tighter">Collection Empty</h3>
                                                            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-text-muted opacity-40">Your personal archive contains no entries</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {activeTab === 'feedback' && (
                                                <div className="space-y-6">
                                                    {feedback.length > 0 ? feedback.map((f, idx) => (
                                                        <motion.div 
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.1 }}
                                                            key={f.id} 
                                                            className="p-10 rounded-[48px] bg-white border border-zinc-100 shadow-sm group hover:border-primary/30 transition-all duration-700 relative overflow-hidden"
                                                        >
                                                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-7xl font-black italic">ASSESSMENT</div>
                                                            <div className="flex justify-between items-start mb-8 relative z-10">
                                                                <div className="flex items-center gap-6">
                                                                    <div className="w-2 h-12 bg-primary rounded-full shadow-glow"></div>
                                                                    <div>
                                                                        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-2 italic">Institutional Appraisal</div>
                                                                        <div className="font-heading font-black text-text-main text-3xl tracking-tighter leading-none">{f.resourceTitle || 'Academic Asset'}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-[20px] shadow-2xl shadow-zinc-900/30">
                                                                    <span className="text-xl">★</span>
                                                                    <span className="text-lg font-heading font-black">{f.rating}</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-xl text-bc-muted font-medium italic leading-relaxed opacity-90 relative z-10 pl-8 border-l-2 border-zinc-50 ml-1">"{f.content}"</p>
                                                            
                                                            {f.adminReply && (
                                                                <div className="mt-8 p-6 bg-primary/[0.03] rounded-[32px] border border-primary/10 italic">
                                                                    <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-2">Executive Response</p>
                                                                    <p className="text-sm font-bold text-bc-muted leading-relaxed">"{f.adminReply}"</p>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )) : (
                                                        <div className="py-32 text-center">
                                                            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 5 }} className="w-24 h-24 bg-primary/5 rounded-[32px] flex items-center justify-center text-6xl mx-auto mb-10 opacity-30 grayscale">⚖️</motion.div>
                                                            <h3 className="text-3xl font-heading font-black text-text-main mb-3 tracking-tighter">Insights Void</h3>
                                                            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-text-muted opacity-40">No critical assessment history on record</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="edit-mode"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card p-12 border-primary/20 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] -mr-24 -mt-24"></div>
                            
                            <div className="text-center mb-12">
                                <h2 className="text-4xl font-heading font-black text-text-main tracking-tighter mb-3">Identity Terminal</h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted opacity-60">Synchronize your institutional scholarly metadata</p>
                            </div>

                            <form className="space-y-10" onSubmit={handleSaveProfile}>
                                <div className="flex flex-col items-center gap-8 pb-8 border-b border-zinc-100">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-[28px] overflow-hidden bg-zinc-50 border-2 border-zinc-100 flex items-center justify-center text-4xl shadow-inner relative">
                                            {avatarPreview ? (
                                                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : userInfo.avatar ? (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <img 
                                                        src={userInfo.avatar} 
                                                        alt="Current" 
                                                        className="w-full h-full object-cover" 
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
                                                        }}
                                                    />
                                                    <span style={{ display: 'none' }}>{userInfo.name.charAt(0).toUpperCase()}</span>
                                                </div>
                                            ) : (
                                                <span>{userInfo.name.charAt(0).toUpperCase()}</span>
                                            )}
                                            <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            </label>
                                        </div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-primary mt-4">Institutional Identifier</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="premium-label">Professional Name</label>
                                        <input 
                                            className="premium-input !py-5 !px-8 text-sm font-bold" 
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="premium-label">Academic ID</label>
                                        <input 
                                            className="premium-input !py-5 !px-8 text-sm font-bold" 
                                            value={editForm.idNumber}
                                            onChange={(e) => setEditForm({...editForm, idNumber: e.target.value})}
                                            placeholder="ID-2026-X"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-3">
                                        <label className="premium-label">Institutional Division</label>
                                        <input 
                                            className="premium-input !py-5 !px-8 text-sm font-bold" 
                                            value={editForm.dept}
                                            onChange={(e) => setEditForm({...editForm, dept: e.target.value})}
                                            required
                                        />
                                    </div>
                                    {user.role === 'Faculty' && (
                                        <div className="md:col-span-2 space-y-3">
                                            <label className="premium-label !text-primary/70">Access PIN (6-Digit Security Node)</label>
                                            <input 
                                                className="premium-input !py-5 !px-8 text-sm font-bold border-primary/20 focus:ring-primary/10" 
                                                value={editForm.facultyPin}
                                                onChange={(e) => setEditForm({...editForm, facultyPin: e.target.value})}
                                                maxLength={6}
                                                required
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col md:flex-row gap-4 pt-6">
                                    <button 
                                        type="submit" 
                                        disabled={isSaving}
                                        className="flex-1 premium-btn !py-6 text-xs !tracking-[0.4em] shadow-2xl shadow-primary/20 disabled:opacity-50"
                                    >
                                        {isSaving ? 'Synchronizing...' : 'Finalize Identity'}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleEditToggle}
                                        className="px-12 py-6 bg-zinc-50 border-2 border-zinc-100 rounded-[28px] text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:border-primary/20 transition-all font-bold"
                                    >
                                        Abort Protocol
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export const FeedbackForm = () => {
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        
        try {
            const savedUser = JSON.parse(localStorage.getItem('edu_user') || '{}');
            const userEmail = savedUser.email || 'Anonymous Scholar';
            const userId = savedUser.id;
            
            const response = await authFetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    userEmail,
                    resourceTitle: 'Universal Appraisal', // General feedback from profile
                    content,
                    rating,
                    status: 'Pending',
                    date: new Date().toISOString()
                })
            });

            if (response.ok) {
                setStatus('success');
                setContent('');
                setRating(5);
            } else {
                setStatus('error');
            }
        } catch {
            console.error("Feedback synchronization failure");
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-6 px-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 text-center max-w-lg border-emerald-500/20">
                    <div className="text-6xl mb-6 animate-bounce">✨</div>
                    <h2 className="text-3xl font-black text-bc mb-4">Perspective Logged</h2>
                    <p className="text-bc-muted mb-8 font-medium">Your critical assessment has been successfully synchronized with the institutional network.</p>
                    <button onClick={() => setStatus('idle')} className="btn-primary px-10 py-4">Submit Another</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 bg-transparent px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
                <div className="glass-card p-12 border-primary/20 shadow-2xl shadow-primary/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="text-center mb-12">
                        <div className="w-20 h-20 bg-primary/10 rounded-[28px] flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner">🗳️</div>
                        <h2 className="text-4xl font-heading font-black text-text-main tracking-tighter">University Perspective</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted mt-3 opacity-60">Optimizing the premium resource network</p>
                    </div>

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <label className="premium-label">Academic Rating (Distinction Level)</label>
                            <div className="grid grid-cols-5 gap-3">
                                {[1, 2, 3, 4, 5].map(v => (
                                    <button 
                                        type="button" 
                                        key={v}
                                        onClick={() => setRating(v)}
                                        className={`py-4 rounded-xl border-2 font-black transition-all ${rating === v ? 'bg-primary text-white border-primary shadow-glow' : 'bg-white border-zinc-100 text-bc-muted hover:border-primary/50'}`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <label className="premium-label">Scholarly Comments (Executive Summary)</label>
                            <textarea
                                rows="5"
                                placeholder="Your detailed review contributes to the collective excellence..."
                                required
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="premium-input !rounded-2xl resize-none text-sm font-bold leading-relaxed"
                            ></textarea>
                        </div>

                        {status === 'error' && (
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/5 p-3 rounded-xl border border-red-500/10">Synchronization failed. Central node unreachable.</p>
                        )}

                        <button 
                            type="submit" 
                            disabled={status === 'loading'}
                            className="btn-primary w-full py-5 rounded-2xl shadow-xl shadow-primary/20 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 group disabled:opacity-50"
                        >
                            {status === 'loading' ? 'Synchronizing...' : 'Submit Feedback'}
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};
