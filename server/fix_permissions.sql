-- 🚨 RUN THIS IN SUPABASE SQL EDITOR TO FIX PERMISSIONS 🚨

-- 1. Disable RLS (Row Level Security) on all tables to allow public read/write
-- (Since we are prototyping, this is the quickest fix. For production, we would add policies)

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_invites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ghost_encouragements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions DISABLE ROW LEVEL SECURITY;

-- 2. Ensure the messages table has the correct foreign key
-- (This might fail if it already exists, that's fine)
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey,
ADD CONSTRAINT messages_sender_id_fkey 
    FOREIGN KEY (sender_id) 
    REFERENCES public.users(id) 
    ON DELETE CASCADE;

-- 3. Double check the public.users table exists and permissions are open
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
