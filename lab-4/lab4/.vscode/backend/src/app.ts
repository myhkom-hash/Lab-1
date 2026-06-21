import express, { Request, Response } from 'express';
import cors from 'cors';
// @ts-ignore
import postsRoutes from './routes/posts.routes';
// @ts-ignore
import usersRoutes from './routes/users.routes';
// @ts-ignore
import logger from './middleware/logger';
// @ts-ignore
import { errorHandler } from './middleware/errorHandler';

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(logger);

// ROUTES
app.use('/api/posts', postsRoutes);
app.use('/api/users', usersRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: { message: "Маршрут не знайдено" } });
});

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Error handler
app.use(errorHandler);

export { app };