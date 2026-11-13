-- Run in the Supabase SQL editor after creating a project.
create extension if not exists vector;
create table if not exists public.memories (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check (kind in ('thought','task','link','audio')),
 body text not null default '',
 original_transcript text,
 source_url text,
 audio_path text,
 done boolean not null default false,
 due_at timestamptz,
 category text,
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 deleted_at timestamptz
);
create index if not exists memories_user_created_idx on public.memories(user_id,created_at desc);
create index if not exists memories_user_kind_idx on public.memories(user_id,kind);
create index if not exists memories_search_idx on public.memories using gin (to_tsvector('english',coalesce(body,'') || ' ' || coalesce(original_transcript,'')));
create table if not exists public.memory_chunks (
 id uuid primary key default gen_random_uuid(),
 memory_id uuid not null references public.memories(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 content text not null,
 embedding vector(1536),
 created_at timestamptz not null default now()
);
create index if not exists memory_chunks_user_idx on public.memory_chunks(user_id);
create index if not exists memory_chunks_vector_idx on public.memory_chunks using hnsw (embedding vector_cosine_ops);
create table if not exists public.memory_events (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 memory_id uuid references public.memories(id) on delete set null,
 event_type text not null,
 payload jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists memory_events_user_idx on public.memory_events(user_id,created_at desc);
alter table public.memories enable row level security;
alter table public.memory_chunks enable row level security;
alter table public.memory_events enable row level security;
create policy "memories_owner" on public.memories for all to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy "chunks_owner" on public.memory_chunks for all to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy "events_owner" on public.memory_events for select to authenticated using (user_id=(select auth.uid()));
-- Event writes are server-side only; the service role bypasses RLS.
create or replace function public.search_my_memories(search_text text, result_limit integer default 20)
returns setof public.memories language sql stable security invoker as $$
 select m.* from public.memories m
 where m.user_id=(select auth.uid()) and m.deleted_at is null
 and (search_text='' or to_tsvector('english',coalesce(m.body,'') || ' ' || coalesce(m.original_transcript,'')) @@ plainto_tsquery('english',search_text)
 or m.body ilike '%' || search_text || '%')
 order by m.created_at desc limit least(greatest(result_limit,1),100)
$$;
