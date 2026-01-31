import express from 'express';
import Event from '../models/Event.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ startTime: 1 });
        res.json({ events });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create an event
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, type, locationName, coords, startTime, isMajor } = req.body;

        const event = await Event.create({
            title,
            description,
            type,
            locationName,
            coords,
            startTime,
            isMajor,
            creator: req.userId
        });

        res.status(201).json({ event });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Join an event
router.post('/:id/join', authMiddleware, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ error: 'Event not found' });

        if (!event.attendees.includes(req.userId)) {
            event.attendees.push(req.userId);
            await event.save();
        }

        res.json({ event });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
