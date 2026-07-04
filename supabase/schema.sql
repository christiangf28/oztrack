-- Oztrack Database Schema
-- Run in Supabase SQL Editor

-- Enable RLS
create extension if not exists "uuid-ossp";

-- Users profile table (extends auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  medication text not null,
  start_date timestamptz not null default now(),
  goals text not null,
  symptoms text[] default '{}',
  struggles text[] default '{}',  -- onboarding quiz: side_effects | food_noise | consistency | plateaus | motivation | injection_days
  gender text,        -- 'female' | 'male' | 'prefer_not'
  age_range text,     -- '18-25' | '26-35' | '36-45' | '46-55' | '55+'
  created_at timestamptz not null default now()
);

-- Daily symptom + wellness logs
create table public.daily_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  date date not null,
  nausea smallint not null default 3 check (nausea between 1 and 5),
  fatigue smallint not null default 3 check (fatigue between 1 and 5),
  appetite smallint not null default 3 check (appetite between 1 and 5),
  mood smallint not null default 3 check (mood between 1 and 5),
  energy smallint not null default 3 check (energy between 1 and 5),
  weight numeric(6,2),
  water_ml integer not null default 2000,
  meal_notes text,
  bowel_movements smallint,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

-- AI Chat messages
create table public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Subscription status (synced from RevenueCat webhooks)
create table public.subscription_status (
  user_id uuid references public.users on delete cascade primary key,
  rc_customer_id text,
  is_active boolean not null default false,
  plan text check (plan in ('monthly', 'annual')),
  trial_ends_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.daily_logs enable row level security;
alter table public.chat_messages enable row level security;
alter table public.subscription_status enable row level security;

-- RLS Policies
create policy "Users can manage own profile" on public.users
  for all using (auth.uid() = id);

create policy "Users can manage own logs" on public.daily_logs
  for all using (auth.uid() = user_id);

create policy "Users can manage own messages" on public.chat_messages
  for all using (auth.uid() = user_id);

create policy "Users can read own subscription" on public.subscription_status
  for select using (auth.uid() = user_id);

-- Indexes
create index daily_logs_user_date on public.daily_logs(user_id, date desc);
create index chat_messages_user_created on public.chat_messages(user_id, created_at desc);
