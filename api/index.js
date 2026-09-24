import backendAppModule from '../backend/src/app.js';

// Resolve CommonJS or ES default export
const app = backendAppModule.default || backendAppModule;

export default app;
