import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Conversation, KnowledgeBaseItem } from '../types'

type Tab = 'conversations' | 'personas' | 'knowledge'

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('conversations')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeBaseItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadContent, setUploadContent] = useState('')

  useEffect(() => {
    if (tab === 'conversations') loadConversations()
    if (tab === 'knowledge') loadKnowledge()
  }, [tab])

  async function loadConversations() {
    setLoading(true)
    const { data } = await supabase
      .from('conversations')
      .select('*, messages(*)')
      .order('created_at', { ascending: false })
      .limit(50)
    setConversations((data as Conversation[]) || [])
    setLoading(false)
  }

  async function loadKnowledge() {
    setLoading(true)
    const { data } = await supabase
      .from('knowledge_base')
      .select('*')
      .order('created_at', { ascending: false })
    setKnowledgeItems((data as KnowledgeBaseItem[]) || [])
    setLoading(false)
  }

  async function addKnowledge() {
    if (!uploadTitle.trim()) return
    await supabase.from('knowledge_base').insert({
      title: uploadTitle,
      content: uploadContent,
      category: 'manual',
    })
    setUploadTitle('')
    setUploadContent('')
    loadKnowledge()
  }

  async function deleteKnowledge(id: string) {
    await supabase.from('knowledge_base').delete().eq('id', id)
    loadKnowledge()
  }

  const gradeColor: Record<string, string> = {
    GO: 'text-emerald-400',
    CAUTION: 'text-amber-400',
    PASS: 'text-red-400',
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">CREX 관리자 대시보드</h1>
            <p className="text-xs text-gray-400">대화 기록 · 페르소나 온톨로지 · Knowledge Base 관리</p>
          </div>
          <a href="/" className="text-xs text-gray-500 hover:text-gray-300">
            ← 사용자 화면
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* 탭 */}
        <div className="flex gap-1 mb-6 bg-gray-900 p-1 rounded-lg w-fit">
          {(['conversations', 'personas', 'knowledge'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === t ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t === 'conversations' ? '💬 대화 기록' : t === 'personas' ? '👥 페르소나 온톨로지' : '📚 Knowledge Base'}
            </button>
          ))}
        </div>

        {/* 대화 기록 탭 */}
        {tab === 'conversations' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-2">
              <h2 className="text-sm font-medium text-gray-400 mb-3">
                전체 대화 ({conversations.length}건)
              </h2>
              {loading ? (
                <div className="text-center py-8 text-gray-500">불러오는 중...</div>
              ) : conversations.length === 0 ? (
                <div className="card text-center py-8 text-gray-500 text-sm">
                  대화 기록이 없습니다.<br />
                  Supabase 연동 후 이용 가능합니다.
                </div>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => setSelected(conv)}
                    className={`card cursor-pointer hover:border-purple-700 transition-colors ${
                      selected?.id === conv.id ? 'border-purple-600' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-medium text-white truncate flex-1">
                        {conv.scenario_title || '제목 없음'}
                      </div>
                      {conv.grade && (
                        <span className={`text-xs font-bold ml-2 ${gradeColor[conv.grade]}`}>
                          {conv.grade}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(conv.created_at).toLocaleString('ko-KR')}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="lg:col-span-2">
              {selected ? (
                <div className="card space-y-4">
                  <h2 className="font-semibold text-white">{selected.scenario_title || '대화 상세'}</h2>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selected.messages?.map(msg => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg text-sm ${
                          msg.role === 'user' ? 'bg-purple-900/20' : 'bg-gray-800'
                        }`}
                      >
                        <span className="text-xs text-gray-500 block mb-1">
                          {msg.role === 'user' ? '👤 사용자' : '🤖 CREX AI'}
                        </span>
                        <p className="text-gray-200 whitespace-pre-wrap">{msg.content}</p>
                        {msg.agents_used && (
                          <div className="mt-2 p-2 bg-gray-900 rounded text-xs">
                            <div className="text-gray-500 mb-1">사용된 에이전트 & 스킬:</div>
                            <div className="flex flex-wrap gap-1">
                              {(msg.agents_used as unknown as string[]).map((a: string) => (
                                <span key={a} className="bg-blue-900/40 text-blue-300 px-1.5 py-0.5 rounded">{a}</span>
                              ))}
                              {(msg.skills_used as unknown as string[] || []).map((s: string) => (
                                <span key={s} className="bg-green-900/40 text-green-300 px-1.5 py-0.5 rounded">/{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card flex items-center justify-center py-20 text-gray-500 text-sm">
                  좌측에서 대화를 선택하세요
                </div>
              )}
            </div>
          </div>
        )}

        {/* 페르소나 온톨로지 탭 */}
        {tab === 'personas' && (
          <div className="card">
            <h2 className="text-sm font-medium text-gray-400 mb-4">페르소나 온톨로지 JSON 관리</h2>
            <p className="text-gray-500 text-sm mb-4">
              Supabase persona_ontology 테이블과 연동됩니다. DB 설정 후 이용 가능합니다.
            </p>
            <div className="bg-gray-800 rounded-lg p-4 font-mono text-xs text-gray-400 overflow-auto max-h-96">
              {`{
  "audience_personas": [
    {
      "id": "persona_001",
      "name": "예시 페르소나",
      "taste_community": "로맨틱 드라마 & 감성 힐링",
      "narrative_preference": "기승전결 선형 구조",
      "frbr_sensitivity": ["캐릭터 중심", "감정 사건"],
      "engagement_type": "정주행형",
      "niche_index": 0.72,
      "genre_tags": ["로맨스", "힐링", "직장물"],
      "kofic_alignment": {"sf_thriller": 0.2, "horror": 0.1, "historical": 0.3},
      "doppelganger_works": ["나의 아저씨", "동백꽃 필 무렵"]
    }
  ]
}`}
            </div>
          </div>
        )}

        {/* Knowledge Base 탭 */}
        {tab === 'knowledge' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-sm font-medium text-gray-400 mb-4">Knowledge Base 추가</h2>
              <div className="space-y-3">
                <input
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  placeholder="제목"
                  className="w-full bg-gray-800 text-gray-100 rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:border-purple-500"
                />
                <textarea
                  value={uploadContent}
                  onChange={e => setUploadContent(e.target.value)}
                  placeholder="내용 (선택)"
                  className="w-full h-24 bg-gray-800 text-gray-100 rounded-lg px-3 py-2 text-sm border border-gray-700 resize-none focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={addKnowledge}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  추가
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8 text-gray-500">불러오는 중...</div>
              ) : knowledgeItems.length === 0 ? (
                <div className="card text-center py-8 text-gray-500 text-sm">
                  등록된 Knowledge Base 항목이 없습니다.
                </div>
              ) : (
                knowledgeItems.map(item => (
                  <div key={item.id} className="card flex items-start justify-between">
                    <div>
                      <div className="font-medium text-white text-sm">{item.title}</div>
                      {item.content && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.content}</p>
                      )}
                      <span className="text-xs text-gray-600">
                        {new Date(item.created_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteKnowledge(item.id)}
                      className="text-xs text-red-500 hover:text-red-400 ml-4 shrink-0"
                    >
                      삭제
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
