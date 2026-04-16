-- 인스타 주소 ↔ 폰/이메일 매칭을 위한 외부 임포트 테이블.
-- 예: 기존 CNEC Railway DB에서 옮겨올 크리에이터 연락처 데이터.
-- CNEC Connect 가입 시 creator_profiles.handle 또는 platforms jsonb와 매칭해
-- 같은 계정임을 자동으로 연결할 때 사용.

CREATE TABLE IF NOT EXISTS imported_creators (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source          text NOT NULL,
  source_id       text,
  instagram_handle text,
  instagram_url   text,
  email           text,
  phone           text,
  name            text,
  followers       integer,
  raw             jsonb,
  matched_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  matched_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_imported_ig ON imported_creators(LOWER(instagram_handle));
CREATE INDEX IF NOT EXISTS idx_imported_email ON imported_creators(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_imported_phone ON imported_creators(phone);
CREATE UNIQUE INDEX IF NOT EXISTS idx_imported_unique_source ON imported_creators(source, source_id) WHERE source_id IS NOT NULL;
