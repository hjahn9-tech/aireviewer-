/**
 * CREX AI Reviewer — 페르소나 평가 엔진
 *
 * 페르소나 근거 자료:
 * [1] KCA 미디어이슈&트렌드 vol.61 (2023) — SVOD 장르별 이용시간 비중
 *     드라마&로맨스 19.4% / 범죄&스릴러 13.8% / SF&판타지 12.6% / 코미디 8.7%
 * [2] KISDI Perspectives (2021) — 성별 드라마 시청비율
 *     여성 33.9% vs 남성 20.4%; 남성 스포츠/뉴스 우세
 * [3] KOFIC KoBiz Gen Z 리포트 (2025) — 극장 관람률 20대 83.9%, 10대 83.2%
 *     20대 애니 비중 40%(데몬슬레이어), 여성 관람객 64%(로맨스 애니)
 * [4] KOCCA 2024 드라마 트렌드 리포트 — 여성 서사 확대, 워맨스 코드,
 *     도덕적 회색지대, Z세대 복합 문화 기호 수용
 * [5] 한국갤럽 (2024.3~4) — 전국 13세 이상 1,777명 드라마/영화 선호 조사
 *     10~30대: 최신작, 40~50대: 고전 선호
 * [6] KCA (2023) — 연령별 1위 콘텐츠
 *     10~20대: 더글로리(범죄/스릴러), 30~40대: 나는Solo(버라이어티), 50대+: 더글로리+버라이어티
 */

// ─── 페르소나 20명 (근거 자료 태그 포함) ──────────────────────────────────────
const PERSONAS = [
  // ── 드라마&로맨스 코어 (19.4% / SVOD 2위 장르 [1]) ──
  {
    id:'p01', name:'김지연', age:28, gender:'여성', occupation:'마케터', region:'서울',
    taste_community:'로맨틱 드라마 & 감성 힐링',
    engagement_type:'정주행형',
    genre_tags:['로맨스','힐링','직장물'],
    // 여성 드라마 시청비율 33.9% [2], 30대 이하 여성 로맨스 코어 시청층
    genre_weights:{ romance:9, healing:8, thriller:4, horror:2, sf:3, historical:5, social:5, youth:6, action:3 },
    narrative_pref:'linear', frbr:['character','emotion'], niche_index:0.3,
    data_basis:'KISDI(2021) 여성 드라마 33.9% / KCA(2023) 드라마&로맨스 19.4%',
  },
  {
    id:'p02', name:'오미란', age:52, gender:'여성', occupation:'주부', region:'전주',
    taste_community:'가족 드라마 & 감동 멜로',
    engagement_type:'정주행형',
    genre_tags:['가족','멜로','힐링'],
    // 한국갤럽(2024) 40~50대 고전 드라마 선호 [5], KCA 50대+ 버라이어티 1위
    genre_weights:{ romance:7, healing:9, thriller:3, horror:1, sf:2, historical:7, social:6, youth:3, action:2 },
    narrative_pref:'linear', frbr:['character','emotion'], niche_index:0.2,
    data_basis:'한국갤럽(2024) 40~50대 고전선호 / KISDI(2021) 여성 드라마 33.9%',
  },
  {
    id:'p03', name:'장나래', age:32, gender:'여성', occupation:'스타트업 대표', region:'서울',
    taste_community:'여성 서사 & 성장 드라마',
    engagement_type:'정주행형',
    genre_tags:['성장','커리어','워맨스'],
    // KOCCA(2024) 여성 서사 전면 확대, 워맨스 코드 부상 [4]
    genre_weights:{ romance:6, healing:6, thriller:6, horror:2, sf:5, historical:4, social:7, youth:5, action:4 },
    narrative_pref:'linear', frbr:['character','event'], niche_index:0.45,
    data_basis:'KOCCA(2024) 여성서사 확대·워맨스 트렌드 [4]',
  },

  // ── 범죄&스릴러 코어 (13.8% / SVOD 3위 [1]) ──
  {
    id:'p04', name:'박수진', age:22, gender:'여성', occupation:'대학생', region:'서울',
    taste_community:'범죄 스릴러 & 다크 드라마',
    engagement_type:'클립형',
    genre_tags:['스릴러','범죄','다크'],
    // KCA(2023) 10~20대 1위 콘텐츠 '더글로리'(범죄/스릴러) [6]
    genre_weights:{ romance:5, healing:4, thriller:9, horror:7, sf:5, historical:3, social:7, youth:6, action:5 },
    narrative_pref:'nonlinear', frbr:['character','event'], niche_index:0.6,
    data_basis:'KCA(2023) 10~20대 더글로리(범죄스릴러) 1위 [6]',
  },
  {
    id:'p05', name:'박철민', age:44, gender:'남성', occupation:'경찰관', region:'부산',
    taste_community:'범죄 수사물 & 액션 스릴러',
    engagement_type:'완주형',
    genre_tags:['범죄','수사','액션'],
    // KCA(2023) 50대+ 더글로리 선호 [6], 남성 드라마 20.4% [2]
    genre_weights:{ romance:3, healing:3, thriller:10, horror:4, sf:4, historical:5, social:6, youth:2, action:9 },
    narrative_pref:'linear', frbr:['event','character'], niche_index:0.5,
    data_basis:'KCA(2023) 50대+ 범죄스릴러 선호 / KISDI(2021) 남성 드라마 20.4% [2][6]',
  },
  {
    id:'p06', name:'신예은', age:19, gender:'여성', occupation:'고등학생', region:'수원',
    taste_community:'공포 & 오컬트 팬',
    engagement_type:'클립형',
    genre_tags:['호러','오컬트','스릴러'],
    // KCA(2023) 10~20대 범죄스릴러 1위 [6], 10대 극장 관람률 83.2% [3]
    genre_weights:{ romance:5, healing:3, thriller:7, horror:10, sf:5, historical:3, social:3, youth:7, action:5 },
    narrative_pref:'nonlinear', frbr:['event','emotion'], niche_index:0.75,
    data_basis:'KCA(2023) 10~20대 더글로리 1위 / KOFIC(2025) 10대 극장관람 83.2% [3][6]',
  },

  // ── SF&판타지 코어 (12.6% / SVOD 4위 [1]) ──
  {
    id:'p07', name:'강동현', age:33, gender:'남성', occupation:'IT 개발자', region:'경기',
    taste_community:'SF & 기술 철학 드라마',
    engagement_type:'완주형',
    genre_tags:['SF','스릴러','미스터리'],
    // SF&판타지 12.6% [1], 남성 드라마 20.4% but 장르물 강세 [2]
    genre_weights:{ romance:4, healing:4, thriller:7, horror:4, sf:10, historical:3, social:7, youth:3, action:6 },
    narrative_pref:'nonlinear', frbr:['concept','event'], niche_index:0.75,
    data_basis:'KCA(2023) SF&판타지 12.6% 4위 [1]',
  },
  {
    id:'p08', name:'최현우', age:47, gender:'남성', occupation:'자영업', region:'인천',
    taste_community:'SF/테크 스릴러 & 장르 마니아',
    engagement_type:'완주형',
    genre_tags:['SF','범죄','스릴러'],
    // KISDI(2021) 40대 남성 드라마 20.4% [2], 장르물 하드코어 팬층
    genre_weights:{ romance:3, healing:3, thriller:9, horror:6, sf:9, historical:5, social:6, youth:2, action:8 },
    narrative_pref:'nonlinear', frbr:['event','concept'], niche_index:0.7,
    data_basis:'KISDI(2021) 남성 드라마 20.4% / SF장르 마니아층 [1][2]',
  },
  {
    id:'p09', name:'홍기태', age:23, gender:'남성', occupation:'게임 유튜버', region:'경기',
    taste_community:'게임·판타지 & 애니 원작물',
    engagement_type:'클립형',
    genre_tags:['판타지','액션','애니원작'],
    // KOFIC(2025) 20대 애니 관람 40%(데몬슬레이어) [3]
    genre_weights:{ romance:4, healing:4, thriller:6, horror:5, sf:7, historical:3, social:3, youth:8, action:9 },
    narrative_pref:'episodic', frbr:['event','character'], niche_index:0.8,
    data_basis:'KOFIC(2025) 20대 애니 40% 점유(데몬슬레이어) [3]',
  },

  // ── 버라이어티&리얼리티 코어 (26.7% / SVOD 1위 [1]) ──
  {
    id:'p10', name:'이수진', age:36, gender:'여성', occupation:'초등교사', region:'대전',
    taste_community:'리얼리티 & 관찰 예능 팬',
    engagement_type:'정주행형',
    genre_tags:['힐링','가족','현실'],
    // KCA(2023) 30~40대 나는Solo(버라이어티) 1위 [6]
    genre_weights:{ romance:7, healing:9, thriller:3, horror:1, sf:2, historical:5, social:5, youth:4, action:2 },
    narrative_pref:'episodic', frbr:['character','emotion'], niche_index:0.25,
    data_basis:'KCA(2023) 30~40대 리얼리티 버라이어티 1위 [6]',
  },
  {
    id:'p11', name:'조성훈', age:38, gender:'남성', occupation:'광고 PD', region:'서울',
    taste_community:'웰메이드 상업 드라마',
    engagement_type:'완주형',
    genre_tags:['웰메이드','감동','상업'],
    // 한국갤럽(2024) 30~40대 최신 드라마 선호 [5], 제작 완성도 중시
    genre_weights:{ romance:6, healing:7, thriller:6, horror:2, sf:5, historical:6, social:6, youth:5, action:5 },
    narrative_pref:'linear', frbr:['event','character'], niche_index:0.35,
    data_basis:'한국갤럽(2024) 30~40대 최신작 선호 [5]',
  },

  // ── 사극/역사물 (40~50대+ 선호) ──
  {
    id:'p12', name:'임종수', age:61, gender:'남성', occupation:'은퇴 공무원', region:'광주',
    taste_community:'정통 사극 & 역사물',
    engagement_type:'완주형',
    genre_tags:['사극','역사','정치'],
    // 한국갤럽(2024) 40~50대 고전 선호 [5], KCA 50대+ 역사 사극 수요
    genre_weights:{ romance:4, healing:5, thriller:5, horror:2, sf:2, historical:10, social:7, youth:2, action:5 },
    narrative_pref:'linear', frbr:['context','concept'], niche_index:0.5,
    data_basis:'한국갤럽(2024) 40~50대 고전선호 [5]',
  },
  {
    id:'p13', name:'권민석', age:55, gender:'남성', occupation:'대학교수', region:'대구',
    taste_community:'휴머니즘 & 사회비평 드라마',
    engagement_type:'완주형',
    genre_tags:['휴머니즘','사회','역사'],
    // KOCCA(2024) 도덕적 회색지대 탐구 트렌드 [4], 고연령 지식층
    genre_weights:{ romance:4, healing:6, thriller:5, horror:2, sf:6, historical:8, social:9, youth:3, action:2 },
    narrative_pref:'nonlinear', frbr:['concept','context'], niche_index:0.65,
    data_basis:'KOCCA(2024) 도덕적 회색지대 트렌드 / 한국갤럽 40~50대 [4][5]',
  },

  // ── 청춘/Z세대 ──
  {
    id:'p14', name:'정은서', age:17, gender:'여성', occupation:'고등학생', region:'대구',
    taste_community:'웹툰 원작 & Z세대 청춘',
    engagement_type:'클립형',
    genre_tags:['청춘','판타지','웹툰원작'],
    // KOFIC(2025) 10대 극장관람 83.2% [3], KOCCA(2024) Z세대 복합 문화 기호 수용 [4]
    genre_weights:{ romance:7, healing:5, thriller:4, horror:5, sf:6, historical:3, social:3, youth:10, action:5 },
    narrative_pref:'episodic', frbr:['character','emotion'], niche_index:0.8,
    data_basis:'KOFIC(2025) 10대 극장관람 83.2% / KOCCA(2024) Z세대 복합기호 [3][4]',
  },
  {
    id:'p15', name:'이수아', age:16, gender:'여성', occupation:'중학생', region:'제주',
    taste_community:'K-드라마 팬덤 & 아이돌 컬처',
    engagement_type:'클립형',
    genre_tags:['청춘','로맨스','팬덤'],
    // KCA(2023) 10~20대 범죄스릴러+로맨스 혼용 [6], 팬덤 중심 소비
    genre_weights:{ romance:9, healing:6, thriller:4, horror:3, sf:4, historical:3, social:3, youth:9, action:3 },
    narrative_pref:'episodic', frbr:['character','emotion'], niche_index:0.4,
    data_basis:'KCA(2023) 10~20대 선호 콘텐츠 패턴 [6]',
  },

  // ── 사회비평/인디 ──
  {
    id:'p16', name:'윤재호', age:26, gender:'남성', occupation:'대학원생', region:'서울',
    taste_community:'아트하우스 & 사회비평 독립영화',
    engagement_type:'완주형',
    genre_tags:['독립','사회비평','실험적'],
    // KOCCA(2024) 도덕적 회색지대 트렌드, Z세대 복합 기호 [4]
    genre_weights:{ romance:5, healing:5, thriller:7, horror:6, sf:6, historical:6, social:10, youth:6, action:3 },
    narrative_pref:'nonlinear', frbr:['concept','context'], niche_index:0.9,
    data_basis:'KOCCA(2024) 도덕적 회색지대 / Z세대 복합 문화 기호 [4]',
  },
  {
    id:'p17', name:'문혜진', age:29, gender:'여성', occupation:'작가 지망생', region:'서울',
    taste_community:'문학적 감성 드라마 & 독립영화',
    engagement_type:'완주형',
    genre_tags:['문학적','감성','독립'],
    // KOCCA(2024) 여성 서사 확대, 30대 여성 최신작 선호 [4][5]
    genre_weights:{ romance:6, healing:7, thriller:6, horror:5, sf:5, historical:6, social:8, youth:5, action:2 },
    narrative_pref:'nonlinear', frbr:['concept','emotion'], niche_index:0.8,
    data_basis:'KOCCA(2024) 여성서사 확대 / 한국갤럽 30대 최신작 [4][5]',
  },

  // ── 직업/의학 드라마 ──
  {
    id:'p18', name:'한소희', age:31, gender:'여성', occupation:'간호사', region:'대전',
    taste_community:'의학·직업 드라마 & 현실 반영',
    engagement_type:'정주행형',
    genre_tags:['직업물','의학','현실'],
    // KISDI(2021) 여성 드라마 33.9% [2], 직업 고증 민감 시청층
    genre_weights:{ romance:6, healing:7, thriller:5, horror:3, sf:4, historical:4, social:7, youth:4, action:4 },
    narrative_pref:'linear', frbr:['character','event'], niche_index:0.4,
    data_basis:'KISDI(2021) 여성 드라마 33.9% / 직업 고증 민감층 [2]',
  },

  // ── 경제/정치 스릴러 ──
  {
    id:'p19', name:'황성진', age:42, gender:'남성', occupation:'증권 애널리스트', region:'서울',
    taste_community:'경제·정치 스릴러',
    engagement_type:'완주형',
    genre_tags:['정치','경제','스릴러'],
    // KCA(2023) 범죄&스릴러 13.8% [1], 40대 남성 사회비평 수요
    genre_weights:{ romance:3, healing:3, thriller:8, horror:2, sf:6, historical:5, social:8, youth:2, action:5 },
    narrative_pref:'nonlinear', frbr:['concept','event'], niche_index:0.65,
    data_basis:'KCA(2023) 범죄스릴러 13.8% [1]',
  },

  // ── 코미디/버라이어티 경계 (코미디 8.7% [1]) ──
  {
    id:'p20', name:'류지아', age:24, gender:'여성', occupation:'뷰티 유튜버', region:'서울',
    taste_community:'트렌디 로맨스 & 숏폼 코미디',
    engagement_type:'클립형',
    genre_tags:['로맨스','코미디','트렌디'],
    // KCA(2023) 코미디 8.7% [1], 20대 여성 트렌드 소비층
    genre_weights:{ romance:9, healing:6, thriller:4, horror:2, sf:3, historical:3, social:4, youth:8, action:3 },
    narrative_pref:'episodic', frbr:['character','emotion'], niche_index:0.45,
    data_basis:'KCA(2023) 코미디 8.7% / 20대 여성 OTT 트렌드 소비 [1]',
  },
]

// ─── 시나리오 분석 엔진 ───────────────────────────────────────────────────────
function analyzeScenario(text) {
  const t = text.toLowerCase()

  const genreSignals = {
    romance: ['사랑','연인','로맨스','연애','키스','고백','설렘','짝사랑','남자친구','여자친구','데이트','이별','재회','감정','두근','연정'],
    healing: ['힐링','따뜻','위로','치유','가족','소소','일상','평화','회복','위안','따스','잔잔','온기'],
    thriller: ['살인','범죄','추리','스릴러','사건','경찰','수사','긴장','추격','공범','음모','배신','반전','비밀','조작','증거'],
    horror: ['귀신','공포','오컬트','무서','호러','저주','유령','악령','신내림','흉가','괴물','공포감'],
    sf: ['우주','인공지능','로봇','미래','sf','시간여행','기술','사이버','외계','차원','과학','복제','디스토피아','포스트아포칼립스'],
    historical: ['조선','고려','역사','사극','궁중','전통','고대','왕','왕비','임금','한복','선비','과거','시대','근대','일제'],
    social: ['사회','계층','빈곤','차별','정치','부패','노동','현실','불평등','시위','갑질','비판','모순','구조','체제'],
    youth: ['청춘','대학교','고등학교','학원','성장','20대','10대','졸업','입시','동아리','친구','첫사랑','설레임','교복'],
    action: ['액션','격투','전투','폭발','무기','군인','싸움','추격','총','칼','암살','폭력','스턴트'],
  }

  const scores = {}
  for (const [genre, keywords] of Object.entries(genreSignals)) {
    scores[genre] = keywords.filter(k => t.includes(k)).length
  }

  const topGenre = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]
  const topScore = scores[topGenre]
  const genreTotal = Object.values(scores).reduce((a, b) => a + b, 0)
  const activeGenres = Object.entries(scores).filter(([, v]) => v > 0).length

  const hasFastPace = ['반전','충격','급전','긴박','폭발적','속도'].some(k => t.includes(k))
  const hasSlowPace = ['잔잔','천천히','성장','일상','소소','차분','여운'].some(k => t.includes(k))
  const hasNonLinear = ['플래시백','과거','회상','시간이 엇갈','비선형','교차','서술'].some(k => t.includes(k))
  const hasCharacterFocus = ['캐릭터','인물','주인공','성격','감정','내면','성장','관계','심리'].some(k => t.includes(k))
  const hasEventFocus = ['사건','전투','추격','충돌','갈등','위기','해결','반전','폭발'].some(k => t.includes(k))
  const hasHappyEnding = ['해피엔딩','행복','결말','함께','희망','사랑으로 끝'].some(k => t.includes(k))
  const hasSadEnding = ['비극','슬픈 결말','죽음','이별','눈물','상실','비운'].some(k => t.includes(k))
  const hasOpenEnding = ['열린 결말','모호','여운','미지','불확실','여지'].some(k => t.includes(k))
  const hasFemaleProtagonist = ['여주인공','여성 주인공','그녀','여자 주인공','여성 서사'].some(k => t.includes(k))

  // 장르 조합 독창성 (틈새 지수)
  const nicheScore = Math.min(10, 3 + activeGenres * 1.2 + (topScore < 3 ? 2 : 0))

  return {
    scores, topGenre, topScore, genreTotal, activeGenres,
    hasFastPace, hasSlowPace, hasNonLinear, hasCharacterFocus,
    hasEventFocus, hasHappyEnding, hasSadEnding, hasOpenEnding,
    hasFemaleProtagonist, nicheScore,
  }
}

// ─── 페르소나별 점수 계산 ──────────────────────────────────────────────────────
function scorePersona(persona, analysis, idx) {
  const {
    scores, topGenre, hasFastPace, hasSlowPace, hasNonLinear,
    hasCharacterFocus, hasEventFocus, hasFemaleProtagonist,
    hasHappyEnding, hasSadEnding, hasOpenEnding, nicheScore, activeGenres
  } = analysis

  // 페르소나마다 일관된 미세 변동 (같은 시나리오+페르소나 → 항상 동일)
  const jitter = ((idx * 2654435761) % 100) / 100  // 0~0.99

  // A차원: 취향 공동체 적합도 — 장르 가중치 매칭
  const genreMatchSum = Object.entries(scores)
    .filter(([, cnt]) => cnt > 0)
    .reduce((sum, [g, cnt]) => sum + (persona.genre_weights[g] || 5) * Math.min(cnt, 3), 0)
  const genreMatchNorm = genreMatchSum / Math.max(1, Object.values(scores).filter(v => v > 0).length * 3)
  const A = Math.min(10, Math.max(1, Math.round(genreMatchNorm * 1.0 + jitter * 0.8)))

  // B차원: 서사 구조 선호도 — narrative_pref vs 시나리오 구조
  let B = 5
  if (persona.narrative_pref === 'linear') {
    if (!hasNonLinear) B += 2
    if (hasSlowPace) B += 1
    if (hasFastPace && !hasEventFocus) B -= 1
  } else if (persona.narrative_pref === 'nonlinear') {
    if (hasNonLinear) B += 2
    if (hasFastPace) B += 1
    if (!hasNonLinear && hasSlowPace) B -= 1
  } else { // episodic
    if (hasCharacterFocus) B += 1
    if (hasFastPace) B += 1
  }
  if (hasEventFocus && persona.frbr.includes('event')) B += 1
  B = Math.min(10, Math.max(1, B + Math.round(jitter * 1.5)))

  // C차원: FRBR 요소 민감도
  let C = 4
  if (persona.frbr.includes('character') && hasCharacterFocus) C += 3
  if (persona.frbr.includes('event') && hasEventFocus) C += 3
  if (persona.frbr.includes('emotion')) {
    if (hasHappyEnding || hasSadEnding) C += 2
    if (hasCharacterFocus) C += 1
  }
  if (persona.frbr.includes('concept') && activeGenres >= 2) C += 2
  if (persona.frbr.includes('context') && analysis.scores.social > 0) C += 2
  if (hasFemaleProtagonist && persona.genre_tags.some(t => ['워맨스','커리어','성장','여성서사'].includes(t))) C += 1
  C = Math.min(10, Math.max(1, C + Math.round(jitter * 1.2)))

  // D차원: 몰입도 예측
  let D = 5
  if (A >= 7) D += 2
  else if (A <= 3) D -= 2
  if (persona.engagement_type === '완주형') {
    if (hasSlowPace) D += 1
    if (B >= 7) D += 1
  } else if (persona.engagement_type === '클립형') {
    if (hasFastPace) D += 2
    if (hasSlowPace) D -= 2
    if (hasCharacterFocus) D += 1
  } else { // 정주행형
    if (A >= 7) D += 1
    if (hasHappyEnding) D += 1
  }
  D = Math.min(10, Math.max(1, D + Math.round(jitter * 1.2)))

  // E차원: 틈새 취향 지수
  const E = Math.min(10, Math.max(1, Math.round(
    persona.niche_index * 6 + nicheScore * 0.4 + jitter * 0.8
  )))

  return { A, B, C, D, E }
}

// ─── 페르소나별 리뷰 생성 ─────────────────────────────────────────────────────
function generateReview(persona, scores, analysis) {
  const { topGenre, hasCharacterFocus, hasEventFocus, hasNonLinear,
    hasFastPace, hasSlowPace, hasHappyEnding, hasSadEnding, hasOpenEnding,
    hasFemaleProtagonist } = analysis

  const genreKo = {
    romance:'로맨스', healing:'힐링', thriller:'범죄·스릴러', horror:'공포·오컬트',
    sf:'SF·판타지', historical:'사극·역사', social:'사회비평', youth:'청춘물', action:'액션',
  }
  const topKo = genreKo[topGenre] || '이 장르'

  const reasons = {
    A: scores.A >= 8
      ? `취향 공동체(${persona.taste_community})와 ${topKo} 장르가 높은 정합성을 보입니다.`
      : scores.A >= 5
      ? `${topKo}는 제 취향과 부분적으로 겹치지만, 완전히 제 스타일은 아닙니다.`
      : `주로 ${persona.genre_tags[0]}를 즐기는 입장에서 ${topKo} 시나리오는 취향과 거리가 있습니다.`,

    B: scores.B >= 8
      ? `${hasNonLinear ? '비선형 구성이 신선하게' : '안정적인 선형 구조가'} 서사 흐름을 자연스럽게 만듭니다.`
      : scores.B >= 5
      ? `서사 구조는 무난하지만 ${hasFastPace ? '전개가 지나치게 빨라 감정 소화가 어렵습니다.' : '후반부 완급 조절이 아쉽습니다.'}`
      : `${persona.narrative_pref === 'nonlinear' ? '너무 단조로운 구조라' : '산만한 구성 탓에'} 집중하기 힘들었습니다.`,

    C: scores.C >= 8
      ? `${hasCharacterFocus ? '인물 묘사가 입체적이고' : '사건의 밀도가 높아'} 핵심 서사 요소에서 강하게 반응했습니다.`
      : scores.C >= 5
      ? `${hasCharacterFocus ? '캐릭터는 매력적이나 심리 묘사가 더 깊어지면 좋겠습니다.' : '사건은 흥미롭지만 인물의 내면이 얕습니다.'}`
      : `제가 중시하는 ${persona.frbr.includes('character') ? '캐릭터 깊이' : '서사 맥락'}이 부족합니다.`,

    D: scores.D >= 8
      ? `${persona.engagement_type === '클립형' ? '핵심 장면들이 강렬해 계속 보게 됩니다.' : '처음부터 끝까지 집중하게 만드는 흡입력이 있습니다.'}`
      : scores.D >= 5
      ? `${persona.engagement_type === '클립형' ? '하이라이트는 있지만 전체를 끝까지 볼 것 같진 않습니다.' : '완주하겠지만 재시청하고 싶은 작품은 아닙니다.'}`
      : `${hasSlowPace && persona.engagement_type === '클립형' ? '페이스가 너무 느려 중간에 포기할 것 같습니다.' : '몰입이 자꾸 끊겨 끝까지 볼 자신이 없습니다.'}`,

    E: scores.E >= 8
      ? `${analysis.activeGenres >= 3 ? '복합 장르 조합이' : '독특한 소재가'} 틈새 팬덤에게 강하게 어필할 것입니다.`
      : scores.E >= 5
      ? `대중적 장르 구성으로 폭넓은 시청자를 확보할 수 있지만 팬덤 결집력은 약할 수 있습니다.`
      : `장르 정체성이 불명확해 타겟 관객층 설정이 어렵습니다.`,
  }

  // 한줄평 생성
  const avg = (scores.A + scores.B + scores.C + scores.D + scores.E) / 5
  let comment = ''
  if (avg >= 8) comment = `${topKo} 팬으로서 적극 추천합니다. ${hasHappyEnding ? '결말도 만족스럽습니다.' : ''}`
  else if (avg >= 7) comment = `전반적으로 좋았습니다. ${scores.B >= 7 ? '서사 구조가 특히 탄탄합니다.' : '몇 가지 보완하면 더 좋을 것 같습니다.'}`
  else if (avg >= 5) {
    if (persona.engagement_type === '클립형') comment = `일부 장면은 인상적이지만 전체를 다 보진 않을 것 같아요.`
    else comment = `제 취향과 완전히 맞지는 않지만 완주는 하겠습니다.`
  } else {
    comment = `솔직히 ${persona.genre_tags[0]} 팬인 제게는 ${topKo} 시나리오는 취향이 아닙니다.`
  }
  if (hasFemaleProtagonist && persona.genre_tags.some(t => ['워맨스','성장','커리어'].includes(t))) {
    comment += ' 여성 주인공의 서사가 반갑습니다.'
  }
  if (hasOpenEnding) comment += ' 열린 결말은 여운은 있지만 호불호가 갈릴 것 같습니다.'

  return { reasons, comment: comment.trim() }
}

// ─── 충돌 페어 감지 ───────────────────────────────────────────────────────────
function detectConflicts(personaResults) {
  const conflicts = []
  const dimLabel = { A:'취향 공동체 적합도', B:'서사 구조', C:'FRBR 서사 요소', D:'몰입도', E:'틈새 취향 지수' }
  for (let i = 0; i < personaResults.length; i++) {
    for (let j = i + 1; j < personaResults.length; j++) {
      for (const dim of ['A','B','C','D','E']) {
        const gap = Math.abs(personaResults[i].scores[dim] - personaResults[j].scores[dim])
        if (gap >= 4) {
          const pa = personaResults[i], pb = personaResults[j]
          const hi = pa.scores[dim] > pb.scores[dim] ? pa : pb
          const lo = pa.scores[dim] > pb.scores[dim] ? pb : pa
          conflicts.push({
            persona_a: pa.persona_id, persona_b: pb.persona_id,
            dimension: dim, score_gap: gap,
            debate_summary: `${hi.name}(${hi.scores[dim]}점, ${hi.taste_community})은 "${dimLabel[dim]} 측면에서 충분히 만족"하지만, ${lo.name}(${lo.scores[dim]}점, ${lo.taste_community})은 "${lo.genre_tags[0]} 선호 기준으로 기대에 못 미쳤다"고 반박합니다.`,
          })
        }
      }
    }
  }
  return conflicts.sort((a, b) => b.score_gap - a.score_gap).slice(0, 4)
}

// ─── 이탈 위험 씬 ─────────────────────────────────────────────────────────────
function generateDropoutScenes(analysis, personaResults) {
  const scenes = []
  const clipPersonas = personaResults.filter(p => p.engagement_type === '클립형')
  const avgClipD = clipPersonas.length
    ? clipPersonas.reduce((s, p) => s + p.scores.D, 0) / clipPersonas.length : 7
  const lowAPersonas = personaResults.filter(p => p.scores.A <= 4)

  if (analysis.hasSlowPace || avgClipD < 6) {
    scenes.push({
      scene_id: 4,
      risk: parseFloat(Math.min(0.92, 0.5 + (6 - Math.min(6, avgClipD)) * 0.07).toFixed(2)),
      reason: `잔잔한 전개 구간: 클립형 페르소나(${clipPersonas.slice(0,2).map(p=>p.name).join(', ')})의 이탈 위험. KCA(2023) 연구에서 클립형 소비는 짧은 호흡 선호를 보임.`,
    })
  }
  if (lowAPersonas.length >= 2) {
    scenes.push({
      scene_id: 7,
      risk: parseFloat(Math.min(0.88, 0.45 + lowAPersonas.length * 0.05).toFixed(2)),
      reason: `장르 취향 불일치: ${lowAPersonas.slice(0,2).map(p=>p.name).join(', ')} 등 ${lowAPersonas.length}명이 중반부 이탈 위험. 취향 공동체 정합성 낮음.`,
    })
  }
  if (analysis.hasOpenEnding) {
    scenes.push({
      scene_id: 10,
      risk: 0.55,
      reason: '열린 결말 구간: 완결성을 중시하는 정주행형 페르소나의 이탈 또는 불만족 위험.',
    })
  }
  if (scenes.length === 0) {
    scenes.push({ scene_id: 5, risk: 0.38, reason: '전반적 이탈 위험 낮음. 장르 불호 페르소나의 중반 집중도 저하 가능성.' })
  }
  return scenes
}

// ─── 도플갱어 추천 ────────────────────────────────────────────────────────────
const DOPPELGANGER_MAP = {
  romance:['나의 아저씨','동백꽃 필 무렵','스물다섯 스물하나','내 남편과 결혼해줘','눈물의 여왕'],
  healing:['응답하라 1988','슬기로운 의사생활','나의 해방일지','우리들의 블루스'],
  thriller:['시그널','비밀의 숲','악의 꽃','마이 네임','더 글로리'],
  horror:['경이로운 소문','스위트홈','무빙','악귀'],
  sf:['고요의 바다','승리호','외계+인','무빙'],
  historical:['킹덤','육룡이 나르샤','미스터 션샤인','정년이'],
  social:['기생충','오징어 게임','D.P.','수리남','이태원 클라쓰'],
  youth:['스물다섯 스물하나','청춘기록','이태원 클라쓰','열여덟의 순간'],
  action:['모범택시','빈센조','무빙','조선 로맨스 스캔들'],
}

function getDoppelgangers(analysis) {
  const top = Object.entries(analysis.scores).sort((a,b) => b[1]-a[1]).slice(0,2).map(([g])=>g)
  return [...new Set(top.flatMap(g => DOPPELGANGER_MAP[g]||[]))].slice(0,4)
}

// ─── 메인 핸들러 ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { scenario } = req.body ?? {}
  if (!scenario || scenario.trim().length < 10) return res.status(400).json({ error: '시나리오가 너무 짧습니다.' })

  const analysis = analyzeScenario(scenario)

  const personaResults = PERSONAS.map((persona, idx) => {
    const scores = scorePersona(persona, analysis, idx)
    const { reasons, comment } = generateReview(persona, scores, analysis)
    return { ...persona, scores, score_reasons: reasons, comment }
  })

  const dims = ['A','B','C','D','E']
  const dimension_averages = {}
  for (const d of dims) {
    dimension_averages[d] = parseFloat(
      (personaResults.reduce((s, p) => s + p.scores[d], 0) / personaResults.length).toFixed(1)
    )
  }

  const overallAvg = Object.values(dimension_averages).reduce((a,b)=>a+b,0)/5
  const overall_grade = overallAvg >= 7.5 ? 'GO' : overallAvg >= 5.0 ? 'CAUTION' : 'PASS'

  const cleanPersonas = personaResults.map(({ data_basis: _d, genre_weights: _gw, narrative_pref: _np, frbr: _f, niche_index: _ni, ...rest }) => rest)

  return res.status(200).json({
    scenario_title: scenario.slice(0, 30).trim() + (scenario.length > 30 ? '...' : ''),
    evaluation_timestamp: new Date().toISOString(),
    overall_grade,
    dimension_averages,
    persona_scores: cleanPersonas,
    conflict_pairs: detectConflicts(personaResults),
    dropout_risk_scenes: generateDropoutScenes(analysis, personaResults),
    doppelganger_recommendations: getDoppelgangers(analysis),
    data_sources: [
      'KCA 미디어이슈&트렌드 vol.61 (2023) — SVOD 장르별 이용시간',
      'KISDI Perspectives (2021) — 성별 드라마 시청비율',
      'KOFIC KoBiz Gen Z 리포트 (2025) — 연령별 극장관람 및 장르 선호',
      'KOCCA 2024 드라마 트렌드 리포트 — 여성서사·Z세대 복합기호',
      '한국갤럽 2024.3~4 — 연령별 드라마/영화 선호도 조사',
    ],
  })
}
