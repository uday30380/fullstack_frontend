import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Table from '../../components/Table';
import RoleBadge from '../../components/RoleBadge';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../../components/Toast';
import { authFetch } from '../../utils/storage';

const EditResourceModal = ({ resource, onClose, onUpdate, user }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [formData, setFormData] = useState({
        title: resource.title,
        subject: resource.subject,
        department: resource.department,
        type: resource.type,
        description: resource.description,
        youtubeUrl: resource.youtubeUrl || '',
        isGlobal: resource.isGlobal !== undefined ? resource.isGlobal : true
    });
    const [thumbnail, setThumbnail] = useState(null);
    const [resourceFile, setResourceFile] = useState(null);

    const handleUpdate = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setIsUpdating(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('subject', formData.subject);
        data.append('department', formData.department);
        data.append('type', formData.type);
        data.append('description', formData.description);
        if (formData.type === 'Video' && formData.youtubeUrl) {
            data.append('youtubeUrl', formData.youtubeUrl);
        } else {
            data.append('youtubeUrl', '');
        }
        data.append('uploader', user?.email || user?.name || resource.uploader);
        
        if (user?.role === 'Faculty' && user?.facultyPin) {
            data.append('facultyPin', user.facultyPin);
            data.append('isGlobal', 'false');
        } else if (user?.role === 'Admin') {
            data.append('facultyPin', 'Admin');
            data.append('isGlobal', formData.isGlobal.toString());
        }
        
        if (thumbnail) data.append('thumbnail', thumbnail);
        if (resourceFile) data.append('file', resourceFile);

        try {
            const response = await authFetch(`/api/admin/resources/${resource.id}`, {
                method: 'PUT',
                body: data
            });

            if (response.ok) {
                const updated = await response.json();
                onUpdate(updated);
            } else {
                const errorText = await response.text();
                alert(`Modification Rejected: ${errorText || "Repository Conflict"}`);
            }
        } catch {
            console.error("Update error");
            alert("Critical Sync Failure: Connection to repository aborted.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-secondary/20 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="w-full max-w-3xl glass-card p-12 border-primary/20 shadow-2xl relative overflow-y-auto max-h-[90vh]"
            >
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50">
                    <div>
                        <h2 className="text-3xl font-heading font-black text-text-main tracking-tight italic">Protocol <span className="text-primary italic">Modification</span></h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mt-2">Asset Lifecycle Adjustment Directive</p>
                    </div>
                    <button className="w-12 h-12 rounded-full hover:bg-red-50 hover:text-red-500 transition-all font-black text-xl flex items-center justify-center border border-gray-100" onClick={onClose}>✕</button>
                </div>

                <form className="space-y-10" onSubmit={handleUpdate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="premium-label">Asset Title</label>
                            <input type="text" className="premium-input !h-14 text-sm" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                        </div>
                        <div className="space-y-3">
                            <label className="premium-label">Classification</label>
                            <select className="premium-input !h-14 text-sm" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                <option value="Textbook">Textbook</option>
                                <option value="Notes">Notes</option>
                                <option value="Video">Video</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="premium-label">Scholarly Subject</label>
                            <input type="text" className="premium-input !h-14 text-sm" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} required />
                        </div>
                        <div className="space-y-3">
                            <label className="premium-label">Academic Department</label>
                            <input type="text" className="premium-input !h-14 text-sm" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} required />
                        </div>
                    </div>

                    {formData.type === 'Video' && (
                        <div className="space-y-3">
                            <label className="premium-label">External Video Directive (YouTube URL)</label>
                            <input type="url" className="premium-input !h-14 text-sm" value={formData.youtubeUrl} onChange={e => setFormData({ ...formData, youtubeUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
                        </div>
                    )}
                    {user?.role === 'Admin' && (
                        <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 flex items-center justify-between">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary block">Global Visibility Directive</label>
                                <p className="text-[9px] text-text-muted font-bold mt-1 uppercase tracking-tighter italic">If enabled, asset is indexed for ALL scholars regardless of node affiliation.</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setFormData({...formData, isGlobal: !formData.isGlobal})}
                                className={`w-14 h-8 rounded-full transition-all relative ${formData.isGlobal ? 'bg-primary' : 'bg-zinc-200'}`}
                            >
                                <motion.div animate={{ x: formData.isGlobal ? 24 : 4 }} className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm" />
                            </button>
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className="premium-label">Executive Summary (Description)</label>
                        <textarea rows="4" className="premium-input min-h-[120px] resize-none leading-relaxed text-sm" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 border-2 border-dashed border-zinc-100 rounded-3xl bg-white/50 text-center group hover:border-primary/30 transition-all">
                            <label className="premium-label !mb-4 !ml-0 text-center">Replace Thumbnail</label>
                            <input type="file" className="text-[10px] w-full cursor-pointer font-bold" onChange={e => setThumbnail(e.target.files[0])} />
                        </div>
                        <div className="p-8 border-2 border-dashed border-zinc-100 rounded-3xl bg-white/50 text-center group hover:border-primary/30 transition-all">
                            <label className="premium-label !mb-4 !ml-0 text-center">Replace Payload (File)</label>
                            <input type="file" className="text-[10px] w-full cursor-pointer font-bold" onChange={e => setResourceFile(e.target.files[0])} />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button type="button" className="flex-1 py-5 bg-gray-50 text-text-muted font-black text-[10px] uppercase tracking-widest rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all" onClick={onClose}>Dismiss</button>
                        <button type="submit" disabled={isUpdating} className="premium-btn flex-[2]">
                            {isUpdating ? "Synchronizing..." : "Finalize Modification"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export const ManageResources = ({ user }) => {
    const isFaculty = user?.role === 'Faculty';
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [resources, setResources] = useState([]);
    const [editingResource, setEditingResource] = useState(null);

    useEffect(() => {
        const loadDocs = async () => {
            try {
                const response = await authFetch('/api/admin/resources');
                let data = await response.json();
                if (isFaculty) {
                    // Faculty ONLY manage resources belonging to their unique institutional node (PIN)
                    data = data.filter(r => r.facultyPin === user.facultyPin);
                }
                setResources(data);
            } catch (error) {
                console.error("Failed to fetch resources:", error);
            }
        };
        loadDocs();
    }, [isFaculty, user?.name, user?.email, user?.facultyPin]);

    const handleDelete = async (id) => {
        if (!window.confirm("CRITICAL: This will expunge the asset and ALL scholarly history (downloads/bookmarks). Proceed?")) return;
        
        try {
            const response = await authFetch(`/api/admin/resources/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setResources(resources.filter(r => r.id !== id));
            } else {
                const errorText = await response.text();
                alert(`Expungement Failed: ${errorText || "Constraint Violation"}`);
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Network Error: Could not reach the administration API.");
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = resources.find(r => r.id === id);
            const newStatus = res.status === 'Active' ? 'Pending' : 'Active';
            const response = await authFetch(`/api/admin/resources/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...res, status: newStatus })
            });
            if (response.ok) {
                setResources(resources.map(r => r.id === id ? { ...r, status: newStatus } : r));
            }
        } catch (error) {
            console.error("Status toggle error:", error);
        }
    }

    const handleToggleFeatured = async (id, slot) => {
        try {
            const current = resources.find(r => r.id === id);
            const isRemoving = current.isFeatured && current.featuredOrder === slot;
            
            const formData = new URLSearchParams();
            formData.append('isFeatured', (!isRemoving).toString());
            formData.append('order', isRemoving ? '0' : slot.toString());

            const response = await authFetch(`/api/admin/resources/${id}/feature?${formData.toString()}`, {
                method: 'PUT'
            });

            if (response.ok) {
                // Refresh full list to handle conflict resolution (other resource might have been unfeatured)
                const refresh = await authFetch('/api/admin/resources');
                setResources(await refresh.json());
            }
        } catch (error) {
            console.error("Feature toggle failure:", error);
        }
    };


    const columns = [
        { Header: 'ID', accessor: 'id' },
        { Header: 'Title', accessor: 'title' },
        { Header: 'Faculty Node', accessor: 'facultyPin' },
        { Header: 'Category', accessor: 'type' },
        { Header: 'Scholar Lead', accessor: 'uploader' },
        { Header: 'Current State', accessor: 'status' },
        { Header: 'Operations', accessor: 'actions' },
    ];

    const filteredData = resources.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.id.toString().includes(searchTerm);
        const matchesType = typeFilter === 'all' || r.type.toLowerCase() === typeFilter.toLowerCase();
        const resStatus = r.status || 'Active';
        const matchesStatus = statusFilter === 'all' || resStatus.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesType && matchesStatus;
    });

    const data = filteredData.map(r => ({
        id: <span className="text-[10px] font-black text-bc-muted">#{r.id}</span>,
        title: <span className="font-bold text-bc">{r.title}</span>,
        facultyPin: <span className="px-3 py-1 bg-amber-500/5 text-amber-600 border border-amber-500/10 rounded-full text-[9px] font-black uppercase tracking-widest">{r.facultyPin || 'Global'}</span>,
        type: <span className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-text-muted">{r.type}</span>,
        uploader: <span className="text-[10px] font-black text-text-muted italic flex items-center gap-2">
            <span className="w-1 h-1 bg-primary rounded-full"></span> {r.uploader || 'Admin'}
        </span>,
        status: (
            <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                (r.status || 'Active') === 'Active' 
                ? 'bg-primary/10 text-primary border-primary/20' 
                : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${ (r.status || 'Active') === 'Active' ? 'bg-primary' : 'bg-yellow-500' }`}></span>
                {r.status || 'Active'}
            </div>
        ),
        actions: (
            <div className="flex items-center gap-3">
                {user?.role === 'Admin' && (
                    <div className="flex gap-1 p-1 bg-zinc-50 border border-zinc-100 rounded-xl mr-2">
                        {[1, 2, 3].map(slot => (
                            <button
                                key={slot}
                                onClick={() => handleToggleFeatured(r.id, slot)}
                                className={`w-7 h-7 rounded-lg text-[9px] font-black transition-all ${
                                    r.isFeatured && r.featuredOrder === slot
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-text-muted hover:bg-white hover:text-primary'
                                }`}
                                title={`Allocate to Home Slot #${slot}`}
                            >
                                #{slot}
                            </button>
                        ))}
                    </div>
                )}

                {(user?.role === 'Admin' || r.uploader === user?.name || r.uploader === user?.email) && (
                    <button 
                        className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center border border-transparent hover:border-primary/20" 
                        title="Modify Protocol" 
                        onClick={() => setEditingResource(r)}
                    >
                        ✏️
                    </button>
                )}
                
                {user?.role === 'Admin' && (
                    <button
                        className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center border ${
                            (r.status || 'Active') === 'Active' 
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' 
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                        title={(r.status || 'Active') === 'Active' ? 'Suspend Access' : 'Approve Index'}
                        onClick={() => handleToggleStatus(r.id)}
                    >
                        {(r.status || 'Active') === 'Active' ? '⏸️' : '✅'}
                    </button>
                )}
                
                {(user?.role === 'Admin' || r.uploader === user?.name || r.uploader === user?.email) && (
                    <button 
                        className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all flex items-center justify-center border border-transparent hover:border-red-500/20" 
                        title="Expunge Asset" 
                        onClick={() => handleDelete(r.id)}
                    >
                        🗑️
                    </button>
                )}
            </div>
        )
    }));

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-5xl font-heading font-black text-text-main tracking-tighter mb-3">Resource <span className="text-primary italic">Index</span></h1>
                    <p className="text-text-muted font-bold uppercase tracking-[0.3em] text-[10px] flex items-center gap-3">
                        <span className="w-8 h-px bg-primary/30"></span> Registry of all academic assets
                    </p>
                </div>
            </div>

            <div className="glass-card p-8 flex flex-col lg:flex-row gap-8 border-white/20">
                <div className="relative flex-1 group">
                    <label className="premium-label">Asset Search</label>
                    <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Target by title or reference ID..."
                            className="premium-input pl-14 h-14 text-sm font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 min-w-[200px]">
                        <label className="premium-label">Domain Filter</label>
                        <select className="premium-input h-14 px-6 bg-white/50 cursor-pointer text-sm font-bold" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                            <option value="all">All Categories</option>
                            <option value="textbook">Textbooks</option>
                            <option value="notes">Lecture Notes</option>
                            <option value="video">Video Lectures</option>
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="premium-label">State Filter</label>
                        <select className="premium-input h-14 px-6 bg-white/50 cursor-pointer text-sm font-bold" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">All States</option>
                            <option value="active">Active Index</option>
                            <option value="pending">Pending Review</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="glass-card p-6 overflow-hidden border-white/20 shadow-feature">
                <Table columns={columns} data={data} />
            </div>

            <AnimatePresence>
                {editingResource && (
                    <EditResourceModal 
                        resource={editingResource} 
                        onClose={() => setEditingResource(null)} 
                        onUpdate={(updated) => {
                            setResources(resources.map(r => r.id === updated.id ? updated : r));
                            setEditingResource(null);
                        }} 
                        user={user}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export const ManageUsers = () => {
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Student' });

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const response = await authFetch('/api/auth/users');
                if (response.ok) {
                    setUsers(await response.json());
                }
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };
        loadUsers();
    }, []);

    const setStatus = async (id, status) => {
        try {
            const user = users.find(u => u.id === id);
            const response = await authFetch(`/api/auth/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...user, status })
            });

            if (response.ok) {
                setUsers(users.map(u => u.id === id ? { ...u, status } : u));
            }
        } catch (error) {
            console.error("Status update error:", error);
        }
    };

    const handleToggleStatus = async (id) => {
        const user = users.find(u => u.id === id);
        let newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
        if (user.status === 'Pending') newStatus = 'Active';
        await setStatus(id, newStatus);
    };

    const handleEditUser = async (id, currentName) => {
        const newName = window.prompt("Modify Scholar Identity:", currentName);
        if (!newName || newName.trim() === "") return;

        try {
            const user = users.find(u => u.id === id);
            const response = await authFetch(`/api/auth/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...user, name: newName.trim() })
            });

            if (response.ok) {
                setUsers(users.map(u => u.id === id ? { ...u, name: newName.trim() } : u));
            }
        } catch (error) {
            console.error("Edit user error:", error);
        }
    };

    const columns = [
        { Header: 'Reference', accessor: 'id' },
        { Header: 'Identity', accessor: 'name' },
        { Header: 'Contact', accessor: 'email' },
        { Header: 'Privilege', accessor: 'role' },
        { Header: 'State', accessor: 'status' },
        { Header: 'Operations', accessor: 'actions' },
    ];

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.id.toString().toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role.toLowerCase() === roleFilter.toLowerCase();
        const matchesStatus = statusFilter === 'all' || u.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesRole && matchesStatus;
    });

    const data = filteredUsers.map(u => ({
        id: <span className="text-[10px] font-black text-text-muted">#{u.id.toString().slice(0, 8)}</span>,
        name: <span className="font-bold text-text-main">{u.name}</span>,
        email: <span className="text-sm text-text-muted font-medium">{u.email}</span>,
        role: <RoleBadge role={u.role} />,
        status: (
            <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                (u.status || 'Active') === 'Active' 
                ? 'bg-primary/10 text-primary border-primary/20' 
                : u.status === 'Denied' || u.status === 'Suspended'
                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}>
                {u.status || 'Active'}
            </div>
        ),
        actions: (
            <div className="flex items-center gap-3">
                {u.status === 'Pending' ? (
                    <>
                        <button onClick={() => setStatus(u.id, 'Active')} className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center font-bold" title="Approve Identity">✅</button>
                        <button onClick={() => setStatus(u.id, 'Denied')} className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center font-bold" title="Deny Access">❌</button>
                    </>
                ) : (
                    <>
                        <button 
                            className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center border border-transparent hover:border-primary/20" 
                            title="Modify Identity" 
                            onClick={() => handleEditUser(u.id, u.name)}
                        >
                            ✏️
                        </button>
                        <button
                            className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center border ${
                                (u.status || 'Active') === 'Active' 
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20' 
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                            }`}
                            title={(u.status || 'Active') === 'Active' ? 'Suspend Access' : 'Reinstate Access'}
                            onClick={() => handleToggleStatus(u.id)}
                        >
                            {(u.status || 'Active') === 'Active' ? '🔒' : '✅'}
                        </button>
                    </>
                )}
            </div>
        )
    }));

    const handleAddUserSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authFetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newUser,
                    password: 'TemporaryPassword123!', 
                    status: 'Active'
                })
            });

            if (response.ok) {
                const addedUser = await response.json();
                setUsers([...users, addedUser]);
                setIsAddUserOpen(false);
                setNewUser({ name: '', email: '', role: 'Student' });
            } else {
                alert("Creation failed. Verification required.");
            }
        } catch {
            console.error("Feedback synchronization failure");
            alert("Synchronization failure. User could not be created.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-5xl font-heading font-black text-text-main tracking-tighter mb-3">Scholar <span className="text-primary italic">Directory</span></h1>
                    <p className="text-text-muted font-bold uppercase tracking-[0.3em] text-[10px] flex items-center gap-3">
                        <span className="w-8 h-px bg-primary/30"></span> Registry of academic participants
                    </p>
                </div>
                <button
                    className="premium-btn px-10 py-5 text-xs tracking-widest uppercase"
                    onClick={() => setIsAddUserOpen(true)}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                    Onboard New Scholar
                </button>
            </div>

            <div className="glass-card p-8 flex flex-col lg:flex-row gap-8 border-white/20">
                <div className="relative flex-1 group">
                    <label className="premium-label">Identity Search</label>
                    <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Target by identity or credentials..."
                            className="premium-input pl-14 h-14 text-sm font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 min-w-[200px]">
                        <label className="premium-label">Privilege Filter</label>
                        <select className="premium-input h-14 px-6 bg-white/50 cursor-pointer text-sm font-bold" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="all">All Privileges</option>
                            <option value="student">Student Nodes</option>
                            <option value="faculty">Faculty Leads</option>
                            <option value="admin">Administrators</option>
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="premium-label">Access State Filter</label>
                        <select className="premium-input h-14 px-6 bg-white/50 cursor-pointer text-sm font-bold" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">All States</option>
                            <option value="active">Active Access</option>
                            <option value="suspended">Suspended Node</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="glass-card p-6 overflow-hidden border-white/20 shadow-feature">
                <Table columns={columns} data={data} />
            </div>

            <AnimatePresence>
                {isAddUserOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-secondary/40 backdrop-blur-md" 
                            onClick={() => setIsAddUserOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-xl glass-card p-12 border-primary/20 shadow-2xl relative z-10"
                        >
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-3xl font-heading font-black text-text-main tracking-tight">Onboarding <span className="text-primary italic">Protocol</span></h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted mt-2">New Academic Entity Integration</p>
                                </div>
                                <button className="w-10 h-10 rounded-full hover:bg-red-50 hover:text-red-500 transition-all font-black flex items-center justify-center border border-gray-100" onClick={() => setIsAddUserOpen(false)}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <form className="space-y-8" onSubmit={handleAddUserSubmit}>
                                <div className="space-y-3">
                                    <label className="premium-label !ml-0">Full Academic Identity</label>
                                    <input type="text" placeholder="e.g. Dr. Nikhil Reddy" required className="premium-input h-14 text-sm font-bold" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="premium-label !ml-0">Digital Credentials (Email)</label>
                                    <input type="email" placeholder="scholar@university.edu" required className="premium-input h-14 text-sm font-bold" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="premium-label !ml-0">Initial Access Privilege</label>
                                    <select className="premium-input h-14 appearance-none cursor-pointer text-sm font-bold" required value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                        <option value="Student">Student Node</option>
                                        <option value="Faculty">Faculty Lead</option>
                                        <option value="Admin">System Administrator</option>
                                    </select>
                                </div>
                                <div className="flex gap-4 pt-6">
                                    <button type="button" className="flex-1 py-5 rounded-2xl bg-zinc-50 text-text-muted font-heading font-black uppercase tracking-widest text-[10px] hover:bg-zinc-100 transition-all border border-zinc-100" onClick={() => setIsAddUserOpen(false)}>Cancel</button>
                                    <button type="submit" className="premium-btn flex-1 py-5 text-[10px] uppercase tracking-widest">Execute Registry</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const ViewFeedback = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState('all');
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [feedbackData, setFeedbackData] = useState([]);
    const [toasts, setToasts] = useState([]);

    const showToast = React.useCallback((text) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, text }]);
    }, []);
    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    async function loadFeedback() {
        try {
            const response = await authFetch('/api/feedback');
            if (response.ok) {
                setFeedbackData(await response.json());
            }
        } catch {
            console.error("Failed to fetch feedback");
        }
    }

    useEffect(() => {
        (async () => {
            await loadFeedback();
        })();
    }, []);

    const handleReply = async (id) => {
        if (!replyText.trim()) return;
        try {
            const response = await authFetch(`/api/feedback/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...selectedFeedback, status: 'Resolved', adminReply: replyText })
            });
            if (response.ok) {
                showToast('Executive Response Dispatched');
                setReplyText('');
                setSelectedFeedback(null);
                loadFeedback();
            }
        } catch {
            showToast('Response failure');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Purge this scholarly appraisal?")) return;
        try {
            const response = await authFetch(`/api/feedback/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showToast('Appraisal Expunged');
                loadFeedback();
            }
        } catch {
            showToast('Deletion failure');
        }
    };

    const generateStars = (rating) => {
        return Array(5).fill(0).map((_, i) => (
            <span key={i} className={`text-sm ${i < (rating || 0) ? "text-primary" : "text-zinc-200"}`}>★</span>
        ));
    };

    const filteredFeedback = feedbackData.filter(fb => {
        const matchesSearch = (fb.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (fb.content || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRating = ratingFilter === 'all' || fb.rating === parseInt(ratingFilter);
        return matchesSearch && matchesRating;
    });

    return (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 space-y-12">
            <Toast messages={toasts} onDismiss={removeToast} />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-5xl font-heading font-black text-text-main tracking-tighter mb-3">Scholarly <span className="text-primary italic">Appraisals</span></h1>
                    <p className="text-text-muted font-bold uppercase tracking-[0.3em] text-[10px] flex items-center gap-3">
                        <span className="w-8 h-px bg-primary/30"></span> Review of community feedback and ratings
                    </p>
                </div>
            </div>

            <div className="glass-card p-8 flex flex-col lg:flex-row gap-8 border-white/20 shadow-feature">
                <div className="relative flex-1 group">
                    <label className="premium-label">Appraisal Search</label>
                    <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Target appraisals by content or scholar identity..."
                            className="premium-input pl-14 h-14 text-sm font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="min-w-[240px]">
                    <label className="premium-label">Rating Filter</label>
                    <select className="premium-input h-14 px-6 bg-white/50 cursor-pointer text-sm font-bold" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
                        <option value="all">All Ratings</option>
                        <option value="5">5 Star - Exceptional</option>
                        <option value="4">4 Star - Distinguished</option>
                        <option value="3">3 Star - Conventional</option>
                        <option value="2">2 Star - Deficient</option>
                        <option value="1">1 Star - Critical</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                    {filteredFeedback.map((fb, idx) => (
                        <motion.div
                            key={fb.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass-card p-8 group hover:border-primary/30 transition-all flex flex-col shadow-feature"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-xs uppercase">{fb.userEmail ? fb.userEmail.charAt(0) : 'S'}</div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-text-main truncate max-w-[120px]">{fb.userEmail || 'System Guest'}</span>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-text-muted">{fb.date ? new Date(fb.date).toLocaleDateString() : 'Mar 2026'}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex gap-0.5">{generateStars(fb.rating)}</div>
                                    <span className="text-[10px] font-black text-primary mt-1">Ref #{fb.resourceId}</span>
                                </div>
                            </div>
                            
                            <div className="flex-grow">
                                <p className="text-sm font-medium text-text-main leading-relaxed italic opacity-90 line-clamp-4">"{fb.content}"</p>
                            </div>

                            {fb.adminReply && (
                                <div className="mt-6 p-4 rounded-xl bg-emerald-50 border-l-2 border-emerald-400">
                                    <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600 mb-1">Executive Response</p>
                                    <p className="text-[11px] font-medium text-bc italic">"{fb.adminReply}"</p>
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${fb.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                    {fb.status || 'Pending'}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setSelectedFeedback(fb)} className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all border border-gray-100" title="Reply">💬</button>
                                    <button onClick={() => handleDelete(fb.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-100" title="Purge">🗑️</button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredFeedback.length === 0 && (
                <div className="py-32 text-center text-text-muted italic flex flex-col items-center">
                    <span className="text-6xl mb-6 opacity-20">📜</span>
                    <p className="text-sm font-black uppercase tracking-widest">No scholarly appraisals found in the index</p>
                </div>
            )}

            <AnimatePresence>
                {selectedFeedback && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-secondary/80 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="w-full max-w-xl glass-card p-10 shadow-2xl relative">
                            <button onClick={() => setSelectedFeedback(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full hover:bg-gray-50 transition-all font-black border border-gray-100">✕</button>
                            <h2 className="text-2xl font-black mb-2 text-bc">Executive <span className="text-primary italic">Response</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-8 italic">Responding to: "{selectedFeedback.userEmail}"</p>
                            
                            <div className="space-y-6">
                                <div className="p-5 bg-zinc-50 rounded-2xl border border-gray-100 italic text-sm text-text-main mb-6">
                                    "{selectedFeedback.content}"
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Official Directive</label>
                                    <textarea 
                                        required 
                                        rows="4" 
                                        className="premium-input resize-none" 
                                        value={replyText} 
                                        onChange={e => setReplyText(e.target.value)} 
                                        placeholder="Enter your executive appraisal response..."
                                    ></textarea>
                                </div>
                                <button onClick={() => handleReply(selectedFeedback.id)} className="premium-btn w-full py-6 mt-4 uppercase tracking-widest text-sm">Dispatch Response</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const UploadResource = ({ user }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '', subject: '', department: '', type: '', description: '', youtubeUrl: '', videoSource: 'file',
        isGlobal: true // Default to global for Admin, Faculty will be node-locked
    });
    const [thumbnail, setThumbnail] = useState(null);
    const [resourceFile, setResourceFile] = useState(null);

    const handleUpload = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        setProgress(10);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('subject', formData.subject);
        data.append('department', formData.department);
        data.append('type', formData.type);
        data.append('description', formData.description);
        data.append('uploader', user?.email || user?.name || 'Faculty');
        
        if (formData.type === 'Video' && formData.youtubeUrl) {
            data.append('youtubeUrl', formData.youtubeUrl);
        }
        
        if (user?.role === 'Faculty' && user?.facultyPin) {
            data.append('facultyPin', user.facultyPin);
            data.append('isGlobal', 'false'); // Faculty resources are node-locked
        } else if (user?.role === 'Admin') {
            data.append('facultyPin', 'Admin');
            data.append('isGlobal', formData.isGlobal.toString());
        }
        
        if (thumbnail) data.append('thumbnail', thumbnail);
        if (resourceFile) data.append('file', resourceFile);

        try {
            const response = await authFetch('/api/admin/resources', {
                method: 'POST',
                body: data
            });

            if (response.ok) {
                setProgress(100);
                setTimeout(() => {
                    setIsUploading(false);
                    setIsSuccess(true);
                    setFormData({ title: '', subject: '', department: '', type: '', description: '', youtubeUrl: '', videoSource: 'file' });
                    setThumbnail(null);
                    setResourceFile(null);
                }, 500);
            } else {
                const errorText = await response.text();
                const status = response.status;
                console.error("Upload failure:", status, errorText);
                alert(`Upload Protocol Failure (HTTP ${status}): ${errorText || "The server rejected the sync request."}`);
                setIsUploading(false);
            }
        } catch (err) {
            console.error("Critical Connection Error during fetch:", err);
            // If the error is aborted, it might be due to size or proxy timeout
            if (err.name === 'AbortError') {
                alert("Synchronization interrupted: The connection was timed out or aborted by the browser. This often happens with very large files or slow network nodes.");
            } else if (err.message === 'Failed to fetch') {
                alert("Sync connection aborted: The target repository is unreachable. This usually means the backend is offline, or the file size exceeded the proxy limit. Please verify the backend is running and the file is under 500MB.");
            } else {
                alert(`Sync connection aborted: ${err.message || "Target repository unreachable"}. This often happens due to CORS policy or server-side resets.`);
            }
            setIsUploading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-20 flex items-center justify-center">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <div className="glass-card text-center p-16 space-y-8 border-primary/20 shadow-2xl shadow-primary/5">
                        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
                            ✓
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-bc tracking-tight uppercase">Synchronization Finalized</h2>
                            <p className="text-bc-muted mt-2 font-medium font-black uppercase tracking-widest text-[10px]">Academic material integrated into central repository</p>
                        </div>
                        <div className="flex gap-4 max-w-sm mx-auto">
                            <button className="btn-primary flex-1 py-4 font-black uppercase tracking-widest text-[10px]" onClick={() => { setIsSuccess(false); setProgress(0); }}>
                                Add Iteration
                            </button>
                            <Link to="/admin/resources" className="btn-secondary flex-1 py-4 flex items-center justify-center font-black uppercase tracking-widest text-[10px]">
                                Return to Index
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    const formVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: i => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
        })
    };

    return (
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-24 space-y-20">
            <motion.div 
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-4xl mx-auto"
            >
                <h1 className="text-7xl font-heading font-black text-text-main tracking-tight mb-8">Asset <span className="text-primary italic">Integration</span></h1>
                <div className="flex items-center justify-center gap-6">
                    <span className="h-[2px] w-16 bg-gradient-to-r from-transparent to-primary/30"></span>
                    <p className="text-text-muted font-black uppercase tracking-[0.5em] text-[11px] whitespace-nowrap">Onboarding new academic materials</p>
                    <span className="h-[2px] w-16 bg-gradient-to-l from-transparent to-primary/30"></span>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="glass-card p-16 border-white/60 shadow-feature max-w-4xl mx-auto relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                
                <form className="space-y-20 relative z-10" onSubmit={handleUpload}>
                    <div className="space-y-12">
                        <motion.div custom={0} variants={formVariants} initial="hidden" animate="visible" className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-2">Institutional Title</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Advanced Structural Analysis II" 
                                required 
                                className="premium-input h-24 text-4xl font-black italic tracking-tighter !px-10 border-primary/10 bg-white/50 focus:bg-white placeholder:text-zinc-200" 
                                value={formData.title} 
                                onChange={e => setFormData({ ...formData, title: e.target.value })} 
                            />
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <motion.div custom={1} variants={formVariants} initial="hidden" animate="visible" className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted ml-2">Domain (Subject)</label>
                                <div className="relative group">
                                    <select 
                                        className="premium-input h-16 appearance-none cursor-pointer !px-8 text-sm font-bold bg-white/50 border-primary/5 group-hover:border-primary/20" 
                                        required 
                                        value={formData.subject} 
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    >
                                        <option value="">Select Domain</option>
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="Mathematics">Mathematics</option>
                                        <option value="Physics">Physics</option>
                                        <option value="History">History</option>
                                        <option value="Web Dev">Web Dev</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-primary group-hover:scale-125 transition-transform duration-300">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div custom={2} variants={formVariants} initial="hidden" animate="visible" className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted ml-2">Department</label>
                                <div className="relative group">
                                    <select 
                                        className="premium-input h-16 appearance-none cursor-pointer !px-8 text-sm font-bold bg-white/50 border-primary/5 group-hover:border-primary/20" 
                                        required 
                                        value={formData.department} 
                                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                                    >
                                        <option value="">Select Department</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Science">Science</option>
                                        <option value="Arts">Arts</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-primary group-hover:scale-125 transition-transform duration-300">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.div custom={3} variants={formVariants} initial="hidden" animate="visible" className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted ml-2">Asset Classification</label>
                                <div className="relative group">
                                    <select 
                                        className="premium-input h-16 appearance-none cursor-pointer !px-8 text-sm font-bold bg-white/50 border-primary/5 group-hover:border-primary/20" 
                                        required 
                                        value={formData.type} 
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="">Select Type</option>
                                        <option value="Textbook">Textbook</option>
                                        <option value="Notes">Notes</option>
                                        <option value="Video">Video</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-primary group-hover:scale-125 transition-transform duration-300">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                        <motion.div custom={4} variants={formVariants} initial="hidden" animate="visible">
                            {user?.role === 'Admin' && (
                                <div className="p-8 bg-primary/5 rounded-[40px] border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-white shadow-xl shadow-primary/10 rounded-[32px] flex items-center justify-center text-3xl">🌐</div>
                                        <div>
                                            <h3 className="text-xl font-heading font-black text-text-main tracking-tight italic">Global <span className="text-primary italic">Visibility</span> Directive</h3>
                                            <p className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-widest italic leading-relaxed">Universal indexation across all scholarly institutional nodes.</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, isGlobal: !formData.isGlobal})}
                                        className={`w-20 h-11 rounded-full transition-all relative shrink-0 shadow-inner ${formData.isGlobal ? 'bg-primary' : 'bg-zinc-200'}`}
                                    >
                                        <motion.div animate={{ x: formData.isGlobal ? 40 : 4 }} className="absolute top-1.5 w-8 h-8 bg-white rounded-full shadow-lg" />
                                    </button>
                                </div>
                            )}
                        </motion.div>

                        {formData.type === 'Video' && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-12 bg-primary/[0.03] rounded-[40px] border-2 border-primary/10 shadow-inner space-y-10">
                                <div className="flex gap-8">
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({ ...formData, videoSource: 'file' })}
                                        className={`flex-1 py-6 px-8 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] border-2 transition-all duration-500 ${formData.videoSource === 'file' ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105' : 'bg-white/50 text-bc-muted border-primary/10 hover:border-primary/40 hover:bg-white'}`}
                                    >
                                        🎬 Local Multimedia Payload
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({ ...formData, videoSource: 'youtube' })}
                                        className={`flex-1 py-6 px-8 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] border-2 transition-all duration-500 ${formData.videoSource === 'youtube' ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105' : 'bg-white/50 text-bc-muted border-primary/10 hover:border-primary/40 hover:bg-white'}`}
                                    >
                                        🌐 YouTube Reference Index
                                    </button>
                                </div>

                                {formData.videoSource === 'youtube' ? (
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 ml-2">Reference URL (Required)</label>
                                        <input 
                                            type="url" 
                                            placeholder="https://youtube.com/watch?v=... OR https://youtube.com/playlist?list=..." 
                                            className="premium-input h-16 !px-8 border-primary/20" 
                                            value={formData.youtubeUrl} 
                                            onChange={e => setFormData({ ...formData, youtubeUrl: e.target.value })} 
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center py-6 border-2 border-dashed border-primary/20 rounded-3xl bg-white/30">
                                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-primary/60 italic">Standard payload selection enabled below</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        <motion.div custom={4} variants={formVariants} initial="hidden" animate="visible" className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted ml-2">Executive Summary (Description)</label>
                            <textarea rows="7" placeholder="Provide institutional context for this material..." required className="premium-input h-auto min-h-[220px] font-medium leading-relaxed resize-none !p-10 text-lg border-primary/5 bg-white/50 focus:bg-white" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                            <motion.div custom={5} variants={formVariants} initial="hidden" animate="visible" className="p-12 border-2 border-dashed border-zinc-200 rounded-[40px] group hover:border-primary/50 transition-all duration-700 bg-zinc-50/30 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] transition-colors duration-700"></div>
                                <label className="text-[11px] font-black uppercase tracking-[0.4em] text-text-muted absolute top-8 text-center w-full">Visual Key (Thumbnail)</label>
                                <div className="relative flex flex-col items-center gap-8 w-full">
                                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={e => setThumbnail(e.target.files[0])} />
                                    <div className="w-24 h-24 bg-white shadow-premium rounded-[32px] flex items-center justify-center text-4xl group-hover:rotate-12 transition-transform duration-500">
                                        {thumbnail ? '✅' : '🖼️'}
                                    </div>
                                    <div className="premium-btn py-4 px-10 text-[11px] w-full max-w-[280px] truncate shadow-feature/10">
                                        {thumbnail ? thumbnail.name : "Select Media Assets"}
                                    </div>
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Supports PNG, JPG, WebP</p>
                                </div>
                            </motion.div>
                            
                            <motion.div custom={6} variants={formVariants} initial="hidden" animate="visible" className="p-12 border-2 border-dashed border-zinc-200 rounded-[40px] group hover:border-primary/50 transition-all duration-700 bg-zinc-50/30 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] transition-colors duration-700"></div>
                                <label className="text-[11px] font-black uppercase tracking-[0.4em] text-text-muted absolute top-8 text-center w-full">
                                    {formData.type === 'Video' && formData.videoSource === 'file' ? 'Multimedia Load (MP4/MKV)' : 'Digital Payload (Asset)'}
                                </label>
                                <div className="relative flex flex-col items-center gap-8 w-full">
                                    <input 
                                        type="file" 
                                        accept={formData.type === 'Video' && formData.videoSource === 'file' ? "video/*" : ".pdf,.docx,.doc"}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                        onChange={e => setResourceFile(e.target.files[0])} 
                                    />
                                    <div className="w-24 h-24 bg-white shadow-premium rounded-[32px] flex items-center justify-center text-4xl group-hover:-rotate-12 transition-transform duration-500">
                                        {resourceFile ? '📦' : '💾'}
                                    </div>
                                    <div className="premium-btn py-4 px-10 text-[11px] w-full max-w-[280px] truncate shadow-feature/10">
                                        {resourceFile ? resourceFile.name : "Select Payload Package"}
                                    </div>
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Institutional Format: PDF/Doc/Vid</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    <motion.div 
                        custom={7} 
                        variants={formVariants} 
                        initial="hidden" 
                        animate="visible"
                        className="pt-12"
                    >
                        {isUploading ? (
                            <div className="space-y-10 p-12 bg-white rounded-[40px] border-2 border-primary/5 shadow-premium">
                                <div className="h-6 w-full bg-zinc-50 rounded-full overflow-hidden border border-zinc-100 p-1.5">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-primary via-orange-400 to-primary rounded-full shadow-lg shadow-primary/20"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                    ></motion.div>
                                </div>
                                <div className="flex justify-between items-center px-2">
                                    <div className="flex items-center gap-4">
                                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-glow"></div>
                                        <span className="text-[12px] font-black uppercase tracking-[0.5em] text-primary">Executing Sync Protocol...</span>
                                    </div>
                                    <span className="text-lg font-heading font-black text-text-main tabular-nums">{progress}%</span>
                                </div>
                            </div>
                        ) : (
                            <button type="submit" className="premium-btn w-full !py-10 text-base tracking-[0.5em] uppercase shadow-2xl shadow-primary/30 group !rounded-[32px]">
                                <span className="relative z-10">Initiate Synchronization Protocol</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </button>
                        )}
                    </motion.div>
                </form>
            </motion.div>
        </div>
    );
};

export const ManageNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);
    const [formData, setFormData] = useState({ title: '', message: '', type: 'Info', targetRole: 'All' });
    const [isDeploying, setIsDeploying] = useState(false);
    const [toasts, setToasts] = useState([]);

    const showToast = React.useCallback((text) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, text }]);
    }, []);
    const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await authFetch('/api/notifications');
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsDeploying(true);
        const url = editingNotification ? `/api/notifications/${editingNotification.id}` : '/api/notifications';
        const method = editingNotification ? 'PUT' : 'POST';

        try {
            const response = await authFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast(editingNotification ? 'Protocol Updated' : 'Broadcast Initiated');
                setFormData({ title: '', message: '', type: 'Info', targetRole: 'All' });
                setEditingNotification(null);
                setShowForm(false);
                fetchNotifications();
            } else {
                showToast('Deployment Rejection');
            }
        } catch {
            showToast('Sync failure');
        } finally {
            setIsDeploying(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Purge this broadcast from the repository?")) return;
        try {
            const response = await authFetch(`/api/notifications/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showToast('Broadcast Expunged');
                fetchNotifications();
            }
        } catch {
            showToast('Deletion failure');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-24 space-y-16">
            <Toast messages={toasts} onDismiss={removeToast} />
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-5xl font-heading font-black text-text-main tracking-tighter">Broadcast <span className="text-primary italic">Control</span></h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted mt-2 flex items-center gap-3">
                        <span className="w-8 h-px bg-primary/30"></span> Institutional Communication Interface
                    </p>
                </div>
                <button 
                    onClick={() => { setEditingNotification(null); setFormData({ title: '', message: '', type: 'Info', targetRole: 'All' }); setShowForm(true); }} 
                    className="premium-btn py-5 px-10 text-[10px] shadow-2xl shadow-primary/20"
                >
                    Initiate Unified Broadcast
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                    {notifications.map((n, idx) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass-card p-8 group hover:border-primary/30 transition-all flex flex-col shadow-feature"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                    n.type === 'Success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                    n.type === 'Warning' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                    'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                   {n.type}
                                </span>
                                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">
                                    Target: {n.targetRole}
                                </span>
                            </div>
                            
                            <div className="flex-grow">
                                <h3 className="text-lg font-black text-text-main tracking-tight mb-2">{n.title}</h3>
                                <p className="text-xs font-medium text-text-muted leading-relaxed line-clamp-3">{n.message}</p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-bc-muted uppercase">{new Date(n.createdAt).toLocaleDateString()}</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => { setEditingNotification(n); setFormData(n); setShowForm(true); }} 
                                        className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all border border-gray-100" 
                                        title="Modify"
                                    >✏️</button>
                                    <button 
                                        onClick={() => handleDelete(n.id)} 
                                        className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-100" 
                                        title="Purge"
                                    >🗑️</button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {notifications.length === 0 && (
                <div className="py-32 text-center text-text-muted italic flex flex-col items-center">
                    <span className="text-6xl mb-6 opacity-20">📢</span>
                    <p className="text-sm font-black uppercase tracking-widest">No active broadcasts in repository</p>
                </div>
            )}

            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-secondary/80 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 30 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.9, y: 30 }} 
                            className="w-full max-w-xl glass-card p-12 shadow-2xl relative overflow-hidden"
                        >
                             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0"></div>
                             <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 w-10 h-10 rounded-full hover:bg-gray-100 transition-all font-black border border-gray-50">✕</button>
                             
                             <h2 className="text-3xl font-black mb-2 text-bc">{editingNotification ? 'Modify' : 'Initiate'} <span className="text-primary italic">Broadcast</span></h2>
                             <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-10">Formulate official institutional correspondence</p>

                             <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Broadcast Title</label>
                                    <input required className="premium-input h-14" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Server Maintenance Schedule" />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Directive Type</label>
                                        <select className="premium-input h-14 cursor-pointer" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                            <option value="Info">Information</option>
                                            <option value="Warning">Warning</option>
                                            <option value="Success">Success</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Target Cohort</label>
                                        <select className="premium-input h-14 cursor-pointer" value={formData.targetRole} onChange={e => setFormData({...formData, targetRole: e.target.value})}>
                                            <option value="All">Institutional (All)</option>
                                            <option value="Student">Scholars (Students)</option>
                                            <option value="Faculty">Academic (Faculty)</option>
                                            <option value="Admin">Executive (Admin)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Executive Message</label>
                                    <textarea required rows="5" className="premium-input resize-none p-6 text-sm leading-relaxed" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Enter the official notification context..."></textarea>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isDeploying}
                                    className="premium-btn w-full py-6 mt-4 uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
                                >
                                    {isDeploying ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Synchronizing...
                                        </span>
                                    ) : (
                                        <span>Deploy Official Broadcast</span>
                                    )}
                                </button>
                             </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
