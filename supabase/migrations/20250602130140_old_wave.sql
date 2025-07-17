/*
  # Add JSON columns to sales_details table

  1. Changes
    - Add three new JSONB columns to `sales_details` table:
      - `hotel_central_sales`: Store central sales data per hotel
      - `hotel_site_sales`: Store site sales data per hotel
      - `hotel_ota_sales`: Store OTA sales data per hotel
    
  2. Notes
    - Using JSONB type for better performance and indexing capabilities
    - Default empty object ({}) ensures no null values
    - Safe operation that won't affect existing data
*/

-- Add hotel_central_sales column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales_details' AND column_name = 'hotel_central_sales'
  ) THEN
    ALTER TABLE sales_details ADD COLUMN hotel_central_sales JSONB DEFAULT '{}';
  END IF;
END $$;

-- Add hotel_site_sales column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales_details' AND column_name = 'hotel_site_sales'
  ) THEN
    ALTER TABLE sales_details ADD COLUMN hotel_site_sales JSONB DEFAULT '{}';
  END IF;
END $$;

-- Add hotel_ota_sales column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales_details' AND column_name = 'hotel_ota_sales'
  ) THEN
    ALTER TABLE sales_details ADD COLUMN hotel_ota_sales JSONB DEFAULT '{}';
  END IF;
END $$;