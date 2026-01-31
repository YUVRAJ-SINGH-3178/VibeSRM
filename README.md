# ⚡ VibeSRM

**Campusing Made Smart.**  
A premium, interactive Smart Campus Assistant designed to elevate your university experience with real-time insights, social connections, and a stunning "Midnight Neon" aesthetic.

---

## 🚀 Features

### 🍱 Bento Grid Dashboard
A modern, responsive dashboard layout that puts everything you need at a glance.
- **Live Occupancy**: Real-time tracking of libraries, gyms, and cafes.
- **Weekly Streaks**: Gamified stat tracking for your study sessions.
- **Quick Actions**: One-click check-ins and status updates.

### 🗺️ Interactive Campus Map
A fully immersive SVG-based map experience.
- **Visual Hotspots**: See where the vibe is with pulsing color-coded indicators.
- **Smart Filtering**: Toggle between Study zones, Food spots, and Gyms.
- **Instant Navigation**: Get details and directions instantly.

### 👥 "Squad" Social Hub
Stay connected with your campus circle.
- **Study Buddies**: See where your friends are studying in real-time.
- **Ping System**: Nudge your squad to join you for a coffee or study session.
- **Community Groups**: Discover and join trending campus communities.

### 💬 Integrated Chat
Seamless communication for your study groups.
- **Real-time Messaging**: Coordinate meetups without leaving the app.
- **Group Channels**: Dedicated spaces for your classes and clubs.

---

## 🛠️ Tech Stack

Built with a focus on performance and premium design.

- **Frontend**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Font**: Google Fonts (Space Grotesk & Inter)

---

## ⚡ Getting Started

### Frontend

1.  **Clone the repository**
    ```bash
    git clone https://github.com/YUVRAJ-SINGH-3178/VibeSRM.git
    cd VibeSRM
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

### Backend

1.  **Navigate to server directory**
    ```bash
    cd server
    npm install
    ```

2.  **Install PostgreSQL & Redis**
    - PostgreSQL 14+: [Download](https://www.postgresql.org/download/)
    - Redis: [Download for Windows](https://github.com/microsoftarchive/redis/releases)

3.  **Run setup script**
    ```bash
    setup.bat
    ```
    This will create the database, run migrations, and seed sample data.

4.  **Start Redis**
    ```bash
    redis-server
    ```

5.  **Start backend server**
    ```bash
    npm run dev
    ```
    Server runs on `http://localhost:5000`

---

## 🔌 API Features

The backend provides:
- ✅ **JWT Authentication** - Secure user sessions
- ✅ **GPS-Verified Check-ins** - 50m radius verification
- ✅ **Coin Economy** - Earn rewards for studying
- ✅ **Ghost Mode** - Anonymous studying with random names
- ✅ **Noise Heatmap** - Real-time noise level tracking
- ✅ **Smart Predictions** - 6-hour occupancy forecasts
- ✅ **Real-time Updates** - Socket.io for live data
- ✅ **Achievement System** - Unlock badges and rewards

See `server/README.md` for full API documentation.

---

## 🎨 Design Philosophy

VibeSRM abandons the boring, generic "admin panel" look for a **top-tier, app-like experience**.
- **Dark Mode First**: Deep charcoal backgrounds (`#050507`) reduce eye strain.
- **Glassmorphism**: Subtle frosting and borders for depth.
- **Micro-interactions**: Every button and card feels alive.

---

Made with 💜 by Yuvraj Singh
