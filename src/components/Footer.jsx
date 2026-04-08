import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="bg-zinc-950 border-t border-primary/10 mt-20 relative overflow-hidden text-white">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-50"></div>
            
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
                    {/* Brand Section */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-950 text-xl font-black shadow-glow group hover:rotate-6 transition-transform">E</div>
                            <h2 className="text-3xl font-heading font-black tracking-tighter text-white">
                                Educate<span className="text-white italic">.</span>
                            </h2>
                        </div>
                        <p className="text-zinc-400 text-[15px] leading-relaxed font-bold">
                            Architecting the future of academic collaboration. Access elite study materials and join a global community of innovators.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-8">
                        <h3 className="text-primary font-heading font-black text-[10px] uppercase tracking-[0.3em]">Institutional</h3>
                        <ul className="space-y-4">
                            <li><Link to="/home" className="text-zinc-400 hover:text-primary text-sm font-black uppercase tracking-widest transition-colors">Digital Home</Link></li>
                            <li><Link to="/browse" className="text-zinc-400 hover:text-primary text-sm font-black uppercase tracking-widest transition-colors">Archives</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="space-y-8">
                        <h3 className="text-primary font-heading font-black text-[10px] uppercase tracking-[0.3em]">Directives</h3>
                        <ul className="space-y-4">
                            <li><Link to="/contact" className="text-zinc-400 hover:text-primary text-sm font-black uppercase tracking-widest transition-colors">Support Center</Link></li>
                            <li><Link to="/terms" className="text-zinc-400 hover:text-primary text-sm font-black uppercase tracking-widest transition-colors">Protocol</Link></li>
                        </ul>
                    </div>

                    {/* Contact Directive */}
                    <div className="space-y-8">
                        <h3 className="text-primary font-heading font-black text-[10px] uppercase tracking-[0.3em]">Communications</h3>
                        <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
                            <div className="flex items-center gap-4 text-sm font-black text-primary">
                                <span className="text-xl">📧</span> udaykiranvempati123@gmail.com
                            </div>
                            <div className="flex items-center gap-4 text-sm font-black text-primary">
                                <span className="text-xl">📞</span> +91 8185892753
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-24 pt-12 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        © 2026 EDUCATE. SCHOLARLY REPOSITORY — v2.5 ELITE
                    </p>
                    <div className="flex items-center gap-10">
                        {['TWITTER', 'LINKEDIN', 'INSTAGRAM'].map(social => (
                            <span key={social} className="text-[10px] font-black tracking-widest text-zinc-500 hover:text-primary cursor-pointer transition-all hover:scale-110">{social}</span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
