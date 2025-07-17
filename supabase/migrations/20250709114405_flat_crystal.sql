/*
  # Adicionar colunas de quantidade para Site e Central

  1. Changes
    - Add quantity columns for Site sales channels
    - Add quantity columns for Central sales channels
    - Ensure all columns have proper default values

  2. New Columns
    - site_recepcao_balcao_quantity: Quantidade de reservas Recepção/Balcão
    - central_events_quantity: Quantidade de reservas Evento
    - central_day_use_quantity: Quantidade de reservas Day Use
    - central_sales_quantity: Quantidade de reservas Central
    - central_packages_quantity: Quantidade de reservas Grupo

  3. Security
    - No changes to RLS policies needed
*/

-- Add quantity columns for Site sales channels
ALTER TABLE sales_details 
ADD COLUMN IF NOT EXISTS site_recepcao_balcao_quantity integer DEFAULT 0;

ALTER TABLE sales_details 
ADD COLUMN IF NOT EXISTS central_events_quantity integer DEFAULT 0;

ALTER TABLE sales_details 
ADD COLUMN IF NOT EXISTS central_day_use_quantity integer DEFAULT 0;

-- Add quantity columns for Central sales channels
ALTER TABLE sales_details 
ADD COLUMN IF NOT EXISTS central_sales_quantity integer DEFAULT 0;

ALTER TABLE sales_details 
ADD COLUMN IF NOT EXISTS central_packages_quantity integer DEFAULT 0;

-- Update any existing records to have 0 as default value for all quantity fields
UPDATE sales_details 
SET 
  site_recepcao_balcao_quantity = COALESCE(site_recepcao_balcao_quantity, 0),
  central_events_quantity = COALESCE(central_events_quantity, 0),
  central_day_use_quantity = COALESCE(central_day_use_quantity, 0),
  central_sales_quantity = COALESCE(central_sales_quantity, 0),
  central_packages_quantity = COALESCE(central_packages_quantity, 0);

-- Force schema refresh by updating table comment with timestamp
COMMENT ON TABLE sales_details IS 'Sales details with Site and Central quantity tracking - Schema updated at ' || now();

-- Verify all columns exist
DO $$
DECLARE
    missing_columns text[] := ARRAY[]::text[];
BEGIN
    -- Check for all required columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_details' AND column_name = 'site_recepcao_balcao_quantity') THEN
        missing_columns := array_append(missing_columns, 'site_recepcao_balcao_quantity');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_details' AND column_name = 'central_events_quantity') THEN
        missing_columns := array_append(missing_columns, 'central_events_quantity');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_details' AND column_name = 'central_day_use_quantity') THEN
        missing_columns := array_append(missing_columns, 'central_day_use_quantity');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_details' AND column_name = 'central_sales_quantity') THEN
        missing_columns := array_append(missing_columns, 'central_sales_quantity');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_details' AND column_name = 'central_packages_quantity') THEN
        missing_columns := array_append(missing_columns, 'central_packages_quantity');
    END IF;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION 'Missing columns: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE 'All Site and Central quantity columns verified successfully!';
    END IF;
END $$;