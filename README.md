# CNEC TW — 크리에이터 탐색 + 제안 테스트 사이트

CNEC + 피처링 하이브리드 시스템 1차 프로토타입

## 구현된 페이지

| 페이지 | 경로 | 피처링 대응 | 상태 |
|--------|------|-----------|------|
| 대시보드 | `/` | 대시보드 | ✅ 완료 |
| 크리에이터 찾기 | `/creators/search` | 인플루언서 찾기 | ✅ 완료 |
| 크리에이터 프로필 | `/creators/:id` | 인플루언서 리포트 | ✅ 완료 (핵심지표/콘텐츠/ROAS) |
| 크리에이터 관리 | `/creators/manage` | 인플루언서 관리 | ✅ 완료 |
| 캠페인 관리 | `/campaigns` | 캠페인 관리 | ✅ 완료 |
| DM/이메일 발송 | `/outreach` | DM/이메일 발송 | ✅ 완료 |
| 크리에이터 랭킹 | `/creators/ranking` | 인플루언서 랭킹 | 🔲 Placeholder |
| AI 리스트업 | `/creators/ai` | AI 리스트업 | 🔲 Placeholder |
| 콘텐츠 라이브러리 | `/content/library` | 콘텐츠 라이브러리 | 🔲 Placeholder |
| 콘텐츠 트래킹 | `/content/tracking` | 콘텐츠 트래킹 | 🔲 Placeholder |

## 기술 스택

- React 19 + Vite 6 + Tailwind CSS 4
- React Router 7
- lucide-react (아이콘)
- recharts (차트 — 향후)

## 배포

### Vercel
```bash
git push origin main
# Vercel 대시보드에서 cnectw 레포 연결 → 자동 배포
```

### 로컬 개발
```bash
npm install
npm run dev
```

## 다음 단계

1. Railway API 서버 연결 (크리에이터 DB + 인증)
2. Apify 1회 대량 수집 → discoverable_creators 테이블
3. Meta Business Discovery API 연동
4. 구독제 포인트 시스템 (DM/알림톡 과금)
5. AI 리스트업 (Gemini 연동)
