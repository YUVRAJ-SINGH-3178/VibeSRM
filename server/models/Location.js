import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: {
        type: String,
        required: true,
        enum: ['library', 'cafe', 'gym', 'study', 'lounge', 'other']
    },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    capacity: { type: Number, default: 100 },
    currentOccupancy: { type: Number, default: 0 },
    amenities: {
        wifi: { type: Boolean, default: false },
        outlets: { type: Boolean, default: false },
        food: { type: Boolean, default: false },
        whiteboard: { type: Boolean, default: false }
    },
    photoUrl: { type: String },
    description: { type: String }
}, { timestamps: true });

// Index for geospatial queries
locationSchema.index({ latitude: 1, longitude: 1 });

export default mongoose.model('Location', locationSchema);
