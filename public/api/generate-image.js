// api/generate-image.js — Vercel Node.js Function

export default async function handler(req, res) {
  const origin = req.headers.origin || '';

  const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const corsHeaders = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };

  if (req.method === 'OPTIONS') {
    return res.status(204).set(corsHeaders).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).set(corsHeaders).json({ error: 'Method not allowed' });
  }

  if (ALLOWED_ORIGINS.length > 0 && origin && !ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).set(corsHeaders).json({ error: 'Forbidden: Invalid origin' });
  }

  const API_KEY = process.env.XAH_API_KEY;
  if (!API_KEY) {
    return res.status(500).set(corsHeaders).json({ error: 'Server configuration error' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const upstream = await fetch('https://api.xah.io/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    const status = upstream.status;

    res.setHeader('Content-Type', 'application/json');
    for (const [k, v] of Object.entries(corsHeaders)) res.setHeader(k, v);
    return res.status(status).send(text);
  } catch (error) {
    console.error('[api/generate-image] Error:', error);
    return res.status(500).set(corsHeaders).json({
      error: 'Internal server error',
      detail: error.message,
    });
  }
}