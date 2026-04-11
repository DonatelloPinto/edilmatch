-- EdilMatch — FUNZIONALITÀ 1: Chat interna cliente/professionista
-- Esegui nell'SQL Editor di Supabase (una volta sola).

-- Tabella conversazioni: un thread per (cliente, professionista, richiesta) dopo preventivo accettato
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  professional_id uuid not null references public.profiles (id) on delete cascade,
  request_id uuid not null references public.requests (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_unique_triplet unique (client_id, professional_id, request_id),
  constraint conversations_different_roles check (client_id <> professional_id)
);

create index if not exists idx_conversations_client on public.conversations (client_id);
create index if not exists idx_conversations_professional on public.conversations (professional_id);
create index if not exists idx_conversations_request on public.conversations (request_id);

-- Messaggi (colonna read: stato lettura lato destinatario)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  receiver_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint messages_sender_receiver check (sender_id <> receiver_id)
);

create index if not exists idx_messages_conversation_created on public.messages (conversation_id, created_at desc);
create index if not exists idx_messages_receiver_unread on public.messages (receiver_id) where read = false;

-- Aggiorna updated_at sulla conversazione quando arriva un messaggio
create or replace function public.set_conversation_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set updated_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists trg_messages_set_conversation_updated on public.messages;
create trigger trg_messages_set_conversation_updated
  after insert on public.messages
  for each row
  execute procedure public.set_conversation_updated_at();

-- RLS
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "conversations_select_participants" on public.conversations;
create policy "conversations_select_participants"
  on public.conversations for select
  using (auth.uid() = client_id or auth.uid() = professional_id);

drop policy if exists "conversations_insert_participants" on public.conversations;
create policy "conversations_insert_participants"
  on public.conversations for insert
  with check (auth.uid() = client_id or auth.uid() = professional_id);

drop policy if exists "conversations_update_participants" on public.conversations;
create policy "conversations_update_participants"
  on public.conversations for update
  using (auth.uid() = client_id or auth.uid() = professional_id);

drop policy if exists "messages_select_participants" on public.messages;
create policy "messages_select_participants"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.client_id = auth.uid() or c.professional_id = auth.uid())
    )
  );

drop policy if exists "messages_insert_as_sender" on public.messages;
create policy "messages_insert_as_sender"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (
          (c.client_id = sender_id and c.professional_id = receiver_id)
          or (c.professional_id = sender_id and c.client_id = receiver_id)
        )
    )
  );

drop policy if exists "messages_update_receiver_read" on public.messages;
create policy "messages_update_receiver_read"
  on public.messages for update
  using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id);

-- Realtime: messaggi in tempo reale (ignora errore se la tabella è già nella publication)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
exception
  when undefined_object then null;
end $$;
