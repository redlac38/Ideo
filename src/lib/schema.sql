-- Ideo Database Schema
-- Run this against your Vercel Postgres database

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Results table (saved ideological analyses)
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_guest BOOLEAN DEFAULT FALSE,
  guest_token TEXT,
  name TEXT,
  scores JSONB NOT NULL,
  answers JSONB,
  ideology_id TEXT,
  ideology_name TEXT,
  ideology_match INTEGER,
  radar_data JSONB,
  top_matches JSONB,
  regime_matches JSONB,
  country_matches JSONB,
  philosopher_matches JSONB,
  leader_matches JSONB,
  famous_matches JSONB,
  religion_match JSONB,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_results_user_id ON results(user_id);
CREATE INDEX IF NOT EXISTS idx_results_guest_token ON results(guest_token);
CREATE INDEX IF NOT EXISTS idx_results_created_at ON results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable UUID extension if not already
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
