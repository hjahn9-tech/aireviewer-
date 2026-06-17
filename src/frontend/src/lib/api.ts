import axios from 'axios'
import type { EvaluationResult } from '../types'

const HF_API_BASE = 'https://datasets-server.huggingface.co'
const DATASET = 'nvidia/Nemotron-Personas-Korea'

export async function fetchPersonas(count = 20) {
  const offset = Math.floor(Math.random() * 500)
  const url = `${HF_API_BASE}/rows?dataset=${encodeURIComponent(DATASET)}&config=default&split=train&offset=${offset}&length=${count}`

  const headers: Record<string, string> = {}
  const hfKey = import.meta.env.VITE_HUGGINGFACE_API_KEY
  if (hfKey) headers['Authorization'] = `Bearer ${hfKey}`

  const res = await axios.get(url, { headers })
  return res.data.rows.map((row: { row: Record<string, unknown> }, i: number) => ({
    id: `persona_${String(i + 1).padStart(3, '0')}`,
    ...row.row,
  }))
}

export async function evaluateScenario(scenario: string): Promise<EvaluationResult> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('Anthropic API 키가 설정되지 않았습니다.')

  const systemPrompt = `당신은 CREX AI Reviewer의 오케스트레이터입니다.
한국인 관객 페르소나 20종을 시뮬레이션하여 시나리오를 5차원(A취향공동체적합도, B서사구조, C FRBR요소민감도, D몰입도, E틈새취향지수)으로 평가합니다.
반드시 JSON 형식으로만 응답하세요.`

  const userPrompt = `다음 시나리오를 20개 한국인 관객 페르소나 관점에서 평가하고, 아래 JSON 스키마로 응답하세요:

시나리오:
${scenario}

응답 JSON 스키마:
{
  "scenario_title": "시나리오 제목 추론",
  "evaluation_timestamp": "ISO8601 현재시각",
  "overall_grade": "GO|CAUTION|PASS",
  "dimension_averages": {"A": 0-10, "B": 0-10, "C": 0-10, "D": 0-10, "E": 0-10},
  "persona_scores": [{"persona_id": "persona_001", "name": "이름", "scores": {"A":0,"B":0,"C":0,"D":0,"E":0}}],
  "conflict_pairs": [{"persona_a": "persona_id", "persona_b": "persona_id", "dimension": "A-E", "score_gap": 0, "debate_summary": "토론요약"}],
  "dropout_risk_scenes": [{"scene_id": 1, "risk": 0.0-1.0, "reason": "이유"}],
  "doppelganger_recommendations": ["작품명"]
}

GO: 차원 평균 7.5 이상, CAUTION: 5.0~7.4, PASS: 5.0 미만`

  const res = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
    }
  )

  const text = res.data.content[0].text
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI 응답에서 JSON을 파싱할 수 없습니다.')
  return JSON.parse(jsonMatch[0]) as EvaluationResult
}
