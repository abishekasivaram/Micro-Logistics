import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import indexRoutesModule from '../backend/src/routes/index.js';
import { errorHandler } from '../backend/src/middleware/error.middleware.js';

const router = indexRoutesModule.default || indexRoutesModule;

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

app.use('/api/v1', router);
app.use('/v1', router);
app.use('/api', router);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});

app.use(errorHandler);

export default function handler(req, res) {
  return app(req, res);
}
