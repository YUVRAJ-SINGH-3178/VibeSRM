import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MessageSquare, UserPlus, Sparkles, Crown, Check } from 'lucide-react';
import { social } from '../utils/database';
import { cn, MOCK_TRIBE } from '../utils/constants';

export const TribeView = ({ currentUser, onChatWith }) => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sentRequests, setSentRequests] = useState(new Set());

    const handleAddFriend = async (userId) => {
        try {
            await social.addFriend(userId);
            setSentRequests(prev => new Set(prev).add(userId));
        } catch (e) {
            console.error("Add friend error:", e);
            // Optimistically assume sent/already sent
            setSentRequests(prev => new Set(prev).add(userId));
        }
    };

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const data = await social.getMatches();
                setMatches(data && data.length > 0 ? data : MOCK_TRIBE);
            } catch (e) {
                console.error("Failed to fetch matches", e);
                setMatches(MOCK_TRIBE);
            } finally {
                setLoading(false);
            }
        };
        if (currentUser) fetchMatches();
    }, [currentUser]);

    const hasMatches = matches.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full pb-20 overflow-y-auto no-scrollbar"
        >
            {/* HERDER */}
            <div className="mb-8 relative overflow-hidden rounded-[2.5rem] obsidian-card border border-[var(--border-color)] p-8">
                <div className="absolute inset-0 bg-gradient-to-r from-vibe-purple/20 to-vibe-cyan/20 opacity-50" />
                <div className="relative z-10">
                    <h2 className="text-4xl font-display font-bold text-[var(--text-primary)] mb-2">
                        Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-vibe-purple to-vibe-cyan">Tribe</span>
                    </h2>
                    <p className="text-[var(--text-secondary)] max-w-xl">
                        Discover people who share your passion for <span className="font-bold text-[var(--text-primary)]">{currentUser?.tags?.join(', ') || '...'}</span>.
                        Connect instantly and vibe together.
                    </p>
                </div>
            </div>

            {/* MATCH GRID */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vibe-purple" />
                </div>
            ) : hasMatches ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.map((user, i) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative p-6 rounded-[2rem] obsidian-card bg-[var(--surface-glass)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-color)] transition-all duration-300 hover:-translate-y-2"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="relative">
                                    <img
                                        src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                        className="w-16 h-16 rounded-full border-4 border-[var(--bg-page)] bg-[var(--bg-card)] object-cover shadow-lg"
                                        alt={user.full_name}
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--bg-page)] rounded-full flex items-center justify-center">
                                        <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-[var(--bg-page)] animate-pulse" />
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-vibe-purple/10 border border-vibe-purple/20 text-xs font-bold text-vibe-purple flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" /> {user.commonTags?.length || 0} Common
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">{user.full_name}</h3>
                            <p className="text-xs text-[var(--text-secondary)] mb-4 line-clamp-2">
                                {user.username ? `@${user.username}` : 'Student'}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {(user.commonTags || []).slice(0, 4).map(tag => (
                                    <span key={tag} className="px-2 py-1 rounded-md bg-[var(--bg-card-hover)] border border-[var(--border-color)] text-[10px] font-bold text-[var(--text-secondary)]">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => onChatWith?.(user)}
                                    className="flex-1 py-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-page)] font-bold text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" /> Message
                                </button>
                                <button
                                    onClick={() => handleAddFriend(user.id)}
                                    disabled={sentRequests.has(user.id)}
                                    className={cn(
                                        "p-2.5 rounded-xl border transition flex items-center justify-center",
                                        sentRequests.has(user.id)
                                            ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30"
                                            : "bg-[var(--surface-glass)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]"
                                    )}
                                >
                                    {sentRequests.has(user.id) ? <Check className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-[var(--surface-glass)] flex items-center justify-center mb-6">
                        <Search className="w-10 h-10 text-[var(--text-secondary)] opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Tribe Found Yet</h3>
                    <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-6">
                        Try adding more tags to your profile! Or wait for other students to join with similar interests.
                    </p>
                    <button className="px-6 py-2 rounded-xl bg-vibe-purple text-white font-bold">
                        Update My Tags
                    </button>
                </div>
            )}
        </motion.div>
    );
};
