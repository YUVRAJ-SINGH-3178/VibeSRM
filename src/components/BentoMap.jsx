import React from 'react';
import { motion } from 'framer-motion';
import { Zap, MapPin } from 'lucide-react';
import { cn, INITIAL_LOCATIONS, CLASSROOM_DATA } from '../utils/constants';
import { useTheme } from '../ThemeContext';

// --- HELPER EXPORTS ---
export const getEmptyClassrooms = () => {
    const hour = new Date().getHours();
    const seed = hour % 12;
    return CLASSROOM_DATA.filter((_, index) => {
        return (index + seed) % 3 !== 0 || hour < 8 || hour > 18;
    }).slice(0, 15);
};

// --- SUB-COMPONENTS ---

const MapMarker = ({ loc, x, y, isSelected, onClick }) => {
    return (
        <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={onClick}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
        >
            {/* Pulse Effect */}
            <div className={cn(
                "absolute inset-0 rounded-full animate-ping opacity-20",
                loc.occupancy > 80 ? "bg-[var(--accent-secondary)]" : "bg-[var(--accent-primary)]"
            )} />

            {/* Pin Head */}
            <div className={cn(
                "relative w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-2xl transition-all duration-300",
                "bg-[var(--surface-glass-high)] backdrop-blur-md",
                isSelected
                    ? "border-[var(--accent-secondary)] text-[var(--accent-secondary)] scale-110"
                    : "border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
            )}>
                <MapPin className="w-5 h-5 fill-current" />
            </div>

            {/* Tooltip Label (Always visible map style) */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-[var(--surface-glass-high)] backdrop-blur-md border border-[var(--border-color)] rounded-lg whitespace-nowrap z-30 shadow-xl">
                <p className="text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-wider">{loc.name}</p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                    <div className={cn("w-1.5 h-1.5 rounded-full", loc.occupancy > 70 ? "bg-red-500" : "bg-emerald-500")} />
                    <span className="text-[9px] text-[var(--text-secondary)]">{loc.occupancy}% Full</span>
                </div>
            </div>

            {/* Stick */}
            <div className="absolute top-10 left-1/2 w-0.5 h-8 bg-gradient-to-b from-[var(--border-color)] to-transparent -translate-x-1/2" />
        </motion.div>
    );
};

export const BentoMap = ({ locations = [], events = [], selected, onSelect, fullScreen = false }) => {
    const { themeId } = useTheme();
    const safeLocations = Array.isArray(locations) ? locations : INITIAL_LOCATIONS;
    const safeEvents = Array.isArray(events) ? events : [];

    // Map logic
    const normalize = (val) => Math.min(Math.max((val / 1000) * 80 + 10, 10), 90);
    const isLight = themeId === 'valentine' || themeId === 'light' || themeId === 'solar';

    return (
        <div className={cn("w-full h-full relative overflow-hidden bg-[var(--bg-card)]", !fullScreen && "rounded-[2.5rem] border border-[var(--border-color)]")}>

            {/* 1. REALISTIC DARK MAP BACKGROUND */}
            <div className="absolute inset-0 z-0">
                {/* Fallback pattern */}
                <div className="absolute inset-0 bg-[var(--bg-page)]" />

                {/* Map Image Layer - Dark Themes Only */}
                {!isLight && (
                    <img
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
                        className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
                        alt="SRM AP Map Background"
                    />
                )}

                {/* Overlay Gradient for Fade */}
                <div className="absolute inset-0 bg-radial-gradient from-transparent via-[var(--bg-page)]/50 to-[var(--bg-page)]" />

                {/* Tactical Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
            </div>

            {/* 2. MAP MARKERS LAYER */}
            <div className="absolute inset-0 z-10">
                {safeLocations.map((loc) => (
                    <MapMarker
                        key={loc.id}
                        loc={loc}
                        x={normalize(loc.coords?.x || 500)}
                        y={normalize(loc.coords?.y || 500)}
                        isSelected={selected?.id === loc.id}
                        onClick={() => onSelect(loc)}
                    />
                ))}

                {/* Event Markers */}
                {safeEvents.slice(0, 5).map((evt) => (
                    <motion.div
                        key={evt.id}
                        className="absolute z-20 cursor-pointer -translate-x-1/2 -translate-y-1/2"
                        style={{
                            left: `${normalize(evt.coords?.x || 500)}%`,
                            top: `${normalize(evt.coords?.y || 500)}%`
                        }}
                        onClick={() => onSelect({ ...evt, type: 'event' })}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.2 }}
                    >
                        <div className="relative">
                            <div className="absolute -inset-4 bg-amber-500/30 rounded-full blur-xl animate-pulse" />
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full border-2 border-white flex items-center justify-center shadow-2xl relative z-10">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black/80 rounded border border-amber-500/30 whitespace-nowrap">
                            <span className="text-[10px] font-bold text-amber-400 uppercase">Event</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* 3. MINI-LIST (Only when NOT fullscreen / dashboard mode) */}
            {!fullScreen && (
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                    <div className="px-3 py-1.5 bg-[var(--surface-glass)] backdrop-blur-md border border-[var(--border-color)] rounded-lg flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-[var(--text-primary)]">Live View</span>
                    </div>
                </div>
            )}

        </div>
    );
};
