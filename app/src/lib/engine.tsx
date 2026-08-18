import { useSyncExternalStore } from 'react'
import type { GatewayState, RequestLog, TimePoint, Provider, RouteRule, Combo, ApiKey, ModelInfo, AuditEvent, ReqStatus } from './types'
import { seedProviders, seedModels, seedRoutes, seedCombos, seedKeys, seedAudit, USER_AGENTS } from './data'
import { uid, clamp } from './format'

const HOUR = 3600_000
const MIN = 60_000
const now = Date.now()

function genSeries(points: number, step: number, scale: number): TimePoint[] {
  const out: TimePoint[] = []
  let base = 42 * scale
  for (let i = points - 1; i >= 0; i--) {
    const tod = Math.sin(((points - i) / points) * Math.PI * 2 * 2 + 1) * 0.35 + 1
    base = Math.max(scale * 8, base + (Math.random() - 0.5) * scale * 14)
    const total = Math.round(base * tod)
    const error = Math.round(total * (Math.random() * 0.012))
    const fallback = Math.round(total * (0.01 + Math.random() * 0.03))
    const p50 = Math.round(180 + Math.random() * 120)
    out.push({
      t: now - i * step,
      success: total - error - fallback,
      fallback,
      error,
      tokensIn: total * (380 + Math.random() * 240),
      tokensOut: total * (240 + Math.random() * 160),
      cost: total * (0.0018 + Math.random() * 0.0012),
      p50,
      p95: p50 * (2.1 + Math.random() * 0.5),
      p99: p50 * (3.6 + Math.random() * 0.9),
    })
  }
  return out
}

function randomLog(routes: RouteRule[], providers: Provider[], models: ModelInfo[], keys: ApiKey[]): RequestLog | null {
  const active = routes.filter((r) => r.enabled)
  if (!active.length) return null
  const totalW = active.reduce((s, r) => s + r.requests24h, 0)
  let pick = Math.random() * totalW
  let route = active[0]
  for (const r of active) {
    pick -= r.requests24h
    if (pick <= 0) { route = r; break }
  }
  const target = route.targets[Math.floor(Math.random() * route.targets.length)]
  const provider = providers.find((p) => p.id === target.providerId)
  const model = models.find((m) => m.name === target.model)
  if (!provider || !model) return null

  const roll = Math.random()
  let status: ReqStatus = 'success'
  let error: string | undefined
  if (provider.status === 'down' || roll < 0.008) {
    status = 'error'
    error = provider.status === 'down' ? 'upstream_unavailable' : ['timeout_30s', 'context_length_exceeded', 'invalid_api_key', 'model_overloaded'][Math.floor(Math.random() * 4)]
  } else if (roll < 0.016) {
    status = 'rate_limited'
    error = 'rate_limit_exceeded'
  } else if (roll < 0.05) {
    status = 'fallback'
  }
  const retries = status === 'fallback' ? 1 : status === 'error' ? 2 : 0
  const latBase = provider.status === 'down' ? 30000 : provider.latency
  const latency = status === 'fallback' ? Math.round(latBase + 400 + Math.random() * 600) : Math.round(Math.max(38, latBase * (0.5 + Math.random() * 1.4)))
  const tokensIn = status === 'error' ? Math.round(Math.random() * 200) : Math.round(120 + Math.random() * 2400)
  const tokensOut = status === 'error' ? 0 : Math.round(40 + Math.random() * 900)
  const cost = (tokensIn / 1e6) * model.inputPrice + (tokensOut / 1e6) * model.outputPrice
  const key = keys.filter((k) => k.status === 'active')[Math.floor(Math.random() * keys.filter((k) => k.status === 'active').length)]

  return {
    id: uid(),
    ts: Date.now(),
    routeAlias: route.alias,
    model: target.model,
    providerName: provider.name,
    keyPrefix: key?.prefix ?? 'nxg_live_••••',
    status,
    latency,
    ttft: Math.round(latency * (0.25 + Math.random() * 0.25)),
    tokensIn,
    tokensOut,
    cost,
    region: provider.region,
    retries,
    cache: Math.random() < 0.08,
    error,
    userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
  }
}

function backfillLogs(routes: RouteRule[], providers: Provider[], models: ModelInfo[], keys: ApiKey[]): RequestLog[] {
  const out: RequestLog[] = []
  for (let i = 0; i < 240; i++) {
    const l = randomLog(routes, providers, models, keys)
    if (l) {
      l.ts = now - Math.floor(Math.random() * 6 * HOUR)
      out.push(l)
    }
  }
  return out.sort((a, b) => b.ts - a.ts)
}

class GatewayStore {
  private state: GatewayState
  private listeners = new Set<() => void>()
  private timer: ReturnType<typeof setInterval> | null = null
  private tickCount = 0

  constructor() {
    const providers = seedProviders()
    const models = seedModels()
    const routes = seedRoutes()
    const state: GatewayState = {
      providers,
      models,
      routes,
      combos: seedCombos(),
      keys: seedKeys(),
      logs: backfillLogs(routes, providers, models, seedKeys()),
      audit: seedAudit(),
      series: {
        '1h': genSeries(60, MIN, 1),
        '24h': genSeries(48, 30 * MIN, 6),
        '7d': genSeries(84, 2 * HOUR, 36),
        '30d': genSeries(90, 8 * HOUR, 120),
      },
      live: true,
      totalRequests: 148_244,
      gatewayLatency: 9,
      region: 'sin1',
    }
    this.state = state
  }

  subscribe = (fn: () => void) => {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }

  getSnapshot = () => this.state

  private emit() {
    this.state = { ...this.state }
    this.listeners.forEach((f) => f())
  }

  start() {
    if (this.timer) return
    this.timer = setInterval(() => this.tick(), 2600)
  }

  stop() {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  setLive(live: boolean) {
    this.state.live = live
    this.emit()
  }

  private tick() {
    if (!this.state.live) return
    this.tickCount++
    const s = this.state
    const newLogs: RequestLog[] = []
    const n = 1 + Math.floor(Math.random() * 3)
    for (let i = 0; i < n; i++) {
      const l = randomLog(s.routes, s.providers, s.models, s.keys)
      if (l) newLogs.push(l)
    }
    if (newLogs.length) {
      s.logs = [...newLogs, ...s.logs].slice(0, 500)
      s.totalRequests += newLogs.length
      for (const l of newLogs) {
        const r = s.routes.find((x) => x.alias === l.routeAlias)
        if (r) r.requests24h += 1
        const k = s.keys.find((x) => x.prefix === l.keyPrefix)
        if (k) { k.requests += 1; k.lastUsed = l.ts }
      }
    }
    // jitter provider latency + spark
    s.providers = s.providers.map((p) => {
      if (p.status === 'down') return p
      const latency = clamp(Math.round(p.latency + (Math.random() - 0.5) * 24), 40, 2000)
      return { ...p, latency, spark: [...p.spark.slice(1), latency] }
    })
    s.gatewayLatency = clamp(s.gatewayLatency + Math.round((Math.random() - 0.5) * 4), 5, 30)
    // update series tail
    for (const key of ['1h', '24h', '7d', '30d'] as const) {
      const arr = s.series[key]
      const last = arr[arr.length - 1]
      last.success += Math.round(newLogs.filter((l) => l.status === 'success').length * (key === '30d' ? 40 : key === '7d' ? 12 : key === '24h' ? 2 : 1))
      last.fallback += newLogs.filter((l) => l.status === 'fallback').length
      last.error += newLogs.filter((l) => l.status === 'error' || l.status === 'rate_limited').length
      last.tokensIn += newLogs.reduce((a, l) => a + l.tokensIn, 0)
      last.tokensOut += newLogs.reduce((a, l) => a + l.tokensOut, 0)
      last.cost += newLogs.reduce((a, l) => a + l.cost, 0)
      if (this.tickCount % 24 === 0) {
        const step = key === '1h' ? MIN : key === '24h' ? 30 * MIN : key === '7d' ? 2 * HOUR : 8 * HOUR
        arr.push({ ...last, t: last.t + step, success: Math.round(last.success * 0.7), fallback: 1, error: 0, tokensIn: Math.round(last.tokensIn * 0.7), tokensOut: Math.round(last.tokensOut * 0.7), cost: last.cost * 0.7 })
        arr.shift()
      }
    }
    this.emit()
  }

  refresh() {
    this.tick()
  }

  // ---- mutations ----
  addAudit(action: AuditEvent['action'], target: string, targetType: string, detail: string) {
    this.state.audit = [{ id: uid(), ts: Date.now(), actor: 'raka@nexus.dev', action, target, targetType, ip: '103.147.8.21', detail }, ...this.state.audit].slice(0, 60)
  }

  addProvider(p: Provider) {
    this.state.providers = [p, ...this.state.providers]
    this.addAudit('create', `provider/${p.name}`, 'provider', `Preset ${p.preset} · ${p.region}`)
    this.emit()
  }

  updateProvider(id: string, patch: Partial<Provider>) {
    this.state.providers = this.state.providers.map((p) => (p.id === id ? { ...p, ...patch } : p))
    this.emit()
  }

  deleteProvider(id: string) {
    const p = this.state.providers.find((x) => x.id === id)
    this.state.providers = this.state.providers.filter((x) => x.id !== id)
    if (p) this.addAudit('delete', `provider/${p.name}`, 'provider', 'Provider dihapus')
    this.emit()
  }

  toggleRoute(id: string) {
    this.state.routes = this.state.routes.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    const r = this.state.routes.find((x) => x.id === id)
    if (r) this.addAudit('update', `route/${r.alias}`, 'route', r.enabled ? 'Route diaktifkan' : 'Route dinonaktifkan')
    this.emit()
  }

  addRoute(r: RouteRule) {
    this.state.routes = [r, ...this.state.routes]
    this.addAudit('create', `route/${r.alias}`, 'route', `Strategi ${r.strategy} · ${r.targets.length} target`)
    this.emit()
  }

  deleteRoute(id: string) {
    const r = this.state.routes.find((x) => x.id === id)
    this.state.routes = this.state.routes.filter((x) => x.id !== id)
    if (r) this.addAudit('delete', `route/${r.alias}`, 'route', 'Route dihapus')
    this.emit()
  }

  toggleCombo(id: string) {
    this.state.combos = this.state.combos.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    this.emit()
  }

  addCombo(c: Combo) {
    this.state.combos = [c, ...this.state.combos]
    this.addAudit('create', `combo/${c.name}`, 'combo', `Strategi ${c.strategy}`)
    this.emit()
  }

  deleteCombo(id: string) {
    this.state.combos = this.state.combos.filter((c) => c.id !== id)
    this.emit()
  }

  toggleModel(id: string) {
    this.state.models = this.state.models.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    this.emit()
  }

  addKey(k: ApiKey) {
    this.state.keys = [k, ...this.state.keys]
    this.addAudit('create', `key/${k.name}`, 'api-key', `Scope: ${k.scopes.join(', ')} · ${k.rateLimit} rpm`)
    this.emit()
  }

  revokeKey(id: string) {
    this.state.keys = this.state.keys.map((k) => (k.id === id ? { ...k, status: 'revoked' } : k))
    const k = this.state.keys.find((x) => x.id === id)
    if (k) this.addAudit('delete', `key/${k.name}`, 'api-key', 'Key dicabut')
    this.emit()
  }

  rotateKey(id: string) {
    const newPrefix = 'nxg_' + (this.state.keys.find((k) => k.id === id)?.env === 'production' ? 'live_' : 'test_') + Math.random().toString(36).slice(2, 6)
    this.state.keys = this.state.keys.map((k) => (k.id === id ? { ...k, prefix: newPrefix, lastUsed: Date.now() } : k))
    const k = this.state.keys.find((x) => x.id === id)
    if (k) this.addAudit('rotate', `key/${k.name}`, 'api-key', 'Rotasi manual')
    this.emit()
  }
}

export const gateway = new GatewayStore()
gateway.start()

export function useGateway(): GatewayState {
  return useSyncExternalStore(gateway.subscribe, gateway.getSnapshot)
}
