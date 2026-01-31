import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Plus } from 'lucide-react';
import { cn } from '../utils/constants';

export const AchievementsView = ({ userStats }) => {
    const achievements = [
        { id: 'first-checkin', title: 'First Check-in', desc: 'Checked in for the first time', earned: true, icon: '📍', color: 'from-emerald-400 to-teal-500', reward: 50 },
        { id: 'streak-5', title: 'Streak Master', desc: 'Reach a 5-day study streak', earned: false, progress: 60, icon: '🔥', color: 'from-orange-400 to-red-500', reward: 500 },
        { id: 'vibe-creator', title: 'Vibe Creator', desc: 'Create your first vibe event', earned: true, icon: '✨', color: 'from-violet-400 to-fuchsia-500', reward: 200 },
        { id: 'night-owl', title: 'Night Owl', desc: 'Study after 10 PM', earned: false, progress: 30, icon: '🦉', color: 'from-indigo-400 to-blue-500', reward: 300 },
        { id: 'social-butterfly', title: 'Social Butterfly', desc: 'Join 5 different vibes', earned: false, progress: 20, icon: '🦋', color: 'from-pink-400 to-rose-500', reward: 1000 }
    ];

    const leaderboard = [
        { id: 'u1', name: 'Riya Sharma', score: 1280, rank: 1, change: 'up', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riya' },
        { id: 'u2', name: 'Arjun Mehta', score: 1180, rank: 2, change: 'same', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun' },
        { id: 'u3', name: 'You', score: userStats?.overview?.totalCoins || 0, rank: 3, change: 'up', avatar: null },
        { id: 'u4', name: 'Priya P.', score: 950, rank: 4, change: 'down', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
        { id: 'u5', name: 'Dev Patel', score: 820, rank: 5, change: 'down', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dev' },
    ];

    const badges = [
        { name: 'Top 10%', color: 'from-amber-400 to-yellow-600', icon: '🌟' },
        { name: 'Night Owl', color: 'from-indigo-500 to-blue-700', icon: '🌙' },
        { name: 'Streak 10', color: 'from-rose-500 to-red-700', icon: '🔥' },
        { name: 'Early Bird', color: 'from-sky-400 to-cyan-600', icon: '🐦' }
    ];

    return (
        <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">

                {/* Left Column: Hero Stats */}
                <div className="lg:col-span-4 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02, rotateY: 5 }}
                        className="relative overflow-hidden rounded-[2.5rem] p-8 aspect-[4/5] flex flex-col items-center justify-center text-center group bg-[#0f0f13] border border-white/5 shadow-2xl perspective-1000"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-[80px] group-hover:bg-violet-600/30 transition-colors duration-700" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-[80px] group-hover:bg-fuchsia-600/20 transition-colors duration-700" />

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] border border-white/10 rounded-full border-t-vibe-purple/50 animate-[spin_8s_linear_infinite]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] border border-white/5 rounded-full border-b-vibe-cyan/50 animate-[spin_12s_linear_infinite_reverse]" />

                        <div className="relative z-10 space-y-6">
                            <div className="relative w-36 h-36 mx-auto perspective-1000">
                                <motion.div
                                    className="w-full h-full relative preserve-3d"
                                    animate={{ rotateY: [0, 10, -10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 animate-pulse blur-xl opacity-50" />
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#2a2a35] to-[#15151a] p-1 shadow-2xl border border-white/10 flex items-center justify-center overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent skew-x-12 animate-[shimmer_3s_infinite]" />
                                        <Award className="w-16 h-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                                    </div>

                                    <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                                        <div className="bg-black/80 backdrop-blur border border-white/20 px-4 py-1 rounded-full text-xs font-bold text-white shadow-lg">
                                            Voyager
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            <div>
                                <h2 className="text-5xl font-display font-bold text-white tracking-tight drop-shadow-md">12</h2>
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mt-1">Current Level</p>
                            </div>

                            <div className="w-full space-y-2">
                                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                    <span>2,450 XP</span>
                                    <span>5,000 XP</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '65%' }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500 relative"
                                    >
                                        <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50 blur-[1px]" />
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Cards 2.0 */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div className="p-5 rounded-[2rem] bg-[#0c0c14] border border-white/5 relative overflow-hidden group hover:bg-[#12121c] transition-colors">
                            <div className="absolute top-2 right-2 p-2 rounded-full bg-amber-500/10 text-amber-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            </div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">Total Coins</p>
                            <p className="text-3xl font-bold text-white">{userStats?.overview?.totalCoins || 0}</p>
                            <div className="mt-2 text-[10px] text-green-400 flex items-center gap-1">
                                <span className="w-0.5 h-3 bg-green-500/50 rounded-full" /> +120 today
                            </div>
                        </motion.div>

                        <motion.div className="p-5 rounded-[2rem] bg-[#0c0c14] border border-white/5 relative overflow-hidden group hover:bg-[#12121c] transition-colors">
                            <div className="absolute top-2 right-2 p-2 rounded-full bg-orange-500/10 text-orange-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                            </div>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">Day Streak</p>
                            <p className="text-3xl font-bold text-white">{userStats?.overview?.currentStreak || 0}</p>
                            <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-1">
                                Best: {Math.max(userStats?.overview?.currentStreak || 0, 14)} days
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Middle Column: Premium Achievement List */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-2xl font-display font-bold text-white">Milestones</h3>
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 font-mono">2 / 5</span>
                    </div>

                    <div className="space-y-4">
                        {achievements.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + (idx * 0.1) }}
                                className={cn(
                                    "relative p-1 rounded-[2rem] transition-all duration-300 group",
                                    item.earned ? "bg-gradient-to-r from-white/10 to-white/5" : "bg-white/5 hover:bg-white/10"
                                )}
                            >
                                <div className={cn(
                                    "relative rounded-[1.8rem] p-4 flex items-center gap-4 h-full",
                                    item.earned ? "bg-[#0a0a0f]" : "bg-[#0a0a0f]/80"
                                )}>
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl shadow-lg relative overflow-hidden",
                                        item.earned ? `bg-gradient-to-br ${item.color}` : "bg-white/5"
                                    )}>
                                        {item.earned && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                                        <span className={cn(item.earned ? "grayscale-0 scale-110" : "grayscale opacity-50 scale-90")}>{item.icon}</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className={cn("font-bold text-base", item.earned ? "text-white" : "text-gray-400")}>{item.title}</h4>
                                            {item.earned ? (
                                                <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                                            ) : (
                                                <div className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    +{item.reward} 🪙
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 truncate">{item.desc}</p>

                                        {!item.earned && item.progress > 0 && (
                                            <div className="mt-3 relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={cn("absolute inset-y-0 left-0 bg-gradient-to-r", item.color)}
                                                    style={{ width: `${item.progress}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Leaderboard & Badges */}
                <div className="lg:col-span-3 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[#0c0c14] border border-white/10 rounded-[2.5rem] p-6 relative overflow-hidden flex flex-col"
                    >
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-vibe-cyan/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <h3 className="text-xl font-display font-bold text-white">Top 5</h3>
                            <button className="text-xs text-vibe-purple hover:text-white transition">View All</button>
                        </div>

                        <div className="space-y-4 relative z-10 flex-1">
                            {leaderboard.map((user, i) => (
                                <div key={user.id} className="flex items-center gap-3 group">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border",
                                        i === 0 ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50" :
                                            i === 1 ? "bg-gray-400/20 text-gray-300 border-gray-400/50" :
                                                i === 2 ? "bg-amber-700/20 text-amber-600 border-amber-700/50" :
                                                    "bg-white/5 text-gray-500 border-transparent"
                                    )}>
                                        {user.rank}
                                    </div>

                                    <div className="relative">
                                        <img src={user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=user`} className="w-9 h-9 rounded-full bg-black object-cover border border-white/10" alt={user.name} />
                                        {i < 3 && <div className="absolute -top-1 -right-1 text-[10px]">👑</div>}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className={cn("text-sm font-medium truncate", user.id === 'u3' ? "text-vibe-purple" : "text-white")}>{user.name}</p>
                                        <p className="text-[10px] text-gray-500">{user.score} XP</p>
                                    </div>

                                    <div className={cn(
                                        "text-[10px] font-bold",
                                        user.change === 'up' ? "text-green-500" : user.change === 'down' ? "text-red-500" : "text-gray-600"
                                    )}>
                                        {user.change === 'up' ? '▲' : user.change === 'down' ? '▼' : '-'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="bg-[#0c0c14] border border-white/10 rounded-[2.5rem] p-6 relative overflow-hidden">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Badges</h3>
                        <div className="flex flex-wrap gap-3">
                            {badges.map((b) => (
                                <motion.div
                                    key={b.name}
                                    whileHover={{ y: -5, rotateX: 10 }}
                                    className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer transform transition-all border-b-4 border-black/50 active:border-b-0 active:translate-y-1 bg-gradient-to-br",
                                        b.color
                                    )}
                                    title={b.name}
                                >
                                    <span className="text-xl drop-shadow-md">{b.icon}</span>
                                </motion.div>
                            ))}
                            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center border-dashed text-gray-500">
                                <Plus className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
