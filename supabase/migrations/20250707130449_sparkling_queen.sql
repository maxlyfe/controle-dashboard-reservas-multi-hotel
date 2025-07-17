/*
  # Add missing site_recepcao_balcao column

  1. Changes
    - Add `site_recepcao_balcao` column to `sales_details` table with default value 0
    - This field represents sales from reception/front desk and will be summed with `site_reservations` for total site sales

  2. Security
    - No changes to RLS policies needed as this is just adding a column to existing table
*/

-- Add site_recepcao_balcao column to sales_details table
ALTER TABLE sales_details 
ADD COLUMN IF NOT EXISTS site_recepcao_balcao numeric DEFAULT 0;

-- Update any existing records to have 0 as default value (in case column exists but has NULL values)
UPDATE sales_details 
SET site_recepcao_balcao = 0 
WHERE site_recepcao_balcao IS NULL;