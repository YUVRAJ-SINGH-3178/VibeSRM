import React from 'react';
import { motion } from 'framer-motion';
import { Navigation, Zap } from 'lucide-react';
import { cn, INITIAL_LOCATIONS, BUILDING_COLORS, BUILDING_IMAGES } from '../utils/constants';

// Building Card Component
export const BuildingCard = ({ loc, isSelected, onSelect }) => {
    const colors = BUILDING_COLORS[loc.name] || { primary: '#a855f7', secondary: '#7c3aed', glow: 'rgba(168,85,247,0.4)' };
    const img = BUILDING_IMAGES[loc.name];

    return (
        <motion.div
            className="cursor-pointer"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(loc)}
        >
            <div
                className={cn(
                    "relative w-36 h-48 md:w-40 md:h-52 rounded-2xl overflow-hidden",
                    "bg-gradient-to-b from-white/10 to-black/60 backdrop-blur-lg",
                    "border-2 shadow-xl transition-all duration-300",
                    isSelected ? "border-white/50 ring-4 ring-white/20" : "border-white/10 hover:border-white/30"
                )}
                style={{
                    borderColor: isSelected ? colors.primary : undefined,
                    boxShadow: `0 15px 40px -10px ${colors.glow}`
                }}
            >
                <div className="flex items-center justify-center pt-4 pb-2">
                    <img
                        src={img}
                        alt={loc.name}
                        className="w-20 h-20 md:w-24 md:h-24 object-contain"
                        style={{ filter: `drop-shadow(0 6px 16px ${colors.glow})` }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>

                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
                    <p className="text-sm font-bold text-center text-white truncate">{loc.name}</p>

                    <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                backgroundColor: loc.occupancy > 70 ? '#ef4444' : loc.occupancy > 40 ? '#f59e0b' : '#10b981',
                                width: `${loc.occupancy}%`
                            }}
                        />
                    </div>
                    <p className="text-[10px] text-center text-gray-400 mt-1">{loc.occupancy}% occupied</p>
                </div>

                <div
                    className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full"
                    style={{
                        backgroundColor: loc.occupancy > 70 ? '#ef4444' : loc.occupancy > 40 ? '#f59e0b' : '#10b981',
                        boxShadow: `0 0 10px ${loc.occupancy > 70 ? '#ef4444' : loc.occupancy > 40 ? '#f59e0b' : '#10b981'}`
                    }}
                />
            </div>
        </motion.div>
    );
};

// Function to get currently empty classrooms (simulated)
const CLASSROOM_DATA = [
    { id: 'S301', block: 'S Block', floor: 3, capacity: 60 },
    { id: 'S302', block: 'S Block', floor: 3, capacity: 60 },
    { id: 'S303', block: 'S Block', floor: 3, capacity: 60 },
    { id: 'S304', block: 'S Block', floor: 3, capacity: 60 },
    { id: 'S305', block: 'S Block', floor: 3, capacity: 40 },
    { id: 'S201', block: 'S Block', floor: 2, capacity: 60 },
    { id: 'S202', block: 'S Block', floor: 2, capacity: 60 },
    { id: 'S203', block: 'S Block', floor: 2, capacity: 60 },
    { id: 'V101', block: 'V Block', floor: 1, capacity: 80 },
    { id: 'V102', block: 'V Block', floor: 1, capacity: 80 },
    { id: 'V103', block: 'V Block', floor: 1, capacity: 60 },
    { id: 'V104', block: 'V Block', floor: 1, capacity: 60 },
    { id: 'V105', block: 'V Block', floor: 1, capacity: 40 },
    { id: 'V106', block: 'V Block', floor: 1, capacity: 40 },
    { id: 'V107', block: 'V Block', floor: 1, capacity: 40 },
    { id: 'V108', block: 'V Block', floor: 1, capacity: 40 },
    { id: 'V109', block: 'V Block', floor: 1, capacity: 40 },
    { id: 'TP501', block: 'TP Block', floor: 5, capacity: 120 },
    { id: 'TP502', block: 'TP Block', floor: 5, capacity: 120 },
    { id: 'TP401', block: 'TP Block', floor: 4, capacity: 100 },
    { id: 'TP402', block: 'TP Block', floor: 4, capacity: 100 },
    { id: 'BEL001', block: 'BEL', floor: 0, capacity: 200 },
    { id: 'BEL002', block: 'BEL', floor: 0, capacity: 150 },
];

const getEmptyClassrooms = () => {
    const hour = new Date().getHours();
    const seed = hour % 12;
    return CLASSROOM_DATA.filter((_, index) => {
        return (index + seed) % 3 !== 0 || hour < 8 || hour > 18;
    }).slice(0, 12);
};

export const BentoMap = ({ locations = [], events = [], selected, onSelect, fullScreen = false }) => {
    const safeLocations = Array.isArray(locations) ? locations : INITIAL_LOCATIONS;
    const safeEvents = Array.isArray(events) ? events : [];

    const displayLocations = safeLocations.length > 0 ? safeLocations : INITIAL_LOCATIONS;

    return (
        <div className={cn("w-full h-full relative overflow-hidden rounded-[2rem]", fullScreen ? "rounded-none" : "")}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#030712] via-[#0f0a1f] to-[#0a0118]" />

            <div className="absolute inset-0 opacity-15">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
          linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)
        `,
                    backgroundSize: '50px 50px'
                }} />
            </div>

            {fullScreen && (
                <div className="absolute top-16 right-4 bottom-16 w-44 md:w-52 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden z-10">
                    <div className="p-3 border-b border-white/10 bg-emerald-500/10">
                        <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Empty Classrooms
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-0.5">Available right now</p>
                    </div>
                    <div className="overflow-y-auto max-h-[calc(100%-60px)] p-2 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
                        {getEmptyClassrooms().map((room) => (
                            <motion.div
                                key={room.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-2.5 bg-white/5 hover:bg-emerald-500/10 rounded-xl border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{room.id}</span>
                                    <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md font-medium">FREE</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-gray-500">{room.block}</span>
                                    <span className="text-[10px] text-gray-600">•</span>
                                    <span className="text-[10px] text-gray-500">Floor {room.floor}</span>
                                    <span className="text-[10px] text-gray-600">•</span>
                                    <span className="text-[10px] text-gray-500">{room.capacity} seats</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-vibe-purple/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-vibe-cyan/20 rounded-full blur-[100px]" />
            </div>

            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                <div className="px-5 py-2 bg-black/70 backdrop-blur-xl rounded-xl border border-white/10">
                    <h2 className="text-lg font-bold bg-gradient-to-r from-vibe-purple via-vibe-cyan to-vibe-rose bg-clip-text text-transparent">
                        🗺️ Campus Map
                    </h2>
                </div>
            </div>

            <div className={cn("absolute inset-0 pt-16 pb-16 px-4 flex items-center justify-center", fullScreen && "pr-52 md:pr-60")}>
                <div className="grid grid-cols-3 grid-rows-2 gap-3 md:gap-6 max-w-4xl w-full">
                    {INITIAL_LOCATIONS.map((loc) => (
                        <div key={loc.id} className="flex items-center justify-center">
                            <BuildingCard
                                loc={loc}
                                isSelected={selected?.id === loc.id}
                                onSelect={onSelect}
                            />
                        </div>
                    ))}

                    <div className="flex items-center justify-center flex-wrap gap-2">
                        {safeEvents.length > 0 ? (
                            <div className="flex flex-wrap gap-2 justify-center items-center max-w-[160px]">
                                {safeEvents.slice(0, 4).map((event) => (
                                    <motion.div
                                        key={event.id}
                                        className="cursor-pointer"
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onSelect({ ...event, type: 'event' })}
                                    >
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-amber-500/40 rounded-full blur-lg animate-pulse" />
                                            <div className={cn(
                                                "rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/50 border-2 border-amber-300",
                                                safeEvents.length === 1 ? "w-16 h-16 md:w-20 md:h-20" : "w-12 h-12 md:w-14 md:h-14"
                                            )}>
                                                <Zap className={cn("text-white", safeEvents.length === 1 ? "w-8 h-8 md:w-10 md:h-10" : "w-5 h-5 md:w-6 md:h-6")} />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {safeEvents.length > 4 && (
                                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                                        +{safeEvents.length - 4}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                <Zap className="w-8 h-8 text-white/20" />
                            </div>
                        )}

                        {safeEvents.length > 0 && (
                            <div className="absolute bottom-20 right-8 bg-black/70 backdrop-blur-xl rounded-lg px-3 py-1.5 border border-amber-500/30 z-20">
                                <span className="text-xs font-bold text-amber-400">🎉 {safeEvents.length} Active Vibe{safeEvents.length > 1 ? 's' : ''}</span>
                            </div>
                        )}

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 z-20">
                            <div className="flex items-center gap-4 text-[10px]">
                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-vibe-purple" /><span className="text-white/70">Academic</span></div>
                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-vibe-cyan" /><span className="text-white/70">Library</span></div>
                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500" /><span className="text-white/70">Sports</span></div>
                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-vibe-rose" /><span className="text-white/70">Gym</span></div>
                                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-white/70">Park</span></div>
                            </div>
                        </div>

                        <div className="absolute top-4 right-4 w-10 h-10 bg-black/70 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-center z-20">
                            <Navigation className="w-4 h-4 text-vibe-cyan" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
