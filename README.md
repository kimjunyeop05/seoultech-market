# SeoulTech Market (Campus Marketplace)

> Next.js + Supabase로 만든 캠퍼스 중고거래 웹앱  
> 데모(프로덕션): https://<your-vercel-domain>.vercel.app

---

## 📌 프로젝트 개요

- **목표**: 학내/소규모 커뮤니티용 중고거래 서비스를 단기간에 구현
- **핵심 기능**
  - 이메일 매직링크 기반 로그인
  - 물건 등록(제목/가격/설명/이미지)
  - 목록 조회 + 검색(제목) + 정렬(최신/가격↑/가격↓)
  - 상세 페이지(이미지/설명/등록일) + 댓글(작성자 이메일 표시)
  - 작성자 본인에 한해 **수정/삭제**, **거래완료(is_sold) 토글**
- **배포**: Vercel
- **DB/스토리지/인증**: Supabase

---

## 🧱 기술 스택

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind
- **Auth/DB/Storage**: Supabase (PostgreSQL, Auth, Storage)
- **Deploy**: Vercel

---

## 🗂️ 디렉터리(주요)
src/
app/
page.tsx # 목록/검색/정렬/등록 버튼
sell/page.tsx # 물건 등록 페이지(이미지 업로드 + DB insert)
items/[id]/
page.tsx # 서버 래퍼(라우팅 params 전달)
ItemDetailClient.tsx # 상세/댓글/수정/삭제/거래완료 UI/로직
lib/
supabaseClient.ts # createClient 1회 생성
public/
## 🔐 환경 변수

Vercel **Project Settings → Environment Variables** 또는 로컬 `.env.local`

