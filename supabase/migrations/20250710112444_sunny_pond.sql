/*
  # Sistema de OTAs Dinâmicas

  1. New Tables
    - `otas`
      - `id` (uuid, primary key)
      - `name` (text, nome da OTA)
      - `is_active` (boolean, se está ativa)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `ota_sales`
      - `id` (uuid, primary key)
      - `sales_detail_id` (uuid, references sales_details.id)
      - `ota_id` (uuid, references otas.id)
      - `sales_amount` (numeric, valor das vendas)
      - `quantity` (integer, quantidade de reservas)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for public access (read-only)

  3. Initial Data
    - Insert existing OTAs into the new table
*/

-- Create OTAs table
CREATE TABLE IF NOT EXISTS otas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create OTA sales table
CREATE TABLE IF NOT EXISTS ota_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_detail_id uuid REFERENCES sales_details(id) ON DELETE CASCADE,
  ota_id uuid REFERENCES otas(id) ON DELETE CASCADE,
  sales_amount numeric DEFAULT 0,
  quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sales_detail_id, ota_id)
);

-- Enable RLS
ALTER TABLE otas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ota_sales ENABLE ROW LEVEL SECURITY;

-- Add policies for otas
CREATE POLICY "OTAs are publicly readable"
  ON otas
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage OTAs"
  ON otas
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add policies for ota_sales
CREATE POLICY "OTA sales are publicly readable"
  ON ota_sales
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage OTA sales"
  ON ota_sales
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_otas_updated_at
  BEFORE UPDATE ON otas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ota_sales_updated_at
  BEFORE UPDATE ON ota_sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert existing OTAs
INSERT INTO otas (name) VALUES 
  ('Booking'),
  ('Decolar'),
  ('HotelBeds'),
  ('Tourmerd'),
  ('Keytel'),
  ('Planisfério'),
  ('Expedia'),
  ('Itaparica'),
  ('Outros')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX idx_ota_sales_sales_detail_id ON ota_sales(sales_detail_id);
CREATE INDEX idx_ota_sales_ota_id ON ota_sales(ota_id);
CREATE INDEX idx_otas_active ON otas(is_active);