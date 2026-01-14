-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Courses policies
DROP POLICY IF EXISTS "Users can view own courses" ON courses;
CREATE POLICY "Users can view own courses" ON courses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create courses" ON courses;
CREATE POLICY "Users can create courses" ON courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own courses" ON courses;
CREATE POLICY "Users can update own courses" ON courses
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own courses" ON courses;
CREATE POLICY "Users can delete own courses" ON courses
  FOR DELETE USING (auth.uid() = user_id);

-- Study packs policies
DROP POLICY IF EXISTS "Users can view own packs" ON study_packs;
CREATE POLICY "Users can view own packs" ON study_packs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create packs" ON study_packs;
CREATE POLICY "Users can create packs" ON study_packs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own packs" ON study_packs;
CREATE POLICY "Users can update own packs" ON study_packs
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own packs" ON study_packs;
CREATE POLICY "Users can delete own packs" ON study_packs
  FOR DELETE USING (auth.uid() = user_id);

-- Documents policies
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create documents" ON documents;
CREATE POLICY "Users can create documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own documents" ON documents;
CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own documents" ON documents;
CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- Document pages policies (access through document ownership)
DROP POLICY IF EXISTS "Users can view own document pages" ON document_pages;
CREATE POLICY "Users can view own document pages" ON document_pages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_pages.document_id
      AND documents.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create document pages" ON document_pages;
CREATE POLICY "Users can create document pages" ON document_pages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_pages.document_id
      AND documents.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own document pages" ON document_pages;
CREATE POLICY "Users can delete own document pages" ON document_pages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_pages.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Chunks policies (access through document ownership)
DROP POLICY IF EXISTS "Users can view own chunks" ON chunks;
CREATE POLICY "Users can view own chunks" ON chunks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = chunks.document_id
      AND documents.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create chunks" ON chunks;
CREATE POLICY "Users can create chunks" ON chunks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = chunks.document_id
      AND documents.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own chunks" ON chunks;
CREATE POLICY "Users can update own chunks" ON chunks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = chunks.document_id
      AND documents.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own chunks" ON chunks;
CREATE POLICY "Users can delete own chunks" ON chunks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = chunks.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Study guides policies (access through pack ownership)
DROP POLICY IF EXISTS "Users can view own guides" ON study_guides;
CREATE POLICY "Users can view own guides" ON study_guides
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM study_packs
      WHERE study_packs.id = study_guides.pack_id
      AND study_packs.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create guides" ON study_guides;
CREATE POLICY "Users can create guides" ON study_guides
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_packs
      WHERE study_packs.id = study_guides.pack_id
      AND study_packs.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own guides" ON study_guides;
CREATE POLICY "Users can update own guides" ON study_guides
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM study_packs
      WHERE study_packs.id = study_guides.pack_id
      AND study_packs.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own guides" ON study_guides;
CREATE POLICY "Users can delete own guides" ON study_guides
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM study_packs
      WHERE study_packs.id = study_guides.pack_id
      AND study_packs.user_id = auth.uid()
    )
  );

-- Cards policies (access through pack ownership)
DROP POLICY IF EXISTS "Users can view own cards" ON cards;
CREATE POLICY "Users can view own cards" ON cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM study_packs
      WHERE study_packs.id = cards.pack_id
      AND study_packs.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create cards" ON cards;
CREATE POLICY "Users can create cards" ON cards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_packs
      WHERE study_packs.id = cards.pack_id
      AND study_packs.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own cards" ON cards;
CREATE POLICY "Users can update own cards" ON cards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM study_packs
      WHERE study_packs.id = cards.pack_id
      AND study_packs.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own cards" ON cards;
CREATE POLICY "Users can delete own cards" ON cards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM study_packs
      WHERE study_packs.id = cards.pack_id
      AND study_packs.user_id = auth.uid()
    )
  );

-- Card feedback policies
DROP POLICY IF EXISTS "Users can view own feedback" ON card_feedback;
CREATE POLICY "Users can view own feedback" ON card_feedback
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create feedback" ON card_feedback;
CREATE POLICY "Users can create feedback" ON card_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Exports policies (access through pack ownership)
DROP POLICY IF EXISTS "Users can view own exports" ON exports;
CREATE POLICY "Users can view own exports" ON exports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM study_packs
      WHERE study_packs.id = exports.pack_id
      AND study_packs.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create exports" ON exports;
CREATE POLICY "Users can create exports" ON exports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_packs
      WHERE study_packs.id = exports.pack_id
      AND study_packs.user_id = auth.uid()
    )
  );

-- Subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create subscriptions" ON subscriptions;
CREATE POLICY "Users can create subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Purchases policies
DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create purchases" ON purchases;
CREATE POLICY "Users can create purchases" ON purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Storage buckets and policies
-- Note: Run these in the Supabase dashboard or via the API

-- Create materials bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', false)
ON CONFLICT (id) DO NOTHING;

-- Create exports bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('exports', 'exports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for materials bucket
DROP POLICY IF EXISTS "Users can upload materials" ON storage.objects;
CREATE POLICY "Users can upload materials" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'materials'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can view own materials" ON storage.objects;
CREATE POLICY "Users can view own materials" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'materials'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own materials" ON storage.objects;
CREATE POLICY "Users can delete own materials" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'materials'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for exports bucket
DROP POLICY IF EXISTS "Users can upload exports" ON storage.objects;
CREATE POLICY "Users can upload exports" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'exports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can view own exports" ON storage.objects;
CREATE POLICY "Users can view own exports" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'exports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own exports" ON storage.objects;
CREATE POLICY "Users can delete own exports" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'exports'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
