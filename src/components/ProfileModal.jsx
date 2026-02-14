import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Star, Zap, Target, Award, Calendar, Clock, Flame, Users, Moon, MapPin, Check } from 'lucide-react';
import { cn, YEAR_OPTIONS, INTEREST_OPTIONS } from '../utils/constants';

// Mock Achievement Data
const ACHIEVEMENTS = [
    { id: 1, title: 'Early Adopter', icon: Star, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', desc: 'Joined during the beta phase.' },
    { id: 2, title: 'Vibe Master', icon: Zap, color: 'text-vibe-purple', bg: 'bg-vibe-purple/10', border: 'border-vibe-purple/20', desc: 'Hosted 5 successful vibes.' },
    { id: 3, title: 'Social Butterfly', icon: Users, color: 'text-vibe-cyan', bg: 'bg-vibe-cyan/10', border: 'border-vibe-cyan/20', desc: 'Connected with 50 people.' },
    { id: 4, title: 'Night Owl', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20', desc: 'Active after midnight 10 times.' },
    { id: 5, title: 'Check-in Champ', icon: MapPin, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', desc: 'Checked in to 20 locations.' },
    { id: 6, title: 'Streak Keeper', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', desc: 'Maintained a 7-day streak.' },
];


export const ProfileModal = ({ isOpen, onClose, currentUser, onSave }) => {
    const [fullName, setFullName] = useState(currentUser?.full_name || currentUser?.fullName || '');
    const [yearOfStudy, setYearOfStudy] = useState(currentUser?.year_of_study || '');
    const [interests, setInterests] = useState(currentUser?.tags || currentUser?.interests || []);
    const [freeTime, setFreeTime] = useState(currentUser?.free_time || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('profile'); // profile, achievements, edit

    useEffect(() => {
        if (!isOpen) return;
        setFullName(currentUser?.full_name || currentUser?.fullName || '');
        setYearOfStudy(currentUser?.year_of_study || '');
        setInterests(currentUser?.tags || currentUser?.interests || []);
        setFreeTime(currentUser?.free_time || '');
        setError('');
        setViewMode('profile');
    }, [isOpen, currentUser]);

    if (!isOpen) return null;

    const toggleInterest = (label) => {
        setInterests((prev) =>
            prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
        );
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError('');
        try {
            await onSave({
                full_name: fullName,
                year_of_study: yearOfStudy,
                interests,
                free_time: freeTime
            });
            setViewMode('profile'); // Go back to profile view after save
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const NavButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setViewMode(id)}
            className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm",
                viewMode === id
                    ? "bg-card-hover text-foreground shadow-inner"
                    : "text-foreground-muted hover:text-foreground hover:bg-card-hover"
            )}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-2xl obsidian-card rounded-[2.5rem] border border-border overflow-hidden shadow-2xl relative"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-card/20 hover:bg-card-hover text-foreground-muted hover:text-foreground transition z-20"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Hero / Header BG */}
                <div className="h-32 bg-gradient-to-r from-vibe-purple/20 via-background/50 to-vibe-cyan/20 relative">
                    <div className="absolute inset-0 bg-background/40 backdrop-blur-3xl" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                </div>

                <div className="px-8 pb-8 -mt-12 relative z-10">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-24 h-24 rounded-[2rem] p-1 bg-card border border-border">
                                <img
                                    src={currentUser?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser?.username || 'guest'}`}
                                    alt="User"
                                    className="w-full h-full rounded-[1.8rem] object-cover bg-background"
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-card flex items-center justify-center border border-border">
                                <div className="w-2 h-2 rounded-full bg-vibe-green animate-pulse shadow-[0_0_10px_#4ade80]" />
                            </div>
                        </div>

                        {/* Name & Stats */}
                        <div className="flex-1">
                            <h2 className="text-3xl font-display font-bold text-foreground tracking-tight">{fullName || currentUser?.username || 'User'}</h2>
                            <p className="text-vibe-purple font-medium text-sm">@{currentUser?.username || 'username'} • {yearOfStudy || 'Student'}</p>
                        </div>


                    </div>

                    {/* Navigation */}
                    <div className="flex p-1 bg-card/40 rounded-2xl border border-border mb-6">
                        <NavButton id="profile" label="Profile" icon={Users} />
                        <NavButton id="achievements" label="Achievements" icon={Award} />
                        <NavButton id="edit" label="Edit Info" icon={Target} />
                    </div>

                    {/* Content Area */}
                    <div className="min-h-[300px]">
                        <AnimatePresence mode="wait">
                            {viewMode === 'profile' && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    <div className="obsidian-card p-5 rounded-3xl border border-border space-y-4">
                                        <h4 className="text-sm font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-2">
                                            <Star className="w-4 h-4 text-vibe-cyan" /> Interests
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {interests.length ? interests.map((label) => (
                                                <span key={label} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-card border border-border text-foreground-muted">
                                                    {label}
                                                </span>
                                            )) : (
                                                <span className="text-xs text-gray-600 italic">No interests added yet.</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="obsidian-card p-5 rounded-3xl border border-white/5 space-y-4">
                                        <h4 className="text-sm font-bold text-foreground-muted uppercase tracking-wider flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-vibe-purple" /> Free Time
                                        </h4>
                                        <p className="text-lg font-medium text-foreground">{freeTime || 'Not set'}</p>
                                    </div>


                                </motion.div>
                            )}

                            {viewMode === 'achievements' && (
                                <motion.div
                                    key="achievements"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
                                >
                                    {ACHIEVEMENTS.map((ach) => (
                                        <div key={ach.id} className={cn("p-4 rounded-2xl border flex items-start gap-4 hover:bg-card-hover transition group", ach.bg, ach.border)}>
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-card/20", ach.color)}>
                                                <ach.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className={cn("text-sm font-bold mb-1 group-hover:text-foreground transition-colors", ach.color)}>{ach.title}</h4>
                                                <p className="text-xs text-foreground-muted leading-relaxed">{ach.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {viewMode === 'edit' && (
                                <motion.div
                                    key="edit"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-4"
                                >
                                    <div className="bg-card/5 p-4 rounded-3xl border border-border space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-foreground-muted uppercase ml-1">Full Name</label>
                                            <input
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full mt-1 bg-card/40 border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-vibe-purple transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-foreground-muted uppercase ml-1">Year of Study</label>
                                            <select
                                                value={yearOfStudy}
                                                onChange={(e) => setYearOfStudy(e.target.value)}
                                                className="w-full mt-1 bg-card/40 border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-vibe-purple transition-colors"
                                            >
                                                <option value="" className="bg-background">Select Year</option>
                                                {YEAR_OPTIONS.map(y => <option key={y} value={y} className="bg-background">{y}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-foreground-muted uppercase ml-1">Usual Free Time</label>
                                            <input
                                                value={freeTime}
                                                onChange={(e) => setFreeTime(e.target.value)}
                                                placeholder="e.g. Weekdays After 6 PM"
                                                className="w-full mt-1 bg-card/40 border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-vibe-purple transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-card/5 p-4 rounded-3xl border border-border">
                                        <label className="text-xs font-bold text-foreground-muted uppercase ml-1 mb-3 block">My Tribes & Interests</label>
                                        <div className="flex flex-wrap gap-2">
                                            {INTEREST_OPTIONS.map((opt) => {
                                                const isSelected = interests.includes(opt);
                                                return (
                                                    <button
                                                        key={opt}
                                                        onClick={() => toggleInterest(opt)}
                                                        className={cn(
                                                            "px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5",
                                                            isSelected
                                                                ? "bg-vibe-purple/20 border-vibe-purple text-vibe-purple shadow-[0_0_10px_rgba(124,58,237,0.3)] scale-105"
                                                                : "bg-card/40 border-border text-foreground-muted hover:bg-card-hover hover:text-foreground"
                                                        )}
                                                    >
                                                        {isSelected && <Check className="w-3 h-3" />}
                                                        {opt}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={handleSubmit}
                                            disabled={saving}
                                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-vibe-purple to-vibe-cyan text-white font-bold shadow-lg shadow-vibe-purple/20 hover:scale-105 transition-transform"
                                        >
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </motion.div>
        </div>
    );
};
