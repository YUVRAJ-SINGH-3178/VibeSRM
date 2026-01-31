import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { cn } from '../utils/constants';

export const Toast = ({ message, type = 'success', onClose }) => (
    <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 glass-card rounded-2xl shadow-2xl"
    >
        <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            type === 'success' ? "bg-green-500/20" : type === 'error' ? "bg-vibe-rose/20" : "bg-vibe-cyan/20"
        )}>
            {type === 'success' ? <CheckCircle className="text-green-400 w-4 h-4" /> :
                type === 'error' ? <AlertCircle className="text-vibe-rose w-4 h-4" /> :
                    <Zap className="text-vibe-cyan w-4 h-4" />}
        </div>
        <span className="font-medium text-white">{message}</span>
    </motion.div>
);
