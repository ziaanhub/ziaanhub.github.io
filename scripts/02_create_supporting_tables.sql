-- Create script_likes table
CREATE TABLE IF NOT EXISTS script_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(script_id, user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS script_likes_script_id_idx ON script_likes(script_id);
CREATE INDEX IF NOT EXISTS script_likes_user_id_idx ON script_likes(user_id);
CREATE INDEX IF NOT EXISTS comments_script_id_idx ON comments(script_id);
CREATE INDEX IF NOT EXISTS comments_author_id_idx ON comments(author_id);

-- Enable RLS
ALTER TABLE script_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for script_likes
CREATE POLICY "Anyone can view script likes"
  ON script_likes FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can create likes"
  ON script_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own likes"
  ON script_likes FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for comments
CREATE POLICY "Anyone can view comments"
  ON comments FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (author_id = auth.uid());
