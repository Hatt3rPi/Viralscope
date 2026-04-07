-- Onboarding: add brand research fields to projects
-- Run after 002_panel.sql

-- New columns for the onboarding flow
alter table projects add column if not exists website_url text;
alter table projects add column if not exists instagram_handle text;
alter table projects add column if not exists onboarding_status text not null default 'pending'
  check (onboarding_status in ('pending', 'researching', 'wizard', 'complete'));
alter table projects add column if not exists research_data jsonb not null default '{}';
