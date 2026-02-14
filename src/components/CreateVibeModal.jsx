import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Code, Music, Gamepad, MapPin, Clock, Calendar } from 'lucide-react';
import { cn } from '../utils/constants';

export const CreateVibeModal = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [type, setType] = useState('study');
    const [isMajor, setIsMajor] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState('');

    const locationCoords = {
        'Academic Block': { x: 250, y: 320 },
        'Library': { x: 650, y: 450 },
        'Sports Area': { x: 950, y: 250 },
        'Ganga Gym': { x: 900, y: 620 },
        'Flag Park': { x: 250, y: 650 }
    };

    if (!isOpen) return null;

    const handleCreate = () => {
        if (name && desc) {
            const coords = locationCoords[selectedLocation] || { x: 600, y: 450 };
            onCreate({
                title: name,
                description: desc,
                type,
                is_major: isMajor,
                location_name: selectedLocation || 'Campus',
                start_time: new Date().toISOString(),
                coords
            });
            setName('');
            setDesc('');
            setType('study');
            setIsMajor(false);
            setSelectedLocation('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-lg" role="dialog" aria-modal="true" aria-label="Create new vibe" onKeyDown={(e) => e.key === 'Escape' && onClose()}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-lg bg-[#0e0e14] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-vibe-purple/20 to-transparent blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-vibe-cyan/10 to-transparent blur-3xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-white tracking-tight">Launch Vibe</h2>
                            <p className="text-gray-400 text-sm mt-1">Start something new on campus.</p>
                        </div>
                        <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition text-gray-400 hover:text-white border border-white/5">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Event Title</label>
                                <input
                                    value={name} onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-[#15151a] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-gray-600 outline-none focus:border-vibe-purple transition font-medium"
                                    placeholder="e.g. Midnight Hackathon"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2 col-span-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">The Vibe (Description)</label>
                                <textarea
                                    value={desc} onChange={(e) => setDesc(e.target.value)}
                                    className="w-full bg-[#15151a] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder-gray-600 outline-none focus:border-vibe-purple transition font-medium resize-none"
                                    placeholder="Who's invited? What's happening?"
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <select
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        className="w-full bg-[#15151a] border border-white/5 rounded-2xl pl-11 pr-4 py-3.5 text-white outline-none focus:border-vibe-purple transition appearance-none cursor-pointer text-sm font-medium"
                                    >
                                        <option value="" className="text-gray-500">Select spot...</option>
                                        {Object.keys(locationCoords).map(loc => (
                                            <option key={loc} value={loc} className="bg-[#0e0e14]">{loc}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Category</label>
                                <div className="flex gap-2">
                                    {[
                                        { id: 'study', icon: Zap },
                                        { id: 'social', icon: Music },
                                        { id: 'gaming', icon: Gamepad },
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setType(t.id)}
                                            className={cn(
                                                "flex-1 rounded-2xl border transition flex items-center justify-center p-3.5",
                                                type === t.id
                                                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                                    : "bg-[#15151a] border-white/5 text-gray-500 hover:text-white"
                                            )}
                                        >
                                            <t.icon className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsMajor(!isMajor)}
                            className={cn(
                                "w-full p-4 rounded-2xl border flex items-center justify-between transition group relative overflow-hidden",
                                isMajor
                                    ? "bg-amber-500/10 border-amber-500/40"
                                    : "bg-[#15151a] border-white/5"
                            )}
                        >
                            {isMajor && <div className="absolute inset-0 bg-amber-500/5 animate-pulse" />}
                            <div className="flex items-center gap-3 relative z-10">
                                <div className={cn(
                                    "p-2 rounded-xl transition-colors",
                                    isMajor ? "bg-amber-500 text-black" : "bg-white/5 text-gray-500"
                                )}>
                                    <Zap className={cn("w-5 h-5", isMajor && "fill-black")} />
                                </div>
                                <div className="text-left">
                                    <p className={cn("text-sm font-bold", isMajor ? "text-amber-500" : "text-gray-300")}>Major Campus Event</p>
                                    <p className="text-[10px] text-gray-500">Boosts visibility on the map</p>
                                </div>
                            </div>
                            <div className={cn(
                                "w-12 h-7 rounded-full relative transition-colors duration-300 border",
                                isMajor ? "bg-amber-500 border-amber-500" : "bg-transparent border-white/10"
                            )}>
                                <div className={cn(
                                    "absolute top-1 w-4.5 h-4.5 rounded-full transition-all duration-300 shadow-sm",
                                    isMajor ? "right-1 bg-black" : "left-1 bg-gray-500"
                                )} />
                            </div>
                        </button>
                    </div>

                    <button
                        onClick={handleCreate}
                        disabled={!name || !desc}
                        className={cn(
                            "w-full mt-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300",
                            name && desc
                                ? "bg-gradient-to-r from-vibe-purple to-vibe-cyan text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(139,92,246,0.4)]"
                                : "bg-white/5 text-gray-500 cursor-not-allowed"
                        )}
                    >
                        <Zap className="w-5 h-5" />
                        Push Vibe Live
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
