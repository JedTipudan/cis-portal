-- Migration: Add term column to reading_assessment and philiri_assessment
-- Run this in your Supabase SQL Editor

ALTER TABLE reading_assessment ADD COLUMN IF NOT EXISTS term TEXT DEFAULT 'Term 1';
ALTER TABLE philiri_assessment ADD COLUMN IF NOT EXISTS term TEXT DEFAULT 'Term 1';
