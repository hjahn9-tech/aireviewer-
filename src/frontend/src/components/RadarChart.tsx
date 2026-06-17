import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'

interface RadarChartProps {
  scores: Record<string, number>
}

export default function RadarChart({ scores }: RadarChartProps) {
  const data = Object.entries(scores).map(([dim, val]) => ({
    subject: dim,
    score: val,
    fullMark: 10,
  }))

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-400 mb-3">5차원 레이더 분석</h3>
      <ResponsiveContainer width="100%" height={250}>
        <RechartsRadar data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <Radar
            name="점수"
            dataKey="score"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.4}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  )
}
