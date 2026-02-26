DROP POLICY "Creators can delete own blocked streets" ON blocked_streets;

CREATE POLICY "Authenticated users can delete blocked streets"
  ON blocked_streets FOR DELETE USING (auth.role() = 'authenticated');
