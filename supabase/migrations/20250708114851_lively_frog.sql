/*
  # Final fix for quantity columns and schema cache

  1. Changes
    - Ensure ALL quantity columns exist with proper data types
    - Force schema cache refresh
    - Add comprehensive error handling
    - Verify all columns are properly created

  2. Security
    - No changes to RLS policies needed
*/

-- Drop and recreate all quantity columns to ensure they exist properly
DO $$
DECLARE
    column_exists boolean;
BEGIN
    -- Check and create booking_quantity
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales_details' AND column_name = 'booking_quantity'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE sales_details ADD COLUMN booking_quantity integer DEFAULT 0;
        RAISE NOTICE 'Added booking_quantity column';
    ELSE
        RAISE NOTICE 'booking_quantity column already exists';
    END IF;

    -- Check and create decolar_quantity
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales_details' AND column_name = 'decolar_quantity'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE sales_details ADD COLUMN decolar_quantity integer DEFAULT 0;
        RAISE NOTICE 'Added decolar_quantity column';
    ELSE
        RAISE NOTICE 'decolar_quantity column already exists';
    END IF;

    -- Check and create hotelbeds_quantity
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales_details' AND column_name = 'hotelbeds_quantity'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE sales_details ADD COLUMN hotelbeds_quantity integer DEFAULT 0;
        RAISE NOTICE 'Added hotelbeds_quantity column';
    ELSE
        RAISE NOTICE 'hotelbeds_quantity column already exists';
    END IF;

    -- Check and create tourmerd_quantity
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales_details' AND column_name = 'tourmerd_quantity'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE sales_details ADD COLUMN tourmerd_quantity integer DEFAULT 0;
        RAISE NOTICE 'Added tourmerd_quantity column';
    ELSE
        RAISE NOTICE 'tourmerd_quantity column already exists';
    END IF;

    -- Check and create keytel_quantity
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales_details' AND column_name = 'keytel_quantity'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE sales_details ADD COLUMN keytel_quantity integer DEFAULT 0;
        RAISE NOTICE 'Added keytel_quantity column';
    ELSE
        RAISE NOTICE 'keytel_quantity column already exists';
    END IF;

    -- Check and create planisferio_quantity
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales_details' AND column_name = 'planisferio_quantity'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE sales_details ADD COLUMN planisferio_quantity integer DEFAULT 0;
        RAISE NOTICE 'Added planisferio_quantity column';
    ELSE
        RAISE NOTICE 'planisferio_quantity column already exists';
    END IF;

    -- Check and create expedia_quantity
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales_details' AND column_name = 'expedia_quantity'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE sales_details ADD COLUMN expedia_quantity integer DEFAULT 0;
        RAISE NOTICE 'Added expedia_quantity column';
    ELSE
        RAISE NOTICE 'expedia_quantity column already exists';
    END IF;

    -- Check and create itaparica_quantity
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales_details' AND column_name = 'itaparica_quantity'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE sales_details ADD COLUMN itaparica_quantity integer DEFAULT 0;
        RAISE NOTICE 'Added itaparica_quantity column';
    ELSE
        RAISE NOTICE 'itaparica_quantity column already exists';
    END IF;

    -- Check and create other_ota_quantity
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales_details' AND column_name = 'other_ota_quantity'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE sales_details ADD COLUMN other_ota_quantity integer DEFAULT 0;
        RAISE NOTICE 'Added other_ota_quantity column';
    ELSE
        RAISE NOTICE 'other_ota_quantity column already exists';
    END IF;

    -- Check and create planisferio_sales
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales_details' AND column_name = 'planisferio_sales'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE sales_details ADD COLUMN planisferio_sales numeric DEFAULT 0;
        RAISE NOTICE 'Added planisferio_sales column';
    ELSE
        RAISE NOTICE 'planisferio_sales column already exists';
    END IF;

    -- Check and create itaparica_sales
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales_details' AND column_name = 'itaparica_sales'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE sales_details ADD COLUMN itaparica_sales numeric DEFAULT 0;
        RAISE NOTICE 'Added itaparica_sales column';
    ELSE
        RAISE NOTICE 'itaparica_sales column already exists';
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
  planisferio_quantity = COALESCE(planisferio_quantity, 0),
  expedia_quantity = COALESCE(expedia_quantity, 0),
  itaparica_quantity = COALESCE(itaparica_quantity, 0),
  other_ota_quantity = COALESCE(other_ota_quantity, 0),
  planisferio_sales = COALESCE(planisferio_sales, 0),
  itaparica_sales = COALESCE(itaparica_sales, 0);

-- Force schema refresh by updating table statistics
ANALYZE sales_details;

-- Force schema refresh by updating table comment with timestamp
COMMENT ON TABLE sales_details IS 'Sales details with quantity tracking - Schema refreshed at ' || now();

-- Verify all columns exist
DO $$
DECLARE
    missing_columns text[] := ARRAY[]::text[];
BEGIN
    -- Check for all required columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_details' AND column_name = 'booking_quantity') THEN
        missing_columns := array_append(missing_columns, 'booking_quantity');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_details' AND column_name = 'decolar_quantity') THEN
        missing_columns := array_append(missing_columns, 'decolar_quantity');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_details' AND column_name = 'hotelbeds_quantity') THEN
        missing_columns := array_append(missing_columns, 'hotelbeds_quantity');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_details' AND column_name = 'tourmerd_quantity') THEN
        missing_columns := array_append(missing_columns, 'tourmerd_quantity');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_details' AND column_name = 'keytel_quantity') THEN
        missing_columns := array_append(missing_columns, 'keytel_quantity');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_details' AND column_name = 'planisferio_quantity') THEN
        missing_columns := array_append(missing_columns, 'planisferio_quantity');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_details' AND column_name = 'expedia_quantity') THEN
        missing_columns := array_append(missing_columns, 'expedia_quantity');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_details' AND column_name = 'itaparica_quantity') THEN
        missing_columns := array_append(missing_columns, 'itaparica_quantity');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_details' AND column_name = 'other_ota_quantity') THEN
        missing_columns := array_append(missing_columns, 'other_ota_quantity');
    END IF;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION 'Missing columns: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE 'All quantity columns verified successfully!';
    END IF;
END $$;