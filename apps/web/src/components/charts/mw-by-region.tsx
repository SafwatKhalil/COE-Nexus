'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const COLORS = [
  'oklch(0.48 0.18 255)',
  'oklch(0.55 0.18 160)',
  'oklch(0.65 0.18 50)',
  'oklch(0.55 0.22 300)',
  'oklch(0.60 0.22 30)',
  'oklch(0.50 0.16 200)',
]

interface Props {
  data: Array<{ region: string; totalTargetMw: number; siteCount: number }>
}

export function MwByRegionChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barCategoryGap="35%">
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 240)" vertical={false} />
        <XAxis
          dataKey="region"
          tick={{ fontSize: 11, fill: 'oklch(0.52 0.01 240)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `${v}MW`}
          tick={{ fontSize: 11, fill: 'oklch(0.52 0.01 240)' }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip
          formatter={(v: number) => [`${v.toLocaleString()} MW`, 'Target']}
          contentStyle={{
            border: '1px solid oklch(0.91 0.005 240)',
            borderRadius: '8px',
            fontSize: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
          cursor={{ fill: 'oklch(0.96 0.005 240)' }}
        />
        <Bar dataKey="totalTargetMw" radius={[4, 4, 0, 0]}>
          {data.map((_, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
