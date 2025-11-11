-- Event Scheduler Database Schema
-- Migration: 0001_init.sql

-- Enable UUID extension (gen_random_uuid is built-in for PostgreSQL 13+)
-- create extension if not exists "uuid-ossp";

-- Events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) <= 200),
  memo text,
  admin_key_hash text not null, -- Argon2 hash of admin key
  share_id text not null unique check (char_length(share_id) >= 8 and char_length(share_id) <= 16),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Options table (candidate dates)
create table if not exists public.options (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  date date not null,
  sort_index int not null default 0,
  created_at timestamptz not null default now(),
  unique(event_id, date)
);

-- Participants table
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  nickname text not null check (char_length(nickname) >= 1 and char_length(nickname) <= 16),
  device_hash text not null check (char_length(device_hash) >= 32),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(event_id, device_hash)
);

-- Votes table
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  option_id uuid not null references public.options(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  value smallint not null check (value in (0, 1, 2)), -- 0=×, 1=△, 2=◯
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(option_id, participant_id)
);

-- Links table (for URL management)
create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  kind text not null check (kind in ('admin', 'share')),
  token text not null,
  unique(event_id, kind)
);

-- Indexes for performance
create index if not exists idx_events_share_id on public.events(share_id);
create index if not exists idx_options_event_id on public.options(event_id);
create index if not exists idx_options_event_date on public.options(event_id, date);
create index if not exists idx_participants_event_id on public.participants(event_id);
create index if not exists idx_participants_event_device on public.participants(event_id, device_hash);
create index if not exists idx_votes_event_id on public.votes(event_id);
create index if not exists idx_votes_option_id on public.votes(option_id);
create index if not exists idx_votes_participant_id on public.votes(participant_id);
create index if not exists idx_votes_event_option_participant on public.votes(event_id, option_id, participant_id);
create index if not exists idx_links_event_id on public.links(event_id);

-- Trigger function for updating updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply triggers to tables with updated_at
create trigger update_events_updated_at
  before update on public.events
  for each row
  execute function public.update_updated_at_column();

create trigger update_participants_updated_at
  before update on public.participants
  for each row
  execute function public.update_updated_at_column();

create trigger update_votes_updated_at
  before update on public.votes
  for each row
  execute function public.update_updated_at_column();

-- Row Level Security (RLS) Policies
alter table public.events enable row level security;
alter table public.options enable row level security;
alter table public.participants enable row level security;
alter table public.votes enable row level security;
alter table public.links enable row level security;

-- Public read access via share_id
-- Note: In production, these policies should be more restrictive
-- and use JWT claims or function-based authentication

-- Events: readable by share_id
create policy "Events are viewable by share_id"
  on public.events for select
  using (true); -- Will be restricted via Edge Functions

-- Options: readable for events
create policy "Options are viewable"
  on public.options for select
  using (true);

-- Participants: readable for events
create policy "Participants are viewable"
  on public.participants for select
  using (true);

-- Votes: readable for events
create policy "Votes are viewable"
  on public.votes for select
  using (true);

-- Links: not directly accessible
create policy "Links are not publicly readable"
  on public.links for select
  using (false);

-- Insert/Update/Delete operations should be done via Edge Functions
-- with service role key, so no insert/update/delete policies for anon role

-- Grant access to anon role for read operations
grant usage on schema public to anon;
grant select on public.events to anon;
grant select on public.options to anon;
grant select on public.participants to anon;
grant select on public.votes to anon;

-- Service role will handle all write operations via Edge Functions

