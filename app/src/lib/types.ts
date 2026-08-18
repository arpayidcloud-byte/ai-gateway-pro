export type HealthStatus = 'ok' | 'degraded' | 'down'
export type ReqStatus = 'success' | 'fallback' | 'error' | 'rate_limited'
export type Strategy = 'weighted' | 'least-latency' | 'failover' | 'cost' | 'round-robin'
export type Lang = 'id' | 'en'

export interface ProviderPreset {
  id: string
  name: string
  baseUrl: string
  color: string
  docs: string
}

export interface Provider {
  id: string
  name: string
  preset: string
  baseUrl: string
  region: string
  status: HealthStatus
  latency: number
  uptime: number
  models: number
  keyMasked: string
  createdAt: number
  spark: number[]
  healthTicks: ('ok' | 'warn' | 'bad')[]
  requests24h: number
  cost24h: number
}

export interface ModelInfo {
  id: string
  name: string
  provider: string
  providerName: string
  context: number
  inputPrice: number
  outputPrice: number
  capabilities: string[]
  enabled: boolean
  latency: number
  requests24h: number
}

export interface RouteTarget {
  providerId: string
  model: string
  weight: number
}

export interface RouteRule {
  id: string
  alias: string
  description: string
  strategy: Strategy
  targets: RouteTarget[]
  fallbacks: RouteTarget[]
  enabled: boolean
  requests24h: number
  successRate: number
  avgLatency: number
  cost24h: number
  createdAt: number
}

export interface Combo {
  id: string
  name: string
  strategy: Strategy
  members: { routeAlias: string; weight: number }[]
  enabled: boolean
  requests24h: number
  avgLatency: number
}

export interface ApiKey {
  id: string
  name: string
  prefix: string
  fullKey?: string
  scopes: string[]
  rateLimit: number
  requests: number
  lastUsed: number
  createdAt: number
  status: 'active' | 'revoked'
  env: 'production' | 'development'
}

export interface RequestLog {
  id: string
  ts: number
  routeAlias: string
  model: string
  providerName: string
  keyPrefix: string
  status: ReqStatus
  latency: number
  ttft: number
  tokensIn: number
  tokensOut: number
  cost: number
  region: string
  retries: number
  cache: boolean
  error?: string
  userAgent: string
}

export interface AuditEvent {
  id: string
  ts: number
  actor: string
  action: 'create' | 'update' | 'delete' | 'test' | 'rotate' | 'deploy' | 'login'
  target: string
  targetType: string
  ip: string
  detail: string
}

export interface TimePoint {
  t: number
  success: number
  fallback: number
  error: number
  tokensIn: number
  tokensOut: number
  cost: number
  p50: number
  p95: number
  p99: number
}

export interface GatewayState {
  providers: Provider[]
  models: ModelInfo[]
  routes: RouteRule[]
  combos: Combo[]
  keys: ApiKey[]
  logs: RequestLog[]
  audit: AuditEvent[]
  series: Record<'1h' | '24h' | '7d' | '30d', TimePoint[]>
  live: boolean
  totalRequests: number
  gatewayLatency: number
  region: string
}

export interface Toast {
  id: number
  title: string
  desc?: string
  kind: 'success' | 'error' | 'info'
}
