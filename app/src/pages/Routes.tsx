import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { Plus, Route as RouteIcon, ArrowRight, Trash2, Shield, Shuffle, Gauge, DollarSign, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'
import { useGateway, gateway } from '@/lib/engine'
import { useI18n } from '@/lib/i18n'
import type { Strategy, RouteTarget } from '@/lib/types'
import { fmtNum, fmtCost, fmtMs, uid } from '@/lib/format'
import { PageHeader, Btn, Badge, Toggle, Modal, Field, Input, Select, ProviderMark } from '@/components/ui'

const STRATEGY_META: Record<Strategy, { icon: React.ReactNode; desc: string; tone: 'violet' | 'cyan' | 'amber' | 'green' | 'blue' }> = {
  weighted: { icon: <Shuffle size={13} />, desc: 'Distribusi berdasarkan bobot persentase', tone: 'violet' },
  'least-latency': { icon: <Gauge size={13} />, desc: 'Pilih target dengan latensi terendah', tone: 'cyan' },
  failover: { icon: <Shield size={13} />, desc: 'Target utama, fallback saat gagal', tone: 'amber' },
  cost: { icon: <DollarSign size={13} />, desc: 'Prioritaskan target termurah', tone: 'green' },
  'round-robin': { icon: <RefreshCcw size={13} />, desc: 'Rotasi merata ke semua target', tone: 'blue' },
}

export default function RoutesPage() {
  const g = useGateway()
  const { t, lang } = useI18n()
  const [params, setParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  useEffect(() => { if (params.get('new')) { setOpen(true); setParams({}, { replace: true }) } }, [params, setParams])

  return (
    <div>
      <PageHeader
        title={t('rt.title')}
        sub={t('rt.sub')}
        actions={<Btn variant="primary" onClick={() => setOpen(true)}><Plus size={14} />{t('rt.new')}</Btn>}
      />

      <div className="grid lg:grid-cols-2 gap-4">
        {g.routes.map((r, i) => (
          <div key={r.id} className={`panel panel-hover p-4 fade-up ${!r.enabled ? 'opacity-55' : ''}`} style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start gap-3">
              <span className="h-8 w-8 rounded-lg border border-violet-400/25 bg-violet-400/[0.08] flex items-center justify-center text-violet-300 shrink-0">
                <RouteIcon size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="mono text-[13.5px] font-semibold t-1">{r.alias}</span>
                  <Badge tone={STRATEGY_META[r.strategy].tone}>{r.strategy}</Badge>
                  {!r.enabled && <Badge tone="neutral">{t('rt.disabled')}</Badge>}
                </div>
                <div className="text-[11.5px] t-3 mt-0.5 truncate">{r.description}</div>
              </div>
              <Toggle checked={r.enabled} onChange={() => { gateway.toggleRoute(r.id); toast.success(r.enabled ? `Route ${r.alias} nonaktif` : `Route ${r.alias} aktif`) }} />
            </div>

            {/* targets */}
            <div className="mt-4 space-y-2">
              {r.targets.map((tg) => {
                const prov = g.providers.find((p) => p.id === tg.providerId)
                return (
                  <div key={tg.providerId + tg.model} className="flex items-center gap-2.5">
                    <ProviderMark preset={prov?.preset ?? 'compatible'} size={22} />
                    <span className="mono text-[11.5px] t-1 w-40 truncate">{tg.model}</span>
                    <div className="flex-1 h-[6px] rounded-full bg-white/[0.05] overflow-hidden">
                      <div className="h-full rounded-full bar-grow" style={{ width: `${tg.weight}%`, background: 'linear-gradient(90deg,#7c5cfc,#5b8cff)' }} />
                    </div>
                    <span className="mono text-[11px] t-2 w-9 text-right">{tg.weight}%</span>
                  </div>
                )
              })}
            </div>

            {/* fallback chain */}
            {r.fallbacks.length > 0 && (
              <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] t-3 uppercase tracking-wider font-semibold mr-1">{t('rt.fallback')}</span>
                {r.fallbacks.map((fb, fi) => (
                  <span key={fi} className="flex items-center gap-1.5">
                    {fi > 0 && <ArrowRight size={10} className="t-3" />}
                    <span className="mono text-[10.5px] px-1.5 py-0.5 rounded border border-amber-400/20 bg-amber-400/[0.07] text-amber-300">{fb.model}</span>
                  </span>
                ))}
              </div>
            )}

            {/* stats */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] grid grid-cols-4 gap-2">
              {[
                { l: '24h', v: fmtNum(r.requests24h) },
                { l: 'success', v: r.requests24h ? r.successRate.toFixed(1) + '%' : '—' },
                { l: 'latensi', v: r.requests24h ? fmtMs(r.avgLatency) : '—' },
                { l: 'biaya', v: r.requests24h ? fmtCost(r.cost24h) : '—' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-[10px] t-3 uppercase tracking-wider">{s.l}</div>
                  <div className="mono text-[13px] t-1 mt-0.5">{s.v}</div>
                </div>
              ))}
              <button
                onClick={() => { gateway.deleteRoute(r.id); toast(lang === 'id' ? 'Route dihapus' : 'Route deleted', { description: r.alias }) }}
                className="col-span-4 mt-1 text-[11px] text-zinc-600 hover:text-red-400 transition-colors flex items-center gap-1 justify-end"
              >
                <Trash2 size={11} />{lang === 'id' ? 'Hapus route' : 'Delete route'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <NewRouteModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

function NewRouteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const g = useGateway()
  const { t, lang } = useI18n()
  const [alias, setAlias] = useState('')
  const [desc, setDesc] = useState('')
  const [strategy, setStrategy] = useState<Strategy>('weighted')
  const [targets, setTargets] = useState<RouteTarget[]>([])
  const [modelSel, setModelSel] = useState('')

  const enabledModels = g.models.filter((m) => m.enabled)

  const addTarget = () => {
    const m = enabledModels.find((x) => x.name === modelSel)
    if (!m || targets.some((x) => x.model === m.name)) return
    setTargets([...targets, { providerId: m.provider, model: m.name, weight: Math.max(10, 100 - targets.reduce((s, x) => s + x.weight, 0)) }])
  }

  const create = () => {
    if (!alias.trim() || targets.length === 0) {
      toast.error(lang === 'id' ? 'Alias dan minimal 1 target wajib diisi' : 'Alias and at least 1 target are required')
      return
    }
    gateway.addRoute({
      id: uid(), alias: alias.trim(), description: desc.trim() || 'Custom route', strategy, targets, fallbacks: [],
      enabled: true, requests24h: 0, successRate: 100, avgLatency: 0, cost24h: 0, createdAt: Date.now(),
    })
    toast.success(lang === 'id' ? 'Route dibuat' : 'Route created', { description: alias })
    setAlias(''); setDesc(''); setTargets([]); setStrategy('weighted')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={t('rt.new')} sub={lang === 'id' ? 'Alias model akan bisa dipanggil lewat endpoint gateway.' : 'The model alias becomes callable through the gateway endpoint.'} wide>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('rt.alias')}>
            <Input value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="smart-chat" className="mono" />
          </Field>
          <Field label={t('rt.strategy')}>
            <Select value={strategy} onChange={(v) => setStrategy(v as Strategy)} options={(Object.keys(STRATEGY_META) as Strategy[]).map((s) => ({ value: s, label: s }))} />
          </Field>
        </div>
        <Field label={lang === 'id' ? 'Deskripsi' : 'Description'}>
          <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={lang === 'id' ? 'Opsional' : 'Optional'} />
        </Field>

        {/* strategy cards */}
        <div className="grid grid-cols-5 gap-2 max-md:grid-cols-3">
          {(Object.keys(STRATEGY_META) as Strategy[]).map((s) => (
            <button
              key={s}
              onClick={() => setStrategy(s)}
              className={`rounded-lg border p-2.5 text-left transition-all ${strategy === s ? 'border-violet-400/60 bg-violet-400/[0.08]' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}
              title={STRATEGY_META[s].desc}
            >
              <span className={`${strategy === s ? 'text-violet-300' : 'text-zinc-500'}`}>{STRATEGY_META[s].icon}</span>
              <div className={`text-[10.5px] font-medium mt-1.5 mono ${strategy === s ? 't-1' : 't-3'}`}>{s}</div>
            </button>
          ))}
        </div>

        {/* targets */}
        <div>
          <div className="text-[12.5px] font-medium t-2 mb-1.5">{t('rt.targets')}</div>
          <div className="flex gap-2">
            <Select value={modelSel} onChange={setModelSel} className="flex-1" options={[{ value: '', label: lang === 'id' ? 'Pilih model…' : 'Select model…' }, ...enabledModels.map((m) => ({ value: m.name, label: `${m.name} · ${m.providerName}` }))]} />
            <Btn onClick={addTarget} disabled={!modelSel}><Plus size={13} />{lang === 'id' ? 'Tambah' : 'Add'}</Btn>
          </div>
          <div className="mt-3 space-y-2.5">
            {targets.map((tg, i) => (
              <div key={tg.model} className="flex items-center gap-3 panel-inset px-3 py-2">
                <span className="mono text-[12px] t-1 flex-1 truncate">{tg.model}</span>
                <input
                  type="range" min={5} max={100} value={tg.weight}
                  onChange={(e) => setTargets(targets.map((x, xi) => (xi === i ? { ...x, weight: Number(e.target.value) } : x)))}
                  className="w-28 accent-violet-500"
                />
                <span className="mono text-[11px] t-2 w-9 text-right">{tg.weight}%</span>
                <button onClick={() => setTargets(targets.filter((_, xi) => xi !== i))} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
              </div>
            ))}
            {targets.length === 0 && <div className="text-[11.5px] t-3 text-center py-3 border border-dashed border-white/10 rounded-lg">{lang === 'id' ? 'Belum ada target' : 'No targets yet'}</div>}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Btn onClick={onClose}>{t('c.cancel')}</Btn>
          <Btn variant="primary" onClick={create}>{t('c.create')}</Btn>
        </div>
      </div>
    </Modal>
  )
}
