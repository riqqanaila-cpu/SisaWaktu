
-- Database Schema for SisaWaktu

-- Profiles / Users (if using Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  browser_notifications_enabled BOOLEAN DEFAULT true,
  email_notifications_enabled BOOLEAN DEFAULT false,
  default_lead_days INTEGER DEFAULT 3,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Expiry Items
CREATE TABLE items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('Skincare', 'Medicine', 'Kitchen', 'Other')),
  expiry_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  is_priority BOOLEAN DEFAULT false -- Derived or manually set
);

-- Indexing for performance
CREATE INDEX idx_items_user_expiry ON items(user_id, expiry_date);
