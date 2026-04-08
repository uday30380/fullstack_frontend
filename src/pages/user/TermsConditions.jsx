import React from 'react';
import { motion } from 'framer-motion';

const TermsConditions = () => {
    return (
        <div className="page-wrapper" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
            <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ background: 'var(--glass-bg)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}
            >
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--text-main)', textAlign: 'center' }}>Terms & Conditions</h1>

                <div style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>
                    <h3 style={{ color: 'var(--text-main)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Acceptance of Terms</h3>
                    <p>By accessing and using EduLibrary, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>

                    <h3 style={{ color: 'var(--text-main)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. User Responsibilities</h3>
                    <p>Users must provide accurate information during registration and maintain the confidentiality of their account credentials. You are responsible for all activities that occur under your account.</p>

                    <h3 style={{ color: 'var(--text-main)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. Content Ownership</h3>
                    <p>You retain ownership of any original content you upload. By uploading, you grant EduLibrary a license to display, distribute, and promote your content within the platform.</p>

                    <h3 style={{ color: 'var(--text-main)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>4. Prohibited Activities</h3>
                    <p>Users may not upload copyrighted materials without permission, distribute malware, or engage in harassment or abusive behavior towards other community members.</p>

                    <h3 style={{ color: 'var(--text-main)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>5. Modifications to Service</h3>
                    <p>EduLibrary reserves the right to modify or discontinue any part of the service at any time without prior notice.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default TermsConditions;
