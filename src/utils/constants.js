import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const INITIAL_LOCATIONS = [
    { id: '1', name: 'Admin Block', type: 'library', occupancy: 78, capacity: 500, desc: 'Main Administration', coords: { x: 500, y: 500 }, color: 'text-vibe-cyan', icon: '🏛️', wifiSpeed: 95, crowdLevel: 'Medium', amenities: ['Admission Office', 'Registrar', 'Auditorium'], currentPeople: 150, photoUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=1000' },
    { id: '2', name: 'Academic Block', type: 'study', occupancy: 65, capacity: 1200, desc: 'Classrooms & Labs', coords: { x: 300, y: 400 }, color: 'text-vibe-purple', icon: '🎓', wifiSpeed: 100, crowdLevel: 'High', amenities: ['Lecture Halls', 'Labs', 'Library'], currentPeople: 850, photoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1000' },
    { id: '3', name: 'Ganga Hostel', type: 'hostel', occupancy: 45, capacity: 600, desc: 'Girls Hostel', coords: { x: 800, y: 300 }, color: 'text-vibe-rose', icon: '🏢', wifiSpeed: 60, crowdLevel: 'Low', amenities: ['Mess', 'Common Room', 'Gym'], currentPeople: 220, photoUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1000' },
    { id: '4', name: 'Kaveri Hostel', type: 'hostel', occupancy: 55, capacity: 800, desc: 'Boys Hostel', coords: { x: 800, y: 700 }, color: 'text-emerald-400', icon: '🏢', wifiSpeed: 60, crowdLevel: 'Medium', amenities: ['Mess', 'Badminton Court', 'Store'], currentPeople: 400, photoUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1000' },
    { id: '5', name: 'Sports Complex', type: 'sports', occupancy: 30, capacity: 400, desc: 'Grounds & Courts', coords: { x: 200, y: 800 }, color: 'text-orange-400', icon: '⚽', wifiSpeed: 40, crowdLevel: 'Low', amenities: ['Cricket Ground', 'Basketball', 'Tennis'], currentPeople: 85, photoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000' },
    { id: '6', name: 'Dining Hall', type: 'food', occupancy: 90, capacity: 500, desc: 'Central Mess', coords: { x: 600, y: 750 }, color: 'text-yellow-400', icon: '🍔', wifiSpeed: 50, crowdLevel: 'High', amenities: ['Vegetarian', 'Non-Veg', 'Bakery'], currentPeople: 450, photoUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=1000' },
];


export const DAILY_ACTIVITY = [
    { day: 'Mon', study: 3.2, play: 1.1, other: 0.7 },
    { day: 'Tue', study: 2.4, play: 1.5, other: 0.9 },
    { day: 'Wed', study: 4.1, play: 0.6, other: 1.2 },
    { day: 'Thu', study: 3.6, play: 1.0, other: 0.8 },
    { day: 'Fri', study: 2.1, play: 2.0, other: 1.1 },
    { day: 'Sat', study: 1.4, play: 2.6, other: 0.9 },
    { day: 'Sun', study: 2.9, play: 1.2, other: 1.5 }
];

export const CLASSROOM_DATA = [
    { id: 'S301', block: 'S Block', floor: 3, capacity: 60 },
    { id: 'S302', block: 'S Block', floor: 3, capacity: 60 },
    { id: 'S303', block: 'S Block', floor: 3, capacity: 60 },
    { id: 'S304', block: 'S Block', floor: 3, capacity: 60 },
    { id: 'S305', block: 'S Block', floor: 3, capacity: 40 },
    { id: 'S201', block: 'S Block', floor: 2, capacity: 60 },
    { id: 'S202', block: 'S Block', floor: 2, capacity: 60 },
    { id: 'S203', block: 'S Block', floor: 2, capacity: 60 },
    { id: 'V101', block: 'V Block', floor: 1, capacity: 80 },
    { id: 'V102', block: 'V Block', floor: 1, capacity: 80 },
    { id: 'V103', block: 'V Block', floor: 1, capacity: 60 },
    { id: 'V104', block: 'V Block', floor: 1, capacity: 60 },
    { id: 'V105', block: 'V Block', floor: 1, capacity: 40 },
    { id: 'V106', block: 'V Block', floor: 1, capacity: 40 },
    { id: 'V107', block: 'V Block', floor: 1, capacity: 40 },
    { id: 'V108', block: 'V Block', floor: 1, capacity: 40 },
    { id: 'V109', block: 'V Block', floor: 1, capacity: 40 },
    { id: 'TP501', block: 'TP Block', floor: 5, capacity: 120 },
    { id: 'TP502', block: 'TP Block', floor: 5, capacity: 120 },
    { id: 'TP401', block: 'TP Block', floor: 4, capacity: 100 },
    { id: 'TP402', block: 'TP Block', floor: 4, capacity: 100 },
    { id: 'BEL001', block: 'BEL', floor: 0, capacity: 200 },
    { id: 'BEL002', block: 'BEL', floor: 0, capacity: 150 },
];

export const DEFAULT_CHAT_CHANNELS = [
    { id: 'global', label: 'Global' },
    { id: 'study-help', label: 'Study Help' },
    { id: 'events', label: 'Events' },
    { id: 'random', label: 'Random' }
];

export const SQUAD_MEMBERS = [
    { id: 'riya', name: 'Riya Sharma', status: 'in the gym', seed: 'riya' },
    { id: 'arjun', name: 'Arjun Mehta', status: 'playing football', seed: 'arjun' },
    { id: 'neha', name: 'Neha Kapoor', status: 'playing tennis', seed: 'neha' },
    { id: 'kabir', name: 'Kabir Singh', status: 'at the library', seed: 'kabir' },
    { id: 'anaya', name: 'Anaya Iyer', status: 'heading to the track', seed: 'anaya' },
    { id: 'rohan', name: 'Rohan Verma', status: 'studying in Tech Park', seed: 'rohan' }
];

export const MOCK_TRIBE = [
    { id: 'm1', full_name: 'Alex The Lifter', username: 'gymrat_alex', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', commonTags: ['GymRat', 'Protein', 'Sports'] },
    { id: 'm2', full_name: 'Sarah Dev', username: 'code_wizard', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', commonTags: ['TechGeek', 'Coder', 'Hackathon'] },
    { id: 'm3', full_name: 'Sam Eats', username: 'foodie_sam', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sam', commonTags: ['Foodie', 'Pizza', 'Travel'] },
    { id: 'm4', full_name: 'Kenji Anime', username: 'otaku_kenji', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kenji', commonTags: ['Anime', 'Manga', 'Japan'] },
    { id: 'm5', full_name: 'Lisa Beats', username: 'lisa_music', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa', commonTags: ['Music', 'Guitar', 'Concerts'] },
    { id: 'm6', full_name: 'Mike Startups', username: 'founder_mike', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike', commonTags: ['Startups', 'TechGeek', 'Business'] },
];

export const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
export const INTEREST_OPTIONS = [
    'GymRat', 'Foodie', 'TechGeek', 'Anime', 'Gamer', 'Coder',
    'Musician', 'Artist', 'Bookworm', 'NightOwl', 'PartyAnimal',
    'Sports', 'Badminton', 'Startups', 'Photography', 'Travel'
];


export const BUILDING_IMAGES = {
    'Admin Block': 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png',
    'Sports Complex': 'https://cdn-icons-png.flaticon.com/512/857/857418.png',
    'Ganga Hostel': 'https://cdn-icons-png.flaticon.com/512/2936/2936886.png',
    'Kaveri Hostel': 'https://cdn-icons-png.flaticon.com/512/3310/3310331.png',
    'Academic Block': 'https://cdn-icons-png.flaticon.com/512/2602/2602414.png',
    'Dining Hall': 'https://cdn-icons-png.flaticon.com/512/1046/1046774.png'
};

export const BUILDING_COLORS = {
    'Admin Block': { primary: '#22d3ee', secondary: '#06b6d4', glow: 'rgba(34,211,238,0.4)' },
    'Sports Complex': { primary: '#f97316', secondary: '#ea580c', glow: 'rgba(249,115,22,0.4)' },
    'Ganga Hostel': { primary: '#fb7185', secondary: '#f43f5e', glow: 'rgba(251,113,133,0.4)' },
    'Kaveri Hostel': { primary: '#10b981', secondary: '#059669', glow: 'rgba(16,185,129,0.4)' },
    'Academic Block': { primary: '#a855f7', secondary: '#7c3aed', glow: 'rgba(168,85,247,0.4)' },
    'Dining Hall': { primary: '#eab308', secondary: '#ca8a04', glow: 'rgba(234,179,8,0.4)' },
};

export const CARD_STYLE = "relative overflow-hidden glass-card glass-card-hover rounded-[2rem] group shimmer";
