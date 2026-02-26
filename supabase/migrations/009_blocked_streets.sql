CREATE TABLE blocked_streets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  neighborhood TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state CHAR(2),
  description TEXT NOT NULL DEFAULT '',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  paths JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_blocked_streets_city ON blocked_streets (city);
CREATE INDEX idx_blocked_streets_active ON blocked_streets (is_active);

ALTER TABLE blocked_streets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blocked streets viewable by everyone"
  ON blocked_streets FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create blocked streets"
  ON blocked_streets FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Creators can delete own blocked streets"
  ON blocked_streets FOR DELETE USING (auth.uid() = created_by);
