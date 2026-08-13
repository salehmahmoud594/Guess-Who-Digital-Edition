-- Guess Who Room rebuild: Supabase Auth, RLS, Realtime, and database-owned commands.
-- This migration intentionally leaves the legacy server-mediated Room tables untouched.

create extension if not exists pgcrypto;
create extension if not exists pg_cron;

do $$
begin
  create type public.room_status as enum ('waiting', 'setup', 'secret_selection', 'playing', 'finished', 'expired');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.room_win_reason as enum ('guess', 'hearts');
exception when duplicate_object then null;
end $$;

create table if not exists public.game_access_grants (
  user_id uuid primary key references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.room_card_catalog (
  card_id integer primary key,
  category text not null check (category in ('animals', 'fictional_characters', 'cartoon_characters', 'egyptian_movies', 'cartoon_movies', 'emojis'))
);

-- Stable IDs match client/src/data/gameItems.ts.
insert into public.room_card_catalog (card_id, category)
select card_id, category
from (
  select generate_series(1, 88) as card_id, 'animals'::text as category
  union all select generate_series(89, 238), 'fictional_characters'
  union all select generate_series(239, 361), 'cartoon_characters'
  union all select generate_series(362, 511), 'egyptian_movies'
  union all select generate_series(512, 611), 'cartoon_movies'
  union all select generate_series(612, 659), 'emojis'
) as catalog
on conflict (card_id) do update set category = excluded.category;

create table if not exists public.game_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code varchar(6) not null unique check (room_code ~ '^[A-Z2-9]{6}$'),
  category text not null check (category in ('animals', 'fictional_characters', 'cartoon_characters', 'egyptian_movies', 'cartoon_movies', 'emojis')),
  heart_limit smallint null check (heart_limit is null or heart_limit in (1, 3, 5)),
  status public.room_status not null default 'waiting',
  deck_ids integer[] not null check (cardinality(deck_ids) = 24),
  active_seat smallint null check (active_seat in (1, 2)),
  winner_seat smallint null check (winner_seat in (1, 2)),
  win_reason public.room_win_reason null,
  feedback text null check (char_length(feedback) <= 255),
  player_1_score integer not null default 0 check (player_1_score >= 0),
  player_2_score integer not null default 0 check (player_2_score >= 0),
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '1 hour')
);

create index if not exists game_rooms_status_activity_idx on public.game_rooms (status, last_activity_at);

create table if not exists public.room_memberships (
  room_id uuid not null references public.game_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  seat_number smallint not null check (seat_number in (1, 2)),
  created_at timestamptz not null default now(),
  primary key (room_id, seat_number),
  unique (room_id, user_id)
);

create table if not exists public.room_public_seats (
  room_id uuid not null,
  seat_number smallint not null check (seat_number in (1, 2)),
  player_name varchar(32) not null check (char_length(btrim(player_name)) between 1 and 32),
  ready boolean not null default false,
  secret_selected boolean not null default false,
  last_seen_at timestamptz not null default now(),
  primary key (room_id, seat_number),
  foreign key (room_id, seat_number) references public.room_memberships(room_id, seat_number) on delete cascade
);

create table if not exists public.room_private_states (
  room_id uuid not null,
  seat_number smallint not null check (seat_number in (1, 2)),
  secret_card_id integer null,
  eliminated_ids integer[] not null default '{}'::integer[],
  hearts smallint null check (hearts is null or hearts >= 0),
  updated_at timestamptz not null default now(),
  primary key (room_id, seat_number),
  foreign key (room_id, seat_number) references public.room_memberships(room_id, seat_number) on delete cascade
);

create or replace function public.room_has_access()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.game_access_grants grant_row
      where grant_row.user_id = auth.uid()
        and grant_row.expires_at > now()
    );
$$;

create or replace function public.room_is_member(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.room_has_access()
    and exists (
      select 1
      from public.room_memberships membership
      where membership.room_id = p_room_id
        and membership.user_id = auth.uid()
    );
$$;

create or replace function public.room_owns_seat(p_room_id uuid, p_seat_number smallint)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select public.room_has_access()
    and exists (
      select 1
      from public.room_memberships membership
      where membership.room_id = p_room_id
        and membership.seat_number = p_seat_number
        and membership.user_id = auth.uid()
    );
$$;

alter table public.game_access_grants enable row level security;
alter table public.room_card_catalog enable row level security;
alter table public.game_rooms enable row level security;
alter table public.room_memberships enable row level security;
alter table public.room_public_seats enable row level security;
alter table public.room_private_states enable row level security;

drop policy if exists "members read rooms" on public.game_rooms;
create policy "members read rooms"
  on public.game_rooms for select to authenticated
  using (public.room_is_member(id));

drop policy if exists "players read own membership" on public.room_memberships;
create policy "players read own membership"
  on public.room_memberships for select to authenticated
  using (user_id = auth.uid() and public.room_has_access());

drop policy if exists "members read safe seats" on public.room_public_seats;
create policy "members read safe seats"
  on public.room_public_seats for select to authenticated
  using (public.room_is_member(room_id));

drop policy if exists "players read own private state" on public.room_private_states;
create policy "players read own private state"
  on public.room_private_states for select to authenticated
  using (public.room_owns_seat(room_id, seat_number));

revoke all on public.game_access_grants, public.room_card_catalog, public.game_rooms, public.room_memberships, public.room_public_seats, public.room_private_states from anon, authenticated;
grant select on public.game_rooms, public.room_memberships, public.room_public_seats, public.room_private_states to authenticated;

revoke all on function public.room_has_access() from public;
revoke all on function public.room_is_member(uuid) from public;
revoke all on function public.room_owns_seat(uuid, smallint) from public;
grant execute on function public.room_has_access(), public.room_is_member(uuid), public.room_owns_seat(uuid, smallint) to authenticated;

create or replace function public.room_assert_access()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.room_has_access() then
    raise exception 'Password access is required.' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.room_current_seat(p_room_id uuid)
returns smallint
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_seat smallint;
begin
  perform public.room_assert_access();
  select seat_number into v_seat
  from public.room_memberships
  where room_id = p_room_id and user_id = auth.uid();

  if v_seat is null then
    raise exception 'You do not have a seat in this room.' using errcode = '42501';
  end if;
  return v_seat;
end;
$$;

create or replace function public.room_new_code()
returns varchar(6)
language sql
volatile
security definer
set search_path = public
as $$
  select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::integer, 1), '')::varchar(6)
  from generate_series(1, 6);
$$;

create or replace function public.room_new_deck(p_category text)
returns integer[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deck integer[];
begin
  select array_agg(card_id) into v_deck
  from (
    select card_id
    from public.room_card_catalog
    where category = p_category
    order by random()
    limit 24
  ) as chosen;

  if cardinality(v_deck) <> 24 then
    raise exception 'This card category is not ready for Room play.' using errcode = '22023';
  end if;
  return v_deck;
end;
$$;

create or replace function public.room_expire_stale(p_cutoff timestamptz default now() - interval '1 hour')
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expired integer;
begin
  update public.game_rooms
  set status = 'expired',
      active_seat = null,
      feedback = 'This room has expired.',
      revision = revision + 1,
      expires_at = now()
  where status in ('waiting', 'setup', 'secret_selection', 'playing')
    and last_activity_at <= p_cutoff;

  get diagnostics v_expired = row_count;
  return v_expired;
end;
$$;

create or replace function public.room_create(p_player_name text, p_category text, p_heart_limit smallint default null)
returns table(room_id uuid, room_code varchar(6), seat_number smallint)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_room_id uuid;
  v_room_code varchar(6);
  v_player_name varchar(32) := btrim(p_player_name);
  v_deck integer[];
  v_attempt integer := 0;
begin
  perform public.room_assert_access();
  if char_length(v_player_name) not between 1 and 32 then
    raise exception 'Player name must contain 1 to 32 characters.' using errcode = '22023';
  end if;
  if p_category not in ('animals', 'fictional_characters', 'cartoon_characters', 'egyptian_movies', 'cartoon_movies', 'emojis') then
    raise exception 'Choose a supported card category.' using errcode = '22023';
  end if;
  if p_heart_limit is not null and p_heart_limit not in (1, 3, 5) then
    raise exception 'Heart limit must be 1, 3, 5, or null for unlimited.' using errcode = '22023';
  end if;

  v_deck := public.room_new_deck(p_category);
  loop
    v_attempt := v_attempt + 1;
    v_room_code := public.room_new_code();
    begin
      insert into public.game_rooms (room_code, category, heart_limit, deck_ids)
      values (v_room_code, p_category, p_heart_limit, v_deck)
      returning id into v_room_id;
      exit;
    exception when unique_violation then
      if v_attempt >= 8 then
        raise exception 'Could not allocate a room code. Please try again.' using errcode = '40001';
      end if;
    end;
  end loop;

  insert into public.room_memberships (room_id, user_id, seat_number) values (v_room_id, auth.uid(), 1);
  insert into public.room_public_seats (room_id, seat_number, player_name) values (v_room_id, 1, v_player_name);
  insert into public.room_private_states (room_id, seat_number, hearts) values (v_room_id, 1, p_heart_limit);
  return query select v_room_id, v_room_code, 1::smallint;
end;
$$;

create or replace function public.room_join(p_room_code text, p_player_name text)
returns table(room_id uuid, room_code varchar(6), seat_number smallint)
language plpgsql
security definer
set search_path = public, auth
as $$
#variable_conflict use_column
declare
  v_room public.game_rooms%rowtype;
  v_player_name varchar(32) := btrim(p_player_name);
begin
  perform public.room_assert_access();
  if char_length(v_player_name) not between 1 and 32 then
    raise exception 'Player name must contain 1 to 32 characters.' using errcode = '22023';
  end if;

  select * into v_room
  from public.game_rooms gr
  where gr.room_code = upper(btrim(p_room_code))
  for update;

  if not found then
    raise exception 'Room not found. Check the six-character code and try again.' using errcode = 'P0002';
  end if;
  if v_room.status in ('waiting', 'setup', 'secret_selection', 'playing') and v_room.last_activity_at <= now() - interval '1 hour' then
    update public.game_rooms gr
    set status = 'expired', active_seat = null, feedback = 'This room has expired.', revision = gr.revision + 1, expires_at = now()
    where gr.id = v_room.id;
    raise exception 'This room has expired.' using errcode = 'P0001';
  end if;
  if v_room.status not in ('waiting', 'setup') then
    raise exception 'This game is no longer available to join.' using errcode = '23505';
  end if;
  if exists (select 1 from public.room_memberships rm where rm.room_id = v_room.id and rm.user_id = auth.uid()) then
    raise exception 'This device already has a seat in the room.' using errcode = '23505';
  end if;
  if exists (select 1 from public.room_memberships rm where rm.room_id = v_room.id and rm.seat_number = 2) then
    raise exception 'This room already has two players.' using errcode = '23505';
  end if;

  insert into public.room_memberships (room_id, user_id, seat_number) values (v_room.id, auth.uid(), 2);
  insert into public.room_public_seats (room_id, seat_number, player_name) values (v_room.id, 2, v_player_name);
  insert into public.room_private_states (room_id, seat_number, hearts) values (v_room.id, 2, v_room.heart_limit);
  update public.game_rooms gr
  set status = 'setup', revision = gr.revision + 1, last_activity_at = now(), expires_at = now() + interval '1 hour'
  where gr.id = v_room.id;
  return query select v_room.id, v_room.room_code, 2::smallint;
end;
$$;

create or replace function public.room_set_ready(p_room_id uuid, p_ready boolean, p_expected_revision integer default null)
returns public.game_rooms
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_room public.game_rooms%rowtype;
  v_seat smallint;
  v_ready_count integer;
begin
  v_seat := public.room_current_seat(p_room_id);
  select * into v_room from public.game_rooms where id = p_room_id for update;
  if not found or v_room.status not in ('waiting', 'setup') then
    raise exception 'Ready state can no longer be changed.' using errcode = '23505';
  end if;
  if p_expected_revision is not null and v_room.revision <> p_expected_revision then
    raise exception 'Room state changed. Refresh and try again.' using errcode = '40001';
  end if;
  update public.room_public_seats set ready = p_ready, last_seen_at = now() where room_id = p_room_id and seat_number = v_seat;
  select count(*) into v_ready_count from public.room_public_seats where room_id = p_room_id and ready;
  update public.game_rooms
  set status = case when v_ready_count = 2 then 'secret_selection'::public.room_status when v_ready_count = 1 and exists (select 1 from public.room_memberships where room_id = p_room_id and seat_number = 2) then 'setup'::public.room_status else 'waiting'::public.room_status end,
      revision = revision + 1,
      last_activity_at = now(),
      expires_at = now() + interval '1 hour'
  where id = p_room_id
  returning * into v_room;
  return v_room;
end;
$$;

create or replace function public.room_select_secret(p_room_id uuid, p_card_id integer, p_expected_revision integer default null)
returns public.game_rooms
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_room public.game_rooms%rowtype;
  v_seat smallint;
  v_selected_count integer;
  v_existing_secret integer;
begin
  v_seat := public.room_current_seat(p_room_id);
  select * into v_room from public.game_rooms where id = p_room_id for update;
  if not found or v_room.status <> 'secret_selection' then
    raise exception 'Secret selection is not open yet.' using errcode = '23505';
  end if;
  if p_expected_revision is not null and v_room.revision <> p_expected_revision then
    raise exception 'Room state changed. Refresh and try again.' using errcode = '40001';
  end if;
  if not p_card_id = any(v_room.deck_ids) then
    raise exception 'Choose a card from this room deck.' using errcode = '22023';
  end if;
  select secret_card_id into v_existing_secret from public.room_private_states where room_id = p_room_id and seat_number = v_seat;
  if v_existing_secret is not null and v_existing_secret <> p_card_id then
    raise exception 'Your secret is already locked in.' using errcode = '23505';
  end if;
  update public.room_private_states set secret_card_id = p_card_id, updated_at = now() where room_id = p_room_id and seat_number = v_seat;
  update public.room_public_seats set secret_selected = true, last_seen_at = now() where room_id = p_room_id and seat_number = v_seat;
  select count(*) into v_selected_count from public.room_public_seats where room_id = p_room_id and secret_selected;
  update public.game_rooms
  set status = case when v_selected_count = 2 then 'playing'::public.room_status else 'secret_selection'::public.room_status end,
      active_seat = case when v_selected_count = 2 then 1 else null end,
      revision = revision + 1,
      last_activity_at = now(),
      expires_at = now() + interval '1 hour'
  where id = p_room_id
  returning * into v_room;
  return v_room;
end;
$$;

create or replace function public.room_toggle_elimination(p_room_id uuid, p_card_id integer, p_expected_revision integer default null)
returns public.game_rooms
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_room public.game_rooms%rowtype;
  v_seat smallint;
begin
  v_seat := public.room_current_seat(p_room_id);
  select * into v_room from public.game_rooms where id = p_room_id for update;
  if not found or v_room.status <> 'playing' or v_room.active_seat <> v_seat then
    raise exception 'Wait for your turn before changing your board.' using errcode = '42501';
  end if;
  if p_expected_revision is not null and v_room.revision <> p_expected_revision then
    raise exception 'Room state changed. Refresh and try again.' using errcode = '40001';
  end if;
  if not p_card_id = any(v_room.deck_ids) then
    raise exception 'Choose a card from this room deck.' using errcode = '22023';
  end if;
  update public.room_private_states
  set eliminated_ids = case when p_card_id = any(eliminated_ids) then array_remove(eliminated_ids, p_card_id) else array_append(eliminated_ids, p_card_id) end,
      updated_at = now()
  where room_id = p_room_id and seat_number = v_seat;
  update public.room_public_seats set last_seen_at = now() where room_id = p_room_id and seat_number = v_seat;
  update public.game_rooms set revision = revision + 1, last_activity_at = now(), expires_at = now() + interval '1 hour' where id = p_room_id returning * into v_room;
  return v_room;
end;
$$;

create or replace function public.room_end_turn(p_room_id uuid, p_expected_revision integer default null)
returns public.game_rooms
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_room public.game_rooms%rowtype;
  v_seat smallint;
  v_name text;
begin
  v_seat := public.room_current_seat(p_room_id);
  select * into v_room from public.game_rooms where id = p_room_id for update;
  if not found or v_room.status <> 'playing' or v_room.active_seat <> v_seat then
    raise exception 'Wait for your turn before ending it.' using errcode = '42501';
  end if;
  if p_expected_revision is not null and v_room.revision <> p_expected_revision then
    raise exception 'Room state changed. Refresh and try again.' using errcode = '40001';
  end if;
  select player_name into v_name from public.room_public_seats where room_id = p_room_id and seat_number = v_seat;
  update public.room_public_seats set last_seen_at = now() where room_id = p_room_id and seat_number = v_seat;
  update public.game_rooms
  set active_seat = case when v_seat = 1 then 2 else 1 end,
      feedback = v_name || ' passed the turn.',
      revision = revision + 1,
      last_activity_at = now(),
      expires_at = now() + interval '1 hour'
  where id = p_room_id
  returning * into v_room;
  return v_room;
end;
$$;

create or replace function public.room_submit_guess(p_room_id uuid, p_card_id integer, p_expected_revision integer default null)
returns public.game_rooms
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_room public.game_rooms%rowtype;
  v_seat smallint;
  v_opponent_seat smallint;
  v_opponent_secret integer;
  v_name text;
  v_hearts smallint;
  v_next_seat smallint;
begin
  v_seat := public.room_current_seat(p_room_id);
  select * into v_room from public.game_rooms where id = p_room_id for update;
  if not found or v_room.status <> 'playing' or v_room.active_seat <> v_seat then
    raise exception 'Wait for your turn before making a final guess.' using errcode = '42501';
  end if;
  if p_expected_revision is not null and v_room.revision <> p_expected_revision then
    raise exception 'Room state changed. Refresh and try again.' using errcode = '40001';
  end if;
  if not p_card_id = any(v_room.deck_ids) then
    raise exception 'Choose a card from this room deck.' using errcode = '22023';
  end if;
  v_opponent_seat := case when v_seat = 1 then 2 else 1 end;
  select secret_card_id into v_opponent_secret from public.room_private_states where room_id = p_room_id and seat_number = v_opponent_seat;
  if v_opponent_secret is null then
    raise exception 'The other player has not selected a secret yet.' using errcode = '23505';
  end if;
  select player_name into v_name from public.room_public_seats where room_id = p_room_id and seat_number = v_seat;
  update public.room_public_seats set last_seen_at = now() where room_id = p_room_id and seat_number = v_seat;

  if p_card_id = v_opponent_secret then
    update public.game_rooms
    set status = 'finished', active_seat = null, winner_seat = v_seat, win_reason = 'guess', feedback = v_name || ' guessed the secret!',
        player_1_score = player_1_score + case when v_seat = 1 then 1 else 0 end,
        player_2_score = player_2_score + case when v_seat = 2 then 1 else 0 end,
        revision = revision + 1, last_activity_at = now(), expires_at = now() + interval '90 minutes'
    where id = p_room_id returning * into v_room;
    return v_room;
  end if;

  v_next_seat := v_opponent_seat;
  if v_room.heart_limit is null then
    update public.game_rooms
    set active_seat = v_next_seat, feedback = 'Not quite. No heart lost — the turn passes on.', revision = revision + 1,
        last_activity_at = now(), expires_at = now() + interval '1 hour'
    where id = p_room_id returning * into v_room;
    return v_room;
  end if;

  update public.room_private_states
  set hearts = greatest(0, coalesce(hearts, v_room.heart_limit) - 1), updated_at = now()
  where room_id = p_room_id and seat_number = v_seat
  returning hearts into v_hearts;

  update public.game_rooms
  set status = case when v_hearts = 0 then 'finished'::public.room_status else 'playing'::public.room_status end,
      active_seat = case when v_hearts = 0 then null else v_next_seat end,
      winner_seat = case when v_hearts = 0 then v_next_seat else null end,
      win_reason = case when v_hearts = 0 then 'hearts'::public.room_win_reason else null end,
      feedback = case when v_hearts = 0 then v_name || ' ran out of hearts.' else v_name || ' lost one heart. The turn passes on.' end,
      player_1_score = player_1_score + case when v_hearts = 0 and v_next_seat = 1 then 1 else 0 end,
      player_2_score = player_2_score + case when v_hearts = 0 and v_next_seat = 2 then 1 else 0 end,
      revision = revision + 1,
      last_activity_at = now(),
      expires_at = now() + case when v_hearts = 0 then interval '90 minutes' else interval '1 hour' end
  where id = p_room_id returning * into v_room;
  return v_room;
end;
$$;

create or replace function public.room_start_rematch(p_room_id uuid, p_expected_revision integer default null)
returns public.game_rooms
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_room public.game_rooms%rowtype;
  v_seat smallint;
  v_deck integer[];
begin
  v_seat := public.room_current_seat(p_room_id);
  select * into v_room from public.game_rooms where id = p_room_id for update;
  if not found or v_room.status <> 'finished' then
    raise exception 'A rematch is available after the round ends.' using errcode = '23505';
  end if;
  if v_seat <> 1 then
    raise exception 'Only the room host can start a rematch.' using errcode = '42501';
  end if;
  if p_expected_revision is not null and v_room.revision <> p_expected_revision then
    raise exception 'Room state changed. Refresh and try again.' using errcode = '40001';
  end if;
  if (select count(*) from public.room_memberships where room_id = p_room_id) <> 2 then
    raise exception 'A rematch needs both players to remain in the room.' using errcode = '23505';
  end if;
  v_deck := public.room_new_deck(v_room.category);
  update public.room_private_states set secret_card_id = null, eliminated_ids = '{}'::integer[], hearts = v_room.heart_limit, updated_at = now() where room_id = p_room_id;
  update public.room_public_seats set ready = true, secret_selected = false, last_seen_at = now() where room_id = p_room_id;
  update public.game_rooms
  set status = 'secret_selection', deck_ids = v_deck, active_seat = null, winner_seat = null, win_reason = null, feedback = null,
      revision = revision + 1, last_activity_at = now(), expires_at = now() + interval '1 hour'
  where id = p_room_id returning * into v_room;
  return v_room;
end;
$$;

create or replace function public.room_recover(p_room_id uuid)
returns table(room_id uuid, room_code varchar(6), seat_number smallint, status public.room_status)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_room public.game_rooms%rowtype;
  v_seat smallint;
begin
  v_seat := public.room_current_seat(p_room_id);
  select * into v_room from public.game_rooms where id = p_room_id for update;
  if not found then
    raise exception 'Room not found.' using errcode = 'P0002';
  end if;
  if v_room.status in ('waiting', 'setup', 'secret_selection', 'playing') and v_room.last_activity_at <= now() - interval '1 hour' then
    update public.game_rooms
    set status = 'expired', active_seat = null, feedback = 'This room has expired.', revision = revision + 1, expires_at = now()
    where id = p_room_id returning * into v_room;
  elsif v_room.status in ('waiting', 'setup', 'secret_selection', 'playing') then
    update public.room_public_seats set last_seen_at = now() where room_id = p_room_id and seat_number = v_seat;
    update public.game_rooms set last_activity_at = now(), expires_at = now() + interval '1 hour' where id = p_room_id returning * into v_room;
  end if;
  return query select v_room.id, v_room.room_code, v_seat, v_room.status;
end;
$$;

revoke all on function public.room_assert_access(), public.room_current_seat(uuid), public.room_new_code(), public.room_new_deck(text), public.room_expire_stale(timestamptz), public.room_create(text, text, smallint), public.room_join(text, text), public.room_set_ready(uuid, boolean, integer), public.room_select_secret(uuid, integer, integer), public.room_toggle_elimination(uuid, integer, integer), public.room_end_turn(uuid, integer), public.room_submit_guess(uuid, integer, integer), public.room_start_rematch(uuid, integer), public.room_recover(uuid) from public;
grant execute on function public.room_create(text, text, smallint), public.room_join(text, text), public.room_set_ready(uuid, boolean, integer), public.room_select_secret(uuid, integer, integer), public.room_toggle_elimination(uuid, integer, integer), public.room_end_turn(uuid, integer), public.room_submit_guess(uuid, integer, integer), public.room_start_rematch(uuid, integer), public.room_recover(uuid) to authenticated;

alter publication supabase_realtime add table public.game_rooms, public.room_public_seats, public.room_private_states;

do $$
declare
  v_job_id bigint;
begin
  select jobid into v_job_id from cron.job where jobname = 'room-inactivity-cleanup' limit 1;
  if v_job_id is not null then
    perform cron.unschedule(v_job_id);
  end if;
  perform cron.schedule('room-inactivity-cleanup', '*/10 * * * *', 'select public.room_expire_stale();');
end;
$$;
