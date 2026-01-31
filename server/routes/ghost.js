import express from 'express';
import Checkin from '../models/Checkin.js';
import { authMiddleware } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Ghost encouragement model
const encouragementSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toCheckin: { type: mongoose.Schema.Types.ObjectId, ref: 'Checkin', required: true },
    emoji: { type: String, required: true }
}, { timestamps: true });

encouragementSchema.index({ from: 1, toCheckin: 1, createdAt: 1 });
const Encouragement = mongoose.models.Encouragement || mongoose.model('Encouragement', encouragementSchema);

// Get active ghosts nearby
router.get('/nearby', authMiddleware, async (req, res) => {
    try {
        const { locationId } = req.query;

        const filter = { isActive: true, mode: 'ghost' };
        if (locationId) {
            filter.location = locationId;
        }

        const ghosts = await Checkin.find(filter)
            .populate('location', 'name type')
            .select('ghostName subject checkedInAt location');

        const ghostsWithDuration = ghosts.map(g => {
            const elapsed = Math.floor((Date.now() - g.checkedInAt) / 60000);
            return {
                id: g._id,
                ghostName: g.ghostName,
                subject: g.subject || 'Studying',
                location: g.location?.name,
                locationType: g.location?.type,
                elapsedMinutes: elapsed,
                elapsedFormatted: elapsed >= 60
                    ? `${Math.floor(elapsed / 60)}h ${elapsed % 60}m`
                    : `${elapsed}m`
            };
        });

        res.json({ ghosts: ghostsWithDuration });
    } catch (error) {
        console.error('Get ghosts error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Send encouragement to a ghost
router.post('/encourage', authMiddleware, async (req, res) => {
    try {
        const { checkinId, emoji } = req.body;

        const allowedEmojis = ['💪', '🔥', '⭐', '🎯', '👏', '🚀'];
        if (!allowedEmojis.includes(emoji)) {
            return res.status(400).json({ error: 'Invalid emoji' });
        }

        // Check rate limit (1 per ghost per 30 min)
        const thirtyMinAgo = new Date(Date.now() - 30 * 60000);
        const recentEncouragement = await Encouragement.findOne({
            from: req.userId,
            toCheckin: checkinId,
            createdAt: { $gte: thirtyMinAgo }
        });

        if (recentEncouragement) {
            return res.status(429).json({
                error: 'Already encouraged this ghost recently',
                nextAvailable: new Date(recentEncouragement.createdAt.getTime() + 30 * 60000)
            });
        }

        // Verify the checkin is a ghost
        const checkin = await Checkin.findOne({
            _id: checkinId,
            mode: 'ghost',
            isActive: true
        });

        if (!checkin) {
            return res.status(404).json({ error: 'Ghost session not found' });
        }

        await Encouragement.create({
            from: req.userId,
            toCheckin: checkinId,
            emoji
        });

        res.json({ message: 'Encouragement sent!', emoji });
    } catch (error) {
        console.error('Send encouragement error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get encouragements received (for current session)
router.get('/encouragements', authMiddleware, async (req, res) => {
    try {
        const activeCheckin = await Checkin.findOne({
            user: req.userId,
            isActive: true,
            mode: 'ghost'
        });

        if (!activeCheckin) {
            return res.json({ encouragements: [], total: 0 });
        }

        const encouragements = await Encouragement.find({
            toCheckin: activeCheckin._id
        });

        const emojiCounts = {};
        encouragements.forEach(e => {
            emojiCounts[e.emoji] = (emojiCounts[e.emoji] || 0) + 1;
        });

        res.json({
            encouragements: Object.entries(emojiCounts).map(([emoji, count]) => ({
                emoji,
                count
            })),
            total: encouragements.length
        });
    } catch (error) {
        console.error('Get encouragements error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get ghost stats for completed session
router.get('/session/:checkinId/summary', authMiddleware, async (req, res) => {
    try {
        const { checkinId } = req.params;

        const checkin = await Checkin.findOne({
            _id: checkinId,
            user: req.userId,
            mode: 'ghost'
        }).populate('location', 'name');

        if (!checkin) {
            return res.status(404).json({ error: 'Ghost session not found' });
        }

        // Count other ghosts during same time period
        const ghostsAlongside = await Checkin.countDocuments({
            _id: { $ne: checkinId },
            mode: 'ghost',
            checkedInAt: { $lte: checkin.checkedOutAt || new Date() },
            $or: [
                { checkedOutAt: { $gte: checkin.checkedInAt } },
                { isActive: true }
            ]
        });

        const encouragements = await Encouragement.countDocuments({
            toCheckin: checkinId
        });

        res.json({
            ghostName: checkin.ghostName,
            location: checkin.location?.name,
            duration: checkin.actualDuration || Math.floor((Date.now() - checkin.checkedInAt) / 60000),
            ghostsAlongside,
            encouragementsReceived: encouragements
        });
    } catch (error) {
        console.error('Get ghost summary error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
