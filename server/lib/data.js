module.exports.seedProviders = function() {
  const now = Date.now();
  const HOUR = 3600_000;
  const DAY = 24 * HOUR;
  return [
    { id: 'prov-openai', name: 'Production OpenAI', preset: 'openai', baseUrl: 'https://api.openai.com/v1', region: 'iad1', status: 'ok', latency: 184, uptime: 99.98, models: 6, keyMasked: 'sk-proj-••••9f2a', createdAt: now - 210 * DAY, spark: [180, 182, 185, 178, 192, 179, 181, 177, 190, 183, 179, 184, 176, 188, 181, 182, 177, 189, 183, 178], healthTicks: ['ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok'], requests24h: 48210, cost24h: 96.42 },
    { id: 'prov-anthropic', name: 'Anthropic EU', preset: 'anthropic', baseUrl: 'https://api.anthropic.com/v1', region: 'fra1', status: 'ok', latency: 231, uptime: 99.95, models: 4, keyMasked: 'sk-ant-••••c41d', createdAt: now - 160 * DAY, spark: [231,229,230,232,228,231,229,230,231,228,230,229,231,228,230,231,229,230,231,228,230,229,231,228], healthTicks: ['ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok'], requests24h: 31540, cost24h: 118.77 },
    { id: 'prov-gemini', name: 'Google Gemini', preset: 'gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1', region: 'sin1', status: 'ok', latency: 168, uptime: 99.99, models: 5, keyMasked: 'AIza••••7xQw', createdAt: now - 140 * DAY, spark: [168,167,169,166,168,167,169,166,168,167,169,166,168,167,169,166,168,167,169,166,168,167,169,166], healthTicks: ['ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok'], requests24h: 27890, cost24h: 21.36 },
    { id: 'prov-groq', name: 'Groq Speed', preset: 'groq', baseUrl: 'https://api.groq.com/openai/v1', region: 'sfo1', status: 'ok', latency: 96, uptime: 99.91, models: 4, keyMasked: 'gsk_••••m2Vz', createdAt: now - 90 * DAY, spark: [96,97,95,98,96,97,95,98,96,97,95,98,96,97,95,98,96,97,95,98,96,97,95,98], healthTicks: ['ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok'], requests24h: 19340, cost24h: 6.88 },
    { id: 'prov-deepseek', name: 'DeepSeek Direct', preset: 'deepseek', baseUrl: 'https://api.deepseek.com/v1', region: 'hkg1', status: 'degraded', latency: 412, uptime: 99.62, models: 2, keyMasked: 'sk-••••8aBc', createdAt: now - 60 * DAY, spark: [412,410,408,415,410,412,410,408,415,410,412,410,408,415,410,412,410,408,415,410,412,410,408,415], healthTicks: ['ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok'], requests24h: 12780, cost24h: 3.42 },
    { id: 'prov-bedrock', name: 'AWS Bedrock', preset: 'bedrock', baseUrl: 'https://bedrock-runtime.us-east-1.amazonaws.com', region: 'iad1', status: 'ok', latency: 265, uptime: 99.97, models: 3, keyMasked: 'AKIA••••QF22', createdAt: now - 120 * DAY, spark: [265,267,264,268,265,267,264,268,265,267,264,268,265,267,264,268,265,267,264,268,265,267,264,268], healthTicks: ['ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok'], requests24h: 9210, cost24h: 34.19 },
    { id: 'prov-mistral', name: 'Mistral EU', preset: 'mistral', baseUrl: 'https://api.mistral.ai/v1', region: 'fra1', status: 'ok', latency: 205, uptime: 99.94, models: 3, keyMasked: '••••kL91', createdAt: now - 75 * DAY, spark: [205,203,206,204,205,203,206,204,205,203,206,204,205,203,206,204,205,203,206,204,205,203,206,204], healthTicks: ['ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok','ok'], requests24h: 6480, cost24h: 9.64 },
    { id: 'prov-ollama', name: 'Ollama Edge (jkt1)', preset: 'ollama', baseUrl: 'http://10.8.0.4:11434/v1', region: 'jkt1', status: 'down', latency: 0, uptime: 97.2, models: 2, keyMasked: 'no secret', createdAt: now - 30 * DAY, spark: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], healthTicks: ['bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad','bad'], requests24h: 0, cost24h: 0 },
  ];
};

module.exports.seedModels = function() {
  const now = Date.now();
  const rows = [
    ['gpt-4o', 'prov-openai', 'Production OpenAI', 128000, 2.5, 10, ['vision','tools','json','streaming'], true, 412, 18240],
    ['gpt-4o-mini', 'prov-openai', 'Production OpenAI', 128000, 0.15, 0.6, ['vision','tools','json','streaming'], true, 236, 22810],
    ['o3', 'prov-openai', 'Production OpenAI', 200000, 2, 8, ['reasoning','tools','json'], true, 2140, 1240],
    ['gpt-4.1', 'prov-openai', 'Production OpenAI', 1047576, 2, 8, ['vision','tools','json','streaming'], true, 486, 3120],
    ['text-embedding-3-large', 'prov-openai', 'Production OpenAI', 8191, 0.13, 0, ['embeddings'], true, 82, 2680],
    ['gpt-4o-transcribe', 'prov-openai', 'Production OpenAI', 16000, 2.5, 10, ['audio'], false, 640, 0],
    ['claude-sonnet-4', 'prov-anthropic', 'Anthropic EU', 200000, 3, 15, ['vision','tools','json','streaming','reasoning'], true, 528, 12840],
    ['claude-haiku-3.5', 'prov-anthropic', 'Anthropic EU', 200000, 0.8, 4, ['vision','tools','streaming'], true, 296, 14220],
    ['claude-opus-4.1', 'prov-anthropic', 'Anthropic EU', 200000, 15, 75, ['vision','tools','json','reasoning'], true, 940, 1480],
    ['claude-sonnet-3.7', 'prov-anthropic', 'Anthropic EU', 200000, 3, 15, ['vision','tools','reasoning'], false, 610, 0],
    ['gemini-2.5-pro', 'prov-gemini', 'Google Gemini', 1048576, 1.25, 10, ['vision','tools','json','reasoning','audio'], true, 618, 9420],
    ['gemini-2.5-flash', 'prov-gemini', 'Google Gemini', 1048576, 0.3, 2.5, ['vision','tools','json','streaming'], true, 288, 16480],
    ['gemini-embedding-001', 'prov-gemini', 'Google Gemini', 2048, 0.15, 0, ['embeddings'], true, 74, 1990],
    ['llama-3.3-70b-versatile', 'prov-groq', 'Groq Speed', 128000, 0.59, 0.79, ['tools','json','streaming'], true, 118, 11840],
    ['llama-3.1-8b-instant', 'prov-groq', 'Groq Speed', 128000, 0.05, 0.08, ['tools','streaming'], true, 64, 6920],
    ['deepseek-chat', 'prov-deepseek', 'DeepSeek Direct', 64000, 0.27, 1.1, ['tools','json','streaming'], true, 486, 8420],
    ['deepseek-reasoner', 'prov-deepseek', 'DeepSeek Direct', 64000, 0.55, 2.19, ['reasoning','json'], true, 1820, 4360],
    ['mistral-large-2', 'prov-mistral', 'Mistral EU', 128000, 2, 6, ['tools','json','streaming'], true, 448, 3240],
    ['codestral-25.01', 'prov-mistral', 'Mistral EU', 256000, 0.3, 0.9, ['code','streaming'], true, 388, 2480],
    ['amazon-nova-pro', 'prov-bedrock', 'AWS Bedrock', 300000, 0.8, 3.2, ['vision','tools'], true, 522, 4480],
    ['llama-3.3-70b-bedrock', 'prov-bedrock', 'AWS Bedrock', 128000, 0.72, 0.72, ['tools','json'], true, 368, 3260],
    ['qwen2.5-32b-local', 'prov-ollama', 'Ollama Edge (jkt1)', 32768, 0, 0, ['tools','json'], false, 0, 0],
  ];
  return rows.map(([name, provider, providerName, context, inputPrice, outputPrice, capabilities, enabled, latency, requests24h]) => ({
    id: Math.random().toString(36).substr(2,9),
    name, provider, providerName, context, inputPrice, outputPrice, capabilities, enabled, latency, requests24h,
  }));
};

module.exports.seedRoutes = function() {
  const now = Date.now();
  const HOUR = 3600_000;
  const DAY = 24 * HOUR;
  return [
    { id: 'r1', alias: 'smart-chat', description: 'Flagship chat dengan failover lintas provider', strategy: 'weighted', targets: [{ providerId: 'prov-openai', model: 'gpt-4o', weight: 45 }, { providerId: 'prov-anthropic', model: 'claude-sonnet-4', weight: 35 }, { providerId: 'prov-gemini', model: 'gemini-2.5-pro', weight: 20 }], fallbacks: [{ providerId: 'prov-groq', model: 'llama-3.3-70b-versatile', weight: 100 }], enabled: true, requests24h: 26840, successRate: 99.4, avgLatency: 462, cost24h: 84.2, createdAt: now - 180 * DAY },
    { id: 'r2', alias: 'fast-chat', description: 'Respons cepat biaya rendah untuk UI interaktif', strategy: 'least-latency', targets: [{ providerId: 'prov-groq', model: 'llama-3.1-8b-instant', weight: 50 }, { providerId: 'prov-openai', model: 'gpt-4o-mini', weight: 30 }, { providerId: 'prov-gemini', model: 'gemini-2.5-flash', weight: 20 }], fallbacks: [{ providerId: 'prov-anthropic', model: 'claude-haiku-3.5', weight: 100 }], enabled: true, requests24h: 31220, successRate: 99.8, avgLatency: 148, cost24h: 9.6, createdAt: now - 150 * DAY },
    { id: 'r3', alias: 'reasoning-pro', description: 'Chain-of-thought berat: coding & analisis', strategy: 'failover', targets: [{ providerId: 'prov-openai', model: 'o3', weight: 100 }], fallbacks: [{ providerId: 'prov-deepseek', model: 'deepseek-reasoner', weight: 70 }, { providerId: 'prov-anthropic', model: 'claude-opus-4.1', weight: 30 }], enabled: true, requests24h: 4180, successRate: 98.9, avgLatency: 1980, cost24h: 38.4, createdAt: now - 90 * DAY },
    { id: 'r4', alias: 'embeddings', description: 'Embedding terpadu untuk pipeline RAG', strategy: 'weighted', targets: [{ providerId: 'prov-openai', model: 'text-embedding-3-large', weight: 60 }, { providerId: 'prov-gemini', model: 'gemini-embedding-001', weight: 40 }], fallbacks: [], enabled: true, requests24h: 14460, successRate: 99.9, avgLatency: 78, cost24h: 1.8, createdAt: now - 200 * DAY },
    { id: 'r5', alias: 'code-assist', description: 'Autocompletion & code review', strategy: 'weighted', targets: [{ providerId: 'prov-mistral', model: 'codestral-25.01', weight: 50 }, { providerId: 'prov-deepseek', model: 'deepseek-chat', weight: 50 }], fallbacks: [{ providerId: 'prov-openai', model: 'gpt-4.1', weight: 100 }], enabled: true, requests24h: 8620, successRate: 99.2, avgLatency: 402, cost24h: 7.4, createdAt: now - 45 * DAY },
    { id: 'r6', alias: 'vision-analysis', description: 'OCR & pemahaman dokumen visual', strategy: 'cost', targets: [{ providerId: 'prov-gemini', model: 'gemini-2.5-flash', weight: 70 }, { providerId: 'prov-openai', model: 'gpt-4o', weight: 30 }], fallbacks: [{ providerId: 'prov-bedrock', model: 'amazon-nova-pro', weight: 100 }], enabled: true, requests24h: 5240, successRate: 99.6, avgLatency: 610, cost24h: 12.9, createdAt: now - 70 * DAY },
    { id: 'r7', alias: 'legacy-gpt35', description: 'Deprecated — migrasi ke fast-chat', strategy: 'failover', targets: [{ providerId: 'prov-openai', model: 'gpt-4o-mini', weight: 100 }], fallbacks: [], enabled: false, requests24h: 0, successRate: 0, avgLatency: 0, cost24h: 0, createdAt: now - 400 * DAY },
  ];
};

module.exports.seedCombos = function() {
  const now = Date.now();
  const HOUR = 3600_000;
  return [
    { id: 'c1', name: 'production-chat', strategy: 'least-latency', members: [{ routeAlias: 'smart-chat', weight: 60 }, { routeAlias: 'fast-chat', weight: 40 }], enabled: true, requests24h: 42840, avgLatency: 288 },
    { id: 'c2', name: 'rag-pipeline', strategy: 'weighted', members: [{ routeAlias: 'embeddings', weight: 50 }, { routeAlias: 'smart-chat', weight: 35 }, { routeAlias: 'vision-analysis', weight: 15 }], enabled: true, requests24h: 18220, avgLatency: 214 },
    { id: 'c3', name: 'dev-tools', strategy: 'round-robin', members: [{ routeAlias: 'code-assist', weight: 70 }, { routeAlias: 'reasoning-pro', weight: 30 }], enabled: true, requests24h: 9840, avgLatency: 720 },
    { id: 'c4', name: 'cost-saver', strategy: 'cost', members: [{ routeAlias: 'fast-chat', weight: 80 }, { routeAlias: 'embeddings', weight: 20 }], enabled: false, requests24h: 0, avgLatency: 0 },
  ];
};

module.exports.seedKeys = function() {
  const now = Date.now();
  return [
    { id: 'k1', name: 'web-app-prod', prefix: 'nxg_live_9F2k', scopes: ['chat','embeddings'], rateLimit: 1200, requests: 1284420, lastUsed: now - 12000, createdAt: now - 190 * DAY, status: 'active', env: 'production' },
    { id: 'k2', name: 'mobile-ios', prefix: 'nxg_live_X7mQ', scopes: ['chat'], rateLimit: 600, requests: 842150, lastUsed: now - 44000, createdAt: now - 160 * DAY, status: 'active', env: 'production' },
    { id: 'k3', name: 'rag-indexer', prefix: 'nxg_live_P4dR', scopes: ['embeddings'], rateLimit: 2000, requests: 412840, lastUsed: now - 3600000, createdAt: now - 120 * DAY, status: 'active', env: 'production' },
    { id: 'k4', name: 'staging-tests', prefix: 'nxg_test_L9wE', scopes: ['chat','embeddings','admin'], rateLimit: 300, requests: 48210, lastUsed: now - 7200000, createdAt: now - 80 * DAY, status: 'active', env: 'development' },
    { id: 'k5', name: 'partner-acme', prefix: 'nxg_live_T2nB', scopes: ['chat'], rateLimit: 240, requests: 196420, lastUsed: now - 96000, createdAt: now - 60 * DAY, status: 'active', env: 'production' },
    { id: 'k6', name: 'old-dashboard', prefix: 'nxg_test_Z5xC', scopes: ['chat'], rateLimit: 60, requests: 8240, lastUsed: now - 300*DAY, createdAt: now - 300 * DAY, status: 'revoked', env: 'development' },
  ];
};

module.exports.seedAudit = function() {
  const now = Date.now();
  const HOUR = 3600_000;
  const DAY = 24 * HOUR;
  const actors = ['raka@nexus.dev', 'sinta@nexus.dev', 'ci-bot', 'bagus@nexus.dev'];
  const events = [
    [2 * HOUR, actors[0], 'update', 'route/smart-chat', 'route', 'Weight gpt-4o 40→45'],
    [5 * HOUR, actors[1], 'create', 'key/partner-acme', 'api-key', 'Scope: chat · 240 rpm'],
    [9 * HOUR, actors[2], 'deploy', 'gateway v2.14.3', 'deploy', 'Rolling restart 3 node'],
    [14 * HOUR, actors[0], 'test', 'provider/deepseek', 'provider', 'Tes koneksi · 412ms'],
    [26 * HOUR, actors[3], 'rotate', 'key/web-app-prod', 'api-key', 'Rotasi terjadwal 90 hari'],
    [30 * HOUR, actors[1], 'update', 'settings/ratelimit', 'settings', 'Global RPM 8K→10K'],
    [2 * DAY, actors[0], 'create', 'route/code-assist', 'route', 'Strategi weighted 2 target'],
    [3 * DAY, actors[2], 'deploy', 'gateway v2.14.2', 'deploy', 'Patch semantic cache'],
    [4 * DAY, actors[3], 'delete', 'provider/azure-staging', 'provider', 'Provider tidak terpakai'],
    [5 * DAY, actors[1], 'login', 'console', 'session', 'SSO via GitHub'],
    [6 * DAY, actors[0], 'update', 'combo/rag-pipeline', 'combo', 'Tambah vision-analysis 15%'],
    [8 * DAY, actors[2], 'deploy', 'gateway v2.14.1', 'deploy', 'Hotfix retry budget'],
  ];
  return events.map(([ago, actor, action, target, targetType, detail]) => ({
    id: Math.random().toString(36).substr(2,9),
    ts: now - ago,
    actor,
    action,
    target,
    targetType,
    ip: `103.147.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    detail,
  }));
};
