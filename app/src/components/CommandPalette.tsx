import { useEffect } from 'react'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router'
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from 'lucide-react'
import { NAV } from './layout'
import { useI18n } from '@/lib/i18n'
import { gateway } from '@/lib/engine'
import { toast } from 'sonner'

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n()
  const nav = useNavigate()

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null

  const go = (path: string) => { nav(path); onClose() }
  const action = (fn: () => void, msg: string) => { fn(); toast.success(msg); onClose() }

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[14vh] px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[3px] fade-in" onClick={onClose} />
      <Command
        className="relative w-full max-w-lg rounded-xl border border-white/10 shadow-2xl shadow-black/70 scale-in overflow-hidden"
        style={{ background: '#0e0e11' }}
      >
        <div className="flex items-center gap-2.5 px-4 h-12 border-b border-white/[0.07]">
          <Search size={15} className="text-zinc-500" />
          <Command.Input
            autoFocus
            placeholder={t('nav.search')}
            className="flex-1 bg-transparent outline-none text-[14px] t-1 placeholder:text-zinc-600"
          />
          <button onClick={onClose} className="text-[10px] mono t-3 border border-white/10 rounded px-1.5 py-0.5">ESC</button>
        </div>
        <Command.List className="max-h-[340px] overflow-y-auto no-scrollbar p-2">
          <Command.Empty className="py-8 text-center text-[13px] t-3">{t('c.noResults')}</Command.Empty>
          <Command.Group heading={<span className="px-2 text-[10px] font-semibold tracking-[0.12em] t-3 uppercase">{t('c.pages')}</span>}>
            {NAV.flatMap((g) => g.items).map((it) => (
              <Command.Item
                key={it.path}
                value={`${t(it.key as never)} ${it.path}`}
                onSelect={() => go(it.path)}
                className="flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-[13px] t-2 cursor-pointer data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-white transition-colors"
              >
                <span className="text-zinc-500">{it.icon}</span>
                {t(it.key as never)}
                <span className="ml-auto mono text-[10px] t-3">{it.path}</span>
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading={<span className="px-2 text-[10px] font-semibold tracking-[0.12em] t-3 uppercase mt-1 block">{t('c.actions')}</span>}>
            <Command.Item
              value="toggle live pause stream"
              onSelect={() => { gateway.setLive(false); onClose() }}
              className="flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-[13px] t-2 cursor-pointer data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-white transition-colors"
            >
              ⏸ Pause live stream
            </Command.Item>
            <Command.Item
              value="resume live stream"
              onSelect={() => { gateway.setLive(true); onClose() }}
              className="flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-[13px] t-2 cursor-pointer data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-white transition-colors"
            >
              ▶ Resume live stream
            </Command.Item>
            <Command.Item
              value="export requests csv"
              onSelect={() => action(() => {}, 'Export dijadwalkan — CSV akan terunduh')}
              className="flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-[13px] t-2 cursor-pointer data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-white transition-colors"
            >
              ⬇ Export requests CSV
            </Command.Item>
            <Command.Item
              value="create new api key"
              onSelect={() => go('/keys?new=1')}
              className="flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-[13px] t-2 cursor-pointer data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-white transition-colors"
            >
              ＋ Create API key
            </Command.Item>
            <Command.Item
              value="add new provider"
              onSelect={() => go('/providers?new=1')}
              className="flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-[13px] t-2 cursor-pointer data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-white transition-colors"
            >
              ＋ Add provider
            </Command.Item>
            <Command.Item
              value="create new route"
              onSelect={() => go('/routes?new=1')}
              className="flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-[13px] t-2 cursor-pointer data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-white transition-colors"
            >
              ＋ Create route
            </Command.Item>
          </Command.Group>
        </Command.List>
        <div className="flex items-center gap-4 px-4 h-9 border-t border-white/[0.07] text-[10.5px] t-3">
          <span className="flex items-center gap-1"><ArrowUp size={10} /><ArrowDown size={10} /> navigate</span>
          <span className="flex items-center gap-1"><CornerDownLeft size={10} /> select</span>
          <span className="flex items-center gap-1">ESC close</span>
        </div>
      </Command>
    </div>
  )
}
