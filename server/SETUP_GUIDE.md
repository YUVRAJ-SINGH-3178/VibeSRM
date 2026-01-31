# 🚀 VibeSRM Backend Setup Guide (MongoDB)

## ✅ Prerequisites

You already have **MongoDB** installed! We just need to make sure it's running.

---

## Step 1: Start MongoDB

1. **Check if MongoDB is running**
   ```bash
   mongod --version
   ```

2. **Start MongoDB** (if not already running)
   ```bash
   mongod
   ```
   Or on Windows, MongoDB usually runs as a service automatically.

3. **Verify connection**
   ```bash
   mongosh
   ```
   Type `exit` to quit the MongoDB shell.

---

## Step 2: Install Dependencies

```bash
cd server
npm install
```

This will install:
- Express (API server)
- Mongoose (MongoDB ODM)
- Socket.io (Real-time updates)
- JWT & bcrypt (Authentication)
- And more...

---

## Step 3: Seed the Database

```bash
npm run seed
```

This will:
- Create the `vibesrm` database
- Add 8 sample locations (libraries, cafes, gyms)
- Add 10 achievements
- Add sample noise reports

---

## Step 4: Start the Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
📊 Database: vibesrm
🚀 VibeSRM Server Running
   Port: 5000
```

---

## Step 5: Test the API

Open browser: **http://localhost:5000/health**

Should see:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "database": "connected"
}
```

---

## 🎯 Optional: Redis (for caching)

Redis is **optional** - the server works fine without it!

If you want caching:
1. Download: https://github.com/microsoftarchive/redis/releases
2. Install `Redis-x64-3.0.504.msi`
3. Redis will auto-start

---

## 🔧 Troubleshooting

**"MongoDB connection failed"**
- Make sure MongoDB is running: `mongod`
- Check if port 27017 is available

**"Port 5000 already in use"**
- Change `PORT=5000` to `PORT=5001` in `.env`

**"Module not found"**
- Run `npm install` again

---

## 📊 What's Created

**Collections:**
- `users` - User accounts
- `locations` - 8 campus locations
- `checkins` - Study session records
- `noisereports` - Noise level tracking
- `achievements` - 10 unlockable badges

---

## 🔗 Next Steps

1. Keep backend server running (this terminal)
2. Open new terminal
3. Go to main folder: `cd ..`
4. Start frontend: `npm run dev`
5. Open: http://localhost:5173

Both servers must run together!

---

## 🎮 API Endpoints

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/checkins/checkin` - Check in (GPS verified)
- `POST /api/checkins/checkout` - Check out
- `GET /api/locations` - Get all locations
- `GET /api/locations/:id` - Location details
- `GET /api/locations/noise/heatmap` - Noise map

See full docs in `README.md`
