-- Supabase SQL Schema for TomFlix Movie App
-- Run this in Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  password TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  media_id VARCHAR(255) NOT NULL,
  media_type VARCHAR(50) NOT NULL,
  media_title VARCHAR(500),
  media_poster VARCHAR(500),
  media_rate DECIMAL(3,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  media_id VARCHAR(255) NOT NULL,
  media_type VARCHAR(50) NOT NULL,
  media_title VARCHAR(500),
  media_poster VARCHAR(500),
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watch Sources table
CREATE TABLE IF NOT EXISTS watch_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  media_id VARCHAR(255) NOT NULL,
  media_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  playback_type VARCHAR(50) NOT NULL, -- e.g., 'hls', 'iframe'
  url TEXT NOT NULL,
  quality VARCHAR(50),
  language VARCHAR(50),
  license_type VARCHAR(50),
  license_proof_url TEXT,
  region_allowlist TEXT[], -- Array of country codes
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'flagged', 'disabled'
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watch Source Reports table
CREATE TABLE IF NOT EXISTS watch_source_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES watch_sources(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'open', -- 'open', 'resolved'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_media_id ON favorites(media_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_media_id ON reviews(media_id);
CREATE INDEX IF NOT EXISTS idx_watch_sources_media ON watch_sources(media_id, media_type);
CREATE INDEX IF NOT EXISTS idx_watch_source_reports_source ON watch_source_reports(source_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_source_reports ENABLE ROW LEVEL SECURITY;

-- Policies for public read access
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can read favorites" ON favorites FOR SELECT USING (true);
CREATE POLICY "Anyone can read watch_sources" ON watch_sources FOR SELECT USING (true);

-- Policies for insert/delete (simplified - in production should be more strict)
CREATE POLICY "Authenticated users can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (true);

CREATE POLICY "Authenticated users can insert favorites" ON favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (true);

CREATE POLICY "Anyone can insert reports" ON watch_source_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage reports" ON watch_source_reports USING (true);

-- Admin policies for watch_sources (simplification)
CREATE POLICY "Admins can manage watch_sources" ON watch_sources USING (true);


-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- 'page_view', 'media_view'
  media_id VARCHAR(255),
  media_title VARCHAR(255),
  user_id UUID,
  duration INT, -- in seconds (for total watch time)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);

-- Users table extensions (if not exist)
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Policies for users
CREATE POLICY "Manage own user data" ON users USING (true);

-- Insert admin user (password: Hanh2004@)
-- Salt and hash generated with: crypto.pbkdf2Sync('Hanh2004@', salt, 1000, 64, 'sha512')
