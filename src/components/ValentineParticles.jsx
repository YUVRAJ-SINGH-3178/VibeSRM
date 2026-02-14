import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

const random = (min, max) => Math.random() * (max - min) + min;

export const ValentineParticles = () => {
    const [hearts, setHearts] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const id = Math.random();
            const newHeart = {
                id,
                x: random(0, 100), // percent
                size: random(10, 30),
                duration: random(4, 8),
                delay: random(0, 2),
                color: Math.random() > 0.6 ? '#e11d48' : Math.random() > 0.3 ? '#f43f5e' : '#fda4af'
            };

            setHearts(prev => [...prev.slice(-15), newHeart]); // Keep max 15 hearts at once
        }, 800);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <AnimatePresence>
                {hearts.map(h => (
                    <motion.div
                        key={h.id}
                        initial={{ y: '110vh', x: `${h.x}vw`, opacity: 0, scale: 0 }}
                        animate={{
                            y: '-10vh',
                            opacity: [0, 1, 1, 0],
                            scale: [0.5, 1, 0.8],
                            rotate: random(-45, 45)
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: h.duration,
                            ease: "linear",
                            delay: h.delay
                        }}
                        className="absolute"
                    >
                        <Heart
                            size={h.size}
                            fill={h.color}
                            color={h.color}
                            style={{ filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))' }}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
