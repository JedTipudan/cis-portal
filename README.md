# CIS Portal — Comprehensive Information System

A **school report dashboard** for **Concepcion Integrated School** (School ID: 502245), Department of Education, Region XI — Davao Region, Division of Davao Oriental. This system consolidates school data into a single, interactive dashboard for monitoring and reporting.

## What This System Does

The CIS Portal provides a centralized platform to:

- **View** a real-time overview of school performance through an interactive dashboard
- **Track** enrollment, attendance, academic performance, and learning assessments
- **Monitor** financial transparency, programs, and school resources
- **Manage** school data with admin-level editing capabilities

## Features

### Dashboard Overview

The main dashboard displays 19 summary cards and charts:

| Module | Description |
|--------|-------------|
| School Profile | Basic school identity — district, division, region, school head, type, location |
| Total Enrollment | Learner count by grade level with Male/Female breakdown |
| Average Daily Attendance | Monthly ADA percentage with present/absent trends |
| Learning Assessment Summary | Gauge charts for CRLA, Phil-IRI, and RMA rates across Key Stages (KS1/KS2/KS3) |
| Enrollment by Grade Level | Bar chart visualization per grade |
| Learner Profile | Pie chart — Male, Female, SPED, IP, Others |
| Key Indicators | 10 KPIs with color-coded status (Enrollment Rate, Promotion Rate, etc.) |
| Learning Performance (MPS) | Mean Percentage Score per grade level with Term selector |
| Learner Mastery Level | Pie chart — per-subject MPS classification (Mastered ≥ 85, Nearing 75–84, Low < 75) with dynamic subject count |
| Teaching & Non-Teaching Personnel | Staff counts by category |
| Facilities & Resources | Classroom and infrastructure counts |
| Programs & Interventions | Program list with status badges |
| Top Issues & Priority Needs | Numbered priority issues |
| Recent Achievements & Highlights | School awards and recognitions |
| Nutritional Status | BMI and Height-for-Age assessment per grade |
| Transparency Board | MOOE utilization, programs, and other funds summary |
| Data Information | Data source and preparation details |

### Performance Management

Three-tab module under **Performance**:

- **Key Performance Indicators (KPI)** — 10 DepEd standard indicators: Enrollment Rate, Participation Rate, Cohort Survival Rate, Completion Rate, Promotion Rate, Graduation Rate, Dropout Rate, Repetition Rate, Retention Rate, Transition Rate
- **Academic Performance** — MPS per subject per grade level with Term filtering (Term 1/2/3) and mastery classification (Mastered ≥ 85, Nearing ≥ 75, Low < 75)
- **Literacy and Numeracy** — Three assessment types with Period filtering (BoSy/MoSY/EoSY):
  - **CRLA** (Classroom Reading Level Assessment) — Grades 1–3
  - **Phil-IRI** (Philippine Informal Reading Inventory) — Grades 4–10, with Filipino/English breakdowns
  - **RMA** (Reading Miscue Analysis) — Grades 1–10

### Other Modules

- **Enrollment** — Grade-level enrollment table + Learner Profile management
- **Attendance** — Monthly tracking with trend chart
- **Nutritional Status** — BMI (Severely Wasted → Obese) and HFA (Severely Stunted → Tall) per grade
- **Personnel** — Teaching and non-teaching staff CRUD
- **Facilities & Resources** — Classrooms, computers, internet, library, water & sanitation
- **Programs & Interventions** — School programs with Ongoing/Completed/Planned status
- **Stakeholders** — Community partners and organizations
- **Reports, Documents & Issuances** — File upload/download with category tagging
- **Transparency Board** — 4 tabs: Overview, MOOE Monthly, Programs Monthly, Other Funds (IGP & Canteen)

## Authentication & Roles

- **Public users** — Can view all dashboard data (read-only)
- **Admin users** — Can view, edit, create, and delete all data
- Admin login at `/login` via Supabase Auth (email/password)
- Admin-only pages: Settings (password management)

## School Year Filtering

- School year selector in the top bar (e.g., SY 2024-2025)
- Data tables with a `school_year` column are filtered by the selected year
- Year-agnostic tables (personnel, facilities, programs) persist across all years
- School year preference is saved in localStorage

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework (App Router, Server Components) |
| **Supabase** | PostgreSQL database + auth + file storage |
| **Tailwind CSS** | Utility-first styling |
| **Recharts** | Interactive charts and data visualization |
| **Lucide React** | Icon library |
| **shadcn/ui** | UI primitives (dialog, badge, button, card, etc.) |
| **Sonner** | Toast notifications |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with the database schema applied

### Setup

1. Clone the repository:

```bash
git clone https://github.com/JedTipudan/cis-portal.git
cd cis-portal
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Database Schema

The system uses 16+ tables. Apply these SQL files in order:

1. `supabase/schema.sql` — Base schema with 13 tables and RLS policies
2. `supabase/migration_add_term_reading_period.sql` — Reading assessment tables
3. `supabase/migration_add_term_to_reading_tables.sql` — Term column additions

## Project Structure

```
src/
├── app/
│   ├── dashboard/          # All dashboard page routes
│   │   ├── enrollment/
│   │   ├── attendance/
│   │   ├── performance/
│   │   ├── nutritional-status/
│   │   ├── personnel/
│   │   ├── facilities/
│   │   ├── programs/
│   │   ├── stakeholders/
│   │   ├── reports/
│   │   ├── transparency/
│   │   ├── school-profile/
│   │   └── settings/
│   └── login/
├── components/
│   ├── admin/              # Admin-specific editable components
│   ├── dashboard/          # Dashboard display components
│   └── layout/             # Sidebar, TopBar, Footer
├── lib/
│   ├── supabase/           # Supabase client setup
│   └── SchoolYearContext.tsx
└── middleware.ts
```
