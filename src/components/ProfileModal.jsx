import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn, YEAR_OPTIONS, INTEREST_OPTIONS } from '../utils/constants';

export const ProfileModal = ({ isOpen, onClose, currentUser, onSave }) => {
    const [fullName, setFullName] = useState(currentUser?.full_name || currentUser?.fullName || '');
    const [yearOfStudy, setYearOfStudy] = useState(currentUser?.year_of_study || '');
    const [interests, setInterests] = useState(currentUser?.interests || []);
    const [freeTime, setFreeTime] = useState(currentUser?.free_time || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('flashcard');

    useEffect(() => {
        if (!isOpen) return;
        setFullName(currentUser?.full_name || currentUser?.fullName || '');
        setYearOfStudy(currentUser?.year_of_study || '');
        setInterests(currentUser?.interests || []);
        setFreeTime(currentUser?.free_time || '');
        setError('');
        setViewMode('flashcard');
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
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-xl glass-card rounded-[2.5rem] p-8 border border-white/10"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-display font-bold text-white">Your Profile</h3>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
                            <button
                                onClick={() => setViewMode('edit')}
                                className={cn(
                                    "px-3 py-1 text-xs rounded-lg transition",
                                    viewMode === 'edit' ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
                                )}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => setViewMode('flashcard')}
                                className={cn(
                                    "px-3 py-1 text-xs rounded-lg transition",
                                    viewMode === 'flashcard' ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
                                )}
                            >
                                Flashcard
                            </button>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-vibe-rose/10 text-vibe-rose text-sm border border-vibe-rose/30">
                        {error}
                    </div>
                )}

                {viewMode === 'flashcard' ? (
                    <div className="rounded-[2rem] p-6 bg-gradient-to-br from-violet-600/40 via-[#0B0B14]/70 to-white/10 border border-white/15 shadow-[0_0_40px_rgba(124,58,237,0.25)]">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                                <img
                                    src={currentUser?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser?.username || currentUser?.email || 'guest'}`}
                                    alt="User"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <p className="text-xl font-semibold text-white">{fullName || currentUser?.username || 'Your Name'}</p>
                                <p className="text-xs text-gray-400">{yearOfStudy || 'Year not set'}</p>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-[11px] text-gray-400">Interests</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {interests.length ? interests.map((label) => (
                                        <span key={label} className="px-2.5 py-1 rounded-full text-[10px] bg-vibe-purple/20 text-vibe-purple border border-vibe-purple/40">
                                            {label}
                                        </span>
                                    )) : (
                                        <span className="text-xs text-gray-500">No interests yet</span>
                                    )}
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <p className="text-[11px] text-gray-400">Usually free at</p>
                                <p className="mt-2 text-sm text-white">{freeTime || 'Not set'}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm text-gray-400">Name</label>
                            <input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="mt-2 w-full bg-white/5 rounded-xl px-4 py-3 text-white outline-none border border-white/10 focus:border-vibe-purple"
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-400">Year of study</label>
                            <select
                                value={yearOfStudy}
                                onChange={(e) => setYearOfStudy(e.target.value)}
                                className="mt-2 w-full bg-white/5 rounded-xl px-4 py-3 text-white outline-none border border-white/10 focus:border-vibe-purple"
                            >
                                <option value="" className="bg-[#0A0A0F]">Select year</option>
                                {YEAR_OPTIONS.map((y) => (
                                    <option key={y} value={y} className="bg-[#0A0A0F]">{y}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400">Interests</label>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {INTEREST_OPTIONS.map((label) => {
                                    const active = interests.includes(label);
                                    return (
                                        <button
                                            key={label}
                                            onClick={() => toggleInterest(label)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-xs font-medium border transition",
                                                active
                                                    ? "bg-vibe-purple/20 text-vibe-purple border-vibe-purple/40"
                                                    : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:border-white/20"
                                            )}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400">Usually free at</label>
                            <input
                                value={freeTime}
                                onChange={(e) => setFreeTime(e.target.value)}
                                className="mt-2 w-full bg-white/5 rounded-xl px-4 py-3 text-white outline-none border border-white/10 focus:border-vibe-purple"
                                placeholder="e.g. Weekdays 6–8 PM"
                            />
                        </div>
                    </div>
                )}

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10">Close</button>
                    {viewMode === 'edit' && (
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-vibe-purple to-vibe-cyan text-white font-semibold shadow-lg shadow-vibe-purple/30 disabled:opacity-60"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
