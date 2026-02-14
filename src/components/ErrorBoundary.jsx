import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[VibeSRM] Uncaught Error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-8">
                    <div className="text-center max-w-md space-y-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-red-500 to-orange-500 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.4)]">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h1 className="text-3xl font-bold">Something went wrong</h1>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            VibeSRM encountered an unexpected error. This has been logged automatically.
                        </p>
                        {import.meta.env.DEV && this.state.error && (
                            <pre className="text-left text-xs text-red-400 bg-red-950/30 border border-red-500/20 rounded-xl p-4 overflow-auto max-h-40">
                                {this.state.error.message}
                            </pre>
                        )}
                        <div className="flex gap-3 justify-center pt-2">
                            <button
                                onClick={this.handleReset}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold rounded-xl hover:opacity-90 transition shadow-lg"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-white/10 border border-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
