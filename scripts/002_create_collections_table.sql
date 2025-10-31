-- Create collections table for grouping scripts
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collection-script mapping
CREATE TABLE IF NOT EXISTS public.collection_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, script_id)
);

-- Enable RLS
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_scripts ENABLE ROW LEVEL SECURITY;

-- Collections RLS Policies
CREATE POLICY "collections_select_public" ON public.collections FOR SELECT USING (is_public = true);
CREATE POLICY "collections_select_own" ON public.collections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "collections_insert" ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "collections_update_own" ON public.collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "collections_delete_own" ON public.collections FOR DELETE USING (auth.uid() = user_id);

-- Collection Scripts RLS Policies
CREATE POLICY "collection_scripts_select" ON public.collection_scripts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.collections c
    WHERE c.id = collection_scripts.collection_id
    AND (c.is_public = true OR c.user_id = auth.uid())
  )
);

CREATE POLICY "collection_scripts_insert" ON public.collection_scripts FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.collections c
    WHERE c.id = collection_scripts.collection_id
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "collection_scripts_delete" ON public.collection_scripts FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.collections c
    WHERE c.id = collection_scripts.collection_id
    AND c.user_id = auth.uid()
  )
);
