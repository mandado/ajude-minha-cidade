-- Permite que qualquer usuário autenticado atualize ruas interditadas.
-- Necessário para editar nome, descrição e trecho via UI.
CREATE POLICY "Authenticated users can update blocked streets"
  ON blocked_streets FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
