# CNEC Connect

> 피처링(featuring.co) × CNEC — 업그레이드된 올인원 인플루언서 마케팅 플랫폼 (테스트 사이트, 실제 운영 가능한 수준)

크리에이터와 브랜드 각각을 위한 계정·대시보드를 제공하고, 캠페인 지원부터 메시지·결제·콘텐츠 트래킹까지 한 플랫폼에서 처리합니다.

- **Frontend**: React 19 + Vite 6 + Tailwind 4 + React Router 7 (Vercel 배포)
- **Backend**: Node 20 + Express 4 + PostgreSQL (Railway 배포)
- **Auth**: JWT access + httpOnly cookie refresh, 역할(creator / business) 기반 가드
- **Payments**: Stripe 테스트 키 (옵션) · `PAYMENT_PROVIDER=mock`으로 대체 가능

## 레포 구조

```
cnec-connect/
├── src/                 # 프론트엔드 (Vite React)
│   ├── components/      # UI · landing 섹션
│   ├── pages/           # public · auth · creator · business
│   ├── layouts/         # PublicLayout · AuthLayout · AppLayout
│   ├── context/         # AuthContext
│   └── lib/             # api 클라이언트
├── api/                 # 백엔드 (Express)
│   ├── src/             # routes · middleware · lib
│   ├── migrations/      # SQL 마이그레이션
│   ├── scripts/         # migrate.js · seed.js
│   ├── railway.json
│   └── package.json
├── vite.config.js
├── vercel.json
└── package.json
```

---

## 로컬 개발

### 사전 준비
- Node.js 20 이상
- PostgreSQL 14 이상 (로컬 Postgres 또는 Railway DB URL 사용)

### 1) 백엔드 실행

```bash
cd api
cp .env.example .env
# .env 파일에서 DATABASE_URL, JWT_SECRET 등을 실제 값으로 채워주세요

npm install
npm run migrate       # 스키마 생성
npm run seed          # 데모 데이터 주입
npm run dev           # http://localhost:4000
```

### 2) 프론트엔드 실행

```bash
# 프로젝트 루트에서
cp .env.example .env.local   # 필요 시 수정
npm install
npm run dev                  # http://localhost:5173
```

### 3) 데모 계정

Seed 완료 시 아래 계정으로 바로 로그인할 수 있습니다.

| 역할 | 이메일 | 비밀번호 |
| --- | --- | --- |
| 브랜드 | `brand@demo.cnec.co` | `demo1234!` |
| 크리에이터 | `creator@demo.cnec.co` | `demo1234!` |
| 기타 크리에이터 | `sora@demo.cnec.co` 외 7명 | `demo1234!` |

---

## 배포 — Railway (API + DB)

1. [Railway](https://railway.com) 로그인 → **New Project → Deploy from GitHub**
2. 이 저장소 선택 후 서비스 생성
3. 서비스 설정 → **Root Directory**: `api`
4. 서비스에 **Add Plugin → PostgreSQL** (자동으로 `DATABASE_URL` 주입)
5. 서비스 환경변수 추가:

   | 키 | 예시 값 |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | `openssl rand -hex 32` 결과 |
   | `JWT_REFRESH_SECRET` | `openssl rand -hex 32` 결과 |
   | `CORS_ORIGIN` | `https://<vercel-domain>` (복수는 쉼표) |
   | `COOKIE_SECURE` | `true` |
   | `PAYMENT_PROVIDER` | `mock` (Stripe 연동 전까지) |
   | `STRIPE_SECRET_KEY` | `sk_test_...` (선택) |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_...` (선택) |

6. 첫 배포 시 `railway.json`에 정의된 `npm run migrate && npm run start`가 자동 실행됩니다.
7. 배포 후 할당된 공개 도메인(예: `https://cnec-api-production.up.railway.app`)을 복사해두세요.
8. 최초 1회 Seed 주입 — Railway Shell 혹은 로컬에서 `DATABASE_URL`을 Railway 값으로 설정한 뒤 `npm --prefix api run seed`를 실행.

## 배포 — Vercel (프론트)

1. [Vercel](https://vercel.com) → **Add New → Project** → 이 저장소 선택
2. Framework: **Vite** (자동 감지)
3. 환경변수:

   | 키 | 값 |
   | --- | --- |
   | `VITE_API_BASE_URL` | Railway에서 복사한 API URL |

4. 배포 완료 후 할당된 도메인을 Railway의 `CORS_ORIGIN`에 추가하고 재배포하세요.

### Stripe 연동 (선택)

1. Stripe 대시보드(Test mode)에서 `sk_test_...`, `pk_test_...` 발급
2. Railway 환경변수에 `STRIPE_SECRET_KEY`, `PAYMENT_PROVIDER=stripe` 설정
3. Stripe Webhooks → Endpoint 추가: `https://<railway-domain>/api/webhooks/stripe`
   이벤트: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.captured`
4. Signing Secret을 `STRIPE_WEBHOOK_SECRET`에 저장
> 국내 PG(Toss) 연동은 `api/src/lib/payments/`에 어댑터를 추가하면 됩니다 (Step C 단계에서 제공 예정).

---

## 현재 구현된 기능 (Step A + B + C — 배포 가능)

**크리에이터**
- 3-step 회원가입 / 로그인
- 대시보드 (지원 현황 + 추천 캠페인)
- 프로필 편집 (카테고리·지역·플랫폼)
- 캠페인 탐색 및 1-클릭 지원
- 내 지원 현황 조회
- **메시지** (확정된 브랜드와 1:1 채팅, 5초 폴링)
- **콘텐츠 제출** (게시물 URL + 성과 지표)
- **수익·정산** (에스크로 보관액 + 정산 완료액)
- **알림 센터** (종 아이콘, 30초 폴링)

**브랜드**
- 3-step 회원가입 / 로그인
- 대시보드 (캠페인 요약)
- 4-step 캠페인 마법사 (기본 / 예산 / 플랫폼·일정 / 검토·발행)
- 캠페인 목록 · 상세
- 지원자 확정 / 거절 (확정 시 메시지 스레드 자동 생성)
- 크리에이터 탐색
- **메시지** (확정된 크리에이터와 1:1 채팅)
- **결제·정산** (에스크로 결제 생성 → 릴리즈, Stripe/mock 스위치)
- **분석·리포트** (콘텐츠 승인, 조회수 추이, 캠페인별 집계 차트)
- **알림 센터**

**공개 페이지**
- featuring.co 스타일 랜딩 (Hero · Stats · Pillars · Dual CTA · Testimonials · CTA Band)
- 가격 / 서비스 소개
- 공개 크리에이터 탐색 · 공개 프로필
- 공개 캠페인 상세 · 지원

## 향후 확장

- WebSocket 실시간 메시지 (현재는 폴링)
- 국내 PG(Toss) 결제 어댑터
- 이메일·SMS 발송 (nodemailer + 전송 이벤트)
- 관리자 콘솔
- OAuth 플랫폼 연동 (Instagram / YouTube / TikTok)

## API 개요

- `POST /api/auth/signup/creator | signup/business | login | refresh | logout`
- `GET  /api/me`
- `GET  /api/creators` (public, 필터 쿼리 지원)
- `GET  /api/creators/:handle` (public)
- `PATCH /api/creators/me` (role: creator)
- `GET  /api/campaigns` (mine=true 지원)
- `GET  /api/campaigns/:id`
- `POST /api/campaigns` (role: business)
- `GET  /api/campaigns/:id/applications` (role: business — 본인 캠페인)
- `POST /api/applications` (role: creator)
- `GET  /api/applications/mine` (role: creator)
- `PATCH /api/applications/:id/decision` (role: business)
- `GET  /api/threads`, `GET /api/threads/:id`, `POST /api/threads/:id/messages`
- `POST /api/payments/intent` (role: business), `POST /api/payments/:id/release` (role: business)
- `GET  /api/payments/mine` (business), `GET /api/payments/earnings` (creator)
- `POST /api/content` (creator), `GET /api/content/mine` (creator)
- `GET  /api/content` (business), `PATCH /api/content/:id/approve` (business)
- `GET  /api/content/analytics/summary` (business)
- `GET  /api/notifications`, `POST /api/notifications/read-all`, `POST /api/notifications/:id/read`

## 라이선스

Private / All rights reserved © CNEC
