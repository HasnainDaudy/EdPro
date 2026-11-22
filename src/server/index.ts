import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { getDatabase } from './db/database.js';
import { authRouter } from './routes/authRoutes.js';
import { courseRouter } from './routes/courseRoutes.js';
import { assessmentRouter } from './routes/assessmentRoutes.js';
import { tutorRouter } from './routes/tutorRoutes.js';
import { teacherRouter } from './routes/teacherRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5000'],
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());

// API health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    platform: 'EdPro'
  });
});

// Mount modular API routers
app.use('/api/auth', authRouter);
app.use('/api/courses', courseRouter);
app.use('/api/assessments', assessmentRouter);
app.use('/api/tutor', tutorRouter);
app.use('/api/teacher', teacherRouter);
app.use('/api/admin', adminRouter);

// Serve production static frontend if built
const clientDistPath = path.resolve(process.cwd(), 'dist/client');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    } else {
      next();
    }
  });
}

// Centralized error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: config.environment === 'production' ? 'An unexpected error occurred.' : err.message
    }
  });
});

export async function startServer(): Promise<void> {
  try {
    await getDatabase();
    app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(` EdPro Server is running on http://localhost:${config.port}`);
      console.log(` Environment: ${config.environment}`);
      console.log(` COPPA/FERPA Compliance Engine: ACTIVE`);
      console.log(` Socratic AI Tutor: READY`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start EdPro server:', err);
    process.exit(1);
  }
}

// Start automatically if run directly
if (process.argv[1] && (process.argv[1].endsWith('index.ts') || process.argv[1].endsWith('index.js'))) {
  startServer();
}
