import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient = null;

try {
    redisClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        retryStrategy: (times) => {
            if (times > 3) {
                console.log('⚠️  Redis unavailable - running without cache');
                return null; // Stop retrying
            }
            return Math.min(times * 100, 3000);
        }
    });

    redisClient.on('connect', () => console.log('✅ Redis connected'));
    redisClient.on('error', (err) => {
        console.log('⚠️  Redis not available - caching disabled');
        redisClient = null;
    });
} catch (error) {
    console.log('⚠️  Redis not available - running without cache');
    redisClient = null;
}

// Helper functions with fallback
export const setCache = async (key, value, expireSeconds = 300) => {
    if (!redisClient) return;
    try {
        await redisClient.setex(key, expireSeconds, JSON.stringify(value));
    } catch (err) {
        console.log('Cache set failed:', err.message);
    }
};

export const getCache = async (key) => {
    if (!redisClient) return null;
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        return null;
    }
};

export const deleteCache = async (key) => {
    if (!redisClient) return;
    try {
        await redisClient.del(key);
    } catch (err) {
        console.log('Cache delete failed:', err.message);
    }
};

export default redisClient;
