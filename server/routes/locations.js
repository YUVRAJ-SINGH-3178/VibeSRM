import express from 'express';
import Location from '../models/Location.js';
import Checkin from '../models/Checkin.js';
import NoiseReport from '../models/NoiseReport.js';
import { setCache, getCache } from '../config/redis.js';

const router = express.Router();

// Get all locations with real-time data
router.get('/', async (req, res) => {
    try {
        const { type, maxNoise, maxOccupancy } = req.query;

        let filter = {};
        if (type) filter.type = type;

        const locations = await Location.find(filter);

        // Get noise and active users for each location
        const locationsWithData = await Promise.all(
            locations.map(async (loc) => {
                // Get recent noise reports (last hour)
                const oneHourAgo = new Date(Date.now() - 3600000);
                const noiseReports = await NoiseReport.find({
                    location: loc._id,
                    createdAt: { $gte: oneHourAgo }
                });

                const avgNoise = noiseReports.length > 0
                    ? Math.round(noiseReports.reduce((sum, r) => sum + r.noiseLevel, 0) / noiseReports.length)
                    : 0;

                // Get active users
                const activeUsers = await Checkin.countDocuments({
                    location: loc._id,
                    isActive: true
                });

                const occupancyPercent = Math.round((loc.currentOccupancy / loc.capacity) * 100);

                return {
                    id: loc._id,
                    name: loc.name,
                    type: loc.type,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    capacity: loc.capacity,
                    currentOccupancy: loc.currentOccupancy,
                    occupancyPercent,
                    avgNoise,
                    activeUsers,
                    amenities: loc.amenities,
                    photoUrl: loc.photoUrl,
                    description: loc.description,
                    mapX: loc.mapX,
                    mapY: loc.mapY
                };
            })
        );

        // Apply filters
        let filtered = locationsWithData;
        if (maxNoise) {
            filtered = filtered.filter(loc => loc.avgNoise <= parseInt(maxNoise));
        }
        if (maxOccupancy) {
            filtered = filtered.filter(loc => loc.occupancyPercent <= parseInt(maxOccupancy));
        }

        res.json({ locations: filtered });
    } catch (error) {
        console.error('Get locations error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single location details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check cache
        const cached = await getCache(`location:${id}:details`);
        if (cached) {
            return res.json(cached);
        }

        const location = await Location.findById(id);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }

        // Get stats
        const oneHourAgo = new Date(Date.now() - 3600000);

        const [noiseReports, activeUsers, recentCheckins] = await Promise.all([
            NoiseReport.find({
                location: id,
                createdAt: { $gte: oneHourAgo }
            }),
            Checkin.countDocuments({
                location: id,
                isActive: true
            }),
            Checkin.find({
                location: id,
                checkedOutAt: { $exists: true }
            })
                .sort({ checkedOutAt: -1 })
                .limit(10)
        ]);

        const avgNoise = noiseReports.length > 0
            ? Math.round(noiseReports.reduce((sum, r) => sum + r.noiseLevel, 0) / noiseReports.length)
            : 0;

        const avgTemp = recentCheckins.filter(c => c.temperatureRating).length > 0
            ? (recentCheckins.reduce((sum, c) => sum + (c.temperatureRating || 0), 0) /
                recentCheckins.filter(c => c.temperatureRating).length).toFixed(1)
            : 0;

        const avgRating = recentCheckins.filter(c => c.experienceRating).length > 0
            ? (recentCheckins.reduce((sum, c) => sum + (c.experienceRating || 0), 0) /
                recentCheckins.filter(c => c.experienceRating).length).toFixed(1)
            : 0;

        // Mock predictions (can be replaced with ML model)
        const predictions = Array.from({ length: 6 }, (_, i) => ({
            hour: new Date(Date.now() + i * 3600000).getHours(),
            predictedOccupancy: Math.min(100, location.currentOccupancy + Math.random() * 30 - 15)
        }));

        const locationData = {
            id: location._id,
            name: location.name,
            type: location.type,
            latitude: location.latitude,
            longitude: location.longitude,
            capacity: location.capacity,
            currentOccupancy: location.currentOccupancy,
            occupancyPercent: Math.round((location.currentOccupancy / location.capacity) * 100),
            activeUsers,
            avgNoise,
            avgTemperature: avgTemp,
            avgRating,
            amenities: location.amenities,
            photoUrl: location.photoUrl,
            description: location.description,
            predictions
        };

        // Cache for 2 minutes
        await setCache(`location:${id}:details`, locationData, 120);

        res.json(locationData);
    } catch (error) {
        console.error('Get location details error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get noise heatmap data
router.get('/noise/heatmap', async (req, res) => {
    try {
        const locations = await Location.find();
        const oneHourAgo = new Date(Date.now() - 3600000);

        const heatmap = await Promise.all(
            locations.map(async (loc) => {
                const reports = await NoiseReport.find({
                    location: loc._id,
                    createdAt: { $gte: oneHourAgo }
                });

                const avgNoise = reports.length > 0
                    ? Math.round(reports.reduce((sum, r) => sum + r.noiseLevel, 0) / reports.length)
                    : 0;

                return {
                    id: loc._id,
                    name: loc.name,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    type: loc.type,
                    noiseLevel: avgNoise,
                    reportCount: reports.length,
                    color: getNoiseColor(avgNoise)
                };
            })
        );

        res.json({ heatmap });
    } catch (error) {
        console.error('Get noise heatmap error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Helper function for noise color coding
function getNoiseColor(noise) {
    if (noise < 35) return 'green';
    if (noise < 50) return 'yellow';
    if (noise < 70) return 'orange';
    return 'red';
}

// Get noise history for location
router.get('/:id/noise/history', async (req, res) => {
    try {
        const { id } = req.params;
        const { hours = 24 } = req.query;

        const startTime = new Date(Date.now() - parseInt(hours) * 3600000);

        const reports = await NoiseReport.find({
            location: id,
            createdAt: { $gte: startTime }
        }).sort({ createdAt: 1 });

        // Group by hour
        const hourlyData = {};
        reports.forEach(report => {
            const hour = new Date(report.createdAt).setMinutes(0, 0, 0);
            if (!hourlyData[hour]) {
                hourlyData[hour] = { sum: 0, count: 0 };
            }
            hourlyData[hour].sum += report.noiseLevel;
            hourlyData[hour].count += 1;
        });

        const history = Object.entries(hourlyData).map(([hour, data]) => ({
            hour: new Date(parseInt(hour)),
            avgNoise: Math.round(data.sum / data.count),
            reportCount: data.count
        }));

        res.json({ history });
    } catch (error) {
        console.error('Get noise history error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
