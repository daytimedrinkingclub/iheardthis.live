-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table (extends Supabase auth.users)
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    username text unique,
    name text not null,
    avatar_url text,
    country text,
    twitter_url text,
    spotify_url text,
    soundcloud_url text,
    youtube_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create artists table
create table public.artists (
    id text primary key,  -- Spotify artist ID
    name text not null,
    image_url text,
    spotify_url text not null,
    genres text[],
    followers integer,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create user_artist_experiences table
create table public.user_artist_experiences (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles on delete cascade,
    artist_id text references public.artists on delete cascade,
    event_name text,
    city text,
    country text,
    attended_with uuid[] default array[]::uuid[],
    created_at timestamp with time zone default timezone('utc'::text, now()),
    unique(user_id, artist_id)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.artists enable row level security;
alter table public.user_artist_experiences enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
    on public.profiles for select
    using (true);

create policy "Users can insert their own profile"
    on public.profiles for insert
    with check (auth.uid() = id);

create policy "Users can update own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- Artists policies
create policy "Artists are viewable by everyone"
    on public.artists for select
    using (true);

create policy "Authenticated users can insert artists"
    on public.artists for insert
    with check (auth.role() = 'authenticated');

-- User Artist Experiences policies
create policy "Experiences are viewable by everyone"
    on public.user_artist_experiences for select
    using (true);

create policy "Users can insert own experiences"
    on public.user_artist_experiences for insert
    with check (auth.uid() = user_id);

create policy "Users can update own experiences"
    on public.user_artist_experiences for update
    using (auth.uid() = user_id);

create policy "Users can delete own experiences"
    on public.user_artist_experiences for delete
    using (auth.uid() = user_id);

-- Create profile on user signup
create function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, username, name, avatar_url)
    values (
        new.id,
        new.raw_user_meta_data->>'username',
        new.raw_user_meta_data->>'name',
        new.raw_user_meta_data->>'avatar_url'
    );
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Storage setup and policies
-- Create storage bucket for profile images
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- Simple policies for image storage
create policy "Give public access to images"
on storage.objects for select
using (bucket_id = 'images');

create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check (bucket_id = 'images');