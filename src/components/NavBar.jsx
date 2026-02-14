import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Map,
    Plus,
    MessageCircle,
    Users,
    Settings,
    Sparkles
} from 'lucide-react';
import { cn } from '../utils/constants';
import Logo from '../Logo.png';

import { useTheme } from '../ThemeContext';

export const NavBar = ({ active, setTab, currentUser, onOpenProfile, onCreateVibe }) => {
    const { theme } = useTheme();

    const navItems = [
        { id: 'dashboard', icon: theme.navIcons.home, label: 'Home' },
        { id: 'map', icon: theme.navIcons.map, label: 'Map' },
        { id: 'tribe', icon: Sparkles, label: 'Tribe' },
        { id: 'create', icon: theme.navIcons.create, label: 'Vibe', isAction: true },
        { id: 'social', icon: theme.navIcons.social, label: 'Social' },
        { id: 'chat', icon: theme.navIcons.chat, label: 'Chat' },
    ];

    return (
        <>
            {/* DESKTOP NAV: Floating Vertical Dock */}
            <div className="fixed left-6 top-0 bottom-0 flex flex-col justify-center pointer-events-none z-50">
                <nav role="navigation" aria-label="Main navigation" className={cn("pointer-events-auto flex flex-col gap-5 items-center bg-card backdrop-blur-2xl border border-border p-3 shadow-2xl obsidian-card transition-all duration-300", theme.navShape)}>

                    {/* APP LOGO */}
                    <div className="p-2 mb-1 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/5 shadow-inner">
                        <img
                            src={Logo}
                            alt="VibeSRM"
                            className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                        />
                    </div>

                    {/* Profile Top */}
                    <button
                        onClick={onOpenProfile}
                        className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-border hover:border-vibe-purple transition-all duration-300 group shadow-md"
                    >
                        <img
                            src={currentUser?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser?.username || 'user'}`}
                            alt="Profile"
                            className="w-full h-full object-cover bg-background group-hover:scale-110 transition-transform duration-500"
                        />
                    </button>

                    <div className="w-8 h-[1px] bg-white/10" />

                    {/* Main Items */}
                    <div className="flex flex-col gap-2">
                        {navItems.filter(i => !i.isAction).map((item) => {
                            const isActive = active === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setTab(item.id)}
                                    className={cn(
                                        "relative p-3 rounded-2xl transition-all duration-300 group hover:bg-card-hover",
                                        isActive ? "text-foreground" : "text-foreground-muted"
                                    )}
                                    aria-label={item.label}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <div className="relative z-10">
                                        <item.icon strokeWidth={isActive ? 2.5 : 2} className="w-5 h-5" />
                                    </div>

                                    {/* Tooltip */}
                                    <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-black/90 px-3 py-1.5 rounded-xl text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-md border border-white/10 shadow-xl z-50">
                                        {item.label}
                                    </span>

                                    {isActive && (
                                        <motion.div
                                            layoutId="desktop-active"
                                            className="absolute inset-0 bg-white/10 rounded-2xl border border-white/5 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="w-8 h-[1px] bg-white/10" />

                    {/* Create Action */}
                    <button
                        onClick={onCreateVibe}
                        className={cn("p-3 rounded-2xl text-white shadow-lg  hover:scale-105 active:scale-95 transition-transform duration-200 mt-1", theme.buttonStyle)}
                    >
                        <theme.navIcons.create className="w-5 h-5" />
                    </button>

                    {/* Settings */}
                    <div className="pt-2">
                        <button
                            onClick={() => setTab('settings')}
                            className={cn(
                                "p-3 rounded-2xl transition-all duration-300 text-foreground-muted hover:text-foreground hover:bg-card-hover",
                                active === 'settings' && "bg-card-hover text-foreground"
                            )}
                        >
                            <theme.navIcons.settings className="w-5 h-5" />
                        </button>
                    </div>
                </nav>
            </div>


            {/* MOBILE NAV: Floating Glass Bar */}
            <nav role="navigation" aria-label="Mobile navigation" className={cn("fixed bottom-6 left-4 right-4 h-20 bg-card/90 backdrop-blur-3xl border border-border flex items-center justify-between px-6 lg:hidden z-50 shadow-2xl obsidian-card overflow-visible", theme.mobileNavShape)}>
                {navItems.map((item) => {
                    if (item.isAction) {
                        return (
                            <div key={item.id} className="relative -top-6">
                                <button
                                    onClick={onCreateVibe}
                                    className="w-16 h-16 bg-background rounded-full flex items-center justify-center border-4 border-background shadow-xl relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-tr from-vibe-purple to-vibe-cyan opacity-100 group-hover:opacity-90 transition-opacity" />
                                    <theme.navIcons.create className="w-8 h-8 text-white relative z-10" />
                                </button>
                            </div>
                        );
                    }

                    const isActive = active === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setTab(item.id)}
                            className="flex flex-col items-center gap-1 group"
                        >
                            <div className={cn(
                                "p-2 rounded-xl transition-all duration-300 relative",
                                isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300"
                            )}>
                                <item.icon strokeWidth={isActive ? 2.5 : 2} className="w-6 h-6" />
                                {isActive && (
                                    <motion.div
                                        layoutId="mobile-active"
                                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-foreground rounded-full shadow-[0_0_8px_white]"
                                    />
                                )}
                            </div>
                        </button>
                    );
                })}
            </nav>
        </>
    );
};
