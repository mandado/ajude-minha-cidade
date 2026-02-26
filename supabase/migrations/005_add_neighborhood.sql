ALTER TABLE points ADD COLUMN neighborhood TEXT;
CREATE INDEX idx_points_neighborhood ON points (neighborhood);
