import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, AlertCircle, Mail, Lock, User, ArrowRight, Github, Chrome } from 'lucide-react';
import { auth } from '../utils/database';
import { cn } from '../utils/constants';
import Logo from '../Logo.png';

// Reusable Input Component
const AuthInput = ({ icon: Icon, type, placeholder, value, onChange, label, className }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">{label}</label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-vibe-cyan transition-colors">
                <Icon className="w-5 h-5" />
            </div>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={cn(
                    "w-full bg-[#0a0a0f] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-600 outline-none transition-all duration-300",
                    "focus:border-vibe-cyan/50 focus:shadow-[0_0_20px_rgba(6,182,212,0.15)] focus:bg-white/[0.02]",
                    className
                )}
                required
            />
        </div>
    </div>
);

export const AuthModal = ({ isOpen, onClose, onAuth }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await new Promise(resolve => setTimeout(resolve, 800));

            let data;
            if (isLogin) {
                if (auth && auth.login) {
                    data = await auth.login(email, password);
                } else {
                    data = { user: { username: email.split('@')[0], email, full_name: 'Demo User' } };
                }
            } else {
                if (auth && auth.register) {
                    data = await auth.register(email, password, username, fullName);
                } else {
                    data = { user: { username, email, full_name: fullName } };
                }
            }
            onAuth(data.user);
            onClose();
        } catch (err) {
            console.error('Auth Error:', err);
            setError(err.message || "Authentication failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" onKeyDown={handleKeyDown}>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />

            {/* Modal Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="relative w-full max-w-md bg-[#050508] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl z-10"
            >
                {/* Background FX */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-vibe-purple/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-vibe-cyan/10 rounded-full blur-[80px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

                {/* Content */}
                <div className="relative p-8 md:p-10">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-white/5 flex items-center justify-center shadow-lg shadow-purple-500/10 backdrop-blur-md">
                                    <img
                                        src={Logo}
                                        alt="Logo"
                                        className="w-8 h-8 object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                                    />
                                </div>
                                <h2 className="text-3xl font-display font-bold text-white tracking-tight">VibeSRM</h2>
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                {isLogin ? 'Welcome Back!' : 'Join the Squad'}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">
                                {isLogin ? 'Enter your credentials to access the OS.' : 'Create your digital identity today.'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                            >
                                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-300 font-medium">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode="popLayout">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-5"
                                >
                                    <AuthInput
                                        icon={User}
                                        type="text"
                                        label="Username"
                                        placeholder="Pick a handle"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                    <AuthInput
                                        icon={User}
                                        type="text"
                                        label="Full Name"
                                        placeholder="Your real name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AuthInput
                            icon={Mail}
                            type="email"
                            label="Student Email"
                            placeholder="you@srm.edu.in"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <div className="space-y-1.5">
                            <AuthInput
                                icon={Lock}
                                type="password"
                                label="Password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {isLogin && (
                                <div className="flex justify-end">
                                    <button type="button" className="text-[10px] font-bold text-gray-500 hover:text-vibe-purple transition-colors">
                                        Forgot Password?
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl font-bold text-white relative overflow-hidden group mt-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-vibe-purple to-vibe-cyan opacity-90 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            <span className="relative flex items-center justify-center gap-2">
                                {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}
                                {!loading && <ArrowRight className="w-4 h-4" />}
                            </span>
                        </button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#050508] px-2 text-gray-500">Or continue with</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white text-sm font-medium">
                                <Chrome className="w-4 h-4" /> Google
                            </button>
                            <button type="button" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white text-sm font-medium">
                                <Github className="w-4 h-4" /> GitHub
                            </button>
                        </div>
                    </form>

                    {/* Footer Toggle */}
                    <p className="text-center text-gray-400 mt-8 text-sm">
                        {isLogin ? "New to the campus?" : "Already valid?"}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            className="ml-2 text-vibe-cyan hover:text-white font-bold transition-colors"
                        >
                            {isLogin ? 'Get Access' : 'Login Here'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};
