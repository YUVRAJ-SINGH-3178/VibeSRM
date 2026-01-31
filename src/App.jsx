import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Plus,
  LogOut,
  User as UserIcon,
  LogIn
} from 'lucide-react';

import { supabase } from './supabase';
import { auth, user, checkins, events, chat } from './utils/database';
import {
  cn,
  INITIAL_LOCATIONS,
  DEFAULT_CHAT_CHANNELS,
  CARD_STYLE
} from './utils/constants';

// Components
import { NavBar } from './components/NavBar';
import { Toast } from './components/Toast';
import { NotificationPanel } from './components/NotificationPanel';
import { AuthModal } from './components/AuthModal';
import { CreateVibeModal } from './components/CreateVibeModal';
import { ProfileModal } from './components/ProfileModal';
import { DashboardView } from './components/DashboardView';
import { FullMapView } from './components/FullMapView';
import { SocialView } from './components/SocialView';
import { ChatView } from './components/ChatView';
import { AchievementsView } from './components/AchievementsView';
import { SettingsView } from './components/SettingsView';

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
  creator_id: e.creator_id
});

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

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    activeChannelRef.current = activeChannel;
  }, [activeChannel]);

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
        setBackendConnected(true);
        loadUserData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setBackendConnected(true);
        loadUserData();
      } else {
        setCurrentUser(null);
        setBackendConnected(false);
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
    const newItem = {
      id: Date.now(),
      msg,
      category,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotificationFeed(prev => [newItem, ...prev]);

    if (!showNotificationPanel) {
      addNotification(msg, category === 'error' ? 'error' : 'success');
    }
  };

  const markAllNotificationsRead = () => {
    setNotificationFeed(prev => prev.map(n => ({ ...n, read: true })));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    setBackendConnected(true);
    addNotification(`Welcome, ${user.username}! ✨`);
  };

  const handleLogout = async () => {
    await auth.logout();
    setCurrentUser(null);
    setBackendConnected(false);
    addNotification('Signed out safely', 'info');
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

  const handleLeaveEvent = async (eventId) => {
    try {
      await events.leave(eventId);
      addNotification('Left the vibe', 'info');
      fetchEvents();
    } catch (e) {
      addNotification('Could not leave vibe', 'error');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await events.delete(eventId);
      addNotification('Vibe deleted', 'info');
      fetchEvents();
    } catch (e) {
      addNotification('Failed to delete vibe', 'error');
    }
  };

  const handleCheckIn = async (loc) => {
    if (!currentUser) {
      addNotification('Please sign in to check in', 'error');
      return;
    }

    const isCurrentlyJoined = joined.has(loc.id);

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
      try {
        if (activeCheckin && activeCheckin.locationId === loc.id) {
          const result = await checkins.checkOut(activeCheckin.id, {});
          setActiveCheckin(null);
          addNotification(`Checked out! Earned ${result.coins_earned || 50} coins 🪙`);
          try {
            const stats = await user.getStats();
            setUserStats(stats);
          } catch (err) { }
        } else {
          addNotification(`Checked out from ${loc.name}!`);
        }
        const newJoined = new Set(joined);
        newJoined.delete(loc.id);
        setJoined(newJoined);
        updateLocationOccupancy(loc.id, -1);
      } catch (err) {
        const newJoined = new Set(joined);
        newJoined.delete(loc.id);
        setJoined(newJoined);
        updateLocationOccupancy(loc.id, -1);
        addNotification(`Checked out from ${loc.name}!`);
      }
    } else {
      try {
        const latitude = loc.latitude || 12.9716;
        const longitude = loc.longitude || 77.5946;
        const result = await checkins.checkIn(loc.id, latitude, longitude, 'Studying', 'solo', 120);
        setActiveCheckin({ id: result.id, locationName: loc.name, locationId: loc.id });
        setJoined(new Set(joined).add(loc.id));
        updateLocationOccupancy(loc.id, 1);
        addNotification(`Checked in to ${loc.name}! +${result.coins_earned || 20} coins 🪙`);
      } catch (err) {
        setJoined(new Set(joined).add(loc.id));
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
    setDmChannels((prev) => prev.filter((ch) => ch.id !== channelId));
    if (activeChannel === channelId) setActiveChannel('global');
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
    try {
      const data = await user.getProfile();
      setCurrentUser(data.user);
    } catch (e) { }
  };

  const unreadCount = useMemo(() => notificationFeed.filter(n => !n.read).length, [notificationFeed]);

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
              onClick={() => handleCheckIn({ id: activeCheckin.locationId, name: activeCheckin.locationName })}
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

              {currentUser ? (
                <div className="relative group">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="w-12 h-12 rounded-full border-2 border-vibe-purple overflow-hidden hover:scale-105 transition shadow-lg shadow-vibe-purple/20"
                  >
                    <img src={currentUser.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.username}`} alt="User" className="w-full h-full object-cover" />
                  </button>
                  <div className="absolute right-0 top-14 w-48 glass-card rounded-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div className="px-3 py-2 border-b border-white/10 mb-2">
                      <p className="font-bold text-white truncate">{currentUser.full_name || currentUser.fullName || currentUser.username}</p>
                      <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
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
      </div>
    </>
  );
}
