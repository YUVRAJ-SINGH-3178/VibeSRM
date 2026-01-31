import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, X, AlertCircle } from 'lucide-react';
import { auth } from '../utils/database';

export const AuthModal = ({ isOpen, onClose, onAuth }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let data;
            if (isLogin) {
                data = await auth.login(email, password);
            } else {
                data = await auth.register(email, password, username, fullName);
            }
            onAuth(data.user);
            onClose();
        } catch (err) {
            console.error('Auth Error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#0f0d1a] to-[#050508] rounded-[2rem]" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-violet-600/20 via-fuchsia-600/10 to-transparent blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/[0.04] to-transparent blur-2xl" />

                <div className="relative z-10 p-8 rounded-[2rem] border border-white/[0.06]">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center mb-4 -rotate-6">
                                <Zap className="w-6 h-6 text-white rotate-6" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white tracking-tight">{isLogin ? 'Welcome back' : 'Join VibeSRM'}</h2>
                            <p className="text-gray-500 text-sm mt-1">{isLogin ? 'Sign in to continue' : 'Create your account'}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition text-gray-500 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {error && (
                        <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1.5 font-medium">Username</label>
                                    <input
                                        value={username} onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition text-white placeholder-gray-600"
                                        placeholder="coolstudent123"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1.5 font-medium">Full Name</label>
                                    <input
                                        value={fullName} onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition text-white placeholder-gray-600"
                                        placeholder="Your Name"
                                    />
                                </div>
                            </>
                        )}
                        <div>
                            <label className="text-xs text-gray-500 block mb-1.5 font-medium">Email</label>
                            <input
                                type="email"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition text-white placeholder-gray-600"
                                placeholder="you@srm.edu.in"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1.5 font-medium">Password</label>
                            <input
                                type="password"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition text-white placeholder-gray-600"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-semibold mt-2 hover:shadow-lg hover:shadow-violet-900/30 transition-all disabled:opacity-50 text-white"
                        >
                            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-gray-500 mt-5 text-sm">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={() => setIsLogin(!isLogin)} className="text-violet-400 hover:text-violet-300 transition font-medium">
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};
