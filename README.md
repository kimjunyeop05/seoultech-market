# SeoulTech Market

캠퍼스 중고거래 웹앱. **Next.js(App Router) + Supabase(Auth/DB/Storage) + Vercel**로 구현했고,
로그인(매직링크), 물건 등록(이미지 업로드), 목록 검색/정렬, 상세/댓글을 제공합니다.

> 데모: [바로가기](seoultech-market-dl40ewe3w-kimjunyeop05s-projects.vercel.app)

---

## 1) 개요

- 로그인 후 물건을 등록(이미지 포함)하고, 목록에서 **검색 / 가격 정렬(↑/↓) / 최신순**을 제공합니다.
- 상세 페이지에서 설명/이미지/댓글을 확인하고 **로그인한 사용자 누구나 댓글**을 작성할 수 있습니다.
- Supabase의 **Auth / Postgres / Storage**, 공개 URL을 활용한 이미지 표시, RLS 정책으로 보안 제어.

> 스크린샷(홈)  
> <img width="1919" height="980" alt="첫화면" src="https://github.com/user-attachments/assets/a54e4f2b-97ab-46be-98f2-ec3cbd4ef651" />


---

## 2) 데모(배포)

- Vercel 프로덕션:  
  https://seoultech-market-5iae-k8g29ipj2-kimjunyeop05s-projects.vercel.app
- 로그인: 이메일 매직링크(자체 테스트용 본인 이메일 사용)

---

## 3) 주요 기능

- **목록/검색/정렬**: 제목 검색, 가격↑/가격↓, 최신순
- ![목록검색](https://github.com/user-attachments/assets/bfb0c701-9d24-40a8-8ac7-4db35690dbbd)

- **물건 등록**: 이미지 업로드(Storage) → `image_path` 저장
- <img width="1904" height="724" alt="물건등록" src="https://github.com/user-attachments/assets/adba79fe-344e-4a56-867f-6c3f2a21f3dc" />

- **상세 페이지**: 제목/가격/설명/등록일/이미지 표시
- **댓글**: 로그인 사용자가 글에 댓글 작성
- 로그인 전
- <img width="927" height="826" alt="상세페이지댓글" src="https://github.com/user-attachments/assets/4f4c9353-8c23-4547-82e7-3fcf23528e17" />
- 로그인 후
<img width="1389" height="818" alt="로그인 후 화면" src="https://github.com/user-attachments/assets/e0471b6b-48dc-4c79-b35e-4dc5e38b4ef4" />

- **인증**: Supabase GoTrue(매직링크)
- <img width="1536" height="683" alt="로그인화면" src="https://github.com/user-attachments/assets/0e3c2a59-810e-4b31-bbf0-f326edfe21f5" />

---

## 4) 기술 스택

- **Frontend**: Next.js 16(App Router), TypeScript, Tailwind CSS
- **Backend as a Service**: Supabase (Auth / Postgres / Storage)
- **Infra**: Vercel (CI/CD, 배포)
- **Lint/Format**: ESLint / Prettier (선택)

---

## 5) 구조

### 흐름
1. 클라이언트에서 Supabase Auth로 로그인(매직링크).
2. 등록 시 이미지는 Storage에 업로드, 경로(`image_path`)는 DB `items`에 저장.
3. 목록/상세에서 `getPublicUrl`로 이미지 URL 생성 후 표시.
4. 댓글은 `comments` 테이블에 저장/조회.

### 폴더 트리(요약)
```
src/
  app/
    page.tsx                # 목록/검색/정렬
    sell/page.tsx           # 등록 폼(이미지 업로드)
    items/[id]/page.tsx     # 상세 (서버 컴포넌트 + 클라 컴포넌트)
    auth/page.tsx
    me/page.tsx
    layout.tsx
  components/
    AuthCallback.tsx        # 해시/코드 기반 인증 콜백 처리
    ItemDetailClient.tsx    # 상세/댓글 로직(클라)
  lib/
    supabaseClient.ts
docs/
  hero.png
  ...
```

---

## 6) DB 스키마(요약)

- **items**
  - `id (uuid, pk)`, `seller_id (uuid, not null)`, `title (text)`,  
    `price (int)`, `description (text)`, `image_path (text)`, `created_at (timestamptz default now())`
- **comments**
  - `id (uuid, pk)`, `item_id (uuid, fk)`, `author_id (uuid, not null)`,  
    `author_email (text)`, `content (text)`, `created_at (timestamptz default now())`
<img width="1905" height="360" alt="table" src="https://github.com/user-attachments/assets/141212fa-0ba1-4b3f-8e04-3489d2cf0ae6" />

---

## 7) 보안 정책(RLS/Storage)

- **items**
  - `select`: 모두 허용(데모 목적)
  - `insert`: `auth.uid() = seller_id` (본인 소유만 등록)
- **comments**
  - `select`: 모두 허용
  - `insert`: `auth.uid()`인 사용자만
- **Storage (`item-images` 버킷)**
  - 업로드: `authenticated`
  - 읽기: `public` (목록/상세 이미지 표시)

---

## 8) 환경 변수

루트에 `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```
Vercel 설정: Project → **Settings → Environment Variables** 에 동일 값 등록  

---

## 9) 실행 & 배포

```bash
# install
npm i

# dev
npm run dev

# build
npm run build

```

- GitHub 연결 시 Vercel이 자동 배포(Production/Preview)

- 배포 이력은 Vercel Deployments에서 확인

---

## 10) 구현 상세

- **AuthCallback.tsx**  

  매직링크 리다이렉트 후 URL 해시/쿼리에서 세션 교환 → Supabase 클라이언트에 세션 저장.

- **이미지 업로드(sell/page.tsx)**  

  `storage.upload(path, file)` → 에러 처리 → 성공 시 DB `items`에 `image_path` 저장.

- **상세/댓글(ItemDetailClient.tsx)**  

  `items`에서 항목 조회, `comments`에서 댓글 목록 → 로그인 상태면 입력 가능, `insert` 후 목록 갱신.

- **검색/정렬(page.tsx)**  

  제목 기반 클라이언트 필터 + Supabase `order`로 가격/생성일 정렬.
---
## 11) 추가적인 목표

- [ ] 내 물건 관리(수정/삭제)
- [ ] 즐겨찾기, 판매자 프로필
- [ ] 이미지 최적화(썸네일/Blur), 무한 스크롤
- [ ] E2E 테스트(Playwright), 접근성/성능 개선

---

## 12) 라이선스

MIT

---

## 13) 참고

- Next.js App Router Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
