"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
exports.transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendEmail = async (to, subject, html) => {
    try {
        await exports.transporter.sendMail({
            from: `"مدبّر | إدارة المنزل" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        return true;
    }
    catch (error) {
        console.error('[Mailer Error]:', error);
        return false;
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=mailer.js.map