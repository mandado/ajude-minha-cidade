-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Points table (donation/shelter/collection locations)
-- Using TEXT + CHECK instead of ENUMs for easier future modifications
CREATE TABLE points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('shelter', 'collection', 'distribution')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  location GEOGRAPHY(Point, 4326) NOT NULL,
  address TEXT,
  city TEXT,
  state CHAR(2),
  phone TEXT,
  operating_hours TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Needs table (what each point needs or offers)
CREATE TABLE needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  point_id UUID NOT NULL REFERENCES points(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER,
  unit TEXT,
  is_fulfilled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Moderation log
CREATE TABLE moderation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  point_id UUID NOT NULL REFERENCES points(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('approve', 'reject', 'flag', 'remove')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_points_location ON points USING GIST (location);
CREATE INDEX idx_points_type ON points (type);
CREATE INDEX idx_points_status ON points (status);
CREATE INDEX idx_points_priority ON points (priority);
CREATE INDEX idx_needs_point_id ON needs (point_id);
CREATE INDEX idx_moderation_point_id ON moderation_log (point_id);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE points ENABLE ROW LEVEL SECURITY;
ALTER TABLE needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_log ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Points: anyone can read active, authenticated can create
CREATE POLICY "Active points are viewable by everyone"
  ON points FOR SELECT USING (status = 'active');

CREATE POLICY "Authenticated users can create points"
  ON points FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own points"
  ON points FOR UPDATE USING (auth.uid() = created_by);

-- Needs: anyone can read, point owners can manage
CREATE POLICY "Needs are viewable by everyone"
  ON needs FOR SELECT USING (true);

CREATE POLICY "Point owners can manage needs"
  ON needs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM points WHERE points.id = needs.point_id AND points.created_by = auth.uid())
  );

-- Moderation: only moderators (future role check)
CREATE POLICY "Moderation log viewable by moderators"
  ON moderation_log FOR SELECT USING (auth.role() = 'authenticated');
