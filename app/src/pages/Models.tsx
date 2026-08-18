import { useMemo, useState } from 'react'
import { Search, Layers, Eye, Wrench, Braces, AudioLines, Brain, Code2, Waves, CircleDollarSign } from 'lucide-react'
import { useGateway, gateway } from '@/lib/engine'
import { useI18n } from '@/lib/i18n'
import { fmtCtx, fmtNum, fmtMs } from '@/lib/format'
import { PageHeader, Select, Badge, Toggle, EmptyState, ProviderMark } from '@/components/ui'

const CAP_ICONS: Record<string, React.ReactNode> = {
  vision: <Eye size={11} />,
  tools: <Wrench size={11} />,
  json: <Braces size={11} />,
  audio: <AudioLines size={11} />,
  reasoning: <Brain size={11} />,
  code: <Code2 size={11} />,
  streaming: <Waves size={11} />,
  embeddings: <Layers size={11} />,
}

export default function Models() {
  const g = useGateway()
  const { t } = useI18n()
  const [q, setQ] = useState('')
  const [prov, setProv] = useState('all')
  const [cap, setCap] = useState('all')

  const providerNames = useMemo(() => [...new Set(g.models.map((m) => m.providerName))], [g.models])
  const caps = useMemo(() => [...new Set(g.models.flatMap((m) => m.capabilities))], [g.models])

  const rows = useMemo(() => {
    return g.models.filter((m) => {
      if (prov !== 'all' && m.providerName !== prov) return false
      if (cap !== 'all' && !m.capabilities.includes(cap)) return false
      if (q.trim() && !m.name.toLowerCase().includes(q.toLowerCase())) return false
      return true
    }).sort((a, b) => b.requests24h - a.requests24h)
  }, [g.models, q, prov, cap])

  return (
    <div>
      <PageHeader title={t('md.title')} sub={t('md.sub')} />

      <div className="flex flex-wrap items-center gap-2 mb-4 fade-up">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 t-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('md.search')}
            className="w-full h-8 rounded-lg border border-white/10 bg-white/[0.03] pl-8 pr-3 text-[13px] t-1 placeholder:text-zinc-600 outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/10 transition-all mono"
          />
        </div>
        <Select value={prov} onChange={setProv} className="w-52" options={[{ value: 'all', label: t('md.allProviders') }, ...providerNames.map((p) => ({ value: p, label: p }))]} />
        <Select value={cap} onChange={setCap} className="w-40" options={[{ value: 'all', label: t('c.all') }, ...caps.map((c) => ({ value: c, label: c }))]} />
      </div>

      {rows.length === 0 ? (
        <div className="panel"><EmptyState icon={<Layers size={18} />} title={t('c.noResults')} sub={q} /></div>
      ) : (
        <div className="panel overflow-hidden fade-up">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] font-semibold tracking-[0.1em] t-3 uppercase">
                  <th className="px-4 py-2.5 font-semibold">Model</th>
                  <th className="px-4 py-2.5 font-semibold">{t('md.context')}</th>
                  <th className="px-4 py-2.5 font-semibold">{t('md.price')}</th>
                  <th className="px-4 py-2.5 font-semibold hidden lg:table-cell">{t('md.capabilities')}</th>
                  <th className="px-4 py-2.5 font-semibold hidden xl:table-cell">Latensi</th>
                  <th className="px-4 py-2.5 font-semibold hidden xl:table-cell">24h</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => {
                  const provider = g.providers.find((p) => p.id === m.provider)
                  return (
                    <tr key={m.id} className={`border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors ${!m.enabled ? 'opacity-45' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <ProviderMark preset={provider?.preset ?? 'compatible'} size={26} />
                          <div>
                            <div className="mono text-[12.5px] font-medium t-1">{m.name}</div>
                            <div className="text-[10.5px] t-3">{m.providerName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 mono text-[12px] t-2">{fmtCtx(m.context)}</td>
                      <td className="px-4 py-3">
                        <span className="mono text-[11.5px] t-1 flex items-center gap-1">
                          <CircleDollarSign size={11} className="t-3" />
                          ${m.inputPrice} <span className="t-3">/</span> ${m.outputPrice}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {m.capabilities.slice(0, 4).map((c) => (
                            <Badge key={c} tone="neutral" className="!gap-1">{CAP_ICONS[c]}{c}</Badge>
                          ))}
                          {m.capabilities.length > 4 && <Badge tone="neutral">+{m.capabilities.length - 4}</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3 mono text-[11.5px] t-2 hidden xl:table-cell">{m.enabled ? fmtMs(m.latency) : '—'}</td>
                      <td className="px-4 py-3 mono text-[11.5px] t-2 hidden xl:table-cell">{m.enabled ? fmtNum(m.requests24h) : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex"><Toggle checked={m.enabled} onChange={() => gateway.toggleModel(m.id)} /></div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
