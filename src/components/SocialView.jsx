import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Search, MapPin, Zap } from 'lucide-react';
import { cn, SQUAD_MEMBERS } from '../utils/constants';

export const SocialView = ({ events, onChatWith, onJoinEvent, onOpenEventChat, currentUser }) => {
    const [filter, setFilter] = useState('all');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-[800px] grid grid-cols-1 md:grid-cols-12 gap-6 pb-20"
        >
            {/* Main Feed Area */}
            <div className="md:col-span-8 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">

                {/* Header Hero */}
                <div className="relative rounded-[2.5rem] bg-gradient-to-r from-violet-900/40 to-fuchsia-900/40 border border-white/10 p-8 overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/30 blur-[80px] rounded-full group-hover:bg-violet-600/40 transition-colors duration-700" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-violet-300 uppercase tracking-wider backdrop-blur-md">Community Pulse</span>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-green-400"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> 1,204 Online</span>
                        </div>
                        <h2 className="text-4xl font-display font-bold text-white mb-4 leading-tight">
                            What's vibing on <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Campus today?</span>
                        </h2>
                        <div className="flex gap-3 mt-6">
                            {['Trending', 'Near Me', 'Friends', 'Music'].map((tag) => (
                                <button key={tag} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition text-sm font-medium text-gray-300 hover:text-white backdrop-blur-sm">
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Squad Grid */}
                <div>
                    <div className="flex justify-between items-end mb-4 px-2">
                        <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-vibe-cyan" /> Your Squad
                        </h3>
                        <button className="text-xs text-gray-500 hover:text-white transition">View All</button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {SQUAD_MEMBERS.map((member, i) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group relative p-4 rounded-[2rem] bg-[#0c0c12] border border-white/5 hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-900/10"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />

                                <div className="relative flex items-center gap-4">
                                    <div className="relative">
                                        <div className="absolute -inset-1 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity" />
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.seed}`} className="relative w-14 h-14 rounded-full border-2 border-[#0c0c12] bg-gray-800" alt={member.name} />
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#0c0c12] rounded-full" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-white text-base truncate group-hover:text-violet-300 transition-colors">{member.name}</h4>
                                        <p className="text-xs text-gray-500 truncate">{member.status || "Vibing..."}</p>
                                        <div className="flex gap-1 mt-1.5">
                                            {['🎨', '🎮', '🎵'].slice(0, 2).map((emoji, k) => (
                                                <span key={k} className="w-5 h-5 flex items-center justify-center bg-white/5 rounded-md text-[10px]">{emoji}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => onChatWith?.(member)}
                                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-violet-600 hover:text-white text-gray-400 flex items-center justify-center transition-all shadow-lg hover:shadow-violet-600/30"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {/* Find New Friends Card */}
                        <motion.div
                            className="p-4 rounded-[2rem] border border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 flex flex-col items-center justify-center text-center cursor-pointer transition group"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-vibe-cyan group-hover:text-black transition-colors mb-2">
                                <Search className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-bold text-gray-300">Discover People</p>
                            <p className="text-xs text-gray-600">Based on your interests</p>
                        </motion.div>
                    </div>
                </div>

            </div>

            {/* Right Sidebar: Events */}
            <div className="md:col-span-4 h-full flex flex-col">
                <div className="flex justify-between items-end mb-4 px-1">
                    <h3 className="text-xl font-display font-bold text-white">Upcoming Events</h3>
                    <button className="text-xs text-vibe-purple hover:text-white transition">Calendar</button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                    {(!events || events.length === 0) ? (
                        <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 text-center">
                            <p className="text-gray-500">No events yet.</p>
                        </div>
                    ) : events.map((event, i) => (
                        <motion.div
                            key={event.id || i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative p-5 rounded-[2rem] bg-[#101016] border border-white/5 hover:border-white/10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-[4rem] opacity-50 group-hover:scale-110 transition-transform duration-500" />

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-3">
                                    <div className={cn(
                                        "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                                        event.isMajor
                                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                            : "bg-vibe-cyan/10 text-vibe-cyan border-vibe-cyan/20"
                                    )}>
                                        {event.type}
                                    </div>
                                    {event.isMajor && (
                                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    )}
                                </div>

                                <h4 className="text-lg font-bold text-white mb-1 group-hover:text-vibe-purple transition-colors">{event.title}</h4>

                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                                    <MapPin className="w-3.5 h-3.5" /> {event.locationName}
                                    <span className="w-1 h-1 rounded-full bg-gray-600" />
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
                                            "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95",
                                            event.attendees?.includes(currentUser?.id)
                                                ? "bg-green-500/10 text-green-400 border border-green-500/20 cursor-default"
                                                : "bg-white text-black hover:bg-gray-200"
                                        )}
                                    >
                                        {event.attendees?.includes(currentUser?.id) ? "Going ✓" : "Join Event"}
                                    </button>

                                    {event.attendees?.includes(currentUser?.id) && (
                                        <button
                                            onClick={() => onOpenEventChat?.(event)}
                                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition border border-white/5"
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
