import mongoose from 'mongoose';

const checkinSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    subject: { type: String },
    mode: {
        type: String,
        enum: ['solo', 'group', 'ghost'],
        default: 'solo'
    },
    ghostName: { type: String },
    plannedDuration: { type: Number }, // minutes
    actualDuration: { type: Number }, // minutes
    focusScore: { type: Number, min: 0, max: 100 },
    coinsEarned: { type: Number, default: 10 },

    // Feedback
    noiseLevel: { type: Number, min: 0, max: 120 },
    temperatureRating: { type: Number, min: 1, max: 5 },
    crowdednessRating: { type: Number, min: 1, max: 5 },
    outletAvailability: { type: Boolean },
    experienceRating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },

    checkedInAt: { type: Date, default: Date.now },
    checkedOutAt: { type: Date },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Indexes
checkinSchema.index({ user: 1, isActive: 1 });
checkinSchema.index({ location: 1, isActive: 1 });

export default mongoose.model('Checkin', checkinSchema);
