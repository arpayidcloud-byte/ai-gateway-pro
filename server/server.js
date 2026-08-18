const express = require('express');
const cors = require('cors');
const { gateway } = require('./lib/engine'); // we'll create this

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/gateway/state', (req, res) => {
  res.json(gateway.getSnapshot());
});

app.post('/api/gateway/toggle-provider', (req, res) => {
  const { id } = req.body;
  if (id) {
    const provider = gateway.state.providers.find(p => p.id === id);
    if (provider) provider.status = provider.status === 'ok' ? 'down' : 'ok';
    gateway.emit();
  }
  res.json({ ok: true });
});

app.post('/api/gateway/add-provider', (req, res) => {
  const newProvider = req.body;
  gateway.state.providers.push(newProvider);
  gateway.emit();
  res.json({ ok: true });
});

app.post('/api/gateway/delete-provider', (req, res) => {
  const { id } = req.body;
  gateway.state.providers = gateway.state.providers.filter(p => p.id !== id);
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
  const newKey = req.body;
  gateway.state.keys.push(newKey);
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

app.get('/api/gateway/logs', (req, res) => {
  res.json(gateway.state.logs);
});

app.get('/api/gateway/audit', (req, res) => {
  res.json(gateway.state.audit);
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Gateway Pro API running on http://localhost:${PORT}`);
  console.log(`📊 Real-time dashboard connected to frontend Vite`);
});
