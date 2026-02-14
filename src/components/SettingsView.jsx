import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Palette,
    Bell,
    Shield,
    ArrowUp,
    Sun,
    Monitor,
    LogOut,
    Check,
    Heart
} from 'lucide-react';
import { cn } from '../utils/constants';
import { useTheme } from '../ThemeContext';

const SettingToggle = ({ label, desc, active, onToggle }) => (
    <div className="flex justify-between items-center py-4 border-b border-border last:border-0 group">
        <div>
            <h4 className="text-sm font-bold text-foreground group-hover:text-vibe-purple transition-colors">{label}</h4>
            {desc && <p className="text-xs text-foreground-muted mt-1">{desc}</p>}
        </div>
        <button
            onClick={onToggle}
            className={cn("w-12 h-7 rounded-full relative transition-colors duration-300", active ? "bg-vibe-purple" : "bg-card-hover")}
        >
            <div className={cn("absolute top-1 w-5 h-5 bg-foreground rounded-full shadow-md transition-transform duration-300", active ? "left-6" : "left-1")} />
        </button>
    </div>
);

const SettingSection = ({ title, icon: Icon, children }) => (
    <div className="mb-8 last:mb-0">
        <h3 className="text-xs font-bold text-vibe-cyan uppercase tracking-widest mb-4 flex items-center gap-2">
            <Icon className="w-4 h-4" /> {title}
        </h3>
        <div className="obsidian-card p-6 rounded-[2rem]">
            {children}
        </div>
    </div>
);


export const SettingsView = ({ currentUser, onLogout, onUpdateProfile }) => {
    const { themeId: theme, setTheme } = useTheme();
    const [notifications, setNotifications] = useState({ push: true, email: false, sound: true });
    const [privacy, setPrivacy] = useState({ visible: true, location: true });

    // Fallback if currentUser is not loaded yet
    const safeUser = currentUser || { username: 'Guest', avatar_url: '', full_name: 'Guest User' };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-32 lg:pb-0 max-w-2xl mx-auto space-y-8"
        >
            {/* Header */}
            <div className="flex items-center gap-6 mb-8 mt-4 md:mt-0 obsidian-card p-8 rounded-[2.5rem] border border-border relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-vibe-purple/10 to-vibe-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="relative group/avatar">
                    <div className="absolute -inset-1 bg-gradient-to-r from-vibe-purple to-vibe-cyan rounded-full opacity-0 group-hover/avatar:opacity-100 transition duration-500 blur-sm"></div>
                    <img
                        src={safeUser.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${safeUser.username}`}
                        alt="Profile"
                        className="w-24 h-24 rounded-full border-4 border-[#050505] relative z-10 bg-[#1a1a1f] object-cover"
                    />
                    <button className="absolute bottom-0 right-0 p-2 bg-vibe-purple rounded-full border-4 border-[#050505] text-white z-20 hover:scale-110 transition-transform shadow-lg">
                        <User className="w-4 h-4" />
                    </button>
                </div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">{safeUser.full_name || safeUser.username}</h1>
                    <p className="text-foreground-muted text-sm mt-1 font-medium">@{safeUser.username} • <span className="text-foreground-muted">Student</span></p>
                    <div className="flex gap-2 mt-4">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_#10b981]" /> Online
                        </span>
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                            Pro Member
                        </span>
                    </div>
                </div>
            </div>

            {/* Appearance */}
            <SettingSection title="Interface Theme" icon={Palette}>
                <div className="flex gap-4 mb-6">
                    {[
                        { id: 'dark', label: 'Cyberpunk', icon: Monitor },
                        { id: 'light', label: 'Solar Flare', icon: Sun },
                        { id: 'vaporwave', label: 'Vaporwave', icon: Palette },
                        { id: 'obsidian', label: 'Obsidian', icon: User },
                        { id: 'valentine', label: 'Cupid', icon: Heart }
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={cn(
                                "flex-1 p-4 rounded-xl border transition-all flex flex-col items-center gap-3 group relative overflow-hidden",
                                theme === t.id
                                    ? "bg-vibe-purple/20 border-vibe-purple text-foreground shadow-[0_0_20px_rgba(139,92,246,0.15)]"
                                    : "bg-card/20 border-border text-foreground-muted hover:bg-card-hover hover:text-foreground"
                            )}
                        >
                            <t.icon className={cn("w-6 h-6 transition-transform group-hover:scale-110 duration-300", theme === t.id && "text-vibe-purple")} />
                            <span className="capitalize text-xs font-bold tracking-wide">{t.label}</span>
                            {theme === t.id && <div className="absolute top-2 right-2 w-2 h-2 bg-vibe-purple rounded-full shadow-[0_0_5px_#8b5cf6]" />}
                        </button>
                    ))}
                </div>
                <SettingToggle
                    label="Reduced Motion"
                    desc="Minimize animations for performance"
                    active={false}
                    onToggle={() => { }}
                />
            </SettingSection>

            {/* Notifications */}
            <SettingSection title="Communications" icon={Bell}>
                <SettingToggle
                    label="Push Notifications"
                    desc="Get real-time alerts for vibes"
                    active={notifications.push}
                    onToggle={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                />
                <SettingToggle
                    label="Email Digest"
                    desc="Daily summary of campus events"
                    active={notifications.email}
                    onToggle={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                />
                <SettingToggle
                    label="Sound Effects"
                    desc="Play sounds for chat and interactions"
                    active={notifications.sound}
                    onToggle={() => setNotifications(prev => ({ ...prev, sound: !prev.sound }))}
                />
            </SettingSection>

            {/* Privacy */}
            <SettingSection title="Security & Privacy" icon={Shield}>
                <SettingToggle
                    label="Ghost Mode"
                    desc="Hide your location from the map"
                    active={!privacy.location}
                    onToggle={() => setPrivacy(prev => ({ ...prev, location: !prev.location }))}
                />
                <div className="py-4 border-b border-border last:border-0 hover:bg-card-hover -mx-6 px-6 transition cursor-pointer group">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-foreground group-hover:text-vibe-purple">Two-Factor Auth</span>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Enabled
                        </span>
                    </div>
                </div>
                <div className="py-4 hover:bg-card-hover -mx-6 px-6 transition cursor-pointer group rounded-b-[2rem]">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-foreground group-hover:text-vibe-purple">Active Sessions</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 group-hover:text-gray-300">
                            Windows PC, iPhone 14 <ArrowUp className="w-3 h-3 rotate-45" />
                        </span>
                    </div>
                </div>
            </SettingSection>

            {/* Danger Zone */}
            <div className="pt-2">
                <button
                    onClick={onLogout}
                    className="w-full p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-red-900/10"
                >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Log Out
                </button>
                <div className="flex flex-col items-center mt-6 gap-2">
                    <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-bold">VibeSRM OS v4.2.0-beta</p>
                    <p className="text-[10px] text-gray-700 font-mono">Build 2024.11.14_rc2</p>
                </div>
            </div>

        </motion.div>
    );
};
