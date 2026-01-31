import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Settings,
  Palette,
  Shield,
  Lock,
  Moon,
  Sun,
  Globe,
  Wifi,
  MapPin
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api, { auth, locations as locationsApi, checkins, user, social, ghost, events, chat } from './api.js';
import { supabase } from './supabase';
import Logo from './Logo.png';

// --- Utilities ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Map backend data to frontend format
const mapLocation = (loc) => ({
  id: loc.id,
  name: loc.name,
  type: loc.type,
  occupancy: loc.occupancy_percent || loc.occupancyPercent || Math.round(((loc.current_occupancy || loc.currentOccupancy || 0) / (loc.capacity || 100)) * 100),
  capacity: loc.capacity,
  desc: loc.description || `${loc.active_users || loc.activeUsers || 0} people studying`,
  coords: {
    x: loc.map_x || loc.mapX || (
      loc.name?.includes('Library') ? 650 :
        loc.name?.includes('Lounge') ? 950 :
          loc.name?.includes('Tech') ? 250 :
            loc.name?.includes('Innovation') ? 940 :
              loc.name?.includes('Sports') ? 900 : 250
    ),
    y: loc.map_y || loc.mapY || (
      loc.name?.includes('Library') ? 465 :
        loc.name?.includes('Lounge') ? 250 :
          loc.name?.includes('Tech') ? 670 :
            loc.name?.includes('Innovation') ? 530 :
              loc.name?.includes('Sports') ? 650 : 325
    )
  },
  color: (loc.occupancy_percent || loc.occupancyPercent) > 70 ? 'text-vibe-rose' : (loc.occupancy_percent || loc.occupancyPercent) > 30 ? 'text-amber-400' : 'text-vibe-cyan',
  amenities: loc.amenities,
  avgNoise: loc.avg_noise || loc.avgNoise,
  photoUrl: loc.photo_url || loc.photoUrl
});

// Map backend event to frontend
const mapEvent = (e) => ({
  id: e.id || e._id,
  title: e.title,
  description: e.description,
  type: e.type,
  locationName: e.location_name || e.locationName || 'Campus',
  coords: {
    x: e.map_x || e.coords?.x || 600,
    y: e.map_y || e.coords?.y || 450
  },
  isMajor: e.is_major || e.isMajor || false,
  startTime: e.start_time || e.startTime || new Date().toISOString(),
  attendees: e.attendees || [],
  creator_id: e.creator_id
});

// Fallback data (for offline/demo mode)
const INITIAL_LOCATIONS = [
  { id: '1', name: 'Library', type: 'library', occupancy: 78, capacity: 500, desc: 'Quiet Zone • Level 3', coords: { x: 650, y: 450 }, color: 'text-vibe-cyan', icon: '📚', wifiSpeed: 85, crowdLevel: 'High', amenities: ['Silent Zone', 'AC', 'Power Outlets', 'Printers'], currentPeople: 390 },
  { id: '2', name: 'Cafeteria', type: 'cafe', occupancy: 42, capacity: 150, desc: 'Fresh Food • Fast WiFi', coords: { x: 950, y: 250 }, color: 'text-amber-400', icon: '🍽️', wifiSpeed: 120, crowdLevel: 'Medium', amenities: ['Food Court', 'AC', 'Seating Area', 'Vending Machines'], currentPeople: 63 },
  { id: '3', name: 'Ganga Gym', type: 'gym', occupancy: 35, capacity: 200, desc: 'Fitness Center • 24/7', coords: { x: 900, y: 620 }, color: 'text-vibe-rose', icon: '💪', wifiSpeed: 50, crowdLevel: 'Low', amenities: ['Cardio', 'Weights', 'Lockers', 'Showers'], currentPeople: 70 },
  { id: '4', name: 'Flag Park', type: 'park', occupancy: 25, capacity: 500, desc: 'Central Gathering Area', coords: { x: 250, y: 650 }, color: 'text-emerald-400', icon: '🏳️', wifiSpeed: 30, crowdLevel: 'Low', amenities: ['Open Space', 'Benches', 'Shade Trees', 'Walking Path'], currentPeople: 125 },
  { id: '5', name: 'Academic Block', type: 'study', occupancy: 65, capacity: 800, desc: 'Main Academic Building', coords: { x: 250, y: 320 }, color: 'text-vibe-purple', icon: '🎓', wifiSpeed: 100, crowdLevel: 'High', amenities: ['Lecture Halls', 'Labs', 'AC', 'Elevators'], currentPeople: 520 },
];

const FORECAST = [50, 75, 90, 60, 45, 30, 80];

const DAILY_ACTIVITY = [
  { day: 'Mon', study: 3.2, play: 1.1, other: 0.7 },
  { day: 'Tue', study: 2.4, play: 1.5, other: 0.9 },
  { day: 'Wed', study: 4.1, play: 0.6, other: 1.2 },
  { day: 'Thu', study: 3.6, play: 1.0, other: 0.8 },
  { day: 'Fri', study: 2.1, play: 2.0, other: 1.1 },
  { day: 'Sat', study: 1.4, play: 2.6, other: 0.9 },
  { day: 'Sun', study: 2.9, play: 1.2, other: 1.5 }
];

const DEFAULT_CHAT_CHANNELS = [
  { id: 'global', label: 'Global' },
  { id: 'study-help', label: 'Study Help' },
  { id: 'events', label: 'Events' },
  { id: 'random', label: 'Random' }
];

const SQUAD_MEMBERS = [
  { id: 'riya', name: 'Riya Sharma', status: 'in the gym', seed: 'riya' },
  { id: 'arjun', name: 'Arjun Mehta', status: 'chilling at cafe', seed: 'arjun' },
  { id: 'neha', name: 'Neha Kapoor', status: 'playing tennis', seed: 'neha' },
  { id: 'kabir', name: 'Kabir Singh', status: 'at the library', seed: 'kabir' },
  { id: 'anaya', name: 'Anaya Iyer', status: 'heading to the track', seed: 'anaya' },
  { id: 'rohan', name: 'Rohan Verma', status: 'studying in Tech Park', seed: 'rohan' }
];

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
const INTEREST_OPTIONS = ['Studying', 'Sports', 'Gym', 'Cafe', 'Gaming', 'Music', 'Coding', 'Events', 'Reading'];

const ProfileModal = ({ isOpen, onClose, currentUser, onSave }) => {
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

const CHATS = [
  { id: 1, name: "Study Group A", msg: "Anyone at the library?", time: "2m", active: true },
  { id: 2, name: "Gym Bros", msg: "Leg day lets gooo", time: "1h", active: false },
  { id: 3, name: "Campus Events", msg: "Hackathon starts in 10!", time: "3h", active: true },
];

// --- Styles ---
const CARD_STYLE = "relative overflow-hidden glass-card glass-card-hover rounded-[2rem] group shimmer";
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
      console.error('Auth Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md relative overflow-hidden"
      >
        {/* Purple/Black/White Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#0f0d1a] to-[#050508] rounded-[2rem]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-violet-600/20 via-fuchsia-600/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/[0.04] to-transparent blur-2xl" />

        <div className="relative z-10 p-8 rounded-[2rem] border border-white/[0.06]">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center mb-4 -rotate-6">
                <Zap className="w-6 h-6 text-white rotate-6" />
              </div>
              <h2 className="text-2xl font-semibold text-white tracking-tight">{isLogin ? 'Welcome back' : 'Join VibeSRM'}</h2>
              <p className="text-gray-500 text-sm mt-1">{isLogin ? 'Sign in to continue' : 'Create your account'}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5 font-medium">Username</label>
                  <input
                    value={username} onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition text-white placeholder-gray-600"
                    placeholder="coolstudent123"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1.5 font-medium">Full Name</label>
                  <input
                    value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition text-white placeholder-gray-600"
                    placeholder="Your Name"
                  />
                </div>
              </>
            )}
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 font-medium">Email</label>
              <input
                type="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition text-white placeholder-gray-600"
                placeholder="you@srm.edu.in"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5 font-medium">Password</label>
              <input
                type="password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition text-white placeholder-gray-600"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-semibold mt-2 hover:shadow-lg hover:shadow-violet-900/30 transition-all disabled:opacity-50 text-white"
            >
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-5 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-violet-400 hover:text-violet-300 transition font-medium">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// --- Components ---

const Toast = ({ message, type = 'success', onClose }) => (
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

const NotificationPanel = ({ items, onClear, onClose }) => (
  <div className="absolute right-0 top-14 w-[360px] max-h-[420px] glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50">
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/20">
      <div>
        <p className="text-sm font-semibold text-white">Notifications</p>
        <p className="text-[11px] text-gray-500">Chats, global chats, and vibe updates</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onClear}
          className="text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition"
        >
          Clear
        </button>
        <button
          onClick={onClose}
          className="text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition"
        >
          Close
        </button>
      </div>
    </div>
    <div className="max-h-[360px] overflow-y-auto">
      {items.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-500 text-sm">No notifications yet.</div>
      ) : (
        items.map((item) => (
          <div key={item.id} className="px-4 py-3 border-b border-white/5 hover:bg-white/[0.03] transition">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center",
                item.category === 'vibe' ? "bg-vibe-purple/20" : item.category === 'global-chat' ? "bg-vibe-cyan/20" : "bg-white/10"
              )}>
                {item.category === 'vibe' ? <Zap className="w-4 h-4 text-vibe-purple" /> : item.category === 'global-chat' ? <MessageSquare className="w-4 h-4 text-vibe-cyan" /> : <Users className="w-4 h-4 text-white/70" />}
              </div>
              <div className="flex-1">
                <p className={cn("text-sm", item.read ? "text-gray-400" : "text-white")}>{item.msg}</p>
                <p className="text-[10px] text-gray-500 mt-1">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              {!item.read && <span className="w-2 h-2 rounded-full bg-vibe-rose mt-2" />}
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const NavBar = ({ active, setTab, currentUser, onOpenProfile }) => (
  <nav className="fixed left-0 top-0 h-full w-24 hidden lg:flex flex-col items-center py-10 z-50 border-r border-white/5 bg-[#030305]/80 backdrop-blur-2xl">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center mb-16 relative cursor-pointer group shadow-lg shadow-vibe-purple/20"
    >
      <img src={Logo} alt="VibeSRM" className="w-full h-full object-cover" />
    </motion.div>
    <div className="flex flex-col gap-6">
      {[Grid, MapIcon, Users, MessageSquare, Award].map((Icon, i) => {
        const id = ['dashboard', 'map', 'social', 'chat', 'achievements'][i];
        const labels = ['Home', 'Map', 'Social', 'Chat', 'Achievements'];
        return (
          <motion.button
            key={id}
            onClick={() => setTab(id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "relative p-4 rounded-2xl transition-all duration-300 group",
              active === id
                ? "text-white bg-gradient-to-br from-vibe-purple/20 to-vibe-cyan/10 shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)]"
                : "text-gray-500 hover:text-white hover:bg-white/5"
            )}
          >
            <Icon className="w-6 h-6" />
            {active === id && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-vibe-purple to-vibe-cyan rounded-r-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="absolute left-full ml-4 px-3 py-1.5 bg-[#0A0A0F] border border-white/10 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              {labels[i]}
            </span>
          </motion.button>
        )
      })}
    </div>
    <div className="mt-auto flex flex-col items-center gap-4">
      <button
        onClick={() => setTab('settings')}
        className={cn(
          "p-3 rounded-xl transition",
          active === 'settings' ? "text-white bg-vibe-purple/20 shadow-lg shadow-vibe-purple/20" : "text-gray-500 hover:text-white hover:bg-white/5"
        )}
        title="Settings"
      >
        <Settings className="w-5 h-5" />
      </button>
      <button
        onClick={onOpenProfile}
        className="w-11 h-11 rounded-full border-2 border-vibe-purple/50 overflow-hidden hover:border-vibe-purple transition-colors cursor-pointer shadow-lg shadow-vibe-purple/20"
        title={currentUser ? currentUser.username || 'Your Profile' : 'Not signed in'}
      >
        <img
          src={currentUser?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser?.username || currentUser?.email || 'guest'}`}
          alt="User"
          className="w-full h-full object-cover"
        />
      </button>
    </div>
  </nav>
);

// 3D Building images and colors for map
const BUILDING_IMAGES = {
  'Library': 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png',
  'Cafeteria': 'https://cdn-icons-png.flaticon.com/512/3170/3170733.png',
  'Ganga Gym': 'https://cdn-icons-png.flaticon.com/512/2936/2936886.png',
  'Flag Park': 'https://cdn-icons-png.flaticon.com/512/3310/3310331.png',
  'Academic Block': 'https://cdn-icons-png.flaticon.com/512/2602/2602414.png',
};

const BUILDING_COLORS = {
  'Library': { primary: '#22d3ee', secondary: '#06b6d4', glow: 'rgba(34,211,238,0.4)' },
  'Cafeteria': { primary: '#fbbf24', secondary: '#f59e0b', glow: 'rgba(251,191,36,0.4)' },
  'Ganga Gym': { primary: '#fb7185', secondary: '#f43f5e', glow: 'rgba(251,113,133,0.4)' },
  'Flag Park': { primary: '#10b981', secondary: '#059669', glow: 'rgba(16,185,129,0.4)' },
  'Academic Block': { primary: '#a855f7', secondary: '#7c3aed', glow: 'rgba(168,85,247,0.4)' },
};

const BentoMap = ({ locations = [], events = [], selected, onSelect, fullScreen = false }) => {
  const safeLocations = Array.isArray(locations) ? locations : INITIAL_LOCATIONS;
  const safeEvents = Array.isArray(events) ? events : [];

  // Use INITIAL_LOCATIONS if no locations provided
  const displayLocations = safeLocations.length > 0 ? safeLocations : INITIAL_LOCATIONS;

  return (
    <div className={cn("w-full h-full relative overflow-hidden rounded-[2rem]", fullScreen ? "rounded-none" : "")}>
      {/* Premium Dark Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#030712] via-[#0f0a1f] to-[#0a0118]" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0" style={{
          backgroundImage: `
          linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)
        `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-vibe-purple/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-vibe-cyan/20 rounded-full blur-[100px]" />
      </div>

      {/* Map Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <div className="px-5 py-2 bg-black/70 backdrop-blur-xl rounded-xl border border-white/10">
          <h2 className="text-lg font-bold bg-gradient-to-r from-vibe-purple via-vibe-cyan to-vibe-rose bg-clip-text text-transparent">
            🗺️ Campus Map
          </h2>
        </div>
      </div>

      {/* Map Container - Simple Flex Grid */}
      <div className="absolute inset-0 pt-16 pb-16 px-4 flex items-center justify-center">
        <div className="grid grid-cols-3 grid-rows-2 gap-3 md:gap-6 max-w-5xl w-full">
          {/* Render all 5 locations from INITIAL_LOCATIONS directly */}
          {INITIAL_LOCATIONS.map((loc) => (
            <div key={loc.id} className="flex items-center justify-center">
              <BuildingCard
                loc={loc}
                isSelected={selected?.id === loc.id}
                onSelect={onSelect}
              />
            </div>
          ))}

          {/* 6th slot - Show all vibes/events */}
          <div className="flex items-center justify-center flex-wrap gap-2">
            {safeEvents.length > 0 ? (
              <div className="flex flex-wrap gap-2 justify-center items-center max-w-[160px]">
                {safeEvents.slice(0, 4).map((event) => (
                  <motion.div
                    key={event.id}
                    className="cursor-pointer"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect({ ...event, type: 'event' })}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-amber-500/40 rounded-full blur-lg animate-pulse" />
                      <div className={cn(
                        "rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/50 border-2 border-amber-300",
                        safeEvents.length === 1 ? "w-16 h-16 md:w-20 md:h-20" : "w-12 h-12 md:w-14 md:h-14"
                      )}>
                        <Zap className={cn("text-white", safeEvents.length === 1 ? "w-8 h-8 md:w-10 md:h-10" : "w-5 h-5 md:w-6 md:h-6")} />
                      </div>
                    </div>
                  </motion.div>
                ))}
                {safeEvents.length > 4 && (
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                    +{safeEvents.length - 4}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Zap className="w-8 h-8 text-white/20" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event markers label */}
      {safeEvents.length > 0 && (
        <div className="absolute bottom-20 right-8 bg-black/70 backdrop-blur-xl rounded-lg px-3 py-1.5 border border-amber-500/30 z-20">
          <span className="text-xs font-bold text-amber-400">🎉 {safeEvents.length} Active Vibe{safeEvents.length > 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-xl rounded-xl border border-white/10 px-4 py-2 z-20">
        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-vibe-purple" /><span className="text-white/70">Academic</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-vibe-cyan" /><span className="text-white/70">Library</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-white/70">Cafeteria</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-vibe-rose" /><span className="text-white/70">Gym</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-white/70">Park</span></div>
        </div>
      </div>

      {/* Compass */}
      <div className="absolute top-4 right-4 w-10 h-10 bg-black/70 backdrop-blur-xl rounded-full border border-white/10 flex items-center justify-center z-20">
        <Navigation className="w-4 h-4 text-vibe-cyan" />
      </div>
    </div>
  );
};

// Building Card Component
const BuildingCard = ({ loc, isSelected, onSelect }) => {
  const colors = BUILDING_COLORS[loc.name] || { primary: '#a855f7', secondary: '#7c3aed', glow: 'rgba(168,85,247,0.4)' };
  const img = BUILDING_IMAGES[loc.name];

  return (
    <motion.div
      className="cursor-pointer"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(loc)}
    >
      <div
        className={cn(
          "relative w-36 h-48 md:w-40 md:h-52 rounded-2xl overflow-hidden",
          "bg-gradient-to-b from-white/10 to-black/60 backdrop-blur-lg",
          "border-2 shadow-xl transition-all duration-300",
          isSelected ? "border-white/50 ring-4 ring-white/20" : "border-white/10 hover:border-white/30"
        )}
        style={{
          borderColor: isSelected ? colors.primary : undefined,
          boxShadow: `0 15px 40px -10px ${colors.glow}`
        }}
      >
        {/* 3D Image - Larger icons */}
        <div className="flex items-center justify-center pt-4 pb-2">
          <img
            src={img}
            alt={loc.name}
            className="w-20 h-20 md:w-24 md:h-24 object-contain"
            style={{ filter: `drop-shadow(0 6px 16px ${colors.glow})` }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Info */}
        <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
          <p className="text-sm font-bold text-center text-white truncate">{loc.name}</p>

          {/* Occupancy Bar */}
          <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                backgroundColor: loc.occupancy > 70 ? '#ef4444' : loc.occupancy > 40 ? '#f59e0b' : '#10b981',
                width: `${loc.occupancy}%`
              }}
            />
          </div>
          <p className="text-[10px] text-center text-gray-400 mt-1">{loc.occupancy}% occupied</p>
        </div>

        {/* Status Dot */}
        <div
          className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full"
          style={{
            backgroundColor: loc.occupancy > 70 ? '#ef4444' : loc.occupancy > 40 ? '#f59e0b' : '#10b981',
            boxShadow: `0 0 10px ${loc.occupancy > 70 ? '#ef4444' : loc.occupancy > 40 ? '#f59e0b' : '#10b981'}`
          }}
        />
      </div>
    </motion.div>
  );
};

// Location Detail Card Component
const LocationDetailCard = ({ location, onClose }) => {
  const colors = BUILDING_COLORS[location.name] || { primary: '#a855f7', secondary: '#7c3aed', glow: 'rgba(168,85,247,0.4)' };
  const img = BUILDING_IMAGES[location.name];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-black/95 backdrop-blur-2xl border-2 rounded-3xl p-6 min-w-[340px] max-w-[380px] shadow-2xl"
        style={{
          borderColor: colors.primary,
          boxShadow: `0 0 80px ${colors.glow}`
        }}
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}20)`,
              border: `1px solid ${colors.primary}40`
            }}
          >
            <img
              src={img}
              alt={location.name}
              className="w-14 h-14 object-contain"
              style={{ filter: `drop-shadow(0 4px 12px ${colors.glow})` }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white truncate">{location.name}</h3>
            <p className="text-sm text-gray-400 mt-1">{location.desc}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Occupancy */}
        <div className="mb-5">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-gray-400">Occupancy</span>
            <span className={cn("text-sm font-bold",
              location.occupancy > 70 ? "text-red-400" : location.occupancy > 40 ? "text-amber-400" : "text-green-400"
            )}>{location.occupancy}%</span>
          </div>
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                backgroundColor: location.occupancy > 70 ? '#ef4444' : location.occupancy > 40 ? '#f59e0b' : '#10b981',
                width: `${location.occupancy}%`
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
            <div className="text-gray-500 text-[10px] uppercase mb-1">Capacity</div>
            <div className="text-white font-bold">{location.capacity}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
            <div className="text-gray-500 text-[10px] uppercase mb-1">Type</div>
            <div className="text-white font-bold capitalize">{location.type}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
            <div className="text-gray-500 text-[10px] uppercase mb-1">Status</div>
            <div className={cn("font-bold",
              location.occupancy > 70 ? "text-red-400" : location.occupancy > 40 ? "text-amber-400" : "text-green-400"
            )}>
              {location.occupancy > 70 ? "Busy" : location.occupancy > 40 ? "Moderate" : "Open"}
            </div>
          </div>
        </div>

        {/* Action */}
        <button
          className="w-full py-3 rounded-xl font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            boxShadow: `0 4px 20px ${colors.glow}`
          }}
        >
          Navigate Here
        </button>
      </div>
    </motion.div>
  );
};

const CreateVibeModal = ({ isOpen, onClose, onCreate, locations }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('study');
  const [isMajor, setIsMajor] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');

  // Location coordinates mapping
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
      // Reset form
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

          {/* Location Selector */}
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

          {/* Type Selector */}
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

          {/* Major/Minor Toggle */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
            <div>
              <p className="font-bold text-white">Show on Map</p>
              <p className="text-xs text-gray-400">Major events appear on the campus map</p>
            </div>
            <button
              onClick={() => setIsMajor(!isMajor)}
              className={cn(
                "w-14 h-8 rounded-full transition-colors relative",
                isMajor ? "bg-vibe-purple" : "bg-white/10"
              )}
            >
              <div className={cn(
                "absolute top-1 w-6 h-6 bg-white rounded-full transition-all",
                isMajor ? "left-7" : "left-1"
              )} />
            </button>
          </div>

          <button
            onClick={handleCreate}
            disabled={!name || !desc}
            className="w-full py-4 bg-vibe-purple rounded-xl font-bold mt-4 hover:bg-vibe-purple/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Launch Vibe 🚀
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- View Components ---

const DashboardView = ({ locations, events, selectedLoc, setSelectedLoc, joined, handleCheckIn, searchQuery, setSearchQuery, filteredLocations, addNotification, currentUser, onJoin, onLeave, onDelete, onOpenEventChat }) => {
  const [activeListTab, setActiveListTab] = useState('vibes'); // 'locations' | 'vibes'

  const filteredEvents = events?.filter(e =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const maxActivityTotal = Math.max(
    ...DAILY_ACTIVITY.map(x => x.study + x.play + x.other),
    1
  );

  return (
    <main className="grid grid-cols-1 md:grid-cols-12 grid-rows-8 md:grid-rows-8 gap-6 h-auto md:min-h-[800px]">
      {/* Map */}
      <motion.div className={cn("col-span-1 md:col-span-8 row-span-4 p-0 relative", CARD_STYLE)} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <BentoMap locations={locations} events={events} selected={selectedLoc} onSelect={setSelectedLoc} />
      </motion.div>

      {/* Selected Location/Event Popups - Two cards: Details and Check-in */}
      <AnimatePresence>
        {selectedLoc && selectedLoc.capacity && (
          <>
            {/* Details Card - Left Side */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: -20, y: 20 }}
              className="fixed bottom-6 left-6 p-5 bg-black/85 backdrop-blur-2xl border border-white/20 rounded-3xl w-72 shadow-2xl z-[100]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedLoc.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold font-display">{selectedLoc.name}</h3>
                    <p className="text-xs text-gray-400">{selectedLoc.desc}</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* WiFi Speed */}
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Wifi className="w-4 h-4 text-vibe-cyan" />
                    <span className="text-[10px] text-gray-400 uppercase">WiFi Speed</span>
                  </div>
                  <p className="text-lg font-bold text-white">{selectedLoc.wifiSpeed || 50} <span className="text-xs text-gray-400">Mbps</span></p>
                  <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-vibe-cyan to-vibe-purple"
                      style={{ width: `${Math.min((selectedLoc.wifiSpeed || 50) / 1.5, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Crowd Level */}
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] text-gray-400 uppercase">Crowd</span>
                  </div>
                  <p className={cn(
                    "text-lg font-bold",
                    selectedLoc.crowdLevel === 'Low' ? 'text-emerald-400' :
                      selectedLoc.crowdLevel === 'Medium' ? 'text-amber-400' : 'text-red-400'
                  )}>{selectedLoc.crowdLevel || 'Medium'}</p>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1.5 flex-1 rounded-full",
                          i <= (selectedLoc.crowdLevel === 'Low' ? 1 : selectedLoc.crowdLevel === 'Medium' ? 2 : 3)
                            ? selectedLoc.crowdLevel === 'Low' ? 'bg-emerald-400' :
                              selectedLoc.crowdLevel === 'Medium' ? 'bg-amber-400' : 'bg-red-400'
                            : 'bg-white/10'
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* People Count */}
              <div className="p-3 bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Currently Occupying</p>
                    <p className="text-2xl font-bold text-white">
                      {selectedLoc.currentPeople || Math.round((selectedLoc.occupancy / 100) * selectedLoc.capacity)}
                      <span className="text-sm text-gray-400"> / {selectedLoc.capacity}</span>
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-white/5 border-4 border-white/10 flex items-center justify-center">
                    <span className={cn(
                      "text-lg font-bold",
                      selectedLoc.occupancy > 70 ? 'text-red-400' : selectedLoc.occupancy > 40 ? 'text-amber-400' : 'text-emerald-400'
                    )}>{selectedLoc.occupancy}%</span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {selectedLoc.amenities && (
                <div>
                  <p className="text-[10px] text-gray-400 uppercase mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLoc.amenities.map((amenity, i) => (
                      <span key={i} className="px-2 py-1 bg-white/5 rounded-lg text-[10px] text-gray-300 border border-white/10">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Check-in Card - Right of Details */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 20, y: 20 }}
              className="fixed bottom-6 left-[320px] p-5 bg-black/85 backdrop-blur-2xl border border-white/20 rounded-3xl w-56 shadow-2xl z-[100]"
            >
              <button
                onClick={() => setSelectedLoc(null)}
                className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-full transition"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>

              <div className="text-center mb-4">
                <div className={cn(
                  "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3",
                  joined.has(selectedLoc.id) ? "bg-emerald-500/20 border-2 border-emerald-500/50" : "bg-white/10 border-2 border-white/20"
                )}>
                  <MapPin className={cn("w-8 h-8", joined.has(selectedLoc.id) ? "text-emerald-400" : "text-white/60")} />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  {joined.has(selectedLoc.id) ? "You're Here!" : "Check In"}
                </h4>
                <p className="text-xs text-gray-400">
                  {joined.has(selectedLoc.id)
                    ? "Enjoying your time at " + selectedLoc.name
                    : "Let others know you're at " + selectedLoc.name
                  }
                </p>
              </div>

              {/* Occupancy Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>Occupancy</span>
                  <span>{selectedLoc.occupancy}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500",
                      selectedLoc.occupancy > 70 ? 'bg-red-500' : selectedLoc.occupancy > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                    )}
                    style={{ width: `${selectedLoc.occupancy}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => handleCheckIn(selectedLoc)}
                className={cn(
                  "w-full py-3 font-bold rounded-xl transition-all duration-300",
                  joined.has(selectedLoc.id)
                    ? "bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30"
                    : "bg-gradient-to-r from-vibe-purple to-vibe-cyan text-white hover:shadow-lg hover:shadow-vibe-purple/30"
                )}
              >
                {joined.has(selectedLoc.id) ? "Check Out" : "Check In Now"}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Event Popup - Single card for events (user-created vibes without capacity) */}
      <AnimatePresence>
        {selectedLoc && !selectedLoc.capacity && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 left-6 p-6 bg-black/85 backdrop-blur-2xl border border-white/20 rounded-3xl w-80 shadow-2xl z-[100]"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold font-display">{selectedLoc.title || selectedLoc.name}</h3>
              <button onClick={() => setSelectedLoc(null)} className="p-1 hover:bg-white/10 rounded-full"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-gray-400 mb-4">{selectedLoc.description || selectedLoc.desc}</p>

            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="text-xs bg-white/10 px-2 py-1 rounded-md mb-2 block w-fit">{selectedLoc.locationName || 'Campus'}</span>
                <span className="text-xs bg-white/10 px-2 py-1 rounded-md mb-2 block w-fit">{new Date(selectedLoc.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const isJoined = selectedLoc.attendees?.includes(currentUser?.id);
                    if (isJoined) onLeave(selectedLoc.id);
                    else onJoin(selectedLoc.id);
                  }}
                  className={cn(
                    "py-2 font-bold rounded-xl text-sm transition",
                    selectedLoc.attendees?.includes(currentUser?.id)
                      ? "bg-red-500/20 text-red-400 border border-red-500/50"
                      : "bg-vibe-purple text-white"
                  )}
                >
                  {selectedLoc.attendees?.includes(currentUser?.id) ? "Leave" : "Join"}
                </button>

                <button
                  onClick={() => {
                    const isJoined = selectedLoc.attendees?.includes(currentUser?.id);
                    if (!isJoined) {
                      addNotification('Join the vibe to chat', 'info');
                      return;
                    }
                    onOpenEventChat?.(selectedLoc);
                  }}
                  className="py-2 bg-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/20 transition"
                >
                  Message
                </button>
              </div>

              {selectedLoc.creator_id === currentUser?.id && (
                <button
                  onClick={() => onDelete(selectedLoc.id)}
                  className="w-full py-2 border border-red-500/20 text-red-400 text-xs rounded-xl hover:bg-red-500/10 transition"
                >
                  Delete Vibe
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & List */}
      <div className="col-span-1 md:col-span-4 row-span-4 flex flex-col gap-6">
        <div className={cn("p-4 flex flex-col gap-4 transition-colors", CARD_STYLE)}>
          <div className="flex items-center gap-4 text-gray-400 focus-within:text-white">
            <Search className="w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find friends, food, vibes..."
              className="bg-transparent outline-none w-full placeholder:text-gray-600 font-medium"
            />
          </div>
          {/* Tabs */}
          <div className="flex p-1 bg-black/40 rounded-xl">
            <button
              onClick={() => setActiveListTab('locations')}
              className={cn("flex-1 py-1.5 text-xs font-bold rounded-lg transition", activeListTab === 'locations' ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300")}
            >
              Locations
            </button>
            <button
              onClick={() => setActiveListTab('vibes')}
              className={cn("flex-1 py-1.5 text-xs font-bold rounded-lg transition", activeListTab === 'vibes' ? "bg-vibe-purple text-white" : "text-gray-500 hover:text-gray-300")}
            >
              Live Vibes
            </button>
          </div>
        </div>

        <div className={cn("flex-1 p-6 overflow-y-auto", CARD_STYLE)}>
          <h3 className="text-lg font-bold font-display mb-4 flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", activeListTab === 'vibes' ? "bg-vibe-purple" : "bg-green-500")} />
            {activeListTab === 'vibes' ? 'Happening Now' : 'Campus Locations'}
          </h3>
          <div className="space-y-4">
            {activeListTab === 'locations' ? (
              filteredLocations.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No locations found</div>
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
              )
            ) : (
              // Events List
              filteredEvents.length === 0 ? (
                <div className="text-center text-gray-500 py-10">No vibes yet. Create one! 🚀</div>
              ) : (
                filteredEvents.map(event => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedLoc({ ...event, type: 'event' })}
                    className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition cursor-pointer group border border-transparent hover:border-vibe-purple/20"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="font-bold flex items-center gap-2 text-vibe-purple">
                          {event.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400 bg-black/20 px-1.5 py-0.5 rounded">{event.locationName}</span>
                          <span className="text-xs text-gray-500">{new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      {event.isMajor && <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />}
                    </div>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{event.description}</p>

                    {/* Mini Actions */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                      {event.attendees?.includes(currentUser?.id) ? (
                        <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Joined</span>
                      ) : (
                        <span className="text-xs text-gray-500">Tap to view & join</span>
                      )}
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>

      {/* Social */}
      <div className={cn("col-span-1 md:col-span-5 row-span-2 p-6 relative overflow-hidden", CARD_STYLE, "text-center flex flex-col items-center")}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-vibe-cyan/20 to-transparent blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-vibe-purple/10 to-transparent blur-2xl rounded-full" />
        <h3 className="font-display font-bold text-xl mb-4 relative z-10">Vibe Gang</h3>
        <div className="flex -space-x-3 mb-6 relative z-10 justify-center">
          {[1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              whileHover={{ y: -8, scale: 1.12 }}
              className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-vibe-purple via-vibe-cyan to-vibe-rose shadow-[0_0_20px_rgba(124,58,237,0.35)] relative cursor-pointer"
            >
              <div className="w-full h-full rounded-full bg-[#0A0A0F] p-[2px]">
                <img
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=vibe-${i}`}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              {i === 2 && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#0A0A0F] rounded-full animate-pulse" />}
            </motion.div>
          ))}
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-xs font-bold cursor-pointer shadow-lg"
          >
            <div className="w-full h-full rounded-full bg-[#0A0A0F] flex items-center justify-center">+5</div>
          </motion.div>
        </div>
        <div className="flex gap-4 relative z-10 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => addNotification("Pinging everyone! 🔔")}
            className="px-5 py-2.5 bg-white text-black text-sm font-bold rounded-xl shadow-lg shadow-white/10"
          >
            Ping All
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => addNotification("Scanning for new vibes... 📡", "info")}
            className="px-5 py-2.5 bg-white/5 border border-white/10 text-sm font-bold rounded-xl hover:bg-white/10 transition"
          >
            Find New
          </motion.button>
        </div>
      </div>

      {/* Daily Activity */}
      <div className={cn("col-span-1 md:col-span-4 row-span-2 p-6 relative overflow-hidden", CARD_STYLE, "flex flex-col")}>
        <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-br from-vibe-purple/20 to-transparent blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-gradient-to-tr from-white/10 to-transparent blur-2xl rounded-full" />
        <div className="relative z-10 flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-xl">Daily Activity</h3>
          <span className="text-[11px] text-gray-500">Last 7 days</span>
        </div>
        <div className="flex-1 flex items-end gap-3 relative z-10 h-[180px]">
          {DAILY_ACTIVITY.map((d) => {
            const total = d.study + d.play + d.other;
            const pct = (val) => `${(val / maxActivityTotal) * 100}%`;
            return (
              <div key={d.day} className="flex-1 h-full flex flex-col items-center gap-2">
                <div className="w-full max-w-[28px] h-full min-h-[140px] flex flex-col-reverse rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-inner">
                  <div className="bg-vibe-cyan/80" style={{ height: pct(d.play) }} />
                  <div className="bg-vibe-purple/80" style={{ height: pct(d.study) }} />
                  <div className="bg-white/70" style={{ height: pct(d.other) }} />
                </div>
                <span className="text-[10px] text-gray-400">{d.day}</span>
                <span className="text-[10px] text-gray-500">{total.toFixed(1)}h</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-3 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-vibe-purple/80" />Study</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-vibe-cyan/80" />Play</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-white/70" />Other</span>
        </div>
      </div>

      {/* Gamification */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={cn("col-span-1 md:col-span-3 row-span-2 p-6 flex flex-col items-center justify-center text-center cursor-pointer group", CARD_STYLE)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-vibe-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-vibe-purple/30 to-vibe-cyan/10 flex items-center justify-center text-vibe-purple mb-4 relative"
        >
          <div className="absolute inset-0 rounded-full bg-vibe-purple/20 animate-ping opacity-50" />
          <Award className="w-10 h-10 relative z-10" />
        </motion.div>
        <div className="font-display font-bold text-3xl text-white mb-1">Level 12</div>
        <div className="text-gray-400 text-sm">Top 5% on VibeSRM</div>
        <div className="mt-4 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={cn("w-2 h-2 rounded-full", i < 4 ? "bg-vibe-purple" : "bg-white/20")} />
          ))}
        </div>
      </motion.div>
    </main>
  );
};

const ChatView = ({ currentUser, activeChannel, setActiveChannel, channels, addNotification, addNotificationItem, onLeaveChannel }) => {
  const [messages, setMessages] = useState([]);
  const [toggledMsgId, setToggledMsgId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const channelList = channels?.length ? channels : DEFAULT_CHAT_CHANNELS;
  const activeChannelLabel = channelList.find((ch) => ch.id === activeChannel)?.label || activeChannel;

  // Check if this is a custom channel (dm or event) that can be left
  const isCustomChannel = activeChannel?.startsWith('dm-') || activeChannel?.startsWith('event-');
  const isDefaultChannel = DEFAULT_CHAT_CHANNELS.some(ch => ch.id === activeChannel);

  // Audio refs
  const sendSound = useRef(new Audio('/sounds/message_sent.mp3'));
  const receiveSound = useRef(new Audio('/sounds/message_received.mp3'));

  useEffect(() => {
    sendSound.current.volume = 0.5;
    receiveSound.current.volume = 0.5;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let subscription;

    const initChat = async () => {
      setLoading(true);
      try {
        const data = await chat.getMessages(activeChannel);
        setMessages(data || []);

        subscription = chat.subscribeToMessages(activeChannel, (message) => {
          setMessages((prev) => {
            // Deduplicate
            if (prev.some(m => m.id === message.id)) return prev;

            // Play receive sound if not from me
            if (message.sender_id !== currentUser.id) {
              receiveSound.current.currentTime = 0;
              receiveSound.current.play().catch(() => { });
              const sender = message.sender?.username || message.sender?.full_name || 'Someone';
              const category = activeChannel === 'global' ? 'global-chat' : 'chat';
              addNotificationItem?.(`Chat • ${activeChannelLabel}: ${sender} — ${message.text}`, 'info', category);
            }
            return [...prev, message];
          });
        });
      } catch (err) {
        console.error("Chat Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) initChat();

    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, [activeChannel, currentUser]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const textPayload = inputText.trim();
    setInputText('');

    // OPTIMISTIC UPDATE
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      text: textPayload,
      sender_id: currentUser.id,
      created_at: new Date().toISOString(),
      sender: {
        username: currentUser.username,
        avatar_url: currentUser.avatar_url,
        full_name: currentUser.full_name || currentUser.fullName
      }
    };

    setMessages(prev => [...prev, optimisticMessage]);

    // Play Sound Immediately
    try {
      sendSound.current.currentTime = 0;
      sendSound.current.play().catch(() => { });
    } catch (e) { /* ignore */ }

    try {
      const { data, error } = await chat.sendMessage(textPayload, activeChannel);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to send:", err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      // Show error toast
    }
  };

  if (!currentUser) return (
    <div className="h-[600px] flex items-center justify-center">
      <div className="text-center p-10 bg-gradient-to-br from-[#1a1a2e] via-[#16162a] to-[#0f0f1a] rounded-[2.5rem] border border-white/[0.08] shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center rotate-12">
          <LogIn className="w-8 h-8 text-white -rotate-12" />
        </div>
        <p className="text-gray-300 text-lg font-medium">Join the conversation</p>
        <p className="text-gray-500 text-sm mt-2">Sign in to start vibing with others</p>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-140px)] min-h-[600px] flex gap-5"
    >
      {/* Channels Sidebar - Organic Shape */}
      <div className="w-64 flex-col hidden md:flex rounded-[1.75rem] overflow-hidden bg-gradient-to-b from-[#12121a] to-[#0a0a10] border border-white/[0.04]">
        <div className="p-5 pb-4">
          <h2 className="text-base font-semibold text-white/90 tracking-tight">Channels</h2>
          <p className="text-[11px] text-gray-500 mt-0.5">Pick your vibe</p>
        </div>
        <div className="flex-1 overflow-y-auto px-2.5 pb-4 space-y-0.5">
          {channelList.map((channel) => {
            const isCustom = channel.id?.startsWith('dm-') || channel.id?.startsWith('event-');
            return (
              <div
                key={channel.id}
                className={cn(
                  "px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-2.5 group relative",
                  activeChannel === channel.id
                    ? "bg-gradient-to-r from-violet-600/20 to-fuchsia-600/10 text-white"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"
                )}
              >
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  activeChannel === channel.id ? "bg-violet-500" : "bg-gray-700 group-hover:bg-gray-600"
                )} />
                <span
                  className="text-[13px] font-medium flex-1"
                  onClick={() => setActiveChannel(channel.id)}
                >
                  {channel.label}
                </span>
                {activeChannel === channel.id && (
                  <span className="text-[9px] bg-violet-500/30 text-violet-300 px-1.5 py-0.5 rounded-md font-medium">active</span>
                )}
                {isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLeaveChannel?.(channel.id);
                    }}
                    className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-vibe-rose hover:bg-vibe-rose/10"
                    title="Leave this chat"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="p-4 border-t border-white/[0.04] bg-black/20">
          <div className="flex items-center gap-3">
            {currentUser.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.username}
                className="w-9 h-9 rounded-xl object-cover border border-white/10"
              />
            ) : (
              <img
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.username || currentUser.email}`}
                alt={currentUser.username}
                className="w-9 h-9 rounded-xl object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser.username || currentUser.email?.split('@')[0]}</p>
              <p className="text-[10px] text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Online
              </p>
            </div>
            <button
              onClick={() => alert('Settings coming soon! 🚀')}
              className="p-2 rounded-lg hover:bg-white/10 transition text-gray-500 hover:text-white"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat - Purple/Black/White Gradient */}
      <div className="flex-1 flex flex-col rounded-[1.75rem] overflow-hidden relative">
        {/* Stunning Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#0c0a1d] to-[#030305]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-violet-600/20 via-fuchsia-600/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-white/[0.03] via-transparent to-transparent blur-2xl" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-violet-900/10 rounded-full blur-[100px]" />

        {/* Header - Clean & Minimal */}
        <div className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-white/[0.06] bg-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-900/30 -rotate-3">
              <span className="text-white font-bold text-lg rotate-3">{isCustomChannel ? '💬' : '#'}</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white tracking-tight">{activeChannelLabel}</h3>
              <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-emerald-400">Live</span>
                <span className="mx-1">·</span>
                <span>{messages.length} messages</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 transition text-gray-400 hover:text-white">
              <Users className="w-4 h-4" />
            </button>
            {isCustomChannel && (
              <button
                onClick={() => onLeaveChannel?.(activeChannel)}
                className="p-2.5 rounded-xl bg-vibe-rose/10 hover:bg-vibe-rose/20 transition text-vibe-rose hover:text-vibe-rose/80"
                title="Leave this chat"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="relative z-10 flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/10 flex items-center justify-center mb-4 rotate-6">
                <MessageSquare className="w-10 h-10 text-violet-400 -rotate-6" />
              </div>
              <p className="text-gray-300 font-medium">No messages yet</p>
              <p className="text-gray-600 text-sm mt-1">Be the first to say something!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.sender_id === currentUser.id;
              const showAvatar = idx === 0 || messages[idx - 1].sender_id !== msg.sender_id;
              const showTime = idx === messages.length - 1 || messages[idx + 1]?.sender_id !== msg.sender_id;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  key={msg.id}
                  className={cn("flex gap-2.5", isMe ? "flex-row-reverse" : "flex-row")}
                >
                  <div className="w-8 flex-shrink-0">
                    {showAvatar && (
                      <img
                        src={msg.sender?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${msg.sender?.username || msg.sender_id}`}
                        alt={msg.sender?.username || 'User'}
                        className="w-8 h-8 rounded-xl object-cover"
                      />
                    )}
                  </div>
                  <div className={cn("max-w-[70%] flex flex-col gap-0.5", isMe ? "items-end" : "items-start")}>
                    {showAvatar && !isMe && (
                      <span className="text-[10px] text-gray-500 font-medium px-1">{msg.sender?.username}</span>
                    )}
                    <div className={cn(
                      "px-4 py-2.5 text-[14px] leading-relaxed relative cursor-pointer",
                      isMe
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl rounded-tr-md shadow-lg shadow-violet-900/20"
                        : "bg-white/[0.08] text-gray-200 rounded-2xl rounded-tl-md border border-white/[0.06]"
                    )}
                      onClick={(e) => { e.stopPropagation(); setToggledMsgId(prev => prev === msg.id ? null : msg.id); }}
                      onDoubleClick={(e) => { e.stopPropagation(); /* reserved for future */ }}
                    >
                      {msg.text}

                      {/* Toggle actions: Copy always, Delete only for own messages */}
                      {toggledMsgId === msg.id && (
                        <div className="absolute -top-8 right-0 flex items-center gap-2">
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              try {
                                navigator.clipboard.writeText(msg.text);
                                addNotification?.('Message copied', 'success');
                              } catch (err) {
                                console.error('Copy failed', err);
                                addNotification?.('Copy failed', 'error');
                              }
                              setToggledMsgId(null);
                            }}
                            className="bg-white/5 hover:bg-white/10 text-gray-200 px-2 py-1 rounded-md text-xs"
                          >Copy</button>
                          {isMe && (
                            <button
                              onClick={async (ev) => {
                                ev.stopPropagation();
                                // If optimistic (temp) id, remove locally
                                if (String(msg.id).startsWith('temp-')) {
                                  setMessages(prev => prev.filter(m => m.id !== msg.id));
                                  addNotification?.('Message removed', 'info');
                                  setToggledMsgId(null);
                                  return;
                                }

                                // Optimistically remove message from UI
                                const prior = messages;
                                setMessages(prev => prev.filter(m => m.id !== msg.id));
                                setToggledMsgId(null);

                                try {
                                  await chat.deleteMessage(msg.id);
                                  addNotification?.('Message deleted', 'success');
                                } catch (err) {
                                  // Restore previous state on failure and show detailed error
                                  console.error('Delete failed', err);
                                  setMessages(prior);
                                  const errMsg = err?.message || err?.error || JSON.stringify(err);
                                  addNotification?.(`Delete failed: ${errMsg}`, 'error');
                                }
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-md text-xs"
                            >Delete</button>
                          )}
                        </div>
                      )}
                    </div>
                    {showTime && (
                      <span className={cn("text-[10px] text-gray-600 px-1", isMe ? "text-right" : "text-left")}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input - Floating Style */}
        <div className="relative z-10 p-4">
          <form onSubmit={handleSend} className="relative">
            <div className="flex items-center gap-3 bg-white/[0.06] backdrop-blur-md rounded-2xl border border-white/[0.08] p-1.5 pl-5 shadow-xl shadow-black/20">
              <input
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="flex-1 bg-transparent py-3 outline-none text-white placeholder-gray-500 text-sm"
                placeholder={`Type a message...`}
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className={cn(
                  "p-3.5 rounded-xl transition-all duration-200 flex-shrink-0",
                  inputText.trim()
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-900/30 hover:shadow-violet-900/50 hover:scale-[1.02] active:scale-95"
                    : "bg-white/[0.05] text-gray-600 cursor-not-allowed"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

const AchievementsView = ({ userStats }) => {
  const achievements = [
    { id: 'first-checkin', title: 'First Check-in', desc: 'Checked in for the first time', earned: true, icon: '📍', color: 'from-emerald-400 to-teal-500', reward: 50 },
    { id: 'streak-5', title: 'Streak Master', desc: 'Reach a 5-day study streak', earned: false, progress: 60, icon: '🔥', color: 'from-orange-400 to-red-500', reward: 500 },
    { id: 'vibe-creator', title: 'Vibe Creator', desc: 'Create your first vibe event', earned: true, icon: '✨', color: 'from-violet-400 to-fuchsia-500', reward: 200 },
    { id: 'night-owl', title: 'Night Owl', desc: 'Study after 10 PM', earned: false, progress: 30, icon: '🦉', color: 'from-indigo-400 to-blue-500', reward: 300 },
    { id: 'social-butterfly', title: 'Social Butterfly', desc: 'Join 5 different vibes', earned: false, progress: 20, icon: '🦋', color: 'from-pink-400 to-rose-500', reward: 1000 }
  ];

  const leaderboard = [
    { id: 'u1', name: 'Riya Sharma', score: 1280, rank: 1, change: 'up', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riya' },
    { id: 'u2', name: 'Arjun Mehta', score: 1180, rank: 2, change: 'same', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun' },
    { id: 'u3', name: 'You', score: userStats?.overview?.totalCoins || 0, rank: 3, change: 'up', avatar: null },
    { id: 'u4', name: 'Priya P.', score: 950, rank: 4, change: 'down', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
    { id: 'u5', name: 'Dev Patel', score: 820, rank: 5, change: 'down', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dev' },
  ];

  const badges = [
    { name: 'Top 10%', color: 'from-amber-400 to-yellow-600', icon: '🌟' },
    { name: 'Night Owl', color: 'from-indigo-500 to-blue-700', icon: '🌙' },
    { name: 'Streak 10', color: 'from-rose-500 to-red-700', icon: '🔥' },
    { name: 'Early Bird', color: 'from-sky-400 to-cyan-600', icon: '🐦' }
  ];

  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">

        {/* Left Column: Hero Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* Holographic Level Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, rotateY: 5 }}
            className="relative overflow-hidden rounded-[2.5rem] p-8 aspect-[4/5] flex flex-col items-center justify-center text-center group bg-[#0f0f13] border border-white/5 shadow-2xl perspective-1000"
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-[80px] group-hover:bg-violet-600/30 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-[80px] group-hover:bg-fuchsia-600/20 transition-colors duration-700" />

            {/* Spinning Rings HUD */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] border border-white/10 rounded-full border-t-vibe-purple/50 animate-[spin_8s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] border border-white/5 rounded-full border-b-vibe-cyan/50 animate-[spin_12s_linear_infinite_reverse]" />

            <div className="relative z-10 space-y-6">
              <div className="relative w-36 h-36 mx-auto perspective-1000">
                <motion.div
                  className="w-full h-full relative preserve-3d"
                  animate={{ rotateY: [0, 10, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 animate-pulse blur-xl opacity-50" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#2a2a35] to-[#15151a] p-1 shadow-2xl border border-white/10 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent skew-x-12 animate-[shimmer_3s_infinite]" />
                    <Award className="w-16 h-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                  </div>

                  {/* Floating Level Badge */}
                  <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                    <div className="bg-black/80 backdrop-blur border border-white/20 px-4 py-1 rounded-full text-xs font-bold text-white shadow-lg">
                      Voyager
                    </div>
                  </div>
                </motion.div>
              </div>

              <div>
                <h2 className="text-5xl font-display font-bold text-white tracking-tight drop-shadow-md">12</h2>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mt-1">Current Level</p>
              </div>

              {/* XP Bar */}
              <div className="w-full space-y-2">
                <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  <span>2,450 XP</span>
                  <span>5,000 XP</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '65%' }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500 relative"
                  >
                    <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50 blur-[1px]" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards 2.0 */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div className="p-5 rounded-[2rem] bg-[#0c0c14] border border-white/5 relative overflow-hidden group hover:bg-[#12121c] transition-colors">
              <div className="absolute top-2 right-2 p-2 rounded-full bg-amber-500/10 text-amber-500">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              </div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">Total Coins</p>
              <p className="text-3xl font-bold text-white">{userStats?.overview?.totalCoins || 0}</p>
              <div className="mt-2 text-[10px] text-green-400 flex items-center gap-1">
                <span className="w-0.5 h-3 bg-green-500/50 rounded-full" /> +120 today
              </div>
            </motion.div>

            <motion.div className="p-5 rounded-[2rem] bg-[#0c0c14] border border-white/5 relative overflow-hidden group hover:bg-[#12121c] transition-colors">
              <div className="absolute top-2 right-2 p-2 rounded-full bg-orange-500/10 text-orange-500">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              </div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">Day Streak</p>
              <p className="text-3xl font-bold text-white">{userStats?.overview?.currentStreak || 0}</p>
              <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-1">
                Best: {Math.max(userStats?.overview?.currentStreak || 0, 14)} days
              </div>
            </motion.div>
          </div>
        </div>

        {/* Middle Column: Premium Achievement List */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-2xl font-display font-bold text-white">Milestones</h3>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 font-mono">2 / 5</span>
          </div>

          <div className="space-y-4">
            {achievements.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + (idx * 0.1) }}
                className={cn(
                  "relative p-1 rounded-[2rem] transition-all duration-300 group",
                  item.earned ? "bg-gradient-to-r from-white/10 to-white/5" : "bg-white/5 hover:bg-white/10"
                )}
              >
                <div className={cn(
                  "relative rounded-[1.8rem] p-4 flex items-center gap-4 h-full",
                  item.earned ? "bg-[#0a0a0f]" : "bg-[#0a0a0f]/80"
                )}>

                  {/* Icon Container */}
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-2xl shadow-lg relative overflow-hidden",
                    item.earned ? `bg-gradient-to-br ${item.color}` : "bg-white/5"
                  )}>
                    {item.earned && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                    <span className={cn(item.earned ? "grayscale-0 scale-110" : "grayscale opacity-50 scale-90")}>{item.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={cn("font-bold text-base", item.earned ? "text-white" : "text-gray-400")}>{item.title}</h4>
                      {item.earned ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                      ) : (
                        <div className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          +{item.reward} 🪙
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">{item.desc}</p>

                    {!item.earned && item.progress > 0 && (
                      <div className="mt-3 relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={cn("absolute inset-y-0 left-0 bg-gradient-to-r", item.color)}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Leaderboard & Badges */}
        <div className="lg:col-span-3 space-y-6">
          {/* Leaderboard Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#0c0c14] border border-white/10 rounded-[2.5rem] p-6 relative overflow-hidden flex flex-col"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-vibe-cyan/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-xl font-display font-bold text-white">Top 5</h3>
              <button className="text-xs text-vibe-purple hover:text-white transition">View All</button>
            </div>

            <div className="space-y-4 relative z-10 flex-1">
              {leaderboard.map((user, i) => (
                <div key={user.id} className="flex items-center gap-3 group">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border",
                    i === 0 ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50" :
                      i === 1 ? "bg-gray-400/20 text-gray-300 border-gray-400/50" :
                        i === 2 ? "bg-amber-700/20 text-amber-600 border-amber-700/50" :
                          "bg-white/5 text-gray-500 border-transparent"
                  )}>
                    {user.rank}
                  </div>

                  <div className="relative">
                    <img src={user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=user`} className="w-9 h-9 rounded-full bg-black object-cover border border-white/10" />
                    {i < 3 && <div className="absolute -top-1 -right-1 text-[10px]">👑</div>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium truncate", user.id === 'u3' ? "text-vibe-purple" : "text-white")}>{user.name}</p>
                    <p className="text-[10px] text-gray-500">{user.score} XP</p>
                  </div>

                  <div className={cn(
                    "text-[10px] font-bold",
                    user.change === 'up' ? "text-green-500" : user.change === 'down' ? "text-red-500" : "text-gray-600"
                  )}>
                    {user.change === 'up' ? '▲' : user.change === 'down' ? '▼' : '-'}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 3D Badges Collection */}
          <div className="bg-[#0c0c14] border border-white/10 rounded-[2.5rem] p-6 relative overflow-hidden">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Badges</h3>
            <div className="flex flex-wrap gap-3">
              {badges.map((b) => (
                <motion.div
                  key={b.name}
                  whileHover={{ y: -5, rotateX: 10 }}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer transform transition-all border-b-4 border-black/50 active:border-b-0 active:translate-y-1 bg-gradient-to-br",
                    b.color
                  )}
                  title={b.name}
                >
                  <span className="text-xl drop-shadow-md">{b.icon}</span>
                </motion.div>
              ))}
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center border-dashed text-gray-500">
                <Plus className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div >
    </div >
  );
};

const SocialView = ({ events, onChatWith, onJoinEvent, onOpenEventChat, currentUser }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[800px] grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className={cn("col-span-2 p-8", CARD_STYLE)}>
      <h2 className="text-3xl font-display font-bold mb-6">Your Squad</h2>
      <div className="grid grid-cols-2 gap-4">
        {SQUAD_MEMBERS.map(member => (
          <div key={member.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.seed}`} className="w-14 h-14 rounded-full border-2 border-white/10" />
            <div>
              <h4 className="font-bold">{member.name}</h4>
              <p className="text-xs text-gray-400">{member.status}</p>
            </div>
            <button
              onClick={() => onChatWith?.(member)}
              className="ml-auto px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:scale-105 transition"
            >
              Chat
            </button>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const isJoined = event.attendees?.includes(currentUser?.id);
                    if (isJoined) return;
                    onJoinEvent?.(event.id);
                  }}
                  className={cn(
                    "text-xs font-bold transition",
                    event.attendees?.includes(currentUser?.id)
                      ? "text-green-400 cursor-default"
                      : "text-white hover:text-vibe-purple"
                  )}
                >
                  {event.attendees?.includes(currentUser?.id) ? "Joined" : "Join Event →"}
                </button>
                <button
                  onClick={() => {
                    const isJoined = event.attendees?.includes(currentUser?.id);
                    if (!isJoined) return;
                    onOpenEventChat?.(event);
                  }}
                  className={cn(
                    "text-[11px] px-2 py-1 rounded-md transition",
                    event.attendees?.includes(currentUser?.id)
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-white/5 text-gray-500 cursor-not-allowed"
                  )}
                >
                  Chat
                </button>
              </div>
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

const SettingsView = ({ currentUser, onLogout, onUpdateProfile }) => {
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
    // Simulate save
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
                <img src={currentUser?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${form.username || 'user'}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
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
                      <p className="text-xs text-gray-500 mt-1">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Accent Color</label>
              <div className="p-6 rounded-3xl bg-[#15151a] border border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-vibe-purple to-vibe-cyan flex items-center justify-center text-white shadow-lg">
                      <Palette className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Brand Color</h4>
                      <p className="text-sm text-gray-500">Choose your vibe signature.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {['bg-vibe-purple', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500'].map((c, i) => (
                      <div key={c} className={cn(
                        "w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition border-2 border-transparent hover:border-white shadow-lg",
                        c,
                        i === 0 && "ring-2 ring-white ring-offset-2 ring-offset-[#15151a]"
                      )} />
                    ))}
                  </div>
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
              {['Event Reminders', 'Chat Messages', 'Friend Requests', 'Leaderboard Updates', 'Vibe Recommendations'].map((item, i) => (
                <div key={item} className="flex items-center justify-between p-5 rounded-3xl bg-[#15151a] border border-white/5 hover:border-white/10 transition group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      i === 0 ? "bg-amber-500/20 text-amber-500" :
                        i === 1 ? "bg-vibe-cyan/20 text-vibe-cyan" :
                          "bg-white/10 text-gray-400"
                    )}>
                      <Bell className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-white">{item}</span>
                  </div>
                  <div className={cn(
                    "w-14 h-8 rounded-full p-1 cursor-pointer transition-colors",
                    i < 3 ? "bg-vibe-purple" : "bg-white/10"
                  )}>
                    <div className={cn(
                      "w-6 h-6 bg-white rounded-full shadow-lg transition-transform",
                      i < 3 ? "translate-x-6" : "translate-x-0"
                    )} />
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
      {/* Sidebar */}
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

      {/* Main Content */}
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
  const [notificationFeed, setNotificationFeed] = useState([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New state for backend connection
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeCheckin, setActiveCheckin] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [activeChannel, setActiveChannel] = useState('global');
  const [dmChannels, setDmChannels] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const activeTabRef = useRef(activeTab);
  const activeChannelRef = useRef(activeChannel);
  const channelLabelRef = useRef({});

  // Load user data function
  const loadUserData = async () => {
    try {
      const data = await user.getProfile();
      setCurrentUser(data.user);
      const stats = await user.getStats();
      setUserStats(stats);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  // Check for existing token and load user
  // Supabase Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadUserData();
      } else {
        setCurrentUser(null);
        setUserStats(null);
      }
    });

    return () => subscription.unsubscribe();
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
          setEventsData(eventRes.events.map(mapEvent));
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

  // Realtime notifications for new vibes
  useEffect(() => {
    const channel = supabase
      .channel('events-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, (payload) => {
        if (payload?.new) {
          if (currentUser?.id && payload.new.creator_id === currentUser.id) return;
          const newEvent = mapEvent(payload.new);
          setEventsData(prev => (prev.some(e => e.id === newEvent.id) ? prev : [newEvent, ...prev]));
          addNotificationItem(`New vibe created: ${newEvent.title}`, 'success', 'vibe');
          addNotification('New vibe just dropped ✨', 'info');
        }
      })
      .subscribe();

    return () => {
      if (channel?.unsubscribe) channel.unsubscribe();
    };
  }, [currentUser]);

  // Realtime notifications for chats (global + DMs)
  useEffect(() => {
    if (!currentUser) return;

    const channelsToWatch = [...DEFAULT_CHAT_CHANNELS.map(c => c.id), ...dmChannels.map(c => c.id)];
    const uniqueChannels = Array.from(new Set(channelsToWatch));
    const subscriptions = uniqueChannels.map((channelId) =>
      chat.subscribeToMessages(channelId, (newMessage) => {
        if (!newMessage || newMessage.sender_id === currentUser.id) return;

        const isActiveChat = activeTabRef.current === 'chat' && activeChannelRef.current === channelId;
        if (isActiveChat) return;

        const label = channelLabelRef.current[channelId] || channelId;
        const sender = newMessage.sender?.username || newMessage.sender?.full_name || 'Someone';
        const prefix = channelId === 'global' ? 'Global chat' : 'Chat';
        addNotificationItem(`${prefix} • ${label}: ${sender} — ${newMessage.text}`, 'info', channelId === 'global' ? 'global-chat' : 'chat');
        addNotification(`New message in ${label}`, 'info');
      })
    );

    return () => {
      subscriptions.forEach((sub) => sub?.unsubscribe && sub.unsubscribe());
    };
  }, [currentUser, dmChannels]);

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

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    activeChannelRef.current = activeChannel;
  }, [activeChannel]);

  const addNotification = (msg, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const addNotificationItem = (msg, type = 'info', category = 'general') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const createdAt = new Date().toISOString();
    setNotificationFeed(prev => [{ id, msg, type, category, createdAt, read: false }, ...prev].slice(0, 50));
  };

  const markAllNotificationsRead = () => {
    setNotificationFeed(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleAuth = async (userData) => {
    setCurrentUser(userData);
    addNotification(`Welcome, ${userData.full_name || userData.fullName || userData.username}!`);

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
        location_name: data.locationName || 'Campus',
        start_time: new Date().toISOString(),
        coords: data.coords || { x: 600, y: 450 },
        is_major: data.isMajor || false
      });

      if (res.event) {
        setEventsData(prev => [mapEvent(res.event), ...prev]);
        addNotification("Vibe Created! Check the Social tab. 🔥");
        addNotificationItem(`Your vibe is live: ${res.event.title || 'New Vibe'}`, 'success', 'vibe');
      }
    } catch (err) {
      console.error(err);
      addNotification(err.message || "Failed to create vibe", "error");
    }
  };

  // Join event handler
  const handleJoinEvent = async (eventId) => {
    if (!currentUser) {
      setShowAuthModal(true);
      addNotification("Please sign in to join vibes!", "error");
      return;
    }

    try {
      const res = await events.join(eventId);
      if (res.alreadyJoined) {
        addNotification("You've already joined this vibe!", "info");
      } else if (res.joined) {
        // Update local state
        setEventsData(prev => prev.map(e =>
          e.id === eventId ? mapEvent(res.event) : e
        ));
        const joinedEvent = mapEvent(res.event);
        ensureEventChannel(joinedEvent);
        setActiveChannel(`event-${joinedEvent.id}`);
        setActiveTab('chat');
        addNotification("Joined the vibe! 🎉");
      }
    } catch (err) {
      console.error(err);
      addNotification(err.message || "Failed to join vibe", "error");
    }
  };

  // Leave event handler
  const handleLeaveEvent = async (eventId) => {
    try {
      const res = await events.leave(eventId);
      if (res.left) {
        setEventsData(prev => prev.map(e =>
          e.id === eventId ? mapEvent(res.event) : e
        ));
        addNotification("Left the vibe");
      }
    } catch (err) {
      console.error(err);
      addNotification(err.message || "Failed to leave vibe", "error");
    }
  };

  // Delete event handler
  const handleDeleteEvent = async (eventId) => {
    try {
      const res = await events.delete(eventId);
      if (res.deleted) {
        setEventsData(prev => prev.filter(e => e.id !== eventId));
        addNotification("Vibe deleted successfully");
      }
    } catch (err) {
      console.error(err);
      addNotification(err.message || "Failed to delete vibe", "error");
    }
  };

  const handleCheckIn = async (loc) => {
    if (!currentUser) {
      setShowAuthModal(true);
      addNotification('Please sign in to check in', 'error');
      return;
    }

    const isCurrentlyJoined = joined.has(loc.id);

    // Helper function to update location occupancy
    const updateLocationOccupancy = (locationId, increment) => {
      setLocations(prevLocations => prevLocations.map(location => {
        if (location.id === locationId) {
          const currentPeople = (location.currentPeople || Math.round((location.occupancy / 100) * location.capacity));
          const newPeople = Math.max(0, Math.min(location.capacity, currentPeople + increment));
          const newOccupancy = Math.round((newPeople / location.capacity) * 100);
          return {
            ...location,
            currentPeople: newPeople,
            occupancy: newOccupancy
          };
        }
        return location;
      }));

      // Also update selectedLoc if it's the same location
      if (selectedLoc && selectedLoc.id === locationId) {
        setSelectedLoc(prev => {
          if (!prev || prev.id !== locationId) return prev;
          const currentPeople = (prev.currentPeople || Math.round((prev.occupancy / 100) * prev.capacity));
          const newPeople = Math.max(0, Math.min(prev.capacity, currentPeople + increment));
          const newOccupancy = Math.round((newPeople / prev.capacity) * 100);
          return {
            ...prev,
            currentPeople: newPeople,
            occupancy: newOccupancy
          };
        });
      }
    };

    if (isCurrentlyJoined) {
      // Check out
      try {
        if (activeCheckin && activeCheckin.locationId === loc.id) {
          const result = await checkins.checkOut(activeCheckin.id, {});
          setActiveCheckin(null);
          addNotification(`Checked out! Earned ${result.coins_earned || 50} coins 🪙`);

          // Reload user stats
          try {
            const stats = await user.getStats();
            setUserStats(stats);
          } catch (err) {
            console.log('Could not reload stats');
          }
        } else {
          // Fallback checkout (for demo/local mode)
          addNotification(`Checked out from ${loc.name}!`);
        }

        // Remove from joined set
        const newJoined = new Set(joined);
        newJoined.delete(loc.id);
        setJoined(newJoined);

        // Decrease occupancy
        updateLocationOccupancy(loc.id, -1);

      } catch (err) {
        // Even on error, allow local checkout
        console.error(err);
        const newJoined = new Set(joined);
        newJoined.delete(loc.id);
        setJoined(newJoined);

        // Decrease occupancy
        updateLocationOccupancy(loc.id, -1);

        addNotification(`Checked out from ${loc.name}!`);
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
          id: result.id,
          locationName: loc.name,
          locationId: loc.id
        });
        setJoined(new Set(joined).add(loc.id));

        // Increase occupancy
        updateLocationOccupancy(loc.id, 1);

        addNotification(`Checked in to ${loc.name}! +${result.coins_earned || 20} coins 🪙`);
      } catch (err) {
        // Fallback to local check-in for demo
        console.error(err);
        setJoined(new Set(joined).add(loc.id));

        // Increase occupancy
        updateLocationOccupancy(loc.id, 1);

        addNotification(`Welcome to ${loc.name}!`);
      }
    }
  };

  const filteredLocations = useMemo(() => {
    return locations.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.desc.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [locations, searchQuery]);

  const chatChannels = useMemo(() => {
    const merged = [...DEFAULT_CHAT_CHANNELS, ...dmChannels];
    const seen = new Set();
    return merged.filter((ch) => {
      if (seen.has(ch.id)) return false;
      seen.add(ch.id);
      return true;
    });
  }, [dmChannels]);

  useEffect(() => {
    const map = {};
    chatChannels.forEach((ch) => {
      map[ch.id] = ch.label;
    });
    channelLabelRef.current = map;
  }, [chatChannels]);

  const handleChatWith = (member) => {
    const channelId = `dm-${member.id}`;
    const channelLabel = member.name;
    setDmChannels((prev) => (prev.some((ch) => ch.id === channelId) ? prev : [...prev, { id: channelId, label: channelLabel }]));
    setActiveChannel(channelId);
    setActiveTab('chat');
  };

  const ensureEventChannel = (event) => {
    if (!event?.id) return;
    const channelId = `event-${event.id}`;
    const channelLabel = `${event.title} Chat`;
    setDmChannels((prev) => (prev.some((ch) => ch.id === channelId) ? prev : [...prev, { id: channelId, label: channelLabel }]));
  };

  const openEventChat = (event) => {
    if (!event?.id) return;
    ensureEventChannel(event);
    setActiveChannel(`event-${event.id}`);
    setActiveTab('chat');
  };

  const handleLeaveChannel = (channelId) => {
    // Remove the channel from dmChannels
    setDmChannels((prev) => prev.filter((ch) => ch.id !== channelId));

    // Switch to global channel if the user was in the channel they're leaving
    if (activeChannel === channelId) {
      setActiveChannel('global');
    }

    // Show notification
    const channelLabel = dmChannels.find((ch) => ch.id === channelId)?.label || channelId;
    addNotification(`Left "${channelLabel}" 👋`);
  };

  const handleSaveProfile = async (payload) => {
    const updated = await user.updateSettings(payload);
    setCurrentUser((prev) => ({
      ...prev,
      ...updated,
      fullName: updated.full_name || updated.fullName || prev?.fullName
    }));
    // Reload full profile to ensure consistency
    try {
      const data = await user.getProfile();
      setCurrentUser(data.user);
    } catch (e) { /* ignore */ }
  };

  const unreadCount = useMemo(() => notificationFeed.filter(n => !n.read).length, [notificationFeed]);

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
          currentUser={currentUser}
          onJoin={handleJoinEvent}
          onLeave={handleLeaveEvent}
          onDelete={handleDeleteEvent}
          onOpenEventChat={openEventChat}
        />;
      case 'map':
        return <FullMapView locations={locations} events={eventsData} selected={selectedLoc} onSelect={setSelectedLoc} />;
      case 'social':
        return <SocialView events={eventsData} onChatWith={handleChatWith} onJoinEvent={handleJoinEvent} onOpenEventChat={openEventChat} currentUser={currentUser} />;
      case 'chat':
        return <ChatView currentUser={currentUser} activeChannel={activeChannel} setActiveChannel={setActiveChannel} channels={chatChannels} addNotification={addNotification} addNotificationItem={addNotificationItem} onLeaveChannel={handleLeaveChannel} />;
      case 'achievements':
        return <AchievementsView userStats={userStats} />;
      case 'settings':
        return <SettingsView currentUser={currentUser} onLogout={handleLogout} onUpdateProfile={handleSaveProfile} />;
      default:
        return <DashboardView locations={locations} events={eventsData} />;
    }
  };

  return (
    <>
      {/* Animated Background */}
      <div className="app-background">
        <div className="aurora" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        <div className="grid-pattern" />
        <div className="particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>
        <div className="noise-overlay" />
      </div>

      <div className="min-h-screen pl-0 lg:pl-28 pr-4 py-4 lg:py-8 font-sans selection:bg-vibe-purple/30 relative z-10">
        <NavBar
          active={activeTab}
          setTab={setActiveTab}
          currentUser={currentUser}
          onOpenProfile={() => (currentUser ? setShowProfileModal(true) : setShowAuthModal(true))}
        />

        {/* Notifications */}
        <AnimatePresence>
          {notifications.map(n => (
            <Toast key={n.id} message={n.msg} type={n.type} />
          ))}
        </AnimatePresence>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuth={handleAuth} />
        <CreateVibeModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateVibe} />
        <AnimatePresence>
          {showProfileModal && (
            <ProfileModal
              isOpen={showProfileModal}
              onClose={() => setShowProfileModal(false)}
              currentUser={currentUser}
              onSave={handleSaveProfile}
            />
          )}
        </AnimatePresence>

        {/* Active Session Banner */}
        {activeCheckin && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 bg-vibe-purple/90 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center gap-4 shadow-2xl shadow-vibe-purple/30"
          >
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <span className="font-medium">Studying at {activeCheckin.locationName}</span>
            <button
              onClick={() => handleCheckIn({ id: activeCheckin.locationId })}
              className="px-4 py-2 bg-white text-black text-sm font-bold rounded-xl hover:scale-105 transition"
            >
              End Session
            </button>
          </motion.div>
        )}

        <div className="max-w-[1600px] mx-auto space-y-6">
          <header className="flex justify-between items-center px-4 py-2">
            <div className="flex items-center gap-5">

              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl font-display font-bold text-white tracking-tight"
                >
                  VibeSRM
                </motion.h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-gray-500 text-sm">Your campus, connected</p>
                  {backendConnected && (
                    <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 text-[10px] rounded-md flex items-center gap-1 font-medium">
                      <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden md:block">
                <div className="text-3xl font-bold font-display text-white">{time}</div>
                <div className="text-sm text-vibe-purple font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-white text-black font-bold rounded-2xl hover:scale-105 transition flex items-center gap-2 shadow-lg shadow-white/10 btn-glow"
              >
                <Plus className="w-5 h-5" /> Create Vibe
              </button>

              {/* Auth Button */}
              {currentUser ? (
                <div className="relative group">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="w-12 h-12 rounded-full border-2 border-vibe-purple overflow-hidden hover:scale-105 transition shadow-lg shadow-vibe-purple/20"
                  >
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.username}`} alt="User" className="w-full h-full object-cover" />
                  </button>
                  <div className="absolute right-0 top-14 w-48 glass-card rounded-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="px-3 py-2 border-b border-white/10 mb-2">
                      <p className="font-bold text-white">{currentUser.full_name || currentUser.fullName || currentUser.username}</p>
                      <p className="text-xs text-gray-400">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => setShowProfileModal(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 text-white transition"
                    >
                      <UserIcon className="w-4 h-4" /> Profile
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 text-vibe-rose transition">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-vibe-purple to-vibe-cyan text-white font-bold rounded-2xl hover:scale-105 transition flex items-center gap-2 shadow-lg shadow-vibe-purple/30"
                >
                  <LogIn className="w-5 h-5" /> Sign In
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotificationPanel(prev => {
                      const next = !prev;
                      if (!prev && notificationFeed.length > 0) markAllNotificationsRead();
                      return next;
                    });
                  }}
                  className="w-12 h-12 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-vibe-rose text-white text-[10px] rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotificationPanel && (
                  <NotificationPanel
                    items={notificationFeed}
                    onClear={() => setNotificationFeed([])}
                    onClose={() => setShowNotificationPanel(false)}
                  />
                )}
              </div>
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
    </>
  );
}
