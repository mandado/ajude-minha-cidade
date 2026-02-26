-- Add latitude/longitude columns for easier client-side access
-- (keeping location GEOGRAPHY column for future spatial queries)
ALTER TABLE points ADD COLUMN latitude DOUBLE PRECISION;
ALTER TABLE points ADD COLUMN longitude DOUBLE PRECISION;

-- Backfill from existing geography column
UPDATE points SET
  latitude = ST_Y(location::geometry),
  longitude = ST_X(location::geometry)
WHERE location IS NOT NULL;

-- Make them NOT NULL after backfill
ALTER TABLE points ALTER COLUMN latitude SET NOT NULL;
ALTER TABLE points ALTER COLUMN longitude SET NOT NULL;

-- Create index for lat/lng queries
CREATE INDEX idx_points_city ON points (city);
