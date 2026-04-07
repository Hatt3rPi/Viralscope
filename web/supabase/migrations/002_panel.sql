-- Panel de Evaluacion: agentes persistentes + resultados de evaluacion
-- Run after 001_schema.sql

-- Allow generation_logs without slot_id (panel-seed operates at project level)
alter table generation_logs alter column slot_id drop not null;

-- Panel agents: persistent AI personas per project (from audiences_yaml)
create table panel_agents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  persona_name text not null,
  persona_profile jsonb not null default '{}',
  history jsonb default '[]',
  memory_enabled boolean default true,
  created_at timestamptz not null default now()
);

-- Panel evaluations: stores complete evaluation sessions
create table panel_evaluations (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references slots(id) on delete cascade,
  intention text not null default 'quality',
  agent_results jsonb not null default '[]',
  composite_scores jsonb not null default '{}',
  verdict jsonb not null default '{}',
  total_tokens_used int,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table panel_agents enable row level security;
alter table panel_evaluations enable row level security;

-- RLS policies: panel_agents
create policy "Authenticated users can read panel_agents" on panel_agents for select to authenticated using (true);
create policy "Authenticated users can insert panel_agents" on panel_agents for insert to authenticated with check (true);
create policy "Authenticated users can update panel_agents" on panel_agents for update to authenticated using (true);
create policy "Authenticated users can delete panel_agents" on panel_agents for delete to authenticated using (true);

-- RLS policies: panel_evaluations
create policy "Authenticated users can read panel_evaluations" on panel_evaluations for select to authenticated using (true);
create policy "Authenticated users can insert panel_evaluations" on panel_evaluations for insert to authenticated with check (true);
