import { useState } from 'react'
import { toast } from 'sonner'
import { useI18n } from '@/lib/i18n'
import { PageHeader, Btn, Tabs, Field, Input, Select, Toggle, Badge } from '@/components/ui'
import { REGIONS } from '@/lib/data'
import { ShieldCheck, Globe, Database, Timer, BellRing, Lock } from 'lucide-react'

export default function Settings() {
  const { t, lang } = useI18n()
  const [tab, setTab] = useState('general')
  const save = () => toast.success(t('st.saved'), { description: lang === 'id' ? 'Konfigurasi diterapkan ke seluruh node edge' : 'Configuration applied to all edge nodes' })

  return (
    <div className="max-w-3xl">
      <PageHeader title={t('st.title')} sub={t('st.sub')} actions={<Btn variant="primary" onClick={save}>{t('st.save')}</Btn>} />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'general', label: t('st.general') },
          { value: 'routing', label: t('st.routing') },
          { value: 'caching', label: t('st.caching') },
          { value: 'ratelimit', label: t('st.ratelimit') },
          { value: 'security', label: t('st.security') },
          { value: 'notifications', label: t('st.notifications') },
        ]}
      />

      {tab === 'general' && (
        <div className="space-y-4 fade-up">
          <Section icon={<Globe size={14} />} title={lang === 'id' ? 'Identitas gateway' : 'Gateway identity'}>
            <div className="grid grid-cols-2 gap-3">
              <Field label={lang === 'id' ? 'Nama gateway' : 'Gateway name'}><Input defaultValue="nexusgate-prod" /></Field>
              <Field label={t('pv.region')}><Select value="sin1" onChange={() => {}} options={REGIONS.map((r) => ({ value: r, label: r }))} /></Field>
            </div>
            <Field label="Endpoint publik">
              <div className="flex items-center gap-2">
                <Input defaultValue="https://gateway.nexusgate.dev/v1" className="mono" readOnly />
                <Badge tone="green" dot>active</Badge>
              </div>
            </Field>
          </Section>
          <Section icon={<Timer size={14} />} title={lang === 'id' ? 'Perilaku default' : 'Default behavior'}>
            <ToggleRow title={lang === 'id' ? 'Mode observabilitas detail' : 'Verbose observability'} desc={lang === 'id' ? 'Simpan trace lengkap setiap request (tanpa payload)' : 'Store full trace of every request (no payload)'} defaultOn />
            <ToggleRow title={lang === 'id' ? 'Auto-failover global' : 'Global auto-failover'} desc={lang === 'id' ? 'Alihkan otomatis saat provider down' : 'Automatically reroute when a provider is down'} defaultOn />
            <ToggleRow title="Streaming passthrough" desc={lang === 'id' ? 'Teruskan SSE token-per-token ke klien' : 'Forward SSE token-by-token to clients'} defaultOn />
          </Section>
        </div>
      )}

      {tab === 'routing' && (
        <div className="space-y-4 fade-up">
          <Section icon={<Timer size={14} />} title={lang === 'id' ? 'Timeout & retry' : 'Timeout & retry'}>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Timeout upstream (s)"><Input defaultValue="30" type="number" className="mono" /></Field>
              <Field label="Retry budget"><Input defaultValue="2" type="number" className="mono" /></Field>
              <Field label="Backoff dasar (ms)"><Input defaultValue="250" type="number" className="mono" /></Field>
            </div>
            <ToggleRow title={lang === 'id' ? 'Circuit breaker' : 'Circuit breaker'} desc={lang === 'id' ? 'Putus sementara provider dengan error rate > 5% selama 60s' : 'Temporarily cut providers with error rate > 5% for 60s'} defaultOn />
            <ToggleRow title={lang === 'id' ? 'Hedged requests' : 'Hedged requests'} desc={lang === 'id' ? 'Kirim request cadangan jika p95 terlampaui' : 'Send a backup request when p95 is exceeded'} />
          </Section>
          <Section icon={<ShieldCheck size={14} />} title={lang === 'id' ? 'Kualitas' : 'Quality'}>
            <div className="grid grid-cols-2 gap-3">
              <Field label={lang === 'id' ? 'Ambang degradasi (ms)' : 'Degradation threshold (ms)'}><Input defaultValue="1500" type="number" className="mono" /></Field>
              <Field label={lang === 'id' ? 'Health-check interval' : 'Health-check interval'}><Select value="10s" onChange={() => {}} options={['5s', '10s', '30s', '60s'].map((v) => ({ value: v, label: v }))} /></Field>
            </div>
          </Section>
        </div>
      )}

      {tab === 'caching' && (
        <div className="space-y-4 fade-up">
          <Section icon={<Database size={14} />} title="Semantic cache">
            <ToggleRow title={lang === 'id' ? 'Aktifkan semantic cache' : 'Enable semantic cache'} desc={lang === 'id' ? 'Cocokkan prompt via embedding similarity' : 'Match prompts via embedding similarity'} defaultOn />
            <div className="grid grid-cols-3 gap-3 mt-2">
              <Field label={lang === 'id' ? 'Ambang kemiripan' : 'Similarity threshold'}><Input defaultValue="0.94" className="mono" /></Field>
              <Field label="TTL (jam)"><Input defaultValue="24" type="number" className="mono" /></Field>
              <Field label={lang === 'id' ? 'Ukuran maks' : 'Max size'}><Select value="10k entries" onChange={() => {}} options={['1k entries', '10k entries', '100k entries'].map((v) => ({ value: v, label: v }))} /></Field>
            </div>
          </Section>
          <Section icon={<Database size={14} />} title="Exact-match cache">
            <ToggleRow title={lang === 'id' ? 'Cache respons identik' : 'Cache identical responses'} desc={lang === 'id' ? 'Hash prompt+parameter sebagai key' : 'Hash prompt+parameters as key'} defaultOn />
          </Section>
        </div>
      )}

      {tab === 'ratelimit' && (
        <div className="space-y-4 fade-up">
          <Section icon={<Timer size={14} />} title={lang === 'id' ? 'Batas global' : 'Global limits'}>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Gateway RPM"><Input defaultValue="10000" type="number" className="mono" /></Field>
              <Field label={lang === 'id' ? 'RPM default per key' : 'Default RPM per key'}><Input defaultValue="600" type="number" className="mono" /></Field>
              <Field label="Burst multiplier"><Input defaultValue="1.5" className="mono" /></Field>
            </div>
            <ToggleRow title={lang === 'id' ? 'Antrian burst (queued)' : 'Burst queue'} desc={lang === 'id' ? 'Antrekan request berlebih daripada menolak 429' : 'Queue excess requests instead of returning 429'} />
          </Section>
        </div>
      )}

      {tab === 'security' && (
        <div className="space-y-4 fade-up">
          <Section icon={<Lock size={14} />} title={lang === 'id' ? 'Perlindungan data' : 'Data protection'}>
            <ToggleRow title={lang === 'id' ? 'Redaksi payload di log' : 'Redact payloads in logs'} desc={lang === 'id' ? 'Prompt & completion tidak pernah disimpan' : 'Prompts & completions are never stored'} defaultOn locked />
            <ToggleRow title="PII masking" desc={lang === 'id' ? 'Sensor email, nomor kartu, dan PII lain sebelum ke provider' : 'Mask emails, card numbers and other PII before upstream'} defaultOn />
            <ToggleRow title={lang === 'id' ? 'Enkripsi at-rest (AES-256)' : 'At-rest encryption (AES-256)'} desc={lang === 'id' ? 'Semua secret provider terenkripsi' : 'All provider secrets encrypted'} defaultOn locked />
          </Section>
          <Section icon={<Globe size={14} />} title="CORS & origin">
            <Field label={lang === 'id' ? 'Allowed origins (satu per baris)' : 'Allowed origins (one per line)'}>
              <textarea rows={3} defaultValue={'https://app.nexus.dev\nhttps://staging.nexus.dev'} className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px] t-1 outline-none focus:border-violet-400/50 transition-all mono" />
            </Field>
          </Section>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="space-y-4 fade-up">
          <Section icon={<BellRing size={14} />} title={lang === 'id' ? 'Webhook alert' : 'Alert webhooks'}>
            <Field label="Slack webhook URL"><Input defaultValue="https://hooks.slack.com/services/T•••/B•••/•••" className="mono" /></Field>
            <div className="mt-2 space-y-1">
              <ToggleRow title={lang === 'id' ? 'Provider down / degraded' : 'Provider down / degraded'} desc="" defaultOn />
              <ToggleRow title={lang === 'id' ? 'Budget terlampaui (80% / 100%)' : 'Budget exceeded (80% / 100%)'} desc="" defaultOn />
              <ToggleRow title={lang === 'id' ? 'Error rate spike' : 'Error rate spike'} desc="" />
            </div>
          </Section>
        </div>
      )}
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 mb-3.5">
        <span className="h-6 w-6 rounded-md border border-white/10 bg-white/[0.04] flex items-center justify-center text-zinc-400">{icon}</span>
        <span className="text-[13.5px] font-semibold t-1">{title}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function ToggleRow({ title, desc, defaultOn = false, locked = false }: { title: string; desc: string; defaultOn?: boolean; locked?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 min-w-0">
        <div className="text-[13px] t-1 font-medium flex items-center gap-2">{title}{locked && <Lock size={11} className="t-3" />}</div>
        {desc && <div className="text-[11.5px] t-3 mt-0.5">{desc}</div>}
      </div>
      <Toggle checked={on} onChange={locked ? () => {} : setOn} disabled={locked} />
    </div>
  )
}
