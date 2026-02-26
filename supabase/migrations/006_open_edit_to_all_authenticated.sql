-- Allow any authenticated user to update points (collaborative/solidarity)
DROP POLICY "Users can update own points" ON points;
CREATE POLICY "Authenticated users can update points"
  ON points FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow any authenticated user to delete points
CREATE POLICY "Authenticated users can delete points"
  ON points FOR DELETE USING (auth.role() = 'authenticated');

-- Allow any authenticated user to manage needs (insert, update, delete)
DROP POLICY "Point owners can manage needs" ON needs;
CREATE POLICY "Authenticated users can insert needs"
  ON needs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY "Point owners can update needs" ON needs;
CREATE POLICY "Authenticated users can update needs"
  ON needs FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY "Point owners can delete needs" ON needs;
CREATE POLICY "Authenticated users can delete needs"
  ON needs FOR DELETE USING (auth.role() = 'authenticated');
