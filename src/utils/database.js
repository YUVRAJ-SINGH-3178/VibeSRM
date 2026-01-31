// VibeSRM API Service
// Connects frontend to backend

import { supabase } from '../supabase';

// ============ AUTH ============
export const auth = {
    register: async (email, password, username, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                    full_name: fullName
                }
            }
        });

        if (error) throw error;

        // Create profile in users table
        const { error: profileError } = await supabase
            .from('users')
            .upsert({
                id: data.user.id,
                email: email,
                username: username,
                full_name: fullName || username,
                total_coins: 0,
                current_streak: 0
            });

        if (profileError) throw profileError;

        return { user: { ...data.user, username, fullName } };
    },

    login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Fetch profile
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        return { user: { ...data.user, ...profile } };
    },

    logout: async () => {
        await supabase.auth.signOut();
    }
};

// ============ USER ============
export const user = {
    getProfile: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        const metadata = user.user_metadata || {};

        const flatProfile = profile ? {
            ...profile,
            year_of_study: metadata.year_of_study,
            interests: metadata.interests || [],
            free_time: metadata.free_time
        } : {
            year_of_study: metadata.year_of_study,
            interests: metadata.interests || [],
            free_time: metadata.free_time
        };

        return { user: { ...user, ...flatProfile } };
    },

    getStats: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile } = await supabase
            .from('users')
            .select('total_hours, total_coins, current_streak, longest_streak')
            .eq('id', user.id)
            .single();

        if (!profile) return null;

        return {
            overview: {
                totalHours: profile.total_hours,
                totalCoins: profile.total_coins,
                currentStreak: profile.current_streak,
                longestStreak: profile.longest_streak
            }
        };
    },

    getAchievements: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data } = await supabase
            .from('user_achievements')
            .select('*, achievements(*)')
            .eq('user_id', user.id);
        return data;
    },

    updateSettings: async (settings) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { year_of_study, interests, free_time, ...dbFields } = settings;

        const { data: authData, error: authError } = await supabase.auth.updateUser({
            data: {
                year_of_study: year_of_study || null,
                interests: interests || [],
                free_time: free_time || null
            }
        });

        if (authError) throw authError;

        const dbPayload = {};
        if (dbFields.full_name !== undefined) dbPayload.full_name = dbFields.full_name;
        if (dbFields.username !== undefined) dbPayload.username = dbFields.username;
        if (dbFields.avatar_url !== undefined) dbPayload.avatar_url = dbFields.avatar_url;

        if (Object.keys(dbPayload).length > 0) {
            await supabase
                .from('users')
                .update(dbPayload)
                .eq('id', user.id);
        }

        const metadata = authData.user?.user_metadata || {};
        return {
            ...dbFields,
            year_of_study: metadata.year_of_study,
            interests: metadata.interests || [],
            free_time: metadata.free_time
        };
    }
};

// ============ LOCATIONS ============
export const locations = {
    getAll: async (filters = {}) => {
        let query = supabase.from('locations').select('*');
        if (filters.type) query = query.eq('type', filters.type);
        const { data, error } = await query;
        if (error) throw error;
        return { locations: data };
    },

    getById: async (id) => {
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    }
};

// ============ CHECK-INS ============
export const checkins = {
    checkIn: async (locationId, latitude, longitude, subject, mode, plannedDuration) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('checkins')
            .insert({
                user_id: user.id,
                location_id: locationId,
                subject,
                mode,
                planned_duration: plannedDuration,
                is_active: true
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    checkOut: async (checkinId, feedback = {}) => {
        const { data, error } = await supabase
            .from('checkins')
            .update({
                ...feedback,
                is_active: false,
                checked_out_at: new Date().toISOString()
            })
            .eq('id', checkinId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    getActive: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { active: false };
        const { data, error } = await supabase
            .from('checkins')
            .select('*, locations(*)')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .maybeSingle();
        if (error) throw error;
        return { active: !!data, checkin: data };
    }
};

// ============ SOCIAL ============
export const social = {
    searchUsers: async (query) => {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, full_name, avatar_url')
            .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
            .limit(10);
        if (error) throw error;
        return data;
    },

    getFriends: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('friendships')
            .select('*, friend:friend_id(id, username, full_name, avatar_url)')
            .eq('user_id', user.id)
            .eq('status', 'accepted');
        if (error) throw error;
        return data;
    }
};

// ============ EVENTS ============
export const events = {
    getAll: async () => {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('start_time', { ascending: true });
        if (error) throw error;
        return { events: data };
    },

    create: async (eventData) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('events')
            .insert({
                title: eventData.title,
                description: eventData.description,
                type: eventData.type,
                location_name: eventData.location_name,
                start_time: eventData.start_time,
                is_major: eventData.is_major || false,
                creator_id: user.id,
                map_x: eventData.coords?.x || Math.floor(200 + Math.random() * 800),
                map_y: eventData.coords?.y || Math.floor(150 + Math.random() * 600)
            })
            .select()
            .single();
        if (error) throw error;
        return { event: data };
    },

    join: async (id) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: event, error: fetchError } = await supabase
            .from('events')
            .select('attendees')
            .eq('id', id)
            .single();
        if (fetchError) throw fetchError;

        const currentAttendees = event.attendees || [];
        if (currentAttendees.includes(user.id)) {
            return { alreadyJoined: true };
        }

        const newAttendees = [...currentAttendees, user.id];
        const { data, error } = await supabase
            .from('events')
            .update({ attendees: newAttendees })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return { event: data, joined: true };
    },

    leave: async (id) => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: event, error: fetchError } = await supabase
            .from('events')
            .select('attendees')
            .eq('id', id)
            .single();
        if (fetchError) throw fetchError;

        const newAttendees = (event.attendees || []).filter(uid => uid !== user.id);
        const { data, error } = await supabase
            .from('events')
            .update({ attendees: newAttendees })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return { event: data, left: true };
    },

    delete: async (id) => {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { deleted: true };
    }
};

// ============ CHAT ============
export const chat = {
    getMessages: async (channelId = 'global', limit = 50) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*, sender:sender_id(id, username, full_name, avatar_url)')
            .eq('channel_id', channelId)
            .order('created_at', { ascending: true })
            .limit(limit);
        if (error) throw error;
        return data;
    },

    sendMessage: async (text, channelId = 'global') => {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
            .from('messages')
            .insert({ sender_id: user.id, text, channel_id: channelId })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    subscribeToMessages: (channelId, callback) => {
        return supabase
            .channel(`channel:${channelId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `channel_id=eq.${channelId}`
            }, async (payload) => {
                const { data: sender } = await supabase
                    .from('users')
                    .select('id, username, full_name, avatar_url')
                    .eq('id', payload.new.sender_id)
                    .single();
                callback({ ...payload.new, sender });
            })
            .subscribe();
    },

    deleteMessage: async (messageId) => {
        if (!messageId) throw new Error('Invalid message id');
        if (String(messageId).startsWith('temp-')) {
            throw new Error('Optimistic message — not persisted on server');
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('messages')
            .delete()
            .match({ id: messageId, sender_id: user.id })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

export const health = () => Promise.resolve({ status: 'connected', provider: 'supabase' });

export default {
    auth,
    user,
    locations,
    checkins,
    social,
    events,
    chat,
    health
};
