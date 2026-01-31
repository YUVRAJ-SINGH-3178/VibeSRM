-- Seed data for VibeSRM

-- Insert sample locations
INSERT INTO locations (name, type, latitude, longitude, capacity, amenities, description, photo_url) VALUES
('Tech Park Library', 'library', 12.9716, 77.5946, 500, '{"wifi": true, "outlets": true, "food": false, "whiteboard": false}', 'Quiet Zone • Level 3', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da'),
('Java Lounge', 'cafe', 12.9726, 77.5956, 150, '{"wifi": true, "outlets": true, "food": true, "whiteboard": false}', 'Fresh Brews • Fast WiFi', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24'),
('Spartan Gym', 'gym', 12.9706, 77.5936, 200, '{"wifi": false, "outlets": false, "food": false, "whiteboard": false}', 'Empty • Cardio Deck', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48'),
('Innovation Hub', 'study', 12.9736, 77.5966, 80, '{"wifi": true, "outlets": true, "food": false, "whiteboard": true}', 'Hackathon in progress', 'https://images.unsplash.com/photo-1497366216548-37526070297c'),
('Central Cafeteria', 'cafe', 12.9716, 77.5976, 300, '{"wifi": true, "outlets": false, "food": true, "whiteboard": false}', 'All-day dining', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'),
('Study Room A', 'study', 12.9696, 77.5946, 20, '{"wifi": true, "outlets": true, "food": false, "whiteboard": true}', 'Group study sessions', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2'),
('Outdoor Pavilion', 'lounge', 12.9746, 77.5926, 100, '{"wifi": true, "outlets": false, "food": false, "whiteboard": false}', 'Fresh air study spot', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c'),
('Music Practice Room', 'other', 12.9686, 77.5986, 15, '{"wifi": false, "outlets": true, "food": false, "whiteboard": false}', 'Soundproof rooms', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d');

-- Insert achievements
INSERT INTO achievements (name, description, category, requirement_type, requirement_value, coin_reward, icon_url) VALUES
('First Steps', 'Complete your first study session', 'hours', 'total_hours', 1, 50, '🎯'),
('Week Warrior', 'Maintain a 7-day streak', 'streaks', 'current_streak', 7, 100, '🔥'),
('Century Club', 'Study for 100 hours total', 'hours', 'total_hours', 100, 500, '💯'),
('Laser Focused', 'Achieve 95+ focus score', 'focus', 'focus_score', 95, 200, '🎯'),
('Study Buddy', 'Complete 10 group sessions', 'social', 'group_sessions', 10, 150, '👥'),
('Ghost Master', 'Complete 50 ghost mode sessions', 'social', 'ghost_sessions', 50, 300, '👻'),
('Early Bird', 'Check in before 7 AM', 'special', 'early_checkin', 1, 75, '🌅'),
('Night Owl', 'Check in after 10 PM', 'special', 'late_checkin', 1, 75, '🦉'),
('Marathon Runner', 'Study for 8+ hours in one session', 'hours', 'session_duration', 480, 250, '🏃'),
('Zen Master', 'Complete 10 sessions with 90+ focus', 'focus', 'high_focus_count', 10, 400, '🧘');

-- Insert sample noise reports (last hour)
INSERT INTO noise_reports (location_id, noise_level, source, reported_at)
SELECT 
    l.id,
    FLOOR(RANDOM() * 60 + 20)::INTEGER,
    'manual',
    NOW() - (RANDOM() * INTERVAL '1 hour')
FROM locations l, generate_series(1, 5);

-- Update some locations with current occupancy
UPDATE locations SET current_occupancy = FLOOR(RANDOM() * capacity * 0.8)::INTEGER;
