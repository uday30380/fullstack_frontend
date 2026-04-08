import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
    return (
        <div className="page-wrapper" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
            <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ background: 'var(--glass-bg)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}
            >
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--text-main)', textAlign: 'center' }}>Privacy Policy</h1>

                <div style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
                    <p style={{ marginBottom: '1.5rem' }}>Last updated: {new Date().toLocaleDateString()}</p>

                    <h3 style={{ color: 'var(--text-main)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Information We Collect</h3>
                    <p>We collect information you provide directly to us when you register for an account, update your profile, or upload resources. This may include your name, email address, role (student/teacher/admin), and institutional details.</p>

                    <h3 style={{ color: 'var(--text-main)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. How We Use Your Information</h3>
                    <p>We use the information we collect to provide, maintain, and improve our services, authenticate users, personalize your experience, and communicate with you about updates or support inquiries.</p>

                    <h3 style={{ color: 'var(--text-main)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. Information Sharing</h3>
                    <p>We do not sell your personal information. We may share your information only as required by law or to protect the rights and safety of our community.</p>

                    <h3 style={{ color: 'var(--text-main)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>4. Data Security</h3>
                    <p>We implement reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.</p>

                    <h3 style={{ color: 'var(--text-main)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>5. Contact Us</h3>
                    <p>If you have any questions about this Privacy Policy, please contact us at privacy@edulibrary.edu.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default PrivacyPolicy;
