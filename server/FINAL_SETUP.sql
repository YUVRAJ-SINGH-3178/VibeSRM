-- ==========================================
-- VibeSRM COMPLETE SETUP SCRIPT (Supabase)
-- ==========================================
-- Run this ENTIRE script in your Supabase SQL Editor.
-- It will creates tables, fix permissions, and seed data.

-- 1. CLEANUP (Optional - assumes fresh start or robust changes)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

-- 2. ENABLE EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. USERS TABLE (Linked to Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    total_hours DECIMAL(10, 2) DEFAULT 0,
    total_coins INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    map_x INTEGER DEFAULT 0, -- Canvas coordinates
    map_y INTEGER DEFAULT 0,
    capacity INTEGER DEFAULT 100,
    current_occupancy INTEGER DEFAULT 0,
    occupancy_percent INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    avg_noise INTEGER DEFAULT 30,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. MESSAGES TABLE (Chat)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    channel_id TEXT NOT NULL DEFAULT 'global',
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'study', -- study, club, sport
    location_name TEXT,
    map_x INTEGER,
    map_y INTEGER,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    creator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_major BOOLEAN DEFAULT false,
    attendees UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. CHECKINS TABLE
CREATE TABLE IF NOT EXISTS public.checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
    subject TEXT,
    is_active BOOLEAN DEFAULT true,
    coins_earned INTEGER DEFAULT 0,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    checked_out_at TIMESTAMP WITH TIME ZONE
);

-- 8. PERMISSIONS (DISABLE RLS FOR INSTANT ACCESS)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins DISABLE ROW LEVEL SECURITY;

-- 9. SEED INITIAL LOCATIONS
INSERT INTO public.locations (name, type, map_x, map_y, capacity, description)
VALUES 
('Tech Park Library', 'library', 650, 465, 500, 'Quiet Zone • Level 3'),
('Java Lounge', 'cafe', 950, 250, 150, 'Fresh Brews • Fast WiFi'),
('Main Gym', 'gym', 250, 670, 200, 'Innovation Center'),
('Hackathon Hub', 'study', 940, 530, 80, 'Coding in progress'),
('Sports Complex', 'other', 900, 650, 300, 'Olympic Pool'),
('Block A', 'study', 250, 325, 100, 'CSE Dept')
ON CONFLICT DO NOTHING;

-- 10. REALTIME SETUP (Allow listening to these tables)
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.checkins;
