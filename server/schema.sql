-- VibeSRM Database Schema

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    total_hours DECIMAL(10, 2) DEFAULT 0,
    total_coins INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_checkin_date DATE,
    ghost_mode_default BOOLEAN DEFAULT false,
    location_sharing_level VARCHAR(20) DEFAULT 'exact',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Locations Table
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    capacity INTEGER DEFAULT 100,
    current_occupancy INTEGER DEFAULT 0,
    amenities JSONB DEFAULT '{}',
    photo_url TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Check-ins Table
CREATE TABLE checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    subject VARCHAR(100),
    mode VARCHAR(20) DEFAULT 'solo',
    ghost_name VARCHAR(50),
    planned_duration INTEGER,
    actual_duration INTEGER,
    focus_score INTEGER,
    coins_earned INTEGER DEFAULT 0,
    noise_level INTEGER,
    temperature_rating INTEGER,
    crowdedness_rating INTEGER,
    outlet_availability BOOLEAN,
    experience_rating INTEGER,
    feedback TEXT,
    checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checked_out_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Noise Reports Table
CREATE TABLE noise_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    noise_level INTEGER NOT NULL,
    source VARCHAR(20) DEFAULT 'manual',
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Achievements Table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    requirement_type VARCHAR(50),
    requirement_value INTEGER,
    coin_reward INTEGER DEFAULT 0,
    icon_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Achievements Table
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- Friendships Table
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);

-- Study Invites Table
CREATE TABLE study_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ghost Encouragements Table
CREATE TABLE ghost_encouragements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    to_checkin_id UUID REFERENCES checkins(id) ON DELETE CASCADE,
    emoji VARCHAR(10) NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Predictions Cache Table
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    prediction_time TIMESTAMP NOT NULL,
    predicted_occupancy INTEGER,
    confidence DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add coordinates and extra stats to locations
ALTER TABLE locations ADD COLUMN IF NOT EXISTS map_x INTEGER;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS map_y INTEGER;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS occupancy_percent INTEGER DEFAULT 0;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS active_users INTEGER DEFAULT 0;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS avg_noise INTEGER DEFAULT 30;

-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'study',
    location_name VARCHAR(100) NOT NULL,
    map_x INTEGER NOT NULL,
    map_y INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_major BOOLEAN DEFAULT false,
    attendees UUID[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Locations
INSERT INTO locations (name, type, latitude, longitude, map_x, map_y, capacity, description)
VALUES 
('Tech Park Library', 'library', 12.823, 80.044, 650, 465, 500, 'Quiet Zone • Level 3'),
('Java Lounge', 'cafe', 12.824, 80.045, 950, 250, 150, 'Fresh Brews • Fast WiFi'),
('Main Tech Park', 'gym', 12.825, 80.046, 250, 670, 200, 'Innovation Center'),
('Innovation Hub', 'study', 12.826, 80.047, 940, 530, 80, 'Hackathon in progress'),
('Sports Complex', 'other', 12.827, 80.048, 900, 650, 300, 'Olympic Pool'),
('Academic Block A', 'study', 12.828, 80.049, 250, 325, 100, 'CSE Dept')
ON CONFLICT DO NOTHING;

-- Indexes for performance
-- Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    channel_id TEXT NOT NULL, -- e.g. 'global', 'study', or a room ID
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_time ON messages(created_at);

-- Seed global channel
-- (No initial messages needed)

CREATE INDEX IF NOT EXISTS idx_checkins_user ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_location ON checkins(location_id);
CREATE INDEX IF NOT EXISTS idx_checkins_active ON checkins(is_active);
CREATE INDEX IF NOT EXISTS idx_events_major ON events(is_major);
CREATE INDEX IF NOT EXISTS idx_events_time ON events(start_time);

-- Achievement Progress Table (tracks progress toward requirements)
CREATE TABLE IF NOT EXISTS achievement_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    progress_value INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- Badges Table
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Badges Table
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);

-- Leaderboard Table (computed leaderboard per period)
CREATE TABLE IF NOT EXISTS leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period VARCHAR(20) NOT NULL, -- daily | weekly | monthly | all_time
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard Entries Table
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leaderboard_id UUID REFERENCES leaderboards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    rank INTEGER NOT NULL DEFAULT 0,
    stats JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(leaderboard_id, user_id)
);

-- Indexes for achievements and leaderboard
CREATE INDEX IF NOT EXISTS idx_achievement_progress_user ON achievement_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_leaderboard ON leaderboard_entries(leaderboard_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_rank ON leaderboard_entries(rank);
