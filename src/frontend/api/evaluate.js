/**
 * CREX AI Reviewer — 평가 엔진 v3.0
 *
 * 점수 계산 파이프라인 (CLAUDE.md §5-3):
 * 1. analyzeScenario  → 포맷 감지 + 장르/서사/감정 피처 추출
 * 2. anti_tags 감점  → 페르소나 비선호 요소 감지 시 A 차원 감점
 * 3. scorePersona    → per-persona evaluation_weights 반영
 * 4. format_sensitivity 보정 → 포맷 친숙도로 점수 압축/증폭
 * 5. FORMAT_DIM_WEIGHTS → 포맷별 차원 가중 평균으로 종합 등급
 */

import { PERSONAS, FORMAT_SIGNALS, FORMAT_DIM_WEIGHTS } from '../src/data/personas.js'

// ─── Anti-tag 키워드 감지기 ───────────────────────────────────────────────────
const ANTI_TAG_DETECTORS = {
  '하드코어 폭력':          t => /고어|잔인한|학살|고문|처형|끔찍한/.test(t),
  '과도한 폭력':            t => /잔인|폭력적|고어|학살/.test(t),
  'SF 세계관 설명 과다':    t => /설정 설명|세계관 소개|시스템 설명|설정집/.test(t),
  '혐오·비하 소재':         t => /혐오|비하|차별|폄훼/.test(t),
  '혐오·차별 묘사':         t => /혐오|차별|비하/.test(t),
  '팬서비스 과다':          t => /팬서비스|케미/.test(t),
  '아이돌 출연 중심':       t => /아이돌|k팝|가수 출신/.test(t),
  '클리셰 해피엔딩':        t => /해피엔딩|행복하게 끝|둘이 함께/.test(t),
  '공식 클리셰':            t => /재벌|오해 해소|신데렐라|기억상실/.test(t),
  '재벌 판타지':            t => /재벌|오너|회장|재벌가/.test(t),
  '비현실적 재벌 신데렐라': t => /재벌|신데렐라|오너/.test(t),
  '로맨스 과다 비중':       t => (t.match(/사랑|연애|로맨스|연인/g) || []).length >= 4,
  '로맨스 강제 삽입':       t => /사랑|연애|로맨스/.test(t),
  '로맨스 과잉 삽입':       t => (t.match(/사랑|연애|로맨스/g) || []).length >= 3,
  '우울한 결말':            t => /비극|슬픈 결말|비운의|죽음으로 끝/.test(t),
  '절망적 엔딩':            t => /절망|희망 없|비극적/.test(t),
  '가족 붕괴 결말':         t => /가족 해체|이혼|가족이 죽|이산가족/.test(t),
  '해피엔딩 강요':          t => /해피엔딩|행복하게/.test(t),
  '느린 전개':              t => /잔잔한|천천히|소소한/.test(t),
  '비현실적 신체 능력':     t => /초인적|초능력|불가능한 신체/.test(t),
  '역사 왜곡':              t => /역사 왜곡|사실 왜곡/.test(t),
  '현대적 재해석 과잉':     t => /트렌디한 사극|현대적 사극/.test(t),
  '클리셰 악당':            t => /전형적인 악당|클리셰 빌런/.test(t),
  '급전개 해피엔딩':        t => /갑자기 해결|급전개/.test(t),
  '19금 내용':              t => /성인|19금|선정적|베드씬/.test(t),
  '강제 이성애 중심화':     t => /남녀 관계|이성 커플/.test(t),
  '클리셰 삼각관계 남용':   t => /삼각관계/.test(t),
  '기성세대 시각 강요':     t => /꼰대|기성세대/.test(t),
  '노력 무의미 결말':       t => /아무리 해도|결국 실패/.test(t),
  '편성 불가 소재':         t => /19금|선정|반사회/.test(t),
  '광고주 기피 요소':       t => /음주 조장|도박/.test(t),
  '시청률 저하 요소':       t => /지나치게 난해한/.test(t),
}

function calcAntiTagPenalty(persona, analysis) {
  const t = analysis.text_lower
  const hitCount = persona.taste_ontology.anti_tags.filter(tag => {
    const fn = ANTI_TAG_DETECTORS[tag]
    return fn ? fn(t) : false
  }).length
  return Math.min(4, hitCount * 1.5)
}

// ─── 장르 키워드 ──────────────────────────────────────────────────────────────
const GENRE_KW = {
  romance:   ['사랑','연인','로맨스','연애','키스','고백','설렘','짝사랑','남자친구','여자친구','이별','재회','연정','두근','감정선'],
  healing:   ['힐링','따뜻','위로','치유','가족','소소','일상','평화','잔잔','온기','감동','포근'],
  thriller:  ['살인','범죄','추리','스릴러','사건','경찰','수사','긴장','추격','공범','음모','배신','반전','비밀','조작','증거'],
  horror:    ['귀신','공포','오컬트','호러','저주','유령','악령','신내림','흉가','괴물','초자연'],
  sf:        ['우주','인공지능','로봇','미래','SF','시간여행','기술','사이버','외계','차원','복제','디스토피아','이세계','능력자','판타지','마법','이능'],
  historical:['조선','고려','역사','사극','궁중','왕','왕비','임금','한복','선비','시대극','근대','일제','무신'],
  social:    ['사회','계층','빈곤','차별','정치','부패','노동','불평등','시위','갑질','비판','체제','현실 고발'],
  youth:     ['청춘','대학교','고등학교','성장','졸업','입시','동아리','첫사랑','교복','취업준비','청년','20대','10대'],
  action:    ['액션','격투','전투','폭발','무기','군인','싸움','총','칼','암살','전쟁','저격'],
}

const GENRE_KO = {
  romance:'로맨스', healing:'힐링', thriller:'범죄·스릴러', horror:'공포·오컬트',
  sf:'SF·판타지', historical:'사극·역사', social:'사회비평', youth:'청춘물', action:'액션',
}

const FORMAT_KO = {
  movie:'영화', legacy_drama:'방송 드라마', ott_drama:'OTT 드라마',
  short_form:'숏폼', webtoon:'웹툰', web_novel:'웹소설', game:'게임',
}

// ─── 시나리오 피처 추출 ───────────────────────────────────────────────────────
function analyzeScenario(text) {
  const t = text.toLowerCase()

  // 포맷 감지
  const fmtHits = {}
  for (const [fmt, signals] of Object.entries(FORMAT_SIGNALS)) {
    fmtHits[fmt] = signals.filter(s => t.includes(s.toLowerCase())).length
  }
  const detectedFormat = Object.entries(fmtHits).sort((a,b) => b[1]-a[1]).find(([,v]) => v > 0)?.[0] || 'ott_drama'

  // 장르 감지
  const genreScores = {}
  for (const [g, kws] of Object.entries(GENRE_KW)) {
    genreScores[g] = kws.filter(k => t.includes(k)).length
  }
  const genreEntries = Object.entries(genreScores).sort((a,b) => b[1]-a[1])
  const topGenre = genreEntries[0][0]
  const topScore = genreEntries[0][1]
  const activeGenres = genreEntries.filter(([,v]) => v > 0).length

  // 서사 피처
  const hasFastPace        = /반전|충격|급전|긴박|속도감|빠른 전개|숨막히/.test(t)
  const hasSlowPace        = /잔잔|천천히|소소|차분|여운|느린/.test(t)
  const hasNonLinear       = /플래시백|과거 회상|비선형|교차 편집|시간이 엇갈|역순/.test(t)
  const hasCharacterFocus  = /캐릭터|인물|주인공|내면|심리|성장|관계|감정선/.test(t)
  const hasEventFocus      = /사건|전투|추격|충돌|갈등|위기|반전|폭발|결전/.test(t)
  const hasHappyEnding     = /해피엔딩|행복한 결말|함께|희망|극복|해결/.test(t)
  const hasSadEnding       = /비극|슬픈 결말|죽음|이별로 끝|비운|상실/.test(t)
  const hasOpenEnding      = /열린 결말|모호한|여운|여지를|불확실/.test(t)
  const hasFemaleProtag    = /여주인공|여성 주인공|여성 서사|여성 중심/.test(t)
  const hasOpeningHook     = /프롤로그|오프닝|첫 장면|갑자기|충격적인 시작|인트로/.test(t)
  const hasConflict        = /갈등|대립|충돌|위기|대결|긴장 관계/.test(t)
  const hasFamilyTheme     = /가족|부모|아버지|어머니|자녀|형제|가정/.test(t)
  const hasWorkplace       = /직장|회사|병원|사무실|직업|커리어/.test(t)

  const darkCnt  = (t.match(/어둠|비극|암울|절망|공포|살인|범죄|복수/g) || []).length
  const lightCnt = (t.match(/따뜻|유쾌|웃음|행복|밝은|설렘|코미디/g) || []).length
  const tone = darkCnt > lightCnt + 1 ? 'dark' : lightCnt > darkCnt + 1 ? 'light' : 'balanced'

  const nicheScore = Math.min(10, 2 + activeGenres * 1.2 + (topScore < 2 ? 2 : 0))

  return {
    text_lower: t, detectedFormat,
    genreScores, topGenre, topScore, activeGenres,
    hasFastPace, hasSlowPace, hasNonLinear,
    hasCharacterFocus, hasEventFocus,
    hasHappyEnding, hasSadEnding, hasOpenEnding,
    hasFemaleProtag, hasOpeningHook, hasConflict,
    hasFamilyTheme, hasWorkplace, tone, nicheScore,
  }
}

// ─── 페르소나별 점수 계산 ─────────────────────────────────────────────────────
function stableHash(personaId, topGenre) {
  const s = personaId + topGenre
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function getNicheIndex(cp) {
  return { '탐색형':0.85, '분석형':0.60, '완주형':0.65, '정주행형':0.45, '클립형':0.35 }[cp] ?? 0.5
}

function scorePersona(persona, analysis) {
  const {
    genreScores, hasFastPace, hasSlowPace, hasNonLinear,
    hasCharacterFocus, hasEventFocus, hasHappyEnding, hasSadEnding, hasOpenEnding,
    hasFemaleProtag, hasOpeningHook, hasConflict, tone,
    activeGenres, nicheScore, detectedFormat,
  } = analysis

  const cp = persona.taste_ontology.consumption_pattern
  const ew = persona.evaluation_weights
  const gw = persona.taste_ontology.genre_weights

  const h = stableHash(persona.id, analysis.topGenre)
  const jitter = (h % 60) / 100  // 0.00 ~ 0.59

  // ── A: 취향 적합도 ──────────────────────────────────────────────────────────
  const activeWeights = Object.entries(genreScores)
    .filter(([,c]) => c > 0).map(([g]) => gw[g] ?? 5)
  const rawA_base = activeWeights.length
    ? activeWeights.reduce((s,w) => s + w, 0) / activeWeights.length : 5
  const antiPenalty = calcAntiTagPenalty(persona, analysis)
  const rawA = Math.max(1, rawA_base - antiPenalty * 0.7)

  // ── B: 서사 구조 ────────────────────────────────────────────────────────────
  let rawB = 5
  if (cp === '클립형') {
    if (hasFastPace)   rawB += 2
    if (hasSlowPace)   rawB -= 2
    if (!hasConflict)  rawB -= 1
  } else if (cp === '탐색형') {
    if (hasNonLinear)                        rawB += 2
    if (!hasHappyEnding && !hasOpenEnding)   rawB += 1
    if (hasCharacterFocus)                   rawB += 1
  } else if (cp === '분석형') {
    if (hasEventFocus)  rawB += 2
    if (hasConflict)    rawB += 1
    if (hasNonLinear)   rawB -= 1
  } else if (cp === '완주형') {
    if (hasConflict)                      rawB += 1
    if (hasNonLinear)                     rawB += 1
    if (hasHappyEnding || hasSadEnding)   rawB += 1
  } else { // 정주행형
    if (!hasNonLinear)      rawB += 1
    if (hasCharacterFocus)  rawB += 1
    if (hasHappyEnding)     rawB += 1
  }
  rawB = Math.max(1, Math.min(10, rawB + (ew.narrative_structure - 0.20) * 10 * 0.5))

  // ── C: FRBR 감도 ────────────────────────────────────────────────────────────
  let rawC = 4
  if (hasCharacterFocus)                           rawC += ew.character_empathy * 12
  if (hasFemaleProtag && ew.character_empathy >= 0.25) rawC += 0.8
  if (hasEventFocus)                               rawC += ew.narrative_structure * 10
  if (hasHappyEnding || hasSadEnding)              rawC += ew.ending_satisfaction * 15
  if (genreScores.social > 0)                      rawC += 0.5
  rawC = Math.min(10, rawC)

  // ── D: 몰입도/후킹 ──────────────────────────────────────────────────────────
  let rawD = 5
  rawD += hasOpeningHook ? 2 : -0.5
  if (cp === '클립형') {
    if (hasFastPace)   rawD += 2
    if (hasSlowPace)   rawD -= 3
    if (genreScores.romance > 0 || genreScores.thriller > 0) rawD += 1
  } else if (cp === '완주형') {
    if (hasSadEnding || hasNonLinear) rawD += 1
    if (hasConflict)                  rawD += 1
  } else if (cp === '정주행형') {
    if (hasCharacterFocus)               rawD += 1.5
    if (hasHappyEnding)                  rawD += 1
    if (hasFamilyTheme || hasWorkplace)  rawD += 0.5
  } else if (cp === '탐색형') {
    if (hasNonLinear)   rawD += 2
    if (hasOpenEnding)  rawD += 1.5
    if (tone === 'dark') rawD += 0.5
  } else { // 분석형
    if (hasConflict)    rawD += 1
    if (genreScores.thriller > 0 || genreScores.social > 0) rawD += 1
    if (hasFastPace)    rawD += 0.5
  }
  rawD += rawA >= 7 ? 1 : rawA <= 3 ? -1 : 0
  rawD = Math.max(1, Math.min(10, rawD + (ew.pacing - 0.15) * 15 * 0.4))

  // ── E: 틈새 지수 ────────────────────────────────────────────────────────────
  const rawE = Math.min(10, getNicheIndex(cp) * 6 + nicheScore * 0.4)

  // ── Format sensitivity 보정 (A~D, E 제외) ────────────────────────────────────
  const fs = persona.sensitivity_profile.format_sensitivity[detectedFormat] ?? 0.7
  const withFS = r => Math.max(1, Math.min(10, 5 + (r - 5) * fs))

  return {
    A: Math.min(10, Math.max(1, Math.round(withFS(rawA) + jitter))),
    B: Math.min(10, Math.max(1, Math.round(withFS(rawB) + jitter * 0.6))),
    C: Math.min(10, Math.max(1, Math.round(withFS(rawC) + jitter * 0.4))),
    D: Math.min(10, Math.max(1, Math.round(withFS(rawD) + jitter * 0.7))),
    E: Math.min(10, Math.max(1, Math.round(rawE + jitter * 0.5))),
  }
}

// ─── 리뷰 생성 ───────────────────────────────────────────────────────────────
function generateReview(persona, scores, analysis) {
  const { topGenre, hasFastPace, hasSlowPace, hasNonLinear,
    hasCharacterFocus, hasOpenEnding, hasFemaleProtag, detectedFormat, tone } = analysis

  const cp   = persona.taste_ontology.consumption_pattern
  const tc   = persona.taste_ontology.taste_community
  const topKo = GENRE_KO[topGenre] || '이 장르'
  const fmtKo = FORMAT_KO[detectedFormat] || 'OTT 드라마'
  const firedTags = persona.taste_ontology.anti_tags.filter(tag => {
    const fn = ANTI_TAG_DETECTORS[tag]; return fn ? fn(analysis.text_lower) : false
  })

  const reasons = {
    A: scores.A >= 8
      ? `[${tc}] 취향과 ${topKo} 시나리오가 높은 정합성을 보입니다.`
      : scores.A >= 5
        ? firedTags.length
          ? `${topKo}는 관심 범위지만 "${firedTags[0]}" 요소로 감점. 취향과 일부 상충.`
          : `${topKo}는 관심 범위이나 핵심 선호(${persona.taste_ontology.genre_tags[0]})와 완전 일치하지 않음.`
        : firedTags.length
          ? `"${firedTags.slice(0,2).join('", "')}" 요소 감지. 취향 범위 밖의 시나리오.`
          : `${persona.taste_ontology.genre_tags[0]} 선호자로서 ${topKo} 시나리오는 취향과 거리가 있음.`,

    B: scores.B >= 8
      ? `${hasNonLinear ? '비선형 구성이 신선하게' : '안정적인 구조가'} ${cp} 소비 패턴에 최적화됨.`
      : scores.B >= 5
        ? hasFastPace && cp === '클립형'
          ? '빠른 전개로 초반 집중도는 좋으나 후반 감정 소화 여지 필요.'
          : hasSlowPace
            ? '잔잔한 페이스는 정서적으로 좋으나 긴장감 유지 보완 필요.'
            : '서사 구조는 무난하지만 특별한 강점이 보이지 않음.'
        : cp === '클립형'
          ? '전개가 너무 느려 클립형 소비에 맞지 않음.'
          : cp === '탐색형'
            ? '너무 공식적인 구조라 실험적 서사를 찾는 입장에서 아쉬움.'
            : '서사 구조가 소비 패턴과 맞지 않아 집중도 유지 어려움.',

    C: scores.C >= 8
      ? hasCharacterFocus
        ? `인물 내면 묘사가 입체적. "${tc}" 취향에서 핵심 서사 요소에 강하게 반응.`
        : '사건 밀도와 감정 씬이 충분해 서사 요소 민감도 충족.'
      : scores.C >= 5
        ? '캐릭터는 매력적이나 심리 묘사가 더 깊어지면 좋겠음.'
        : '핵심 서사 요소가 부족하거나 이 시청자의 감수성과 맞지 않음.',

    D: scores.D >= 8
      ? cp === '클립형'
        ? '핵심 장면이 강렬해 계속 찾아보게 되는 구조.'
        : cp === '탐색형'
          ? '독특한 서사 흐름이 새로운 탐색 의욕을 자극.'
          : cp === '분석형'
            ? `${fmtKo} 편성 기준 화제성과 흡입력 모두 유망.`
            : '처음부터 끝까지 집중을 유지하는 흡입력 있음.'
      : scores.D >= 5
        ? cp === '클립형'
          ? '하이라이트는 있지만 전체를 끝까지 볼 것 같지는 않음.'
          : '완주하겠지만 재시청이나 적극 추천 의욕은 낮음.'
        : cp === '클립형'
          ? '첫 장면부터 집중을 끌지 못함. 이탈 가능성 높음.'
          : '몰입이 끊겨 끝까지 볼 동기가 부족함.',

    E: scores.E >= 8
      ? `장르 조합의 독창성이 "${tc}" 팬덤에서 강한 바이럴 반응을 이끌 것.`
      : scores.E >= 5
        ? '대중적 장르 구성으로 접근성 폭넓음. 팬덤 결집력은 중간 수준.'
        : '장르 정체성이 불명확해 틈새 팬덤 코드 부재.',
  }

  const avg = (scores.A + scores.B + scores.C + scores.D + scores.E) / 5
  let comment =
    avg >= 8
      ? cp === '클립형'   ? `${topKo} 팬으로서 이 시나리오 계속 찾아볼 것 같아요.`
      : cp === '탐색형'   ? '실험적 서사 안에서 이 작품만의 색깔이 보입니다. 주목할 만합니다.'
      : cp === '분석형'   ? `${fmtKo} 기준 상업성과 화제성 모두 유망. 편성 가치 있음.`
                          : `${topKo} 좋아하는 입장에서 적극 추천하겠습니다.`
      : avg >= 6.5
      ? cp === '클립형'   ? '일부 장면은 인상적. 클립으로 공유는 할 것 같아요.'
                          : '전반적으로 괜찮습니다. 몇 가지 보완하면 훨씬 좋아질 것 같아요.'
      : avg >= 5
      ? firedTags.length  ? `관심은 가지만 "${firedTags[0]}" 요소 때문에 선뜻 추천하기 어렵네요.`
                          : '취향과 완전히 맞지는 않지만 나름의 매력은 있습니다.'
                          : `솔직히 제 취향과는 거리가 멀어요. ${persona.taste_ontology.genre_tags[0]} 팬에게는 권하기 어렵겠습니다.`

  if (hasFemaleProtag && (tc.includes('여성') || persona.taste_ontology.genre_tags.some(t => ['성장','커리어','워맨스'].includes(t)))) {
    comment += ' 여성 주인공 서사가 반갑습니다.'
  }
  if (hasOpenEnding) comment += ' 열린 결말은 여운 있지만 호불호가 갈릴 것 같습니다.'

  return { reasons, comment: comment.trim() }
}

// ─── 충돌 페어 감지 (gap ≥ 3, CLAUDE.md §5-5) ────────────────────────────────
function detectConflicts(results) {
  const pairs = []
  const dimLabel = { A:'취향 공동체 적합도', B:'서사 구조', C:'FRBR 서사 요소', D:'몰입도', E:'틈새 지수' }
  for (let i = 0; i < results.length; i++) {
    for (let j = i + 1; j < results.length; j++) {
      for (const dim of ['A','B','C','D','E']) {
        const gap = Math.abs(results[i].scores[dim] - results[j].scores[dim])
        if (gap >= 3) {
          const hi = results[i].scores[dim] > results[j].scores[dim] ? results[i] : results[j]
          const lo = results[i].scores[dim] > results[j].scores[dim] ? results[j] : results[i]
          pairs.push({
            persona_a: results[i].persona_id,
            persona_b: results[j].persona_id,
            dimension: dim,
            score_gap: gap,
            debate_summary: `${hi.name}(${hi.scores[dim]}점, ${hi.taste_community})은 "${dimLabel[dim]} 측면에서 충분히 만족"하지만, ${lo.name}(${lo.scores[dim]}점, ${lo.taste_community})은 "${lo.genre_tags?.[0] ?? '해당'} 선호 기준으로 기대에 못 미쳤다"고 반박합니다.`,
          })
        }
      }
    }
  }
  return pairs.sort((a,b) => b.score_gap - a.score_gap).slice(0, 5)
}

// ─── 이탈 위험 씬 ────────────────────────────────────────────────────────────
function generateDropoutScenes(analysis, results) {
  const scenes = []
  const clipFans = results.filter(r => r.engagement_type === '클립형')
  const avgClipD = clipFans.length
    ? clipFans.reduce((s,r) => s + r.scores.D, 0) / clipFans.length : 7
  const lowA = results.filter(r => r.scores.A <= 4)

  if (analysis.hasSlowPace || avgClipD < 6) {
    const fmtD = (FORMAT_DIM_WEIGHTS[analysis.detectedFormat]?.D ?? 0.2) * 100
    scenes.push({
      scene_id: 4,
      risk: parseFloat(Math.min(0.92, 0.5 + (6 - Math.min(6, avgClipD)) * 0.07).toFixed(2)),
      reason: `잔잔한 전개 구간: 클립형 페르소나(${clipFans.slice(0,2).map(p=>p.name).join(', ')})의 이탈 위험. ${FORMAT_KO[analysis.detectedFormat]} D차원 가중치(${fmtD.toFixed(0)}%) 미충족.`,
    })
  }
  if (lowA.length >= 3) {
    scenes.push({
      scene_id: 7,
      risk: parseFloat(Math.min(0.88, 0.4 + lowA.length * 0.04).toFixed(2)),
      reason: `장르 취향 불일치: ${lowA.slice(0,3).map(p=>p.name).join(', ')} 등 ${lowA.length}명 중반부 이탈 위험.`,
    })
  }
  if (analysis.hasOpenEnding) {
    scenes.push({
      scene_id: 10,
      risk: 0.52,
      reason: '열린 결말: 정주행형·완주형 페르소나의 카타르시스 미달 가능성. 재시청 의욕 저하 위험.',
    })
  }
  if (scenes.length === 0) {
    scenes.push({ scene_id: 5, risk: 0.35, reason: '전반적 이탈 위험 낮음. 장르 불호 페르소나의 중반 집중도 저하 가능성만 존재.' })
  }
  return scenes
}

// ─── 도플갱어 추천 ────────────────────────────────────────────────────────────
const DOPPELGANGERS = {
  romance:   ['나의 아저씨','동백꽃 필 무렵','눈물의 여왕','내 남편과 결혼해줘','스물다섯 스물하나'],
  healing:   ['응답하라 1988','슬기로운 의사생활','나의 해방일지','우리들의 블루스'],
  thriller:  ['시그널','비밀의 숲','악의 꽃','마이 네임','더 글로리'],
  horror:    ['경이로운 소문','스위트홈','무빙','악귀','파묘'],
  sf:        ['고요의 바다','무빙','외계+인','승리호','지금 우리 학교는'],
  historical:['킹덤','미스터 션샤인','정년이','육룡이 나르샤','연모'],
  social:    ['오징어 게임','기생충','D.P.','이태원 클라쓰','수리남'],
  youth:     ['스물다섯 스물하나','청춘기록','열여덟의 순간','약한영웅'],
  action:    ['모범택시','빈센조','무빙','조선 로맨스 스캔들'],
}

function getDoppelgangers(analysis) {
  const top = Object.entries(analysis.genreScores).sort((a,b) => b[1]-a[1]).slice(0,2).map(([g])=>g)
  return [...new Set(top.flatMap(g => DOPPELGANGERS[g] || []))].slice(0, 4)
}

// ─── 메인 핸들러 ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { scenario } = req.body ?? {}
  if (!scenario || scenario.trim().length < 10) return res.status(400).json({ error: '시나리오가 너무 짧습니다.' })

  const analysis = analyzeScenario(scenario)
  const dimWeights = FORMAT_DIM_WEIGHTS[analysis.detectedFormat]

  const personaResults = PERSONAS.map(persona => {
    const scores = scorePersona(persona, analysis)
    const { reasons, comment } = generateReview(persona, scores, analysis)
    return {
      persona_id:      persona.id,
      name:            persona.name,
      age:             persona.demographics.age,
      gender:          persona.demographics.gender,
      occupation:      persona.demographics.occupation,
      region:          persona.demographics.region,
      taste_community: persona.taste_ontology.taste_community,
      engagement_type: persona.taste_ontology.consumption_pattern,
      genre_tags:      persona.taste_ontology.genre_tags,
      scores, score_reasons: reasons, comment,
    }
  })

  const dims = ['A','B','C','D','E']
  const dimension_averages = {}
  for (const d of dims) {
    dimension_averages[d] = parseFloat(
      (personaResults.reduce((s,p) => s + p.scores[d], 0) / personaResults.length).toFixed(1)
    )
  }

  // 포맷별 차원 가중 종합 점수
  const weightedScore = dims.reduce((s, d) => s + dimension_averages[d] * (dimWeights[d] ?? 0.2), 0)
  const overall_grade = weightedScore >= 7.5 ? 'GO' : weightedScore >= 5.0 ? 'CAUTION' : 'PASS'

  return res.status(200).json({
    scenario_title:               scenario.slice(0, 30).trim() + (scenario.length > 30 ? '...' : ''),
    evaluation_timestamp:         new Date().toISOString(),
    detected_format:              analysis.detectedFormat,
    detected_format_label:        FORMAT_KO[analysis.detectedFormat],
    overall_grade,
    weighted_score:               parseFloat(weightedScore.toFixed(2)),
    dimension_averages,
    persona_scores:               personaResults,
    conflict_pairs:               detectConflicts(personaResults),
    dropout_risk_scenes:          generateDropoutScenes(analysis, personaResults),
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
