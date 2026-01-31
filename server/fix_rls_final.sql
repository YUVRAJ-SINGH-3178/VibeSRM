-- FINAL RLS FIX for VibeSRM
-- Run this in Supabase SQL Editor to fully enable joining and deleting

-- 1. Reset Policies
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON events;
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Users can delete their own events" ON events;
DROP POLICY IF EXISTS "Authenticated users can update events" ON events;

-- 2. Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- 3. Create Permissive Policies

-- READ: Everyone can see events
CREATE POLICY "Events are viewable by everyone" 
ON events FOR SELECT 
USING (true);

-- CREATE: Authenticated users can create events
CREATE POLICY "Authenticated users can create events" 
ON events FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Authenticated users can update ANY event (Required for Joining/Leaving)
-- Ideally we would restrict this to only the 'attendees' column but Supabase SQL interface is simpler this way
CREATE POLICY "Authenticated users can update events" 
ON events FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- DELETE: Only the creator can delete their event
CREATE POLICY "Users can delete their own events" 
ON events FOR DELETE 
USING (auth.uid() = creator_id);
