import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeContext';

export const ThemeSkeleton = ({ className }) => {
    const { themeId } = useTheme();

    const variants = {
        valentine: <ValentineSkeleton />,
        dark: <CyberpunkSkeleton />,
        light: <SolarSkeleton />,
        vaporwave: <VaporwaveSkeleton />,
        obsidian: <ObsidianSkeleton />,
        midnight: <MidnightSkeleton />,
        forest: <ForestSkeleton />
    };

    return (
        <div className={`w-full h-full flex items-center justify-center ${className}`}>
            {variants[themeId] || <CyberpunkSkeleton />}
        </div>
    );
};

const ValentineSkeleton = () => (
    <div className="flex flex-col items-center gap-4">
        <motion.div
            animate={{
                scale: [1, 1.2, 1],
                filter: ["drop-shadow(0 0 10px rgba(244,63,94,0.4))", "drop-shadow(0 0 20px rgba(244,63,94,0.8))", "drop-shadow(0 0 10px rgba(244,63,94,0.4))"]
            }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="relative w-24 h-24"
        >
            {/* Cupid SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full text-rose-500 fill-current">
                <path d="M92.71,7.29a3,3,0,0,0-4.24,0L73.54,22.22,70.18,17a3,3,0,0,0-5,2.89L68.42,28l-7.93,7.93a18.25,18.25,0,0,0-3.35,3.35L26.46,69.94a2,2,0,0,0,.6,2.78l0,0a2,2,0,0,0,2.78-.6l6.63-11.48h0a18.21,18.21,0,0,0,3.35-3.35L78.6,28.46l8.15,3.26a3,3,0,0,0,3.94-1.63,3,3,0,0,0-.95-3.39L84.58,23.36,92.71,15.23A3,3,0,0,0,92.71,7.29ZM33.31,64.44l-5.6,9.7,1.8,1.8,9.7-5.6,27.14-27.14-0.1-.1A14.28,14.28,0,0,1,64,40.86l8.3-8.3-3.6-1.44a7,7,0,0,0-3.79.16l-33.8,13.52L14.7,28.39,36.4,26.22l0.25,0a7,7,0,0,0,3.2-1.28L47.7,19a3,3,0,0,0-3-4.8L37.12,18l-1.32-.13a3,3,0,0,0-2.38.93L12.06,40.15a3,3,0,0,0,.92,4.8l20.44,12.26,1.4,1.4,1.86,1.86Zm-8-10.66L18,49.54,30.34,37.19a14.28,14.28,0,0,1,3-2.61L61.07,24l5.32,2.13-29,29a14.2,14.2,0,0,1-4.08,2.71ZM10.59,62.83a3,3,0,0,0,0,4.24l7.12,7.12a3,3,0,0,0,2.68.8l-1.93-3.09L22.65,67.7l3.09,1.93-.8-2.68,5.18,5.18-7.07,7.07a3,3,0,0,0,4.24,0l9.9-9.9,1.41-1.41-5.65-5.66-1.41-1.41Zm75.24-40L83,28.52l4.13,3.31Z" />
            </svg>
        </motion.div>
        <p className="text-rose-500 text-sm font-serif italic tracking-widest animate-pulse">CUPID SEARCHING...</p>
    </div>
);

const CyberpunkSkeleton = () => (
    <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-vibe-purple/30 border-t-vibe-purple animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-vibe-cyan/20 border-b-vibe-cyan animate-spin-reverse" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-vibe-purple rounded-full animate-pulse" />
            </div>
        </div>
        <p className="text-vibe-cyan text-xs font-mono animate-pulse tracking-[0.2em]">SYSTEM LINKING...</p>
    </div>
);

const SolarSkeleton = () => (
    <div className="flex flex-col items-center gap-4">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="w-16 h-16 text-orange-500"
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
        </motion.div>
        <p className="text-orange-600 text-sm font-medium animate-pulse">Warming Up...</p>
    </div>
);

const VaporwaveSkeleton = () => (
    <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 border-4 border-pink-500 skew-x-12 animate-pulse flex items-center justify-center bg-cyan-500/10">
            <div className="w-10 h-10 border-2 border-cyan-400 -skew-x-12 animate-spin" />
        </div>
        <p className="text-pink-500 font-bold tracking-widest text-xs animate-pulse">L O A D I N G</p>
    </div>
);

const ObsidianSkeleton = () => (
    <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border border-amber-500/30 flex items-center justify-center rotate-45">
            <div className="w-8 h-8 bg-amber-500/80 blur-md animate-pulse rounded-full" />
        </div>
        <p className="text-amber-500/60 text-[10px] uppercase tracking-[0.3em]">Authenticating</p>
    </div>
);

const MidnightSkeleton = () => (
    <div className="flex flex-col items-center gap-4">
        <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-16 h-16 flex items-center justify-center"
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.5" className="w-full h-full">{/* Sky blue */}
                <path d="M2 12c.6 0 1.25.07 1.9.22A12.06 12.06 0 0112 2a12.06 12.06 0 018.1 10.22c.65-.15 1.3-.22 1.9-.22" />
                <path d="M12 2v20M2 12h20" strokeOpacity="0.2" />
            </svg>
        </motion.div>
        <p className="text-sky-400 text-xs font-mono tracking-widest animate-pulse">DRIFTING...</p>
    </div>
);

const ForestSkeleton = () => (
    <div className="flex flex-col items-center gap-4">
        <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-16 h-16 text-emerald-500"
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 22v-6.57a4 4 0 0 1 1.17-2.83L12 10V2l3.42 2.56A4 4 0 0 1 17 7.43V22" />
                <path d="M4 22h16" />
            </svg>
        </motion.div>
        <p className="text-emerald-400 text-sm font-mono tracking-wider animate-pulse">Growing...</p>
    </div>
);
