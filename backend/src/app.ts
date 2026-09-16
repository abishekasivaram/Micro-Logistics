import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import apiRoutes from './routes/index';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL
}));
app.use(express.json());

app.use('/api/v1', apiRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use(errorHandler);

export default app;
