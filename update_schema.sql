-- Run this in your Supabase SQL Editor

alter table bookmarks 
add column if not exists is_pinned boolean default false,
add column if not exists tags text[] default array[]::text[],
add column if not exists description text,
add column if not exists image text;
