-- Allow anyone (including unauthenticated users) to update and delete points and needs.
-- This enables a fully open collaborative model without requiring login.

-- Points: open UPDATE to all
DROP POLICY IF EXISTS "Authenticated users can update points" ON points;
CREATE POLICY "Anyone can update points"
  ON points FOR UPDATE USING (true);

-- Points: open DELETE to all
DROP POLICY IF EXISTS "Authenticated users can delete points" ON points;
CREATE POLICY "Anyone can delete points"
  ON points FOR DELETE USING (true);

-- Needs: open UPDATE to all
DROP POLICY IF EXISTS "Authenticated users can update needs" ON needs;
CREATE POLICY "Anyone can update needs"
  ON needs FOR UPDATE USING (true);

-- Needs: open DELETE to all
DROP POLICY IF EXISTS "Authenticated users can delete needs" ON needs;
CREATE POLICY "Anyone can delete needs"
  ON needs FOR DELETE USING (true);
