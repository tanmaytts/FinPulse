-- FinPulse database schema
-- Run this once against your Supabase project (SQL Editor) before starting the backend.
-- All statements are idempotent so re-running is safe.

-- companies: one row per stock ticker, holds static descriptive info that
-- rarely changes (company name, sector, industry, exchange).
create table if not exists companies (
  ticker    text primary key,
  name      text,
  sector    text,
  industry  text,
  exchange  text
);

-- fundamentals: latest market snapshot for each ticker, refreshed every 15
-- minutes by the scheduler. Separated from companies so we can update prices
-- frequently without touching the mostly-static company metadata.
create table if not exists fundamentals (
  ticker         text primary key references companies(ticker),
  price          numeric,
  market_cap     numeric,
  pe_ratio       numeric,
  eps            numeric,
  day_change_pct numeric,
  volume         bigint,
  week52_high    numeric,
  week52_low     numeric,
  updated_at     timestamptz default now()
);

-- price_history: one row per (ticker, trading day). Used for charts on the
-- front end. Populated once via "npm run ingest" and then left alone because
-- daily bars do not need frequent refreshing.
create table if not exists price_history (
  id      bigserial primary key,
  ticker  text references companies(ticker),
  date    date not null,
  open    numeric,
  high    numeric,
  low     numeric,
  close   numeric,
  volume  bigint,
  -- prevents duplicate bars if ingest is rerun
  unique (ticker, date)
);

-- Composite index so chart queries (filter by ticker, order by date) stay fast
-- even when price_history grows to hundreds of thousands of rows.
create index if not exists idx_price_history_ticker_date
  on price_history (ticker, date);

-- Supabase: grant the backend secret (service_role) access to these tables.
-- Needed because the project was created with "expose new tables" off, which
-- otherwise leaves the API roles without table privileges. The backend uses
-- the service_role key, so we grant it directly (public/anon stays restricted).
grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
