import express from 'express';
import User from '../models/User.js';
import Checkin from '../models/Checkin.js';
import { authMiddleware } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Friendship model (create inline)
const friendshipSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    friend: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'blocked'], default: 'pending' }
}, { timestamps: true });

friendshipSchema.index({ user: 1, friend: 1 }, { unique: true });
const Friendship = mongoose.models.Friendship || mongoose.model('Friendship', friendshipSchema);

// Study invite model
const studyInviteSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    scheduledTime: { type: Date },
    message: { type: String },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' }
}, { timestamps: true });

const StudyInvite = mongoose.models.StudyInvite || mongoose.model('StudyInvite', studyInviteSchema);

// Search users
router.get('/search', authMiddleware, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.json({ users: [] });
        }

        const users = await User.find({
            $or: [
                { username: { $regex: q, $options: 'i' } },
                { fullName: { $regex: q, $options: 'i' } }
            ],
            _id: { $ne: req.userId }
        })
            .select('username fullName avatarUrl totalHours')
            .limit(10);

        res.json({ users });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get friends list
router.get('/friends', authMiddleware, async (req, res) => {
    try {
        const friendships = await Friendship.find({
            $or: [
                { user: req.userId, status: 'accepted' },
                { friend: req.userId, status: 'accepted' }
            ]
        }).populate('user friend', 'username fullName avatarUrl totalHours');

        const friends = friendships.map(f => {
            const friendData = f.user._id.toString() === req.userId ? f.friend : f.user;
            return {
                id: friendData._id,
                username: friendData.username,
                fullName: friendData.fullName,
                avatarUrl: friendData.avatarUrl,
                totalHours: friendData.totalHours
            };
        });

        // Get active check-ins for friends
        const friendIds = friends.map(f => f.id);
        const activeCheckins = await Checkin.find({
            user: { $in: friendIds },
            isActive: true
        }).populate('location', 'name type');

        const checkinMap = {};
        activeCheckins.forEach(c => {
            checkinMap[c.user.toString()] = {
                locationName: c.location.name,
                locationType: c.location.type,
                subject: c.subject,
                checkedInAt: c.checkedInAt
            };
        });

        const friendsWithStatus = friends.map(f => ({
            ...f,
            currentSession: checkinMap[f.id.toString()] || null,
            isStudying: !!checkinMap[f.id.toString()]
        }));

        res.json({ friends: friendsWithStatus });
    } catch (error) {
        console.error('Get friends error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Send friend request
router.post('/friends/request', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.body;

        if (userId === req.userId) {
            return res.status(400).json({ error: 'Cannot friend yourself' });
        }

        const existing = await Friendship.findOne({
            $or: [
                { user: req.userId, friend: userId },
                { user: userId, friend: req.userId }
            ]
        });

        if (existing) {
            return res.status(400).json({ error: 'Friendship already exists' });
        }

        await Friendship.create({
            user: req.userId,
            friend: userId,
            status: 'pending'
        });

        res.json({ message: 'Friend request sent' });
    } catch (error) {
        console.error('Send friend request error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Accept friend request
router.post('/friends/accept', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.body;

        const friendship = await Friendship.findOneAndUpdate(
            { user: userId, friend: req.userId, status: 'pending' },
            { status: 'accepted' },
            { new: true }
        );

        if (!friendship) {
            return res.status(404).json({ error: 'Friend request not found' });
        }

        res.json({ message: 'Friend request accepted' });
    } catch (error) {
        console.error('Accept friend request error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get pending friend requests
router.get('/friends/pending', authMiddleware, async (req, res) => {
    try {
        const requests = await Friendship.find({
            friend: req.userId,
            status: 'pending'
        }).populate('user', 'username fullName avatarUrl');

        res.json({
            requests: requests.map(r => ({
                id: r._id,
                from: r.user
            }))
        });
    } catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Send study invite
router.post('/invite', authMiddleware, async (req, res) => {
    try {
        const { toUserId, locationId, scheduledTime, message } = req.body;

        const invite = await StudyInvite.create({
            from: req.userId,
            to: toUserId,
            location: locationId,
            scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
            message
        });

        res.json({ invite, message: 'Study invite sent' });
    } catch (error) {
        console.error('Send invite error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get invites
router.get('/invites', authMiddleware, async (req, res) => {
    try {
        const [received, sent] = await Promise.all([
            StudyInvite.find({ to: req.userId, status: 'pending' })
                .populate('from', 'username fullName avatarUrl')
                .populate('location', 'name'),
            StudyInvite.find({ from: req.userId })
                .populate('to', 'username fullName avatarUrl')
                .populate('location', 'name')
        ]);

        res.json({ received, sent });
    } catch (error) {
        console.error('Get invites error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Respond to invite
router.post('/invites/:id/respond', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { accept } = req.body;

        const invite = await StudyInvite.findOneAndUpdate(
            { _id: id, to: req.userId, status: 'pending' },
            { status: accept ? 'accepted' : 'declined' },
            { new: true }
        );

        if (!invite) {
            return res.status(404).json({ error: 'Invite not found' });
        }

        res.json({ message: accept ? 'Invite accepted' : 'Invite declined' });
    } catch (error) {
        console.error('Respond to invite error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
