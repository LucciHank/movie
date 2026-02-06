-- Run these commands in your Supabase SQL Editor to fix the missing columns error

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create analytics table if not exists
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- 'page_view', 'media_view'
  media_id VARCHAR(255),
  media_title VARCHAR(255),
  user_id UUID,
  duration INT, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update existing admin user (optional, if you want to ensure they are admin)
UPDATE users SET role = 'admin', status = 'active' WHERE username = 'admin2004' OR username = 'hoanganhdo181@gmail.com';
