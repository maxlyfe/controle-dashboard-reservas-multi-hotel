/*
  # Add quantity fields for Central and Site sales

  1. Changes
    - Add quantity fields for Central sales channels
    - Add quantity fields for Site sales channels
    - Ensure all columns have proper default values

  2. New Columns
    - central_sales_quantity: Number of Central sales reservations
    - central_packages_quantity: Number of Grupo reservations
    - site_recepcao_balcao_quantity: Number of Recepção/Balcão reservations
    - central_events_quantity: Number of Evento reservations
    - central_day_use_quantity: Number of Day Use reservations

  3. Security
    - No changes to RLS policies needed
*/

-- Add quantity columns for Central sales channels
DO $$
BEGIN
  -- Central sales quantity
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_details' AND column_name = 'central_sales_quantity'
  ) THEN
    ALTER TABLE sales_details ADD COLUMN central_sales_quantity integer DEFAULT 0;
  END IF;

  -- Central packages (Grupo) quantity
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_details' AND column_name = 'central_packages_quantity'
  ) THEN
    ALTER TABLE sales_details ADD COLUMN central_packages_quantity integer DEFAULT 0;
  END IF;

  -- Site recepcao/balcao quantity
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_details' AND column_name = 'site_recepcao_balcao_quantity'
  ) THEN
    ALTER TABLE sales_details ADD COLUMN site_recepcao_balcao_quantity integer DEFAULT 0;
  END IF;

  -- Central events quantity
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_details' AND column_name = 'central_events_quantity'
  ) THEN
    ALTER TABLE sales_details ADD COLUMN central_events_quantity integer DEFAULT 0;
  END IF;

  -- Central day use quantity
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_details' AND column_name = 'central_day_use_quantity'
  ) THEN
    ALTER TABLE sales_details ADD COLUMN central_day_use_quantity integer DEFAULT 0;
  END IF;
END $$;

-- Update any existing records to have 0 as default value for all quantity fields
UPDATE sales_details 
SET 
  central_sales_quantity = COALESCE(central_sales_quantity, 0),
  central_packages_quantity = COALESCE(central_packages_quantity, 0),
  site_recepcao_balcao_quantity = COALESCE(site_recepcao_balcao_quantity, 0),
  central_events_quantity = COALESCE(central_events_quantity, 0),
  central_day_use_quantity = COALESCE(central_day_use_quantity, 0);

-- Force schema refresh by updating table comment with timestamp
COMMENT ON TABLE sales_details IS 'Sales details with Central and Site quantity tracking - Schema updated at ' || now();