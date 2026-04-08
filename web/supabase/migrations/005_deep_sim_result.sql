alter table slots
  add column if not exists deep_sim_result jsonb,
  add column if not exists deep_sim_id text;
