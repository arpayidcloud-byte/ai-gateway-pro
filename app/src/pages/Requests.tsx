import { useMemo, useState } from 'react'
import { Download, Search, Inbox, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { useGateway } from '@/lib/engine'
import { useI18n } from '@/lib/i18n'
import type { RequestLog } from '@/lib/types'
import { fmtTime, fmtCost, fmtFull, fmtDateTime } from '@/lib/format'
import { PageHeader, Btn, Select, StatusPill, Drawer, Badge, EmptyState, LatencyBar } from '@/components/ui'

export default function Requests() {
  const g = useGateway()
  const { t, lang } = useI18n()
  const [status, setStatus] = useState('all')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('newest')
  const [selected, setSelected] = useState<RequestLog | null>(null)
  const [limit, setLimit] = useState(60)

  const filtered = useMemo(() => {
    let rows = g.logs
    if (status !== 'all') rows = rows.filter((l) => l.status === status)
    if (q.trim()) {
      const s = q.toLowerCase()
      rows = rows.filter((l) =>
        l.model.toLowerCase().includes(s) ||
        l.routeAlias.toLowerCase().includes(s) ||
        l.providerName.toLowerCase().includes(s) ||
        l.keyPrefix.toLowerCase().includes(s) ||
        l.status.includes(s)
      )
    }
    const sorted = [...rows]
    if (sort === 'newest') sorted.sort((a, b) => b.ts - a.ts)
    else if (sort === 'oldest') sorted.sort((a, b) => a.ts - b.ts)
    else sorted.sort((a, b) => b.latency - a.latency)
    return sorted.slice(0, limit)
  }, [g.logs, status, q, sort, limit])

  const counts = useMemo(() => ({
    ok: g.logs.filter((l) => l.status === 'success').length,
    fb: g.logs.filter((l) => l.status === 'fallback').length,
    err: g.logs.filter((l) => l.status === 'error' || l.status === 'rate_limited').length,
  }), [g.logs])

  const exportCsv = () => {
    const head = 'ts,route,model,provider,status,latency_ms,tokens_in,tokens_out,cost,region\n'
    const body = filtered.map((l) => [new Date(l.ts).toISOString(), l.routeAlias, l.model, l.providerName, l.status, l.latency, l.tokensIn, l.tokensOut, l.cost.toFixed(6), l.region].join(',')).join('\n')
    const blob = new Blob([head + body], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'nexusgate-requests.csv'
    a.click()
    toast.success(lang === 'id' ? 'CSV diekspor' : 'CSV exported', { description: `${filtered.length} rows` })
  }

  return (
    <div>
      <PageHeader
        title={<span className="flex items-center gap-2.5">{t('rq.title')}{g.live && <Badge tone="green" dot>LIVE</Badge>}</span>}
        sub={t('rq.sub')}
        actions={<Btn onClick={exportCsv}><Download size={13} />{t('rq.export')}</Btn>}
      />

      {/* filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4 fade-up">
        <Select
          value={status}
          onChange={setStatus}
          className="w-40"
          options={[
            { value: 'all', label: t('rq.allStatus') },
            { value: 'success', label: 'Success' },
            { value: 'fallback', label: 'Fallback' },
            { value: 'error', label: 'Error' },
            { value: 'rate_limited', label: 'Rate limited' },
          ]}
        />
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 t-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('rq.search')}
            className="w-full h-8 rounded-lg border border-white/10 bg-white/[0.03] pl-8 pr-3 text-[13px] t-1 placeholder:text-zinc-600 outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/10 transition-all mono"
          />
        </div>
        <Select
          value={sort}
          onChange={setSort}
          className="w-40"
          options={[
            { value: 'newest', label: t('rq.newest') },
            { value: 'oldest', label: t('rq.oldest') },
            { value: 'latency', label: t('rq.latencyDesc') },
          ]}
        />
      </div>

      {/* table */}
      <div className="panel fade-up overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <span className="text-[13px] font-medium t-2">{fmtFull(filtered.length)} {t('c.requests')}</span>
          <div className="flex items-center gap-3 text-[11px] mono">
            <span className="flex items-center gap-1.5 t-3"><span className="h-[6px] w-[6px] rounded-full bg-emerald-400" />{counts.ok}</span>
            <span className="flex items-center gap-1.5 t-3"><span className="h-[6px] w-[6px] rounded-full bg-amber-400" />{counts.fb}</span>
            <span className="flex items-center gap-1.5 t-3"><span className="h-[6px] w-[6px] rounded-full bg-red-400" />{counts.err}</span>
          </div>
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={<Inbox size={18} />} title={t('c.noResults')} sub={q} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] font-semibold tracking-[0.1em] t-3 uppercase">
                  <th className="px-4 py-2.5 font-semibold">{t('rq.time')}</th>
                  <th className="px-4 py-2.5 font-semibold">{t('rq.model')}</th>
                  <th className="px-4 py-2.5 font-semibold hidden lg:table-cell">{t('rq.provider')}</th>
                  <th className="px-4 py-2.5 font-semibold">{t('rq.status')}</th>
                  <th className="px-4 py-2.5 font-semibold">{t('rq.latency')}</th>
                  <th className="px-4 py-2.5 font-semibold hidden xl:table-cell">{t('rq.tokens')}</th>
                  <th className="px-4 py-2.5 font-semibold hidden xl:table-cell">{t('rq.cost')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => setSelected(l)}
                    className="border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-2.5 mono text-[11.5px] t-3 whitespace-nowrap">{fmtTime(l.ts)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="mono text-[12px] t-1 px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.07]">{l.routeAlias}</span>
                        <span className="mono text-[11.5px] t-3 truncate max-w-40">{l.model}</span>
                        {l.cache && <Badge tone="cyan" className="!px-1.5">cache</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] t-2 hidden lg:table-cell">{l.providerName}</td>
                    <td className="px-4 py-2.5"><StatusPill status={l.status} /></td>
                    <td className="px-4 py-2.5"><LatencyBar ms={l.latency} /></td>
                    <td className="px-4 py-2.5 mono text-[11.5px] t-3 hidden xl:table-cell whitespace-nowrap">{fmtFull(l.tokensIn)}→{fmtFull(l.tokensOut)}</td>
                    <td className="px-4 py-2.5 mono text-[11.5px] t-2 hidden xl:table-cell">{fmtCost(l.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length >= limit && (
          <div className="p-3 text-center border-t border-white/[0.06]">
            <Btn size="sm" onClick={() => setLimit((l) => l + 100)}>{lang === 'id' ? 'Muat 100 lagi' : 'Load 100 more'}</Btn>
          </div>
        )}
      </div>

      {/* detail drawer */}
      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? <span className="mono">{selected.routeAlias}</span> : ''}
        sub={selected ? fmtDateTime(selected.ts) : ''}
      >
        {selected && <RequestDetail log={selected} onClose={() => setSelected(null)} />}
      </Drawer>
    </div>
  )
}

function RequestDetail({ log }: { log: RequestLog; onClose: () => void }) {
  const { t } = useI18n()
  const timing = useMemo(() => {
    const queue = Math.round(log.latency * 0.04)
    const ttft = log.ttft
    const stream = Math.max(0, log.latency - queue - ttft)
    return { queue, ttft, stream, total: log.latency }
  }, [log])

  const copyCurl = () => {
    const curl = `curl https://gateway.nexusgate.dev/v1/chat/completions \\
  -H "Authorization: Bearer ${log.keyPrefix}••••" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "${log.routeAlias}", "messages": [{"role": "user", "content": "…"}]}'`
    navigator.clipboard.writeText(curl).catch(() => {})
    toast.success(t('c.copied'))
  }

  const rows: [string, React.ReactNode][] = [
    ['Request ID', <span className="mono">req_{log.id}</span>],
    ['Model', <span className="mono">{log.model}</span>],
    ['Provider', log.providerName],
    ['Region', <span className="mono">{log.region}</span>],
    ['API key', <span className="mono">{log.keyPrefix}••••</span>],
    ['Tokens', <span className="mono">{fmtFull(log.tokensIn)} in · {fmtFull(log.tokensOut)} out</span>],
    ['Cost', <span className="mono">{fmtCost(log.cost)}</span>],
    ['Retries', <span className="mono">{log.retries}</span>],
    ['Cache', log.cache ? <Badge tone="cyan" dot>HIT</Badge> : <span className="t-3 mono">MISS</span>],
    ['Client', <span className="mono">{log.userAgent}</span>],
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <StatusPill status={log.status} />
        {log.error && <span className="mono text-[11px] text-red-400">{log.error}</span>}
      </div>

      {/* timing waterfall */}
      <div>
        <div className="text-[11px] font-semibold tracking-[0.1em] t-3 uppercase mb-2">{t('rq.timing')}</div>
        <div className="panel-inset p-3 space-y-2">
          {[
            { label: t('rq.queue'), v: timing.queue, color: '#8a8a8a' },
            { label: t('rq.ttfb'), v: timing.ttft, color: '#7c5cfc' },
            { label: t('rq.stream'), v: timing.stream, color: '#22d3ee' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-[11px] t-3 w-16">{s.label}</span>
              <div className="flex-1 h-[8px] rounded-full bg-white/[0.05] overflow-hidden">
                <div className="h-full rounded-full bar-grow" style={{ width: `${(s.v / timing.total) * 100}%`, background: s.color }} />
              </div>
              <span className="mono text-[11px] t-2 w-14 text-right">{s.v}ms</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/[0.06]">
            <span className="text-[11px] t-3">Total</span>
            <span className="mono text-[13px] font-semibold t-1">{log.latency}ms</span>
          </div>
        </div>
      </div>

      {/* retry chain */}
      {log.retries > 0 && (
        <div>
          <div className="text-[11px] font-semibold tracking-[0.1em] t-3 uppercase mb-2">{t('rq.retryChain')}</div>
          <div className="panel-inset p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-[12px]">
              <span className="mono text-red-400">attempt 1</span>
              <span className="t-3">→</span>
              <span className="t-2">{log.providerName}</span>
              <Badge tone="red" className="ml-auto">failed</Badge>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="mono text-emerald-400">attempt 2</span>
              <span className="t-3">→</span>
              <span className="t-2">fallback target</span>
              <Badge tone="green" className="ml-auto">{log.status === 'fallback' ? 'success' : 'served'}</Badge>
            </div>
          </div>
        </div>
      )}

      {/* metadata */}
      <div>
        <div className="text-[11px] font-semibold tracking-[0.1em] t-3 uppercase mb-2">{t('rq.meta')}</div>
        <div className="panel-inset divide-y divide-white/[0.05]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-3 py-2">
              <span className="text-[11.5px] t-3">{k}</span>
              <span className="text-[12px] t-1">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <Btn variant="outline" className="w-full" onClick={copyCurl}><Copy size={13} />{t('rq.copyCurl')}</Btn>
    </div>
  )
}
