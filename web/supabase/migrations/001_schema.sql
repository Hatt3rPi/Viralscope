-- Viralscope Schema
-- Run this in Supabase SQL Editor after creating the project

-- Projects table
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  brand_yaml jsonb not null default '{}',
  voice_yaml jsonb not null default '{}',
  audiences_yaml jsonb not null default '{}',
  pillars_yaml jsonb not null default '{}',
  competitors_yaml jsonb not null default '{}',
  platforms_yaml jsonb not null default '{}',
  metrics_yaml jsonb not null default '{}',
  calendar_yaml jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Campaigns table
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  slug text not null,
  period_start date not null,
  period_end date not null,
  platform text not null default 'instagram',
  objectives_json jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Slots table
create table slots (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  slot_number int not null,
  date timestamptz not null,
  format text not null,
  pillar text not null,
  objective text not null,
  intention text not null default 'quality',
  topic text not null,
  status text not null default 'draft'
    check (status in ('draft','brief_review','generating','art_review','simulating','ready','published')),
  current_step text not null default '1-brief'
    check (current_step in ('1-brief','2-content','3-art','4-simulation','5-approved')),
  simulation_md text,
  created_at timestamptz not null default now()
);

-- Briefs table
create table briefs (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references slots(id) on delete cascade,
  brief_yaml jsonb not null default '{}',
  version int not null default 1,
  approved_by text,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

-- Variantes table
create table variantes (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references slots(id) on delete cascade,
  variant_label text not null check (variant_label in ('A','B','C')),
  copy_md text not null default '',
  art_direction_image_json jsonb not null default '{}',
  art_direction_video_json jsonb not null default '{}',
  image_url text,
  video_url text,
  video_prompt_json jsonb,
  simulation_score numeric,
  simulation_detail_json jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

-- Feedback table
create table feedback (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references slots(id) on delete cascade,
  variante_id uuid references variantes(id) on delete set null,
  user_id uuid not null,
  user_email text,
  step text not null check (step in ('brief','content','art','simulation')),
  comment text not null,
  requested_changes_json jsonb,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

-- Generation logs table
create table generation_logs (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references slots(id) on delete cascade,
  step text not null,
  input_json jsonb,
  output_json jsonb,
  model_used text,
  tokens_used int,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table projects enable row level security;
alter table campaigns enable row level security;
alter table slots enable row level security;
alter table briefs enable row level security;
alter table variantes enable row level security;
alter table feedback enable row level security;
alter table generation_logs enable row level security;

-- RLS policies: allow authenticated users full access
create policy "Authenticated users can read projects" on projects for select to authenticated using (true);
create policy "Authenticated users can insert projects" on projects for insert to authenticated with check (true);
create policy "Authenticated users can update projects" on projects for update to authenticated using (true);

create policy "Authenticated users can read campaigns" on campaigns for select to authenticated using (true);
create policy "Authenticated users can insert campaigns" on campaigns for insert to authenticated with check (true);
create policy "Authenticated users can update campaigns" on campaigns for update to authenticated using (true);

create policy "Authenticated users can read slots" on slots for select to authenticated using (true);
create policy "Authenticated users can insert slots" on slots for insert to authenticated with check (true);
create policy "Authenticated users can update slots" on slots for update to authenticated using (true);

create policy "Authenticated users can read briefs" on briefs for select to authenticated using (true);
create policy "Authenticated users can insert briefs" on briefs for insert to authenticated with check (true);
create policy "Authenticated users can update briefs" on briefs for update to authenticated using (true);

create policy "Authenticated users can read variantes" on variantes for select to authenticated using (true);
create policy "Authenticated users can insert variantes" on variantes for insert to authenticated with check (true);
create policy "Authenticated users can update variantes" on variantes for update to authenticated using (true);

create policy "Authenticated users can read feedback" on feedback for select to authenticated using (true);
create policy "Authenticated users can insert feedback" on feedback for insert to authenticated with check (true);
create policy "Authenticated users can update feedback" on feedback for update to authenticated using (true);

create policy "Authenticated users can read generation_logs" on generation_logs for select to authenticated using (true);
create policy "Authenticated users can insert generation_logs" on generation_logs for insert to authenticated with check (true);

-- Storage bucket for images and videos
insert into storage.buckets (id, name, public) values ('media', 'media', true);

create policy "Authenticated users can upload media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media');

create policy "Anyone can read media"
  on storage.objects for select
  using (bucket_id = 'media');
