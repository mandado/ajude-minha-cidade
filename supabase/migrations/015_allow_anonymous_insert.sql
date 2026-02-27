-- Allow anyone (including unauthenticated users) to insert points and needs.
-- Points submitted anonymously will have created_by = null.

DROP POLICY IF EXISTS "Authenticated users can create points" ON points;
CREATE POLICY "Anyone can create points"
  ON points FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Point owners can manage needs" ON needs;
CREATE POLICY "Anyone can insert needs"
  ON needs FOR INSERT WITH CHECK (true);
