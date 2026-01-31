import React from 'react';
import { motion } from 'framer-motion';
import { cn, CARD_STYLE } from '../utils/constants';
import { BentoMap } from './BentoMap';

export const FullMapView = ({ locations, events, selected, onSelect }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn("h-[800px]", CARD_STYLE, "p-0")}>
        <BentoMap locations={locations} events={events} selected={selected} onSelect={onSelect} fullScreen={true} />
        <div className="absolute top-6 left-6 p-6 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 max-w-sm">
            <h2 className="text-2xl font-bold font-display mb-2">Campus Map</h2>
            <p className="text-gray-400 text-sm">Real-time occupancy and event tracking across the entire campus network.</p>
            <div className="mt-4 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-vibe-purple/20 text-vibe-purple text-xs font-bold">Study</span>
                <span className="px-3 py-1 rounded-full bg-vibe-cyan/20 text-vibe-cyan text-xs font-bold">Food</span>
                <span className="px-3 py-1 rounded-full bg-vibe-rose/20 text-vibe-rose text-xs font-bold">Gym</span>
            </div>
        </div>
    </motion.div>
);
