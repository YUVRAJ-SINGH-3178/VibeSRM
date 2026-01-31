import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Location from './models/Location.js';
import Achievement from './models/Achievement.js';
import NoiseReport from './models/NoiseReport.js';

dotenv.config();

const seedData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vibesrm');
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Location.deleteMany({});
        await Achievement.deleteMany({});
        await NoiseReport.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Seed locations
        const locations = await Location.insertMany([
            {
                name: 'Tech Park Library',
                type: 'library',
                latitude: 12.9716,
                longitude: 77.5946,
                capacity: 500,
                currentOccupancy: Math.floor(Math.random() * 400),
                amenities: { wifi: true, outlets: true, food: false, whiteboard: false },
                description: 'Quiet Zone • Level 3',
                photoUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da'
            },
            {
                name: 'Java Lounge',
                type: 'cafe',
                latitude: 12.9726,
                longitude: 77.5956,
                capacity: 150,
                currentOccupancy: Math.floor(Math.random() * 120),
                amenities: { wifi: true, outlets: true, food: true, whiteboard: false },
                description: 'Fresh Brews • Fast WiFi',
                photoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24'
            },
            {
                name: 'Spartan Gym',
                type: 'gym',
                latitude: 12.9706,
                longitude: 77.5936,
                capacity: 200,
                currentOccupancy: Math.floor(Math.random() * 160),
                amenities: { wifi: false, outlets: false, food: false, whiteboard: false },
                description: 'Empty • Cardio Deck',
                photoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48'
            },
            {
                name: 'Innovation Hub',
                type: 'study',
                latitude: 12.9736,
                longitude: 77.5966,
                capacity: 80,
                currentOccupancy: Math.floor(Math.random() * 70),
                amenities: { wifi: true, outlets: true, food: false, whiteboard: true },
                description: 'Hackathon in progress',
                photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c'
            },
            {
                name: 'Central Cafeteria',
                type: 'cafe',
                latitude: 12.9716,
                longitude: 77.5976,
                capacity: 300,
                currentOccupancy: Math.floor(Math.random() * 250),
                amenities: { wifi: true, outlets: false, food: true, whiteboard: false },
                description: 'All-day dining',
                photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'
            },
            {
                name: 'Study Room A',
                type: 'study',
                latitude: 12.9696,
                longitude: 77.5946,
                capacity: 20,
                currentOccupancy: Math.floor(Math.random() * 18),
                amenities: { wifi: true, outlets: true, food: false, whiteboard: true },
                description: 'Group study sessions',
                photoUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2'
            },
            {
                name: 'Outdoor Pavilion',
                type: 'lounge',
                latitude: 12.9746,
                longitude: 77.5926,
                capacity: 100,
                currentOccupancy: Math.floor(Math.random() * 80),
                amenities: { wifi: true, outlets: false, food: false, whiteboard: false },
                description: 'Fresh air study spot',
                photoUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c'
            },
            {
                name: 'Music Practice Room',
                type: 'other',
                latitude: 12.9686,
                longitude: 77.5986,
                capacity: 15,
                currentOccupancy: Math.floor(Math.random() * 12),
                amenities: { wifi: false, outlets: true, food: false, whiteboard: false },
                description: 'Soundproof rooms',
                photoUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d'
            }
        ]);
        console.log(`✅ Seeded ${locations.length} locations`);

        // Seed achievements
        const achievements = await Achievement.insertMany([
            { name: 'First Steps', description: 'Complete your first study session', category: 'hours', requirementType: 'total_hours', requirementValue: 1, coinReward: 50, icon: '🎯' },
            { name: 'Week Warrior', description: 'Maintain a 7-day streak', category: 'streaks', requirementType: 'current_streak', requirementValue: 7, coinReward: 100, icon: '🔥' },
            { name: 'Century Club', description: 'Study for 100 hours total', category: 'hours', requirementType: 'total_hours', requirementValue: 100, coinReward: 500, icon: '💯' },
            { name: 'Laser Focused', description: 'Achieve 95+ focus score', category: 'focus', requirementType: 'focus_score', requirementValue: 95, coinReward: 200, icon: '🎯' },
            { name: 'Study Buddy', description: 'Complete 10 group sessions', category: 'social', requirementType: 'group_sessions', requirementValue: 10, coinReward: 150, icon: '👥' },
            { name: 'Ghost Master', description: 'Complete 50 ghost mode sessions', category: 'social', requirementType: 'ghost_sessions', requirementValue: 50, coinReward: 300, icon: '👻' },
            { name: 'Early Bird', description: 'Check in before 7 AM', category: 'special', requirementType: 'early_checkin', requirementValue: 1, coinReward: 75, icon: '🌅' },
            { name: 'Night Owl', description: 'Check in after 10 PM', category: 'special', requirementType: 'late_checkin', requirementValue: 1, coinReward: 75, icon: '🦉' },
            { name: 'Marathon Runner', description: 'Study for 8+ hours in one session', category: 'hours', requirementType: 'session_duration', requirementValue: 480, coinReward: 250, icon: '🏃' },
            { name: 'Zen Master', description: 'Complete 10 sessions with 90+ focus', category: 'focus', requirementType: 'high_focus_count', requirementValue: 10, coinReward: 400, icon: '🧘' }
        ]);
        console.log(`✅ Seeded ${achievements.length} achievements`);

        // Seed noise reports
        const noiseReports = [];
        for (const location of locations) {
            for (let i = 0; i < 5; i++) {
                noiseReports.push({
                    location: location._id,
                    noiseLevel: Math.floor(Math.random() * 60 + 20),
                    source: 'manual',
                    createdAt: new Date(Date.now() - Math.random() * 3600000)
                });
            }
        }
        await NoiseReport.insertMany(noiseReports);
        console.log(`✅ Seeded ${noiseReports.length} noise reports`);

        console.log('\n🎉 Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedData();
