import type { ConflictPair, DropoutScene } from '../types'

interface ConflictPanelProps {
  conflicts: ConflictPair[]
  dropouts: DropoutScene[]
}

export default function ConflictPanel({ conflicts, dropouts }: ConflictPanelProps) {
  return (
    <div className="space-y-4">
      {conflicts.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            🔥 페르소나 의견 충돌 ({conflicts.length}건)
          </h3>
          <div className="space-y-3">
            {conflicts.map((c, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-purple-400 font-mono">{c.persona_a}</span>
                  <span className="text-gray-500">vs</span>
                  <span className="text-pink-400 font-mono">{c.persona_b}</span>
                  <span className="ml-auto bg-red-900 text-red-300 px-2 py-0.5 rounded text-xs">
                    {c.dimension}차원 Δ{c.score_gap}
                  </span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">{c.debate_summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {dropouts.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            ⚡ 이탈 위험 씬 감지 ({dropouts.length}건)
          </h3>
          <div className="space-y-2">
            {dropouts.map((d, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-800 rounded-lg p-3">
                <div className="text-center">
                  <div className="text-xs text-gray-500">씬</div>
                  <div className="font-bold text-white">{d.scene_id}</div>
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full rounded-full bg-red-500"
                      style={{ width: `${d.risk * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">{d.reason}</p>
                </div>
                <div className="text-red-400 font-bold text-sm">
                  {(d.risk * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
