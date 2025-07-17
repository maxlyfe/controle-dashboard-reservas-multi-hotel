/*
  # Adicionar campo Recepção/Balcão

  1. Changes
    - Add `site_recepcao_balcao` column to `sales_details` table
    - This field will be summed with `site_reservations` for total site sales

  2. Security
    - No changes to RLS policies needed
*/

-- Add site_recepcao_balcao column to sales_details table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales_details' AND column_name = 'site_recepcao_balcao'
  ) THEN
    ALTER TABLE sales_details ADD COLUMN site_recepcao_balcao numeric DEFAULT 0;
  END IF;
END $$;