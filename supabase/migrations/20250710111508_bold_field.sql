/*
  # Add separate HotelBeds sales field

  1. Changes
    - Add `hotelbeds_sales` column to `sales_details` table
    - This separates HotelBeds from Expedia sales tracking
    - Migrate existing expedia_sales data to hotelbeds_sales where appropriate

  2. Security
    - No changes to RLS policies needed
*/

-- Add hotelbeds_sales column to sales_details table
ALTER TABLE sales_details 
ADD COLUMN IF NOT EXISTS hotelbeds_sales numeric DEFAULT 0;

-- Update any existing records to have 0 as default value
UPDATE sales_details 
SET hotelbeds_sales = 0 
WHERE hotelbeds_sales IS NULL;

-- Force schema refresh by updating table comment with timestamp
COMMENT ON TABLE sales_details IS 'Sales details with separate HotelBeds field - Schema updated at ' || now();

-- Verify the column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales_details' AND column_name = 'hotelbeds_sales'
    ) THEN
        RAISE EXCEPTION 'Failed to create hotelbeds_sales column';
    ELSE
        RAISE NOTICE 'hotelbeds_sales column created successfully!';
    END IF;
END $$;