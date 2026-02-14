import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Search, MapPin, Zap, Music, Crown } from 'lucide-react';
import { cn, SQUAD_MEMBERS } from '../utils/constants';
import { useTheme } from '../ThemeContext';

export const SocialView = ({ events, onChatWith, onJoinEvent, onOpenEventChat, currentUser }) => {
    const { theme } = useTheme();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full grid grid-cols-1 lg:grid-cols-12 gap-8 pb-24 lg:pb-0"
        >
            {/* LEFT SIDE: Community Pulse & Squad (Span 8) */}
            <div className="lg:col-span-8 flex flex-col gap-8 h-full overflow-y-auto no-scrollbar pr-2">

                {/* HERO HUD */}
                <div className="relative rounded-[2.5rem] obsidian-card p-8 md:p-10 overflow-hidden group border border-[var(--border-color)]">
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)]/20 to-[var(--accent-secondary)]/20 opacity-50" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-primary)]/30 blur-[100px] rounded-full group-hover:bg-[var(--accent-primary)]/40 transition-colors duration-1000" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 rounded-full bg-[var(--surface-glass-high)] border border-[var(--border-color)] text-xs font-bold text-[var(--accent-primary)] uppercase tracking-wider backdrop-blur-md flex items-center gap-2">
                                    <span className="w-2 h-2 bg-[var(--accent-primary)] rounded-full animate-pulse" />
                                    Community Pulse
                                </span>
                                <span className="text-xs font-bold text-emerald-400">1,204 Online</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-[var(--text-primary)] leading-tight">
                                Campus <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]">Biosphere</span>
                            </h2>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {['#Trending', '#Music', '#Gaming', '#Tech'].map((tag) => (
                                <button key={tag} className="px-4 py-2 rounded-xl bg-[var(--surface-glass)] border border-[var(--border-color)] hover:border-[var(--accent-secondary)] transition text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] backdrop-blur-md">
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SQUAD GRID */}
                <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-3 mb-6">
                        <span className="w-10 h-10 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center border border-[var(--border-color)]">
                            <Crown className="w-5 h-5 text-amber-400" />
                        </span>
                        Elite Squad
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {SQUAD_MEMBERS.map((member, i) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative p-4 rounded-[2rem] obsidian-card bg-[var(--surface-glass)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)] transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="absolute -inset-1 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity" />
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.seed}`} className="relative w-14 h-14 rounded-full border-2 border-[var(--bg-page)] bg-[var(--bg-card)] object-cover" alt={member.name} />
                                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-[var(--bg-page)] rounded-full flex items-center justify-center">
                                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[var(--bg-page)]" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-[var(--text-primary)] text-base truncate group-hover:text-[var(--accent-secondary)] transition-colors">{member.name}</h4>
                                        <p className="text-xs text-[var(--accent-primary)] font-medium truncate mb-1">{member.status}</p>
                                        <div className="flex gap-1">
                                            {['🎮', '🎧'].map((emoji, k) => (
                                                <span key={k} className="w-6 h-6 flex items-center justify-center bg-[var(--bg-card-hover)] rounded-md text-xs border border-[var(--border-color)]">{emoji}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => onChatWith?.(member)}
                                        className="w-10 h-10 rounded-xl bg-[var(--bg-card-hover)] hover:bg-[var(--accent-primary)] hover:text-white text-[var(--text-secondary)] flex items-center justify-center transition-all border border-[var(--border-color)]"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {/* Discovery Card */}
                        <motion.button
                            className="p-4 rounded-[2rem] border border-dashed border-[var(--border-color)] hover:border-[var(--accent-secondary)] hover:bg-[var(--surface-highlight)] flex flex-col items-center justify-center text-center transition group h-full min-h-[100px]"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="w-10 h-10 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center mb-2 group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-colors">
                                <Search className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Find More Ppl</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Active Events (Span 4) */}
            <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-400" /> Active Now
                    </h3>
                    <button className="text-xs font-bold text-[var(--accent-primary)] hover:underline">View All</button>
                </div>

                {events.map((event, i) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative p-5 rounded-[2rem] obsidian-card bg-[var(--surface-glass)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)] transition-all duration-300 hover:-translate-y-1"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className="px-2 py-1 rounded-md bg-[var(--bg-card)] border border-[var(--border-color)] text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                {event.type}
                            </span>
                            <div className="flex -space-x-2">
                                {[...Array(3)].map((_, j) => (
                                    <div key={j} className="w-6 h-6 rounded-full bg-gray-700 border border-[var(--bg-card)]" />
                                ))}
                                <div className="w-6 h-6 rounded-full bg-[var(--bg-card-hover)] border border-[var(--bg-card)] flex items-center justify-center text-[8px] font-bold">
                                    +12
                                </div>
                            </div>
                        </div>

                        <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent-primary)] transition-colors">{event.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-4">
                            <MapPin className="w-3 h-3" /> {event.locationName}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => onJoinEvent?.(event)}
                                className="flex-1 py-2 rounded-xl bg-[var(--text-primary)] text-[var(--bg-page)] text-xs font-bold hover:opacity-90 transition shadow-lg shadow-[var(--accent-primary)]/20"
                            >
                                Join Vibe
                            </button>
                            <button
                                onClick={() => onOpenEventChat?.(event)}
                                className="w-10 py-2 rounded-xl bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--accent-primary)] hover:text-white transition flex items-center justify-center"
                            >
                                <MessageSquare className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};
