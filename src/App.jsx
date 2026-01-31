import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map as MapIcon,
  Grid,
  Users,
  Zap,
  Search,
  Bell,
  Navigation,
  MessageSquare,
  Award,
  X,
  Plus,
  CheckCircle,
  AlertCircle,
  Send,
  MoreVertical,
  Phone,
  Video,
  LogIn,
  LogOut,
  User as UserIcon,
  Ghost,
  BarChart3,
  Settings
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api, { auth, locations as locationsApi, checkins, user, social, ghost, events } from './api.js';

// --- Utilities ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Map backend data to frontend format
const mapLocation = (loc) => ({
  id: loc.id,
  name: loc.name,
  type: loc.type,
  occupancy: loc.occupancyPercent || Math.round((loc.currentOccupancy / loc.capacity) * 100),
  capacity: loc.capacity,
  desc: loc.description || `${loc.activeUsers || 0} people studying`,
  coords: {
    x: loc.mapX || (100 + Math.random() * 800),
    y: loc.mapY || (100 + Math.random() * 600)
  },
  color: loc.occupancyPercent > 70 ? 'text-vibe-rose' : loc.occupancyPercent > 30 ? 'text-amber-400' : 'text-vibe-cyan',
  amenities: loc.amenities,
  avgNoise: loc.avgNoise,
  photoUrl: loc.photoUrl
});

// Fallback data (for offline/demo mode)
const INITIAL_LOCATIONS = [
  { id: '1', name: 'Tech Park Library', type: 'library', occupancy: 78, capacity: 500, desc: 'Quiet Zone • Level 3', coords: { x: 250, y: 180 }, color: 'text-vibe-cyan' },
  { id: '2', name: 'Java Lounge', type: 'cafe', occupancy: 42, capacity: 150, desc: 'Fresh Brews • Fast WiFi', coords: { x: 550, y: 400 }, color: 'text-amber-400' },
  { id: '3', name: 'Spartan Gym', type: 'gym', occupancy: 15, capacity: 200, desc: 'Empty • Cardio Deck', coords: { x: 180, y: 550 }, color: 'text-vibe-rose' },
  { id: '4', name: 'Innovation Hub', type: 'study', occupancy: 92, capacity: 80, desc: 'Hackathon in progress', coords: { x: 750, y: 300 }, color: 'text-vibe-purple' },
];

const FORECAST = [50, 75, 90, 60, 45, 30, 80];

const CHATS = [
  { id: 1, name: "Study Group A", msg: "Anyone at the library?", time: "2m", active: true },
  { id: 2, name: "Gym Bros", msg: "Leg day lets gooo", time: "1h", active: false },
  { id: 3, name: "Campus Events", msg: "Hackathon starts in 10!", time: "3h", active: true },
];

// --- Styles ---
const CARD_STYLE = "relative overflow-hidden bg-[#0A0A0F] bg-opacity-80 backdrop-blur-2xl border border-white/5 rounded-[2rem] transition-all duration-500 hover:border-white/10 hover:shadow-[0_0_50px_-12px_rgba(124,58,237,0.25)] hover:-translate-y-1 group";
const NAV_ITEM_STYLE = "relative p-4 rounded-2xl text-gray-400 transition-all duration-300 hover:text-white hover:bg-white/5";
const NAV_ITEM_ACTIVE = "text-white bg-white/10 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]";

// --- Auth Modal Component ---
const AuthModal = ({ isOpen, onClose, onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let data;
      if (isLogin) {
        data = await auth.login(email, password);
      } else {
        data = await auth.register(email, password, username, fullName);
      }
      onAuth(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          <h2 className="text-2xl font-display font-bold">{isLogin ? 'Welcome Back' : 'Join VibeSRM'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-vibe-rose/20 border border-vibe-rose/50 rounded-xl text-sm text-vibe-rose">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Username</label>
                <input
                  value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-vibe-purple transition"
                  placeholder="coolstudent123"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Full Name</label>
                <input
                  value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-vibe-purple transition"
                  placeholder="Your Name"
                />
              </div>
            </>
          )}
          <div>
            <label className="text-sm text-gray-400 block mb-2">Email</label>
            <input
              type="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-vibe-purple transition"
              placeholder="you@srm.edu.in"
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">Password</label>
            <input
              type="password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-vibe-purple transition"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-vibe-purple rounded-xl font-bold mt-4 hover:bg-vibe-purple/80 transition disabled:opacity-50"
          >
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-4 text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-vibe-purple hover:underline">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

// --- Components ---

const Toast = ({ message, type = 'success', onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 bg-[#0A0A0F] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl"
  >
    {type === 'success' ? <CheckCircle className="text-green-400 w-5 h-5" /> : <AlertCircle className="text-vibe-rose w-5 h-5" />}
    <span className="font-medium text-white">{message}</span>
  </motion.div>
);

const NavBar = ({ active, setTab }) => (
  <nav className="fixed left-0 top-0 h-full w-24 hidden lg:flex flex-col items-center py-10 z-50 border-r border-white/5 bg-[#050507]/50 backdrop-blur-xl">
    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-16 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
      <Zap className="text-black w-6 h-6 fill-black" />
    </div>
    <div className="flex flex-col gap-10">
      {[Grid, MapIcon, Users, MessageSquare].map((Icon, i) => {
        const id = ['dashboard', 'map', 'social', 'chat'][i];
        return (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              NAV_ITEM_STYLE,
              "group",
              active === id ? NAV_ITEM_ACTIVE : ""
            )}
          >
            <Icon className="w-6 h-6" />
            {active === id && (
              <motion.div
                layoutId="nav-glow"
                className="absolute inset-0 bg-white/10 rounded-2xl -z-10 blur-xl"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        )
      })}
    </div>
    <div className="mt-auto">
      <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden hover:border-white transition-colors cursor-pointer">
        <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
      </div>
    </div>
  </nav>
);

const BentoMap = ({ locations, events, selected, onSelect, fullScreen = false }) => (
  <div className={cn("w-full h-full relative overflow-hidden rounded-[2rem]", fullScreen ? "rounded-none" : "")}>
    {/* Premium Gradient Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#0a0118] via-[#1a0f2e] to-[#0d0520]" />

    {/* Subtle Grid Pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }} />
    </div>

    {/* Glowing Ambient Light */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-vibe-purple/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-vibe-cyan/10 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-vibe-rose/5 rounded-full blur-[120px]" />
    </div>

    {/* Interactive Campus Map */}
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <div className="relative w-full max-w-5xl aspect-[4/3]">
        {/* Campus Buildings - Isometric Style */}
        <svg className="w-full h-full" viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid meet">
          <defs>
            {/* Glow Filters */}
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="strongGlow">
              <feGaussianBlur stdDeviation="8" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Building Gradients */}
            <linearGradient id="purpleBuild" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#7c3aed', stopOpacity: 0.3 }} />
            </linearGradient>
            <linearGradient id="cyanBuild" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#22d3ee', stopOpacity: 0.9 }} />
              <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 0.4 }} />
            </linearGradient>
            <linearGradient id="amberBuild" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#fbbf24', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#f59e0b', stopOpacity: 0.3 }} />
            </linearGradient>
            <linearGradient id="roseBuild" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#fb7185', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#f43f5e', stopOpacity: 0.3 }} />
            </linearGradient>
          </defs>

          {/* Campus Ground */}
          <rect x="50" y="50" width="1100" height="800" fill="rgba(15,10,30,0.4)" stroke="rgba(124,58,237,0.2)" strokeWidth="2" rx="20" />

          {/* Pathways with Animation */}
          <g opacity="0.4">
            <path d="M 200 450 Q 400 400 600 450 T 1000 450" stroke="url(#purpleBuild)" strokeWidth="6" fill="none" strokeDasharray="12,8" filter="url(#softGlow)">
              <animate attributeName="stroke-dashoffset" from="0" to="20" dur="2s" repeatCount="indefinite" />
            </path>
            <path d="M 600 200 L 600 700" stroke="url(#cyanBuild)" strokeWidth="6" fill="none" strokeDasharray="12,8" filter="url(#softGlow)">
              <animate attributeName="stroke-dashoffset" from="0" to="20" dur="2s" repeatCount="indefinite" />
            </path>
            <path d="M 200 300 L 1000 300" stroke="rgba(124,58,237,0.3)" strokeWidth="4" fill="none" strokeDasharray="8,6">
              <animate attributeName="stroke-dashoffset" from="0" to="14" dur="1.5s" repeatCount="indefinite" />
            </path>
          </g>

          {/* Academic Block 1 - Isometric */}
          <g filter="url(#softGlow)">
            <path d="M 150 250 L 250 200 L 350 250 L 350 400 L 250 450 L 150 400 Z" fill="url(#purpleBuild)" stroke="#a855f7" strokeWidth="3" opacity="0.9" />
            <path d="M 250 200 L 350 250 L 350 400 L 250 350 Z" fill="rgba(124,58,237,0.4)" />
            <path d="M 150 250 L 250 200 L 250 350 L 150 400 Z" fill="rgba(124,58,237,0.6)" />
            <circle cx="250" cy="325" r="40" fill="rgba(168,85,247,0.2)" stroke="#a855f7" strokeWidth="2" />
            <text x="250" y="335" fill="#e9d5ff" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="system-ui">ACADEMIC</text>
          </g>

          {/* Library - Main Building (Larger, Central) */}
          <g filter="url(#strongGlow)">
            <path d="M 500 350 L 650 280 L 800 350 L 800 550 L 650 620 L 500 550 Z" fill="url(#cyanBuild)" stroke="#22d3ee" strokeWidth="4" opacity="0.95" />
            <path d="M 650 280 L 800 350 L 800 550 L 650 480 Z" fill="rgba(6,182,212,0.5)" />
            <path d="M 500 350 L 650 280 L 650 480 L 500 550 Z" fill="rgba(6,182,212,0.7)" />
            <circle cx="650" cy="465" r="60" fill="rgba(34,211,238,0.15)" stroke="#22d3ee" strokeWidth="3" />
            <text x="650" y="460" fill="#cffafe" fontSize="24" fontWeight="bold" textAnchor="middle" fontFamily="system-ui">LIBRARY</text>
            <text x="650" y="485" fill="#67e8f9" fontSize="14" textAnchor="middle" fontFamily="system-ui">Central Hub</text>
          </g>

          {/* Cafeteria */}
          <g filter="url(#softGlow)">
            <path d="M 850 200 L 950 160 L 1050 200 L 1050 320 L 950 360 L 850 320 Z" fill="url(#amberBuild)" stroke="#fbbf24" strokeWidth="3" opacity="0.9" />
            <path d="M 950 160 L 1050 200 L 1050 320 L 950 280 Z" fill="rgba(251,191,36,0.4)" />
            <path d="M 850 200 L 950 160 L 950 280 L 850 320 Z" fill="rgba(251,191,36,0.6)" />
            <text x="950" y="250" fill="#fef3c7" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="system-ui">CAFETERIA</text>
          </g>

          {/* Sports Complex */}
          <g filter="url(#softGlow)">
            <ellipse cx="900" cy="650" rx="120" ry="80" fill="url(#roseBuild)" stroke="#fb7185" strokeWidth="3" opacity="0.9" />
            <ellipse cx="900" cy="640" rx="80" ry="50" fill="rgba(251,113,133,0.2)" stroke="#fb7185" strokeWidth="2" />
            <text x="900" y="655" fill="#fecdd3" fontSize="20" fontWeight="bold" textAnchor="middle" fontFamily="system-ui">SPORTS</text>
          </g>

          {/* Tech Park */}
          <g filter="url(#softGlow)">
            <path d="M 150 600 L 250 560 L 350 600 L 350 720 L 250 760 L 150 720 Z" fill="rgba(168,85,247,0.3)" stroke="#a78bfa" strokeWidth="3" opacity="0.85" />
            <path d="M 250 560 L 350 600 L 350 720 L 250 680 Z" fill="rgba(139,92,246,0.25)" />
            <path d="M 150 600 L 250 560 L 250 680 L 150 720 Z" fill="rgba(139,92,246,0.4)" />
            <text x="250" y="670" fill="#ddd6fe" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="system-ui">TECH PARK</text>
          </g>

          {/* Innovation Hub */}
          <g filter="url(#softGlow)">
            <rect x="850" y="450" width="180" height="140" rx="12" fill="rgba(16,185,129,0.25)" stroke="#10b981" strokeWidth="2" opacity="0.85" />
            <rect x="860" y="460" width="160" height="10" rx="5" fill="rgba(16,185,129,0.4)" />
            <text x="940" y="530" fill="#d1fae5" fontSize="16" fontWeight="bold" textAnchor="middle" fontFamily="system-ui">INNOVATION</text>
            <text x="940" y="550" fill="#6ee7b7" fontSize="12" textAnchor="middle" fontFamily="system-ui">Hub</text>
          </g>

          {/* Major Events - Special Markers */}
          {events?.filter(e => e.isMajor).map((event, idx) => (
            <g key={event._id || idx} className="cursor-pointer transition-all" onClick={() => onSelect({ ...event, id: event._id, type: 'event' })}>
              <circle cx={event.coords.x} cy={event.coords.y} r="45" fill="none" stroke="#f59e0b" className="animate-pulse" strokeWidth="2" opacity="0.6" />
              <circle cx={event.coords.x} cy={event.coords.y} r="25" fill="rgba(245,158,11,0.2)" stroke="#f59e0b" strokeWidth="3" filter="url(#softGlow)" />
              <Zap cx={event.coords.x} cy={event.coords.y} className="w-8 h-8 text-amber-400 -translate-x-4 -translate-y-4" />

              {/* Event Label */}
              <rect x={event.coords.x - 60} y={event.coords.y + 40} width="120" height="24" rx="12" fill="rgba(0,0,0,0.8)" stroke="#f59e0b" strokeWidth="1" />
              <text x={event.coords.x} y={event.coords.y + 56} fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">{event.title}</text>
            </g>
          ))}

          {/* Location Markers - Premium Style */}
          {locations.map((loc, idx) => {
            const isSelected = selected?.id === loc.id;
            const pulseDelay = idx * 0.2;

            return (
              <g key={loc.id} className="cursor-pointer transition-all" onClick={() => onSelect(loc)}>
                {/* Selection Pulse */}
                {isSelected && (
                  <>
                    <circle cx={loc.coords.x} cy={loc.coords.y} r="70" fill="none" stroke="currentColor" className={cn("animate-ping", loc.color)} strokeWidth="3" opacity="0.3" />
                    <circle cx={loc.coords.x} cy={loc.coords.y} r="50" fill="none" stroke="currentColor" className={cn(loc.color)} strokeWidth="2" opacity="0.5" />
                  </>
                )}

                {/* Marker Base */}
                <circle cx={loc.coords.x} cy={loc.coords.y} r="35" fill="rgba(0,0,0,0.6)" stroke="currentColor" className={cn(loc.color)} strokeWidth="3" filter="url(#softGlow)" />
                <circle cx={loc.coords.x} cy={loc.coords.y} r="25" className={cn("fill-current", loc.color)} opacity="0.9" />
                <circle cx={loc.coords.x} cy={loc.coords.y} r="15" fill="rgba(0,0,0,0.4)" />
                <circle cx={loc.coords.x} cy={loc.coords.y} r="8" fill="white" opacity="0.95" />

                {/* Occupancy Ring */}
                <circle
                  cx={loc.coords.x}
                  cy={loc.coords.y}
                  r="30"
                  fill="none"
                  stroke={loc.occupancy > 70 ? '#ef4444' : loc.occupancy > 40 ? '#f59e0b' : '#10b981'}
                  strokeWidth="4"
                  strokeDasharray={`${(loc.occupancy / 100) * 188} 188`}
                  transform={`rotate(-90 ${loc.coords.x} ${loc.coords.y})`}
                  opacity="0.8"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>

    {/* Floating Location Cards */}
    <div className="absolute inset-0 pointer-events-none">
      {locations.map((loc, idx) => {
        const isSelected = selected?.id === loc.id;
        if (!isSelected) return null;

        return (
          <motion.div
            key={loc.id}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          >
            <div className="bg-black/80 backdrop-blur-2xl border-2 border-white/20 rounded-3xl p-6 min-w-[320px] shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{loc.name}</h3>
                  <p className="text-sm text-gray-400">{loc.desc}</p>
                </div>
                <button onClick={() => onSelect(null)} className="p-2 hover:bg-white/10 rounded-full transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Occupancy</span>
                    <span className={cn("text-sm font-bold",
                      loc.occupancy > 70 ? "text-red-400" :
                        loc.occupancy > 40 ? "text-amber-400" : "text-green-400"
                    )}>{loc.occupancy}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all",
                        loc.occupancy > 70 ? "bg-red-500" :
                          loc.occupancy > 40 ? "bg-amber-500" : "bg-green-500"
                      )}
                      style={{ width: `${loc.occupancy}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-gray-400 text-xs mb-1">Capacity</div>
                  <div className="text-white font-bold">{loc.capacity}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <div className="text-gray-400 text-xs mb-1">Type</div>
                  <div className="text-white font-bold capitalize">{loc.type}</div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Floating Event Card */}
      {selected?.type === 'event' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
        >
          <div className="bg-[#f59e0b]/10 backdrop-blur-3xl border-2 border-[#f59e0b]/30 rounded-3xl p-6 min-w-[340px] shadow-[0_0_50px_-12px_rgba(245,158,11,0.5)]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-bold">EVENT</span>
                  <span className="text-xs text-amber-500/80 font-mono italic">#{selected.type}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{selected.title}</h3>
                <p className="text-sm text-gray-300 italic">📍 {selected.locationName}</p>
              </div>
              <button onClick={() => onSelect(null)} className="p-2 hover:bg-white/10 rounded-full transition">
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm text-gray-300">
                {selected.description}
              </div>

              <div className="flex justify-between items-center text-xs">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(j => <img key={j} className="w-8 h-8 rounded-full border-2 border-[#0A0A0F]" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${j + 10}`} />)}
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5">+24</div>
                </div>
                <button className="px-6 py-2 bg-amber-500 text-black font-bold rounded-xl hover:scale-105 transition shadow-lg shadow-amber-500/20">
                  Count Me In!
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>

    {/* Compact Legend */}
    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-xl rounded-2xl border border-white/10 px-4 py-3">
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-vibe-purple" />
          <span className="text-white/70">Academic</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-vibe-cyan" />
          <span className="text-white/70">Library</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-white/70">Dining</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-vibe-rose" />
          <span className="text-white/70">Sports</span>
        </div>
      </div>
    </div>

    {/* Compass */}
    <div className="absolute top-4 right-4 w-12 h-12 bg-black/70 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-center">
      <Navigation className="w-5 h-5 text-vibe-cyan" />
    </div>
  </div>
);

const CreateVibeModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('study');

  if (!isOpen) return null;

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
          <div className="grid grid-cols-3 gap-2">
            {['study', 'chill', 'event'].map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "py-2 rounded-xl text-sm font-bold capitalize transition",
                  type === t ? "bg-white text-black" : "bg-white/5 hover:bg-white/10"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (name && desc) {
                onCreate({ name, desc, type });
                onClose();
              }
            }}
            className="w-full py-4 bg-vibe-purple rounded-xl font-bold mt-4 hover:bg-vibe-purple/80 transition"
          >
            Launch Vibe 🚀
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- View Components ---

const DashboardView = ({ locations, events, selectedLoc, setSelectedLoc, joined, handleCheckIn, searchQuery, setSearchQuery, filteredLocations, addNotification }) => (
  <main className="grid grid-cols-1 md:grid-cols-12 grid-rows-8 md:grid-rows-6 gap-6 h-auto md:h-[800px]">
    {/* Map */}
    <motion.div className={cn("col-span-1 md:col-span-8 row-span-4 p-0", CARD_STYLE)} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <BentoMap locations={locations} events={events} selected={selectedLoc} onSelect={setSelectedLoc} />
      <AnimatePresence>
        {selectedLoc && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-6 left-6 p-6 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl w-80 shadow-2xl"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold font-display">{selectedLoc.name}</h3>
              <button onClick={() => setSelectedLoc(null)} className="p-1 hover:bg-white/10 rounded-full"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-gray-400 mb-4">{selectedLoc.desc}</p>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className={cn("h-full w-[0%] transition-all duration-1000", selectedLoc.color.replace('text', 'bg'))} style={{ width: `${selectedLoc.occupancy}%` }} />
              </div>
              <span className="text-xs font-bold">{selectedLoc.occupancy}%</span>
            </div>
            <button
              onClick={() => handleCheckIn(selectedLoc)}
              className={cn(
                "w-full py-3 font-bold rounded-xl transition",
                joined.has(selectedLoc.id)
                  ? "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
                  : "bg-white text-black hover:bg-gray-200"
              )}
            >
              {joined.has(selectedLoc.id) ? "Check Out" : "Check In"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>

    {/* Search & List */}
    <div className="col-span-1 md:col-span-4 row-span-4 flex flex-col gap-6">
      <div className={cn("p-4 flex items-center gap-4 text-gray-400 focus-within:text-white transition-colors", CARD_STYLE)}>
        <Search className="w-5 h-5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Find friends, food, vibes..."
          className="bg-transparent outline-none w-full placeholder:text-gray-600 font-medium"
        />
      </div>

      <div className={cn("flex-1 p-6 overflow-y-auto", CARD_STYLE)}>
        <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live Vibes
        </h3>
        <div className="space-y-4">
          {filteredLocations.length === 0 ? (
            <div className="text-center text-gray-500 py-10">No vibes found :(</div>
          ) : (
            filteredLocations.map(loc => (
              <div
                key={loc.id}
                onClick={() => setSelectedLoc(loc)}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition cursor-pointer group border border-transparent hover:border-white/5"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold flex items-center gap-2">
                    {loc.name}
                    {joined.has(loc.id) && <CheckCircle className="w-4 h-4 text-green-400" />}
                  </span>
                  <span className={cn("text-xs font-mono px-2 py-1 rounded bg-black/30", loc.occupancy > 80 ? 'text-red-400' : 'text-green-400')}>
                    {loc.occupancy}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors">{loc.desc}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>

    {/* Stats */}
    <div className={cn("col-span-1 md:col-span-4 row-span-2 p-6 flex flex-col justify-between", CARD_STYLE)}>
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-1">Weekly Streak</h3>
        <div className="text-4xl font-display font-bold">12hrs <span className="text-lg text-gray-500 font-normal">studying</span></div>
      </div>
      <div className="h-16 flex items-end gap-2">
        {FORECAST.map((h, i) => (
          <div key={i} className="flex-1 bg-white/10 rounded-t-sm hover:bg-vibe-purple transition flex items-end overflow-hidden group/bar h-full">
            <div className="w-full bg-white group-hover/bar:bg-white transition-all" style={{ height: `${h}%` }} />
          </div>
        ))}
      </div>
    </div>

    {/* Social */}
    <div className={cn("col-span-1 md:col-span-5 row-span-2 p-6 relative overflow-hidden", CARD_STYLE)}>
      <div className="absolute top-0 right-0 p-32 bg-vibe-cyan/10 blur-3xl rounded-full" />
      <h3 className="font-display font-bold text-xl mb-4">Study Buddies</h3>
      <div className="flex -space-x-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="w-12 h-12 rounded-full border-2 border-[#0A0A0F] bg-gray-800 relative hover:-translate-y-2 transition-transform cursor-pointer">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} className="w-full h-full object-cover" />
            {i === 2 && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0A0A0F] rounded-full" />}
          </div>
        ))}
        <div className="w-12 h-12 rounded-full border-2 border-[#0A0A0F] bg-white/10 flex items-center justify-center text-xs font-bold hover:bg-white/20 transition cursor-pointer">
          +5
        </div>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => addNotification("Pinging everyone! 🔔")}
          className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:scale-105 transition active:scale-95"
        >
          Ping All
        </button>
        <button
          onClick={() => addNotification("Scanning for new vibes... 📡", "info")}
          className="px-5 py-2.5 bg-white/5 border border-white/10 text-sm font-bold rounded-xl hover:bg-white/10 transition active:scale-95"
        >
          Find New
        </button>
      </div>
    </div>

    {/* Gamification */}
    <div className={cn("col-span-1 md:col-span-3 row-span-2 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-vibe-purple/20 transition-colors border-vibe-purple/0 hover:border-vibe-purple/50", CARD_STYLE)}>
      <div className="w-16 h-16 rounded-full bg-vibe-purple/20 flex items-center justify-center text-vibe-purple mb-4 group-hover:scale-110 transition-transform">
        <Award className="w-8 h-8" />
      </div>
      <div className="font-display font-bold text-2xl group-hover:text-white transition-colors">Level 12</div>
      <div className="text-gray-500 text-sm">Top 5% on VibeSRM</div>
    </div>
  </main>
);

const ChatView = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-[800px] flex gap-6">
    <div className={cn("w-1/3 flex flex-col", CARD_STYLE, "p-0")}>
      <div className="p-6 border-b border-white/5">
        <h2 className="text-2xl font-display font-bold">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {CHATS.map(chat => (
          <div key={chat.id} className="p-4 hover:bg-white/5 cursor-pointer border-b border-white/5 transition flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-vibe-purple/20 border border-white/10" />
              {chat.active && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-black" />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="font-bold">{chat.name}</span>
                <span className="text-xs text-gray-500">{chat.time}</span>
              </div>
              <p className="text-sm text-gray-400 truncate">{chat.msg}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className={cn("flex-1 flex flex-col", CARD_STYLE, "p-0")}>
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-vibe-purple" />
          <div>
            <h3 className="font-bold">Study Group A</h3>
            <span className="text-xs text-green-400">● Online</span>
          </div>
        </div>
        <div className="flex gap-2 text-gray-400">
          <Phone className="w-5 h-5 cursor-pointer hover:text-white" />
          <Video className="w-5 h-5 cursor-pointer hover:text-white" />
          <MoreVertical className="w-5 h-5 cursor-pointer hover:text-white" />
        </div>
      </div>
      <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
        <div className="self-start bg-white/5 p-4 rounded-2xl rounded-tl-none max-w-md">
          <p className="text-sm">Anyone at the library?</p>
          <span className="text-[10px] text-gray-500 mt-1 block">10:42 AM</span>
        </div>
        <div className="self-end bg-vibe-purple/20 p-4 rounded-2xl rounded-tr-none max-w-md">
          <p className="text-sm text-vibe-purple">Yeah, 3rd floor quiet zone!</p>
          <span className="text-[10px] text-vibe-purple/60 mt-1 block">10:45 AM</span>
        </div>
      </div>
      <div className="p-4 border-t border-white/5 flex gap-4">
        <input className="flex-1 bg-white/5 rounded-xl px-4 outline-none focus:bg-white/10 transition" placeholder="Type a message..." />
        <button className="p-3 bg-vibe-purple rounded-xl hover:bg-vibe-purple/80 transition"><Send className="w-5 h-5" /></button>
      </div>
    </div>
  </motion.div>
);

const SocialView = ({ events }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[800px] grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className={cn("col-span-2 p-8", CARD_STYLE)}>
      <h2 className="text-3xl font-display font-bold mb-6">Your Squad</h2>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition cursor-pointer">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} className="w-14 h-14 rounded-full border-2 border-white/10" />
            <div>
              <h4 className="font-bold">User {i}</h4>
              <p className="text-xs text-gray-400"> studying at Library</p>
            </div>
            <button className="ml-auto px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:scale-105 transition">Wave 👋</button>
          </div>
        ))}
      </div>
    </div>
    <div className={cn("p-8 overflow-y-auto", CARD_STYLE)}>
      <h2 className="text-xl font-display font-bold mb-6">Campus Events</h2>
      <div className="space-y-4">
        {events?.map((event, i) => (
          <div key={event._id || i} className="p-4 rounded-xl border border-white/10 hover:border-vibe-purple/50 transition cursor-pointer group bg-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">{event.title}</span>
              <span className={cn("text-[10px] px-2 py-1 rounded",
                event.isMajor ? "bg-amber-500/20 text-amber-500" : "bg-vibe-cyan/20 text-vibe-cyan"
              )}>
                {event.isMajor ? 'MAJOR' : event.type.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-1">{event.description}</p>
            <p className="text-xs text-vibe-purple mb-3">📍 {event.locationName}</p>
            <div className="flex justify-between items-center">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(j => <div key={j} className="w-6 h-6 rounded-full bg-gray-600 border border-black" />)}
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] border border-black">+{Math.floor(Math.random() * 50)}</div>
              </div>
              <button className="text-xs font-bold text-white hover:text-vibe-purple transition">Join Event →</button>
            </div>
          </div>
        ))}
        {(!events || events.length === 0) && (
          <div className="text-center text-gray-500 py-10">No upcoming events.</div>
        )}
      </div>
    </div>
  </motion.div>
);

const FullMapView = ({ locations, events, selected, onSelect }) => (
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

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [locations, setLocations] = useState(INITIAL_LOCATIONS);
  const [eventsData, setEventsData] = useState([]);
  const [joined, setJoined] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New state for backend connection
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeCheckin, setActiveCheckin] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [userStats, setUserStats] = useState(null);

  // Check for existing token and load user
  useEffect(() => {
    const loadUser = async () => {
      const token = api.getToken();
      if (token) {
        try {
          const data = await user.getProfile();
          setCurrentUser(data.user);
          const stats = await user.getStats();
          setUserStats(stats);
        } catch (err) {
          console.log('Session expired');
          api.setToken(null);
        }
      }
    };
    loadUser();
  }, []);

  // Load locations from backend
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const data = await locationsApi.getAll();
        if (data.locations && data.locations.length > 0) {
          setLocations(data.locations.map(mapLocation));
          setBackendConnected(true);
        }

        // Load events
        const eventRes = await events.getAll();
        if (eventRes.events) {
          setEventsData(eventRes.events);
        }
      } catch (err) {
        console.log('Backend not available, using demo data');
        setBackendConnected(false);
      }
    };
    loadLocations();

    // Refresh every 30 seconds
    const interval = setInterval(loadLocations, 30000);
    return () => clearInterval(interval);
  }, []);

  // Check for active checkin
  useEffect(() => {
    if (currentUser) {
      const checkActive = async () => {
        try {
          const data = await checkins.getActive();
          if (data.active) {
            setActiveCheckin(data.checkin);
          }
        } catch (err) {
          console.log('Could not check active session');
        }
      };
      checkActive();
    }
  }, [currentUser]);

  // Time update
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 60000);
    return () => clearInterval(timer);
  }, []);

  const addNotification = (msg, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const handleAuth = async (userData) => {
    setCurrentUser(userData);
    addNotification(`Welcome, ${userData.fullName || userData.username}!`);

    // Load user stats
    try {
      const stats = await user.getStats();
      setUserStats(stats);
    } catch (err) {
      console.log('Could not load stats');
    }
  };

  const handleLogout = () => {
    auth.logout();
    setCurrentUser(null);
    setUserStats(null);
    setActiveCheckin(null);
    addNotification('Logged out successfully', 'info');
  };
  const handleCreateVibe = async (data) => {
    if (!currentUser) {
      setShowAuthModal(true);
      addNotification("Please sign in to create vibes!", "error");
      return;
    }

    try {
      const res = await events.create({
        title: data.name,
        description: data.desc,
        type: data.type,
        locationName: 'Community Hub',
        coords: { x: 500 + Math.random() * 100, y: 400 + Math.random() * 100 },
        startTime: new Date()
      });

      if (res.event) {
        setEventsData(prev => [res.event, ...prev]);
        addNotification("Vibe Created! Check the Social tab. 🔥");
      }
    } catch (err) {
      console.error(err);
      addNotification(err.message || "Failed to create vibe", "error");
    }
  };

  const handleCheckIn = async (loc) => {
    if (!currentUser) {
      setShowAuthModal(true);
      addNotification('Please sign in to check in', 'error');
      return;
    }

    if (activeCheckin) {
      // Check out
      try {
        const result = await checkins.checkOut(activeCheckin.id, {});
        setActiveCheckin(null);

        // Find and update the location in joined set
        const locationId = loc.id || activeCheckin.locationId;
        const newJoined = new Set(joined);
        newJoined.delete(locationId);
        setJoined(newJoined);

        addNotification(`Checked out! Earned ${result.coinsEarned} coins 🪙`);

        // Reload user stats
        try {
          const stats = await user.getStats();
          setUserStats(stats);
        } catch (err) {
          console.log('Could not reload stats');
        }
      } catch (err) {
        addNotification(err.message, 'error');
      }
    } else {
      // Check in
      try {
        // Get user's current position (mock for now)
        const latitude = loc.latitude || 12.9716;
        const longitude = loc.longitude || 77.5946;

        const result = await checkins.checkIn(
          loc.id,
          latitude,
          longitude,
          'Studying',
          'solo',
          120
        );

        setActiveCheckin({
          id: result.checkinId,
          locationName: loc.name,
          locationId: loc.id
        });
        setJoined(new Set(joined).add(loc.id));
        addNotification(`Checked in to ${loc.name}! +${result.coinsEarned} coins 🪙`);
      } catch (err) {
        // Fallback to local check-in for demo
        setJoined(new Set(joined).add(loc.id));
        addNotification(`Welcome to ${loc.name}!`);
      }
    }
  };

  const filteredLocations = useMemo(() => {
    return locations.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.desc.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [locations, searchQuery]);

  // Main Content Router
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView
          locations={locations}
          events={eventsData}
          selectedLoc={selectedLoc}
          setSelectedLoc={setSelectedLoc}
          joined={joined}
          handleCheckIn={handleCheckIn}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredLocations={filteredLocations}
          addNotification={addNotification}
        />;
      case 'map':
        return <FullMapView locations={locations} events={eventsData} selected={selectedLoc} onSelect={setSelectedLoc} />;
      case 'social':
        return <SocialView events={eventsData} />;
      case 'chat':
        return <ChatView />;
      default:
        return <DashboardView locations={locations} events={eventsData} />;
    }
  };

  return (
    <div className="min-h-screen pl-0 lg:pl-28 pr-4 py-4 lg:py-8 font-sans selection:bg-vibe-purple/30">
      <NavBar active={activeTab} setTab={setActiveTab} />

      {/* Notifications */}
      <AnimatePresence>
        {notifications.map(n => (
          <Toast key={n.id} message={n.msg} type={n.type} />
        ))}
      </AnimatePresence>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuth={handleAuth} />
      <CreateVibeModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateVibe} />

      {/* Active Session Banner */}
      {activeCheckin && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 bg-vibe-purple/90 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center gap-4">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          <span className="font-medium">Studying at {activeCheckin.locationName}</span>
          <button
            onClick={() => handleCheckIn({ id: activeCheckin.locationId })}
            className="px-4 py-2 bg-white text-black text-sm font-bold rounded-xl hover:scale-105 transition"
          >
            End Session
          </button>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto space-y-8">
        <header className="flex justify-between items-end px-4">
          <div>
            <h1 className="text-6xl font-display font-bold text-white tracking-tighter mb-2">VibeSRM</h1>
            <div className="flex items-center gap-3">
              <p className="text-gray-400 font-medium">Campusing made smart.</p>
              {backendConnected && (
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  Live
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* User Stats */}
            {currentUser && userStats && (
              <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-center">
                  <div className="text-lg font-bold text-vibe-purple">{userStats.overview?.totalCoins || 0}</div>
                  <div className="text-[10px] text-gray-400">COINS</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <div className="text-lg font-bold text-vibe-cyan">{userStats.overview?.currentStreak || 0}</div>
                  <div className="text-[10px] text-gray-400">STREAK</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <div className="text-lg font-bold text-amber-400">{(userStats.overview?.totalHours || 0).toFixed(1)}h</div>
                  <div className="text-[10px] text-gray-400">STUDIED</div>
                </div>
              </div>
            )}

            <div className="text-right hidden md:block">
              <div className="text-3xl font-bold font-display">{time}</div>
              <div className="text-sm text-vibe-purple font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-white text-black font-bold rounded-2xl hover:scale-105 transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Create Vibe
            </button>

            {/* Auth Button */}
            {currentUser ? (
              <div className="relative group">
                <button className="w-12 h-12 rounded-full border-2 border-vibe-purple overflow-hidden hover:scale-105 transition">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.username}`} alt="User" className="w-full h-full object-cover" />
                </button>
                <div className="absolute right-0 top-14 w-48 bg-[#0A0A0F] border border-white/10 rounded-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="px-3 py-2 border-b border-white/10 mb-2">
                    <p className="font-bold">{currentUser.fullName || currentUser.username}</p>
                    <p className="text-xs text-gray-400">{currentUser.email}</p>
                  </div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 text-vibe-rose">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-3 bg-vibe-purple text-white font-bold rounded-2xl hover:scale-105 transition flex items-center gap-2"
              >
                <LogIn className="w-5 h-5" /> Sign In
              </button>
            )}

            <button className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-vibe-rose rounded-full" />
            </button>
          </div>
        </header>

        {renderContent()}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuth={handleAuth} />
      <CreateVibeModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateVibe} />

      <div className="fixed bottom-8 right-8 z-[70] space-y-4">
        {notifications.map(n => (
          <Toast key={n.id} message={n.msg} type={n.type} onClose={() => setNotifications(prev => prev.filter(x => x.id !== n.id))} />
        ))}
      </div>
    </div>
  );
}
