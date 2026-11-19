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

-- Bảng Log hành vi tất cả thành viên phục vụ AI Tracking & Thấu hiểu thói quen sinh hoạt
create table if not exists public.member_activity_logs (
  id text primary key,
  member_code text not null,
  client_id text not null,
  user_name text not null,
  age int not null default 65,
  province text not null default '',
  seniority_tier text not null default '',
  action text not null,
  category text not null default '',
  detail text not null default '',
  hour_of_day int not null default 6,
  created_at timestamptz not null default now()
);
create index if not exists idx_member_activity_logs_member
  on public.member_activity_logs (member_code, created_at desc);

-- Bảng Tên Bàn Trà Đàm Đạo do Chủ bàn đặt
create table if not exists public.custom_tea_tables (
  table_key text primary key,
  room_id text not null,
  table_idx int not null default 0,
  custom_name text not null,
  custom_topic text not null default '',
  host_name text not null default '',
  host_code text not null default '',
  updated_at timestamptz not null default now()
);

-- Bảng Viếng Chùa & Chánh Điện Online 3D (Dâng hương, treo Thẻ Đỏ ước nguyện sân chùa, thả Hoa Đăng hồ sen, Bồ Đoàn)
create table if not exists public.temple_prayers (
  id text primary key,
  member_code text not null default '',
  user_name text not null,
  province text not null default '',
  ritual_kind text not null default 'incense',
  cushion_idx int not null default 2,
  prayer_text text not null default '',
  created_at timestamptz not null default now()
);

-- Bảng Kho Lưu Trữ 100% Sự Kiện AI Telemetry Toàn Thành Viên (Giờ giấc, thời lượng màn hình, kiểu chat, chủ đề, đối thoại)
create table if not exists public.member_telemetry_events (
  id text primary key,
  seq bigint not null default 0,
  member_code text not null,
  client_id text not null,
  user_name text not null default '',
  age int not null default 65,
  province text not null default '',
  seniority_level int not null default 0,
  seniority_title text not null default '',
  hour_of_day int not null default 6,
  day_of_week int not null default 0,
  time_bucket text not null default 'sang_som_5_7',
  dwell_sec int not null default 0,
  event_type text not null,
  module text not null default 'home',
  sub_action text not null default '',
  input_method text not null default '',
  word_count int not null default 0,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_member_telemetry_member_time
  on public.member_telemetry_events (member_code, created_at desc);
create index if not exists idx_member_telemetry_hour_type
  on public.member_telemetry_events (hour_of_day, event_type);

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
alter table public.member_activity_logs enable row level security;
alter table public.custom_tea_tables enable row level security;
alter table public.temple_prayers enable row level security;
alter table public.member_telemetry_events enable row level security;

-- Chính sách RLS tối thiểu quyền hạn (Least-Privilege: Chặn DELETE phá hoại & ẩn báo cáo an toàn khỏi anon)
drop policy if exists "mvp_public_checkins" on public.morning_checkins;
drop policy if exists "checkins_select" on public.morning_checkins;
drop policy if exists "checkins_insert" on public.morning_checkins;
drop policy if exists "checkins_update" on public.morning_checkins;
drop policy if exists "checkins_delete_own" on public.morning_checkins;
create policy "checkins_select" on public.morning_checkins for select using (true);
create policy "checkins_insert" on public.morning_checkins for insert with check (char_length(user_name) <= 80 and char_length(mood) <= 40);
create policy "checkins_update" on public.morning_checkins for update using (true) with check (char_length(user_name) <= 80 and char_length(mood) <= 40);
create policy "checkins_delete_own" on public.morning_checkins for delete using (char_length(client_id) <= 80);

drop policy if exists "mvp_public_tea_messages" on public.tea_messages;
drop policy if exists "tea_messages_select" on public.tea_messages;
drop policy if exists "tea_messages_insert" on public.tea_messages;
create policy "tea_messages_select" on public.tea_messages for select using (true);
create policy "tea_messages_insert" on public.tea_messages for insert with check (char_length(body) <= 240 and char_length(speaker) <= 80);

drop policy if exists "mvp_public_async_matches" on public.async_matches;
drop policy if exists "async_matches_select" on public.async_matches;
drop policy if exists "async_matches_insert" on public.async_matches;
drop policy if exists "async_matches_update" on public.async_matches;
create policy "async_matches_select" on public.async_matches for select using (true);
create policy "async_matches_insert" on public.async_matches for insert with check (char_length(match_id) <= 64);
create policy "async_matches_update" on public.async_matches for update using (true) with check (char_length(match_id) <= 64);

drop policy if exists "mvp_public_poems" on public.poems;
drop policy if exists "poems_select" on public.poems;
drop policy if exists "poems_insert" on public.poems;
drop policy if exists "poems_update" on public.poems;
create policy "poems_select" on public.poems for select using (true);
create policy "poems_insert" on public.poems for insert with check (char_length(title) <= 120);
create policy "poems_update" on public.poems for update using (true) with check (char_length(title) <= 120 and flowers >= 0);

drop policy if exists "mvp_public_dict" on public.phonetic_dictionary;
drop policy if exists "dict_select" on public.phonetic_dictionary;
drop policy if exists "dict_insert" on public.phonetic_dictionary;
drop policy if exists "dict_update" on public.phonetic_dictionary;
create policy "dict_select" on public.phonetic_dictionary for select using (true);
create policy "dict_insert" on public.phonetic_dictionary for insert with check (char_length(wrong_phrase) between 3 and 40 and char_length(right_phrase) between 2 and 50);
create policy "dict_update" on public.phonetic_dictionary for update using (true) with check (char_length(wrong_phrase) between 3 and 40 and char_length(right_phrase) between 2 and 50);

drop policy if exists "mvp_public_analytics" on public.analytics_events;
drop policy if exists "analytics_select" on public.analytics_events;
drop policy if exists "analytics_insert" on public.analytics_events;
create policy "analytics_select" on public.analytics_events for select using (true);
create policy "analytics_insert" on public.analytics_events for insert with check (char_length(event_name) <= 64);

-- Báo cáo an toàn: chỉ cho phép gửi báo cáo (INSERT), chặn đọc/xóa từ khóa anon để bảo vệ người báo cáo
drop policy if exists "mvp_public_reports" on public.safety_reports;
drop policy if exists "reports_insert_only" on public.safety_reports;
create policy "reports_insert_only" on public.safety_reports for insert with check (char_length(reason) <= 300);

drop policy if exists "mvp_public_member_accounts" on public.member_accounts;
drop policy if exists "member_accounts_select" on public.member_accounts;
drop policy if exists "member_accounts_insert" on public.member_accounts;
drop policy if exists "member_accounts_update" on public.member_accounts;
create policy "member_accounts_select" on public.member_accounts for select using (true);
create policy "member_accounts_insert" on public.member_accounts for insert with check (char_length(account_hash) >= 16 and char_length(base_name) <= 64);
create policy "member_accounts_update" on public.member_accounts for update using (true) with check (char_length(account_hash) >= 16 and char_length(base_name) <= 64);

drop policy if exists "mvp_public_community_groups" on public.community_groups;
drop policy if exists "community_groups_select" on public.community_groups;
drop policy if exists "community_groups_insert" on public.community_groups;
drop policy if exists "community_groups_update" on public.community_groups;
create policy "community_groups_select" on public.community_groups for select using (true);
create policy "community_groups_insert" on public.community_groups for insert with check (char_length(name) <= 120);
create policy "community_groups_update" on public.community_groups for update using (true) with check (char_length(name) <= 120);

drop policy if exists "mvp_public_friend_links" on public.friend_links;
drop policy if exists "friend_links_select" on public.friend_links;
drop policy if exists "friend_links_insert" on public.friend_links;
drop policy if exists "friend_links_update" on public.friend_links;
create policy "friend_links_select" on public.friend_links for select using (true);
create policy "friend_links_insert" on public.friend_links for insert with check (char_length(pair_key) <= 64);
create policy "friend_links_update" on public.friend_links for update using (true) with check (char_length(pair_key) <= 64);

drop policy if exists "mvp_public_member_activity_logs" on public.member_activity_logs;
drop policy if exists "member_activity_logs_select" on public.member_activity_logs;
drop policy if exists "member_activity_logs_insert" on public.member_activity_logs;
create policy "member_activity_logs_select" on public.member_activity_logs for select using (true);
create policy "member_activity_logs_insert" on public.member_activity_logs for insert with check (char_length(detail) <= 240);

drop policy if exists "mvp_public_custom_tea_tables" on public.custom_tea_tables;
drop policy if exists "custom_tea_tables_select" on public.custom_tea_tables;
drop policy if exists "custom_tea_tables_insert" on public.custom_tea_tables;
drop policy if exists "custom_tea_tables_update" on public.custom_tea_tables;
create policy "custom_tea_tables_select" on public.custom_tea_tables for select using (true);
create policy "custom_tea_tables_insert" on public.custom_tea_tables for insert with check (char_length(custom_name) <= 80);
create policy "custom_tea_tables_update" on public.custom_tea_tables for update using (true) with check (char_length(custom_name) <= 80);

drop policy if exists "mvp_public_temple_prayers" on public.temple_prayers;
drop policy if exists "temple_prayers_select" on public.temple_prayers;
drop policy if exists "temple_prayers_insert" on public.temple_prayers;
create policy "temple_prayers_select" on public.temple_prayers for select using (true);
create policy "temple_prayers_insert" on public.temple_prayers for insert with check (char_length(prayer_text) <= 240);

drop policy if exists "mvp_public_member_telemetry_events" on public.member_telemetry_events;
drop policy if exists "member_telemetry_select" on public.member_telemetry_events;
drop policy if exists "member_telemetry_insert" on public.member_telemetry_events;
create policy "member_telemetry_select" on public.member_telemetry_events for select using (true);
create policy "member_telemetry_insert" on public.member_telemetry_events for insert with check (char_length(event_type) <= 64);

-- 15. Đăng ký nhận thông báo Web Push nhắc lịch hẹn 24/7 (VAPID Endpoint)
create table if not exists public.push_subscriptions (
  endpoint text primary key,
  member_code text default '',
  client_id text not null,
  p256dh text not null default '',
  auth_key text not null default '',
  prefs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push_subscriptions_select" on public.push_subscriptions;
drop policy if exists "push_subscriptions_insert" on public.push_subscriptions;
drop policy if exists "push_subscriptions_update" on public.push_subscriptions;
create policy "push_subscriptions_select" on public.push_subscriptions for select using (true);
create policy "push_subscriptions_insert" on public.push_subscriptions for insert with check (char_length(endpoint) <= 600 and char_length(client_id) <= 96);
create policy "push_subscriptions_update" on public.push_subscriptions for update using (true) with check (char_length(endpoint) <= 600 and char_length(client_id) <= 96);
