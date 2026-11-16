-- ============================================================================
-- TUỔI BẠC — Lược đồ Cơ sở dữ liệu Thời gian thực (Supabase / PostgreSQL)
-- Dùng cho gói Miễn phí (Free Tier) của Supabase: chạy 1 lần trong SQL Editor
-- ============================================================================

create table if not exists public.morning_checkins (
  day_key text not null,
  client_id text not null,
  user_name text not null,
  age int not null default 65,
  province_id text not null,
  province_short text not null,
  mood text not null default 'Khỏe khoắn',
  updated_at timestamptz not null default now(),
  primary key (day_key, client_id)
);

create table if not exists public.tea_messages (
  id text primary key,
  table_key text not null,
  client_id text not null,
  speaker text not null,
  body text not null,
  ritual text,
  created_at timestamptz not null default now()
);
create index if not exists idx_tea_messages_table_created
  on public.tea_messages (table_key, created_at desc);

create table if not exists public.async_matches (
  match_id text primary key,
  kind text not null check (kind in ('oaq', 'xiangqi')),
  host_id text not null,
  host_name text not null,
  guest_id text,
  guest_name text,
  turn text not null,
  status_text text,
  payload jsonb not null default '{}'::jsonb,
  move_count int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.poems (
  id text primary key,
  client_id text not null,
  title text not null,
  author text not null,
  reciter text not null,
  lines jsonb not null default '[]'::jsonb,
  flowers int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.phonetic_dictionary (
  wrong_phrase text primary key,
  right_phrase text not null,
  hits int not null default 1,
  learned_by text,
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id bigserial primary key,
  client_id text not null,
  event_name text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.safety_reports (
  id bigserial primary key,
  client_id text not null,
  table_key text,
  reason text not null,
  created_at timestamptz not null default now()
);

-- Bảng Thẻ Hội Viên (chỉ lưu mã băm một chiều account_hash từ SĐT + Mã 4 số, tuyệt đối không lưu SĐT thô)
create table if not exists public.member_accounts (
  account_hash text primary key,
  member_code text not null unique,
  phone_masked text not null,
  honorific text not null default 'Anh',
  base_name text not null,
  age int not null default 65,
  province_id text not null default 'ha-noi',
  snapshot_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Bảng Đơn vị Đồng ngũ / Hội nhóm / Câu lạc bộ (VD: Đại đội 1K2 · D3 · Sư đoàn 25)
create table if not exists public.community_groups (
  id text primary key,
  name text not null,
  short_name text not null,
  category text not null default 'veteran',
  subtitle text,
  motto text,
  leader_name text,
  join_pin text default '',
  unit_spec jsonb default '{}'::jsonb,
  payload_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Bảng Kết bạn Tâm giao & Đồng đội
create table if not exists public.friend_links (
  pair_key text primary key,
  from_code text not null,
  to_code text not null,
  payload_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Bật Row Level Security (cho phép khách không cần tạo tài khoản đọc/ghi an toàn trong MVP)
alter table public.morning_checkins enable row level security;
alter table public.tea_messages enable row level security;
alter table public.async_matches enable row level security;
alter table public.poems enable row level security;
alter table public.phonetic_dictionary enable row level security;
alter table public.analytics_events enable row level security;
alter table public.safety_reports enable row level security;
alter table public.member_accounts enable row level security;
alter table public.community_groups enable row level security;
alter table public.friend_links enable row level security;

drop policy if exists "mvp_public_checkins" on public.morning_checkins;
create policy "mvp_public_checkins" on public.morning_checkins for all using (true) with check (true);

drop policy if exists "mvp_public_tea_messages" on public.tea_messages;
create policy "mvp_public_tea_messages" on public.tea_messages for all using (true) with check (true);

drop policy if exists "mvp_public_async_matches" on public.async_matches;
create policy "mvp_public_async_matches" on public.async_matches for all using (true) with check (true);

drop policy if exists "mvp_public_poems" on public.poems;
create policy "mvp_public_poems" on public.poems for all using (true) with check (true);

drop policy if exists "mvp_public_dict" on public.phonetic_dictionary;
create policy "mvp_public_dict" on public.phonetic_dictionary for all using (true) with check (true);

drop policy if exists "mvp_public_analytics" on public.analytics_events;
create policy "mvp_public_analytics" on public.analytics_events for all using (true) with check (true);

drop policy if exists "mvp_public_reports" on public.safety_reports;
create policy "mvp_public_reports" on public.safety_reports for all using (true) with check (true);

drop policy if exists "mvp_public_member_accounts" on public.member_accounts;
create policy "mvp_public_member_accounts" on public.member_accounts for all using (true) with check (true);

drop policy if exists "mvp_public_community_groups" on public.community_groups;
create policy "mvp_public_community_groups" on public.community_groups for all using (true) with check (true);

drop policy if exists "mvp_public_friend_links" on public.friend_links;
create policy "mvp_public_friend_links" on public.friend_links for all using (true) with check (true);
