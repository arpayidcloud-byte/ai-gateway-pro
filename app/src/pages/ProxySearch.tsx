import React, { useState } from 'react';
import { useGateway } from '../lib/engine';

export default function ProxySearch() {
  const gateway = useGateway();
  const [country, setCountry] = useState('');
  const [scheme, setScheme] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/gateway/proxies/search?country=${country}&scheme=${scheme}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleImport = async (proxy) => {
    try {
      const res = await fetch('/api/gateway/proxies/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proxies: [proxy] })
      });
      const data = await res.json();
      if (data.ok) {
        // Trigger refresh
        gateway.refresh();
        // Show toast
        window.dispatchEvent(new CustomEvent('toast', { detail: { title: 'Success', desc: `Proxy ${proxy.country} imported` } }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6">
          <label className="block text-sm font-medium mb-1">Country</label>
          <input
            type="text"
            value={country}
            onChange={e => setCountry(e.target.value)}
            placeholder="Indonesia, Singapore, Malaysia..."
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-violet-500"
          />
        </div>
        <div className="col-span-12 md:col-span-4">
          <label className="block text-sm font-medium mb-1">Scheme</label>
          <select value={scheme} onChange={e => setScheme(e.target.value)} className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:border-violet-500">
            <option value="">All</option>
            <option value="http">HTTP</option>
            <option value="socks5">SOCKS5</option>
          </select>
        </div>
        <div className="col-span-12 md:col-span-2 flex items-end">
          <button onClick={handleSearch} disabled={loading} className="w-full py-3 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 transition">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left p-4 font-medium">Country</th>
              <th className="text-left p-4 font-medium">Scheme</th>
              <th className="text-left p-4 font-medium">Host</th>
              <th className="text-left p-4 font-medium">Latency</th>
              <th className="text-left p-4 font-medium">Usable</th>
              <th className="w-24"></th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((proxy, i) => (
              <tr key={i} className="border-b border-zinc-800 last:border-0 hover:bg-zinc-950/50">
                <td className="p-4">{proxy.country}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 text-xs rounded-full ${proxy.scheme === 'http' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                    {proxy.scheme}
                  </span>
                </td>
                <td className="p-4 text-zinc-400">{proxy.host}</td>
                <td className="p-4">{proxy.latency}ms</td>
                <td className="p-4">
                  <span className={`px-3 py-1 text-xs rounded-full ${proxy.usable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {proxy.usable ? '✅ Usable' : '❌ Not Usable'}
                  </span>
                </td>
                <td className="p-4">
                  {proxy.usable && (
                    <button onClick={() => handleImport(proxy)} className="text-violet-400 hover:text-violet-300 text-sm font-medium">
                      Import
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
