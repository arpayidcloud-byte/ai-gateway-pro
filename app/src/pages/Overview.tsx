import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight, ArrowDownRight, TrendingUp, Zap, Gauge, DollarSign, HeartPulse, ArrowRight } from 'lucide-react'
import { useGateway } from '@/lib/engine'
import { useI18n } from '@/lib/i18n'
import { fmtNum, fmtFull, fmtCost, fmtPct, fmtTime, fmtAgo } from '@/lib/format'
import { Card, Segmented, StatusPill, HealthDot, PageHeader, Badge } from '@/components/ui'
import { StackedArea, BarsChart, LinesChart, Sparkline, Donut } from '@/components/charts'

type Range = '1h' | '24h' | '7d' | '30d'

function Delta({ v, invert = false }: { v: number; invert?: boolean }) {
  const good = invert ? v < 0 : v > 0
  const Icon = v >= 0 ? ArrowUpRight : ArrowDownRight
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium mono ${good ? 'text-emerald-400' : 'text-red-400'}`}>
      <Icon size={12} />
      {Math.abs(v).toFixed(1)}%
    </span>
  )
}

export default function Overview() {
  const g = useGateway()
  const { t, lang } = useI18n()
  const [range, setRange] = useState<Range>('24h')

  const series = g.series[range]
  const xFmt = useMemo(() => {
    if (range === '1h' || range === '24h') return (ts: number) => fmtTime(ts).slice(0, 5)
    return (ts: number) => new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
  }, [range])

  const kpis = useMemo(() => {
    const half = Math.floor(series.length / 2)
    const sum = (arr: typeof series, k: 'success' | 'fallback' | 'error' | 'cost') => arr.reduce((s, p) => s + p[k], 0)
    const cur = series.slice(half)
    const prev = series.slice(0, half)
    const reqs = sum(series, 'success') + sum(series, 'fallback') + sum(series, 'error')
    const reqsPrev = sum(prev, 'success') + sum(prev, 'fallback') + sum(prev, 'error')
    const reqsCur = sum(cur, 'success') + sum(cur, 'fallback') + sum(cur, 'error')
    const succ = reqs ? (sum(series, 'success') / reqs) * 100 : 100
    const fb = reqs ? (sum(series, 'fallback') / reqs) * 100 : 0
    const cost = sum(series, 'cost')
    const costPrev = sum(prev, 'cost')
    const costCur = sum(cur, 'cost')
    const avgP50 = Math.round(series.reduce((s, p) => s + p.p50, 0) / series.length)
    const avgP95 = Math.round(series.reduce((s, p) => s + p.p95, 0) / series.length)
    const d = (c: number, p: number) => (p === 0 ? 0 : ((c - p) / p) * 100)
    return {
      reqs, reqsDelta: d(reqsCur, reqsPrev),
      succ, fb, succDelta: 0.4 + Math.random() * 0.3,
      p50: avgP50, p95: avgP95, latDelta: -(3 + Math.random() * 6),
      cost, costDelta: d(costCur, costPrev),
      healthy: g.providers.filter((p) => p.status === 'ok').length,
      total: g.providers.length,
    }
  }, [series, g.providers])

  const trafficData = series as unknown as { t: number; [k: string]: number }[]

  const routeFlow = useMemo(() => {
    const flows = g.routes.filter((r) => r.enabled && r.requests24h > 0).map((r) => ({
      alias: r.alias,
      target: r.targets[0],
      providerName: g.providers.find((p) => p.id === r.targets[0]?.providerId)?.name ?? '—',
      share: r.requests24h,
      strategy: r.strategy,
    }))
    const total = flows.reduce((s, f) => s + f.share, 0) || 1
    return flows.sort((a, b) => b.share - a.share).slice(0, 6).map((f) => ({ ...f, pct: (f.share / total) * 100 }))
  }, [g.routes, g.providers])

  const costByProvider = useMemo(() => {
    const colors = ['#7c5cfc', '#22d3ee', '#34d399', '#fbbf24', '#f472b6', '#5b8cff', '#fb923c']
    return g.providers
      .filter((p) => p.cost24h > 0)
      .sort((a, b) => b.cost24h - a.cost24h)
      .map((p, i) => ({ label: p.name, value: p.cost24h, color: colors[i % colors.length] }))
  }, [g.providers])

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('ov.title')}
        sub={t('ov.sub')}
        actions={
          <Segmented<Range>
            value={range}
            onChange={setRange}
            options={[
              { value: '1h', label: '1h' },
              { value: '24h', label: '24h' },
              { value: '7d', label: '7d' },
              { value: '30d', label: '30d' },
            ]}
          />
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {[
          { icon: <Zap size={13} />, label: t('ov.requests'), value: fmtNum(kpis.reqs), sub: `${fmtFull(kpis.reqs)} ${t('c.requests')}`, delta: kpis.reqsDelta, accent: 'rgba(124,92,252,.7)', spark: series.map((p) => p.success + p.fallback + p.error), color: '#7c5cfc' },
          { icon: <TrendingUp size={13} />, label: t('ov.success'), value: fmtPct(kpis.succ), sub: `Fallback ${fmtPct(kpis.fb)}`, delta: kpis.succDelta, accent: 'rgba(52,211,153,.7)', spark: series.map((p) => (p.success / (p.success + p.fallback + p.error || 1)) * 100), color: '#34d399' },
          { icon: <Gauge size={13} />, label: t('ov.latency'), value: `${kpis.p50} / ${kpis.p95}`, sub: 'ms · ' + t('ov.vsPrev'), delta: kpis.latDelta, invert: true, accent: 'rgba(34,211,238,.7)', spark: series.map((p) => p.p95), color: '#22d3ee' },
          { icon: <DollarSign size={13} />, label: t('ov.cost'), value: fmtCost(kpis.cost), sub: 'tokens × rate', delta: kpis.costDelta, accent: 'rgba(251,191,36,.7)', spark: series.map((p) => p.cost), color: '#fbbf24' },
          { icon: <HeartPulse size={13} />, label: t('ov.health'), value: `${kpis.healthy} / ${kpis.total}`, sub: `${g.routes.filter((r) => r.enabled).length} routes · ${g.combos.filter((c) => c.enabled).length} combos`, delta: null, accent: 'rgba(244,114,182,.7)', spark: g.providers.find((p) => p.status === 'ok')?.spark ?? [], color: '#f472b6' },
        ].map((k, i) => (
          <div key={i} className="panel panel-hover kpi-top relative p-4 fade-up" style={{ ['--kpi-accent' as never]: k.accent, animationDelay: `${i * 40}ms` }}>
            <div className="flex items-center gap-1.5 t-3 text-[11.5px] font-medium">
              {k.icon}{k.label}
              {k.delta !== null && <span className="ml-auto"><Delta v={k.delta} invert={(k as { invert?: boolean }).invert} /></span>}
            </div>
            <div className="mt-2 text-[22px] font-semibold t-1 tracking-tight mono">{k.value}</div>
            <div className="text-[10.5px] t-3 mt-0.5 truncate">{k.sub}</div>
            <div className="mt-2.5 -mb-1">
              <Sparkline data={k.spark} color={k.color} width={180} height={30} />
            </div>
          </div>
        ))}
      </div>

      {/* traffic chart */}
      <Card
        title={t('ov.traffic')}
        sub={t('ov.trafficSub')}
        className="fade-up"
        action={
          <div className="flex items-center gap-3 text-[11px] t-3">
            <span className="flex items-center gap-1.5"><span className="h-[7px] w-[7px] rounded-full bg-emerald-400" />success</span>
            <span className="flex items-center gap-1.5"><span className="h-[7px] w-[7px] rounded-full bg-amber-400" />fallback</span>
            <span className="flex items-center gap-1.5"><span className="h-[7px] w-[7px] rounded-full bg-red-400" />error</span>
          </div>
        }
      >
        <div className="px-2 pb-2 pt-1">
          <StackedArea
            data={trafficData}
            height={230}
            xFmt={xFmt}
            series={[
              { key: 'success', color: '#34d399', label: 'success' },
              { key: 'fallback', color: '#fbbf24', label: 'fallback' },
              { key: 'error', color: '#f87171', label: 'error' },
            ]}
          />
        </div>
      </Card>

      {/* tokens + latency */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card
          title={t('ov.tokens')} sub={t('ov.tokensSub')}
          action={<div className="flex items-center gap-3 text-[11px] t-3"><span className="flex items-center gap-1.5"><span className="h-[7px] w-[7px] rounded-sm" style={{ background: '#7c5cfc' }} />input</span><span className="flex items-center gap-1.5"><span className="h-[7px] w-[7px] rounded-sm" style={{ background: '#22d3ee' }} />output</span></div>}
        >
          <div className="px-2 pb-2 pt-1">
            <BarsChart
              data={trafficData}
              height={200}
              xFmt={xFmt}
              series={[
                { key: 'tokensIn', color: '#7c5cfc', label: 'input' },
                { key: 'tokensOut', color: '#22d3ee', label: 'output' },
              ]}
            />
          </div>
        </Card>
        <Card
          title={t('ov.latChart')} sub={t('ov.latSub')}
          action={<div className="flex items-center gap-3 text-[11px] t-3"><span className="flex items-center gap-1.5"><span className="h-[7px] w-[7px] rounded-full bg-emerald-400" />p50</span><span className="flex items-center gap-1.5"><span className="h-[7px] w-[7px] rounded-full bg-cyan-400" />p95</span><span className="flex items-center gap-1.5"><span className="h-[7px] w-[7px] rounded-full bg-violet-400" />p99</span></div>}
        >
          <div className="px-2 pb-2 pt-1">
            <LinesChart
              data={trafficData}
              height={200}
              xFmt={xFmt}
              series={[
                { key: 'p50', color: '#34d399', label: 'p50' },
                { key: 'p95', color: '#22d3ee', label: 'p95' },
                { key: 'p99', color: '#a78bfa', label: 'p99', dash: '4 3' },
              ]}
            />
          </div>
        </Card>
      </div>

      {/* routing flow */}
      <Card title={t('ov.routingFlow')} sub={t('ov.routingFlowSub')} className="fade-up">
        <div className="p-4 space-y-3">
          {routeFlow.map((f, i) => (
            <div key={f.alias} className="flex items-center gap-3 group">
              <span className="mono text-xs px-2 py-1 rounded-md border border-violet-400/25 bg-violet-400/[0.08] text-violet-300 w-32 truncate text-center">{f.alias}</span>
              <ArrowRight size={13} className="t-3 shrink-0" />
              <span className="text-xs t-2 w-44 truncate hidden md:block">{f.providerName}</span>
              <div className="flex-1 h-[10px] rounded-full bg-white/[0.05] overflow-hidden">
                <div
                  className="h-full rounded-full bar-grow"
                  style={{
                    width: `${f.pct}%`,
                    background: 'linear-gradient(90deg,#7c5cfc,#22d3ee)',
                    animationDelay: `${i * 90}ms`,
                    opacity: 0.9 - i * 0.1,
                  }}
                />
              </div>
              <span className="mono text-xs t-1 w-10 text-right">{f.pct.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* bottom row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* provider health */}
        <Card
          title={t('ov.providerHealth')} sub={t('ov.providerHealthSub')}
          action={<Link to="/providers" className="text-[11.5px] text-violet-300 hover:text-violet-200 flex items-center gap-1 transition-colors">{t('ov.viewAll')}<ArrowUpRight size={12} /></Link>}
        >
          <div className="px-2 pb-2 pt-1">
            {g.providers.slice(0, 6).map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                <HealthDot status={p.status} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium t-1 truncate">{p.name}</div>
                  <div className="text-[10.5px] t-3 mono truncate">{p.region} · {p.uptime}%</div>
                </div>
                <Sparkline data={p.spark} color={p.status === 'ok' ? '#34d399' : p.status === 'degraded' ? '#fbbf24' : '#f87171'} width={64} height={20} fill={false} />
                <span className="mono text-[11px] t-2 w-14 text-right">{p.status === 'down' ? '—' : p.latency + 'ms'}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* recent requests */}
        <Card
          title={<span className="flex items-center gap-2">{t('ov.recent')}{g.live && <Badge tone="green" dot>LIVE</Badge>}</span>}
          sub={t('ov.recentSub')}
          action={<Link to="/requests" className="text-[11.5px] text-violet-300 hover:text-violet-200 flex items-center gap-1 transition-colors">{t('ov.viewAll')}<ArrowUpRight size={12} /></Link>}
        >
          <div className="px-2 pb-2 pt-1">
            {g.logs.slice(0, 6).map((l) => (
              <div key={l.id} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-colors tick-in">
                <StatusPill status={l.status} />
                <span className="mono text-[11.5px] t-2 truncate flex-1">{l.model}</span>
                <span className="mono text-[11px] t-3 hidden sm:block">{l.latency}ms</span>
                <span className="mono text-[10.5px] t-3 w-16 text-right">{fmtAgo(l.ts, lang)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* cost by provider */}
        <Card title={t('ov.costByProvider')} sub={t('ov.costByProviderSub')}>
          <div className="p-4 pt-2">
            <Donut items={costByProvider} />
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] t-3">Total 24h</span>
              <span className="mono text-sm font-semibold t-1">{fmtCost(g.providers.reduce((s, p) => s + p.cost24h, 0))}</span>
            </div>
            <div className="mt-3 space-y-1.5">
              {costByProvider.slice(0, 3).map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-[11px]">
                  <span className="h-[6px] w-[6px] rounded-full" style={{ background: c.color }} />
                  <span className="t-3 truncate flex-1">{c.label}</span>
                  <span className="mono t-2">{fmtCost(c.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* quick links to deep pages */}
      <div className="grid md:grid-cols-3 gap-3 pb-4">
        {[
          { to: '/playground', title: 'Playground', desc: lang === 'id' ? 'Uji route dengan parameter kustom' : 'Test routes with custom parameters', icon: <ArrowUpRight size={14} /> },
          { to: '/keys', title: 'API Keys', desc: lang === 'id' ? 'Kelola akses klien & rate limit' : 'Manage client access & rate limits', icon: <ArrowUpRight size={14} /> },
          { to: '/usage', title: 'Usage & Cost', desc: lang === 'id' ? 'Analisis biaya lintas provider' : 'Cross-provider cost analysis', icon: <ArrowUpRight size={14} /> },
        ].map((q) => (
          <Link key={q.to} to={q.to} className="panel panel-hover p-4 flex items-center gap-3 group">
            <div className="flex-1">
              <div className="text-[13px] font-semibold t-1 flex items-center gap-1.5">{q.title}<span className="t-3 group-hover:text-violet-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">{q.icon}</span></div>
              <div className="text-[11.5px] t-3 mt-0.5">{q.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
