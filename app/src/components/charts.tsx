import { useMemo, useRef, useState } from 'react'
import { fmtNum, fmtCost } from '@/lib/format'

/* ================= Sparkline ================= */
export function Sparkline({ data, color = '#7c5cfc', width = 120, height = 34, fill = true }: {
  data: number[]; color?: string; width?: number; height?: number; fill?: boolean
}) {
  const id = useMemo(() => `sp${Math.random().toString(36).slice(2, 8)}`, [])
  if (data.length < 2) return null
  const max = Math.max(...data) || 1
  const min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => [(i / (data.length - 1)) * width, height - 3 - ((v - min) / range) * (height - 6)] as const)
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  return (
    <svg width={width} height={height} className="block">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {fill && <path d={`${line} L${width},${height} L0,${height} Z`} fill={`url(#${id})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

/* ================= Shared hover hook ================= */
function useHover() {
  const ref = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const onMove = (e: React.MouseEvent, n: number) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const idx = Math.round((x / rect.width) * (n - 1))
    setHover(Math.max(0, Math.min(n - 1, idx)))
  }
  return { ref, hover, setHover, onMove }
}

const AXIS = 'rgba(255,255,255,0.05)'
const TICK = '#55555c'

interface Pt { t: number; [k: string]: number }

/* ================= Stacked Area ================= */
export function StackedArea({ data, series, height = 220, money = false, xFmt }: {
  data: Pt[]
  series: { key: string; color: string; label: string }[]
  height?: number
  money?: boolean
  xFmt: (t: number) => string
}) {
  const { ref, hover, setHover, onMove } = useHover()
  const W = 800, H = height, padB = 22, padT = 10
  const id = useMemo(() => Math.random().toString(36).slice(2, 8), [])
  const n = data.length
  const stacked = data.map((d) => {
    let acc = 0
    return series.map((s) => { const v0 = acc; acc += d[s.key] || 0; return [v0, acc] as const })
  })
  const max = Math.max(...stacked.map((s) => s[series.length - 1]?.[1] ?? 0), 1)
  const x = (i: number) => (i / (n - 1)) * W
  const y = (v: number) => padT + (1 - v / max) * (H - padB - padT)
  const fmt = money ? fmtCost : fmtNum

  return (
    <div ref={ref} className="relative w-full" onMouseMove={(e) => onMove(e, n)} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" preserveAspectRatio="none" style={{ height }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`${id}-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.32} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={0} x2={W} y1={padT + f * (H - padB - padT)} y2={padT + f * (H - padB - padT)} stroke={AXIS} strokeWidth={1} />
        ))}
        {series.map((s, si) => {
          const top = stacked.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[si][1]).toFixed(1)}`).join(' ')
          const bottom = stacked.map((p, i) => `L${x(i).toFixed(1)},${y(p[si][0]).toFixed(1)}`).reverse().join(' ')
          const line = stacked.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[si][1]).toFixed(1)}`).join(' ')
          return (
            <g key={s.key}>
              <path d={`${top} ${bottom} Z`} fill={`url(#${id}-${si})`} />
              <path d={line} fill="none" stroke={s.color} strokeWidth={1.6} strokeLinejoin="round" />
            </g>
          )
        })}
        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.25)" strokeWidth={1} strokeDasharray="3 3" />
        )}
        {[0, Math.floor(n / 2), n - 1].map((i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} fontSize={10} fill={TICK} className="mono">
            {xFmt(data[i].t)}
          </text>
        ))}
      </svg>
      {hover !== null && (
        <div
          className="absolute pointer-events-none z-20 rounded-lg border border-white/10 px-3 py-2 shadow-xl shadow-black/60"
          style={{
            background: '#141416',
            left: `${(hover / (n - 1)) * 100}%`,
            top: 8,
            transform: hover > n / 2 ? 'translateX(calc(-100% - 10px))' : 'translateX(10px)',
          }}
        >
          <div className="text-[10px] t-3 mono mb-1">{xFmt(data[hover].t)}</div>
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-2 text-[11px]">
              <span className="h-[6px] w-[6px] rounded-full" style={{ background: s.color }} />
              <span className="t-3">{s.label}</span>
              <span className="mono t-1 ml-auto pl-3 font-medium">{fmt(data[hover][s.key] || 0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ================= Multi Line ================= */
export function LinesChart({ data, series, height = 220, xFmt }: {
  data: Pt[]
  series: { key: string; color: string; label: string; dash?: string }[]
  height?: number
  xFmt: (t: number) => string
}) {
  const { ref, hover, setHover, onMove } = useHover()
  const W = 800, H = height, padB = 22, padT = 10
  const n = data.length
  const max = Math.max(...data.flatMap((d) => series.map((s) => d[s.key] || 0)), 1)
  const x = (i: number) => (i / (n - 1)) * W
  const y = (v: number) => padT + (1 - v / max) * (H - padB - padT)

  return (
    <div ref={ref} className="relative w-full" onMouseMove={(e) => onMove(e, n)} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" preserveAspectRatio="none" style={{ height }}>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={0} x2={W} y1={padT + f * (H - padB - padT)} y2={padT + f * (H - padB - padT)} stroke={AXIS} strokeWidth={1} />
        ))}
        {series.map((s) => {
          const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d[s.key] || 0).toFixed(1)}`).join(' ')
          return <path key={s.key} d={line} fill="none" stroke={s.color} strokeWidth={1.6} strokeDasharray={s.dash} strokeLinejoin="round" />
        })}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.25)" strokeWidth={1} strokeDasharray="3 3" />
            {series.map((s) => (
              <circle key={s.key} cx={x(hover)} cy={y(data[hover][s.key] || 0)} r={3} fill={s.color} stroke="#0a0a0a" strokeWidth={1.5} />
            ))}
          </g>
        )}
        {[0, Math.floor(n / 2), n - 1].map((i) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} fontSize={10} fill={TICK} className="mono">
            {xFmt(data[i].t)}
          </text>
        ))}
      </svg>
      {hover !== null && (
        <div
          className="absolute pointer-events-none z-20 rounded-lg border border-white/10 px-3 py-2 shadow-xl shadow-black/60"
          style={{
            background: '#141416',
            left: `${(hover / (n - 1)) * 100}%`,
            top: 8,
            transform: hover > n / 2 ? 'translateX(calc(-100% - 10px))' : 'translateX(10px)',
          }}
        >
          <div className="text-[10px] t-3 mono mb-1">{xFmt(data[hover].t)}</div>
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-2 text-[11px]">
              <span className="h-[6px] w-[6px] rounded-full" style={{ background: s.color }} />
              <span className="t-3">{s.label}</span>
              <span className="mono t-1 ml-auto pl-3 font-medium">{Math.round(data[hover][s.key] || 0)} ms</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ================= Grouped Bars ================= */
export function BarsChart({ data, series, height = 220, xFmt }: {
  data: Pt[]
  series: { key: string; color: string; label: string }[]
  height?: number
  xFmt: (t: number) => string
}) {
  const { ref, hover, setHover, onMove } = useHover()
  const W = 800, H = height, padB = 22, padT = 10
  const n = data.length
  const max = Math.max(...data.flatMap((d) => series.map((s) => d[s.key] || 0)), 1)
  const slot = W / n
  const bw = Math.min(14, (slot * 0.55) / series.length)
  const y = (v: number) => padT + (1 - v / max) * (H - padB - padT)

  return (
    <div ref={ref} className="relative w-full" onMouseMove={(e) => onMove(e, n)} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full block" preserveAspectRatio="none" style={{ height }}>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={0} x2={W} y1={padT + f * (H - padB - padT)} y2={padT + f * (H - padB - padT)} stroke={AXIS} strokeWidth={1} />
        ))}
        {hover !== null && (
          <rect x={hover * slot} y={padT} width={slot} height={H - padB - padT} fill="rgba(255,255,255,0.04)" rx={3} />
        )}
        {data.map((d, i) => (
          <g key={i}>
            {series.map((s, si) => {
              const v = d[s.key] || 0
              const bx = i * slot + slot / 2 - (bw * series.length) / 2 + si * bw
              return (
                <rect
                  key={s.key}
                  x={bx} y={y(v)} width={bw - 1.5} height={Math.max(1, H - padB - y(v))}
                  rx={2} fill={s.color} opacity={hover === null || hover === i ? (si === 0 ? 0.95 : 0.55) : 0.25}
                  style={{ transition: 'opacity .15s' }}
                />
              )
            })}
          </g>
        ))}
        {[0, Math.floor(n / 2), n - 1].map((i) => (
          <text key={i} x={i * slot + slot / 2} y={H - 6} textAnchor="middle" fontSize={10} fill={TICK} className="mono">
            {xFmt(data[i].t)}
          </text>
        ))}
      </svg>
      {hover !== null && (
        <div
          className="absolute pointer-events-none z-20 rounded-lg border border-white/10 px-3 py-2 shadow-xl shadow-black/60"
          style={{
            background: '#141416',
            left: `${((hover + 0.5) / n) * 100}%`,
            top: 8,
            transform: hover > n / 2 ? 'translateX(calc(-100% - 10px))' : 'translateX(10px)',
          }}
        >
          <div className="text-[10px] t-3 mono mb-1">{xFmt(data[hover].t)}</div>
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-2 text-[11px]">
              <span className="h-[6px] w-[6px] rounded-sm" style={{ background: s.color }} />
              <span className="t-3">{s.label}</span>
              <span className="mono t-1 ml-auto pl-3 font-medium">{fmtNum(data[hover][s.key] || 0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ================= Donut ================= */
export function Donut({ items, size = 150, thickness = 16 }: {
  items: { label: string; value: number; color: string }[]
  size?: number
  thickness?: number
}) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  let acc = 0
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} className="shrink-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={thickness} />
        {items.map((it, i) => {
          const frac = it.value / total
          const dash = frac * c
          const offset = -acc * c
          acc += frac
          return (
            <circle
              key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={it.color} strokeWidth={thickness}
              strokeDasharray={`${Math.max(0, dash - 2)} ${c}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray .6s ease, stroke-dashoffset .6s ease' }}
            />
          )
        })}
      </svg>
      <div className="flex flex-col gap-2 min-w-0">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-[7px] w-[7px] rounded-full shrink-0" style={{ background: it.color }} />
            <span className="t-2 truncate">{it.label}</span>
            <span className="mono t-3 ml-auto pl-3">{((it.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ================= Health ticks ================= */
export function HealthTicks({ ticks }: { ticks: ('ok' | 'warn' | 'bad')[] }) {
  return (
    <div className="flex items-end gap-[1.5px] h-5">
      {ticks.map((t, i) => (
        <div
          key={i}
          className="w-[2.5px] rounded-sm"
          style={{
            height: t === 'ok' ? '60%' : t === 'warn' ? '85%' : '100%',
            background: t === 'ok' ? 'rgba(52,211,153,0.55)' : t === 'warn' ? 'rgba(251,191,36,0.8)' : 'rgba(248,113,113,0.9)',
          }}
        />
      ))}
    </div>
  )
}
