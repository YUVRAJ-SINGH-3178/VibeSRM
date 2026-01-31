import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: {
        type: String,
        enum: ['hours', 'streaks', 'focus', 'social', 'special']
    },
    requirementType: { type: String },
    requirementValue: { type: Number },
    coinReward: { type: Number, default: 0 },
    icon: { type: String }
}, { timestamps: true });

export default mongoose.model('Achievement', achievementSchema);
