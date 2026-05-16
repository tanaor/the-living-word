create table public.daily_verses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  verse_reference text not null,
  verse_text text not null,
  reflection text not null,
  date date not null default current_date,
  created_at timestamptz default now(),
  unique (user_id, date)
);

alter table public.daily_verses enable row level security;
create policy "Users can read own verses" on public.daily_verses
  for select using (auth.uid() = user_id);
create policy "Users can insert own verses" on public.daily_verses
  for insert with check (auth.uid() = user_id);
