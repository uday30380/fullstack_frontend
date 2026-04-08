import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/Card';
import Table from '../../components/Table';
import RoleBadge from '../../components/RoleBadge';
import { motion } from 'framer-motion';
import { authFetch } from '../../utils/storage';

const AdminDashboard = ({ user }) => {
    const isFaculty = user.role === 'Faculty';
    const [stats, setStats] = useState({ totalResources: 0, totalUsers: 0, totalDownloads: 0, totalFeedback: 0 });
    const [recentUploads, setRecentUploads] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentFeedback, setRecentFeedback] = useState([]);
    const [recentNotifications, setRecentNotifications] = useState([]);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                const endpoints = [
                    authFetch('/api/admin/dashboard/stats'),
                    authFetch('/api/admin/dashboard/recent-uploads'),
                    authFetch('/api/admin/dashboard/recent-notifications')
                ];
                
                if (!isFaculty) {
                    endpoints.push(authFetch('/api/admin/dashboard/recent-users'));
                    endpoints.push(authFetch('/api/admin/dashboard/recent-feedback'));
                }

                const responses = await Promise.all(endpoints);
                
                const statsRes = responses[0];
                if (statsRes && statsRes.ok) {
                    setStats(await statsRes.json());
                } else if (statsRes && (statsRes.status === 401 || statsRes.status === 403)) {
                    setError("Clearance level insufficient or session expired. Please re-authenticate.");
                } else if (statsRes) {
                    setError("Scholastic telemetry node unreachable. Check backend status.");
                }

                const uploadsRes = responses[1];
                if (uploadsRes && uploadsRes.ok) {
                    const data = await uploadsRes.json();
                    setRecentUploads(data.slice(0, 5));
                }

                const notesRes = responses[2];
                if (notesRes && notesRes.ok) {
                    const data = await notesRes.json();
                    setRecentNotifications(data.slice(0, 5));
                }
                
                if (!isFaculty) {
                    const usersRes = responses[3];
                    if (usersRes && usersRes.ok) {
                        const data = await usersRes.json();
                        setRecentUsers(data.slice(0, 5));
                    }

                    const feedbackRes = responses[4];
                    if (feedbackRes && feedbackRes.ok) {
                        const data = await feedbackRes.json();
                        setRecentFeedback(data.slice(0, 5));
                    }
                }
            } catch (error) {
                console.error("Critical dashboard telemetry failure:", error);
                setError("Global connection interrupted. The repository sync node failed.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [isFaculty]);

    const statsConfig = [
        { title: isFaculty ? 'My Contribution Portfolio' : 'Asset Repository', value: stats.totalResources.toLocaleString(), icon: '📚', label: 'Resources' },
        { title: 'Knowledge Flow', value: (stats.totalDownloads || 0).toLocaleString(), icon: '⬇️', label: 'Extractions' },
    ];

    if (!isFaculty) {
        statsConfig.splice(1, 0, { title: 'Academic Network', value: stats.totalUsers.toLocaleString(), icon: '👥', label: 'Scholars' });
        statsConfig.push({ title: 'Critical Insight', value: stats.totalFeedback.toLocaleString(), icon: '💬', label: 'Reviews' });
    }

    const uploadsColumns = [
        { Header: 'Asset', accessor: 'title', Cell: ({ value }) => <span className="font-bold text-text-main leading-tight line-clamp-1">{value}</span> },
        { Header: 'Domain', accessor: 'subject', Cell: ({ value }) => <span className="px-3 py-1 bg-primary/5 text-primary border border-primary/10 rounded-full text-[9px] font-black uppercase">{value}</span> },
        { Header: 'Status', accessor: 'status', Cell: ({ value }) => (
            <div className="flex items-center gap-1.5 font-black text-[9px] uppercase">
                <span className={`w-1.5 h-1.5 rounded-full ${value === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                {value || 'Active'}
            </div>
        )},
        { Header: 'Origin', accessor: 'uploader', Cell: ({ value }) => <span className="text-[10px] font-black text-text-muted italic">{value || 'Admin'}</span> },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 space-y-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-heading font-black text-text-main tracking-tighter mb-3"
                    >
                        Management <span className="text-primary italic">Console</span>
                    </motion.h1>
                    <p className="text-text-muted font-bold uppercase tracking-[0.3em] text-[10px] flex items-center gap-3">
                        <span className="w-8 h-px bg-primary/30"></span> High-Fidelity Administrative Control
                    </p>
                </div>
                <div className="glass-card px-6 py-4 flex items-center gap-6 border-white/40 shadow-feature">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-main">System Nominal</span>
                    </div>
                    <div className="h-8 w-px bg-gray-100"></div>
                    <span className="text-text-muted text-[10px] font-black uppercase tracking-widest tabular-nums">
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Priority Status Nodes */}
            {!isFaculty && stats.pendingFacultyCount > 0 && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-10 rounded-[40px] bg-amber-500 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-amber-500/30 overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 p-10 opacity-10 text-9xl">⚖️</div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-[32px] flex items-center justify-center text-4xl shadow-inner border border-white/30">🔔</div>
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tight">Institutional Alert: <span className="underline decoration-white/30 font-black">{stats.pendingFacultyCount}</span> Applications Pending</h2>
                            <p className="text-white/80 font-black uppercase tracking-widest text-[10px] mt-2 italic shadow-sm">Scholastic identities awaiting validation for full node access.</p>
                        </div>
                    </div>
                    <Link to="/admin/users" className="relative z-10 px-10 py-5 bg-white text-amber-600 rounded-[28px] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-105 transition-all">Resolve Affiliations Now</Link>
                </motion.div>
            )}

            {error && (
                <motion.div 
                    initial={{ opacity: 0, x: 20 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className="p-8 rounded-[32px] bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-between gap-6"
                >
                    <div className="flex items-center gap-4">
                        <span className="text-3xl">⚠️</span>
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight">Telemetry Node Sync Failure</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{error}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Stats Grid */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
                {statsConfig.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-10 group hover:border-primary/20 hover:shadow-feature relative overflow-hidden"
                    >
                        <div className={`absolute -top-4 -right-4 p-8 opacity-[0.05] text-8xl group-hover:opacity-10 transition-all duration-700 group-hover:scale-125 group-hover:-rotate-12`}>
                            {s.icon}
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-heading font-black uppercase tracking-[0.2em] text-text-muted mb-6">{s.title}</p>
                            <div className="flex items-baseline gap-3">
                                <h3 className="text-5xl font-heading font-black text-text-main tabular-nums tracking-tighter">{s.value}</h3>
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">{s.label}</span>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary group-hover:w-full transition-all duration-1000 ease-out"></div>
                    </motion.div>
                ))}
            </div>

            {/* Main Data Layer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Recent Resource Catalog */}
                <div className="lg:col-span-8 flex flex-col gap-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card border-white/20 shadow-feature overflow-hidden"
                    >
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-zinc-50/50">
                            <div>
                                <h3 className="text-xl font-black text-text-main tracking-tight">Catalog Registry</h3>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted mt-1">High-priority asset flow</p>
                            </div>
                            <Link to="/admin/resources" className="text-[10px] font-black text-primary hover:translate-x-1 transition-transform">VIEW ALL RECORDS →</Link>
                        </div>
                        <div className="p-2">
                             <Table columns={uploadsColumns} data={recentUploads} />
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Scholarly Appraisal Feed */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card shadow-feature border-white/40">
                             <div className="p-6 border-b border-gray-50 bg-zinc-50/30">
                                <h3 className="text-sm font-black text-bc uppercase tracking-widest">Scholar Feedback</h3>
                             </div>
                             <div className="p-4 space-y-4">
                                {recentFeedback.map((f) => (
                                    <div key={f.id} className="p-4 rounded-2xl bg-zinc-50 border border-gray-100 hover:border-primary/20 transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[9px] font-black text-text-muted truncate max-w-[120px]">{f.userEmail || 'System Guest'}</span>
                                            <div className="flex text-primary text-[10px] font-black">★ {f.rating}</div>
                                        </div>
                                        <p className="text-xs text-bc leading-snug line-clamp-2 italic opacity-80">"{f.content}"</p>
                                    </div>
                                ))}
                                {recentFeedback.length === 0 && <div className="py-10 text-center text-[10px] uppercase font-black tracking-widest text-text-muted">No insights logged</div>}
                             </div>
                        </motion.div>

                        {/* Broadcast Registry */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card shadow-feature border-white/40">
                             <div className="p-6 border-b border-gray-50 bg-primary/5">
                                <h3 className="text-sm font-black text-primary uppercase tracking-widest">Broadcast Status</h3>
                             </div>
                             <div className="p-4 space-y-4">
                                {recentNotifications.map((n) => (
                                    <div key={n.id} className="flex gap-4 p-4 rounded-2xl border border-gray-50">
                                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${n.type === 'Warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                        <div>
                                            <h4 className="text-xs font-black text-bc">{n.title}</h4>
                                            <span className="text-[9px] text-text-muted uppercase tracking-widest font-black block mt-1">{n.targetRole} COHORT</span>
                                        </div>
                                    </div>
                                ))}
                                {recentNotifications.length === 0 && <div className="py-10 text-center text-[10px] uppercase font-black tracking-widest text-text-muted">Broadcast channel silent</div>}
                                <Link to="/admin/notifications" className="block text-center py-2 text-[9px] font-black text-primary uppercase tracking-widest border border-primary/20 rounded-xl hover:bg-primary/5 transition-all">Broadcast Center</Link>
                             </div>
                        </motion.div>
                    </div>
                </div>

                {/* Identity Feed Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                     <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-card border-white/40 shadow-feature overflow-hidden">
                        <div className="p-8 border-b border-gray-50 bg-zinc-50/50">
                            <h3 className="text-xl font-black text-text-main tracking-tight">Identity Registry</h3>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted mt-1">Institutional member feed</p>
                        </div>
                        <div className="p-4 flex flex-col gap-4">
                            {recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-text-main text-xs uppercase">{user.name.charAt(0)}</div>
                                        <div>
                                            <h4 className="text-sm font-bold text-bc">{user.name}</h4>
                                            <p className="text-[10px] text-text-muted font-medium italic">{user.email}</p>
                                        </div>
                                    </div>
                                    <RoleBadge role={user.role} />
                                </div>
                            ))}
                        </div>
                        <Link to="/admin/users" className="block p-6 text-center text-[10px] font-black text-primary uppercase tracking-widest border-t border-gray-50 hover:bg-zinc-50 transition-all">Consolidated User Registry</Link>
                     </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
