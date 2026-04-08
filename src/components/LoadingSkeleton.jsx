import React from 'react';

const LoadingSkeleton = ({ className = '', style = {} }) => (
    <div
        className={`relative overflow-hidden bg-zinc-100/50 rounded-2xl ${className}`}
        style={style}
    >
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/5 to-transparent shadow-[0_0_40px_rgba(249,115,22,0.1)]" />
    </div>
);

export default LoadingSkeleton;

