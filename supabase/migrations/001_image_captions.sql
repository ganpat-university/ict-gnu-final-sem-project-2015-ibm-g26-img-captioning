-- Enable RLS
alter table if exists public.generations enable row level security;
alter table if exists public.user_statistics enable row level security;

-- User Statistics Table
create table if not exists public.user_statistics (
    user_id uuid references auth.users(id) primary key,
    total_generations int default 0,
    tokens_used int default 0,
    tokens_remaining int default 100,  -- Free tier starts with 100 tokens
    account_tier varchar(20) default 'free',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Image Generations History Table
create table if not exists public.generations (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    image_url text not null,
    caption text not null,
    confidence_score float,
    processing_time float,  -- in seconds
    tokens_used int default 1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index if not exists generations_user_id_idx on public.generations(user_id);
create index if not exists generations_created_at_idx on public.generations(created_at);

-- Row Level Security Policies
-- User Statistics RLS
create policy "Users can view their own statistics"
    on public.user_statistics for select
    using (auth.uid() = user_id);

create policy "Insert user statistics on sign up"
    on public.user_statistics for insert
    with check (auth.uid() = user_id);

create policy "Update own statistics"
    on public.user_statistics for update
    using (auth.uid() = user_id);

-- Generations RLS
create policy "Users can view their own generations"
    on public.generations for select
    using (auth.uid() = user_id);

create policy "Users can create their own generations"
    on public.generations for insert
    with check (auth.uid() = user_id);

-- Functions and Triggers
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.user_statistics (user_id)
    values (new.id);
    return new;
end;
$$;

-- Trigger to create user statistics on sign up
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Function to update user statistics after generation
create or replace function public.update_user_statistics()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    update public.user_statistics
    set 
        total_generations = total_generations + 1,
        tokens_used = tokens_used + new.tokens_used,
        tokens_remaining = tokens_remaining - new.tokens_used,
        updated_at = now()
    where user_id = new.user_id;
    return new;
end;
$$;

-- Trigger to update statistics after generation
create trigger after_generation_created
    after insert on public.generations
    for each row execute procedure public.update_user_statistics();
