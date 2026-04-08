import React from 'react';

const RoleBadge = ({ role }) => {
    const config = {
        Student: {
            bg: 'bg-blue-500/5',
            text: 'text-blue-600',
            dot: 'bg-blue-500'
        },
        Faculty: {
            bg: 'bg-amber-500/5',
            text: 'text-amber-600',
            dot: 'bg-amber-500'
        },
        Admin: {
            bg: 'bg-primary/10',
            text: 'text-primary',
            dot: 'bg-primary'
        }
    };

    const displayRole = role || 'Student';
    const style = config[displayRole] || config.Student;

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-heading font-black tracking-widest uppercase border border-current/10 ${style.bg} ${style.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]`}></span>
            {role}
        </span>
    );
};

export default RoleBadge;
