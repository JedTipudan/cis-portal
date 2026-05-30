-- CIS Portal Database Schema
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS school_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL DEFAULT 'Integrated National High School',
  school_id TEXT DEFAULT '108912',
  district TEXT DEFAULT 'Davao Oriental East District',
  division TEXT DEFAULT 'Division of Davao Oriental',
  region TEXT DEFAULT 'Region XI - Davao Region',
  school_head TEXT DEFAULT 'Juan Dela Cruz',
  school_type TEXT DEFAULT 'Integrated (K to 12)',
  location TEXT DEFAULT 'Brgy. Sample, Davao Oriental',
  school_year TEXT DEFAULT '2024-2025',
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enrollment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_level TEXT NOT NULL,
  male INT DEFAULT 0,
  female INT DEFAULT 0,
  school_year TEXT DEFAULT '2024-2025',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month TEXT NOT NULL,
  present INT DEFAULT 0,
  absent INT DEFAULT 0,
  school_year TEXT DEFAULT '2024-2025',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_level TEXT NOT NULL DEFAULT 'All',
  subject TEXT NOT NULL,
  mps NUMERIC(5,2) DEFAULT 0,
  school_year TEXT DEFAULT '2024-2025',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kpi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator TEXT NOT NULL,
  value NUMERIC(6,2) DEFAULT 0,
  school_year TEXT DEFAULT '2024-2025',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS personnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  count INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'Ongoing',
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  organization TEXT,
  contact TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Report',
  file_url TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transparency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  year TEXT DEFAULT '2024',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS priority_needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  priority INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data
INSERT INTO school_profile (school_name, school_id, district, division, region, school_head, school_type, location, school_year)
VALUES ('Integrated National High School', '108912', 'Davao Oriental East District', 'Division of Davao Oriental', 'Region XI - Davao Region', 'Juan Dela Cruz', 'Integrated (K to 12)', 'Brgy. Sample, Davao Oriental', '2024-2025');

INSERT INTO enrollment (grade_level, male, female, school_year) VALUES
('Kinder', 42, 43, '2024-2025'), ('Grade 1', 46, 46, '2024-2025'), ('Grade 2', 49, 49, '2024-2025'),
('Grade 3', 50, 51, '2024-2025'), ('Grade 4', 52, 53, '2024-2025'), ('Grade 5', 55, 55, '2024-2025'),
('Grade 6', 54, 54, '2024-2025'), ('Grade 7', 52, 52, '2024-2025'), ('Grade 8', 53, 54, '2024-2025'),
('Grade 9', 50, 51, '2024-2025'), ('Grade 10', 48, 48, '2024-2025'), ('Grade 11', 37, 38, '2024-2025'),
('Grade 12', 32, 33, '2024-2025');

INSERT INTO performance (grade_level, subject, mps, school_year) VALUES
-- Grade 1
('Grade 1', 'Language', 82.0, '2024-2025'),
('Grade 1', 'Reading and Literacy', 80.5, '2024-2025'),
('Grade 1', 'Mathematics', 78.0, '2024-2025'),
('Grade 1', 'GMRC', 88.0, '2024-2025'),
('Grade 1', 'Makabansa', 84.0, '2024-2025'),
-- Grade 2
('Grade 2', 'Filipino', 83.0, '2024-2025'),
('Grade 2', 'English', 81.5, '2024-2025'),
('Grade 2', 'Mathematics', 79.0, '2024-2025'),
('Grade 2', 'GMRC', 87.5, '2024-2025'),
('Grade 2', 'Makabansa', 85.0, '2024-2025'),
-- Grade 3
('Grade 3', 'Filipino', 82.5, '2024-2025'),
('Grade 3', 'English', 80.0, '2024-2025'),
('Grade 3', 'Mathematics', 77.5, '2024-2025'),
('Grade 3', 'GMRC', 86.0, '2024-2025'),
('Grade 3', 'Makabansa', 83.5, '2024-2025'),
('Grade 3', 'Science', 81.0, '2024-2025'),
-- Grade 4
('Grade 4', 'Filipino', 82.0, '2024-2025'),
('Grade 4', 'English', 80.5, '2024-2025'),
('Grade 4', 'Mathematics', 76.0, '2024-2025'),
('Grade 4', 'Science', 79.5, '2024-2025'),
('Grade 4', 'Araling Panlipunan', 81.0, '2024-2025'),
('Grade 4', 'Values Education', 86.5, '2024-2025'),
('Grade 4', 'MAPEH', 87.0, '2024-2025'),
('Grade 4', 'EPP', 84.0, '2024-2025'),
-- Grade 5
('Grade 5', 'Filipino', 83.0, '2024-2025'),
('Grade 5', 'English', 81.0, '2024-2025'),
('Grade 5', 'Mathematics', 77.0, '2024-2025'),
('Grade 5', 'Science', 80.0, '2024-2025'),
('Grade 5', 'Araling Panlipunan', 82.0, '2024-2025'),
('Grade 5', 'Values Education', 87.0, '2024-2025'),
('Grade 5', 'MAPEH', 88.0, '2024-2025'),
('Grade 5', 'EPP', 84.5, '2024-2025'),
-- Grade 6
('Grade 6', 'Filipino', 83.5, '2024-2025'),
('Grade 6', 'English', 82.0, '2024-2025'),
('Grade 6', 'Mathematics', 78.0, '2024-2025'),
('Grade 6', 'Science', 81.0, '2024-2025'),
('Grade 6', 'Araling Panlipunan', 82.5, '2024-2025'),
('Grade 6', 'Values Education', 87.5, '2024-2025'),
('Grade 6', 'MAPEH', 88.5, '2024-2025'),
('Grade 6', 'EPP', 85.0, '2024-2025'),
-- Grade 7
('Grade 7', 'Filipino', 82.0, '2024-2025'),
('Grade 7', 'English', 80.0, '2024-2025'),
('Grade 7', 'Mathematics', 75.5, '2024-2025'),
('Grade 7', 'Science', 79.0, '2024-2025'),
('Grade 7', 'Araling Panlipunan', 81.0, '2024-2025'),
('Grade 7', 'Values Education', 86.0, '2024-2025'),
('Grade 7', 'MAPEH', 87.0, '2024-2025'),
('Grade 7', 'TLE', 83.5, '2024-2025'),
-- Grade 8
('Grade 8', 'Filipino', 82.5, '2024-2025'),
('Grade 8', 'English', 80.5, '2024-2025'),
('Grade 8', 'Mathematics', 76.0, '2024-2025'),
('Grade 8', 'Science', 79.5, '2024-2025'),
('Grade 8', 'Araling Panlipunan', 81.5, '2024-2025'),
('Grade 8', 'Values Education', 86.5, '2024-2025'),
('Grade 8', 'MAPEH', 87.5, '2024-2025'),
('Grade 8', 'TLE', 84.0, '2024-2025'),
-- Grade 9
('Grade 9', 'Filipino', 83.0, '2024-2025'),
('Grade 9', 'English', 81.0, '2024-2025'),
('Grade 9', 'Mathematics', 76.5, '2024-2025'),
('Grade 9', 'Science', 80.0, '2024-2025'),
('Grade 9', 'Araling Panlipunan', 82.0, '2024-2025'),
('Grade 9', 'Values Education', 87.0, '2024-2025'),
('Grade 9', 'MAPEH', 88.0, '2024-2025'),
('Grade 9', 'TLE', 84.5, '2024-2025'),
-- Grade 10
('Grade 10', 'Filipino', 83.5, '2024-2025'),
('Grade 10', 'English', 81.5, '2024-2025'),
('Grade 10', 'Mathematics', 77.0, '2024-2025'),
('Grade 10', 'Science', 80.5, '2024-2025'),
('Grade 10', 'Araling Panlipunan', 82.5, '2024-2025'),
('Grade 10', 'Values Education', 87.5, '2024-2025'),
('Grade 10', 'MAPEH', 88.5, '2024-2025'),
('Grade 10', 'TLE', 85.0, '2024-2025');

INSERT INTO kpi (indicator, value, school_year) VALUES
('Enrollment Rate', 95.2, '2024-2025'),
('Participation Rate', 93.8, '2024-2025'),
('Cohort Survival Rate', 88.5, '2024-2025'),
('Completion Rate', 96.8, '2024-2025'),
('Promotion Rate', 94.3, '2024-2025'),
('Graduation Rate', 92.1, '2024-2025'),
('Dropout/School Leaver Rate', 1.2, '2024-2025'),
('Repetition Rate', 2.5, '2024-2025'),
('Retention Rate', 97.5, '2024-2025'),
('Transition Rate', 89.4, '2024-2025');

INSERT INTO personnel (category, count) VALUES
('Total Teachers', 58), ('Teacher-Learner Ratio', 21), ('Non-Teaching Staff', 15),
('Master Teachers', 6), ('Teacher Items (Filled)', 52), ('Vacant Items', 2);

INSERT INTO facilities (name, value) VALUES
('Classrooms (Total)', '28'), ('Classrooms (Usable)', '26'), ('Classrooms (Needs Repair)', '2'),
('Classrooms (Condemned)', '0'), ('Computer Units', '35'), ('Internet Availability', 'Yes'),
('Library', 'Yes'), ('Water & Sanitation', 'Functional');

INSERT INTO programs (name, status) VALUES
('MATATAG Curriculum Implementation', 'Ongoing'), ('Reading Program (SRA)', 'Ongoing'),
('Numeracy Program', 'Ongoing'), ('Supplemental Feeding Program', 'Ongoing'),
('Learner Recovery Program', 'Ongoing'), ('Brigada Eskwela', 'Completed');

INSERT INTO transparency (category, label, value) VALUES
('MOOE Utilization', 'Allocated', '₱1,500,000.00'), ('MOOE Utilization', 'Utilized', '₱1,125,450.75'),
('MOOE Utilization', 'Balance', '₱374,549.25'), ('Programs & Projects', 'Implemented Projects', '8'),
('Programs & Projects', 'Ongoing Projects', '5'), ('Programs & Projects', 'Completed Projects', '3'),
('Procurement Summary', 'Purchase Requests', '12'), ('Procurement Summary', 'Items Procured', '28'),
('Procurement Summary', 'On-going Procurements', '4');

INSERT INTO achievements (title, year) VALUES
('Top Performing School in District RLN Quiz Bee 2024', '2024'),
('Division Winner – Science Fair 2024', '2024'),
('100% Passing Rate in National Achievement Test (Grade 12)', '2024');

INSERT INTO priority_needs (description, priority) VALUES
('Lack of additional classrooms', 1), ('Need for more learning resources', 2),
('Improvement of internet connectivity', 3);

INSERT INTO attendance (month, present, absent, school_year) VALUES
('June', 1100, 80, '2024-2025'), ('July', 1120, 70, '2024-2025'), ('August', 1130, 65, '2024-2025'),
('September', 1140, 60, '2024-2025'), ('October', 1150, 55, '2024-2025'), ('November', 1154, 93, '2024-2025');

INSERT INTO stakeholders (name, role, organization) VALUES
('Maria Santos', 'PTA President', 'Parent-Teacher Association'),
('Pedro Reyes', 'Barangay Captain', 'Local Government Unit'),
('Ana Cruz', 'Alumni President', 'Alumni Association'),
('Jose Lim', 'School Board Member', 'Division School Board');

-- RLS
ALTER TABLE school_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE transparency ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_needs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read school_profile" ON school_profile FOR SELECT USING (true);
CREATE POLICY "Public read enrollment" ON enrollment FOR SELECT USING (true);
CREATE POLICY "Public read attendance" ON attendance FOR SELECT USING (true);
CREATE POLICY "Public read performance" ON performance FOR SELECT USING (true);
CREATE POLICY "Public read kpi" ON kpi FOR SELECT USING (true);
CREATE POLICY "Public read personnel" ON personnel FOR SELECT USING (true);
CREATE POLICY "Public read facilities" ON facilities FOR SELECT USING (true);
CREATE POLICY "Public read programs" ON programs FOR SELECT USING (true);
CREATE POLICY "Public read stakeholders" ON stakeholders FOR SELECT USING (true);
CREATE POLICY "Public read documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Public read transparency" ON transparency FOR SELECT USING (true);
CREATE POLICY "Public read achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Public read priority_needs" ON priority_needs FOR SELECT USING (true);

CREATE POLICY "Admin write school_profile" ON school_profile FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write enrollment" ON enrollment FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write attendance" ON attendance FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write performance" ON performance FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write kpi" ON kpi FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write personnel" ON personnel FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write facilities" ON facilities FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write programs" ON programs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write stakeholders" ON stakeholders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write documents" ON documents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write transparency" ON transparency FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write achievements" ON achievements FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write priority_needs" ON priority_needs FOR ALL USING (auth.role() = 'authenticated');
