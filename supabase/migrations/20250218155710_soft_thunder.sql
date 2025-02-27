/*
  # Update crypto data table and policies

  1. Table Structure
    - `crypto_data` table with price and market data
    - Timestamps for data freshness tracking
    
  2. Security
    - Enable RLS
    - Public read access
    - Allow anonymous writes for data updates
    - Maintain data integrity with constraints
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

-- Enable RLS
ALTER TABLE crypto_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can read crypto data" ON crypto_data;
DROP POLICY IF EXISTS "Service role can update crypto data" ON crypto_data;
DROP POLICY IF EXISTS "Anonymous users can update crypto data" ON crypto_data;

-- Create new policies
CREATE POLICY "Anyone can read crypto data"
  ON crypto_data
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anonymous users can update crypto data"
  ON crypto_data
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anonymous users can modify crypto data"
  ON crypto_data
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Add trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_crypto_data_updated_at
    BEFORE UPDATE ON crypto_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();