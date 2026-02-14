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
                            <div className="w-10 h-10 rounded-full bg-[var(--bg-card-hover)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--accent-secondary)] group-hover:text-white transition-colors mb-2">
                                <Search className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">Find More</p>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Event Feed (Span 4) */}
            <div className="lg:col-span-4 h-full flex flex-col gap-6">
                <div className="flex justify-between items-end px-1">
                    <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-[var(--accent-secondary)] rounded-full" />
                        Live Events
                    </h3>
                    <button className="text-xs text-[var(--accent-primary)] hover:text-[var(--text-primary)] transition font-bold">See Schedule</button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pb-10">
                    {(!events || events.length === 0) ? (
                        <div className="p-8 rounded-[2rem] obsidian-card text-center flex flex-col items-center justify-center h-48 bg-[var(--surface-glass)] border border-[var(--border-color)]">
                            <Zap className="w-10 h-10 text-[var(--text-secondary)] mb-2" />
                            <p className="text-[var(--text-secondary)] font-medium">Campus is quiet tonight.</p>
                        </div>
                    ) : events.map((event, i) => (
                        <motion.div
                            key={event.id || i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.15 }}
                            className="group relative p-5 rounded-[2rem] obsidian-card overflow-hidden transition-all hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)] bg-[var(--surface-glass)]"
                        >
                            {/* Decorative Background Blob */}
                            {event.isMajor && (
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/20 blur-[50px] rounded-full" />
                            )}

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md",
                                        event.isMajor
                                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                            : "bg-[var(--surface-highlight)] text-[var(--accent-secondary)] border-[var(--border-color)]"
                                    )}>
                                        {event.type}
                                    </span>
                                    {event.isMajor && <Zap className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />}
                                </div>

                                <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1 leading-snug group-hover:text-[var(--accent-primary)] transition-colors">{event.title}</h4>

                                <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mb-5">
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.locationName}</span>
                                    <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)]" />
                                    <span>{new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            const isJoined = event.attendees?.includes(currentUser?.id);
                                            if (isJoined) return;
                                            onJoinEvent?.(event.id);
                                        }}
                                        className={cn(
                                            "flex-1 py-3 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2",
                                            event.attendees?.includes(currentUser?.id)
                                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                                                : "bg-[var(--text-primary)] text-[var(--bg-page)] hover:opacity-90"
                                        )}
                                    >
                                        {event.attendees?.includes(currentUser?.id) ? "You're Going" : "Join Now"}
                                    </button>

                                    {event.attendees?.includes(currentUser?.id) && (
                                        <button
                                            onClick={() => onOpenEventChat?.(event)}
                                            className="p-3 rounded-xl bg-[var(--bg-card-hover)] hover:bg-[var(--surface-highlight)] text-[var(--text-primary)] transition border border-[var(--border-color)]"
                                            title="Event Chat"
                                        >
                                            <MessageSquare className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
