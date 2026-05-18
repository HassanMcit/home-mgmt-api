"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.isAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'غير مصرح - يرجى تسجيل الدخول' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ message: 'جلسة منتهية - يرجى تسجيل الدخول مجدداً' });
    }
};
exports.authenticate = authenticate;
const isAdmin = (role) => role === 'admin' || role === 'super_admin';
exports.isAdmin = isAdmin;
const requireAdmin = (req, res, next) => {
    if (!req.user || !(0, exports.isAdmin)(req.user.role)) {
        res.status(403).json({ message: 'غير مسموح - هذه الصفحة للمدير فقط' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.js.map