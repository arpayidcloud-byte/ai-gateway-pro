import { type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import {
  LayoutGrid, Activity, SquareTerminal, Route as RouteIcon, Boxes, Layers, Combine,
  KeyRound, BarChart3, ScrollText, Settings, Zap, Search, RefreshCw, Pause, Play, Rocket,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useGateway, gateway } from '@/lib/engine'
import { HealthDot, Kbd } from './ui'

export const NAV: { group: string; items: { path: string; key: string; icon: ReactNode; live?: boolean }[] }[] = [
  {
    group: 'nav.ops',
    items: [
      { path: '/', key: 'nav.overview', icon: <LayoutGrid size={15} /> },
      { path: '/requests', key: 'nav.requests', icon: <Activity size={15} />, live: true },
      { path: '/playground', key: 'nav.playground', icon: <SquareTerminal size={15} /> },
    ],
  },
  {
    group: 'nav.config',
    items: [
      { path: '/routes', key: 'nav.routes', icon: <RouteIcon size={15} /> },
      { path: '/providers', key: 'nav.providers', icon: <Boxes size={15} /> },
      { path: '/models', key: 'nav.models', icon: <Layers size={15} /> },
      { path: '/combos', key: 'nav.combos', icon: <Combine size={15} /> },
      { path: '/keys', key: 'nav.keys', icon: <KeyRound size={15} /> },
    ],
  },
  {
    group: 'nav.observe',
    items: [
      { path: '/usage', key: 'nav.usage', icon: <BarChart3 size={15} /> },
      { path: '/audit', key: 'nav.audit', icon: <ScrollText size={15} /> },
    ],
  },
  {
    group: 'nav.system',
    items: [{ path: '/settings', key: 'nav.settings', icon: <Settings size={15} /> }],
  },
]

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <div
      className="rounded-lg flex items-center justify-center shrink-0 glow-violet"
      style={{
        width: size, height: size,
        background: 'linear-gradient(135deg, #7c5cfc 0%, #5b8cff 60%, #22d3ee 100%)',
      }}
    >
      <Zap size={size * 0.55} color="#fff" fill="#fff" />
    </div>
  )
}

export function Sidebar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { t, lang } = useI18n()
  const g = useGateway()
  const nav = useNavigate()
  const loc = useLocation()
  const healthy = g.providers.filter((p) => p.status === 'ok').length
  const degraded = g.providers.some((p) => p.status === 'down')

  return (
    <aside className="w-[228px] shrink-0 h-screen flex flex-col border-r border-white/[0.07] bg-[#08080a]">
      {/* brand */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/[0.06]">
        <Logo />
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold t-1 leading-tight">NexusGate</div>
          <div className="text-[10.5px] t-3 leading-tight">AI Gateway · v2.14.3</div>
        </div>
        <span className="ml-auto mono text-[9.5px] px-1.5 py-0.5 rounded border border-violet-400/30 bg-violet-400/10 text-violet-300">PRO</span>
      </div>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto no-scrollbar px-2.5 py-3 space-y-4">
        {NAV.map((grp) => (
          <div key={grp.group}>
            <div className="px-2 mb-1.5 text-[10px] font-semibold tracking-[0.12em] t-3 uppercase">{t(grp.group as never)}</div>
            <div className="space-y-[2px]">
              {grp.items.map((it) => {
                const active = it.path === '/' ? loc.pathname === '/' : loc.pathname.startsWith(it.path)
                return (
                  <button
                    key={it.path}
                    onClick={() => nav(it.path)}
                    className={`w-full flex items-center gap-2.5 px-2 h-8 rounded-lg text-[13px] transition-all duration-150 group relative ${
                      active ? 'text-white bg-white/[0.07]' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-4 rounded-full" style={{ background: 'linear-gradient(180deg,#7c5cfc,#22d3ee)' }} />}
                    <span className={active ? 'text-violet-300' : 'text-zinc-600 group-hover:text-zinc-400 transition-colors'}>{it.icon}</span>
                    <span className="font-medium">{t(it.key as never)}</span>
                    {it.live && g.live && (
                      <span className="ml-auto flex items-center gap-1 text-[9px] mono text-emerald-400">
                        <span className="h-[5px] w-[5px] rounded-full bg-emerald-400 pulse-dot" />LIVE
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* status card */}
      <div className="p-3">
        <div className="panel-inset p-3">
          <div className="flex items-center gap-2">
            <HealthDot status={degraded ? 'degraded' : 'ok'} />
            <span className="text-xs font-medium t-1">{degraded ? t('status.degraded') : t('status.online')}</span>
            <span className="ml-auto mono text-[11px] t-2">{g.gatewayLatency} ms</span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[10.5px] t-3">
            <span>{t('status.uptime')}</span>
            <span className="mono t-2">99.97%</span>
          </div>
          <div className="mt-1 h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '99.97%', background: 'linear-gradient(90deg,#34d399,#22d3ee)' }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10.5px] t-3">
            <span>{t('status.region')}</span>
            <span className="mono t-2">{g.region} · {healthy}/{g.providers.length}</span>
          </div>
        </div>
        {/* user */}
        <button className="mt-2 w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-colors">
          <span className="h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white" style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>RA</span>
          <span className="text-left min-w-0">
            <span className="block text-xs font-medium t-1 truncate">raka@nexus.dev</span>
            <span className="block text-[10px] t-3">{lang === 'id' ? 'Workspace produksi' : 'Production workspace'}</span>
          </span>
        </button>
      </div>
      <PaletteButton onOpenPalette={onOpenPalette} hidden />
    </aside>
  )
}

function PaletteButton({ onOpenPalette, hidden }: { onOpenPalette: () => void; hidden?: boolean }) {
  return <button onClick={onOpenPalette} className={hidden ? 'hidden' : ''} />
}

export function Topbar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { t, lang, setLang } = useI18n()
  const g = useGateway()
  const loc = useLocation()
  const current = NAV.flatMap((x) => x.items).find((i) => (i.path === '/' ? loc.pathname === '/' : loc.pathname.startsWith(i.path)))

  return (
    <header className="h-14 shrink-0 border-b border-white/[0.07] flex items-center gap-3 px-5 bg-[#050505]/80 backdrop-blur relative z-30">
      {/* breadcrumb */}
      <div className="flex items-center gap-2 text-[13px]">
        <span className="t-3">NexusGate</span>
        <span className="t-3">/</span>
        <span className="t-1 font-medium">{current ? t(current.key as never) : '—'}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* search */}
        <button
          onClick={onOpenPalette}
          className="hidden sm:flex items-center gap-2 h-8 w-56 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-[12.5px] t-3 hover:border-white/20 hover:text-zinc-400 transition-colors"
        >
          <Search size={13} />
          <span className="truncate">{t('nav.search')}</span>
          <span className="ml-auto flex gap-0.5"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
        </button>
        {/* lang */}
        <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-[2px]">
          {(['id', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`h-[22px] px-2 rounded-md text-[10.5px] font-semibold transition-colors ${lang === l ? 'bg-violet-500/80 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        {/* live toggle */}
        <button
          onClick={() => gateway.setLive(!g.live)}
          className={`h-8 px-2.5 rounded-lg border text-[11px] mono font-semibold flex items-center gap-1.5 transition-colors ${
            g.live ? 'border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-400' : 'border-white/10 bg-white/[0.03] text-zinc-500'
          }`}
        >
          {g.live ? <Pause size={12} /> : <Play size={12} />}
          {g.live ? t('top.live') : t('top.paused')}
        </button>
        {/* refresh */}
        <button
          onClick={() => gateway.refresh()}
          className="h-8 w-8 rounded-lg border border-white/10 bg-white/[0.03] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
          title={t('top.refresh')}
        >
          <RefreshCw size={13} />
        </button>
        {/* deploy */}
        <button className="h-8 px-3 rounded-lg text-[12.5px] font-medium text-black bg-white hover:bg-zinc-200 transition-colors flex items-center gap-1.5 active:scale-[0.98]">
          <Rocket size={13} />
          {t('top.deploy')}
        </button>
      </div>
    </header>
  )
}
