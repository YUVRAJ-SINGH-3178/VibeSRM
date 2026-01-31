import express from 'express';
import User from '../models/User.js';
import Location from '../models/Location.js';
import Checkin from '../models/Checkin.js';
import NoiseReport from '../models/NoiseReport.js';
import { authMiddleware } from '../middleware/auth.js';
import { getDistance } from 'geolib';
import { setCache } from '../config/redis.js';
import Joi from 'joi';

const router = express.Router();

// Validation
const checkinSchema = Joi.object({
    locationId: Joi.string().required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    subject: Joi.string().max(100),
    mode: Joi.string().valid('solo', 'group', 'ghost').default('solo'),
    plannedDuration: Joi.number().min(30).max(480).default(120)
});

const checkoutSchema = Joi.object({
    checkinId: Joi.string().required(),
    noiseLevel: Joi.number().min(0).max(120),
    temperatureRating: Joi.number().min(1).max(5),
    crowdednessRating: Joi.number().min(1).max(5),
    outletAvailability: Joi.boolean(),
    experienceRating: Joi.number().min(1).max(5),
    feedback: Joi.string().max(500)
});

// Ghost name generator
const generateGhostName = () => {
    const adjectives = ['Focused', 'Silent', 'Determined', 'Brilliant', 'Calm', 'Zen', 'Sharp', 'Wise'];
    const nouns = ['Phoenix', 'Scholar', 'Owl', 'Tiger', 'Dragon', 'Eagle', 'Wolf', 'Lion'];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
};

// Check-in
router.post('/checkin', authMiddleware, async (req, res) => {
    try {
        const { error, value } = checkinSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { locationId, latitude, longitude, subject, mode, plannedDuration } = value;
        const userId = req.userId;

        // Get location
        const location = await Location.findById(locationId);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }

        // GPS verification
        const distance = getDistance(
            { latitude, longitude },
            { latitude: location.latitude, longitude: location.longitude }
        );

        const maxDistance = parseInt(process.env.GPS_RADIUS_METERS) || 50;
        if (distance > maxDistance) {
            return res.status(400).json({
                error: 'Too far from location',
                distance,
                maxDistance
            });
        }

        // Check for active check-in
        const activeCheckin = await Checkin.findOne({
            user: userId,
            isActive: true
        });

        if (activeCheckin) {
            return res.status(400).json({ error: 'Already checked in somewhere' });
        }

        // Generate ghost name if needed
        const ghostName = mode === 'ghost' ? generateGhostName() : null;

        // Create check-in
        const checkin = await Checkin.create({
            user: userId,
            location: locationId,
            subject,
            mode,
            ghostName,
            plannedDuration,
            coinsEarned: 10
        });

        // Update location occupancy
        await Location.findByIdAndUpdate(locationId, {
            $inc: { currentOccupancy: 1 }
        });

        // Award coins
        await User.findByIdAndUpdate(userId, {
            $inc: { totalCoins: 10 }
        });

        // Invalidate cache
        await setCache(`location:${locationId}:occupancy`, null, 0);

        res.status(201).json({
            checkinId: checkin._id,
            checkedInAt: checkin.checkedInAt,
            ghostName: checkin.ghostName,
            coinsEarned: 10,
            message: 'Checked in successfully'
        });
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Check-out
router.post('/checkout', authMiddleware, async (req, res) => {
    try {
        const { error, value } = checkoutSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { checkinId, noiseLevel, temperatureRating, crowdednessRating,
            outletAvailability, experienceRating, feedback } = value;
        const userId = req.userId;

        // Get check-in
        const checkin = await Checkin.findOne({
            _id: checkinId,
            user: userId,
            isActive: true
        }).populate('location');

        if (!checkin) {
            return res.status(404).json({ error: 'Active check-in not found' });
        }

        const now = new Date();
        const durationMinutes = Math.floor((now - checkin.checkedInAt) / 60000);

        // Calculate bonus coins
        let bonusCoins = 0;
        if (durationMinutes >= 120) bonusCoins += 15; // 2+ hours
        if (noiseLevel !== undefined) bonusCoins += 5; // Noise report
        if (crowdednessRating) bonusCoins += 10; // Condition report

        const totalCoins = 10 + bonusCoins;

        // Update check-in
        checkin.checkedOutAt = now;
        checkin.actualDuration = durationMinutes;
        checkin.isActive = false;
        checkin.noiseLevel = noiseLevel;
        checkin.temperatureRating = temperatureRating;
        checkin.crowdednessRating = crowdednessRating;
        checkin.outletAvailability = outletAvailability;
        checkin.experienceRating = experienceRating;
        checkin.feedback = feedback;
        checkin.coinsEarned += bonusCoins;
        await checkin.save();

        // Update user stats
        const hours = durationMinutes / 60;
        await User.findByIdAndUpdate(userId, {
            $inc: {
                totalHours: hours,
                totalCoins: bonusCoins
            },
            lastCheckinDate: new Date()
        });

        // Update location occupancy
        await Location.findByIdAndUpdate(checkin.location._id, {
            $inc: { currentOccupancy: -1 }
        });

        // Save noise report if provided
        if (noiseLevel !== undefined) {
            await NoiseReport.create({
                location: checkin.location._id,
                user: userId,
                noiseLevel,
                source: 'manual'
            });
        }

        res.json({
            duration: durationMinutes,
            hours: parseFloat(hours.toFixed(2)),
            coinsEarned: totalCoins,
            bonusCoins,
            message: 'Checked out successfully'
        });
    } catch (error) {
        console.error('Check-out error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get active check-in
router.get('/active', authMiddleware, async (req, res) => {
    try {
        const checkin = await Checkin.findOne({
            user: req.userId,
            isActive: true
        }).populate('location');

        if (!checkin) {
            return res.json({ active: false });
        }

        const elapsed = Math.floor((new Date() - checkin.checkedInAt) / 60000);

        res.json({
            active: true,
            checkin: {
                id: checkin._id,
                locationName: checkin.location.name,
                locationType: checkin.location.type,
                subject: checkin.subject,
                mode: checkin.mode,
                ghostName: checkin.ghostName,
                checkedInAt: checkin.checkedInAt,
                elapsedMinutes: elapsed,
                plannedDuration: checkin.plannedDuration
            }
        });
    } catch (error) {
        console.error('Get active check-in error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
