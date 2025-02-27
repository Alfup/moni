/*
  # Add rate limiting and request tracking

  1. Changes
    - Add request tracking table
    - Add rate limiting functions
    - Add request tracking functions
    - Add automatic cleanup
    - Add performance indexes

  2. Security
    - Enable RLS on request tracking
    - Add rate limiting policies
*/

-- Create request tracking table
CREATE TABLE IF NOT EXISTS request_tracking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address text NOT NULL,
    request_time timestamptz NOT NULL DEFAULT now(),
    endpoint text NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_request_tracking_ip_time 
ON request_tracking(ip_address, request_time);

CREATE INDEX IF NOT EXISTS idx_request_tracking_cleanup 
ON request_tracking(request_time);

-- Enable RLS
ALTER TABLE request_tracking ENABLE ROW LEVEL SECURITY;

-- Create rate limiting function
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_ip_address text,
    p_max_requests integer,
    p_window_seconds integer
) RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
    request_count integer;
BEGIN
    -- Count requests within time window
    SELECT COUNT(*)
    INTO request_count
    FROM request_tracking
    WHERE ip_address = p_ip_address
    AND request_time > now() - (p_window_seconds || ' seconds')::interval;

    -- Insert new request tracking record
    INSERT INTO request_tracking (ip_address, endpoint)
    VALUES (p_ip_address, current_setting('request.path', true));

    -- Clean up old records
    DELETE FROM request_tracking
    WHERE request_time < now() - interval '1 day';

    -- Return true if under limit, false if exceeded
    RETURN request_count < p_max_requests;
END;
$$;

-- Add rate limiting policies
CREATE POLICY "Track requests"
ON request_tracking
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Service can manage request tracking"
ON request_tracking
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add rate limiting to crypto_data table
CREATE POLICY "Rate limited read access"
ON crypto_data
FOR SELECT
TO anon
USING (
    check_rate_limit(
        current_setting('request.header.x-real-ip', true),
        100, -- Max 100 requests
        60   -- Per minute
    )
);

-- Add index for crypto_data queries
CREATE INDEX IF NOT EXISTS idx_crypto_data_planet 
ON crypto_data(planet);

CREATE INDEX IF NOT EXISTS idx_crypto_data_updated_at 
ON crypto_data(updated_at);