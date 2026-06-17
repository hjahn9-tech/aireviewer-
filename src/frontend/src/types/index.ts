export type Grade = 'GO' | 'CAUTION' | 'PASS'

export interface Persona {
  id: string
  name: string
  age: number
  gender: string
  occupation: string
  region: string
  raw_profile: string
}

export interface AudiencePersona {
  id: string
  name: string
  taste_community: string
  narrative_preference: string
  frbr_sensitivity: string[]
  engagement_type: string
  niche_index: number
  genre_tags: string[]
  kofic_alignment: Record<string, number>
  doppelganger_works: string[]
}

export type DimensionScores = Record<string, number>

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
  persona_scores: Array<{ persona_id: string; scores: DimensionScores }>
  conflict_pairs: ConflictPair[]
  dropout_risk_scenes: DropoutScene[]
  doppelganger_recommendations: string[]
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
