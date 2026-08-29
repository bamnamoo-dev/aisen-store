# AI-SEN STORE (아이센스토어) 개발 가이드 & 프로젝트 생태계 맵

본 문서는 **AI-SEN STORE(아이센스토어)** 메인 포털 및 연계된 교육행정 특화 프로그램, AI 챗봇, 실무 툴킷의 전체 구조와 로컬 폴더 경로, 배포 정보를 정리한 마스터 가이드입니다.

---

## 🏛️ 1. 메인 포털 개요 (`asisen-store`)

- **프로젝트명**: AI-SEN STORE (교육행정 통합 AI 포털)
- **로컬 경로**: `G:\내 드라이브\antigravity\asisen-store\`
- **GitHub**: `https://github.com/bamnamoo-dev/aisen-store.git`
- **주요 기술 스택**: Next.js 14/15 (App Router), React, TypeScript, Tailwind CSS, Supabase, Lucide React
- **역할**: 전국의 모든 교육행정 실무 도구, 102권 공식 지침서 서고, RAG 챗봇, 스마트 여비정산기, 소통 게시판을 원스톱으로 제공하는 통합 관제 허브

### 주요 라우트 구조
- `/` : 대형 스마트 검색 옴니바 + 12개 핵심 서비스/미니프로그램 인터랙티브 그리드 카드
- `/archive` : 28개 분야 102권 공식 지침서 스트리밍 서고
- `/tools` : 행정 미니프로그램 모음 및 관리자 등록/수정/삭제 포털
- `/board` : 회원가입 없이 4자리 암호로 질의/공유하는 실무 소통 게시판
- `/chatbot` : Gemini 기반 맞춤 챗봇 모음
- `/login` : 관리자 및 교직원 인증 로그인

---

## 🗺️ 2. 전체 연계 프로젝트 및 폴더 매핑 (`G:\내 드라이브\antigravity\`)

| 구분 | 서비스명 | 로컬 폴더 경로 | 배포 / 서비스 URL | 기술 스택 및 주요 기능 |
| :--- | :--- | :--- | :--- | :--- |
| **메인 허브** | **아이센스토어 메인** | `\asisen-store\` | `https://aisen.store` (Vercel) | Next.js, Supabase, 포털 관제 |
| **AI 챗봇** | **AI 행정 챗봇 (3-Tier)** | `\sen-chatbot\`<br/>`\sen-chatbot-v2\`<br/>`\(0610)sen-chatbot\` | `https://chatbot.aisen.store` | FastMCP, LangChain/RAG, 102권 서고 쪽수 1:1 앵커링, 국가법령정보센터 연동 |
| **특화 정산** | **스마트 여비정산기 v4.9.2** | `\sen-chatbot\travel\` (내장) | `https://chatbot.aisen.store/travel` | 카카오 3개 경유지 길찾기, 오피넷 실시간 유가 1일 6회 자동 고시, 19종 법정 감액, A4 1p 인쇄 |
| **서식 포털** | **행정·민원 서식 68종** | `\sen-chatbot\` (내장) | `https://chatbot.aisen.store?forms=1` | 인사/복무/계약 서식 실시간 미리보기 및 HWP 다운로드 |
| **미니툴 1** | **증빙서 측면표지 제작기** | `\asisen-store\app\tools\label-maker\` (내장) | `/tools/label-maker` | Next.js React + Print CSS, A4 바인더 측면 철 라벨 자동 생성 및 인쇄 |
| **미니툴 2** | **학교회계 대시보드 (SFD)** | `\서울특별시교육청학교정보대시보드\` | `https://bamnamoo-dev.github.io/SFD/` | 세부사업, 추경, 지출집행 모니터링 시각화 대시보드 |
| **미니툴 3** | **엑셀시트별 분리저장기** | `\asisen-store\app\tools\sheet-splitter\` (내장) | `/tools/sheet-splitter` | Next.js, SheetJS + JSZip 클라이언트 0초 시트 분리 및 ZIP 압축 |
| **미니툴 4** | **나이스 임금대장 식대분리기** | `\asisen-store\app\tools\sikdae\` (내장) | `/tools/sikdae` | Next.js, SheetJS 브라우저 메모리 안전 파싱, 성명-식대 추출 & 엑셀 저장 |
| **미니툴 5** | **교실배치도 제작기** | `\classmap\` | `https://bamnamoo-dev.github.io/classmap/` | Vanilla JS / Canvas, 층별·특별실 평면도 시각화 및 배치도 출력 |
| **미니툴 6** | **체육관 사용료 계산기** | `\asisen-store\app\tools\gym-calc\` (내장) | `/tools/gym-calc` | Next.js, 교육청 학교시설개방 조례 기준 대관 시간·냉난방비 자동 산출 및 견적서 출력 |
| **게임/부가** | **수박 게임** | `\watermelongame\` | `https://project-np0t7.vercel.app/` | Matter.js 물리엔진, 실시간 글로벌 랭킹 연동 과일 합치기 게임 |

---

## 🛠️ 3. 기타 유관 행정 도구 아카이브

- `\공사원가계산서검수프로그램\` : 학교 시설공사 원가계산서 요율 및 제비율 자동 검수
- `\교육행정스케줄러\` : 월별/분기별 필수 행정 업무 일정 관리
- `\인사발령검색\` / `\인사발령exe\` : 교육청 정기 인사발령 내역 검색 도구
- `\예산관리프로그램\` / `\예산정산프로그램\` : 학교회계 목적사업비 및 수익자부담경비 정산 도구

---

## 💾 4. 데이터베이스 및 인프라 (Supabase)

- **Supabase 환경변수**: `.env.local`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **주요 테이블**:
  - `tools` : 미니프로그램 목록 (id, title, description, url, category, icon_type)
  - `posts` / `comments` : 소통 게시판 익명 게시글 및 댓글 (password 해시 또는 4자리 핀)
  - `documents` / `guidelines` : 102권 서고 스트리밍 메타데이터

---

## 💡 5. 개발 및 UI/UX 디자인 원칙

1. **원스크린(One-Screen) 컴팩트 뷰포트**: 
   - 메인 화면(`app/page.tsx`)은 데스크톱 1080p 해상도에서 헤더와 12개 카드가 스크롤 없이 한눈에 들어오도록 최적화된 여백과 폰트 크기를 유지합니다.
2. **Glassmorphism & Crisp White Design**:
   - `glass-card`, `btn-primary`, `omnibar-input` 등 일관된 Tailwind 테마 클래스를 사용하여 세련된 화이트 톤의 완성도 높은 디자인을 제공합니다.
3. **지침서 1:1 동기화**:
   - 챗봇 및 서식 뷰어는 교육청 공식 지침서 원문의 쪽수와 조항을 1:1로 앵커링하여 신뢰성을 확보합니다.
