import React, { useState } from 'react';
import Card from '../../components/Card';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import '../user/Auth.css';

const AdminLogin = ({ setRole }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();

        if (email === 'mpravaliswaraj@gmail.com' && password === '123456') {
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', 'Admin User');
            if (setRole) setRole('Admin');
            navigate('/admin/dashboard');
        } else {
            setError('Invalid Admin credentials.');
        }
    };

    return (
        <div className="auth-page-wrapper">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="auth-card-minimal"
            >
                <div className="auth-brand">EduLibrary Admin</div>
                <h2 className="auth-title">Admin Secure Login</h2>

                <form className="auth-form-minimal" onSubmit={handleLogin}>
                    <div className="auth-fields-container">
                        <div className="input-field">
                            <label>Admin ID or Email</label>
                            <input
                                type="text"
                                placeholder="admin@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-field">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    {error && <div className="field-error" style={{ textAlign: 'center', marginTop: '1rem' }}>{error}</div>}
                    <button type="submit" className="primary-action-btn" style={{ marginTop: '1.5rem' }}>Login to Dashboard</button>
                    <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
                        <Link to="/login" className="auth-link">← Back to User Login</Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
