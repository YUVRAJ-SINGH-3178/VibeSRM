import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    fullName: { type: String },
    avatarUrl: { type: String },
    totalHours: { type: Number, default: 0 },
    totalCoins: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastCheckinDate: { type: Date },
    ghostModeDefault: { type: Boolean, default: false },
    locationSharingLevel: {
        type: String,
        enum: ['exact', 'building', 'campus', 'off'],
        default: 'exact'
    },
    achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
