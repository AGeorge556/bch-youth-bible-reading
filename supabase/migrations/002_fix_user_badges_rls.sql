-- Allow Server Actions running as an authenticated youth user to insert their own badges.
-- Original policy required is_admin() which blocked Server Actions under youth sessions.
DROP POLICY IF EXISTS "Server inserts badges" ON user_badges;
CREATE POLICY "Users insert own badges" ON user_badges
  FOR INSERT WITH CHECK (user_id = auth.uid());
