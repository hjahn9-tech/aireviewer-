-- CREX AI Reviewer — Supabase 테이블 스키마
-- Supabase 대시보드 > SQL Editor에서 실행하세요

-- 대화 기록
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  scenario_title TEXT,
  grade TEXT CHECK (grade IN ('GO', 'CAUTION', 'PASS'))
);

-- 메시지 기록
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  agents_used JSONB,
  skills_used JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 페르소나 온톨로지
CREATE TABLE persona_ontology (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  persona_id TEXT UNIQUE NOT NULL,
  name TEXT,
  ontology_data JSONB NOT NULL,
  source TEXT DEFAULT 'nemotron-korea',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge Base
CREATE TABLE knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 평가 결과
CREATE TABLE evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  dimension_scores JSONB,
  persona_scores JSONB,
  conflict_pairs JSONB,
  dropout_scenes JSONB,
  overall_grade TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책 (개발 중 비활성화 — 프로덕션 배포 전 반드시 활성화할 것)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_ontology ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- 개발 편의를 위한 임시 공개 정책 (프로덕션에서 제거할 것)
CREATE POLICY "dev_allow_all_conversations" ON conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all_messages" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all_persona" ON persona_ontology FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all_kb" ON knowledge_base FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "dev_allow_all_evaluations" ON evaluations FOR ALL USING (true) WITH CHECK (true);
