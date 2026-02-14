# 🏗️ VibeSRM Architecture

## Overview
VibeSRM is a Single Page Application (SPA) built with React and Vite. It leverages a centralized **Theme Context** to drive a highly dynamic UI and uses **Supabase** for backend services including Authentication, Database, and Realtime subscriptions.

## 🧱 Core Systems

### 1. Theming Engine (`ThemeContext.jsx`)
The heart of VibeSRM's UI is its robust theming engine. Unlike traditional dark/light mode switches, this engine replaces the entire "personality" of the app.
-   **State**: Managed via React Context API (`ThemeContext`).
-   **Persistence**: Saves preference to `localStorage`.
-   **CSS Variables**: Updates `data-theme` attribute on the `<html>` tag, which triggers CSS variable changes in `index.css`.
-   **Dynamic Assets**: Swaps out Icon sets (Lucide) and Text labels (Greetings, Button text) based on the active theme object.

### 2. Navigation & Routing (`App.jsx`)
The application uses a custom view-based routing system managed in `App.jsx`.
-   **Current View State**: `activeTab` ('home', 'map', 'create', 'social', 'chat', 'settings').
-   **Modals**: Managed via overlay states (`showAuthModal`, `showProfile`, `showCreateVibe`).
-   **AnimatePresence**: Used to wrap views for smooth exit/entry transitions between tabs.

### 3. Data Layer (`utils/database.js`)
All interactions with Supabase are abstracted into this utility file.
-   **Auth**: Wrapper around `supabase.auth` (Login, Register, Profile Management).
-   **Locations**: Fetches static data and live occupancy.
-   **Checkins**: Handles logic for users "entering" a location.
-   **Realtime**: Subscribes to database changes to update the UI instantly (e.g., Chat, Occupancy).

### 4. Component Hierarchy

-   **`main.jsx`** (Entry)
    -   **`ThemeProvider`** (Wrap App)
        -   **`App`** (Main Layout)
            -   **`NavBar`** (Persistent Navigation)
            -   **`DashboardView`** (Home Tab - Widgets, Feeds)
                -   `MiniMapWidget`
                -   `EventCard`
            -   **`FullMapView`** (Map Tab)
                -   `BentoMap` (The visual map component)
            -   **`SocialView`** (Friends & Squads)
            -   **`ChatView`** (Real-time Messaging)
            -   **`SettingsView`** (User & App Config)

## 🎨 Styling Strategy

-   **TailwindCSS**: Used for structure, layout, and utility classes.
-   **CSS Modules/Variables**: Used for theme specific colors (`--bg-page`, `--text-primary`).
-   **Glassmorphism**: Extensive use of `backdrop-blur` and semi-transparent backgrounds to create depth.
-   **Animations**: `framer-motion` for complex sequences (e.g., staggering list items, modal popups).

## 🔒 Security & Performance

-   **RLS (Row Level Security)**: Supabase tables are protected so users can only modify their own data.
-   **Lazy Loading**: Heavy components or assets are loaded only when needed.
-   **Optimistic UI**: Chat and Check-ins update the UI immediately before confirming with the server for a snappy feel.
