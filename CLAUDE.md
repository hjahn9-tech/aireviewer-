# CREX AI Reviewer — 설계 헌법 v2.0

> Claude Code 세션 시작 시 반드시 이 파일을 참조한다.
> 이 문서에 정의된 규칙은 모든 구현 결정보다 우선한다.

---

## 1. 프로젝트 원칙 (불변)

- 모든 산출물 기본 언어: **한국어**
- 환경변수: `.env` 파일만, 소스코드 하드코딩 **금지**
- 코드 변경 시 TC 먼저 작성, 결과 리포팅 후 다음 단계 진행
- 배포는 사용자 확인 후 진행 (자동 배포 금지)
- 사용자가 직접 검증해야 하는 항목은 명시적으로 안내

## 2. 기술 스택

- Frontend: React + Vite + TypeScript (`src/frontend/`)
- DB: Supabase (`https://ainpfzzkbodlzfohgbli.supabase.co`)
- 배포: Vercel (`rootDirectory: src/frontend`, 프로젝트 루트에서 CLI 실행)
- 소스코드: GitHub (`hjahn9-tech/aireviewer-`)
- 평가 엔진: `src/frontend/api/evaluate.js` (Vercel 서버리스, 규칙 기반)
- 페르소나 데이터: `src/frontend/src/data/personas.js` (단일 진실 공급원)

---

## 3. 서비스 포지셔닝

**한 줄 정의**: "제작 전에 관객을 만나는 방법"
**시장 포지션**: 한국 시장 전용 관객 반응 시뮬레이터

### 주요 타겟 3종

| 타겟 | 직책 | 사용 목적 | 핵심 Pain Point |
|---|---|---|---|
| 창작자 | 웹소설·웹툰·시나리오 작가 | 연재 전 시장성 검증 | "내 작품이 팔릴지 모르겠다" |
| 제작사 PM | 드라마·영화·OTT 기획팀 | 그린라이트 판단 근거 | "투자자 설득에 데이터가 없다" |
| 투자·배급사 | 콘텐츠 심사역 | 포트폴리오 리스크 스크리닝 | "200편을 휴먼 리뷰로만 처리 불가" |

---

## 4. AI 페르소나 온톨로지

### 4-1. 설계 원칙

- 나이·성별은 보조 속성, **취향 공동체(Taste Community) + 소비 패턴이 핵심 식별자**
- 모든 페르소나는 **행동/욕망 기반**으로 정의 (인구통계 기반 아님)
- 데이터 파일: `src/frontend/src/data/personas.js` — evaluate.js에서 import
- KOFIC/KCA 통계는 `genre_weights` 수치 보정에 활용 (출처 주석 필수)

### 4-2. 페르소나 스키마 (표준)

```js
{
  id: "P01",                          // P01~P20 고정
  name: "김지연",
  demographics: {
    age: 28, gender: "여성",
    occupation: "마케터", region: "서울 강남"
  },
  taste_ontology: {
    taste_community: "로맨틱 드라마 & 감성 힐링",
    consumption_pattern: "정주행형",   // 정주행형|완주형|클립형|탐색형|분석형
    platform_preference: ["넷플릭스", "웨이브"],
    genre_tags: ["로맨스", "직장물", "힐링"],   // 한국어, UI 표시용
    genre_weights: {                   // 영문 키, 1~10, KCA 통계 기반 보정
      romance:9, healing:8, thriller:4, horror:2,
      sf:3, historical:5, social:5, youth:6, action:3
    },
    anti_tags: ["하드코어 폭력", "SF 세계관 설명 과다"]
  },
  evaluation_weights: {               // 합계 = 1.0, 소비 패턴별 상이
    genre_match: 0.25,
    character_empathy: 0.30,
    narrative_structure: 0.20,
    pacing: 0.15,
    ending_satisfaction: 0.10
  },
  sensitivity_profile: {
    format_sensitivity: {             // 0.3~1.0, 이 포맷을 얼마나 잘 평가하는가
      movie: 0.6, legacy_drama: 0.7, ott_drama: 0.9,
      short_form: 0.5, webtoon: 0.8, web_novel: 0.7, game: 0.3
    },
    dropout_trigger: "3회 이상 감정 이완 없는 갈등 지속",
    hook_requirement: "1화 내 감정 공감 포인트 필수"
  }
}
```

### 4-3. 소비 패턴별 evaluation_weights 기본값

| 패턴 | genre_match | character_empathy | narrative_structure | pacing | ending_satisfaction |
|---|---|---|---|---|---|
| 정주행형 | 0.25 | 0.30 | 0.20 | 0.15 | 0.10 |
| 완주형 | 0.25 | 0.20 | 0.30 | 0.15 | 0.10 |
| 클립형 | 0.20 | 0.25 | 0.10 | 0.35 | 0.10 |
| 탐색형 | 0.20 | 0.25 | 0.20 | 0.15 | 0.20 |
| 분석형 | 0.30 | 0.15 | 0.25 | 0.20 | 0.10 |

### 4-4. 20종 페르소나 목록

| ID | 이름 | 나이 | 직업 | 취향 공동체 | 소비 패턴 |
|---|---|---|---|---|---|
| P01 | 김지연 | 28 | 마케터 | 로맨틱 드라마 & 감성 힐링 | 정주행형 |
| P02 | 이민준 | 38 | 중학교 교사 | 사회비평 & 리얼리즘 드라마 | 완주형 |
| P03 | 박수진 | 21 | 대학생 | K-드라마 팬덤 & 아이돌 컬처 | 클립형 |
| P04 | 최현우 | 47 | 자영업 | SF/테크 스릴러 & 장르물 | 완주형 |
| P05 | 정은서 | 17 | 고등학생 | 웹툰/웹드라마 & 틈새 장르 | 클립형 |
| P06 | 한승우 | 33 | IT 개발자 | SF & 사변 픽션 | 정주행형 |
| P07 | 오지현 | 42 | 주부 | 가족 드라마 & 감동 실화 | 완주형 |
| P08 | 강민석 | 25 | 취업준비생 | 청춘 드라마 & 성장물 | 정주행형 |
| P09 | 윤채원 | 31 | 간호사 | 힐링 & 의학 드라마 | 정주행형 |
| P10 | 임도현 | 52 | 공무원 | 역사 & 시대극 | 완주형 |
| P11 | 서유진 | 19 | 예술고 학생 | 독립영화 & 아트하우스 | 탐색형 |
| P12 | 조현태 | 45 | 투자자 | 경제 스릴러 & 실화 기반 | 완주형 |
| P13 | 배나영 | 26 | 뷰티 인플루언서 | 트렌디 로맨스 & 패션 | 클립형 |
| P14 | 김태준 | 36 | 영화 마니아 | 클래식 & 작가주의 영화 | 정주행형 |
| P15 | 노은미 | 29 | 프리랜서 번역가 | 해외 드라마 & 크로스컬처 | 정주행형 |
| P16 | 박재훈 | 22 | 게임 스트리머 | 이세계/판타지 & 게임 원작 | 정주행형 |
| P17 | 이수연 | 55 | 도서관 사서 | 문학 원작 & 감성 드라마 | 완주형 |
| P18 | 장현석 | 40 | 스포츠 코치 | 스포츠 & 도전 드라마 | 완주형 |
| P19 | 최다인 | 24 | 웹툰 작가 지망생 | 로맨스 판타지 & BL/GL | 탐색형 |
| P20 | 유성민 | 48 | 방송 PD | 종합 장르 & 시청률 분석 | 분석형 |

---

## 5. 평가 엔진 설계

### 5-1. 지원 포맷 7종 및 자동 감지 키워드

```
movie        : ["극장", "씬", "INT.", "EXT.", "FADE IN", "90분", "2시간"]
legacy_drama : ["1화", "16부작", "지상파", "KBS", "MBC", "SBS", "본방"]
ott_drama    : ["넷플릭스", "OTT", "6부작", "시즌", "글로벌", "디즈니"]
short_form   : ["숏폼", "1분", "3분", "세로형", "릴스", "틱톡", "쇼츠"]
webtoon      : ["컷", "회차", "웹툰", "연재", "컷 분할", "세로 스크롤"]
web_novel    : ["챕터", "회", "PoV", "웹소설", "서술", "주인공 시점"]
game         : ["분기", "선택지", "퀘스트", "NPC", "엔딩 분기", "스킬"]
```

기본값: 키워드 미감지 시 `ott_drama`

### 5-2. 포맷별 5차원 가중치

| 차원 | 영화 | 레거시TV | OTT드라마 | 숏폼 | 웹툰 | 웹소설 | 게임 |
|---|---|---|---|---|---|---|---|
| A 취향적합 | 25% | 30% | 30% | 25% | 35% | 35% | 20% |
| B 서사구조 | 30% | 25% | 25% | 10% | 15% | 25% | 15% |
| C FRBR감도 | 15% | 15% | 15% | 10% | 20% | 20% | 10% |
| D 몰입/후킹 | 20% | 20% | 20% | 45% | 25% | 15% | 30% |
| E 틈새지수 | 10% | 10% | 10% | 10% | 5% | 5% | 25% |

### 5-3. 점수 계산 순서

1. `analyzeScenario(text)` → 포맷 감지 + 장르/페이스/감정/갈등/엔딩 피처 추출
2. `detectAntiTagPenalty(persona, analysis)` → anti_tags 매칭 시 A차원 감점
3. `scorePersona(persona, analysis, formatWeights)` → per-persona weights 적용
4. `applyFormatSensitivity(rawScores, persona, detectedFormat)` → format_sensitivity 보정
5. 20개 페르소나 집계 → 포맷 가중 평균 → 종합 등급 판정

### 5-4. 종합 등급 기준

```
GO      : 포맷 가중 평균 ≥ 7.5 AND D차원 이탈 위험 없음
CAUTION : 포맷 가중 평균 5.0~7.4 OR 특정 차원 4.0 이하 존재
PASS    : 포맷 가중 평균 < 5.0 OR 2개 이상 차원 4.0 이하
```

### 5-5. 충돌 감지

점수 편차 **≥ 3.0** 인 페르소나 페어를 충돌로 감지 (기존 4.0 → 3.0으로 완화)

---

## 6. 리포트 출력 방식

### 6-1. 3단계 리포트 티어

| 티어 | 가격 | 형식 | 포함 내용 |
|---|---|---|---|
| LITE | 무료 | 화면 표시 | 종합 등급 + 5차원 차트 + 페르소나 요약 |
| STANDARD | $9.9/건 | PDF (7p) | LITE + 충돌 분석 + 이탈 위험 + 도플갱어 |
| FULL | $29/건 | PDF+XLSX+JSON | STANDARD + 20종 원점수 전체 표 + API JSON |

### 6-2. STANDARD PDF 7페이지 구성

1. 표지: 시나리오 제목 / 포맷 / 등급
2. 종합 요약: 레이더 차트 + 강점 Top3 / 개선점 Top3
3. 페르소나 반응 분포: GO/CAUTION/PASS 히트맵
4. 페르소나 상세 (Top5 긍정/부정)
5. 충돌 토론 분석
6. 이탈 위험 씬 분석
7. 시장 포지셔닝 & 도플갱어 추천

---

## 7. 구현 결정 사항 (상충 해결 로그)

| 항목 | 채택 방향 | 이유 |
|---|---|---|
| 페르소나 20명 | 가이드라인 문서 P01~P20 | 행동 기반 설계 우월 |
| 페르소나 스키마 | Nested (문서 방식) | anti_tags, format_sensitivity 필수 |
| evaluation_weights | Per-persona (문서 방식) | 소비 패턴별 차별화 |
| 포맷 감지/가중치 | 문서 방식 도입 | 장르별 평가 신뢰도 향상 |
| 5차원 하위 항목 | 하이브리드 (내부 계산, UI 집계만 노출) | 구현 복잡도 대비 효용 균형 |
| genre_weights 수치 | KOFIC/KCA 통계 기반 보정 유지 | 통계적 근거 보존 |
| 평가 엔진 | 규칙 기반 유지 (AI 의존 없음) | 안정성 및 응답 속도 |

---

## 8. 개발 우선순위

### Sprint 1 (현재)
- [x] personas.js 온톨로지 데이터 파일 생성
- [ ] evaluate.js — personas.js import, anti_tags 감점 로직, format 감지, per-persona weights 적용
- [ ] format_sensitivity 보정 함수 구현
- [ ] TC: P01과 P04가 동일 시나리오에서 A차원 다른 점수 출력

### Sprint 2
- [ ] PDF 리포트 생성 (jsPDF + html2canvas, 7페이지)
- [ ] XLSX 다운로드 (SheetJS)
- [ ] Supabase DB 저장 연동 (평가 이력)

### Sprint 3
- [ ] 관리자 대시보드 실데이터 연결
- [ ] 리포트 결제 티어 (LITE/STANDARD/FULL) 게이팅
- [ ] 사용자 인증 (Supabase Auth)

---

## 9. 작업 기록

형식: `날짜 | 작업 내용 | 변경 파일 | 테스트 결과 | 다음 단계`

- 2026-06-17 | KOFIC 기반 페르소나 20명 초안 구현 | api/evaluate.js | 빌드 통과 | 스키마 개편
- 2026-06-18 | 설계 헌법 v2.0 수립, personas.js 온톨로지 데이터 생성 | CLAUDE.md, src/data/personas.js | — | evaluate.js 개편
