import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { motion, AnimatePresence } from 'framer-motion';

const lazyNamed = (loader, exportName) =>
  lazy(() => loader().then((module) => ({ default: module[exportName] })));

// User Pages
const Landing = lazy(() => import('./pages/user/Landing'));
const Home = lazy(() => import('./pages/user/Home'));
const BrowseResources = lazy(() => import('./pages/user/BrowseResources'));
const ResourceDetails = lazy(() => import('./pages/user/ResourceDetails'));
const Login = lazyNamed(() => import('./pages/user/Auth'), 'Login');
const Register = lazyNamed(() => import('./pages/user/Auth'), 'Register');
const ForgotPassword = lazyNamed(() => import('./pages/user/Identity'), 'ForgotPassword');
const ResetPassword = lazyNamed(() => import('./pages/user/Identity'), 'ResetPassword');
const Profile = lazyNamed(() => import('./pages/user/Misc'), 'Profile');
const FeedbackForm = lazyNamed(() => import('./pages/user/Misc'), 'FeedbackForm');
const NotFound = lazy(() => import('./pages/user/NotFound'));

// Info Pages
const TermsConditions = lazy(() => import('./pages/user/TermsConditions'));
const PrivacyPolicy = lazy(() => import('./pages/user/PrivacyPolicy'));
const ContactUs = lazy(() => import('./pages/user/ContactUs'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const UploadResource = lazyNamed(() => import('./pages/admin/Management'), 'UploadResource');
const ManageResources = lazyNamed(() => import('./pages/admin/Management'), 'ManageResources');
const ManageUsers = lazyNamed(() => import('./pages/admin/Management'), 'ManageUsers');
const ViewFeedback = lazyNamed(() => import('./pages/admin/Management'), 'ViewFeedback');
const ManageNotifications = lazyNamed(() => import('./pages/admin/Management'), 'ManageNotifications');

const AccessDenied = ({ role }) => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] text-center px-6 overflow-hidden mesh-gradient">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-16 max-w-2xl w-full relative z-10"
      >
        <motion.div 
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          className="text-7xl mb-8 block"
        >
          🔐
        </motion.div>
        <h2 className="text-4xl font-heading font-black tracking-tight text-bc mb-4">Institutional Clearances Required</h2>
        <p className="text-bc-muted mb-10 text-lg leading-relaxed">
          The requested node requires <strong className="text-primary uppercase tracking-widest">Faculty</strong> or <strong className="text-primary uppercase tracking-widest">Administrator</strong> level credentials.
          {role === 'Student' && (
             <span className="block mt-6 p-4 bg-primary/5 rounded-2xl border border-primary/10 text-sm font-bold text-primary italic">
               Scholars are restricted from modifying the institutional ledger in this version.
             </span>
          )}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login" className="premium-btn px-10">
            Authenticate
          </Link>
          <Link to="/home" className="btn-secondary px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 border-zinc-100 hover:bg-zinc-50 transition-all">
            Return to Base
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

const PageTransition = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const LayoutContainer = ({ children, isAdmin, user, setUser, hideNavbar }) => {
  return (
    <div className={`min-h-screen flex flex-col bg-bg text-bc transition-colors duration-300 ${isAdmin ? 'admin-layout' : 'user-layout'}`}>
      {!hideNavbar && <Navbar user={user} setUser={setUser} />}
      <main className={`flex-grow ${!isAdmin ? 'pt-20' : 'pt-4 md:pt-24'}`}>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  );
};

const RouteLoader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-bc px-6">
      <div className="glass-card px-10 py-8 text-center border-primary/10">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-3">
          Loading View
        </div>
        <p className="text-sm font-bold text-bc-muted">Preparing the next screen...</p>
      </div>
    </div>
  );
};

const App = () => {
  // Initialize user from localStorage to persist session
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('edu_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return { role: 'guest' };
      }
    }
    return { role: 'guest' };
  });

  const role = user.role;

  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* User Routes */}
          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
          <Route path="/home" element={<LayoutContainer user={user} setUser={setUser}><Home user={user} /></LayoutContainer>} />
          <Route path="/login" element={<LayoutContainer user={user} setUser={setUser}><Login setUser={setUser} /></LayoutContainer>} />
          <Route path="/register" element={<LayoutContainer user={user} setUser={setUser}><Register setUser={setUser} /></LayoutContainer>} />
          <Route path="/forgot" element={<LayoutContainer user={user} setUser={setUser}><ForgotPassword /></LayoutContainer>} />
          <Route path="/reset-password" element={<LayoutContainer user={user} setUser={setUser}><ResetPassword /></LayoutContainer>} />
          <Route path="/browse" element={<LayoutContainer user={user} setUser={setUser}><BrowseResources user={user} setUser={setUser} /></LayoutContainer>} />
          <Route path="/resource/:id" element={<LayoutContainer user={user} setUser={setUser}><ResourceDetails user={user} /></LayoutContainer>} />
          <Route path="/feedback" element={<LayoutContainer user={user} setUser={setUser}><FeedbackForm /></LayoutContainer>} />
          <Route path="/profile" element={<LayoutContainer user={user} setUser={setUser}><Profile user={user} setUser={setUser} /></LayoutContainer>} />

          {/* Info Pages Routes */}
          <Route path="/terms" element={<LayoutContainer user={user} setUser={setUser}><TermsConditions /></LayoutContainer>} />
          <Route path="/privacy" element={<LayoutContainer user={user} setUser={setUser}><PrivacyPolicy /></LayoutContainer>} />
          <Route path="/contact" element={<LayoutContainer user={user} setUser={setUser}><ContactUs /></LayoutContainer>} />

          {/* Admin & Faculty Shared Management Routes */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={role === 'Admin' || role === 'Faculty' ? <LayoutContainer isAdmin={true} user={user} setUser={setUser}><AdminDashboard user={user} /></LayoutContainer> : <Navigate to="/login" />} />
          <Route path="/admin/upload" element={role === 'Admin' || role === 'Faculty' ? <LayoutContainer isAdmin={true} user={user} setUser={setUser}><UploadResource user={user} /></LayoutContainer> : <LayoutContainer user={user} setUser={setUser}><AccessDenied role={role} /></LayoutContainer>} />
          <Route path="/admin/resources" element={role === 'Admin' || role === 'Faculty' ? <LayoutContainer isAdmin={true} user={user} setUser={setUser}><ManageResources user={user} /></LayoutContainer> : <Navigate to="/login" />} />
          
          {/* Strictly Administrative Routes */}
          <Route path="/admin/users" element={role === 'Admin' ? <LayoutContainer isAdmin={true} user={user} setUser={setUser}><ManageUsers /></LayoutContainer> : <Navigate to="/login" />} />
          <Route path="/admin/feedback" element={role === 'Admin' ? <LayoutContainer isAdmin={true} user={user} setUser={setUser}><ViewFeedback /></LayoutContainer> : <Navigate to="/login" />} />
          <Route path="/admin/notifications" element={role === 'Admin' ? <LayoutContainer isAdmin={true} user={user} setUser={setUser}><ManageNotifications /></LayoutContainer> : <Navigate to="/login" />} />

          {/* Fallback 404 Route */}
          <Route path="*" element={<LayoutContainer user={user} setUser={setUser}><NotFound /></LayoutContainer>} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
