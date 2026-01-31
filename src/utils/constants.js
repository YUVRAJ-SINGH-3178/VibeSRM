import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const INITIAL_LOCATIONS = [
    { id: '1', name: 'Library', type: 'library', occupancy: 78, capacity: 500, desc: 'Quiet Zone • Level 3', coords: { x: 650, y: 450 }, color: 'text-vibe-cyan', icon: '📚', wifiSpeed: 85, crowdLevel: 'High', amenities: ['Silent Zone', 'AC', 'Power Outlets', 'Printers'], currentPeople: 390 },
    { id: '2', name: 'Sports Area', type: 'sports', occupancy: 42, capacity: 300, desc: 'Football • Badminton • Track', coords: { x: 950, y: 250 }, color: 'text-orange-400', icon: '⚽', wifiSpeed: 40, crowdLevel: 'Medium', amenities: ['Football Ground', 'Badminton Courts', 'Running Track', 'Equipment Rental'], currentPeople: 126 },
    { id: '3', name: 'Ganga Gym', type: 'gym', occupancy: 35, capacity: 200, desc: 'Fitness Center • 24/7', coords: { x: 900, y: 620 }, color: 'text-vibe-rose', icon: '💪', wifiSpeed: 50, crowdLevel: 'Low', amenities: ['Cardio', 'Weights', 'Lockers', 'Showers'], currentPeople: 70 },
    { id: '4', name: 'Flag Park', type: 'park', occupancy: 25, capacity: 500, desc: 'Central Gathering Area', coords: { x: 250, y: 650 }, color: 'text-emerald-400', icon: '🏳️', wifiSpeed: 30, crowdLevel: 'Low', amenities: ['Open Space', 'Benches', 'Shade Trees', 'Walking Path'], currentPeople: 125 },
    { id: '5', name: 'Academic Block', type: 'study', occupancy: 65, capacity: 800, desc: 'Main Academic Building', coords: { x: 250, y: 320 }, color: 'text-vibe-purple', icon: '🎓', wifiSpeed: 100, crowdLevel: 'High', amenities: ['Lecture Halls', 'Labs', 'AC', 'Elevators'], currentPeople: 520 },
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

export const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
export const INTEREST_OPTIONS = ['Studying', 'Sports', 'Gym', 'Badminton', 'Gaming', 'Music', 'Coding', 'Events', 'Reading'];


export const BUILDING_IMAGES = {
    'Library': 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png',
    'Sports Area': 'https://cdn-icons-png.flaticon.com/512/857/857418.png',
    'Ganga Gym': 'https://cdn-icons-png.flaticon.com/512/2936/2936886.png',
    'Flag Park': 'https://cdn-icons-png.flaticon.com/512/3310/3310331.png',
    'Academic Block': 'https://cdn-icons-png.flaticon.com/512/2602/2602414.png',
};

export const BUILDING_COLORS = {
    'Library': { primary: '#22d3ee', secondary: '#06b6d4', glow: 'rgba(34,211,238,0.4)' },
    'Sports Area': { primary: '#f97316', secondary: '#ea580c', glow: 'rgba(249,115,22,0.4)' },
    'Ganga Gym': { primary: '#fb7185', secondary: '#f43f5e', glow: 'rgba(251,113,133,0.4)' },
    'Flag Park': { primary: '#10b981', secondary: '#059669', glow: 'rgba(16,185,129,0.4)' },
    'Academic Block': { primary: '#a855f7', secondary: '#7c3aed', glow: 'rgba(168,85,247,0.4)' },
};

export const CARD_STYLE = "relative overflow-hidden glass-card glass-card-hover rounded-[2rem] group shimmer";
