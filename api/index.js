import appModule from '../backend/src/app.js';

const app = appModule.default || appModule;

export default function handler(req, res) {
  try {
    if (typeof app === 'function') {
      return app(req, res);
    }
    if (app && typeof app.default === 'function') {
      return app.default(req, res);
    }
    return res.status(500).json({ success: false, error: "App is not a callable function", type: typeof app });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message, stack: err.stack });
  }
}
