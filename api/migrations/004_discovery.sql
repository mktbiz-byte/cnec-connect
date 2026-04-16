-- Discovery (인플루언서 발굴·검색·제안·캠페인 활성화)
-- 기존 creator_profiles + imported_creators 를 재사용. 여기선 "조직화·제안" 테이블만 추가.

-- 그룹 (관리자·기업이 크리에이터를 묶어서 관리)
CREATE TABLE IF NOT EXISTS discovery_groups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text,
  shared      boolean NOT NULL DEFAULT false,
  platform    text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_discovery_groups_owner ON discovery_groups(owner_id);

-- 그룹 멤버 (creator_profiles 또는 imported_creators 중 하나 참조)
CREATE TABLE IF NOT EXISTS discovery_group_members (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id             uuid NOT NULL REFERENCES discovery_groups(id) ON DELETE CASCADE,
  creator_user_id      uuid REFERENCES users(id) ON DELETE CASCADE,
  imported_creator_id  uuid REFERENCES imported_creators(id) ON DELETE CASCADE,
  note                 text,
  tags                 text[] NOT NULL DEFAULT '{}',
  added_at             timestamptz NOT NULL DEFAULT now(),
  CHECK (creator_user_id IS NOT NULL OR imported_creator_id IS NOT NULL)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_dgm_unique_registered ON discovery_group_members(group_id, creator_user_id) WHERE creator_user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_dgm_unique_imported ON discovery_group_members(group_id, imported_creator_id) WHERE imported_creator_id IS NOT NULL;

-- 제안 (캠페인 참여 제안)
CREATE TABLE IF NOT EXISTS discovery_proposals (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  campaign_id          uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  creator_user_id      uuid REFERENCES users(id) ON DELETE CASCADE,
  imported_creator_id  uuid REFERENCES imported_creators(id) ON DELETE CASCADE,
  channel              text NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app','email','dm')),
  subject              text,
  body                 text NOT NULL,
  proposed_budget      integer,
  status               text NOT NULL DEFAULT 'draft'
                       CHECK (status IN ('draft','sent','accepted','declined','expired','cancelled')),
  sent_at              timestamptz,
  responded_at         timestamptz,
  fail_reason          text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CHECK (creator_user_id IS NOT NULL OR imported_creator_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_proposals_creator ON discovery_proposals(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_campaign ON discovery_proposals(campaign_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON discovery_proposals(status);
