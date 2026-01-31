import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
        type: String,
        enum: ['tech', 'music', 'gaming', 'study', 'major', 'other'],
        default: 'study'
    },
    locationName: { type: String, required: true },
    coords: {
        x: { type: Number, required: true },
        y: { type: Number, required: true }
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isMajor: { type: Boolean, default: false },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags: [String]
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
