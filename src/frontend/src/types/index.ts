export type Grade = 'GO' | 'CAUTION' | 'PASS'

export type DimensionScores = Record<string, number>

export interface PersonaScore {
  persona_id: string
  name: string
  age?: number
  gender?: string
  occupation?: string
  region?: string
  taste_community?: string
  engagement_type?: string
  genre_tags?: string[]
  scores: DimensionScores
  score_reasons?: Record<string, string>
  comment?: string
}

export interface ConflictPair {
  persona_a: string
  persona_b: string
  dimension: string
  score_gap: number
  debate_summary: string
}

export interface DropoutScene {
  scene_id: number
  risk: number
  reason: string
}

export interface EvaluationResult {
  scenario_title: string
  evaluation_timestamp: string
  overall_grade: Grade
  dimension_averages: DimensionScores
  persona_scores: PersonaScore[]
  conflict_pairs: ConflictPair[]
  dropout_risk_scenes: DropoutScene[]
  doppelganger_recommendations: string[]
  data_sources?: string[]
  _mock?: boolean
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  agents_used?: string[]
  skills_used?: string[]
  created_at: string
}

export interface Conversation {
  id: string
  user_id?: string
  created_at: string
  scenario_title?: string
  grade?: Grade
  messages?: Message[]
}

export interface KnowledgeBaseItem {
  id: string
  title: string
  content?: string
  file_url?: string
  category?: string
  created_at: string
}
