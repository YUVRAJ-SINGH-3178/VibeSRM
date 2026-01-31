import mongoose from 'mongoose';

const noiseReportSchema = new mongoose.Schema({
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    noiseLevel: { type: Number, required: true, min: 0, max: 120 },
    source: {
        type: String,
        enum: ['manual', 'auto'],
        default: 'manual'
    }
}, { timestamps: true });

// Index for recent reports
noiseReportSchema.index({ location: 1, createdAt: -1 });

export default mongoose.model('NoiseReport', noiseReportSchema);
