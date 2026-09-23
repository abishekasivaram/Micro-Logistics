import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const appModule = require('./backend.cjs');
const app = appModule.default || appModule;

export default function handler(req, res) {
  if (typeof app === 'function') {
    return app(req, res);
  }
  return app.default(req, res);
}
