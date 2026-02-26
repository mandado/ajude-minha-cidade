-- Allow point owners to update their needs
CREATE POLICY "Point owners can update needs"
  ON needs FOR UPDATE USING (
    EXISTS (SELECT 1 FROM points WHERE points.id = needs.point_id AND points.created_by = auth.uid())
  );

-- Allow point owners to delete their needs
CREATE POLICY "Point owners can delete needs"
  ON needs FOR DELETE USING (
    EXISTS (SELECT 1 FROM points WHERE points.id = needs.point_id AND points.created_by = auth.uid())
  );
