import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from '../utils/storage';

const Navbar = ({ user = { role: 'guest' }, setUser }) => {
    const role = user?.role || 'guest';
    const [isDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    useEffect(() => {
        let isSubscribed = true;
        
        // Only fetch if they have a role AND a valid token in memory/storage
        if (role !== 'guest' && user?.token) {
            const fetchNotes = async () => {
                try {
                    const response = await authFetch(`/api/notifications/role/${role}`);
                    if (!isSubscribed) return;
                    
                    if (response.ok) {
                        const data = await response.json();
                        setNotifications(data);
                    } else if (response.status === 401 || response.status === 403) {
                        console.warn("Notification sync stopped due to auth status:", response.status);
                        isSubscribed = false; // Stop further calls for this instance
                    }
                } catch (error) {
                    if (isSubscribed) console.error("Notification sync failure:", error);
                }
            };
            
            fetchNotes();
            const interval = setInterval(() => {
                if (isSubscribed) fetchNotes();
                else clearInterval(interval);
            }, 30000);

            return () => {
                isSubscribed = false;
                clearInterval(interval);
            };
        }
    }, [role, user?.token]);

    const handleLogout = () => {
        localStorage.removeItem('edu_user');
        setUser({ role: 'guest' });
        navigate('/home');
        setIsMobileMenuOpen(false);
    };

    const navLinks = {
        guest: [
            { label: 'Home', path: '/home' },
            { label: 'Browse', path: '/browse' }
        ],
        Student: [
            { label: 'Home', path: '/home' },
            { label: 'Browse', path: '/browse' },
            { label: 'Bookmarks', path: '/profile#bookmarks' }
        ],
        Faculty: [
            { label: 'Home', path: '/home' },
            { label: 'Browse', path: '/browse' },
            { label: 'Dashboard', path: '/admin/dashboard' },
            { label: 'Upload', path: '/admin/upload' },
            { label: 'Registry', path: '/admin/resources' }
        ],
        Admin: [
            { label: 'Dashboard', path: '/admin/dashboard' },
            { label: 'Upload', path: '/admin/upload' },
            { label: 'Resources', path: '/admin/resources' },
            { label: 'Users', path: '/admin/users' },
            { label: 'Feedback', path: '/admin/feedback' },
            { label: 'Broadcasts', path: '/admin/notifications' }
        ]
    };

    const currentLinks = navLinks[role] || navLinks.guest;

    return (
        <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
            <div className={`glass-card px-8 lg:px-10 border-white/40 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.08)] ${location.pathname === '/' ? 'bg-white/95' : 'bg-white/90'}`}>
                <div className="flex justify-between items-center h-20 md:h-22">
                    <Link 
                        to={role === 'Admin' ? '/admin/dashboard' : '/home'} 
                        className="flex items-center gap-3 group"
                    >
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-glow group-hover:rotate-6 transition-all duration-500">
                            E
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-heading font-black tracking-tighter text-text-main group-hover:text-primary transition-colors leading-none">
                                Educate<span className="text-primary italic">.</span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mt-1.5">Institutional Nexus</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <nav className="flex items-center space-x-1">
                            {currentLinks.map((link, index) => (
                                <Link
                                    key={index}
                                    to={link.path}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 relative group/link ${
                                        location.pathname === link.path 
                                        ? 'text-primary' 
                                        : 'text-text-muted hover:text-text-main'
                                    }`}
                                >
                                    {link.label}
                                    {location.pathname === link.path && (
                                        <span className="absolute -bottom-1 left-4 right-4 h-0.5 bg-primary rounded-full"></span>
                                    )}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-5 pl-8 border-l border-gray-100">
                            {(role === 'Admin' || role === 'Student' || role === 'Faculty') && (
                                <>
                                    <div className="relative flex items-center justify-center">
                                        <button
                                            className="p-3 rounded-2xl bg-gray-50/50 text-text-muted hover:text-primary hover:bg-primary/5 transition-all relative group/note"
                                            onClick={() => {
                                                setIsNotificationsOpen(!isNotificationsOpen);
                                                setIsProfileOpen(false);
                                            }}
                                        >
                                            <svg className="w-5 h-5 group-hover/note:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                            {notifications.length > 0 && (
                                                <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 bg-primary rounded-full ring-2 ring-white"></span>
                                            )}
                                        </button>
                                        
                                        <AnimatePresence>
                                            {isNotificationsOpen && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                                    className="absolute right-0 top-full mt-5 w-80 bg-white rounded-[28px] shadow-2xl border border-gray-100/50 overflow-hidden py-4 z-[100]"
                                                >
                                                    <div className="px-6 py-4 font-heading font-black text-xs uppercase tracking-widest border-b border-gray-50 text-text-main flex items-center justify-between">
                                                        <span>Notifications</span>
                                                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[10px]">{notifications.length} Active</span>
                                                    </div>
                                                    <div className="p-2 max-h-80 overflow-y-auto scrollbar-hide">
                                                        {notifications.length > 0 ? notifications.map((note, i) => (
                                                            <div key={i} className="px-5 py-4 text-sm hover:bg-gray-50/80 rounded-[20px] cursor-pointer transition-all border-b border-gray-50/30 last:border-0 group/nitem">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className={`w-2 h-2 rounded-full ${note.type === 'Warning' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]' : note.type === 'Success' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]'}`}></span>
                                                                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted group-hover/nitem:text-primary transition-colors">{note.title}</span>
                                                                </div>
                                                                <p className="text-xs font-medium text-text-main line-clamp-2 opacity-80 leading-relaxed mb-2">"{note.message}"</p>
                                                                <span className="text-[8px] font-black text-bc-muted/60 uppercase tracking-widest">{new Date(note.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                        )) : (
                                                            <div className="px-6 py-12 text-center text-[10px] font-black uppercase tracking-widest text-text-muted italic opacity-40">
                                                                Institutional silence maintained
                                                            </div>
                                                        )}
                                                    </div>
                                                    {role === 'Admin' && (
                                                        <Link to="/admin/notifications" className="block text-center py-4 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-all mx-4 rounded-xl border border-transparent hover:border-primary/20" onClick={() => setIsNotificationsOpen(false)}>
                                                            Administrative Broadcast Control
                                                        </Link>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="relative flex items-center justify-center">
                                        <button
                                            className="flex items-center justify-center h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-primary font-heading font-black shadow-xl shadow-primary/5 hover:scale-105 transition-all relative overflow-hidden group/prof border border-primary/10"
                                            onClick={() => {
                                                setIsProfileOpen(!isProfileOpen);
                                                setIsNotificationsOpen(false);
                                            }}
                                        >
                                            {user.avatarPath && user.avatarPath.length > 0 ? (
                                                <img 
                                                    key={user.avatarPath + (user.lastUpdated || '')}
                                                    src={`/api/resources/files/${user.avatarPath.startsWith('/') ? user.avatarPath.substring(1) : user.avatarPath}?v=${user.lastUpdated || 'initial'}`} 
                                                    alt="" 
                                                    className="w-full h-full object-cover" 
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        const placeholder = e.target.nextSibling;
                                                        if (placeholder) placeholder.classList.remove('hidden');
                                                    }}
                                                    onLoad={(e) => {
                                                        e.target.style.display = 'block';
                                                        const placeholder = e.target.nextSibling;
                                                        if (placeholder) placeholder.classList.add('hidden');
                                                    }}
                                                />
                                            ) : null}
                                            <div className={`w-full h-full flex items-center justify-center ${user.avatarPath ? 'hidden' : ''}`}>
                                                <span className="relative z-10 text-lg">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : (role === 'Admin' ? 'A' : 'U')}
                                                </span>
                                            </div>
                                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/prof:opacity-100 transition-opacity"></div>
                                        </button>
                                        
                                        <AnimatePresence>
                                            {isProfileOpen && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                                    className="absolute right-0 top-full mt-5 w-60 bg-white rounded-[28px] shadow-2xl border border-gray-100/50 overflow-hidden py-4 z-[100]"
                                                >
                                                    <div className="px-6 py-3 font-heading font-black text-[9px] uppercase tracking-widest text-text-muted border-b border-gray-50/50">Executive Profile</div>
                                                    <div className="p-2">
                                                        <Link to={role === 'Admin' ? "/admin/dashboard" : "/profile"} className="block px-4 py-3 text-sm font-bold text-text-main hover:bg-primary/5 hover:text-primary rounded-xl transition-all" onClick={() => setIsProfileOpen(false)}>
                                                            {role === 'Admin' ? 'Nexus Dashboard' : 'Academic Profile'}
                                                        </Link>
                                                        <div className="h-px bg-gray-50 my-2 mx-4"></div>
                                                        <button 
                                                            className="w-full text-left px-4 py-3 text-sm font-black text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center gap-3" 
                                                            onClick={handleLogout}
                                                        >
                                                            <span>Logout</span>
                                                            <span className="text-[10px] opacity-40">⌘L</span>
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </>
                            )}

                            {role === 'guest' && (
                                <div className="flex items-center gap-2">
                                    <Link to="/login" className="px-5 py-2 text-sm font-bold text-text-muted hover:text-primary transition-colors">Login</Link>
                                    <Link to="/register" className="px-6 py-2.5 bg-primary text-white text-sm font-heading font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">Sign Up</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button 
                            className="p-2.5 rounded-xl bg-gray-50 text-primary"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div className="md:hidden mt-2 bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-4 animate-in slide-in-from-top-4">
                    <div className="space-y-1">
                        {currentLinks.map((link, index) => (
                            <Link
                                key={index}
                                to={link.path}
                                className={`block px-6 py-3.5 rounded-2xl text-base font-bold transition-all ${
                                    location.pathname === link.path 
                                    ? 'bg-primary text-white shadow-lg' 
                                    : 'text-text-muted hover:bg-gray-50'
                                }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {role === 'guest' && (
                            <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col gap-2">
                                <Link to="/login" className="px-6 py-3 text-center text-sm font-bold text-text-main border border-gray-100 rounded-2xl" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                                <Link to="/register" className="px-6 py-3 text-center text-sm font-bold bg-primary text-white rounded-2xl shadow-lg" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
