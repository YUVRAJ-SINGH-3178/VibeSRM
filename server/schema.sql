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

-- Indexes for performance
CREATE INDEX idx_checkins_user ON checkins(user_id);
CREATE INDEX idx_checkins_location ON checkins(location_id);
CREATE INDEX idx_checkins_active ON checkins(is_active);
CREATE INDEX idx_noise_reports_location ON noise_reports(location_id);
CREATE INDEX idx_noise_reports_time ON noise_reports(reported_at);
CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_predictions_location_time ON predictions(location_id, prediction_time);
