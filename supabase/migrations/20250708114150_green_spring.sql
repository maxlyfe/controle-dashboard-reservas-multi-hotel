/*
  # Add OTA quantity fields

  1. Changes
    - Add quantity fields for each OTA channel to track number of reservations
    - Add new OTA channels: Planisfério, Expedia, Itaparica
    - Reorder existing channels to match new requirements

  2. New Columns
    - booking_quantity: Number of Booking reservations
    - decolar_quantity: Number of Decolar reservations  
    - hotelbeds_quantity: Number of HotelBeds reservations
    - tourmerd_quantity: Number of Tourmerd reservations
    - keytel_quantity: Number of Keytel reservations
    - planisferio_sales: Sales from Planisfério
    - planisferio_quantity: Number of Planisfério reservations
    - expedia_quantity: Number of Expedia reservations
    - itaparica_sales: Sales from Itaparica
    - itaparica_quantity: Number of Itaparica reservations
    - other_ota_quantity: Number of other OTA reservations

  3. Security
    - No changes to RLS policies needed
*/

-- Add quantity fields for existing OTA channels
ALTER TABLE sales_details 
ADD COLUMN IF NOT EXISTS booking_quantity integer DEFAULT 0;

ALTER TABLE sales_details 
ADD COLUMN IF NOT EXISTS decolar_quantity integer DEFAULT 0;

ALTER TABLE sales_details 
ADD COLUMN IF NOT EXISTS hotelbeds_quantity integer DEFAULT 0;

ALTER TABLE sales_details 
ADD COLUMN IF NOT EXISTS tourmerd_quantity integer DEFAULT 0;

ALTER TABLE sales_details 
ADD COLUMN IF NOT EXISTS keytel_quantity integer DEFAULT 0;

ALTER TABLE sales_details 
ADD COLUMN IF NOT EXISTS expedia_quantity integer DEFAULT 0;

ALTER TABLE sales_details 
ADD COLUMN IF NOT EXISTS other_ota_quantity integer DEFAULT 0;

-- Add new OTA channels
ALTER TABLE sales_details 
ADD COLUMN IF NOT EXISTS planisferio_sales numeric DEFAULT 0;

ALTER TABLE sales_details 
ADD COLUMN IF NOT EXISTS planisferio_quantity integer DEFAULT 0;

ALTER TABLE sales_details 
ADD COLUMN IF NOT EXISTS itaparica_sales numeric DEFAULT 0;

ALTER TABLE sales_details 
ADD COLUMN IF NOT EXISTS itaparica_quantity integer DEFAULT 0;

-- Update any existing records to have 0 as default value
UPDATE sales_details 
SET booking_quantity = 0 
WHERE booking_quantity IS NULL;

UPDATE sales_details 
SET decolar_quantity = 0 
WHERE decolar_quantity IS NULL;

UPDATE sales_details 
SET hotelbeds_quantity = 0 
WHERE hotelbeds_quantity IS NULL;

UPDATE sales_details 
SET tourmerd_quantity = 0 
WHERE tourmerd_quantity IS NULL;

UPDATE sales_details 
SET keytel_quantity = 0 
WHERE keytel_quantity IS NULL;

UPDATE sales_details 
SET expedia_quantity = 0 
WHERE expedia_quantity IS NULL;

UPDATE sales_details 
SET other_ota_quantity = 0 
WHERE other_ota_quantity IS NULL;

UPDATE sales_details 
SET planisferio_sales = 0 
WHERE planisferio_sales IS NULL;

UPDATE sales_details 
SET planisferio_quantity = 0 
WHERE planisferio_quantity IS NULL;

UPDATE sales_details 
SET itaparica_sales = 0 
WHERE itaparica_sales IS NULL;

UPDATE sales_details 
SET itaparica_quantity = 0 
WHERE itaparica_quantity IS NULL;