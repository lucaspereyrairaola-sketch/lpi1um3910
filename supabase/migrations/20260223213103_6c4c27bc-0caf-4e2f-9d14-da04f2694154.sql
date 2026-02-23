
-- 1. Role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('reader', 'journalist', 'admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 2. Reader profile
CREATE TABLE public.reader_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  topics TEXT[] DEFAULT '{}',
  frequency TEXT NOT NULL DEFAULT 'morning',
  depth TEXT NOT NULL DEFAULT 'summary',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Journalist profile
CREATE TABLE public.journalist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  bio TEXT DEFAULT '',
  specialization TEXT DEFAULT '',
  total_earnings NUMERIC(10,2) DEFAULT 0,
  total_reads INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Followed journalists
CREATE TABLE public.followed_journalists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journalist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(reader_id, journalist_id)
);

-- 5. Articles
CREATE TYPE public.article_access AS ENUM ('free', 'micropay', 'premium');

CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journalist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  access_level article_access NOT NULL DEFAULT 'free',
  price NUMERIC(10,2) DEFAULT 0,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Reading sessions
CREATE TABLE public.reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  seconds_read INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Micropayments
CREATE TYPE public.payment_type AS ENUM ('unlock', 'tip');

CREATE TABLE public.micropayments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  journalist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  type payment_type NOT NULL DEFAULT 'tip',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Forum posts
CREATE TABLE public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========== HELPER FUNCTIONS ==========

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_journalist(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'journalist')
$$;

CREATE OR REPLACE FUNCTION public.is_reader(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'reader')
$$;

-- ========== TRIGGERS ==========

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_reader_profiles_updated_at BEFORE UPDATE ON public.reader_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_journalist_profiles_updated_at BEFORE UPDATE ON public.journalist_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== RLS ==========

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reader_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journalist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followed_journalists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micropayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can view, owner can update
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User roles: own roles visible
CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "roles_insert_self" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reader profiles
CREATE POLICY "reader_select_own" ON public.reader_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reader_insert_own" ON public.reader_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reader_update_own" ON public.reader_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Journalist profiles: public read, owner update
CREATE POLICY "journalist_select" ON public.journalist_profiles FOR SELECT USING (true);
CREATE POLICY "journalist_insert_own" ON public.journalist_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journalist_update_own" ON public.journalist_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Followed journalists
CREATE POLICY "follows_select_own" ON public.followed_journalists FOR SELECT USING (auth.uid() = reader_id);
CREATE POLICY "follows_insert_own" ON public.followed_journalists FOR INSERT WITH CHECK (auth.uid() = reader_id);
CREATE POLICY "follows_delete_own" ON public.followed_journalists FOR DELETE USING (auth.uid() = reader_id);

-- Articles: free visible to all, micropay/premium need future access check; journalists CRUD own
CREATE POLICY "articles_select_published" ON public.articles FOR SELECT USING (published = true);
CREATE POLICY "articles_select_own" ON public.articles FOR SELECT USING (auth.uid() = journalist_id);
CREATE POLICY "articles_insert_journalist" ON public.articles FOR INSERT WITH CHECK (public.is_journalist(auth.uid()) AND auth.uid() = journalist_id);
CREATE POLICY "articles_update_own" ON public.articles FOR UPDATE USING (auth.uid() = journalist_id);
CREATE POLICY "articles_delete_own" ON public.articles FOR DELETE USING (auth.uid() = journalist_id);

-- Reading sessions
CREATE POLICY "sessions_insert_own" ON public.reading_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sessions_select_own" ON public.reading_sessions FOR SELECT USING (auth.uid() = user_id);

-- Micropayments
CREATE POLICY "micropayments_insert_own" ON public.micropayments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "micropayments_select_own" ON public.micropayments FOR SELECT USING (auth.uid() = user_id OR auth.uid() = journalist_id);

-- Forum posts: public read, auth insert, owner update/delete
CREATE POLICY "forum_select" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "forum_insert_auth" ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "forum_update_own" ON public.forum_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "forum_delete_own" ON public.forum_posts FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_articles_journalist ON public.articles(journalist_id);
CREATE INDEX idx_articles_published ON public.articles(published, published_at DESC);
CREATE INDEX idx_reading_sessions_user ON public.reading_sessions(user_id);
CREATE INDEX idx_reading_sessions_article ON public.reading_sessions(article_id);
CREATE INDEX idx_micropayments_journalist ON public.micropayments(journalist_id);
CREATE INDEX idx_forum_posts_article ON public.forum_posts(article_id);
