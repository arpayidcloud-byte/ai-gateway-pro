import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { Plus, Zap, Trash2, Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { useGateway, gateway } from '@/lib/engine'
import { useI18n } from '@/lib/i18n'
import { PROVIDER_PRESETS, REGIONS } from '@/lib/data'
import { fmtNum, fmtCost, fmtAgo, uid } from '@/lib/format'
import { PageHeader, Btn, Badge, Modal, Field, Input, Select, ProviderMark, HealthDot } from '@/components/ui'
import { HealthTicks, Sparkline } from '@/components/charts'

export default function Providers() {
  const g = useGateway()
  const { t, lang } = useI18n()
  const [params, setParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  useEffect(() => { if (params.get('new')) { setOpen(true); setParams({}, { replace: true }) } }, [params, setParams])

  const test = (id: string, name: string, status: string) => {
    setTesting(id)
    setTimeout(() => {
      setTesting(null)
      if (status === 'down') {
        toast.error(lang === 'id' ? 'Koneksi gagal' : 'Connection failed', { description: `${name} · timeout after 10s` })
      } else {
        const ms = 80 + Math.floor(Math.random() * 300)
        gateway.addAudit('test', `provider/${name}`, 'provider', `Tes koneksi · ${ms}ms`)
        toast.success(t('pv.connected'), { description: `${name} · ${ms}ms · TLS 1.3` })
      }
    }, 900 + Math.random() * 800)
  }

  return (
    <div>
      <PageHeader
        title={t('pv.title')}
        sub={t('pv.sub')}
        actions={<Btn variant="primary" onClick={() => setOpen(true)}><Plus size={14} />{t('pv.add')}</Btn>}
      />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {g.providers.map((p, i) => (
          <div key={p.id} className={`panel panel-hover p-4 fade-up flex flex-col ${p.status === 'down' ? 'border-red-400/20' : ''}`} style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex items-start gap-3">
              <ProviderMark preset={p.preset} size={34} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13.5px] font-semibold t-1 truncate">{p.name}</span>
                  <HealthDot status={p.status} size={6} />
                </div>
                <div className="mono text-[10.5px] t-3 truncate mt-0.5">{p.baseUrl}</div>
              </div>
              <Badge tone={p.status === 'ok' ? 'green' : p.status === 'degraded' ? 'amber' : 'red'} dot>
                {p.status === 'ok' ? 'OK' : p.status === 'degraded' ? 'DEGRADED' : 'DOWN'}
              </Badge>
            </div>

            {/* health ticks */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] t-3 uppercase tracking-wider font-semibold">{t('pv.last90')}</span>
                <span className="mono text-[10.5px] t-3">{p.uptime}%</span>
              </div>
              <HealthTicks ticks={p.healthTicks} />
            </div>

            {/* stats */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { l: 'latensi', v: p.status === 'down' ? '—' : p.latency + 'ms' },
                { l: t('pv.models'), v: String(p.models) },
                { l: '24h req', v: fmtNum(p.requests24h) },
                { l: 'biaya', v: fmtCost(p.cost24h) },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-[9.5px] t-3 uppercase tracking-wider">{s.l}</div>
                  <div className="mono text-[12.5px] t-1 mt-0.5">{s.v}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Sparkline data={p.spark} color={p.status === 'ok' ? '#34d399' : p.status === 'degraded' ? '#fbbf24' : '#f87171'} width={110} height={24} />
              <span className="mono text-[10px] t-3 ml-auto">{p.region} · {fmtAgo(p.createdAt, lang)}</span>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2">
              <Btn size="sm" onClick={() => test(p.id, p.name, p.status)} disabled={testing === p.id}>
                {testing === p.id ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                {testing === p.id ? t('pv.testing') : t('pv.test')}
              </Btn>
              <span className="mono text-[10.5px] t-3 ml-auto">{p.keyMasked}</span>
              <button
                onClick={() => { gateway.deleteProvider(p.id); toast(lang === 'id' ? 'Provider dihapus' : 'Provider deleted', { description: p.name }) }}
                className="text-zinc-600 hover:text-red-400 transition-colors p-1"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}

        {/* add card */}
        <button
          onClick={() => setOpen(true)}
          className="panel border-dashed min-h-[220px] flex flex-col items-center justify-center gap-2.5 text-zinc-500 hover:text-zinc-300 hover:border-violet-400/40 transition-all group fade-up"
        >
          <span className="h-10 w-10 rounded-xl border border-dashed border-white/15 flex items-center justify-center group-hover:border-violet-400/50 group-hover:text-violet-300 transition-colors">
            <Plus size={18} />
          </span>
          <span className="text-[13px] font-medium">{t('pv.add')}</span>
          <span className="text-[11px] t-3">{PROVIDER_PRESETS.length} presets tersedia</span>
        </button>
      </div>

      <AddProviderModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

function AddProviderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const g = useGateway()
  const { t, lang } = useI18n()
  const [preset, setPreset] = useState(PROVIDER_PRESETS[0].id)
  const [name, setName] = useState('')
  const [baseUrl, setBaseUrl] = useState(PROVIDER_PRESETS[0].baseUrl)
  const [key, setKey] = useState('')
  const [region, setRegion] = useState('sin1')

  const p = PROVIDER_PRESETS.find((x) => x.id === preset)!

  const pick = (id: string) => {
    const pr = PROVIDER_PRESETS.find((x) => x.id === id)!
    setPreset(id)
    setBaseUrl(pr.baseUrl)
    if (!name) setName(pr.name)
  }

  const save = () => {
    if (!name.trim() || !baseUrl.trim()) {
      toast.error(lang === 'id' ? 'Nama dan base URL wajib diisi' : 'Name and base URL are required')
      return
    }
    gateway.addProvider({
      id: uid(), name: name.trim(), preset, baseUrl: baseUrl.trim(), region,
      status: 'ok', latency: 120 + Math.floor(Math.random() * 200), uptime: 100, models: 1,
      keyMasked: key ? key.slice(0, 6) + '••••' + key.slice(-4) : 'no secret',
      createdAt: Date.now(), spark: Array.from({ length: 24 }, () => 100 + Math.random() * 150),
      healthTicks: Array.from({ length: 90 }, () => 'ok' as const), requests24h: 0, cost24h: 0,
    })
    toast.success(lang === 'id' ? 'Provider ditambahkan' : 'Provider added', { description: name })
    setName(''); setKey('')
    onClose()
  }

  const configuredPresets = new Set(g.providers.map((x) => x.preset))

  return (
    <Modal open={open} onClose={onClose} title={t('pv.add')} sub={t('pv.sub')} wide>
      <div className="space-y-4">
        {/* preset grid */}
        <div>
          <div className="text-[12.5px] font-medium t-2 mb-2">{t('pv.preset')}</div>
          <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto no-scrollbar pr-1">
            {PROVIDER_PRESETS.map((pr) => (
              <button
                key={pr.id}
                onClick={() => pick(pr.id)}
                className={`rounded-lg border p-2.5 flex items-center gap-2 transition-all text-left ${preset === pr.id ? 'border-violet-400/60 bg-violet-400/[0.08]' : 'border-white/10 bg-white/[0.02] hover:border-white/25'}`}
              >
                <ProviderMark preset={pr.id} size={24} />
                <span className="text-[11.5px] font-medium t-1 truncate">{pr.name}</span>
                {configuredPresets.has(pr.id) && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {p.docs && (
          <a href={p.docs} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11.5px] text-violet-300 hover:text-violet-200 transition-colors">
            <ExternalLink size={11} /> {p.name} docs
          </a>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label={t('pv.name')}>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={p.name} />
          </Field>
          <Field label={t('pv.region')}>
            <Select value={region} onChange={setRegion} options={REGIONS.map((r) => ({ value: r, label: r }))} />
          </Field>
        </div>
        <Field label={t('pv.baseUrl')}>
          <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="mono" />
        </Field>
        <Field label={t('pv.apiKey')} hint={lang === 'id' ? 'Disimpan terenkripsi (AES-256). Tidak pernah ditampilkan kembali.' : 'Stored encrypted (AES-256). Never displayed again.'}>
          <Input value={key} onChange={(e) => setKey(e.target.value)} type="password" placeholder="sk-…" className="mono" />
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <Btn onClick={onClose}>{t('c.cancel')}</Btn>
          <Btn variant="primary" onClick={save}>{t('pv.save')}</Btn>
        </div>
      </div>
    </Modal>
  )
}
