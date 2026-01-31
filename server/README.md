# VibeSRM Backend

Production-ready backend API for VibeSRM Smart Campus Assistant.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Create database**
   ```bash
   createdb vibesrm
   ```

4. **Run migrations**
   ```bash
   psql -U postgres -d vibesrm -f schema.sql
   psql -U postgres -d vibesrm -f seed.sql
   ```

5. **Start Redis**
   ```bash
   redis-server
   ```

6. **Start server**
   ```bash
   npm run dev
   ```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Check-ins
- `POST /api/checkins/checkin` - Check in to location (requires GPS)
- `POST /api/checkins/checkout` - Check out with feedback
- `GET /api/checkins/active` - Get active check-in

### Locations
- `GET /api/locations` - Get all locations (with filters)
- `GET /api/locations/:id` - Get location details
- `GET /api/locations/noise/heatmap` - Get noise heatmap
- `GET /api/locations/:id/noise/history` - Get noise history

## 🔐 Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

## 🎮 Features Implemented

✅ User authentication with JWT  
✅ GPS-verified check-ins (50m radius)  
✅ Coin reward system  
✅ Ghost mode with random names  
✅ Noise level tracking & heatmap  
✅ Real-time occupancy updates (Socket.io)  
✅ Location filtering & search  
✅ 6-hour occupancy predictions  
✅ Condition reporting (noise, temp, crowdedness)  
✅ Achievement system  

## 📊 Database Schema

See `schema.sql` for complete database structure.

## 🔧 Environment Variables

See `.env.example` for all configuration options.
