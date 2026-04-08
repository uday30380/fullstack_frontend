import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ title, children, className = '' }) => (
    <motion.div
        className={`glass-card p-8 border-white/20 hover:border-primary/20 hover:shadow-feature ${className}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
        {title && <h3 className="text-2xl font-heading font-black mb-5 text-text-main tracking-tight leading-tight">{title}</h3>}
        <div className="text-text-muted text-[15px] leading-relaxed font-medium">{children}</div>
    </motion.div>
);

export default Card;
