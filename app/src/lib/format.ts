export function fmtNum(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 10_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
  if (n >= 1_000) return (n / 1_000).toFixed(2).replace(/0$/, '').replace(/\.$/, '') + 'K'
  return String(Math.round(n))
}

export function fmtFull(n: number): string {
  return n.toLocaleString('en-US')
}

export function fmtCost(n: number): string {
  if (n === 0) return '$0.00'
  if (n < 0.01) return '$' + n.toFixed(4)
  if (n < 1) return '$' + n.toFixed(3)
  return '$' + n.toFixed(2)
}

export function fmtMs(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(2) + 's'
  return Math.round(n) + 'ms'
}

export function fmtPct(n: number, digits = 1): string {
  return n.toFixed(digits) + '%'
}

export function fmtTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function fmtDateTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function fmtAgo(ts: number, lang: 'id' | 'en' = 'en'): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000))
  const u: [number, string, string][] = [
    [86400 * 30, 'mo', 'bln'],
    [86400, 'd', 'h'],
    [3600, 'h', 'j'],
    [60, 'm', 'm'],
  ]
  for (const [sec, en, id] of u) {
    if (s >= sec) {
      const v = Math.floor(s / sec)
      return lang === 'id' ? `${v}${id} lalu` : `${v}${en} ago`
    }
  }
  return lang === 'id' ? `${s}dtk lalu` : `${s}s ago`
}

export function fmtCtx(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + 'M'
  return Math.round(n / 1000) + 'K'
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function maskKey(prefix: string): string {
  return prefix + '…' + Math.random().toString(36).slice(2, 6)
}
