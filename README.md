# 🏛️ AI-SEN STORE (아이센스토어)
> **교육행정의 모든 기준과 계산, AI-SEN 포털**
> 
> 공식 서비스 URL: [https://aisen.store](https://aisen.store)

---

## 📖 프로젝트 개요

**AI-SEN STORE**는 전국의 모든 초·중·고등학교 및 교육행정 실무자들을 위해 **102권 공식 지침서 기반 RAG AI 챗봇**, **스마트 여비정산기**, **행정 민원 서식 서고**, 그리고 **6대 실무 자동화 툴킷**을 원스톱으로 제공하는 통합 교육행정 관제 포털입니다.

---

## 🌟 주요 서비스 및 툴킷 구성 (14개 핵심 서비스)

### 1. 🤖 AI & 특화 정산 솔루션
- **AI 행정 챗봇 (3-Tier)**: 102권 공식 지침서 1:1 쪽수 앵커링 뷰어 및 국가법령정보센터 실시간 연동
- **스마트 공사원가 감사관 (`/tools/cost-audit`)**: 조달청 2026 간접공사비 100% 역산 감사, 30일 미만 건강/연금 부당계상 0원 강제 차단, 3중 파서(엑셀/PDF/Gemini 3.5 Flash-Lite 비전) 지원
- **스마트 여비정산기 v4.9.2**: 카카오 3개 경유지 길찾기 및 오피넷 실시간 유가 1일 6회 자동 고시 연동 산출
- **행정·민원 서식 68종**: 인사/복무/계약 서식 실시간 미리보기 및 HWP 다운로드
- **학교회계 대시보드 (SFD)**: 세부사업, 추경, 지출집행 모니터링 시각화
- **예산정산 대시보드 (K-Edu, `/tools/budget-settle`)**: 급식비·수익자부담·목적사업비 세입세출 실시간 정산 및 잔액 분석

### 2. 🏛️ 포털 공식 서고 & 커뮤니티
- **행정 자료실 (`/archive`)**: 28개 분야 102권 공식 지침서 스트리밍 서고
- **소통 게시판 (`/board`)**: 가입 없이 4자리 암호로 자유로운 실무 질의 및 서식 공유

### 3. ⚡ 0초 초고속 실무 툴킷 (100% 브라우저 내장)
- **나이스 임금대장 식대분리기 (`/tools/sikdae`)**: 급여대장 B열(성명), D열(식대) 0.1초 고정밀 추출 & 엑셀 저장
- **엑셀시트별 분리저장기 (`/tools/sheet-splitter`)**: 대용량 엑셀 탭별 단일 파일 분할 & ZIP 압축 다운로드
- **증빙서 측면표지 제작기 (`/tools/label-maker`)**: 지출증빙서 바인더 너비(cm)별 척추 라벨 자동 생성 & A4 실측 인쇄
- **체육관 사용료 계산기 (`/tools/gym-calc`)**: 서울시 학교시설개방 조례 기준 대관료·냉난방비 자동 산출 및 견적서 출력
- **스마트 교실배치도 제작기 (`/tools/classmap`)**: 층별·호수별 평면도 시각화, 교실 편집, JSON 백업 & A4 도면 인쇄
- **행정 힐링 수박 게임 (`/tools/watermelon`)**: Matter.js 물리엔진 기반 과일 합치기 게임, 실시간 랭킹 Top 10, 보스키(`) 위장 탑재

---

## 🛠️ 기술 스택 (Tech Stack)

- **Framework**: Next.js 14/15 (App Router), React 18/19, TypeScript
- **Styling**: Tailwind CSS, Glassmorphism UI
- **AI & Libraries**: `Gemini 3.5 Flash-Lite`, `SheetJS (xlsx)`, `PDF.js`, `Tesseract.js`, `JSZip`, `Matter.js`, `Lucide React`
- **Database & Auth**: Supabase (PostgreSQL)
- **Hosting & CI/CD**: Vercel (Edge Network, 서울 ICN1 리전)

---

## 🚀 로컬 개발 가이드

```bash
# 1. 패키지 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 브라우저 접속
# http://localhost:3000
```

---

## 🔒 보안 및 프라이버시 원칙

- 모든 엑셀 데이터(급여 대장, 지출 증빙서 등)는 **사용자의 PC 브라우저 메모리 안에서만 0초 만에 처리**되며, 외부 인터넷 서버로 단 1바이트도 전송되지 않아 학교 개인정보 보호 규정을 100% 준수합니다.

---

© 2026 AI-SEN STORE. All rights reserved.
