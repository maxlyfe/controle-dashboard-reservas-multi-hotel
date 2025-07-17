/*
  # Fix quantity columns and ensure proper schema

  1. Changes
    - Ensure all quantity columns exist with proper names
    - Add any missing sales columns
    - Update existing records to have proper default values
    - Force schema cache refresh

  2. Security
    - No changes to RLS policies needed
*/

-- Ensure all quantity columns exist
DO $$
BEGIN
  -- Booking quantity
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_details' AND column_name = 'booking_quantity'
  ) THEN
    ALTER TABLE sales_details ADD COLUMN booking_quantity integer DEFAULT 0;
  END IF;

  -- Decolar quantity (mapped from decolaQuantity)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_details' AND column_name = 'decolar_quantity'
  ) THEN
    ALTER TABLE sales_details ADD COLUMN decolar_quantity integer DEFAULT 0;
  END IF;

  -- HotelBeds quantity (mapped from hotelbedsQuantity)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_details' AND column_name = 'hotelbeds_quantity'
  ) THEN
    ALTER TABLE sales_details ADD COLUMN hotelbeds_quantity integer DEFAULT 0;
  END IF;

  -- Tourmerd quantity
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_details' AND column_name = 'tourmerd_quantity'
  ) THEN
    ALTER TABLE sales_details ADD COLUMN tourmerd_quantity integer DEFAULT 0;
  END IF;

  -- Keytel quantity
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_details' AND column_name = 'keytel_quantity'
  ) THEN
    ALTER TABLE sales_details ADD COLUMN keytel_quantity integer DEFAULT 0;
  END IF;

  -- Planisfério sales and quantity
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_details' AND column_name = 'planisferio_sales'
  ) THEN
    ALTER TABLE sales_details ADD COLUMN planisferio_sales numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_details' AND column_name = 'planisferio_quantity'
  ) THEN
    ALTER TABLE sales_details ADD COLUMN planisferio_quantity integer DEFAULT 0;
  END IF;

  -- Expedia quantity (separate from expedia_sales)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_details' AND column_name = 'expedia_quantity'
  ) THEN
    ALTER TABLE sales_details ADD COLUMN expedia_quantity integer DEFAULT 0;
  END IF;

  -- Itaparica sales and quantity
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_details' AND column_name = 'itaparica_sales'
  ) THEN
    ALTER TABLE sales_details ADD COLUMN itaparica_sales numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_details' AND column_name = 'itaparica_quantity'
  ) THEN
    ALTER TABLE sales_details ADD COLUMN itaparica_quantity integer DEFAULT 0;
  END IF;

  -- Other OTA quantity
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_details' AND column_name = 'other_ota_quantity'
  ) THEN
    ALTER TABLE sales_details ADD COLUMN other_ota_quantity integer DEFAULT 0;
  END IF;
END $$;

-- Update all existing records to ensure no NULL values
UPDATE sales_details 
SET 
  booking_quantity = COALESCE(booking_quantity, 0),
  decolar_quantity = COALESCE(decolar_quantity, 0),
  hotelbeds_quantity = COALESCE(hotelbeds_quantity, 0),
  tourmerd_quantity = COALESCE(tourmerd_quantity, 0),
  keytel_quantity = COALESCE(keytel_quantity, 0),
  planisferio_sales = COALESCE(planisferio_sales, 0),
  planisferio_quantity = COALESCE(planisferio_quantity, 0),
  expedia_quantity = COALESCE(expedia_quantity, 0),
  itaparica_sales = COALESCE(itaparica_sales, 0),
  itaparica_quantity = COALESCE(itaparica_quantity, 0),
  other_ota_quantity = COALESCE(other_ota_quantity, 0);

-- Force a schema refresh by updating the table comment
COMMENT ON TABLE sales_details IS 'Sales details with quantity tracking - Updated ' || now();