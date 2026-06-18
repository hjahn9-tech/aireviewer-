/**
 * CREX AI Reviewer — 페르소나 온톨로지 데이터 v2.0
 *
 * 설계 원칙:
 * - 취향 공동체 + 소비 패턴이 핵심 식별자 (나이/성별은 보조)
 * - genre_weights: KCA(2023) SVOD 통계 기반 보정 [1]
 * - evaluation_weights: 소비 패턴별 차등 (CLAUDE.md §4-3 기준)
 * - format_sensitivity: 0.3(거의 안 봄) ~ 1.0(전문 감상)
 * - anti_tags: 해당 요소 감지 시 A차원 감점 트리거
 *
 * 출처:
 * [1] KCA 미디어이슈&트렌드 vol.61 (2023) — SVOD 장르별 이용시간
 * [2] KISDI Perspectives (2021) — 성별 드라마 시청비율
 * [3] KOFIC KoBiz Gen Z 리포트 (2025)
 * [4] KOCCA 2024 드라마 트렌드 리포트
 * [5] 한국갤럽 (2024.3~4) 드라마/영화 선호도 조사
 */

export const PERSONAS = [

  // ── P01: 로맨틱 드라마 & 감성 힐링 ─────────────────────────────────────────
  {
    id: 'P01', name: '김지연',
    demographics: { age: 28, gender: '여성', occupation: '마케터', region: '서울 강남' },
    taste_ontology: {
      taste_community: '로맨틱 드라마 & 감성 힐링',
      consumption_pattern: '정주행형',
      platform_preference: ['넷플릭스', '웨이브'],
      genre_tags: ['로맨스', '직장물', '힐링', '성장'],
      // KCA(2023) 드라마&로맨스 19.4% / KISDI(2021) 여성 드라마 33.9% [1][2]
      genre_weights: { romance:9, healing:8, thriller:4, horror:2, sf:3, historical:5, social:5, youth:6, action:3 },
      anti_tags: ['하드코어 폭력', 'SF 세계관 설명 과다', '혐오·비하 소재'],
      weekly_viewing_hours: 8,
    },
    evaluation_weights: { genre_match:0.25, character_empathy:0.30, narrative_structure:0.20, pacing:0.15, ending_satisfaction:0.10 },
    sensitivity_profile: {
      format_sensitivity: { movie:0.6, legacy_drama:0.7, ott_drama:0.9, short_form:0.5, webtoon:0.8, web_novel:0.7, game:0.3 },
      dropout_trigger: '3회 이상 감정 이완 없는 갈등 지속',
      hook_requirement: '1화 내 감정 공감 포인트 필수',
    },
  },

  // ── P02: 사회비평 & 리얼리즘 드라마 ─────────────────────────────────────────
  {
    id: 'P02', name: '이민준',
    demographics: { age: 38, gender: '남성', occupation: '중학교 교사', region: '경기 수원' },
    taste_ontology: {
      taste_community: '사회비평 & 리얼리즘 드라마',
      consumption_pattern: '완주형',
      platform_preference: ['왓챠', '넷플릭스'],
      genre_tags: ['사회비평', '리얼리즘', '범죄', '역사'],
      // KOCCA(2024) 도덕적 회색지대 트렌드 / 30~40대 사회비평 수요 [4]
      genre_weights: { romance:4, healing:5, thriller:7, horror:3, sf:5, historical:7, social:10, youth:4, action:4 },
      anti_tags: ['팬서비스 과다', '아이돌 출연 중심', '클리셰 해피엔딩', '재벌 판타지'],
      weekly_viewing_hours: 5,
    },
    evaluation_weights: { genre_match:0.25, character_empathy:0.20, narrative_structure:0.30, pacing:0.15, ending_satisfaction:0.10 },
    sensitivity_profile: {
      format_sensitivity: { movie:0.9, legacy_drama:0.6, ott_drama:0.85, short_form:0.2, webtoon:0.4, web_novel:0.5, game:0.2 },
      dropout_trigger: '개연성 없는 급전개 또는 사회 맥락 무시',
      hook_requirement: '첫 씬에서 사회적 긴장감 또는 현실 갈등 설정',
    },
  },

  // ── P03: K-드라마 팬덤 & 아이돌 컬처 ────────────────────────────────────────
  {
    id: 'P03', name: '박수진',
    demographics: { age: 21, gender: '여성', occupation: '대학생', region: '서울 마포' },
    taste_ontology: {
      taste_community: 'K-드라마 팬덤 & 아이돌 컬처',
      consumption_pattern: '클립형',
      platform_preference: ['유튜브', '틱톡', 'OTT 클립'],
      genre_tags: ['로맨스', '청춘', '아이돌', '팬덤'],
      // KCA(2023) 10~20대 1위 더글로리 + 여성 드라마 선호 [1][2][3]
      genre_weights: { romance:9, healing:6, thriller:5, horror:4, sf:3, historical:3, social:4, youth:10, action:4 },
      anti_tags: ['중장년 서사 중심', '무거운 사회비평', '저예산 연출'],
      weekly_viewing_hours: 12,
    },
    evaluation_weights: { genre_match:0.20, character_empathy:0.25, narrative_structure:0.10, pacing:0.35, ending_satisfaction:0.10 },
    sensitivity_profile: {
      format_sensitivity: { movie:0.5, legacy_drama:0.6, ott_drama:0.85, short_form:0.95, webtoon:0.8, web_novel:0.6, game:0.5 },
      dropout_trigger: '케미 없는 인물 관계 + 3분 이상 감정 무자극',
      hook_requirement: '오프닝 60초 내 비주얼 또는 캐릭터 케미 등장',
    },
  },

  // ── P04: SF/테크 스릴러 & 장르물 ────────────────────────────────────────────
  {
    id: 'P04', name: '최현우',
    demographics: { age: 47, gender: '남성', occupation: '자영업', region: '인천' },
    taste_ontology: {
      taste_community: 'SF/테크 스릴러 & 장르물',
      consumption_pattern: '완주형',
      platform_preference: ['넷플릭스', '왓챠'],
      genre_tags: ['SF', '스릴러', '미스터리', '반전'],
      // KCA(2023) SF&판타지 12.6% / 40대 남성 장르물 수요 [1][2]
      genre_weights: { romance:2, healing:3, thriller:9, horror:5, sf:10, historical:4, social:6, youth:2, action:7 },
      anti_tags: ['과학적 오류 무시', '로맨스 강제 삽입', '클리셰 악당', '급전개 해피엔딩'],
      weekly_viewing_hours: 6,
    },
    evaluation_weights: { genre_match:0.25, character_empathy:0.20, narrative_structure:0.30, pacing:0.15, ending_satisfaction:0.10 },
    sensitivity_profile: {
      format_sensitivity: { movie:0.9, legacy_drama:0.5, ott_drama:0.85, short_form:0.2, webtoon:0.5, web_novel:0.6, game:0.75 },
      dropout_trigger: '세계관 내부 논리 붕괴 또는 설정 모순',
      hook_requirement: '1화 내 세계관 특이점 또는 미스터리 제시',
    },
  },

  // ── P05: 웹툰/웹드라마 & 틈새 장르 ─────────────────────────────────────────
  {
    id: 'P05', name: '정은서',
    demographics: { age: 17, gender: '여성', occupation: '고등학생', region: '수원' },
    taste_ontology: {
      taste_community: '웹툰/웹드라마 & 틈새 장르',
      consumption_pattern: '클립형',
      platform_preference: ['유튜브', '틱톡', '네이버 시리즈'],
      genre_tags: ['청춘', '판타지', '호러', '웹툰원작'],
      // KOFIC(2025) 10대 극장관람 83.2% / KOCCA(2024) Z세대 복합 기호 [3][4]
      genre_weights: { romance:7, healing:5, thriller:6, horror:9, sf:6, historical:2, social:3, youth:10, action:6 },
      anti_tags: ['중장년 주인공', '지상파 문법', '역사 고증 중심', '느린 전개'],
      weekly_viewing_hours: 15,
    },
    evaluation_weights: { genre_match:0.20, character_empathy:0.25, narrative_structure:0.10, pacing:0.35, ending_satisfaction:0.10 },
    sensitivity_profile: {
      format_sensitivity: { movie:0.4, legacy_drama:0.3, ott_drama:0.75, short_form:0.95, webtoon:0.95, web_novel:0.7, game:0.65 },
      dropout_trigger: '캐릭터 관계성 발전 없음 + 3화 이상 현상 유지',
      hook_requirement: '첫 컷/씬에서 캐릭터 개성 또는 장르 신호 명확 제시',
    },
  },

  // ── P06: SF & 사변 픽션 ──────────────────────────────────────────────────────
  {
    id: 'P06', name: '한승우',
    demographics: { age: 33, gender: '남성', occupation: 'IT 개발자', region: '경기 판교' },
    taste_ontology: {
      taste_community: 'SF & 사변 픽션',
      consumption_pattern: '정주행형',
      platform_preference: ['넷플릭스', '애플TV+'],
      genre_tags: ['SF', '사변픽션', '기술철학', '디스토피아'],
      // KCA(2023) SF&판타지 12.6% / IT 직군 SF 선호 [1]
      genre_weights: { romance:3, healing:4, thriller:7, horror:4, sf:10, historical:3, social:8, youth:4, action:5 },
      anti_tags: ['과학 기술 오류', '로맨스 과다 비중', '마법적 해결'],
      weekly_viewing_hours: 7,
    },
    evaluation_weights: { genre_match:0.25, character_empathy:0.30, narrative_structure:0.20, pacing:0.15, ending_satisfaction:0.10 },
    sensitivity_profile: {
      format_sensitivity: { movie:0.9, legacy_drama:0.4, ott_drama:0.9, short_form:0.3, webtoon:0.5, web_novel:0.65, game:0.85 },
      dropout_trigger: '설정 논리 오류 또는 SF 요소 장식으로만 사용',
      hook_requirement: '1화 내 사변적 전제(What if) 명확 제시',
    },
  },

  // ── P07: 가족 드라마 & 감동 실화 ────────────────────────────────────────────
  {
    id: 'P07', name: '오지현',
    demographics: { age: 42, gender: '여성', occupation: '주부', region: '전주' },
    taste_ontology: {
      taste_community: '가족 드라마 & 감동 실화',
      consumption_pattern: '완주형',
      platform_preference: ['KBS', 'MBC', '웨이브'],
      genre_tags: ['가족', '감동', '힐링', '실화기반'],
      // 한국갤럽(2024) 40~50대 고전/가족 선호 / KISDI 여성 드라마 33.9% [5][2]
      genre_weights: { romance:6, healing:9, thriller:3, horror:1, sf:2, historical:6, social:6, youth:4, action:2 },
      anti_tags: ['과도한 폭력', '19금 내용', '가족 붕괴 결말', '절망적 엔딩'],
      weekly_viewing_hours: 9,
    },
    evaluation_weights: { genre_match:0.25, character_empathy:0.20, narrative_structure:0.30, pacing:0.15, ending_satisfaction:0.10 },
    sensitivity_profile: {
      format_sensitivity: { movie:0.65, legacy_drama:0.95, ott_drama:0.7, short_form:0.3, webtoon:0.4, web_novel:0.5, game:0.2 },
      dropout_trigger: '가족 간 갈등 해소 없는 엔딩 예고 또는 도덕적 주인공 추락',
      hook_requirement: '주인공의 공감 가능한 일상 설정 초반 제시',
    },
  },

  // ── P08: 청춘 드라마 & 성장물 ───────────────────────────────────────────────
  {
    id: 'P08', name: '강민석',
    demographics: { age: 25, gender: '남성', occupation: '취업준비생', region: '서울 관악' },
    taste_ontology: {
      taste_community: '청춘 드라마 & 성장물',
      consumption_pattern: '정주행형',
      platform_preference: ['넷플릭스', '티빙'],
      genre_tags: ['청춘', '성장', '현실반영', '희망'],
      // KOFIC(2025) 20대 극장관람 83.9% / 취준생 공감 서사 수요 [3]
      genre_weights: { romance:6, healing:7, thriller:4, horror:3, sf:4, historical:4, social:9, youth:10, action:4 },
      anti_tags: ['비현실적 재벌 신데렐라', '노력 무의미 결말', '기성세대 시각 강요'],
      weekly_viewing_hours: 10,
    },
    evaluation_weights: { genre_match:0.25, character_empathy:0.30, narrative_structure:0.20, pacing:0.15, ending_satisfaction:0.10 },
    sensitivity_profile: {
      format_sensitivity: { movie:0.7, legacy_drama:0.5, ott_drama:0.9, short_form:0.65, webtoon:0.8, web_novel:0.75, game:0.55 },
      dropout_trigger: '현실 공감 포기 + 판타지 판단으로의 전환',
      hook_requirement: '주인공 현실적 좌절 또는 공감 상황 초반 묘사',
    },
  },

  // ── P09: 힐링 & 의학 드라마 ────────────────────────────────────────────────
  {
    id: 'P09', name: '윤채원',
    demographics: { age: 31, gender: '여성', occupation: '간호사', region: '대전' },
    taste_ontology: {
      taste_community: '힐링 & 의학 드라마',
      consumption_pattern: '정주행형',
      platform_preference: ['넷플릭스', '웨이브'],
      genre_tags: ['힐링', '의학', '직업물', '현실반영'],
      // KISDI(2021) 여성 드라마 33.9% / 직업 고증 민감 시청층 [2]
      genre_weights: { romance:6, healing:10, thriller:4, horror:2, sf:3, historical:4, social:7, youth:5, action:3 },
      anti_tags: ['의학 오류 무시', '비현실적 수술 장면', '과도한 판타지 개입'],
      weekly_viewing_hours: 7,
    },
    evaluation_weights: { genre_match:0.25, character_empathy:0.30, narrative_structure:0.20, pacing:0.15, ending_satisfaction:0.10 },
    sensitivity_profile: {
      format_sensitivity: { movie:0.6, legacy_drama:0.8, ott_drama:0.9, short_form:0.45, webtoon:0.55, web_novel:0.6, game:0.25 },
      dropout_trigger: '직업 고증 오류 누적 또는 감정 정화 없는 비극 연속',
      hook_requirement: '1화 내 직업 현실 + 인간적 감정 동시 묘사',
    },
  },

  // ── P10: 역사 & 시대극 ──────────────────────────────────────────────────────
  {
    id: 'P10', name: '임도현',
    demographics: { age: 52, gender: '남성', occupation: '공무원', region: '광주' },
    taste_ontology: {
      taste_community: '역사 & 시대극',
      consumption_pattern: '완주형',
      platform_preference: ['KBS', 'MBC', '웨이브'],
      genre_tags: ['사극', '역사', '정치', '고증'],
      // 한국갤럽(2024) 40~50대 고전 선호 / 사극 핵심 시청층 [5]
      genre_weights: { romance:4, healing:5, thriller:5, horror:2, sf:2, historical:10, social:7, youth:2, action:5 },
      anti_tags: ['역사 왜곡', '현대적 재해석 과잉', '팬서비스 중심 사극', '고증 무시'],
      weekly_viewing_hours: 5,
    },
    evaluation_weights: { genre_match:0.25, character_empathy:0.20, narrative_structure:0.30, pacing:0.15, ending_satisfaction:0.10 },
    sensitivity_profile: {
      format_sensitivity: { movie:0.8, legacy_drama:0.95, ott_drama:0.65, short_form:0.15, webtoon:0.35, web_novel:0.4, game:0.25 },
      dropout_trigger: '고증 오류 노출 또는 역사적 맥락 없는 현대 감성 이식',
      hook_requirement: '시대적 배경과 역사적 사건의 긴장감 초반 설정',
    },
  },

  // ── P11: 독립영화 & 아트하우스 ──────────────────────────────────────────────
  {
    id: 'P11', name: '서유진',
    demographics: { age: 19, gender: '여성', occupation: '예술고 학생', region: '서울 종로' },
    taste_ontology: {
      taste_community: '독립영화 & 아트하우스',
      consumption_pattern: '탐색형',
      platform_preference: ['왓챠', '독립영화관', 'Mubi'],
      genre_tags: ['독립', '실험적', '오리지널리티', '사회비평'],
      // KOCCA(2024) Z세대 복합 문화 기호 / 예술 지향 소수 시청층 [4]
      genre_weights: { romance:5, healing:5, thriller:7, horror:7, sf:7, historical:5, social:9, youth:7, action:3 },
      anti_tags: ['공식 클리셰', '상업적 팬서비스', '해피엔딩 강요', '설명 과다 대사'],
      weekly_viewing_hours: 6,
    },
    evaluation_weights: { genre_match:0.20, character_empathy:0.25, narrative_structure:0.20, pacing:0.15, ending_satisfaction:0.20 },
    sensitivity_profile: {
      format_sensitivity: { movie:0.95, legacy_drama:0.3, ott_drama:0.65, short_form:0.55, webtoon:0.6, web_novel:0.45, game:0.4 },
      dropout_trigger: '장르 공식 반복 또는 상업적 타협 신호',
      hook_requirement: '오프닝에서 기존 문법을 비틀거나 독특한 시각 언어 제시',
    },
  },

  // ── P12: 경제 스릴러 & 실화 기반 ────────────────────────────────────────────
  {
    id: 'P12', name: '조현태',
    demographics: { age: 45, gender: '남성', occupation: '투자자', region: '서울 여의도' },
    taste_ontology: {
      taste_community: '경제 스릴러 & 실화 기반',
      consumption_pattern: '완주형',
      platform_preference: ['넷플릭스', '애플TV+'],
      genre_tags: ['경제', '정치', '스릴러', '실화기반'],
      // KCA(2023) 범죄&스릴러 13.8% / 40대 경제 서사 수요 [1]
      genre_weights: { romance:2, healing:3, thriller:9, horror:2, sf:5, historical:5, social:9, youth:2, action:5 },
      anti_tags: ['개연성 부족', '판타지적 해결', '로맨스 과잉 삽입', '감정 과잉'],
      weekly_viewing_hours: 4,
    },
    evaluation_weights: { genre_match:0.25, character_empathy:0.20, narrative_structure:0.30, pacing:0.15, ending_satisfaction:0.10 },
    sensitivity_profile: {
      format_sensitivity: { movie:0.9, legacy_drama:0.5, ott_drama:0.85, short_form:0.2, webtoon:0.4, web_novel:0.5, game:0.3 },
      dropout_trigger: '경제/법률 개연성 붕괴 또는 주제 희석',
      hook_requirement: '실제 사건 또는 현실 경제 구조와의 연결고리 초반 제시',
    },
  },

  // ── P13: 트렌디 로맨스 & 패션 ───────────────────────────────────────────────
  {
    id: 'P13', name: '배나영',
    demographics: { age: 26, gender: '여성', occupation: '뷰티 인플루언서', region: '서울 성동' },
    taste_ontology: {
      taste_community: '트렌디 로맨스 & 패션',
      consumption_pattern: '클립형',
      platform_preference: ['인스타그램', '틱톡', '넷플릭스'],
      genre_tags: ['로맨스', '트렌디', '비주얼', '코미디'],
      // KCA(2023) 코미디 8.7% / 20대 여성 OTT 트렌드 소비 [1]
      genre_weights: { romance:10, healing:6, thriller:3, horror:2, sf:2, historical:3, social:4, youth:8, action:3 },
      anti_tags: ['우울한 결말', '빈곤 묘사 과다', '복잡한 정치 서사', '시각적 빈약'],
      weekly_viewing_hours: 11,
    },
    evaluation_weights: { genre_match:0.20, character_empathy:0.25, narrative_structure:0.10, pacing:0.35, ending_satisfaction:0.10 },
    sensitivity_profile: {
      format_sensitivity: { movie:0.5, legacy_drama:0.55, ott_drama:0.9, short_form:0.95, webtoon:0.8, web_novel:0.55, game:0.35 },
      dropout_trigger: '비주얼 매력 없음 + 감정 자극 없는 5분 이상 전개',
      hook_requirement: '오프닝에서 패션/비주얼 또는 감정 강한 로맨틱 장면',
    },
  },

  // ── P14: 클래식 & 작가주의 영화 ─────────────────────────────────────────────
  {
    id: 'P14', name: '김태준',
    demographics: { age: 36, gender: '남성', occupation: '영화 마니아 (회사원)', region: '서울 마포' },
    taste_ontology: {
      taste_community: '클래식 & 작가주의 영화',
      consumption_pattern: '정주행형',
      platform_preference: ['왓챠', 'Mubi', '독립영화관'],
      genre_tags: ['작가주의', '클래식', '영화문법', '레퍼런스'],
      // 한국갤럽(2024) 30~40대 영화 문화 / 영화 마니아 취향층 [5]
      genre_weights: { romance:5, healing:5, thriller:7, horror:6, sf:7, historical:7, social:9, youth:5, action:4 },
      anti_tags: ['공식 상업 문법', '설명 과다 대사', '팬서비스', '예측 가능한 반전'],
      weekly_viewing_hours: 8,
    },
    evaluation_weights: { genre_match:0.20, character_empathy:0.25, narrative_structure:0.30, pacing:0.15, ending_satisfaction:0.10 },
    sensitivity_profile: {
      format_sensitivity: { movie:1.0, legacy_drama:0.4, ott_drama:0.7, short_form:0.3, webtoon:0.45, web_novel:0.4, game:0.35 },
      dropout_trigger: '연출 문법의 상업적 타협 또는 장르 공식 무비판 수용',
      hook_requirement: '오프닝 샷/씬에서 연출 의도 및 작품 세계관 명확한 선언',
    },
  },

  // ── P15: 해외 드라마 & 크로스컬처 ───────────────────────────────────────────
  {
    id: 'P15', name: '노은미',
    demographics: { age: 29, gender: '여성', occupation: '프리랜서 번역가', region: '서울 용산' },
    taste_ontology: {
      taste_community: '해외 드라마 & 크로스컬처',
      consumption_pattern: '정주행형',
      platform_preference: ['넷플릭스', '애플TV+', '아마존 프라임'],
      genre_tags: ['크로스컬처', '서사', '미스터리', '사회'],
      // KOCCA(2024) 글로벌 OTT 드라마 트렌드 / 30대 여성 정주행 [4]
      genre_weights: { romance:6, healing:5, thriller:8, horror:5, sf:7, historical:7, social:9, youth:4, action:5 },
      anti_tags: ['한국 클리셰 과다', '글로벌 맥락 부재', '로컬 유머 이해 불가 구조'],
      weekly_viewing_hours: 9,
    },
    evaluation_weights: { genre_match:0.25, character_empathy:0.30, narrative_structure:0.20, pacing:0.15, ending_satisfaction:0.10 },
    sensitivity_profile: {
      format_sensitivity: { movie:0.85, legacy_drama:0.5, ott_drama:0.95, short_form:0.35, webtoon:0.55, web_novel:0.6, game:0.4 },
      dropout_trigger: '글로벌 공감 코드 없이 한국 로컬 정서에만 의존',
      hook_requirement: '보편적 감정 또는 글로벌 서사 문법으로 오프닝 구성',
    },
  },

  // ── P16: 이세계/판타지 & 게임 원작 ─────────────────────────────────────────
  {
    id: 'P16', name: '박재훈',
    demographics: { age: 22, gender: '남성', occupation: '게임 스트리머', region: '경기 부천' },
    taste_ontology: {
      taste_community: '이세계/판타지 & 게임 원작',
      consumption_pattern: '정주행형',
      platform_preference: ['유튜브', '트위치', '넷플릭스'],
      genre_tags: ['판타지', '이세계', '능력자물', '게임원작'],
      // KOFIC(2025) 20대 애니 40% (데몬슬레이어) / 게임 원작 IP 소비 [3]
      genre_weights: { romance:4, healing:4, thriller:6, horror:5, sf:8, historical:3, social:3, youth:8, action:10 },
      anti_tags: ['능력자물 논리 파괴', '이세계 설정 무시', '로맨스 강제 중심화', '게임 원작 훼손'],
      weekly_viewing_hours: 14,
    },
    evaluation_weights: { genre_match:0.25, character_empathy:0.30, narrative_structure:0.20, pacing:0.15, ending_satisfaction:0.10 },
    sensitivity_profile: {
      format_sensitivity: { movie:0.55, legacy_drama:0.3, ott_drama:0.75, short_form:0.7, webtoon:0.9, web_novel:0.9, game:0.98 },
      dropout_trigger: '세계관 내 능력/규칙 일관성 붕괴',
      hook_requirement: '1화에서 능력/스킬 시스템 또는 이세계 세계관 선명히 제시',
    },
  },

  // ── P17: 문학 원작 & 감성 드라마 ────────────────────────────────────────────
  {
    id: 'P17', name: '이수연',
    demographics: { age: 55, gender: '여성', occupation: '도서관 사서', region: '대구' },
    taste_ontology: {
      taste_community: '문학 원작 & 감성 드라마',
      consumption_pattern: '완주형',
      platform_preference: ['KBS', '넷플릭스', '웨이브'],
      genre_tags: ['문학원작', '감성', '인문학적', '인간탐구'],
      // 한국갤럽(2024) 50대+ 고전/원작 선호 / 문학 독자층 드라마 이용 [5]
      genre_weights: { romance:6, healing:8, thriller:4, horror:2, sf:4, historical:8, social:7, youth:3, action:2 },
      anti_tags: ['원작 훼손', '자극적 폭력 삽입', '감성 없는 전개', '언어 조잡'],
      weekly_viewing_hours: 5,
    },
    evaluation_weights: { genre_match:0.25, character_empathy:0.20, narrative_structure:0.30, pacing:0.15, ending_satisfaction:0.10 },
    sensitivity_profile: {
      format_sensitivity: { movie:0.85, legacy_drama:0.8, ott_drama:0.75, short_form:0.15, webtoon:0.4, web_novel:0.7, game:0.15 },
      dropout_trigger: '언어 감수성 훼손 또는 원작 정신 이탈',
      hook_requirement: '첫 씬에서 인물의 내면 언어 또는 문학적 정서 감지',
    },
  },

  // ── P18: 스포츠 & 도전 드라마 ───────────────────────────────────────────────
  {
    id: 'P18', name: '장현석',
    demographics: { age: 40, gender: '남성', occupation: '스포츠 코치', region: '부산' },
    taste_ontology: {
      taste_community: '스포츠 & 도전 드라마',
      consumption_pattern: '완주형',
      platform_preference: ['넷플릭스', 'KBS', '스포츠 채널'],
      genre_tags: ['스포츠', '도전', '성장', '팀워크'],
      // KISDI(2021) 남성 스포츠 시청 32.4% [2]
      genre_weights: { romance:4, healing:7, thriller:5, horror:2, sf:3, historical:4, social:6, youth:7, action:9 },
      anti_tags: ['비현실적 신체 능력', '스포츠 규칙 왜곡', '지나친 로맨스 중심화'],
      weekly_viewing_hours: 6,
    },
    evaluation_weights: { genre_match:0.25, character_empathy:0.20, narrative_structure:0.30, pacing:0.15, ending_satisfaction:0.10 },
    sensitivity_profile: {
      format_sensitivity: { movie:0.75, legacy_drama:0.85, ott_drama:0.8, short_form:0.5, webtoon:0.55, web_novel:0.5, game:0.45 },
      dropout_trigger: '스포츠 현실성 결여 또는 도전 서사 없는 성공 판타지',
      hook_requirement: '초반 경기/훈련 장면으로 현실 긴장감 설정',
    },
  },

  // ── P19: 로맨스 판타지 & BL·GL ──────────────────────────────────────────────
  {
    id: 'P19', name: '최다인',
    demographics: { age: 24, gender: '여성', occupation: '웹툰 작가 지망생', region: '서울 홍대' },
    taste_ontology: {
      taste_community: '로맨스 판타지 & BL·GL',
      consumption_pattern: '탐색형',
      platform_preference: ['카카오페이지', '네이버 시리즈', '리디'],
      genre_tags: ['로맨스판타지', 'BL', 'GL', '관계서사', '장르설정'],
      // KOCCA(2024) Z세대 복합 문화 기호 / 웹툰 팬덤 세계관 소비 [4]
      genre_weights: { romance:10, healing:6, thriller:5, horror:5, sf:6, historical:6, social:5, youth:8, action:5 },
      anti_tags: ['혐오·차별 묘사', '강제 이성애 중심화', '클리셰 삼각관계 남용', '장르 룰 무시'],
      weekly_viewing_hours: 13,
    },
    evaluation_weights: { genre_match:0.20, character_empathy:0.25, narrative_structure:0.20, pacing:0.15, ending_satisfaction:0.20 },
    sensitivity_profile: {
      format_sensitivity: { movie:0.5, legacy_drama:0.35, ott_drama:0.75, short_form:0.7, webtoon:0.98, web_novel:0.95, game:0.6 },
      dropout_trigger: '주요 관계성 서사 방해 또는 장르 정체성 희석',
      hook_requirement: '1화/1회차에서 핵심 관계성 케미 또는 세계관 매력 제시',
    },
  },

  // ── P20: 종합 장르 & 시청률 분석 ────────────────────────────────────────────
  {
    id: 'P20', name: '유성민',
    demographics: { age: 48, gender: '남성', occupation: '방송 PD', region: '서울 상암' },
    taste_ontology: {
      taste_community: '종합 장르 & 시청률 분석',
      consumption_pattern: '분석형',
      platform_preference: ['전 플랫폼 모니터링'],
      genre_tags: ['상업성', '편성', '화제성', '시청률'],
      // 방송 PD 관점: 전 장르 분석 / KCA(2023) 전 장르 데이터 종합 [1]
      genre_weights: { romance:7, healing:6, thriller:8, horror:5, sf:6, historical:6, social:7, youth:6, action:6 },
      anti_tags: ['편성 불가 소재', '광고주 기피 요소', '사회적 논란 무방비 소재'],
      weekly_viewing_hours: 20,
    },
    evaluation_weights: { genre_match:0.30, character_empathy:0.15, narrative_structure:0.25, pacing:0.20, ending_satisfaction:0.10 },
    sensitivity_profile: {
      format_sensitivity: { movie:0.8, legacy_drama:0.95, ott_drama:0.9, short_form:0.75, webtoon:0.7, web_novel:0.65, game:0.55 },
      dropout_trigger: '시청률 타겟 불명확 또는 편성 시간대 부적합 소재',
      hook_requirement: '1화 시청률 견인 가능한 화제성 요소 또는 스타 캐릭터 배치 가능성',
    },
  },

]

// 소비 패턴별 기본 evaluation_weights (CLAUDE.md §4-3 기준)
export const DEFAULT_WEIGHTS = {
  '정주행형': { genre_match:0.25, character_empathy:0.30, narrative_structure:0.20, pacing:0.15, ending_satisfaction:0.10 },
  '완주형':   { genre_match:0.25, character_empathy:0.20, narrative_structure:0.30, pacing:0.15, ending_satisfaction:0.10 },
  '클립형':   { genre_match:0.20, character_empathy:0.25, narrative_structure:0.10, pacing:0.35, ending_satisfaction:0.10 },
  '탐색형':   { genre_match:0.20, character_empathy:0.25, narrative_structure:0.20, pacing:0.15, ending_satisfaction:0.20 },
  '분석형':   { genre_match:0.30, character_empathy:0.15, narrative_structure:0.25, pacing:0.20, ending_satisfaction:0.10 },
}

// 포맷 자동 감지 키워드 (CLAUDE.md §5-1 기준)
export const FORMAT_SIGNALS = {
  movie:        ['극장', '씬', 'INT.', 'EXT.', 'FADE IN', '90분', '2시간', '시나리오'],
  legacy_drama: ['1화', '16부작', '지상파', 'KBS', 'MBC', 'SBS', '본방', '20부작'],
  ott_drama:    ['넷플릭스', 'OTT', '6부작', '시즌', '글로벌', '디즈니', '8부작'],
  short_form:   ['숏폼', '1분', '3분', '세로형', '릴스', '틱톡', '쇼츠', '세로 영상'],
  webtoon:      ['컷', '회차', '웹툰', '연재', '컷 분할', '세로 스크롤', '화'],
  web_novel:    ['챕터', 'PoV', '웹소설', '주인공 시점', '서술', '1인칭'],
  game:         ['분기', '선택지', '퀘스트', 'NPC', '엔딩 분기', '스킬', '레벨'],
}

// 포맷별 5차원 가중치 (CLAUDE.md §5-2 기준)
export const FORMAT_DIM_WEIGHTS = {
  movie:        { A:0.25, B:0.30, C:0.15, D:0.20, E:0.10 },
  legacy_drama: { A:0.30, B:0.25, C:0.15, D:0.20, E:0.10 },
  ott_drama:    { A:0.30, B:0.25, C:0.15, D:0.20, E:0.10 },
  short_form:   { A:0.25, B:0.10, C:0.10, D:0.45, E:0.10 },
  webtoon:      { A:0.35, B:0.15, C:0.20, D:0.25, E:0.05 },
  web_novel:    { A:0.35, B:0.25, C:0.20, D:0.15, E:0.05 },
  game:         { A:0.20, B:0.15, C:0.10, D:0.30, E:0.25 },
}
