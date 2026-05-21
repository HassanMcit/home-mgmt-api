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
import reminderRoutes from './routes/reminders';
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
app.use('/api/reminders', reminderRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'HA Home Management API is running' });
});

// Manual trigger endpoints (secured with CRON_SECRET)
app.post('/api/cron/daily-reminders', async (req, res) => {
  const secret = req.headers['x-cron-secret'];
  if (secret !== process.env.CRON_SECRET) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  try {
    const { sendDailyBillReminders } = await import('./services/reportService');
    await sendDailyBillReminders();
    res.json({ message: 'Daily reminders sent successfully' });
  } catch (error) {
    console.error('[Cron] Daily reminder error:', error);
    res.status(500).json({ message: 'Failed to send reminders' });
  }
});

app.post('/api/cron/monthly-report', async (req, res) => {
  const secret = req.headers['x-cron-secret'];
  if (secret !== process.env.CRON_SECRET) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  try {
    const { generateAndSendMonthlyReports } = await import('./services/reportService');
    await generateAndSendMonthlyReports();
    res.json({ message: 'Monthly reports sent successfully' });
  } catch (error) {
    console.error('[Cron] Monthly report error:', error);
    res.status(500).json({ message: 'Failed to send reports' });
  }
});

app.post('/api/cron/scheduled-reminders', async (req, res) => {
  const secret = req.headers['x-cron-secret'];
  if (secret !== process.env.CRON_SECRET) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  try {
    const { sendScheduledReminderEmails } = await import('./services/reportService');
    await sendScheduledReminderEmails();
    res.json({ message: 'Scheduled reminders processed successfully' });
  } catch (error) {
    console.error('[Cron] Scheduled reminders error:', error);
    res.status(500).json({ message: 'Failed to process scheduled reminders' });
  }
});

// Initialize in-process Cron Jobs (backup for when service is awake)
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
