const TEST_LOGIN_MAP = {
  'admin': 'admin@example.com',
  'c1': 'priya_auth@example.com',
  'priyarajan': 'priya_auth@example.com',
  'c2': 'c2@example.com',
  'c3': 'c3@example.com',
  'c4': 'c4@example.com',
  'v1': 'contact_auth@nammachennai.com',
  'v2': 'v2@example.com',
  'v3': 'v3@example.com',
  'v4': 'v4@example.com',
  'da1': 'agent1_auth@example.com',
  'da2': 'da2@example.com',
  'da3': 'da3@example.com',
  'da4': 'da4@example.com'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { identifier } = req.body || {};
  if (!identifier) {
    return res.status(400).json({ success: false, message: 'Identifier required' });
  }

  const searchId = identifier.trim().toLowerCase();
  if (TEST_LOGIN_MAP[searchId]) {
    return res.status(200).json({ success: true, email: TEST_LOGIN_MAP[searchId] });
  }

  // Forward to Render backend for dynamic DB resolution
  try {
    const fetchRes = await fetch('https://micro-logistics.onrender.com/api/v1/auth/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier })
    });
    const data = await fetchRes.json();
    return res.status(fetchRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
