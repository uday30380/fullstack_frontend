import React from 'react';
import { motion } from 'framer-motion';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Critical System Protocol Failure:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/home';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-bg flex items-center justify-center p-6 text-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card max-w-2xl p-16 border-red-500/10 shadow-2xl shadow-red-500/5"
                    >
                        <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-10 animate-pulse">
                            ⚠️
                        </div>
                        <h1 className="text-4xl font-heading font-black text-text-main tracking-tighter mb-4">
                            Protocol <span className="text-red-500 italic">Interrupted</span>
                        </h1>
                        <p className="text-text-muted font-bold uppercase tracking-[0.3em] text-[10px] mb-8">
                            Critical Runtime Exception Detected
                        </p>
                        
                        <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/10 mb-10 text-left">
                            <code className="text-xs text-red-600 font-mono break-all leading-relaxed">
                                [FAULT_IDENTIFIER]: {this.state.error?.message || 'Unknown Synchronous Connection Error'}
                            </code>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button 
                                onClick={this.handleReset}
                                className="btn-primary bg-red-500 hover:bg-red-600 shadow-red-500/20 px-10"
                            >
                                Initiate Recovery Protocol
                            </button>
                            <button 
                                onClick={() => window.location.reload()}
                                className="btn-secondary px-10"
                            >
                                Re-sync Session
                            </button>
                        </div>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
