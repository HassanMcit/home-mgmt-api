import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';
import budgetRoutes from './routes/budgets';
import savingRoutes from './routes/savings';
import billRoutes from './routes/bills';
import adminRoutes from './routes/admin';
import aiRoutes from './routes/ai';
import { initMonthlyReportCron } from './services/reportService';

process.env.TZ = 'UTC';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Global request logger for debugging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/savings', savingRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'HA Home Management API is running' });
});
// Initialize Cron Jobs
initMonthlyReportCron();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Global Error]:', err);
  res.status(err.status || 500).json({
    message: err.message || 'حدث خطأ داخلي في الخادم',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

export default app;
