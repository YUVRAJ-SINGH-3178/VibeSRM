// VibeSRM API Service
// Connects frontend to backend

const API_BASE = 'http://localhost:5000/api';

// Token management
let authToken = localStorage.getItem('vibesrm_token');

export const setToken = (token) => {
    authToken = token;
    if (token) {
        localStorage.setItem('vibesrm_token', token);
    } else {
        localStorage.removeItem('vibesrm_token');
    }
};

export const getToken = () => authToken;

// API helper
const api = async (endpoint, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` })
    };

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: { ...headers, ...options.headers }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error.message);
        throw error;
    }
};

// ============ AUTH ============
export const auth = {
    register: (email, password, username, fullName) =>
        api('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, username, fullName })
        }),

    login: async (email, password) => {
        const data = await api('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (data.token) setToken(data.token);
        return data;
    },

    logout: () => {
        setToken(null);
    }
};

// ============ USER ============
export const user = {
    getProfile: () => api('/users/me'),

    getStats: () => api('/users/stats'),

    getAchievements: () => api('/users/achievements'),

    updateSettings: (settings) =>
        api('/users/settings', {
            method: 'PATCH',
            body: JSON.stringify(settings)
        })
};

// ============ LOCATIONS ============
export const locations = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        return api(`/locations${params ? `?${params}` : ''}`);
    },

    getById: (id) => api(`/locations/${id}`),

    getNoiseHeatmap: () => api('/locations/noise/heatmap'),

    getNoiseHistory: (id, hours = 24) =>
        api(`/locations/${id}/noise/history?hours=${hours}`)
};

// ============ CHECK-INS ============
export const checkins = {
    checkIn: (locationId, latitude, longitude, subject, mode, plannedDuration) =>
        api('/checkins/checkin', {
            method: 'POST',
            body: JSON.stringify({ locationId, latitude, longitude, subject, mode, plannedDuration })
        }),

    checkOut: (checkinId, feedback = {}) =>
        api('/checkins/checkout', {
            method: 'POST',
            body: JSON.stringify({ checkinId, ...feedback })
        }),

    getActive: () => api('/checkins/active')
};

// ============ SOCIAL ============
export const social = {
    searchUsers: (query) => api(`/social/search?q=${encodeURIComponent(query)}`),

    getFriends: () => api('/social/friends'),

    sendFriendRequest: (userId) =>
        api('/social/friends/request', {
            method: 'POST',
            body: JSON.stringify({ userId })
        }),

    acceptFriendRequest: (userId) =>
        api('/social/friends/accept', {
            method: 'POST',
            body: JSON.stringify({ userId })
        }),

    getPendingRequests: () => api('/social/friends/pending'),

    sendInvite: (toUserId, locationId, scheduledTime, message) =>
        api('/social/invite', {
            method: 'POST',
            body: JSON.stringify({ toUserId, locationId, scheduledTime, message })
        }),

    getInvites: () => api('/social/invites'),

    respondToInvite: (inviteId, accept) =>
        api(`/social/invites/${inviteId}/respond`, {
            method: 'POST',
            body: JSON.stringify({ accept })
        })
};

// ============ GHOST MODE ============
export const ghost = {
    getNearby: (locationId) =>
        api(`/ghost/nearby${locationId ? `?locationId=${locationId}` : ''}`),

    sendEncouragement: (checkinId, emoji) =>
        api('/ghost/encourage', {
            method: 'POST',
            body: JSON.stringify({ checkinId, emoji })
        }),

    getEncouragements: () => api('/ghost/encouragements'),

    getSessionSummary: (checkinId) => api(`/ghost/session/${checkinId}/summary`)
};

// ============ HEALTH CHECK ============
export const health = () => fetch(`${API_BASE.replace('/api', '')}/health`).then(r => r.json());

export default {
    auth,
    user,
    locations,
    checkins,
    social,
    ghost,
    health,
    setToken,
    getToken
};
