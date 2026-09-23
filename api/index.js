import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let app;
try {
  const appModule = require('../backend/src/app.js');
  app = appModule.default || appModule;
} catch (err) {
  console.error("Vercel App Require Error:", err);
}

export default function handler(req, res) {
  if (!app) {
    return res.status(500).json({ success: false, error: "Failed to load backend app with createRequire" });
  }
  return app(req, res);
}
