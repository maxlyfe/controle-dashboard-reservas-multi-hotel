/*
  # Add hotel goals and improve sales tracking

  1. New Tables
    - `hotel_goals`
      - `id` (uuid, primary key)
      - `hotel_id` (uuid, references hotels.id)
      - `month` (integer)
      - `year` (integer)
      - `goal` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes
    - Add unique constraint on hotel_id, month, year combination
    - Enable RLS and add appropriate policies
    - Add trigger for updated_at
*/

-- Create hotel_goals table
CREATE TABLE IF NOT EXISTS hotel_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year integer NOT NULL,
  goal numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(hotel_id, month, year)
);

-- Enable RLS
ALTER TABLE hotel_goals ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Hotel goals are publicly readable"
  ON hotel_goals
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage hotel goals"
  ON hotel_goals
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_hotel_goals_hotel_month_year 
  ON hotel_goals(hotel_id, month, year);

-- Add trigger for updated_at
CREATE TRIGGER update_hotel_goals_updated_at
  BEFORE UPDATE ON hotel_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();