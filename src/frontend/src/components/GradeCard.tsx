import type { Grade } from '../types'

interface GradeCardProps {
  grade: Grade
  dimensionAverages: Record<string, number>
}

const gradeConfig = {
  GO: { label: '✅ GO', desc: '상업적 출시 권장', cls: 'bg-emerald-500' },
  CAUTION: { label: '⚠️ CAUTION', desc: '보완 후 출시 검토', cls: 'bg-amber-500' },
  PASS: { label: '❌ PASS', desc: '전면 재검토 필요', cls: 'bg-red-500' },
}

const dimLabel: Record<string, string> = {
  A: 'A. 취향 공동체 적합도',
  B: 'B. 서사 구조',
  C: 'C. FRBR 요소 민감도',
  D: 'D. 몰입도',
  E: 'E. 틈새 취향 지수',
}

export default function GradeCard({ grade, dimensionAverages }: GradeCardProps) {
  const cfg = gradeConfig[grade]
  return (
    <div className="card space-y-4">
      <div className={`${cfg.cls} rounded-lg p-4 text-center`}>
        <div className="text-3xl font-black">{cfg.label}</div>
        <div className="text-sm mt-1 opacity-90">{cfg.desc}</div>
      </div>
      <div className="space-y-2">
        {Object.entries(dimensionAverages).map(([dim, score]) => (
          <div key={dim}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">{dimLabel[dim] || dim}</span>
              <span className="font-bold">{score.toFixed(1)}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(score / 10) * 100}%`,
                  background: score >= 7.5 ? '#10b981' : score >= 5 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
