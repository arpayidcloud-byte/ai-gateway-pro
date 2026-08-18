import { useMemo, useState } from 'react'
import { Download, BellRing } from 'lucide-react'
import { toast } from 'sonner'
import { useGateway } from '@/lib/engine'
import { useI18n } from '@/lib/i18n'
import { fmtCost, fmtNum, fmtFull } from '@/lib/format'
import { PageHeader, Btn, Card, Segmented, Badge, ProviderMark } from '@/components/ui'
import { StackedArea } from '@/components/charts'

type Range = '24h' | '7d' | '30d'

export default function Usage() {
  const g = useGateway()
  const { t, lang } = useI18n()
  const [range, setRange] = useState<Range>('30d')

  const series = g.series[range]
  const xFmt = useMemo(() => {
    if (range === '24h') return (ts: number) => new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    return (ts: number) => new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  }, [range])

  const totalCost = series.reduce((s, p) => s + p.cost, 0)
  const totalTokIn = series.reduce((s, p) => s + p.tokensIn, 0)
  const totalTokOut = series.reduce((s, p) => s + p.tokensOut, 0)
  const budget = 2000
  const monthCost = g.series['30d'].reduce((s, p) => s + p.cost, 0)
  const budgetPct = Math.min(100, (monthCost / budget) * 100)

  const byProvider = useMemo(() => {
    const total = g.providers.reduce((s, p) => s + p.cost24h, 0) || 1
    return g.providers.filter((p) => p.cost24h > 0).sort((a, b) => b.cost24h - a.cost24h)
      .map((p) => ({ ...p, pct: (p.cost24h / total) * 100 }))
  }, [g.providers])

  const byModel = useMemo(() => {
    return [...g.models].filter((m) => m.enabled && m.requests24h > 0)
      .sort((a, b) => b.requests24h - a.requests24h).slice(0, 8)
      .map((m) => ({
        ...m,
        cost24h: (m.requests24h * 420 / 1e6) * m.inputPrice + (m.requests24h * 260 / 1e6) * m.outputPrice,
      }))
  }, [g.models])

  const chartData = series as unknown as { t: number; [k: string]: number }[]

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('us.title')}
        sub={t('us.sub')}
        actions={
          <>
            <Segmented<Range> value={range} onChange={setRange} options={[{ value: '24h', label: '24h' }, { value: '7d', label: '7d' }, { value: '30d', label: '30d' }]} />
            <Btn onClick={() => toast.success(lang === 'id' ? 'Laporan diekspor' : 'Report exported')}><Download size={13} />CSV</Btn>
          </>
        }
      />

      {/* summary + budget */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: `Total biaya (${range})`, v: fmtCost(totalCost) },
          { l: 'Token input', v: fmtNum(totalTokIn) },
          { l: 'Token output', v: fmtNum(totalTokOut) },
          { l: 'Avg cost / 1K req', v: fmtCost((totalCost / Math.max(1, series.reduce((s, p) => s + p.success + p.fallback + p.error, 0))) * 1000) },
        ].map((s, i) => (
          <div key={i} className="panel kpi-top relative p-4 fade-up" style={{ ['--kpi-accent' as never]: 'rgba(251,191,36,.6)', animationDelay: `${i * 40}ms` }}>
            <div className="text-[11.5px] t-3 font-medium">{s.l}</div>
            <div className="mono text-[20px] font-semibold t-1 mt-1.5">{s.v}</div>
          </div>
        ))}
      </div>

      {/* budget */}
      <Card title={t('us.budget')} sub={`${fmtCost(monthCost)} / ${fmtCost(budget)} · ${t('us.budgetUsed')} ${budgetPct.toFixed(0)}%`} className="fade-up"
        action={<Badge tone={budgetPct > 80 ? 'amber' : 'green'} dot>{t('us.alertAt')}</Badge>}
      >
        <div className="px-4 pb-4 pt-2">
          <div className="h-[10px] rounded-full bg-white/[0.05] overflow-hidden relative">
            <div className="h-full rounded-full bar-grow" style={{ width: `${budgetPct}%`, background: budgetPct > 80 ? 'linear-gradient(90deg,#fbbf24,#f59e0b)' : 'linear-gradient(90deg,#7c5cfc,#22d3ee)' }} />
            <div className="absolute top-0 bottom-0 w-[2px] bg-amber-400/80" style={{ left: '80%' }} />
          </div>
          <div className="flex justify-between mt-2 text-[10.5px] t-3 mono">
            <span>$0</span>
            <span className="text-amber-400/80 flex items-center gap-1"><BellRing size={9} />80% · {fmtCost(budget * 0.8)}</span>
            <span>{fmtCost(budget)}</span>
          </div>
        </div>
      </Card>

      {/* cost over time */}
      <Card title={t('us.costOverTime')} sub={t('us.sub')} className="fade-up">
        <div className="px-2 pb-2 pt-1">
          <StackedArea data={chartData} height={220} money xFmt={xFmt} series={[{ key: 'cost', color: '#fbbf24', label: 'cost' }]} />
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* by provider */}
        <Card title={t('us.byProvider')} sub="24h">
          <div className="p-4 pt-2 space-y-3">
            {byProvider.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <ProviderMark preset={p.preset} size={24} />
                <span className="text-[12px] t-2 w-40 truncate">{p.name}</span>
                <div className="flex-1 h-[7px] rounded-full bg-white/[0.05] overflow-hidden">
                  <div className="h-full rounded-full bar-grow" style={{ width: `${p.pct}%`, background: 'linear-gradient(90deg,#fbbf24,#fb923c)' }} />
                </div>
                <span className="mono text-[11.5px] t-1 w-16 text-right">{fmtCost(p.cost24h)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* by model */}
        <Card title={t('us.byModel')} sub="24h">
          <div className="divide-y divide-white/[0.05]">
            {byModel.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="mono text-[12px] t-1 flex-1 truncate">{m.name}</span>
                <span className="mono text-[10.5px] t-3 hidden sm:block">{fmtFull(m.requests24h)} req</span>
                <span className="mono text-[11.5px] t-1 w-16 text-right">{fmtCost(m.cost24h)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
