-- Run this in your Supabase SQL Editor to enable Tribe Discovery

-- 1. Add 'tags' column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- 2. Allow everyone to read tags (for matching)
CREATE POLICY "Public tags access" 
ON public.users FOR SELECT 
USING (true);

-- 3. Create friendships table for "Connect" feature
CREATE TABLE IF NOT EXISTS public.friendships (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    friend_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, friend_id)
);

-- 4. Allow users to manage their friendships
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships"
ON public.friendships FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend requests"
ON public.friendships FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their friendships"
ON public.friendships FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = friend_id);
