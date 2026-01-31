import express from 'express';
import User from '../models/User.js';
import Checkin from '../models/Checkin.js';
import Achievement from '../models/Achievement.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select('-passwordHash')
            .populate('achievements');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user stats
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        // Get checkin stats
        const checkins = await Checkin.find({ user: req.userId });
        const totalSessions = checkins.length;
        const completedSessions = checkins.filter(c => c.checkedOutAt).length;

        // Calculate average focus score
        const focusScores = checkins.filter(c => c.focusScore).map(c => c.focusScore);
        const avgFocusScore = focusScores.length > 0
            ? Math.round(focusScores.reduce((a, b) => a + b, 0) / focusScores.length)
            : 0;

        // Hours by day (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentCheckins = checkins.filter(c =>
            c.checkedInAt >= sevenDaysAgo && c.actualDuration
        );

        const hoursByDay = {};
        recentCheckins.forEach(c => {
            const day = c.checkedInAt.toISOString().split('T')[0];
            hoursByDay[day] = (hoursByDay[day] || 0) + (c.actualDuration / 60);
        });

        // Location distribution
        const locationCounts = {};
        for (const c of checkins) {
            await c.populate('location');
            const locName = c.location?.name || 'Unknown';
            locationCounts[locName] = (locationCounts[locName] || 0) + 1;
        }

        // Peak hours
        const hourCounts = Array(24).fill(0);
        checkins.forEach(c => {
            const hour = c.checkedInAt.getHours();
            hourCounts[hour]++;
        });
        const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

        res.json({
            overview: {
                totalHours: user.totalHours,
                totalCoins: user.totalCoins,
                currentStreak: user.currentStreak,
                longestStreak: user.longestStreak,
                avgFocusScore,
                totalSessions,
                completedSessions
            },
            charts: {
                hoursByDay,
                locationDistribution: locationCounts,
                peakHour,
                hourlyActivity: hourCounts
            },
            predictions: {
                monthlyHoursEstimate: (user.totalHours / Math.max(1, totalSessions)) * 30,
                onTrack: user.currentStreak >= 3
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all achievements with unlock status
router.get('/achievements', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('achievements');
        const allAchievements = await Achievement.find();

        const unlockedIds = new Set(user.achievements.map(a => a._id.toString()));

        const achievements = allAchievements.map(a => ({
            id: a._id,
            name: a.name,
            description: a.description,
            category: a.category,
            icon: a.icon,
            coinReward: a.coinReward,
            unlocked: unlockedIds.has(a._id.toString())
        }));

        res.json({ achievements });
    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user settings
router.patch('/settings', authMiddleware, async (req, res) => {
    try {
        const { ghostModeDefault, locationSharingLevel, fullName, avatarUrl } = req.body;

        const updates = {};
        if (ghostModeDefault !== undefined) updates.ghostModeDefault = ghostModeDefault;
        if (locationSharingLevel) updates.locationSharingLevel = locationSharingLevel;
        if (fullName) updates.fullName = fullName;
        if (avatarUrl) updates.avatarUrl = avatarUrl;

        const user = await User.findByIdAndUpdate(
            req.userId,
            updates,
            { new: true }
        ).select('-passwordHash');

        res.json({ user, message: 'Settings updated' });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
