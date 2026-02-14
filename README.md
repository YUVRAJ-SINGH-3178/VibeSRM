# VibeSRM - The Ultimate Campus Experience Platform

> **"Neon Streets. Digital Souls."**

VibeSRM is a futuristic, collaborative campus dashboard designed to gamify and streamline the student experience at SRM AP. It combines real-time location tracking, social connectivity, event management, and immersive theming into a single, high-performance web application.

![VibeSRM Banner](https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2000)

## 🌟 Key Features

### 🎨 immersive Theming Engine
Experience the campus through four distinct personalities. The entire UI—colors, icons, fonts, patterns, and language—shifts instantly.
-   **Cyberpunk**: High-contrast neon, tech icons, and digital grid patterns.
-   **Solar Flare**: Warm, soft, light mode with organic shapes.
-   **Vaporwave**: Retro-futuristic, 95-style aesthetics with glitch effects.
-   **Obsidian Gold**: Ultra-luxury, matte black, and gold pinstripes.

### 🗺️ Tactical Campus Map
-   **Real-time Visualization**: See live occupancy of hotspots (Library, Admin Block, Sports Complex).
-   **Interactive Bento Map**: A stylized, block-based map for quick navigation.
-   **Full Tactical View**: A detailed blueprint mode with heatmap overlays and empty classroom finders.

### 🤝 Social Squads & Networking
-   **Live Squad Status**: See where your friends are hanging out in real-time.
-   **Check-in System**: "Teleport" to locations to let others know you're there.
-   **Global Chat**: Connect with the entire campus or discuss specific topics in channels.

### 📅 Dynamic Event Hub
-   Discover major and minor events happening across campus.
-   Real-time "Live Feed" of campus activities.

## 🛠️ Tech Stack

-   **Frontend**: React 18, Vite
-   **Styling**: TailwindCSS, CSS Variables (Theming)
-   **Animation**: Framer Motion (Complex layout transitions, micro-interactions)
-   **Icons**: Lucide React (Dynamic icon switching)
-   **Backend / Database**: Supabase (Auth, Realtime, PostgreSQL)

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18+)
-   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/VibeSRM.git
    cd VibeSRM
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
    *(See `SUPABASE_SETUP.md` for database schema instructions)*

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## 📂 Project Structure

```
VibeSRM/
├── src/
│   ├── components/         # UI Components (Dashboard, Map, Auth, etc.)
│   ├── utils/
│   │   ├── database.js     # Supabase API Wrapper
│   │   └── constants.js    # Static Data & Config
│   ├── App.jsx             # Main Application Logic & Routing
│   ├── ThemeContext.jsx    # Theming Engine State
│   └── index.css           # Global Styles & Theme Variables
├── public/                 # Static Assets
├── SUPABASE_SETUP.md       # Backend Schema Documentation
├── ARCHITECTURE.md         # Detailed System Design
└── README.md               # You are here
```

## 🤝 Contributing

We welcome contributions! Please fork the repository and submit a Pull Request.
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤖 AI Tools & Prompting Strategy
VibeSRM was built using **Antigravity (Advanced Agentic AI Assistant)** for pair programming and iterative UI design.

**Prompting Strategy Summary:**
1.  **Aesthetic Priming**: Using descriptive keyword chains like *"high-end glassmorphism"*, *"midnight holographic gradients"*, and *"organic non-AI look"* to set the design tokens.
2.  **Iterative Refinement**: Building core logic (Supabase integration) first, then layering complex UI overhauls in dedicated steps (e.g., transforming the basic Chat into the "Holographic Nexus").
3.  **Cross-Context Logic**: Ensuring the AI maintained global state across multiple views (Map, Chat, Social) through incremental file views and structural outlines.

---

## ⚡ Build Reproducibility (Mandatory)

Follow these exact steps to run VibeSRM locally for judging:

### 1. Requirements
Ensure you have **Node.js 18+** (v20+ recommended) and **npm** installed.

### 2. Setup & Installation
```bash
# 1. Clone the nexus
git clone https://github.com/YUVRAJ-SINGH-3178/VibeSRM.git
cd VibeSRM

# 2. Install dependencies
npm install

# 3. Environment Config
# Create a .env file in the root and add:
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# 4. Launch Development Server
npm run dev
```

### 3. Production Build
To verify the final bundle and performance:
```bash
npm run build
npm run preview
```

---

## 🔌 Beyond the Code
VibeSRM is built to be resilient and secure.
- ✅ **Postgres RLS**: Every user's data is isolated and protected.
- ✅ **Edge Runtime**: Optimized for global, low-latency performance.
- ✅ **Vibration API**: Subtle haptic feedback for mobile-ready chats.

---

## 👥 Meet the Team: Bug Sneaker

Our team combined expertise in design, engineering, and data to craft the ultimate campus experience.

| Member | Role | GitHub |
| :--- | :--- | :--- |
| **Yuvraj Singh** | **Team Leader** & Full-Stack Developer | [@YUVRAJ-SINGH-3178](https://github.com/YUVRAJ-SINGH-3178) |
| **Aayush Bansal** | UI/UX Designer | [@Aayush-Bansal07](https://github.com/Aayush-Bansal07) |
| **Akshat** | Database Architect  | [@Akshatgitty](https://github.com/Akshatgitty) |
| **Adarsh** | Backend | [@Adarsh-Pandey28](https://github.com/Adarsh-Pandey28) |

---

<div align="center">
  <p>Hand-crafted with 💜 by <b>Team Bug Sneaker</b></p>
  <p><i>Elevating the student experience, one vibe at a time.</i></p>
  <br />
  <img src="src/Logo.png" width="100" opacity="0.5" />
</div>
