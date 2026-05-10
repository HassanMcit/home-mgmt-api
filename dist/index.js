"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const budgets_1 = __importDefault(require("./routes/budgets"));
const savings_1 = __importDefault(require("./routes/savings"));
const bills_1 = __importDefault(require("./routes/bills"));
const admin_1 = __importDefault(require("./routes/admin"));
const ai_1 = __importDefault(require("./routes/ai"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
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
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'HA Home Management API is running' });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map