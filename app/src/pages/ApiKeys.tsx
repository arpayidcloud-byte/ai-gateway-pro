import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { Plus, KeyRound, Copy, RefreshCw, Ban, ShieldAlert, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useGateway, gateway } from '@/lib/engine'
import { useI18n } from '@/lib/i18n'
import { fmtNum, fmtAgo, uid } from '@/lib/format'
import { PageHeader, Btn, Badge, Modal, Field, Input, Select } from '@/components/ui'

const ALL_SCOPES = ['chat', 'embeddings', 'images', 'audio', 'admin']

export default function ApiKeys() {
  const g = useGateway()
  const { t, lang } = useI18n()
  const [params, setParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  useEffect(() => { if (params.get('new')) { setOpen(true); setParams({}, { replace: true }) } }, [params, setParams])

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    toast.success(t('c.copied'))
  }

  return (
    <div>
      <PageHeader
        title={t('ky.title')}
        sub={t('ky.sub')}
        actions={<Btn variant="primary" onClick={() => setOpen(true)}><Plus size={14} />{t('ky.new')}</Btn>}
      />

      <div className="panel overflow-hidden fade-up">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] font-semibold tracking-[0.1em] t-3 uppercase">
                <th className="px-4 py-2.5 font-semibold">{t('ky.name')}</th>
                <th className="px-4 py-2.5 font-semibold">Key</th>
                <th className="px-4 py-2.5 font-semibold hidden lg:table-cell">{t('ky.scopes')}</th>
                <th className="px-4 py-2.5 font-semibold hidden xl:table-cell">{t('ky.rateLimit')}</th>
                <th className="px-4 py-2.5 font-semibold hidden xl:table-cell">Requests</th>
                <th className="px-4 py-2.5 font-semibold hidden lg:table-cell">{t('ky.lastUsed')}</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 font-semibold text-right">{t('c.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {g.keys.map((k) => (
                <tr key={k.id} className={`border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors ${k.status === 'revoked' ? 'opacity-45' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`h-7 w-7 rounded-lg flex items-center justify-center border ${k.env === 'production' ? 'border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300' : 'border-amber-400/20 bg-amber-400/[0.07] text-amber-300'}`}>
                        <KeyRound size={12} />
                      </span>
                      <div>
                        <div className="text-[12.5px] font-medium t-1">{k.name}</div>
                        <div className="text-[10px] t-3 mono">{k.env}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => copy(k.prefix + '••••••••')} className="mono text-[11.5px] t-2 hover:text-white transition-colors flex items-center gap-1.5 group">
                      {k.prefix}••••
                      <Copy size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {k.scopes.map((s) => <Badge key={s} tone={s === 'admin' ? 'amber' : 'neutral'}>{s}</Badge>)}
                    </div>
                  </td>
                  <td className="px-4 py-3 mono text-[11.5px] t-2 hidden xl:table-cell">{fmtNum(k.rateLimit)} rpm</td>
                  <td className="px-4 py-3 mono text-[11.5px] t-2 hidden xl:table-cell">{fmtNum(k.requests)}</td>
                  <td className="px-4 py-3 mono text-[11px] t-3 hidden lg:table-cell">{fmtAgo(k.lastUsed, lang)}</td>
                  <td className="px-4 py-3">
                    {k.status === 'active' ? <Badge tone="green" dot>active</Badge> : <Badge tone="red" dot>revoked</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title={t('ky.rotate')}
                        disabled={k.status !== 'active'}
                        onClick={() => { gateway.rotateKey(k.id); toast.success(t('ky.rotate') + ' ✓', { description: k.name }) }}
                        className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-30"
                      >
                        <RefreshCw size={13} />
                      </button>
                      <button
                        title={t('ky.revoke')}
                        disabled={k.status !== 'active'}
                        onClick={() => { gateway.revokeKey(k.id); toast(lang === 'id' ? 'Key dicabut' : 'Key revoked', { description: k.name, icon: <Ban size={14} /> }) }}
                        className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-400/[0.08] transition-colors disabled:opacity-30"
                      >
                        <Ban size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <NewKeyModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

function NewKeyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useI18n()
  const [name, setName] = useState('')
  const [env, setEnv] = useState<'production' | 'development'>('production')
  const [rateLimit, setRateLimit] = useState('600')
  const [scopes, setScopes] = useState<string[]>(['chat'])
  const [created, setCreated] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const create = () => {
    if (!name.trim() || scopes.length === 0) {
      toast.error(lang === 'id' ? 'Nama dan minimal 1 scope wajib diisi' : 'Name and at least 1 scope are required')
      return
    }
    const full = `nxg_${env === 'production' ? 'live' : 'test'}_${uid()}${uid()}`.slice(0, 34)
    gateway.addKey({
      id: uid(), name: name.trim(), prefix: full.slice(0, 14), scopes,
      rateLimit: Number(rateLimit) || 600, requests: 0, lastUsed: Date.now(),
      createdAt: Date.now(), status: 'active', env,
    })
    setCreated(full)
  }

  const close = () => {
    setCreated(null); setName(''); setScopes(['chat']); setCopied(false)
    onClose()
  }

  return (
    <Modal open={open} onClose={close} title={created ? (lang === 'id' ? 'Key berhasil dibuat' : 'Key created') : t('ky.new')} sub={created ? t('ky.copyWarn') : undefined}>
      {created ? (
        <div className="space-y-4">
          <div className="panel-inset p-3.5 flex items-center gap-2 border-amber-400/20" style={{ borderColor: 'rgba(251,191,36,0.25)' }}>
            <code className="mono text-[12px] text-amber-200 break-all flex-1">{created}</code>
            <button
              onClick={() => { navigator.clipboard.writeText(created).catch(() => {}); setCopied(true) }}
              className="shrink-0 h-7 w-7 rounded-md border border-white/10 bg-white/[0.04] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          </div>
          <div className="flex items-start gap-2 text-[11.5px] t-3">
            <ShieldAlert size={13} className="text-amber-400 shrink-0 mt-0.5" />
            <span>{t('ky.copyWarn')}</span>
          </div>
          <Btn variant="primary" className="w-full" onClick={close}>{t('c.close')}</Btn>
        </div>
      ) : (
        <div className="space-y-4">
          <Field label={t('ky.name')}>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="web-app-prod" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Environment">
              <Select value={env} onChange={(v) => setEnv(v as 'production' | 'development')} options={[{ value: 'production', label: 'production' }, { value: 'development', label: 'development' }]} />
            </Field>
            <Field label={t('ky.rateLimit')}>
              <Input value={rateLimit} onChange={(e) => setRateLimit(e.target.value)} type="number" className="mono" />
            </Field>
          </div>
          <div>
            <div className="text-[12.5px] font-medium t-2 mb-2">{t('ky.scopes')}</div>
            <div className="flex flex-wrap gap-2">
              {ALL_SCOPES.map((s) => (
                <button
                  key={s}
                  onClick={() => setScopes((sc) => (sc.includes(s) ? sc.filter((x) => x !== s) : [...sc, s]))}
                  className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all ${scopes.includes(s) ? 'border-violet-400/60 bg-violet-400/[0.12] text-violet-200' : 'border-white/10 bg-white/[0.02] text-zinc-500 hover:border-white/25'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Btn onClick={close}>{t('c.cancel')}</Btn>
            <Btn variant="primary" onClick={create}>{t('c.create')}</Btn>
          </div>
        </div>
      )}
    </Modal>
  )
}
