-- Remove restrição de autenticação para deletar e atualizar ruas interditadas.
-- Qualquer usuário (inclusive anônimo) pode gerenciar ruas fechadas.

DROP POLICY IF EXISTS "Authenticated users can delete blocked streets" ON blocked_streets;
CREATE POLICY "Anyone can delete blocked streets"
  ON blocked_streets FOR DELETE USING (true);

DROP POLICY IF EXISTS "Authenticated users can update blocked streets" ON blocked_streets;
CREATE POLICY "Anyone can update blocked streets"
  ON blocked_streets FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can create blocked streets" ON blocked_streets;
CREATE POLICY "Anyone can create blocked streets"
  ON blocked_streets FOR INSERT WITH CHECK (true);
