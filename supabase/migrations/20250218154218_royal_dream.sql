/*
  # Create crypto data table

  1. New Tables
    - `crypto_data`
      - `id` (uuid, primary key)
      - `planet` (text, unique)
      - `price` (numeric)
      - `market_cap` (numeric)
      - `volume_24h` (numeric)
      - `change_24h` (numeric)
      - `rank` (integer)
      - `updated_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `crypto_data` table
    - Add policy for authenticated users to read all data
    - Add policy for service role to update data
*/

CREATE TABLE IF NOT EXISTS crypto_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  planet text UNIQUE NOT NULL,
  price numeric NOT NULL,
  market_cap numeric NOT NULL,
  volume_24h numeric NOT NULL,
  change_24h numeric NOT NULL,
  rank integer NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE crypto_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read crypto data"
  ON crypto_data
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can update crypto data"
  ON crypto_data
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);