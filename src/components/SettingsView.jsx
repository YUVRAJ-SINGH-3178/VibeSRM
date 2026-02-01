import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    User as UserIcon,
    Palette,
    Bell,
    Shield,
    CheckCircle,
    Moon,
    Sun,
    Lock,
    Settings,
    LogOut
} from 'lucide-react';
import { cn } from '../utils/constants';

export const SettingsView = ({ currentUser, onLogout, onUpdateProfile }) => {
    const [subTab, setSubTab] = useState('account');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        fullName: currentUser?.full_name || currentUser?.fullName || '',
        username: currentUser?.username || '',
        bio: currentUser?.bio || '',
        email: currentUser?.email || ''
    });

    const tabs = [
        { id: 'account', label: 'Account', icon: UserIcon },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield }
    ];

    const handleSave = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 1000));
        onUpdateProfile?.(form);
        setLoading(false);
    };

    const renderSection = () => {
        switch (subTab) {
            case 'account':
                return (
                    <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-right-4 duration-500">
                        <div>
                            <h3 className="text-3xl font-display font-bold text-white">Profile Settings</h3>
                            <p className="text-gray-400 mt-2">Manage your public profile and personal details.</p>
                        </div>

                        <div className="flex items-center gap-8 mb-8 group cursor-pointer relative w-fit">
                            <div className="w-28 h-28 rounded-full border-4 border-white/5 overflow-hidden shadow-2xl relative">
                                <img src={currentUser?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${form.username || 'user'}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Profile" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold backdrop-blur-sm">CHANGE</div>
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white">{form.fullName || 'Your Name'}</h4>
                                <p className="text-vibe-purple font-medium mb-2">@{form.username || 'username'}</p>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400 border border-white/5">{currentUser?.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                                <div className="relative group">
                                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-vibe-purple transition-colors" />
                                    <input
                                        value={form.fullName}
                                        onChange={e => setForm({ ...form, fullName: e.target.value })}
                                        className="w-full bg-[#15151a] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-vibe-purple focus:ring-1 focus:ring-vibe-purple transition outline-none font-medium"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Username</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-vibe-purple transition-colors font-bold">@</span>
                                    <input
                                        value={form.username}
                                        onChange={e => setForm({ ...form, username: e.target.value })}
                                        className="w-full bg-[#15151a] border border-white/5 rounded-2xl pl-10 pr-4 py-4 text-white focus:border-vibe-purple focus:ring-1 focus:ring-vibe-purple transition outline-none font-medium"
                                        placeholder="johndoe"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Bio</label>
                                <textarea
                                    value={form.bio}
                                    onChange={e => setForm({ ...form, bio: e.target.value })}
                                    rows={4}
                                    className="w-full bg-[#15151a] border border-white/5 rounded-2xl px-4 py-4 text-white focus:border-vibe-purple focus:ring-1 focus:ring-vibe-purple transition outline-none resize-none font-medium"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition flex items-center gap-2 shadow-lg shadow-white/10"
                            >
                                {loading ? <span className="animate-spin">⏳</span> : <CheckCircle className="w-5 h-5" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                );
            case 'appearance':
                return (
                    <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-right-4 duration-500">
                        <div>
                            <h3 className="text-3xl font-display font-bold text-white">Visual Preferences</h3>
                            <p className="text-gray-400 mt-2">Customize how VibeSRM looks and feels.</p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Theme</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-3xl bg-vibe-purple/10 border border-vibe-purple/40 relative cursor-pointer ring-2 ring-vibe-purple ring-offset-2 ring-offset-[#0c0c14]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-vibe-purple/20 flex items-center justify-center text-vibe-purple">
                                            <Moon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Dark Nebula</h4>
                                            <p className="text-xs text-vibe-purple/80 font-bold mt-1">Active</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 relative cursor-pointer hover:bg-white/10 transition opacity-50 grayscale hover:grayscale-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                                            <Sun className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Light Mode</h4>
                                            <p className="text-xs text-gray-500 mt-1">High Contrast Beta</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Accent & Intensity</label>
                            <div className="p-8 rounded-[2rem] bg-[#15151a] border border-white/5 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-vibe-purple to-vibe-cyan flex items-center justify-center text-white shadow-lg">
                                            <Palette className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Brand Accent</h4>
                                            <p className="text-sm text-gray-500">Global theme color signature.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        {[
                                            { name: 'vibe-purple', color: '#7C3AED' },
                                            { name: 'blue-500', color: '#3B82F6' },
                                            { name: 'emerald-500', color: '#10B981' },
                                            { name: 'rose-500', color: '#F43F5E' },
                                            { name: 'amber-500', color: '#F59E0B' }
                                        ].map((c, i) => (
                                            <button
                                                key={c.name}
                                                title={c.name}
                                                className={cn(
                                                    "w-10 h-10 rounded-full cursor-pointer hover:scale-110 active:scale-90 transition border-4 border-transparent hover:border-white shadow-lg",
                                                    i === 0 ? "bg-vibe-purple" :
                                                        i === 1 ? "bg-blue-500" :
                                                            i === 2 ? "bg-emerald-500" :
                                                                i === 3 ? "bg-rose-500" : "bg-amber-500",
                                                    i === 0 && "ring-4 ring-vibe-purple/20 ring-offset-4 ring-offset-[#15151a]"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-400 font-bold">Vibe Intensity</span>
                                        <span className="text-vibe-purple font-bold">85%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full w-[85%] bg-gradient-to-r from-vibe-purple to-vibe-cyan rounded-full shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
                                    </div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Adjusts particle density and background blur</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-right-4 duration-500">
                        <div>
                            <h3 className="text-3xl font-display font-bold text-white">Notifications</h3>
                            <p className="text-gray-400 mt-2">Choose what updates you want to receive.</p>
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: 'Event Reminders', active: true, desc: 'Notifies you when your vibes are starting.' },
                                { label: 'Chat Messages', active: true, desc: 'Real-time alerts for holographic chats.' },
                                { label: 'Friend Requests', active: true, desc: 'New squad connections pending.' },
                                { label: 'Leaderboard Updates', active: false, desc: 'Weekly ranking changes.' },
                                { label: 'Vibe Recommendations', active: false, desc: 'AI-suggested study zones.' }
                            ].map((item, i) => (
                                <div key={item.label} className="p-6 rounded-3xl bg-[#15151a] border border-white/5 hover:border-white/10 transition group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center",
                                                i === 0 ? "bg-amber-500/20 text-amber-500" :
                                                    i === 1 ? "bg-vibe-cyan/20 text-vibe-cyan" :
                                                        "bg-white/10 text-gray-400"
                                            )}>
                                                <Bell className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-white block">{item.label}</span>
                                                <span className="text-xs text-gray-500">{item.desc}</span>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "w-14 h-8 rounded-full p-1 cursor-pointer transition-colors",
                                            item.active ? "bg-vibe-purple" : "bg-white/10"
                                        )}>
                                            <div className={cn(
                                                "w-6 h-6 bg-white rounded-full shadow-lg transition-transform",
                                                item.active ? "translate-x-6" : "translate-x-0"
                                            )} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default: return (
                <div className="flex flex-col items-center justify-center h-[500px] text-center">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <Lock className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Coming Soon</h3>
                    <p className="text-gray-500 max-w-sm">This section is currently under development. Stay tuned for updates!</p>
                </div>
            );
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full grid grid-cols-12 gap-6 lg:gap-10 pb-20">
            <div className="col-span-12 md:col-span-4 lg:col-span-3">
                <div className="bg-[#0c0c14] border border-white/10 rounded-[2.5rem] p-6 h-full min-h-[600px] flex flex-col sticky top-0">
                    <div className="flex items-center gap-4 mb-10 px-2 mt-2">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-vibe-purple to-vibe-cyan flex items-center justify-center shadow-lg shadow-vibe-purple/20">
                            <Settings className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white leading-none">Settings</h2>
                            <p className="text-xs text-gray-500 mt-1">v1.2.0-beta</p>
                        </div>
                    </div>

                    <div className="space-y-3 flex-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setSubTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 text-left relative overflow-hidden group",
                                    subTab === tab.id
                                        ? "bg-[#1a1a24] text-white shadow-inner"
                                        : "text-gray-500 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {subTab === tab.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-vibe-purple rounded-r-full" />}
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-lg",
                                    subTab === tab.id ? "bg-vibe-purple text-white shadow-vibe-purple/20" : "bg-white/5 group-hover:bg-white/10"
                                )}>
                                    <tab.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <span className="font-bold block text-sm">{tab.label}</span>
                                </div>
                                {subTab === tab.id && <div className="text-vibe-purple"><div className="w-1.5 h-1.5 rounded-full bg-vibe-purple animate-pulse" /></div>}
                            </button>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-white/10 mt-4">
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition group border border-transparent hover:border-red-500/20"
                        >
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition">
                                <LogOut className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-sm">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="col-span-12 md:col-span-8 lg:col-span-9 bg-[#0c0c14] border border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-y-auto custom-scrollbar relative min-h-[800px]">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none select-none">
                    <Settings className="w-[400px] h-[400px] text-white" />
                </div>
                <div className="relative z-10 h-full">
                    {renderSection()}
                </div>
            </div>
        </motion.div>
    );
};
