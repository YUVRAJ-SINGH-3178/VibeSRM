import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    // Cyberpunk Icons
    Zap, Shield, Cpu, Wifi, Radio, Target, Crosshair, Binary, MonitorPlay, Gamepad2,
    // Solar Flare Icons
    Sun, Flame, Sunrise, CloudSun, Sparkles, Heart, Star, Coffee, Flower2, SunMedium,
    // Midnight Icons
    Moon, Waves, Anchor, Ship, Compass, Wind, Droplets, Fish, ShipWheel, CloudMoon,
    // Forest Icons
    TreePine, Leaf, Bird, Bug, Mountain, Tent, Sprout, Flower, Trees, CloudRain,
    // Common
    Home, Map, Plus, MessageCircle, Users, Settings, Navigation, ChevronRight,
    ArrowRight, MapPin, Calendar, Clock, Play, Bell, Music, Hexagon
} from 'lucide-react';

/**
 * ============================================================
 *  THE REAL THEME ENGINE — Each theme is a unique personality
 * ============================================================
 *
 * A theme changes:
 *  1. Colors (via CSS variables — already done)
 *  2. Icons (nav, dashboard, decorators)
 *  3. Text (greetings, labels, button text, section titles)
 *  4. Shapes (border radius — via CSS variables)
 *  5. Animations (card hover, transition style)
 *  6. Card decorators (unique visual elements per theme)
 *  7. Fonts (via CSS variables — already done)
 */

const THEMES = {
    // ═══════════════════════════════════════════════════════════
    //  🎮 CYBERPUNK — Sharp, Neon, Techy, Futuristic
    // ═══════════════════════════════════════════════════════════
    dark: {
        id: 'dark',
        name: 'Cyberpunk',
        emoji: '🎮',
        tagline: 'Neon Streets. Digital Souls.',
        // Nav icons are swapped per theme
        navIcons: {
            home: Cpu,
            map: Crosshair,
            create: Zap,
            social: Radio,
            chat: MonitorPlay,
            settings: Binary,
        },
        // Dashboard
        greeting: (name) => `Welcome back, ${name}`,
        subtitle: 'System Status: Online',
        sectionIcons: {
            locations: Wifi,
            squad: Gamepad2,
            events: Zap
        },
        labels: {
            locationsTitle: 'LIVE GRID',
            squadTitle: 'ONLINE SQUAD',
            checkInBtn: 'TELEPORT',
            checkOutBtn: 'DISCONNECT',
            viewAllBtn: '[ SCAN ALL ]',
            liveTag: '🔴 LIVE FEED',
            systemTag: 'VIBE OS v4.2.0',
        },
        // Animation & Shape flavors
        cardHoverEffect: { y: -8, scale: 1.02 },
        pageTransition: { type: 'spring', stiffness: 300, damping: 25 },
        // Card decorator: what renders on top of obsidian-card
        cardDecorator: 'cyber-grid',
        // Unique CSS class added to body
        bodyClass: 'theme-cyberpunk',
        // Nav style
        navShape: 'rounded-full',
        mobileNavShape: 'rounded-[2.5rem]',
        // Button style
        buttonStyle: 'bg-gradient-to-r from-vibe-purple to-vibe-cyan text-white font-mono uppercase tracking-wider',
        // Active tab indicator
        activeIndicator: 'bg-vibe-purple/20 border border-vibe-purple/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]',
        // Settings preview colors
        previewGradient: 'from-purple-600 via-cyan-500 to-purple-600',
    },

    // ═══════════════════════════════════════════════════════════
    //  ☀️ SOLAR FLARE — Warm, Soft, Clean, Minimal
    // ═══════════════════════════════════════════════════════════
    light: {
        id: 'light',
        name: 'Solar Flare',
        emoji: '☀️',
        tagline: 'Warm Light. Clear Mind.',
        navIcons: {
            home: Sun,
            map: Compass,
            create: Sparkles,
            social: Heart,
            chat: Coffee,
            settings: Star,
        },
        greeting: (name) => `Good vibes, ${name} ☀️`,
        subtitle: 'It\'s a beautiful day on campus',
        sectionIcons: {
            locations: SunMedium,
            squad: Heart,
            events: Flame
        },
        labels: {
            locationsTitle: 'Campus Spots',
            squadTitle: 'Your Friends',
            checkInBtn: 'Check In ☀️',
            checkOutBtn: 'Leave',
            viewAllBtn: 'See more →',
            liveTag: '✨ Active Now',
            systemTag: 'VibeSRM',
        },
        cardHoverEffect: { y: -4, scale: 1.01 },
        pageTransition: { type: 'tween', ease: 'easeOut', duration: 0.3 },
        cardDecorator: null, // No grid, clean look
        bodyClass: 'theme-solar',
        navShape: 'rounded-2xl',
        mobileNavShape: 'rounded-2xl',
        buttonStyle: 'bg-gradient-to-r from-orange-500 to-amber-400 text-white font-semibold rounded-lg shadow-lg shadow-orange-500/20',
        activeIndicator: 'bg-orange-100 border border-orange-300 shadow-sm',
        previewGradient: 'from-orange-400 via-amber-300 to-yellow-400',
    },

    // ═══════════════════════════════════════════════════════════
    //  📼 VAPORWAVE — Retro, Glitch, Pink/Cyan, Nostalgic
    // ═══════════════════════════════════════════════════════════
    vaporwave: {
        id: 'vaporwave',
        name: 'Vaporwave 95',
        emoji: '📼',
        tagline: 'A E S T H E T I C S',
        navIcons: {
            home: Radio,
            map: Sun,
            create: Gamepad2,
            social: Heart,
            chat: MessageCircle,
            settings: Settings,
        },
        greeting: (name) => `H E L L O  ${name}`,
        subtitle: 'Systems are o p e r a t i o n a l',
        sectionIcons: {
            locations: Binary,
            squad: Users,
            events: Music
        },
        labels: {
            locationsTitle: 'VIRTUAL PLAZA',
            squadTitle: 'SQUAD',
            checkInBtn: 'Jack In',
            checkOutBtn: 'Jack Out',
            viewAllBtn: 'Load More...',
            liveTag: '🔴 ON AIR',
            systemTag: 'Windows 95',
        },
        cardHoverEffect: { y: -4, x: -4, scale: 1, boxShadow: '4px 4px 0px rgba(0,229,255,1)' },
        pageTransition: { type: 'tween', ease: 'linear', duration: 0.2 },
        cardDecorator: 'vapor-grid',
        bodyClass: 'theme-vaporwave',
        navShape: 'rounded-none border-2 border-vibe-cyan shadow-[4px_4px_0_rgba(255,0,128,1)]',
        mobileNavShape: 'rounded-none border-t-2 border-vibe-cyan',
        buttonStyle: 'bg-vibe-pink text-yellow-300 font-bold border-2 border-yellow-300 shadow-[4px_4px_0_rgba(0,0,0,1)] uppercase hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all',
        activeIndicator: 'bg-vibe-cyan/20 border-2 border-vibe-cyan',
        previewGradient: 'from-pink-500 via-purple-500 to-cyan-500',
    },

    // ═══════════════════════════════════════════════════════════
    //  ⚜️ OBSIDIAN — Luxury, Gold, Minimal, Professional
    // ═══════════════════════════════════════════════════════════
    obsidian: {
        id: 'obsidian',
        name: 'Obsidian Gold',
        emoji: '⚜️',
        tagline: 'Excellence. Defined.',
        navIcons: {
            home: Hexagon,
            map: MapPin,
            create: Plus,
            social: Users,
            chat: MessageCircle,
            settings: Settings,
        },
        greeting: (name) => `Welcome, ${name}.`,
        subtitle: 'Your concierge is ready.',
        sectionIcons: {
            locations: MapPin,
            squad: Users,
            events: Star
        },
        labels: {
            locationsTitle: 'Exclusive Locations',
            squadTitle: 'Members',
            checkInBtn: 'Reserve',
            checkOutBtn: 'Depart',
            viewAllBtn: 'View Directory',
            liveTag: '● Live',
            systemTag: 'VibeOS Elite',
        },
        cardHoverEffect: { y: -2, scale: 1.005 },
        pageTransition: { type: 'tween', ease: 'easeInOut', duration: 0.6 },
        cardDecorator: 'luxury-pattern',
        bodyClass: 'theme-obsidian',
        navShape: 'rounded-xl border border-white/10',
        mobileNavShape: 'rounded-t-xl',
        buttonStyle: 'bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-black font-serif tracking-widest uppercase hover:brightness-110 shadow-lg shadow-amber-500/20',
        activeIndicator: 'bg-amber-500/10 border border-amber-500/40',
        previewGradient: 'from-gray-900 via-black to-gray-900 border border-amber-500/20',
    },

    // ═══════════════════════════════════════════════════════════
    //  💘 VALENTINE — Romantic, Pink, Soft, Cupid
    // ═══════════════════════════════════════════════════════════
    valentine: {
        id: 'valentine',
        name: 'Cupid\'s Arrow',
        emoji: '💘',
        tagline: 'Romance in the Air.',
        navIcons: {
            home: Heart,
            map: MapPin,
            create: Sparkles,
            social: Users,
            chat: MessageCircle,
            settings: Settings,
        },
        greeting: (name) => `Hello Beautiful, ${name} 💖`,
        subtitle: 'Find your match today.',
        sectionIcons: {
            locations: Heart,
            squad: Users,
            events: Music
        },
        labels: {
            locationsTitle: 'Romantic Spots',
            squadTitle: 'Broken Hearts Club',
            checkInBtn: 'Find Love',
            checkOutBtn: 'Break Up',
            viewAllBtn: 'See Admirers',
            liveTag: '💕 MATCHING',
            systemTag: 'Cupid OS v2.0',
        },
        cardHoverEffect: { y: -6, scale: 1.03, boxShadow: '0 20px 40px rgba(244, 63, 94, 0.3)' },
        pageTransition: { type: 'spring', stiffness: 80, damping: 15 },
        cardDecorator: 'heart-pattern',
        bodyClass: 'theme-valentine',
        navShape: 'rounded-full border-2 border-pink-300 shadow-[0_4px_15px_rgba(244,63,94,0.3)]',
        mobileNavShape: 'rounded-[2.5rem]',
        buttonStyle: 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 background-animate text-white font-serif italic tracking-wide hover:shadow-pink-500/50 shadow-lg border border-white/20',
        activeIndicator: 'bg-white/40 border border-white/60 shadow-[0_0_20px_rgba(255,255,255,0.6)] backdrop-blur-md',
        previewGradient: 'from-pink-400 via-rose-400 to-red-400',
    },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [themeId, setThemeId] = useState(() => {
        // Persist theme choice
        return localStorage.getItem('vibesrm-theme') || 'dark';
    });

    const themeConfig = THEMES[themeId] || THEMES.dark;

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', themeId);
        // Remove old body classes, add new
        document.body.classList.remove('theme-cyberpunk', 'theme-solar', 'theme-midnight', 'theme-forest', 'theme-vaporwave', 'theme-obsidian', 'theme-valentine');
        document.body.classList.add(themeConfig.bodyClass);
        localStorage.setItem('vibesrm-theme', themeId);
    }, [themeId, themeConfig.bodyClass]);

    const value = {
        theme: themeConfig,
        themeId,
        setTheme: setThemeId,
        allThemes: THEMES,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}

export { THEMES };
