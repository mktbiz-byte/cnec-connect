-- Phase 3: 랭킹 · AI 리스트업 · DM 큐

-- 월별 TOP 100 랭킹
CREATE TABLE IF NOT EXISTS discovery_rankings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region      text NOT NULL DEFAULT 'korea',
  platform    text NOT NULL DEFAULT 'instagram',
  month       text NOT NULL,
  rank        integer NOT NULL,
  creator_key text NOT NULL,
  handle      text,
  name        text,
  followers   integer,
  er          numeric(5,2),
  score       numeric(10,2),
  prev_rank   integer,
  is_new      boolean NOT NULL DEFAULT false,
  computed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(region, platform, month, rank)
);
CREATE INDEX IF NOT EXISTS idx_rankings_month ON discovery_rankings(month, region, platform);

-- AI 리스트업 로그
CREATE TABLE IF NOT EXISTS discovery_ai_listup (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt       text NOT NULL,
  model        text NOT NULL DEFAULT 'gemini-2.0-flash',
  result_json  jsonb,
  result_count integer,
  tokens_used  integer,
  status       text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','processing','completed','failed')),
  error        text,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_listup_user ON discovery_ai_listup(user_id, created_at DESC);

-- DM 발송 큐 (수동 보조 모드 — TOS 리스크 안내)
CREATE TABLE IF NOT EXISTS discovery_dm_queue (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  creator_user_id      uuid REFERENCES users(id),
  imported_creator_id  uuid REFERENCES imported_creators(id),
  platform             text NOT NULL DEFAULT 'instagram',
  handle               text NOT NULL,
  message              text NOT NULL,
  campaign_id          uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  status               text NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft','ready','sent_manual','failed','cancelled')),
  sent_at              timestamptz,
  note                 text,
  created_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dm_queue_status ON discovery_dm_queue(status);
