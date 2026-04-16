-- CNEC Connect — initial schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text UNIQUE NOT NULL,
  password_hash   text NOT NULL,
  role            text NOT NULL CHECK (role IN ('creator', 'business', 'admin')),
  email_verified  boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- CREATOR PROFILES ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS creator_profiles (
  user_id           uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  handle            text UNIQUE NOT NULL,
  display_name      text NOT NULL,
  bio               text,
  avatar_url        text,
  cover_url         text,
  region            text,
  categories        text[] NOT NULL DEFAULT '{}',
  platforms         jsonb NOT NULL DEFAULT '[]'::jsonb,
  followers_total   integer NOT NULL DEFAULT 0,
  engagement_rate   numeric(5,2) NOT NULL DEFAULT 0,
  avg_views         integer NOT NULL DEFAULT 0,
  languages         text[] NOT NULL DEFAULT '{}',
  verified          boolean NOT NULL DEFAULT false,
  onboarded         boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_creator_region ON creator_profiles(region);
CREATE INDEX IF NOT EXISTS idx_creator_followers ON creator_profiles(followers_total DESC);

-- BUSINESS PROFILES --------------------------------------------------------
CREATE TABLE IF NOT EXISTS business_profiles (
  user_id           uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company_name      text NOT NULL,
  business_number   text,
  contact_name      text NOT NULL,
  phone             text,
  industry          text,
  website           text,
  logo_url          text,
  verified          boolean NOT NULL DEFAULT false,
  onboarded         boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- CAMPAIGNS ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS campaigns (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text NOT NULL,
  category        text NOT NULL,
  brand_name      text,
  cover_url       text,
  budget_min      integer NOT NULL DEFAULT 0,
  budget_max      integer NOT NULL DEFAULT 0,
  currency        text NOT NULL DEFAULT 'KRW',
  deliverables    jsonb NOT NULL DEFAULT '[]'::jsonb,
  requirements    text,
  platforms       text[] NOT NULL DEFAULT '{}',
  regions         text[] NOT NULL DEFAULT '{}',
  start_date      date,
  end_date        date,
  apply_deadline  date,
  recruit_count   integer NOT NULL DEFAULT 1,
  status          text NOT NULL DEFAULT 'recruiting'
                  CHECK (status IN ('draft', 'recruiting', 'in_progress', 'completed', 'closed')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_business ON campaigns(business_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);

-- CAMPAIGN APPLICATIONS ----------------------------------------------------
CREATE TABLE IF NOT EXISTS campaign_applications (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id      uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message          text,
  proposed_budget  integer,
  portfolio_urls   text[] NOT NULL DEFAULT '{}',
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  applied_at       timestamptz NOT NULL DEFAULT now(),
  decided_at       timestamptz,
  UNIQUE(campaign_id, creator_id)
);
CREATE INDEX IF NOT EXISTS idx_applications_campaign ON campaign_applications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_applications_creator ON campaign_applications(creator_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON campaign_applications(status);

-- MESSAGE THREADS ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS message_threads (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id      uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  business_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at  timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, business_id, creator_id)
);
CREATE INDEX IF NOT EXISTS idx_threads_business ON message_threads(business_id);
CREATE INDEX IF NOT EXISTS idx_threads_creator ON message_threads(creator_id);

-- MESSAGES -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id    uuid NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
  sender_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body         text NOT NULL,
  attachments  jsonb NOT NULL DEFAULT '[]'::jsonb,
  read_at      timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id, created_at);

-- PAYMENTS -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id        uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  application_id     uuid NOT NULL REFERENCES campaign_applications(id) ON DELETE CASCADE,
  amount             integer NOT NULL,
  currency           text NOT NULL DEFAULT 'KRW',
  status             text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'paid', 'released', 'refunded', 'failed')),
  provider           text NOT NULL DEFAULT 'mock',
  provider_txn_id    text,
  escrow_held_at     timestamptz,
  released_at        timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_campaign ON payments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- CONTENT POSTS ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_posts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id    uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform       text NOT NULL,
  post_url       text NOT NULL,
  thumbnail_url  text,
  views          integer NOT NULL DEFAULT 0,
  likes          integer NOT NULL DEFAULT 0,
  comments       integer NOT NULL DEFAULT 0,
  shares         integer NOT NULL DEFAULT 0,
  approved       boolean NOT NULL DEFAULT false,
  tracked_at     timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_content_campaign ON content_posts(campaign_id);

-- NOTIFICATIONS ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        text NOT NULL,
  title       text NOT NULL,
  body        text,
  link        text,
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);

-- MIGRATIONS TRACKING ------------------------------------------------------
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename    text PRIMARY KEY,
  applied_at  timestamptz NOT NULL DEFAULT now()
);
