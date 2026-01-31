-- VibeSRM Events RLS Policies Fix
-- Run this in Supabase SQL Editor to enable proper events visibility

-- Enable RLS on events table
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow everyone to READ all events (public visibility)
CREATE POLICY "Events are viewable by everyone" ON events
FOR SELECT USING (true);

-- Allow authenticated users to create events
CREATE POLICY "Authenticated users can create events" ON events
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow creators to update their own events
CREATE POLICY "Users can update their own events" ON events
FOR UPDATE USING (auth.uid() = creator_id);

-- Allow creators to delete their own events
CREATE POLICY "Users can delete their own events" ON events
FOR DELETE USING (auth.uid() = creator_id);

-- Enable RLS on messages table if not already
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read messages
CREATE POLICY "Messages are viewable by everyone" ON messages
FOR SELECT USING (true);

-- Allow authenticated users to send messages
CREATE POLICY "Authenticated users can send messages" ON messages
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to delete their own messages
CREATE POLICY "Users can delete their own messages" ON messages
FOR DELETE USING (auth.uid() = sender_id);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read basic user info
CREATE POLICY "Users are viewable by everyone" ON users
FOR SELECT USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON users
FOR UPDATE USING (auth.uid() = id);
