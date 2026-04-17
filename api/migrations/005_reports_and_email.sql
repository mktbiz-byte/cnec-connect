-- 9탭 크리에이터 리포트 (JSONB 스냅샷, 7일 TTL)
CREATE TABLE IF NOT EXISTS discovery_creator_reports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_key   text NOT NULL,
  report_json   jsonb NOT NULL,
  generated_by  uuid REFERENCES users(id) ON DELETE SET NULL,
  credits_used  integer NOT NULL DEFAULT 1,
  generated_at  timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reports_key ON discovery_creator_reports(creator_key);
CREATE INDEX IF NOT EXISTS idx_reports_expires ON discovery_creator_reports(expires_at);

-- creator_profiles 에 오디언스 분포 컬럼 추가
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS audience_gender jsonb;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS audience_age jsonb;
ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS audience_country jsonb;

-- 이메일 발송 로그
CREATE TABLE IF NOT EXISTS discovery_email_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id   uuid REFERENCES discovery_proposals(id) ON DELETE SET NULL,
  to_email      text NOT NULL,
  subject       text,
  body          text,
  provider      text NOT NULL,
  provider_id   text,
  status        text NOT NULL DEFAULT 'queued'
                CHECK (status IN ('queued', 'sent', 'failed', 'bounced', 'opened', 'clicked', 'replied')),
  error         text,
  sent_at       timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_email_log_proposal ON discovery_email_log(proposal_id);
CREATE INDEX IF NOT EXISTS idx_email_log_status ON discovery_email_log(status);
