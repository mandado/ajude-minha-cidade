-- Tabela de feedback dos usuários para melhorias do app
CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('suggestion', 'bug', 'praise', 'other')),
  message TEXT NOT NULL CHECK (char_length(message) >= 10 AND char_length(message) <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode enviar feedback (incluindo anônimos)
CREATE POLICY "Anyone can insert feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);

-- Usuários podem ver apenas o próprio feedback
CREATE POLICY "Users can read own feedback"
  ON feedback FOR SELECT
  USING (user_id = auth.uid());
