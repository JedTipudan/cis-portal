-- Migration: Add term to performance and reading_period to reading/philiri assessments
-- Run this in your Supabase SQL Editor

-- Add term column to performance table
ALTER TABLE performance ADD COLUMN IF NOT EXISTS term TEXT DEFAULT 'Term 1';

-- Add reading_period column to reading_assessment (create table if not exists)
CREATE TABLE IF NOT EXISTS reading_assessment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_level TEXT NOT NULL,
  assessment_type TEXT NOT NULL,
  low_emerging INT DEFAULT 0,
  high_emerging INT DEFAULT 0,
  developing INT DEFAULT 0,
  transition INT DEFAULT 0,
  grade_level_reader INT DEFAULT 0,
  not_proficient INT DEFAULT 0,
  low_proficient INT DEFAULT 0,
  nearly_proficient INT DEFAULT 0,
  proficient INT DEFAULT 0,
  highly_proficient INT DEFAULT 0,
  reading_period TEXT DEFAULT 'BoSy',
  school_year TEXT DEFAULT '2024-2025',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add reading_period column to existing reading_assessment table
ALTER TABLE reading_assessment ADD COLUMN IF NOT EXISTS reading_period TEXT DEFAULT 'BoSy';

-- Create philiri_assessment table if not exists
CREATE TABLE IF NOT EXISTS philiri_assessment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_level TEXT NOT NULL,
  three_levels_down INT DEFAULT 0,
  two_levels_down INT DEFAULT 0,
  grade_ready INT DEFAULT 0,
  tld_fil_frustration INT DEFAULT 0,
  tld_fil_instructional INT DEFAULT 0,
  tld_fil_independent INT DEFAULT 0,
  tld_eng_frustration INT DEFAULT 0,
  tld_eng_instructional INT DEFAULT 0,
  tld_eng_independent INT DEFAULT 0,
  twd_fil_frustration INT DEFAULT 0,
  twd_fil_instructional INT DEFAULT 0,
  twd_fil_independent INT DEFAULT 0,
  twd_eng_frustration INT DEFAULT 0,
  twd_eng_instructional INT DEFAULT 0,
  twd_eng_independent INT DEFAULT 0,
  reading_period TEXT DEFAULT 'BoSy',
  school_year TEXT DEFAULT '2024-2025',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add reading_period column to existing philiri_assessment table
ALTER TABLE philiri_assessment ADD COLUMN IF NOT EXISTS reading_period TEXT DEFAULT 'BoSy';

-- Enable RLS for new tables
ALTER TABLE reading_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE philiri_assessment ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Public read reading_assessment" ON reading_assessment FOR SELECT USING (true);
CREATE POLICY "Admin write reading_assessment" ON reading_assessment FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public read philiri_assessment" ON philiri_assessment FOR SELECT USING (true);
CREATE POLICY "Admin write philiri_assessment" ON philiri_assessment FOR ALL USING (auth.role() = 'authenticated');
