-- Migration: Create crla_assessment table (flat structure, mirrors philiri_assessment)
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS crla_assessment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_level TEXT NOT NULL,

  -- Overall (sum of all languages)
  overall_low_emerging INT DEFAULT 0,
  overall_high_emerging INT DEFAULT 0,
  overall_developing INT DEFAULT 0,
  overall_transition INT DEFAULT 0,
  overall_grade_level_reader INT DEFAULT 0,

  -- Sinugbuanong Binisaya (Grade 1, Grade 2)
  sb_low_emerging INT DEFAULT 0,
  sb_high_emerging INT DEFAULT 0,
  sb_developing INT DEFAULT 0,
  sb_transition INT DEFAULT 0,
  sb_grade_level_reader INT DEFAULT 0,

  -- Filipino (Grade 2, Grade 3)
  fil_low_emerging INT DEFAULT 0,
  fil_high_emerging INT DEFAULT 0,
  fil_developing INT DEFAULT 0,
  fil_transition INT DEFAULT 0,
  fil_grade_level_reader INT DEFAULT 0,

  -- English (Grade 3)
  eng_low_emerging INT DEFAULT 0,
  eng_high_emerging INT DEFAULT 0,
  eng_developing INT DEFAULT 0,
  eng_transition INT DEFAULT 0,
  eng_grade_level_reader INT DEFAULT 0,

  reading_period TEXT DEFAULT 'BoSy',
  term TEXT DEFAULT 'Term 1',
  school_year TEXT DEFAULT '2024-2025',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE crla_assessment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read crla_assessment" ON crla_assessment FOR SELECT USING (true);
CREATE POLICY "Admin write crla_assessment" ON crla_assessment FOR ALL USING (auth.role() = 'authenticated');
