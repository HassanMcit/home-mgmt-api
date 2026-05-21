"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const budgets_1 = __importDefault(require("./routes/budgets"));
const savings_1 = __importDefault(require("./routes/savings"));
const bills_1 = __importDefault(require("./routes/bills"));
const admin_1 = __importDefault(require("./routes/admin"));
const ai_1 = __importDefault(require("./routes/ai"));
const reminders_1 = __importDefault(require("./routes/reminders"));
const reportService_1 = require("./services/reportService");
process.env.TZ = 'UTC';
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
// Global request logger for debugging
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/transactions', transactions_1.default);
app.use('/api/budgets', budgets_1.default);
app.use('/api/savings', savings_1.default);
app.use('/api/bills', bills_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/ai', ai_1.default);
app.use('/api/reminders', reminders_1.default);
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
        const { sendDailyBillReminders } = await Promise.resolve().then(() => __importStar(require('./services/reportService')));
        await sendDailyBillReminders();
        res.json({ message: 'Daily reminders sent successfully' });
    }
    catch (error) {
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
        const { generateAndSendMonthlyReports } = await Promise.resolve().then(() => __importStar(require('./services/reportService')));
        await generateAndSendMonthlyReports();
        res.json({ message: 'Monthly reports sent successfully' });
    }
    catch (error) {
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
        const { sendScheduledReminderEmails } = await Promise.resolve().then(() => __importStar(require('./services/reportService')));
        await sendScheduledReminderEmails();
        res.json({ message: 'Scheduled reminders processed successfully' });
    }
    catch (error) {
        console.error('[Cron] Scheduled reminders error:', error);
        res.status(500).json({ message: 'Failed to process scheduled reminders' });
    }
});
// Initialize in-process Cron Jobs (backup for when service is awake)
(0, reportService_1.initMonthlyReportCron)();
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
// Global error handler
app.use((err, _req, res, _next) => {
    console.error('[Global Error]:', err);
    res.status(err.status || 500).json({
        message: err.message || 'حدث خطأ داخلي في الخادم',
        error: process.env.NODE_ENV === 'development' ? err : undefined
    });
});
exports.default = app;
//# sourceMappingURL=index.js.map