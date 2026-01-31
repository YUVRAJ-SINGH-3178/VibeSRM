# ⚡ Supabase Setup Instructions

The app is now configured to use Supabase for Auth & Database. This allows your app to work on Vercel and for all users on any network!

### 1. Create your Supabase Project
1. Go to [Supabase.com](https://supabase.com) and create a new project.
2. Go to **Project Settings -> API** and copy your:
   - `Project URL`
   - `anon public` key

### 2. Update Environment Variables
In your local code, update `.env` or create `.env.local`:
```env
VITE_SUPABASE_URL=https://your-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run SQL Migration
Go to the **SQL Editor** in your Supabase dashboard and paste the contents of `server/schema.sql`. 
*This will create all the tables (Users, Locations, Checkins, etc.) needed for the app.*

### 4. Enable Authentication
1. Go to **Authentication -> Providers**.
2. Ensure **Email** is enabled.
3. (Optional) Disable "Confirm Email" if you want people to log in instantly without checking their mail.

### 5. Deployment
When you deploy to **Vercel**:
1. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Vercel Project Environment Variables.
2. The app will now work perfectly for everyone!

---
*The local Express server is no longer needed for the frontend to work, but you can keep it as a reference.*
