import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Code, Music, Gamepad } from 'lucide-react';
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
        'Cafeteria': { x: 950, y: 250 },
        'Ganga Gym': { x: 900, y: 620 },
        'Flag Park': { x: 250, y: 650 }
    };

    if (!isOpen) return null;

    const handleCreate = () => {
        if (name && desc) {
            const coords = locationCoords[selectedLocation] || { x: 600, y: 450 };
            onCreate({
                name,
                desc,
                type,
                isMajor,
                locationName: selectedLocation || 'Campus',
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-md bg-[#0A0A0F] border border-white/10 rounded-3xl p-8"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-display font-bold">Create a Vibe</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-400 block mb-2">Vibe Name</label>
                        <input
                            value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-vibe-purple transition"
                            placeholder="e.g. Late Night Calc"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 block mb-2">Description</label>
                        <input
                            value={desc} onChange={(e) => setDesc(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-vibe-purple transition"
                            placeholder="Who's invited?"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 block mb-2">Location</label>
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-vibe-purple transition text-white"
                        >
                            <option value="">Select a location...</option>
                            {Object.keys(locationCoords).map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'study', label: 'Study', icon: Zap, color: 'text-vibe-purple' },
                            { id: 'social', label: 'Social', icon: Music, color: 'text-vibe-cyan' },
                            { id: 'gaming', label: 'Gaming', icon: Gamepad, color: 'text-vibe-rose' },
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setType(t.id)}
                                className={cn(
                                    "p-3 rounded-xl border transition flex flex-col items-center gap-1",
                                    type === t.id ? "bg-white/10 border-white/30" : "bg-white/5 border-white/5 opacity-50"
                                )}
                            >
                                <t.icon className={cn("w-5 h-5", t.color)} />
                                <span className="text-[10px] uppercase font-bold">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setIsMajor(!isMajor)}
                        className={cn(
                            "w-full p-3 rounded-xl border flex items-center justify-between transition",
                            isMajor ? "bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]" : "bg-white/5 border-white/5 text-gray-500"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Zap className={cn("w-4 h-4", isMajor ? "fill-amber-500" : "")} />
                            <span className="text-xs font-bold uppercase tracking-wider">Major Event</span>
                        </div>
                        <div className={cn("w-10 h-5 rounded-full relative transition-colors", isMajor ? "bg-amber-500" : "bg-white/10")}>
                            <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", isMajor ? "left-6" : "left-1")} />
                        </div>
                    </button>
                </div>

                <button
                    onClick={handleCreate}
                    className="w-full mt-8 py-4 bg-gradient-to-r from-vibe-purple to-vibe-cyan rounded-2xl font-bold hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all"
                >
                    Push Vibe ⚡
                </button>
            </motion.div>
        </div>
    );
};
