import { useState } from 'react'
import { Plus, Combine, Trash2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useGateway, gateway } from '@/lib/engine'
import { useI18n } from '@/lib/i18n'
import type { Strategy } from '@/lib/types'
import { fmtNum, fmtMs, uid } from '@/lib/format'
import { PageHeader, Btn, Badge, Toggle, Modal, Field, Input, Select } from '@/components/ui'

const STRATEGIES: Strategy[] = ['least-latency', 'weighted', 'round-robin', 'cost', 'failover']

export default function Combos() {
  const g = useGateway()
  const { t, lang } = useI18n()
  const [open, setOpen] = useState(false)

  return (
    <div>
      <PageHeader
        title={t('cb.title')}
        sub={t('cb.sub')}
        actions={<Btn variant="primary" onClick={() => setOpen(true)}><Plus size={14} />{t('cb.new')}</Btn>}
      />

      <div className="grid md:grid-cols-2 gap-4">
        {g.combos.map((c, i) => (
          <div key={c.id} className={`panel panel-hover p-4 fade-up ${!c.enabled ? 'opacity-55' : ''}`} style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start gap-3">
              <span className="h-8 w-8 rounded-lg border border-cyan-400/25 bg-cyan-400/[0.08] flex items-center justify-center text-cyan-300 shrink-0">
                <Combine size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="mono text-[13.5px] font-semibold t-1">{c.name}</span>
                  <Badge tone="cyan">{c.strategy}</Badge>
                </div>
                <div className="text-[11.5px] t-3 mt-0.5">{c.members.length} {t('cb.members').toLowerCase()} · {fmtNum(c.requests24h)} req/24h {c.avgLatency ? `· ${fmtMs(c.avgLatency)}` : ''}</div>
              </div>
              <Toggle checked={c.enabled} onChange={() => gateway.toggleCombo(c.id)} />
            </div>

            {/* member chain visual */}
            <div className="mt-4 panel-inset p-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="mono text-[10.5px] px-1.5 py-1 rounded border border-white/10 bg-white/[0.04] text-zinc-400">client</span>
                <ArrowRight size={11} className="t-3" />
                {c.members.map((m, mi) => (
                  <span key={mi} className="flex items-center gap-1.5">
                    <span className="mono text-[10.5px] px-1.5 py-1 rounded border border-violet-400/25 bg-violet-400/[0.08] text-violet-300">
                      {m.routeAlias} <span className="text-violet-400/70">·{m.weight}%</span>
                    </span>
                    {mi < c.members.length - 1 && <span className="t-3 text-[10px]">+</span>}
                  </span>
                ))}
                <ArrowRight size={11} className="t-3" />
                <span className="mono text-[10.5px] px-1.5 py-1 rounded border border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300">response</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-1">
                {c.members.map((m, mi) => (
                  <div key={mi} className="h-[4px] rounded-full" style={{ width: `${m.weight * 0.8}px`, background: ['#7c5cfc', '#22d3ee', '#34d399', '#fbbf24'][mi % 4] }} />
                ))}
              </div>
              <button
                onClick={() => { gateway.deleteCombo(c.id); toast(lang === 'id' ? 'Combo dihapus' : 'Combo deleted', { description: c.name }) }}
                className="text-zinc-600 hover:text-red-400 transition-colors p-1"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <NewComboModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

function NewComboModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const g = useGateway()
  const { t, lang } = useI18n()
  const [name, setName] = useState('')
  const [strategy, setStrategy] = useState<Strategy>('least-latency')
  const [members, setMembers] = useState<string[]>([])

  const toggleMember = (alias: string) => {
    setMembers((m) => (m.includes(alias) ? m.filter((x) => x !== alias) : [...m, alias]))
  }

  const create = () => {
    if (!name.trim() || members.length < 2) {
      toast.error(lang === 'id' ? 'Nama dan minimal 2 route wajib diisi' : 'Name and at least 2 routes are required')
      return
    }
    const weight = Math.floor(100 / members.length)
    gateway.addCombo({
      id: uid(), name: name.trim(), strategy,
      members: members.map((m, i) => ({ routeAlias: m, weight: i === 0 ? 100 - weight * (members.length - 1) : weight })),
      enabled: true, requests24h: 0, avgLatency: 0,
    })
    toast.success(lang === 'id' ? 'Combo dibuat' : 'Combo created', { description: name })
    setName(''); setMembers([])
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={t('cb.new')} sub={lang === 'id' ? 'Satu endpoint virtual yang membagi traffic ke beberapa route.' : 'One virtual endpoint distributing traffic across routes.'}>
      <div className="space-y-4">
        <Field label={lang === 'id' ? 'Nama combo' : 'Combo name'}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="production-chat" className="mono" />
        </Field>
        <Field label={t('rt.strategy')}>
          <Select value={strategy} onChange={(v) => setStrategy(v as Strategy)} options={STRATEGIES.map((s) => ({ value: s, label: s }))} />
        </Field>
        <div>
          <div className="text-[12.5px] font-medium t-2 mb-2">{t('cb.members')} <span className="t-3 font-normal">({lang === 'id' ? 'min. 2' : 'min. 2'})</span></div>
          <div className="grid grid-cols-2 gap-2">
            {g.routes.filter((r) => r.enabled).map((r) => (
              <button
                key={r.id}
                onClick={() => toggleMember(r.alias)}
                className={`rounded-lg border px-3 py-2 text-left transition-all ${members.includes(r.alias) ? 'border-violet-400/60 bg-violet-400/[0.08]' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}
              >
                <div className="mono text-[12px] t-1">{r.alias}</div>
                <div className="text-[10px] t-3 mt-0.5">{r.strategy} · {fmtNum(r.requests24h)}/24h</div>
              </button>
            ))}
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
