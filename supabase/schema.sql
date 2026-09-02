-- 1. Profiles Table (Extends Auth.Users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  department text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Board Posts Table (실제 업무 소통 게시판 구조 - 비회원 4자리 암호 지원)
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  board_type text not null default 'notice',
  title text not null,
  content text,
  author_email text,
  category text default '일반',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Administrative Documents Table
create table if not exists documents (
  id uuid default gen_random_uuid() primary key,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  category text,
  uploaded_by uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table profiles enable row level security;
alter table posts enable row level security;
alter table documents enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Posts Policies (비회원 익명 글쓰기 및 조회/수정/삭제 전면 허용)
drop policy if exists "Authenticated users can create posts." on posts;
drop policy if exists "Anyone can create posts." on posts;
drop policy if exists "Posts are viewable by everyone." on posts;
drop policy if exists "Anyone can update posts." on posts;
drop policy if exists "Anyone can delete posts." on posts;

create policy "Posts are viewable by everyone." on posts for select to public using (true);
create policy "Anyone can create posts." on posts for insert to public with check (true);
create policy "Anyone can update posts." on posts for update to public using (true) with check (true);
create policy "Anyone can delete posts." on posts for delete to public using (true);

-- Documents Policies
create policy "Documents are viewable by everyone." on documents for select using (true);

