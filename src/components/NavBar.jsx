import React from 'react';
import { motion } from 'framer-motion';
import { Grid, Map as MapIcon, Users, MessageSquare, Award, Settings } from 'lucide-react';
import { cn } from '../utils/constants';
import Logo from '../Logo.png';

export const NavBar = ({ active, setTab, currentUser, onOpenProfile }) => (
    <nav className="fixed left-0 top-0 h-full w-24 hidden lg:flex flex-col items-center py-10 z-50 border-r border-white/10 bg-gradient-to-b from-[#0a0a12] via-[#080810] to-[#0a0a12] backdrop-blur-2xl shadow-[1px_0_30px_rgba(139,92,246,0.1)]">
        <div className="absolute right-0 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-vibe-purple/30 to-transparent" />

        <div className="absolute left-0 top-0 h-full w-1.5 pointer-events-none">
            {['dashboard', 'map', 'social', 'chat', 'achievements'].map((id, i) => (
                active === id && (
                    <motion.div
                        key={id}
                        layoutId="nav-indicator"
                        className="absolute left-0 w-1.5 h-10 bg-gradient-to-b from-vibe-purple via-vibe-cyan to-vibe-purple rounded-r-full shadow-[0_0_15px_rgba(139,92,246,0.8)]"
                        style={{ top: `calc(${188 + i * 72}px)` }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                )
            ))}
        </div>

        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center mb-16 relative cursor-pointer group shadow-lg shadow-vibe-purple/30 ring-2 ring-vibe-purple/20"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-vibe-purple/20 to-vibe-cyan/10" />
            <img src={Logo} alt="VibeSRM" className="w-full h-full object-cover relative z-10" />
        </motion.div>
        <div className="flex flex-col gap-4">
            {[Grid, MapIcon, Users, MessageSquare, Award].map((Icon, i) => {
                const id = ['dashboard', 'map', 'social', 'chat', 'achievements'][i];
                const labels = ['Home', 'Map', 'Social', 'Chat', 'Achievements'];
                const isActive = active === id;
                return (
                    <motion.button
                        key={id}
                        onClick={() => setTab(id)}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                            "relative p-4 rounded-2xl transition-all duration-300 group",
                            isActive
                                ? "text-white bg-gradient-to-br from-vibe-purple/30 to-vibe-cyan/20 shadow-[0_0_25px_rgba(139,92,246,0.4)] border border-vibe-purple/30"
                                : "text-gray-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                        )}
                    >
                        {isActive && (
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-vibe-purple/20 to-vibe-cyan/10 blur-xl -z-10" />
                        )}
                        <Icon className={cn("w-6 h-6 transition-all", isActive && "drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]")} strokeWidth={isActive ? 2.5 : 1.5} />
                        <span className="absolute left-full ml-4 px-4 py-2 bg-[#0A0A0F]/95 border border-vibe-purple/20 rounded-xl text-xs font-bold whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-lg shadow-vibe-purple/10 backdrop-blur-xl">
                            {labels[i]}
                        </span>
                    </motion.button>
                )
            })}
        </div>
        <div className="mt-auto flex flex-col items-center gap-5">
            <motion.button
                onClick={() => setTab('settings')}
                whileHover={{ scale: 1.1, rotate: 90 }}
                transition={{ duration: 0.3 }}
                className={cn(
                    "p-3.5 rounded-xl transition-all border",
                    active === 'settings'
                        ? "text-white bg-gradient-to-br from-vibe-purple/30 to-vibe-cyan/20 shadow-[0_0_20px_rgba(139,92,246,0.4)] border-vibe-purple/30"
                        : "text-gray-500 hover:text-white hover:bg-white/5 border-transparent hover:border-white/10"
                )}
                title="Settings"
            >
                <Settings className={cn("w-5 h-5", active === 'settings' && "drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]")} />
            </motion.button>
            <motion.button
                onClick={onOpenProfile}
                whileHover={{ scale: 1.1 }}
                className="w-12 h-12 rounded-xl border-2 border-vibe-purple/40 overflow-hidden hover:border-vibe-purple transition-all cursor-pointer shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                title={currentUser ? currentUser.username || 'Your Profile' : 'Not signed in'}
            >
                <img
                    src={currentUser?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser?.username || currentUser?.email || 'guest'}`}
                    alt="User"
                    className="w-full h-full object-cover"
                />
            </motion.button>
        </div>
    </nav>
);
