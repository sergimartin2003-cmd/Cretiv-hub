-- ============================================================
-- CretivHub — Supabase Schema
-- Ejecuta este SQL en: supabase.com → SQL Editor → New query
-- ============================================================

-- Profiles (extiende auth.users que crea Supabase automáticamente)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE,
  display_name  TEXT,
  avatar        TEXT NOT NULL DEFAULT 'U',
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'creator', 'admin')),
  verified      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Resources
CREATE TABLE IF NOT EXISTS public.resources (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  category        TEXT NOT NULL,
  thumbnail       TEXT NOT NULL,
  tags            TEXT[] DEFAULT '{}',
  type            TEXT NOT NULL DEFAULT 'free' CHECK (type IN ('free', 'premium')),
  badge           TEXT CHECK (badge IN ('trending', 'new', 'official')),
  download_url    TEXT,
  file_path       TEXT,
  stars           DECIMAL(3,2) NOT NULL DEFAULT 4.5,
  downloads       INTEGER NOT NULL DEFAULT 0,
  saves           INTEGER NOT NULL DEFAULT 0,
  author_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name     TEXT NOT NULL,
  author_avatar   TEXT NOT NULL DEFAULT 'U',
  author_verified BOOLEAN NOT NULL DEFAULT false,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User saves (favoritos)
CREATE TABLE IF NOT EXISTS public.user_saves (
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, resource_id)
);

-- Download logs
CREATE TABLE IF NOT EXISTS public.downloads (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS resources_status_idx    ON public.resources(status);
CREATE INDEX IF NOT EXISTS resources_category_idx  ON public.resources(category);
CREATE INDEX IF NOT EXISTS resources_author_idx    ON public.resources(author_id);
CREATE INDEX IF NOT EXISTS downloads_resource_idx  ON public.downloads(resource_id);
CREATE INDEX IF NOT EXISTS user_saves_user_idx     ON public.user_saves(user_id);

-- ── Row Level Security ────────────────────────────────────
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads  ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_read_all"    ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own"  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- resources: todos ven los aprobados; el autor ve los suyos; admins ven todo
CREATE POLICY "resources_read" ON public.resources FOR SELECT
  USING (status = 'approved' OR auth.uid() = author_id);

CREATE POLICY "resources_insert" ON public.resources FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "resources_update_own" ON public.resources FOR UPDATE
  USING (auth.uid() = author_id);

-- user_saves
CREATE POLICY "saves_select_own" ON public.user_saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saves_insert_own" ON public.user_saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saves_delete_own" ON public.user_saves FOR DELETE USING (auth.uid() = user_id);

-- downloads: cualquiera puede insertar (anon o auth)
CREATE POLICY "downloads_insert" ON public.downloads FOR INSERT WITH CHECK (true);

-- ── Triggers ─────────────────────────────────────────────

-- Auto-crear profile al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    UPPER(LEFT(COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email, 'U'), 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-actualizar updated_at en resources
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS resources_updated_at ON public.resources;
CREATE TRIGGER resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Stored functions ──────────────────────────────────────

-- Incrementar contador de descargas de forma segura
CREATE OR REPLACE FUNCTION public.increment_downloads(resource_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.resources SET downloads = downloads + 1 WHERE id = resource_id;
END;
$$;

-- Toggle favorito (devuelve true si se guardó, false si se borró)
CREATE OR REPLACE FUNCTION public.toggle_save(p_user_id UUID, p_resource_id UUID)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  already_saved BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.user_saves
    WHERE user_id = p_user_id AND resource_id = p_resource_id
  ) INTO already_saved;

  IF already_saved THEN
    DELETE FROM public.user_saves WHERE user_id = p_user_id AND resource_id = p_resource_id;
    UPDATE public.resources SET saves = GREATEST(saves - 1, 0) WHERE id = p_resource_id;
    RETURN false;
  ELSE
    INSERT INTO public.user_saves (user_id, resource_id) VALUES (p_user_id, p_resource_id);
    UPDATE public.resources SET saves = saves + 1 WHERE id = p_resource_id;
    RETURN true;
  END IF;
END;
$$;

-- ── Storage bucket (ejecutar desde Dashboard → Storage) ──
-- Crear bucket "resources" con límite 100 MB, público para descargas aprobadas
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('resources', 'resources', false, 104857600, ARRAY['application/zip', 'application/x-zip-compressed']);
