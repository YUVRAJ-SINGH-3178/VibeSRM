import React, { useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import {
    MapPin, Zap, Users, ArrowUpRight,
    Wind, Droplets, Music, Play, Pause, SkipForward, Heart, X
} from 'lucide-react';
import { cn } from '../utils/constants';
import { useTheme } from '../ThemeContext';

// --- 3D TILT CARD COMPONENT ---
const TiltCard = ({ children, className, onClick, delay = 0 }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXVal = e.clientX - rect.left;
        const mouseYVal = e.clientY - rect.top;
        const xPct = mouseXVal / width - 0.5;
        const yPct = mouseYVal / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.6, type: "spring" }}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className={cn(
                "relative overflow-hidden rounded-[2.5rem] obsidian-card border border-[var(--border-color)] bg-[var(--surface-glass)] transition-shadow duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)]",
                className
            )}
        >
            <div style={{ transform: "translateZ(20px)" }} className="h-full w-full">
                {children}
            </div>
            {/* Glossy sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </motion.div>
    );
};

// --- WIDGETS ---

const WeatherWidget = () => (
    <div className="h-full flex flex-col justify-between p-6 bg-gradient-to-br from-blue-500/10 to-transparent relative overflow-hidden group">
        <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-yellow-400/20 rounded-full blur-[40px] group-hover:bg-yellow-400/40 transition-colors" />

        <div className="flex justify-between items-start">
            <div className="p-3 rounded-2xl bg-[var(--surface-highlight)] backdrop-blur-md">
                <Wind className="w-6 h-6 text-[var(--text-primary)]" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Campus Weather</span>
        </div>

        <div>
            <h3 className="text-4xl font-bold text-[var(--text-primary)] mb-1">24°C</h3>
            <p className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                <Droplets className="w-3 h-3" /> Humidity 65%
            </p>
        </div>
    </div>
);

const MusicWidget = ({ isPlaying, setIsPlaying }) => {
    return (
        <div className="h-full p-6 flex flex-col justify-between relative overflow-hidden group">
            {/* Vinyl Animation */}
            <div className={cn(
                "absolute -right-6 -bottom-6 w-32 h-32 rounded-full border-[8px] border-[var(--bg-card)] flex items-center justify-center transition-all duration-1000",
                isPlaying ? "animate-spin-slow opacity-100" : "opacity-50"
            )}>
                <div className="absolute inset-0 rounded-full bg-black/80 shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]" />
                <div className="absolute inset-[30%] rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)]" />
                <div className="absolute inset-[45%] rounded-full bg-black" />
            </div>

            <div className="flex justify-between items-start relative z-10">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white shadow-lg animate-pulse-slow">
                    <Music className="w-5 h-5" />
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={cn("w-1 h-4 rounded-full bg-[var(--accent-secondary)]", isPlaying ? "animate-pulse" : "opacity-30")} style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                </div>
            </div>

            <div className="relative z-10 mt-4">
                <h4 className="text-lg font-bold text-[var(--text-primary)] truncate">Cupid</h4>
                <p className="text-xs text-[var(--text-secondary)] mb-4">Fifty Fifty • K-Pop</p>

                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                        className="w-10 h-10 rounded-full bg-[var(--text-primary)] text-[var(--bg-page)] flex items-center justify-center hover:scale-110 transition-transform shadow-xl z-20"
                    >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                    <button className="w-8 h-8 rounded-full bg-[var(--bg-card-hover)] text-[var(--text-secondary)] flex items-center justify-center hover:text-[var(--text-primary)] transition">
                        <SkipForward className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color, delay }) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay, type: "spring" }}
        className="flex items-center gap-4 p-4 rounded-[2rem] bg-[var(--surface-glass)] border border-[var(--border-color)]"
    >
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", color)}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-xs font-bold text-[var(--text-secondary)] uppercase">{label}</p>
            <p className="text-2xl font-bold text-[var(--text-primary)] font-display">{value}</p>
        </div>
    </motion.div>
);

export const DashboardView = ({
    locations,
    events,
    selectedLoc,
    setSelectedLoc,
    joined,
    handleCheckIn,
    userStats,
    currentUser,
    addNotification
}) => {
    const { theme, themeId } = useTheme();
    const isLight = themeId === 'valentine' || themeId === 'light' || themeId === 'solar';

    const [isPlaying, setIsPlaying] = useState(false);

    // Featured Event Logic
    const featuredEvent = events.find(e => e.title.includes('Infinitus')) || {
        title: "Neon Nights 2026",
        locationName: "Sky Deck",
        image: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=2600&auto=format&fit=crop"
    };

    return (
        <main className="pb-32 lg:pb-12 pt-6 px-4 lg:pl-0 max-w-[1600px] mx-auto font-sans relative">

            {/* YouTube Music Player — rendered off-screen when playing */}
            {isPlaying && (
                <iframe
                    className="fixed -bottom-[300px] -right-[400px] w-[400px] h-[300px] pointer-events-none"
                    src="https://www.youtube.com/embed/Qc7_zRjH808?autoplay=1&loop=1&playlist=Qc7_zRjH808&controls=0&showinfo=0&rel=0&modestbranding=1"
                    title="Background Music"
                    allow="autoplay; encrypted-media"
                    allowFullScreen={false}
                    frameBorder="0"
                />
            )}

            {/* HEADER: BIG TYPOGRAPHY */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6"
            >
                <div>
                    <h2 className="text-sm font-bold text-[var(--accent-secondary)] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <span className="w-8 h-[2px] bg-[var(--accent-secondary)]" />
                        {theme.labels.systemTag}
                    </h2>
                    <h1 className="text-5xl md:text-7xl font-display font-bold text-[var(--text-primary)] leading-[0.9] tracking-tight">
                        {theme.greeting(currentUser?.username?.split(' ')[0] || 'Explorer').split(',')[0]}, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]">
                            {currentUser?.username || 'Explorer'}
                        </span>
                    </h1>
                    <p className="mt-4 text-[var(--text-secondary)] font-medium text-lg italic opacity-80">{theme.subtitle}</p>
                </div>

                <div className="flex gap-4">
                    <StatCard label="Vibe Score" value="98" icon={Zap} color="bg-amber-500" delay={0.2} />
                    <StatCard label="Friends" value="12" icon={Users} color="bg-emerald-500" delay={0.3} />
                </div>
            </motion.div>

            {/* HERO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-[350px_auto] md:grid-rows-[300px_300px] gap-6 mb-12">

                {/* 1. MAP (Span 2x2) - Interactive & Large */}
                <TiltCard
                    className="md:col-span-2 md:row-span-2 group cursor-pointer p-0 border-0"
                >
                    <div className="absolute inset-0">
                        {/* THEME AWARE MAP BG */}
                        <div className="absolute inset-0 bg-[var(--bg-card)]" />
                        <img
                            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1072&auto=format&fit=crop"
                            className={cn(
                                "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
                                isLight ? "opacity-10 mix-blend-multiply" : "opacity-60 mix-blend-overlay"
                            )}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-page)] via-transparent to-transparent" />

                        {/* Live Location Dots */}
                        {locations.slice(0, 6).map(loc => (
                            <div key={loc.id}
                                className="absolute cursor-pointer z-20 group/pin"
                                style={{ top: `${loc.coords.y / 10 + 20}%`, left: `${loc.coords.x / 14 + 10}%` }}
                                onClick={(e) => { e.stopPropagation(); setSelectedLoc(loc); }}
                            >
                                <div className="relative">
                                    <div className="w-3 h-3 rounded-full bg-[var(--accent-primary)] shadow-[0_0_15px_currentColor] animate-pulse group-hover/pin:scale-150 transition-transform" />
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[var(--bg-card)] rounded-xl text-[10px] font-bold text-[var(--text-primary)] opacity-0 group-hover/pin:opacity-100 transition-all whitespace-nowrap pointer-events-none border border-[var(--border-color)] shadow-2xl scale-90 group-hover/pin:scale-100 translate-y-2 group-hover/pin:translate-y-0">
                                        <div className="flex flex-col items-center">
                                            <span>{loc.name}</span>
                                            <span className="text-[8px] text-[var(--accent-secondary)]">{loc.occupancy}% Full</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Event Markers */}
                        {events.slice(0, 3).map(event => (
                            <div key={event.id}
                                className="absolute cursor-pointer z-20 group/event"
                                style={{ top: `${(event.coords?.y || 0) / 10 + 15}%`, left: `${(event.coords?.x || 0) / 14 + 5}%` }}
                                onClick={(e) => { e.stopPropagation(); addNotification?.(`Checking out ${event.title}!`); }}
                            >
                                <div className="relative">
                                    <div className="w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_20px_#f59e0b] flex items-center justify-center animate-bounce">
                                        <Zap className="w-2.5 h-2.5 text-black fill-black" />
                                    </div>
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-amber-500 rounded-xl text-[10px] font-bold text-black opacity-0 group-hover/event:opacity-100 transition-all whitespace-nowrap pointer-events-none border border-amber-400/50 shadow-2xl scale-90 group-hover/event:scale-100 translate-y-2 group-hover/event:translate-y-0">
                                        {event.title}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Selected Location Detail Overlay */}
                        <AnimatePresence>
                            {selectedLoc && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="absolute top-6 left-6 z-30 w-64 p-6 obsidian-card bg-[var(--surface-glass-high)] border border-[var(--accent-primary)]/50 rounded-[2rem] shadow-2xl backdrop-blur-2xl"
                                >
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedLoc(null); }}
                                        className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-white transition"
                                    >
                                        <X size={16} />
                                    </button>
                                    <h4 className="text-xl font-bold text-[var(--text-primary)] mb-1">{selectedLoc.name}</h4>
                                    <p className="text-xs text-[var(--accent-primary)] font-bold uppercase tracking-wider mb-4">{selectedLoc.type}</p>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center bg-[var(--bg-card-hover)] p-3 rounded-xl border border-[var(--border-color)]">
                                            <span className="text-[10px] font-bold text-[var(--text-secondary)]">OCCUPANCY</span>
                                            <span className="text-sm font-bold text-[var(--text-primary)]">{selectedLoc.occupancy}%</span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleCheckIn(selectedLoc); }}
                                            className={cn(
                                                "w-full py-3 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95",
                                                joined.has(selectedLoc.id)
                                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                    : "bg-[var(--text-primary)] text-[var(--bg-page)] hover:opacity-90"
                                            )}
                                        >
                                            {joined.has(selectedLoc.id) ? "You're checked in here" : "Check In Here"}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="absolute bottom-6 left-6 z-20">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Live View</span>
                        </div>
                        <h3 className="text-3xl font-display font-bold text-[var(--text-primary)]">Main Campus</h3>
                    </div>

                    <div className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-[var(--surface-glass)] backdrop-blur-md border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] group-hover:bg-[var(--accent-primary)] group-hover:text-white transition-colors duration-300">
                        <ArrowUpRight className="w-6 h-6" />
                    </div>
                </TiltCard>

                {/* 2. FEATURED EVENT (Span 2x1) */}
                <TiltCard className="md:col-span-2 md:row-span-1 border-0" delay={0.1}>
                    <div className="absolute inset-0 bg-black">
                        <img
                            src={featuredEvent.image || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80"}
                            className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-center p-8">
                        <span className="inline-block px-3 py-1 mb-4 rounded-lg bg-[var(--accent-secondary)]/90 text-white text-[10px] font-bold uppercase tracking-wider w-fit">
                            Featured Event
                        </span>
                        <h3 className="text-4xl font-display font-bold text-white mb-2 leading-none max-w-xs">
                            {featuredEvent.title}
                        </h3>
                        <p className="text-gray-300 text-sm flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> {featuredEvent.locationName}
                        </p>
                    </div>
                </TiltCard>

                {/* 3. WEATHER (Span 1x1) */}
                <TiltCard className="md:col-span-1 md:row-span-1" delay={0.2}>
                    <WeatherWidget />
                </TiltCard>

                {/* 4. MUSIC (Span 1x1) */}
                <TiltCard className="md:col-span-1 md:row-span-1" delay={0.3}>
                    <MusicWidget
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                    />
                </TiltCard>
            </div>

            {/* HORIZONTAL ZONES */}
            <div className="mt-16">
                <div className="flex items-center mb-8 px-2">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white shadow-lg mr-4">
                        {React.createElement(theme.sectionIcons.locations || MapPin, { className: "w-5 h-5" })}
                    </div>
                    <h3 className="text-2xl font-display font-bold text-[var(--text-primary)]">{theme.labels.locationsTitle}</h3>
                    <div className="h-[1px] flex-1 bg-[var(--border-color)] mx-6" />
                    <button className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition uppercase tracking-wider">
                        {theme.labels.viewAllBtn}
                    </button>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-12 snap-x hide-scrollbar px-2">
                    {locations.map((loc, i) => (
                        <motion.div
                            key={loc.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + (i * 0.1) }}
                            onClick={() => setSelectedLoc(loc)}
                            className="snap-center min-w-[320px] h-[400px] relative rounded-[2.5rem] overflow-hidden group cursor-pointer border border-[var(--border-color)]"
                        >
                            <img
                                src={loc.photoUrl}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />

                            <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
                                <span className={cn(
                                    "px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border shadow-lg w-fit",
                                    loc.crowdLevel === 'High' ? "bg-red-500/90 text-white border-red-400" : "bg-emerald-500/90 text-white border-emerald-400"
                                )}>
                                    {loc.crowdLevel} Traffic
                                </span>
                                {joined.has(loc.id) && (
                                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-[var(--accent-primary)] text-white border border-[var(--accent-primary)]/50 shadow-lg w-fit animate-pulse">
                                        Active Now
                                    </span>
                                )}
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                <h4 className="text-2xl font-bold text-white mb-2 leading-none">{loc.name}</h4>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-300 text-xs font-medium">
                                        <Users className="w-3 h-3" /> {loc.currentPeople} people
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                                        <ArrowUpRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

        </main>
    );
};
