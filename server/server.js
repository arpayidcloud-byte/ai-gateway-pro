const express = require('express');
const cors = require('cors');
const { GatewayStore } = require('./lib/engine');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const gateway = new GatewayStore();

app.get('/api/gateway/state', (req, res) => res.json(gateway.getSnapshot()));
app.post('/api/gateway/toggle-provider', (req, res) => {
  const { id } = req.body;
  const provider = gateway.state.providers.find(p => p.id === id);
  if (provider) provider.status = provider.status === 'ok' ? 'down' : 'ok';
  gateway.emit();
  res.json({ ok: true });
});
app.post('/api/gateway/add-provider', (req, res) => {
  gateway.state.providers.push(req.body);
  gateway.emit();
  res.json({ ok: true });
});
app.post('/api/gateway/delete-provider', (req, res) => {
  gateway.state.providers = gateway.state.providers.filter(p => p.id !== req.body.id);
  gateway.emit();
  res.json({ ok: true });
});
app.post('/api/gateway/update-route', (req, res) => {
  const { id, ...patch } = req.body;
  const route = gateway.state.routes.find(r => r.id === id);
  if (route) Object.assign(route, patch);
  gateway.emit();
  res.json({ ok: true });
});
app.post('/api/gateway/add-key', (req, res) => {
  gateway.state.keys.push(req.body);
  gateway.emit();
  res.json({ ok: true });
});
app.post('/api/gateway/revoke-key', (req, res) => {
  const { id } = req.body;
  const key = gateway.state.keys.find(k => k.id === id);
  if (key) key.status = 'revoked';
  gateway.emit();
  res.json({ ok: true });
});
app.get('/api/gateway/logs', (req, res) => res.json(gateway.state.logs));
app.get('/api/gateway/audit', (req, res) => res.json(gateway.state.audit));
app.get('/api/gateway/proxies/search', (req, res) => {
  const { country, scheme } = req.query;
  const proxies = [
    { id: 'p1', country: 'Indonesia', scheme: 'http', host: 'proxy1.nexus.id', port: 8080, usable: true, latency: 142 },
    { id: 'p2', country: 'Indonesia', scheme: 'socks5', host: 'proxy2.nexus.id', port: 1080, usable: true, latency: 89 },
    { id: 'p3', country: 'Singapore', scheme: 'http', host: 'sg-proxy1.nexus.id', port: 8080, usable: true, latency: 67 },
    { id: 'p4', country: 'Singapore', scheme: 'socks5', host: 'sg-proxy2.nexus.id', port: 1080, usable: false, latency: 0 },
    { id: 'p5', country: 'Malaysia', scheme: 'http', host: 'my-proxy1.nexus.id', port: 8080, usable: true, latency: 112 },
  ];
  const filtered = proxies.filter(p => (!country || p.country.toLowerCase() === country.toLowerCase()) && (!scheme || p.scheme === scheme));
  res.json(filtered.map(p => ({ ...p, id: p.id, usable: p.usable })));
});
app.post('/api/gateway/proxies/import', (req, res) => {
  const { proxies } = req.body;
  if (!proxies || !proxies.length) return res.status(400).json({ ok: false });
  proxies.forEach(p => {
    if (p.usable) {
      gateway.state.providers.push({
        id: 'imported-' + Date.now(),
        name: `Imported ${p.country} ${p.scheme}`,
        preset: 'compatible',
        baseUrl: `http://${p.host}:${p.port}`,
        region: p.country,
        status: 'ok',
        latency: p.latency,
        uptime: 99.9,
        models: 12,
        keyMasked: '••••••••',
        createdAt: Date.now(),
        spark: [p.latency, p.latency * 0.9],
        healthTicks: ['ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok'],
        requests24h: 1240,
        cost24h: 18.4
      });
    }
  });
  gateway.emit();
  res.json({ ok: true, imported: proxies.length });
});
app.post('/api/gateway/delete-guard', (req, res) => {
  const { type, id } = req.body;
  res.json({ ok: true, message: `${type} ${id} deleted`, reason: '409 conflict' });
});
app.listen(port, () => console.log(`AI Gateway Pro API running on http://localhost:${port}`));
