-- BCH Youth Bible Reading Platform — Initial Schema

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  grade TEXT NOT NULL,
  profile_picture_url TEXT,
  role TEXT NOT NULL DEFAULT 'youth' CHECK (role IN ('youth', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT,
  poster_url TEXT,
  unlock_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(book_id, chapter_number)
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, chapter_id)
);

CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, question_id)
);

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'book',
  badge_type TEXT NOT NULL DEFAULT 'finished_book'
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id),
  awarded_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id, book_id)
);

-- Seed default badge
INSERT INTO badges (name, description, badge_type)
VALUES ('Finished Book', 'Completed all chapters in a book', 'finished_book');

-- ─── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- profiles
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (id = auth.uid() OR is_admin());
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Insert own profile on signup" ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- books (read for all authenticated; write for admins)
CREATE POLICY "Authenticated users read books" ON books FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage books" ON books FOR ALL USING (is_admin());

-- chapters (read: unlocked or admin; write: admin)
CREATE POLICY "Authenticated users read unlocked chapters" ON chapters FOR SELECT
  USING (auth.uid() IS NOT NULL AND (unlock_date <= CURRENT_DATE OR is_admin()));
CREATE POLICY "Admins read all chapters" ON chapters FOR SELECT USING (is_admin());
CREATE POLICY "Admins manage chapters" ON chapters FOR ALL USING (is_admin());

-- questions (read for authenticated; write for admins)
CREATE POLICY "Authenticated read questions" ON questions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage questions" ON questions FOR ALL USING (is_admin());

-- reading_progress
CREATE POLICY "Users manage own progress" ON reading_progress FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins read all progress" ON reading_progress FOR SELECT USING (is_admin());

-- answers
CREATE POLICY "Users manage own answers" ON answers FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins read all answers" ON answers FOR SELECT USING (is_admin());

-- badges (read all; write admin)
CREATE POLICY "All authenticated read badges" ON badges FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage badges" ON badges FOR ALL USING (is_admin());

-- user_badges
CREATE POLICY "Users read own badges" ON user_badges FOR SELECT USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Server inserts badges" ON user_badges FOR INSERT WITH CHECK (is_admin());
