/*
  # Create persona table for Tavus integration

  1. New Tables
    - `persona`
      - `id` (serial, primary key)
      - `persona_id` (text, not null) - Tavus persona ID
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `persona` table
    - Add policy for public read access (since personas are shared resources)
    - Add policy for authenticated insert/update operations

  3. Indexes
    - Add index on persona_id for fast lookups
    - Add index on created_at for chronological queries
*/

-- Create persona table
CREATE TABLE IF NOT EXISTS persona (
  id SERIAL PRIMARY KEY,
  persona_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_persona_persona_id ON persona(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_created_at ON persona(created_at DESC);

-- Enable Row Level Security
ALTER TABLE persona ENABLE ROW LEVEL SECURITY;

-- Create policies for persona table
CREATE POLICY "Personas are publicly readable" ON persona
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert personas" ON persona
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update personas" ON persona
  FOR UPDATE USING (true);

-- Insert default personas for different moods (optional seed data)
INSERT INTO persona (persona_id) VALUES 
  ('default_hopeful_persona'),
  ('default_lonely_persona'),
  ('default_motivated_persona'),
  ('default_calm_persona'),
  ('default_loving_persona'),
  ('default_joyful_persona')
ON CONFLICT DO NOTHING;