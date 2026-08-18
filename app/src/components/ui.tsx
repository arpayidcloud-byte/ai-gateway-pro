import { type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, useEffect, useRef } from 'react'
import { X, Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'

/* ---------- Badge ---------- */
export function Badge({ children, tone = 'neutral', dot = false, className = '' }: {
  children: ReactNode
  tone?: 'neutral' | 'green' | 'red' | 'amber' | 'blue' | 'violet' | 'cyan'
  dot?: boolean
  className?: string
}) {
  const tones: Record<string, string> = {
    neutral: 'text-zinc-400 border-white/10 bg-white/[0.04]',
    green: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/[0.08]',
    red: 'text-red-400 border-red-400/20 bg-red-400/[0.08]',
    amber: 'text-amber-400 border-amber-400/20 bg-amber-400/[0.08]',
    blue: 'text-sky-400 border-sky-400/20 bg-sky-400/[0.08]',
    violet: 'text-violet-400 border-violet-400/20 bg-violet-400/[0.08]',
    cyan: 'text-cyan-400 border-cyan-400/20 bg-cyan-400/[0.08]',
  }
  const dots: Record<string, string> = {
    neutral: 'bg-zinc-400', green: 'bg-emerald-400', red: 'bg-red-400', amber: 'bg-amber-400',
    blue: 'bg-sky-400', violet: 'bg-violet-400', cyan: 'bg-cyan-400',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] text-[11px] font-medium leading-none ${tones[tone]} ${className}`}>
      {dot && <span className={`h-[5px] w-[5px] rounded-full ${dots[tone]}`} />}
      {children}
    </span>
  )
}

/* ---------- Status pill for request status ---------- */
export function StatusPill({ status }: { status: 'success' | 'fallback' | 'error' | 'rate_limited' }) {
  const map = {
    success: ['bg-emerald-400/[0.1] text-emerald-400 border-emerald-400/25', 'bg-emerald-400', 'SUCCESS'],
    fallback: ['bg-amber-400/[0.1] text-amber-400 border-amber-400/25', 'bg-amber-400', 'FALLBACK'],
    error: ['bg-red-400/[0.1] text-red-400 border-red-400/25', 'bg-red-400', 'ERROR'],
    rate_limited: ['bg-orange-400/[0.1] text-orange-400 border-orange-400/25', 'bg-orange-400', 'RATE LIMITED'],
  } as const
  const [cls, dot, label] = map[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-[3px] text-[10.5px] font-semibold tracking-wide leading-none mono ${cls}`}>
      <span className={`h-[5px] w-[5px] rounded-full ${dot} ${status === 'success' ? 'pulse-dot' : ''}`} />
      {label}
    </span>
  )
}

/* ---------- Health dot ---------- */
export function HealthDot({ status, size = 7 }: { status: 'ok' | 'degraded' | 'down'; size?: number }) {
  const c = status === 'ok' ? 'bg-emerald-400' : status === 'degraded' ? 'bg-amber-400' : 'bg-red-400'
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      {status !== 'down' && <span className={`absolute inline-flex h-full w-full rounded-full ${c} opacity-60 pulse-dot`} />}
      <span className={`relative inline-flex rounded-full ${c}`} style={{ width: size, height: size }} />
    </span>
  )
}

/* ---------- Button ---------- */
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md'
}
export function Btn({ variant = 'outline', size = 'md', className = '', ...props }: BtnProps) {
  const v = {
    primary: 'bg-white text-black hover:bg-zinc-200 border-transparent font-medium',
    ghost: 'bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] border-transparent',
    outline: 'bg-white/[0.03] text-zinc-200 border-white/10 hover:bg-white/[0.07] hover:border-white/20',
    danger: 'bg-red-500/[0.08] text-red-400 border-red-500/20 hover:bg-red-500/[0.15]',
  }[variant]
  const s = size === 'sm' ? 'h-7 px-2.5 text-xs rounded-md gap-1.5' : 'h-8 px-3 text-[13px] rounded-lg gap-2'
  return (
    <button
      className={`inline-flex items-center justify-center border transition-all duration-150 select-none disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98] ${v} ${s} ${className}`}
      {...props}
    />
  )
}

/* ---------- Toggle ---------- */
export function Toggle({ checked, onChange, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onChange(!checked) }}
      className={`relative h-[18px] w-[32px] rounded-full transition-colors duration-200 shrink-0 ${checked ? 'bg-emerald-500' : 'bg-white/[0.12]'} ${disabled ? 'opacity-40' : ''}`}
    >
      <span className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow transition-all duration-200 ${checked ? 'left-[16px]' : 'left-[2px]'}`} />
    </button>
  )
}

/* ---------- Card ---------- */
export function Card({ children, className = '', title, sub, action }: {
  children: ReactNode
  className?: string
  title?: ReactNode
  sub?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className={`panel ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between px-4 pt-3.5 pb-1">
          <div>
            <div className="text-[13.5px] font-semibold t-1 flex items-center gap-2">{title}</div>
            {sub && <div className="text-xs t-3 mt-0.5">{sub}</div>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

/* ---------- Segmented control ---------- */
export function Segmented<T extends string>({ options, value, onChange }: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-[3px] gap-[2px]">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`h-6 px-2.5 rounded-md text-xs font-medium transition-all duration-150 ${value === o.value ? 'bg-white/[0.12] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, sub, children, wide = false }: {
  open: boolean
  onClose: () => void
  title: ReactNode
  sub?: ReactNode
  children: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center pt-[12vh] px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[3px] fade-in" onClick={onClose} />
      <div className={`relative panel scale-in shadow-2xl shadow-black/60 w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[76vh] overflow-y-auto no-scrollbar`} style={{ background: '#0b0b0d' }}>
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-white/[0.06] sticky top-0 bg-[#0b0b0d]/95 backdrop-blur z-10">
          <div>
            <div className="text-[15px] font-semibold t-1">{title}</div>
            {sub && <div className="text-xs t-3 mt-0.5">{sub}</div>}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors p-1 -m-1"><X size={16} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

/* ---------- Drawer ---------- */
export function Drawer({ open, onClose, title, sub, children, width = 460 }: {
  open: boolean
  onClose: () => void
  title: ReactNode
  sub?: ReactNode
  children: ReactNode
  width?: number
}) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] fade-in" onClick={onClose} />
      <div
        className="absolute right-0 top-0 bottom-0 slide-in-right border-l border-white/[0.08] shadow-2xl shadow-black/70 overflow-y-auto no-scrollbar"
        style={{ width, background: '#0a0a0c', maxWidth: '92vw' }}
      >
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-white/[0.06] sticky top-0 bg-[#0a0a0c]/95 backdrop-blur z-10">
          <div>
            <div className="text-[15px] font-semibold t-1">{title}</div>
            {sub && <div className="text-xs t-3 mt-0.5">{sub}</div>}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors p-1 -m-1"><X size={16} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

/* ---------- Input ---------- */
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[12.5px] font-medium t-2 block mb-1.5">{label}</span>
      {children}
      {hint && <span className="text-[11px] t-3 block mt-1.5">{hint}</span>}
    </label>
  )
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full h-8 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-[13px] t-1 placeholder:text-zinc-600 outline-none focus:border-violet-400/50 focus:bg-white/[0.05] focus:ring-2 focus:ring-violet-400/10 transition-all ${className}`}
      {...props}
    />
  )
}

/* ---------- Select (custom dropdown) ---------- */
export function Select({ value, onChange, options, className = '' }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: ReactNode }[]
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const cur = options.find((o) => o.value === value)
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-8 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-[13px] t-1 flex items-center justify-between gap-2 hover:border-white/20 transition-colors"
      >
        <span className="truncate">{cur?.label ?? value}</span>
        <ChevronDown size={13} className={`text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[160px] rounded-lg border border-white/10 shadow-xl shadow-black/60 py-1 scale-in max-h-64 overflow-y-auto no-scrollbar" style={{ background: '#121214' }}>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center justify-between gap-2 transition-colors ${o.value === value ? 'text-white bg-white/[0.06]' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'}`}
            >
              <span className="truncate">{o.label}</span>
              {o.value === value && <Check size={13} className="text-violet-400 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------- Kbd ---------- */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center h-[18px] min-w-[18px] px-1 rounded border border-white/10 bg-white/[0.05] text-[10px] text-zinc-400 mono">
      {children}
    </kbd>
  )
}

/* ---------- Page header ---------- */
export function PageHeader({ title, sub, actions }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-5 fade-up">
      <div>
        <h1 className="text-[22px] font-semibold t-1 tracking-tight">{title}</h1>
        {sub && <p className="text-[13px] t-3 mt-1 max-w-2xl">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

/* ---------- Empty state ---------- */
export function EmptyState({ icon, title, sub }: { icon: ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center text-zinc-500 mb-3">{icon}</div>
      <div className="text-[13.5px] font-medium t-2">{title}</div>
      {sub && <div className="text-xs t-3 mt-1 max-w-xs">{sub}</div>}
    </div>
  )
}

/* ---------- Latency bar ---------- */
export function LatencyBar({ ms, max = 3000 }: { ms: number; max?: number }) {
  const pct = Math.min(100, (ms / max) * 100)
  const color = ms < 300 ? 'bg-emerald-400' : ms < 900 ? 'bg-cyan-400' : ms < 2000 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="w-14 h-[3px] rounded-full bg-white/[0.07] overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="mono text-xs t-2">{ms >= 1000 ? (ms / 1000).toFixed(2) + 's' : ms + ' ms'}</span>
    </div>
  )
}

/* ---------- Provider avatar ---------- */
export function ProviderMark({ preset, size = 28 }: { preset: string; size?: number }) {
  const colors: Record<string, string> = {
    openai: '#10a37f', anthropic: '#d97757', gemini: '#4285f4', vertex: '#1a73e8', azure: '#0078d4',
    bedrock: '#ff9900', groq: '#f55036', mistral: '#ff7000', cohere: '#39594d', together: '#0f6fff',
    perplexity: '#20808d', xai: '#e8e8e8', deepseek: '#4d6bfe', fireworks: '#e8321e', openrouter: '#6566f1',
    ollama: '#d4d4d4', compatible: '#8a8a8a',
  }
  const letters: Record<string, string> = {
    openai: 'OA', anthropic: 'AN', gemini: 'GM', vertex: 'VX', azure: 'AZ', bedrock: 'BD', groq: 'GQ',
    mistral: 'MI', cohere: 'CO', together: 'TG', perplexity: 'PX', xai: 'X', deepseek: 'DS',
    fireworks: 'FW', openrouter: 'OR', ollama: 'OL', compatible: 'CP',
  }
  const c = colors[preset] ?? '#8a8a8a'
  return (
    <span
      className="inline-flex items-center justify-center rounded-md font-semibold mono shrink-0"
      style={{
        width: size, height: size, fontSize: size * 0.36,
        background: `color-mix(in srgb, ${c} 14%, transparent)`,
        color: c === '#e8e8e8' || c === '#d4d4d4' ? '#111' : c,
        border: `1px solid color-mix(in srgb, ${c} 30%, transparent)`,
        backgroundColor: c === '#e8e8e8' || c === '#d4d4d4' ? c : undefined,
      }}
    >
      {letters[preset] ?? 'AI'}
    </span>
  )
}

/* ---------- Tabs ---------- */
export function Tabs({ tabs, value, onChange }: { tabs: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1 border-b border-white/[0.07] mb-5 overflow-x-auto no-scrollbar">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`px-3 h-9 text-[13px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${value === t.value ? 'border-violet-400 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
