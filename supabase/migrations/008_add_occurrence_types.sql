-- Add landslide and burial occurrence types to points
ALTER TABLE points DROP CONSTRAINT IF EXISTS points_type_check;
ALTER TABLE points ADD CONSTRAINT points_type_check
  CHECK (type IN ('shelter', 'collection', 'distribution', 'landslide', 'burial'));
