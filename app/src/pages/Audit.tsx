import { useState } from 'react'
import { ScrollText, Search } from 'lucide-react'
import { useGateway } from '@/lib/engine'
import { useI18n } from '@/lib/i18n'
import { fmtDateTime } from '@/lib/format'
import { PageHeader, Badge, Select, EmptyState } from '@/components/ui'

const ACTION_TONE: Record<string, 'green' | 'blue' | 'red' | 'amber' | 'violet' | 'cyan' | 'neutral'> = {
  create: 'green', update: 'blue', delete: 'red', test: 'cyan', rotate: 'amber', deploy: 'violet', login: 'neutral',
}

export default function Audit() {
  const g = useGateway()
  const { t } = useI18n()
  const [action, setAction] = useState('all')
  const [q, setQ] = useState('')

  const rows = g.audit.filter((e) => {
    if (action !== 'all' && e.action !== action) return false
    if (q.trim() && !(e.target + e.actor + e.detail).toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  return (
    <div>
      <PageHeader title={t('au.title')} sub={t('au.sub')} />

      <div className="flex flex-wrap items-center gap-2 mb-4 fade-up">
        <Select value={action} onChange={setAction} className="w-40" options={[{ value: 'all', label: t('c.all') }, ...['create', 'update', 'delete', 'test', 'rotate', 'deploy', 'login'].map((a) => ({ value: a, label: a }))]} />
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 t-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('c.search')}
            className="w-full h-8 rounded-lg border border-white/10 bg-white/[0.03] pl-8 pr-3 text-[13px] t-1 placeholder:text-zinc-600 outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/10 transition-all"
          />
        </div>
      </div>

      <div className="panel overflow-hidden fade-up">
        {rows.length === 0 ? (
          <EmptyState icon={<ScrollText size={18} />} title={t('c.noResults')} />
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {rows.map((e) => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                <span
                  className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                  style={{ background: `linear-gradient(135deg, hsl(${(e.actor.charCodeAt(0) * 47) % 360}, 70%, 55%), hsl(${(e.actor.charCodeAt(0) * 47 + 60) % 360}, 70%, 45%))` }}
                >
                  {e.actor.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12.5px] t-1 font-medium">{e.actor}</span>
                    <Badge tone={ACTION_TONE[e.action]}>{e.action}</Badge>
                    <span className="mono text-[11.5px] t-2 truncate">{e.target}</span>
                  </div>
                  <div className="text-[11px] t-3 mt-0.5 truncate">{e.detail}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="mono text-[11px] t-3">{fmtDateTime(e.ts)}</div>
                  <div className="mono text-[10px] t-3 opacity-60">{e.ip}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
