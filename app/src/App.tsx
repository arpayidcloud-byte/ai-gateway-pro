import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import { Toaster } from 'sonner'
import { I18nProvider } from '@/lib/i18n'
import { Sidebar, Topbar } from '@/components/layout'
import { CommandPalette } from '@/components/CommandPalette'
import Overview from '@/pages/Overview'
import Requests from '@/pages/Requests'
import RoutesPage from '@/pages/Routes'
import Providers from '@/pages/Providers'
import Models from '@/pages/Models'
import Combos from '@/pages/Combos'
import Playground from '@/pages/Playground'
import ApiKeys from '@/pages/ApiKeys'
import Usage from '@/pages/Usage'
import Audit from '@/pages/Audit'
import Settings from '@/pages/Settings'

function Shell() {
  const [palette, setPalette] = useState(false)
  const loc = useLocation()

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((p) => !p)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  useEffect(() => {
    const el = document.getElementById('main-scroll')
    if (el) el.scrollTo({ top: 0 })
  }, [loc.pathname])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#050505' }}>
      <Sidebar onOpenPalette={() => setPalette(true)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenPalette={() => setPalette(true)} />
        <main id="main-scroll" className="flex-1 overflow-y-auto relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-72 grid-bg" />
          <div className="relative px-6 lg:px-8 py-6 max-w-[1440px] mx-auto">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/providers" element={<Providers />} />
              <Route path="/models" element={<Models />} />
              <Route path="/combos" element={<Combos />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/keys" element={<ApiKeys />} />
              <Route path="/usage" element={<Usage />} />
              <Route path="/audit" element={<Audit />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Overview />} />
            </Routes>
          </div>
        </main>
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#131316',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#ededed',
            fontSize: 13,
          },
        }}
      />
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <Shell />
    </I18nProvider>
  )
}
