import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wifi,
    Users,
    MapPin,
    X,
    Search,
    CheckCircle,
    Zap,
    Grid,
    Award
} from 'lucide-react';
import { cn, CARD_STYLE, DAILY_ACTIVITY } from '../utils/constants';
import { BentoMap } from './BentoMap';

export const DashboardView = ({
    locations,
    events,
    selectedLoc,
    setSelectedLoc,
    joined,
    handleCheckIn,
    searchQuery,
    setSearchQuery,
    filteredLocations,
    addNotification,
    currentUser,
    onJoin,
    onLeave,
    onDelete,
    onOpenEventChat
}) => {
    const [activeListTab, setActiveListTab] = useState('vibes');

    const filteredEvents = events?.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const maxActivityTotal = Math.max(
        ...DAILY_ACTIVITY.map(x => x.study + x.play + x.other),
        1
    );

    return (
        <main className="grid grid-cols-1 md:grid-cols-12 grid-rows-8 md:grid-rows-8 gap-6 h-auto md:min-h-[800px]">
            <motion.div className={cn("col-span-1 md:col-span-8 row-span-4 p-0 relative", CARD_STYLE)} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <BentoMap locations={locations} events={events} selected={selectedLoc} onSelect={setSelectedLoc} />
            </motion.div>

            <AnimatePresence>
                {selectedLoc && selectedLoc.capacity && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, x: -20, y: 20 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            exit={{ opacity: 0, x: -20, y: 20 }}
                            className="fixed bottom-6 left-6 p-5 bg-black/85 backdrop-blur-2xl border border-white/20 rounded-3xl w-72 shadow-2xl z-[100]"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{selectedLoc.icon}</span>
                                    <div>
                                        <h3 className="text-lg font-bold font-display">{selectedLoc.name}</h3>
                                        <p className="text-xs text-gray-400">{selectedLoc.desc}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Wifi className="w-4 h-4 text-vibe-cyan" />
                                        <span className="text-[10px] text-gray-400 uppercase">WiFi Speed</span>
                                    </div>
                                    <p className="text-lg font-bold text-white">{selectedLoc.wifiSpeed || 50} <span className="text-xs text-gray-400">Mbps</span></p>
                                    <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-vibe-cyan to-vibe-purple"
                                            style={{ width: `${Math.min((selectedLoc.wifiSpeed || 50) / 1.5, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Users className="w-4 h-4 text-amber-400" />
                                        <span className="text-[10px] text-gray-400 uppercase">Crowd</span>
                                    </div>
                                    <p className={cn(
                                        "text-lg font-bold",
                                        selectedLoc.crowdLevel === 'Low' ? 'text-emerald-400' :
                                            selectedLoc.crowdLevel === 'Medium' ? 'text-amber-400' : 'text-red-400'
                                    )}>{selectedLoc.crowdLevel || 'Medium'}</p>
                                    <div className="flex gap-1 mt-1">
                                        {[1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "h-1.5 flex-1 rounded-full",
                                                    i <= (selectedLoc.crowdLevel === 'Low' ? 1 : selectedLoc.crowdLevel === 'Medium' ? 2 : 3)
                                                        ? selectedLoc.crowdLevel === 'Low' ? 'bg-emerald-400' :
                                                            selectedLoc.crowdLevel === 'Medium' ? 'bg-amber-400' : 'bg-red-400'
                                                        : 'bg-white/10'
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 mb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-400">Currently Occupying</p>
                                        <p className="text-2xl font-bold text-white">
                                            {selectedLoc.currentPeople || Math.round((selectedLoc.occupancy / 100) * selectedLoc.capacity)}
                                            <span className="text-sm text-gray-400"> / {selectedLoc.capacity}</span>
                                        </p>
                                    </div>
                                    <div className="w-14 h-14 rounded-full bg-white/5 border-4 border-white/10 flex items-center justify-center">
                                        <span className={cn(
                                            "text-lg font-bold",
                                            selectedLoc.occupancy > 70 ? 'text-red-400' : selectedLoc.occupancy > 40 ? 'text-amber-400' : 'text-emerald-400'
                                        )}>{selectedLoc.occupancy}%</span>
                                    </div>
                                </div>
                            </div>

                            {selectedLoc.amenities && (
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase mb-2">Amenities</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedLoc.amenities.map((amenity, i) => (
                                            <span key={i} className="px-2 py-1 bg-white/5 rounded-lg text-[10px] text-gray-300 border border-white/10">
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20, y: 20 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            exit={{ opacity: 0, x: 20, y: 20 }}
                            className="fixed bottom-6 left-[320px] p-5 bg-black/85 backdrop-blur-2xl border border-white/20 rounded-3xl w-56 shadow-2xl z-[100]"
                        >
                            <button
                                onClick={() => setSelectedLoc(null)}
                                className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-full transition"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>

                            <div className="text-center mb-4">
                                <div className={cn(
                                    "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3",
                                    joined.has(selectedLoc.id) ? "bg-emerald-500/20 border-2 border-emerald-500/50" : "bg-white/10 border-2 border-white/20"
                                )}>
                                    <MapPin className={cn("w-8 h-8", joined.has(selectedLoc.id) ? "text-emerald-400" : "text-white/60")} />
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1">
                                    {joined.has(selectedLoc.id) ? "You're Here!" : "Check In"}
                                </h4>
                                <p className="text-xs text-gray-400">
                                    {joined.has(selectedLoc.id)
                                        ? "Enjoying your time at " + selectedLoc.name
                                        : "Let others know you're at " + selectedLoc.name
                                    }
                                </p>
                            </div>

                            <div className="mb-4">
                                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                    <span>Occupancy</span>
                                    <span>{selectedLoc.occupancy}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all duration-500",
                                            selectedLoc.occupancy > 70 ? 'bg-red-500' : selectedLoc.occupancy > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                                        )}
                                        style={{ width: `${selectedLoc.occupancy}%` }}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => handleCheckIn(selectedLoc)}
                                className={cn(
                                    "w-full py-3 font-bold rounded-xl transition-all duration-300",
                                    joined.has(selectedLoc.id)
                                        ? "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
                                        : "bg-gradient-to-r from-vibe-purple to-vibe-cyan text-white hover:shadow-lg hover:shadow-vibe-purple/30"
                                )}
                            >
                                {joined.has(selectedLoc.id) ? "Check Out" : "Check In Now"}
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedLoc && !selectedLoc.capacity && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-6 left-6 p-6 bg-black/85 backdrop-blur-2xl border border-white/20 rounded-3xl w-80 shadow-2xl z-[100]"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold font-display">{selectedLoc.title || selectedLoc.name}</h3>
                            <button onClick={() => setSelectedLoc(null)} className="p-1 hover:bg-white/10 rounded-full"><X className="w-4 h-4" /></button>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">{selectedLoc.description || selectedLoc.desc}</p>

                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <span className="text-xs bg-white/10 px-2 py-1 rounded-md mb-2 block w-fit">{selectedLoc.locationName || 'Campus'}</span>
                                <span className="text-xs bg-white/10 px-2 py-1 rounded-md mb-2 block w-fit">{new Date(selectedLoc.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => {
                                        const isJoined = selectedLoc.attendees?.includes(currentUser?.id);
                                        if (isJoined) onLeave(selectedLoc.id);
                                        else onJoin(selectedLoc.id);
                                    }}
                                    className={cn(
                                        "py-2 font-bold rounded-xl text-sm transition",
                                        selectedLoc.attendees?.includes(currentUser?.id)
                                            ? "bg-red-500/20 text-red-400 border border-red-500/50"
                                            : "bg-vibe-purple text-white"
                                    )}
                                >
                                    {selectedLoc.attendees?.includes(currentUser?.id) ? "Leave" : "Join"}
                                </button>

                                <button
                                    onClick={() => {
                                        const isJoined = selectedLoc.attendees?.includes(currentUser?.id);
                                        if (!isJoined) {
                                            addNotification('Join the vibe to chat', 'info');
                                            return;
                                        }
                                        onOpenEventChat?.(selectedLoc);
                                    }}
                                    className="py-2 bg-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/20 transition"
                                >
                                    Message
                                </button>
                            </div>

                            {selectedLoc.creator_id === currentUser?.id && (
                                <button
                                    onClick={() => onDelete(selectedLoc.id)}
                                    className="w-full py-2 border border-red-500/20 text-red-400 text-xs rounded-xl hover:bg-red-500/10 transition"
                                >
                                    Delete Vibe
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="col-span-1 md:col-span-4 row-span-4 flex flex-col gap-6">
                <div className={cn("p-4 flex flex-col gap-4 transition-colors relative overflow-hidden", CARD_STYLE)}>
                    <div className="absolute inset-0 bg-gradient-to-br from-vibe-purple/5 via-transparent to-white/5 pointer-events-none" />

                    <div className="relative flex items-center gap-4 text-gray-400 focus-within:text-white bg-white/5 rounded-xl px-4 py-3 border border-white/10 focus-within:border-vibe-purple/50 transition-all">
                        <Search className="w-5 h-5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find friends, food, vibes..."
                            className="bg-transparent outline-none w-full placeholder:text-gray-600 font-medium"
                        />
                    </div>
                    <div className="relative flex p-1.5 bg-gradient-to-r from-black/60 via-black/40 to-black/60 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setActiveListTab('locations')}
                            className={cn("flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300", activeListTab === 'locations' ? "bg-gradient-to-r from-white/15 to-white/10 text-white shadow-lg" : "text-gray-500 hover:text-gray-300")}
                        >
                            Locations
                        </button>
                        <button
                            onClick={() => setActiveListTab('vibes')}
                            className={cn("flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300", activeListTab === 'vibes' ? "bg-gradient-to-r from-vibe-purple to-vibe-purple/80 text-white shadow-lg shadow-vibe-purple/25" : "text-gray-500 hover:text-gray-300")}
                        >
                            Live Vibes
                        </button>
                    </div>
                </div>

                <div className={cn("flex-1 p-6 overflow-y-auto relative", CARD_STYLE)}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-vibe-purple/10 to-transparent rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-xl pointer-events-none" />

                    <h3 className="text-lg font-bold font-display mb-5 flex items-center gap-3 relative">
                        <div className={cn("w-2.5 h-2.5 rounded-full", activeListTab === 'vibes' ? "bg-vibe-purple shadow-lg shadow-vibe-purple/50 animate-pulse" : "bg-green-500 animate-pulse")} />
                        <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            {activeListTab === 'vibes' ? 'Happening Now' : 'Campus Locations'}
                        </span>
                    </h3>
                    <div className="space-y-4 relative">
                        {activeListTab === 'locations' ? (
                            filteredLocations.length === 0 ? (
                                <div className="text-center text-gray-500 py-10">No locations found</div>
                            ) : (
                                filteredLocations.map(loc => (
                                    <div
                                        key={loc.id}
                                        onClick={() => setSelectedLoc(loc)}
                                        className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.12] to-white/[0.05] hover:from-white/[0.18] hover:to-white/[0.08] transition-all duration-300 cursor-pointer group border border-white/20 hover:border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]"
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold flex items-center gap-2">
                                                {loc.name}
                                                {joined.has(loc.id) && <CheckCircle className="w-4 h-4 text-green-400" />}
                                            </span>
                                            <span className={cn("text-xs font-mono px-2 py-1 rounded-lg", loc.occupancy > 80 ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10')}>
                                                {loc.occupancy}%
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">{loc.desc}</p>
                                    </div>
                                ))
                            )
                        ) : (
                            filteredEvents.length === 0 ? (
                                <div className="text-center text-gray-500 py-10">No vibes yet. Create one! 🚀</div>
                            ) : (
                                filteredEvents.map(event => (
                                    <div
                                        key={event.id}
                                        onClick={() => setSelectedLoc({ ...event, type: 'event' })}
                                        className="p-4 rounded-2xl bg-gradient-to-br from-white/20 via-white/15 to-vibe-purple/20 hover:from-white/25 hover:via-white/20 hover:to-vibe-purple/30 transition-all duration-300 cursor-pointer group border border-vibe-purple/40 hover:border-vibe-purple/60 shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_30px_rgba(139,92,246,0.35)]"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <span className="font-bold flex items-center gap-2 text-white">
                                                    {event.title}
                                                </span>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="text-xs text-gray-300 bg-white/10 px-2 py-0.5 rounded-lg border border-white/20">{event.locationName}</span>
                                                    <span className="text-xs text-gray-400">{new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                            {event.isMajor && <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400/30" />}
                                        </div>
                                        <p className="text-xs text-gray-300 mt-2 line-clamp-2">{event.description}</p>

                                        <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                                            {event.attendees?.includes(currentUser?.id) ? (
                                                <span className="text-xs text-green-400 flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-lg"><CheckCircle className="w-3 h-3" /> Joined</span>
                                            ) : (
                                                <span className="text-xs text-gray-500">Tap to view & join</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </div>
            </div>

            <div className={cn("col-span-1 md:col-span-5 row-span-2 p-6 relative overflow-hidden", CARD_STYLE, "text-center flex flex-col items-center")}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-vibe-cyan/20 to-transparent blur-3xl rounded-full" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-vibe-purple/10 to-transparent blur-2xl rounded-full" />
                <h3 className="font-display font-bold text-xl mb-4 relative z-10">Vibe Gang</h3>
                <div className="flex -space-x-3 mb-6 relative z-10 justify-center">
                    {[1, 2, 3, 4].map(i => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -8, scale: 1.12 }}
                            className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-vibe-purple via-vibe-cyan to-vibe-rose shadow-[0_0_20px_rgba(124,58,237,0.35)] relative cursor-pointer"
                        >
                            <div className="w-full h-full rounded-full bg-[#0A0A0F] p-[2px]">
                                <img
                                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=vibe-${i}`}
                                    className="w-full h-full object-cover rounded-full"
                                    alt={`vibe-${i}`}
                                />
                            </div>
                            {i === 2 && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#0A0A0F] rounded-full animate-pulse" />}
                        </motion.div>
                    ))}
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-xs font-bold cursor-pointer shadow-lg"
                    >
                        <div className="w-full h-full rounded-full bg-[#0A0A0F] flex items-center justify-center">+5</div>
                    </motion.div>
                </div>
                <div className="flex gap-4 relative z-10 justify-center">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addNotification("Pinging everyone! 🔔")}
                        className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-xl shadow-lg shadow-white/10"
                    >
                        Ping All
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addNotification("Scanning for new vibes... 📡", "info")}
                        className="px-5 py-2.5 bg-white/5 border border-white/10 text-sm font-bold rounded-xl hover:bg-white/10 transition"
                    >
                        Find New
                    </motion.button>
                </div>
            </div>

            <div className={cn("col-span-1 md:col-span-4 row-span-2 p-6 relative overflow-hidden", CARD_STYLE, "flex flex-col")}>
                <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-br from-vibe-purple/20 to-transparent blur-3xl rounded-full" />
                <div className="absolute bottom-0 left-0 w-44 h-44 bg-gradient-to-tr from-white/10 to-transparent blur-2xl rounded-full" />
                <div className="relative z-10 flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-xl">Daily Activity</h3>
                    <span className="text-[11px] text-gray-500">Last 7 days</span>
                </div>
                <div className="flex-1 flex items-end gap-3 relative z-10 h-[180px]">
                    {DAILY_ACTIVITY.map((d) => {
                        const total = d.study + d.play + d.other;
                        const pct = (val) => `${(val / maxActivityTotal) * 100}%`;
                        return (
                            <div key={d.day} className="flex-1 h-full flex flex-col items-center gap-2">
                                <div className="w-full max-w-[28px] h-full min-h-[140px] flex flex-col-reverse rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-inner">
                                    <div className="bg-vibe-cyan/80" style={{ height: pct(d.play) }} />
                                    <div className="bg-vibe-purple/80" style={{ height: pct(d.study) }} />
                                    <div className="bg-white/70" style={{ height: pct(d.other) }} />
                                </div>
                                <span className="text-[10px] text-gray-400">{d.day}</span>
                                <span className="text-[10px] text-gray-500">{total.toFixed(1)}h</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </main>
    );
};
