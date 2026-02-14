import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

import { supabase } from './supabase';
import { auth, user, checkins, events, chat } from './utils/database';
import {
  INITIAL_LOCATIONS,
  DEFAULT_CHAT_CHANNELS,
} from './utils/constants';
import { useTheme } from './ThemeContext';

// Components
import { NavBar } from './components/NavBar';
import { Toast } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { CreateVibeModal } from './components/CreateVibeModal';
import { ProfileModal } from './components/ProfileModal';
import { DashboardView } from './components/DashboardView';
import { FullMapView } from './components/FullMapView';
import { SocialView } from './components/SocialView';
import { ChatView } from './components/ChatView';

import { SettingsView } from './components/SettingsView';
import { ValentineParticles } from './components/ValentineParticles';
import { TribeView } from './components/TribeView';

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
  creator_id: e.creator_id,
  image: e.image_url || e.photo_url || e.image || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80"
});

const ThemeOverlay = () => {
  const { themeId } = useTheme();
  if (themeId === 'valentine') return <ValentineParticles />;
  return null;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [locations, setLocations] = useState(INITIAL_LOCATIONS);
  const [eventsData, setEventsData] = useState([]);
  const [joined, setJoined] = useState(new Set());
  const [notifications, setNotifications] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeCheckin, setActiveCheckin] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [activeChannel, setActiveChannel] = useState('global');
  const [dmChannels, setDmChannels] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);


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

  const addNotification = (msg, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const addNotificationItem = (msg, category = 'info') => {
    addNotification(msg, category === 'error' ? 'error' : 'success');
  };

  const fetchEvents = async () => {
    try {
      const { events: data } = await events.getAll();
      setEventsData(data.map(mapEvent));
    } catch (e) {
      console.error('Fetch events error:', e);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAuth = (user) => {
    setCurrentUser(user);
    addNotification(`Welcome, ${user.username}! ✨`);
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      setCurrentUser(null);
      setUserStats(null);
      addNotification('Signed out safely', 'info');
    } catch (e) {
      console.error('Logout error:', e);
      addNotification('Failed to sign out', 'error');
    }
  };

  const handleCreateVibe = async (vibeData) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    try {
      await events.create(vibeData);
      addNotification('Vibe created successfully! 🚀');
      fetchEvents();
    } catch (e) {
      addNotification('Failed to create vibe', 'error');
    }
  };

  const handleJoinEvent = async (eventId) => {
    if (!currentUser) return setShowAuthModal(true);
    try {
      await events.join(eventId);
      addNotification('Joined the vibe! ✌️');
      fetchEvents();
    } catch (e) {
      addNotification('Could not join vibe', 'error');
    }
  };

  const handleCheckIn = async (loc) => {
    if (!currentUser) {
      addNotification('Please sign in to check in', 'error');
      return;
    }
    const isCurrentlyJoined = joined.has(loc.id);

    if (isCurrentlyJoined) {
      setJoined(prev => { const n = new Set(prev); n.delete(loc.id); return n; });
      addNotification(`Checked out from ${loc.name}`);
    } else {
      setJoined(prev => new Set(prev).add(loc.id));
      addNotification(`Checked in to ${loc.name}!`);
    }

    try {
      if (isCurrentlyJoined) {
        if (activeCheckin && activeCheckin.locationId === loc.id) {
          await checkins.checkOut(activeCheckin.id);
          setActiveCheckin(null);
        }
      } else {
        const res = await checkins.checkIn(loc.id, 0, 0, 'General', 'solo', 60);
        setActiveCheckin({ id: res.id, locationName: loc.name, locationId: loc.id });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChatWith = (member) => {
    const channelId = `dm-${member.id}`;
    const channelLabel = member.name;
    setDmChannels((prev) => (prev.some((ch) => ch.id === channelId) ? prev : [...prev, { id: channelId, label: channelLabel }]));
    setActiveChannel(channelId);
    setActiveTab('chat');
  };

  const openEventChat = (event) => {
    if (!event?.id) return;
    const channelId = `event-${event.id}`;
    const channelLabel = `${event.title} Chat`;
    setDmChannels((prev) => (prev.some((ch) => ch.id === channelId) ? prev : [...prev, { id: channelId, label: channelLabel }]));
    setActiveChannel(channelId);
    setActiveTab('chat');
  };

  const handleLeaveChannel = (channelId) => {
    setDmChannels((prev) => prev.filter((ch) => ch.id !== channelId));
    if (activeChannel === channelId) setActiveChannel('global');
    const channelLabel = dmChannels.find((ch) => ch.id === channelId)?.label || channelId;
    addNotification(`Left "${channelLabel}" 👋`);
  };

  const handleSaveProfile = async (payload) => {
    try {
      const updated = await user.updateSettings(payload);
      setCurrentUser((prev) => ({
        ...prev,
        ...updated,
        fullName: updated.full_name || updated.fullName || prev?.fullName
      }));
      const data = await user.getProfile();
      setCurrentUser(data.user);
      addNotification('Profile updated! ✨');
    } catch (e) {
      console.error('Profile save error:', e);
      addNotification('Failed to update profile', 'error');
    }
  };

  const chatChannels = useMemo(() => {
    const merged = [...DEFAULT_CHAT_CHANNELS, ...dmChannels];
    const seen = new Set();
    return merged.filter((ch) => {
      if (seen.has(ch.id)) return false;
      seen.add(ch.id);
      return true;
    });
  }, [dmChannels]);

  return (
    <>
      <div className="obsidian-bg" />
      <div className="spotlight spotlight-1" />
      <div className="spotlight spotlight-2" />
      <div className="noise" />

      {/* Theme Specific Overlays */}
      <ThemeOverlay />

      {/* Main Container - Adjusted for Floating Nav */}
      <div className="min-h-screen font-sans text-white relative z-10 lg:pl-32">

        <NavBar
          active={activeTab}
          setTab={setActiveTab}
          currentUser={currentUser}
          onOpenProfile={() => (currentUser ? setShowProfileModal(true) : setShowAuthModal(true))}
          onCreateVibe={() => setShowCreateModal(true)}
        />

        {/* Global Notifications */}
        <div role="status" aria-live="polite" aria-label="Notifications">
          <AnimatePresence>
            {notifications.map(n => (
              <Toast key={n.id} message={n.msg} type={n.type} />
            ))}
          </AnimatePresence>
        </div>

        {/* Global Modals */}
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

        {/* Active Session Floater */}
        <AnimatePresence>
          {activeCheckin && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-24 lg:bottom-10 right-10 z-50 px-6 py-4 bg-[#1a1a1f] backdrop-blur-xl rounded-full border border-vibe-purple/50 flex items-center gap-4 shadow-[0_0_30px_rgba(139,92,246,0.2)]"
            >
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#4ade80]" />
              <span className="font-bold text-sm">Session Active: {activeCheckin.locationName}</span>
              <button
                onClick={() => handleCheckIn({ id: activeCheckin.locationId, name: activeCheckin.locationName })}
                className="p-1 hover:bg-white/10 rounded-full transition"
                aria-label={`Check out from ${activeCheckin.locationName}`}
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area with Transitions */}
        <main className="min-h-screen relative" role="main" aria-label="Application content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >
              {/* DYNAMIC CONTENT RENDERING */}
              {activeTab === 'dashboard' && (
                <div className="h-full w-full">
                  <DashboardView
                    locations={locations}
                    events={eventsData}
                    selectedLoc={selectedLoc}
                    setSelectedLoc={setSelectedLoc}
                    joined={joined}
                    handleCheckIn={handleCheckIn}
                    userStats={userStats}
                    currentUser={currentUser}
                    addNotification={addNotification}
                  />
                </div>
              )}
              {activeTab === 'map' && (
                <div className="h-full w-full">
                  <FullMapView locations={locations} events={eventsData} selected={selectedLoc} onSelect={setSelectedLoc} />
                </div>
              )}
              {activeTab === 'tribe' && (
                <div className="pt-20 lg:pt-10 px-4 h-full w-full max-w-[1600px] mx-auto">
                  <TribeView currentUser={currentUser} onChatWith={handleChatWith} />
                </div>
              )}
              {activeTab === 'social' && (
                <div className="pt-20 lg:pt-10 px-4 h-full w-full max-w-[1600px] mx-auto">
                  <SocialView events={eventsData} onChatWith={handleChatWith} onJoinEvent={handleJoinEvent} onOpenEventChat={openEventChat} currentUser={currentUser} />
                </div>
              )}
              {activeTab === 'chat' && (
                // Chat fills height but respects nav padding
                <div className="h-[100vh] pt-20 lg:pt-0 px-4 w-full max-w-[1600px] mx-auto flex flex-col justify-center">
                  <ChatView currentUser={currentUser} activeChannel={activeChannel} setActiveChannel={setActiveChannel} channels={chatChannels} addNotification={addNotification} addNotificationItem={addNotificationItem} onLeaveChannel={handleLeaveChannel} />
                </div>
              )}
              {activeTab === 'settings' && (
                <div className="pt-20 lg:pt-10 px-4 h-full w-full">
                  <SettingsView
                    currentUser={currentUser}
                    onLogout={handleLogout}
                    onUpdateProfile={handleSaveProfile}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </>
  );
}
