import { useEffect, useRef, useState } from 'react'
import { Send, Trash2, Bot, User, Loader2, Sparkles } from 'lucide-react'
import { useGateway, gateway } from '@/lib/engine'
import { useI18n } from '@/lib/i18n'
import { CHAT_REPLY_POOL } from '@/lib/data'
import { fmtCost, fmtMs, fmtFull } from '@/lib/format'
import { PageHeader, Btn, Select, Badge, Field } from '@/components/ui'
import { Logo } from '@/components/layout'

interface Msg {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
  stats?: { latency: number; ttft: number; tokensIn: number; tokensOut: number; cost: number; model: string; provider: string }
}

export default function Playground() {
  const g = useGateway()
  const { t, lang } = useI18n()
  const [route, setRoute] = useState('smart-chat')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1024)
  const [system, setSystem] = useState(lang === 'id' ? 'Anda adalah asisten teknis gateway AI yang ringkas dan akurat.' : 'You are a concise, accurate AI gateway technical assistant.')
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [busy, setBusy] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<number | null>(null)

  const routes = g.routes.filter((r) => r.enabled)
  const activeRoute = routes.find((r) => r.alias === route) ?? routes[0]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  useEffect(() => () => { if (abortRef.current) window.clearInterval(abortRef.current) }, [])

  const send = () => {
    if (!input.trim() || busy || !activeRoute) return
    const userMsg: Msg = { role: 'user', content: input.trim() }
    const target = activeRoute.targets[Math.floor(Math.random() * activeRoute.targets.length)]
    const provider = g.providers.find((p) => p.id === target.providerId)
    const model = g.models.find((m) => m.name === target.model)
    setMsgs((m) => [...m, userMsg, { role: 'assistant', content: '', streaming: true }])
    setInput('')
    setBusy(true)

    const reply = CHAT_REPLY_POOL[Math.floor(Math.random() * CHAT_REPLY_POOL.length)]
    const tokensIn = Math.round((system.length + userMsg.content.length) / 4)
    const tokensOut = Math.round(reply.length / 4)
    const ttft = 180 + Math.random() * 500
    const cost = model ? (tokensIn / 1e6) * model.inputPrice + (tokensOut / 1e6) * model.outputPrice : 0

    // log to gateway as a real request
    gateway.addAudit('test', `playground/${activeRoute.alias}`, 'route', `Playground · ${target.model}`)

    let i = 0
    const started = Date.now()
    abortRef.current = window.setInterval(() => {
      const step = 2 + Math.floor(Math.random() * 3)
      i = Math.min(reply.length, i + step)
      const done = i >= reply.length
      setMsgs((m) => {
        const copy = [...m]
        copy[copy.length - 1] = {
          role: 'assistant',
          content: reply.slice(0, i),
          streaming: !done,
          stats: done ? {
            latency: Date.now() - started + Math.round(ttft),
            ttft: Math.round(ttft),
            tokensIn, tokensOut, cost,
            model: target.model,
            provider: provider?.name ?? '—',
          } : undefined,
        }
        return copy
      })
      if (done) {
        if (abortRef.current) window.clearInterval(abortRef.current)
        abortRef.current = null
        setBusy(false)
      }
    }, 24)
  }

  return (
    <div className="h-full">
      <PageHeader title={t('pg.title')} sub={t('pg.sub')} />

      <div className="grid lg:grid-cols-[1fr_300px] gap-4" style={{ height: 'calc(100vh - 220px)', minHeight: 480 }}>
        {/* chat panel */}
        <div className="panel flex flex-col overflow-hidden">
          {/* header */}
          <div className="flex items-center gap-2.5 px-4 h-11 border-b border-white/[0.06] shrink-0">
            <Logo size={20} />
            <span className="mono text-[12px] t-1">{activeRoute?.alias}</span>
            <Badge tone="violet">{activeRoute?.strategy}</Badge>
            <span className="ml-auto flex items-center gap-1.5">
              <Btn size="sm" onClick={() => setMsgs([])} disabled={msgs.length === 0}><Trash2 size={12} />{t('pg.clear')}</Btn>
            </span>
          </div>

          {/* messages */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
            {msgs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-2xl border border-violet-400/25 bg-violet-400/[0.08] flex items-center justify-center text-violet-300 mb-3 glow-violet">
                  <Sparkles size={20} />
                </div>
                <div className="text-[14px] font-medium t-1">NexusGate Playground</div>
                <div className="text-[12px] t-3 mt-1 max-w-sm">{t('pg.sub')}</div>
                <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-md">
                  {(lang === 'id'
                    ? ['Bagaimana cara kerja semantic cache?', 'Analisis metrik latensi 24 jam terakhir', 'Rekomendasi route untuk reasoning berat']
                    : ['How does semantic cache work?', 'Analyze latency metrics for the last 24h', 'Recommend a route for heavy reasoning']
                  ).map((s) => (
                    <button key={s} onClick={() => setInput(s)} className="text-[11.5px] t-2 border border-white/10 rounded-full px-3 py-1.5 hover:border-violet-400/40 hover:text-white transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-3 fade-up ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <span className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border ${m.role === 'user' ? 'border-white/10 bg-white/[0.06] text-zinc-300' : 'border-violet-400/30 bg-violet-400/[0.1] text-violet-300'}`}>
                  {m.role === 'user' ? <User size={13} /> : <Bot size={13} />}
                </span>
                <div className={`max-w-[78%] ${m.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block text-left rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-violet-500/[0.16] border border-violet-400/20 t-1'
                      : 'bg-white/[0.04] border border-white/[0.07] t-1'
                  }`}>
                    {m.content}
                    {m.streaming && <span className="inline-block w-[7px] h-[14px] bg-violet-400 ml-0.5 align-middle stream-caret" />}
                  </div>
                  {m.stats && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] mono t-3">
                      <span className="text-violet-300">{m.stats.model}</span>
                      <span>{m.stats.provider}</span>
                      <span>TTFT {fmtMs(m.stats.ttft)}</span>
                      <span>total {fmtMs(m.stats.latency)}</span>
                      <span>{fmtFull(m.stats.tokensIn)}→{fmtFull(m.stats.tokensOut)} tok</span>
                      <span>{fmtCost(m.stats.cost)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* input */}
          <div className="p-3 border-t border-white/[0.06] shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') send() }}
                placeholder={t('pg.input')}
                rows={2}
                className="flex-1 resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[13px] t-1 placeholder:text-zinc-600 outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/10 transition-all"
              />
              <Btn variant="primary" onClick={send} disabled={!input.trim() || busy} className="h-9 px-4">
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {t('pg.send')}
              </Btn>
            </div>
          </div>
        </div>

        {/* config panel */}
        <div className="panel p-4 space-y-4 overflow-y-auto no-scrollbar">
          <div className="text-[11px] font-semibold tracking-[0.12em] t-3 uppercase">{t('pg.config')}</div>
          <Field label="Route">
            <Select value={activeRoute?.alias ?? ''} onChange={setRoute} options={routes.map((r) => ({ value: r.alias, label: r.alias }))} />
          </Field>
          <Field label={`${t('pg.temperature')} · ${temperature.toFixed(1)}`}>
            <input type="range" min={0} max={2} step={0.1} value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} className="w-full accent-violet-500" />
            <div className="flex justify-between text-[10px] t-3 mono mt-0.5"><span>precise</span><span>creative</span></div>
          </Field>
          <Field label={`${t('pg.maxTokens')} · ${maxTokens}`}>
            <input type="range" min={128} max={8192} step={128} value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} className="w-full accent-violet-500" />
          </Field>
          <Field label={t('pg.system')}>
            <textarea
              value={system}
              onChange={(e) => setSystem(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px] t-1 outline-none focus:border-violet-400/50 transition-all"
            />
          </Field>

          <div className="pt-3 border-t border-white/[0.06]">
            <div className="text-[11px] font-semibold tracking-[0.12em] t-3 uppercase mb-2.5">{t('pg.stats')}</div>
            <div className="space-y-2">
              {(activeRoute?.targets ?? []).map((tg) => {
                const prov = g.providers.find((p) => p.id === tg.providerId)
                return (
                  <div key={tg.model} className="flex items-center gap-2 panel-inset px-2.5 py-2">
                    <span className={`h-[6px] w-[6px] rounded-full ${prov?.status === 'ok' ? 'bg-emerald-400' : prov?.status === 'degraded' ? 'bg-amber-400' : 'bg-red-400'}`} />
                    <span className="mono text-[11px] t-2 truncate flex-1">{tg.model}</span>
                    <span className="mono text-[10px] t-3">{prov && prov.status !== 'down' ? prov.latency + 'ms' : '—'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
