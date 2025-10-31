-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create scripts table
CREATE TABLE IF NOT EXISTS scripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  code TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'javascript',
  is_public BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS scripts_author_id_idx ON scripts(author_id);
CREATE INDEX IF NOT EXISTS scripts_is_public_idx ON scripts(is_public);
CREATE INDEX IF NOT EXISTS scripts_created_at_idx ON scripts(created_at DESC);

-- Enable RLS
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scripts
CREATE POLICY "Anyone can view public scripts"
  ON scripts FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Users can view their own scripts"
  ON scripts FOR SELECT
  USING (author_id = auth.uid());

CREATE POLICY "Users can create scripts"
  ON scripts FOR INSERT
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update their own scripts"
  ON scripts FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete their own scripts"
  ON scripts FOR DELETE
  USING (author_id = auth.uid());

-- RLS Policies for profiles
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
