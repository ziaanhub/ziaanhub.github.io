-- Drop existing objects if any (for fresh setup)
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "scripts_select_public" ON public.scripts;
DROP POLICY IF EXISTS "scripts_select_own" ON public.scripts;
DROP POLICY IF EXISTS "scripts_insert" ON public.scripts;
DROP POLICY IF EXISTS "scripts_update_own" ON public.scripts;
DROP POLICY IF EXISTS "scripts_delete_own" ON public.scripts;
DROP POLICY IF EXISTS "script_likes_select" ON public.script_likes;
DROP POLICY IF EXISTS "script_likes_insert" ON public.script_likes;
DROP POLICY IF EXISTS "script_likes_delete" ON public.script_likes;
DROP POLICY IF EXISTS "comments_select" ON public.comments;
DROP POLICY IF EXISTS "comments_insert" ON public.comments;
DROP POLICY IF EXISTS "comments_update_own" ON public.comments;
DROP POLICY IF EXISTS "comments_delete_own" ON public.comments;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  is_developer BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  reputation_points INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scripts table with tags support
CREATE TABLE IF NOT EXISTS public.scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  language TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT TRUE,
  views_count INT DEFAULT 0,
  downloads_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create script likes table
CREATE TABLE IF NOT EXISTS public.script_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(script_id, user_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin roles table
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin permissions table
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role-permission mapping
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.admin_roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.admin_permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Create user admin assignments
CREATE TABLE IF NOT EXISTS public.user_admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.admin_roles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.script_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_admin_roles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Scripts RLS Policies
CREATE POLICY "scripts_select_public" ON public.scripts FOR SELECT USING (is_public = true);
CREATE POLICY "scripts_select_own" ON public.scripts FOR SELECT USING (auth.uid() = author_id);
CREATE POLICY "scripts_insert" ON public.scripts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "scripts_update_own" ON public.scripts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "scripts_delete_own" ON public.scripts FOR DELETE USING (auth.uid() = author_id);

-- Script Likes RLS Policies
CREATE POLICY "script_likes_select" ON public.script_likes FOR SELECT USING (true);
CREATE POLICY "script_likes_insert" ON public.script_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "script_likes_delete" ON public.script_likes FOR DELETE USING (auth.uid() = user_id);

-- Comments RLS Policies
CREATE POLICY "comments_select" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "comments_update_own" ON public.comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "comments_delete_own" ON public.comments FOR DELETE USING (auth.uid() = author_id);

-- Admin policies
CREATE POLICY "admin_roles_select" ON public.admin_roles FOR SELECT USING (true);
CREATE POLICY "admin_permissions_select" ON public.admin_permissions FOR SELECT USING (true);
CREATE POLICY "role_permissions_select" ON public.role_permissions FOR SELECT USING (true);
CREATE POLICY "user_admin_roles_select" ON public.user_admin_roles FOR SELECT USING (true);

-- Insert default permissions
INSERT INTO public.admin_permissions (permission_name, description) VALUES
  ('ban_user', 'Can ban/unban users'),
  ('delete_script', 'Can delete any script'),
  ('create_admin', 'Can create new admin accounts'),
  ('manage_permissions', 'Can manage admin permissions'),
  ('delete_comment', 'Can delete any comment'),
  ('view_analytics', 'Can view platform analytics')
ON CONFLICT (permission_name) DO NOTHING;

-- Insert default roles
INSERT INTO public.admin_roles (role_name, description) VALUES
  ('super_admin', 'Full access to all features'),
  ('moderator', 'Can manage content and users'),
  ('content_manager', 'Can manage scripts and comments')
ON CONFLICT (role_name) DO NOTHING;

-- Assign all permissions to super_admin
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT ar.id, ap.id FROM public.admin_roles ar, public.admin_permissions ap
WHERE ar.role_name = 'super_admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign moderator permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT ar.id, ap.id FROM public.admin_roles ar, public.admin_permissions ap
WHERE ar.role_name = 'moderator' AND ap.permission_name IN ('ban_user', 'delete_script', 'delete_comment')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign content_manager permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT ar.id, ap.id FROM public.admin_roles ar, public.admin_permissions ap
WHERE ar.role_name = 'content_manager' AND ap.permission_name IN ('delete_script', 'delete_comment')
ON CONFLICT (role_id, permission_id) DO NOTHING;
