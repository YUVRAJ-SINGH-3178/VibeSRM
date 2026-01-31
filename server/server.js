import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import './config/redis.js';

// Routes
import authRoutes from './routes/auth.js';
import checkinRoutes from './routes/checkins.js';
import locationRoutes from './routes/locations.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// Connect to MongoDB
await connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/locations', locationRoutes);

// Health check
app.get('/health', async (req, res) => {
    try {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('subscribe:location', (locationId) => {
        socket.join(`location:${locationId}`);
        console.log(`Client ${socket.id} subscribed to location ${locationId}`);
    });

    socket.on('unsubscribe:location', (locationId) => {
        socket.leave(`location:${locationId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Broadcast occupancy updates
export const broadcastOccupancyUpdate = (locationId, data) => {
    io.to(`location:${locationId}`).emit('occupancy:update', data);
};

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║     🚀 VibeSRM Server Running        ║
║                                       ║
║     Port: ${PORT}                        ║
║     Environment: ${process.env.NODE_ENV || 'development'}          ║
║     Time: ${new Date().toLocaleTimeString()}                ║
╚═══════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing server...');
    httpServer.close(() => {
        process.exit(0);
    });
});
