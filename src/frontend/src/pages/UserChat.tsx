import { useState } from 'react'
import { evaluateScenario } from '../lib/api'
import type { EvaluationResult, Message } from '../types'
import GradeCard from '../components/GradeCard'
import RadarChart from '../components/RadarChart'
import ConflictPanel from '../components/ConflictPanel'

type PersonaMode = 'full' | 'quick' | 'genre'

export default function UserChat() {
  const [scenario, setScenario] = useState('')
  const [mode, setMode] = useState<PersonaMode>('full')
  const [messages, setMessages] = useState<Message[]>([])
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const modeLabels: Record<PersonaMode, string> = {
    full: '전체 20개 페르소나',
    quick: '빠른 평가 (5개)',
    genre: '장르별 선택',
  }

  const handleEvaluate = async () => {
    if (!scenario.trim() || scenario.length < 50) {
      setError('시나리오를 50자 이상 입력해주세요.')
      return
    }
    setError('')
    setLoading(true)

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: `[${modeLabels[mode]}] 다음 시나리오를 평가해주세요:\n\n${scenario}`,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const evalResult = await evaluateScenario(scenario)
      setResult(evalResult)

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `평가 완료: **${evalResult.overall_grade}** 등급\n\n${Object.entries(evalResult.dimension_averages)
          .map(([d, s]) => `${d}차원: ${s.toFixed(1)}점`)
          .join(' | ')}`,
        agents_used: ['persona_orchestrator', 'persona_fetcher', 'persona_builder', 'persona_evaluator'],
        skills_used: ['scenario-evaluator', 'persona-ontology-builder', 'debate-facilitator'],
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (e) {
      const msg = e instanceof Error ? e.message : '평가 중 오류가 발생했습니다.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">CREX AI Reviewer</h1>
            <p className="text-xs text-gray-400">한국인 관객 페르소나 기반 시나리오 평가 시스템</p>
          </div>
          <a href="/admin" className="text-xs text-gray-500 hover:text-gray-300">
            관리자 대시보드 →
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 입력 패널 */}
        <div className="space-y-4">
          <div className="card">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              페르소나 모드
            </label>
            <div className="flex gap-2">
              {(['full', 'quick', 'genre'] as PersonaMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    mode === m
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {modeLabels[m]}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              시나리오 입력 (최소 50자)
            </label>
            <textarea
              value={scenario}
              onChange={e => setScenario(e.target.value)}
              placeholder="평가할 시나리오나 대본 내용을 입력하세요..."
              className="w-full h-48 bg-gray-800 text-gray-100 rounded-lg p-3 text-sm resize-none border border-gray-700 focus:outline-none focus:border-purple-500"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">{scenario.length}자</span>
              {error && <span className="text-xs text-red-400">{error}</span>}
            </div>
            <button
              onClick={handleEvaluate}
              disabled={loading}
              className="mt-3 w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading ? '⏳ 20개 페르소나 분석 중...' : '🎬 시나리오 평가 시작'}
            </button>
          </div>

          {/* 채팅 기록 */}
          <div className="card space-y-3 max-h-80 overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-400">AI PM 대화 기록</h3>
            {messages.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-4">
                시나리오를 입력하면 AI PM과의 대화가 시작됩니다
              </p>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg text-sm ${
                    msg.role === 'user'
                      ? 'bg-purple-900/30 border border-purple-800/50'
                      : 'bg-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-gray-500">
                      {msg.role === 'user' ? '👤 사용자' : '🤖 CREX AI'}
                    </span>
                    <button
                      onClick={() => copyToClipboard(msg.content)}
                      className="text-xs text-gray-600 hover:text-gray-400"
                    >
                      복사
                    </button>
                  </div>
                  <p className="text-gray-200 whitespace-pre-wrap">{msg.content}</p>
                  {msg.agents_used && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.agents_used.map(a => (
                        <span key={a} className="text-xs bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded">
                          {a}
                        </span>
                      ))}
                      {msg.skills_used?.map(s => (
                        <span key={s} className="text-xs bg-green-900/40 text-green-300 px-1.5 py-0.5 rounded">
                          /{s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 결과 패널 */}
        <div className="space-y-4">
          {result ? (
            <>
              <GradeCard grade={result.overall_grade} dimensionAverages={result.dimension_averages} />
              <RadarChart scores={result.dimension_averages} />
              <ConflictPanel conflicts={result.conflict_pairs} dropouts={result.dropout_risk_scenes} />
              {result.doppelganger_recommendations.length > 0 && (
                <div className="card">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">🎥 취향 도플갱어 추천작</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.doppelganger_recommendations.map((title, i) => (
                      <span
                        key={i}
                        className="bg-indigo-900/50 text-indigo-300 px-3 py-1.5 rounded-full text-sm"
                      >
                        {title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">🎭</div>
              <p className="text-gray-400 text-sm">
                시나리오를 입력하고 평가를 시작하면<br />
                20개 한국인 관객 페르소나의 분석 결과가 여기에 표시됩니다
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
