/*
  # Initial Schema Setup

  1. New Tables
    - `users`
      - `id` (uuid, primary key, matches auth.users.id)
      - `name` (text)
      - `email` (text)
      - `role` (text)
      - `created_at` (timestamp)
    
    - `monthly_data`
      - `id` (uuid, primary key)
      - `month` (integer)
      - `year` (integer)
      - `goal` (numeric)
      - `total_sales` (numeric)
      - `direct_sales` (numeric)
      - `ota_sales` (numeric)
      - `central_sales` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `updated_by` (uuid, references users.id)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for public access to monthly_data (read-only)
*/

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('admin', 'user')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Monthly data table
CREATE TABLE IF NOT EXISTS monthly_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year integer NOT NULL,
  goal numeric NOT NULL DEFAULT 0,
  total_sales numeric NOT NULL DEFAULT 0,
  direct_sales numeric NOT NULL DEFAULT 0,
  ota_sales numeric NOT NULL DEFAULT 0,
  central_sales numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES users(id),
  UNIQUE(month, year)
);

ALTER TABLE monthly_data ENABLE ROW LEVEL SECURITY;

-- Allow public read access to monthly_data
CREATE POLICY "Monthly data is publicly readable"
  ON monthly_data
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to update monthly_data
CREATE POLICY "Authenticated users can update monthly data"
  ON monthly_data
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to insert monthly_data
CREATE POLICY "Authenticated users can insert monthly data"
  ON monthly_data
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_monthly_data_updated_at
  BEFORE UPDATE ON monthly_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();