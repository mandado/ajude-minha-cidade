-- Community moderation: reports and confirmations

-- Table: point_reports
CREATE TABLE point_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  point_id uuid NOT NULL REFERENCES points(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(point_id, user_id)
);

-- Table: point_confirmations
CREATE TABLE point_confirmations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  point_id uuid NOT NULL REFERENCES points(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(point_id, user_id)
);

-- RLS for point_reports
ALTER TABLE point_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reports"
  ON point_reports FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert reports"
  ON point_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS for point_confirmations
ALTER TABLE point_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read confirmations"
  ON point_confirmations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert confirmations"
  ON point_confirmations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Trigger: auto-deactivate point when it reaches 3 reports
CREATE OR REPLACE FUNCTION auto_deactivate_reported_point()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT count(*) FROM point_reports WHERE point_id = NEW.point_id) >= 3 THEN
    UPDATE points SET status = 'inactive' WHERE id = NEW.point_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_auto_deactivate_reported_point
  AFTER INSERT ON point_reports
  FOR EACH ROW
  EXECUTE FUNCTION auto_deactivate_reported_point();
