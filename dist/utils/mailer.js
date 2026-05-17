"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ [Mailer] Critical Error: EMAIL_USER or EMAIL_PASS not found in environment variables!');
}
else {
    console.log(`✅ [Mailer] Initialized: Sender is ${process.env.EMAIL_USER}`);
}
exports.transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 5000, // 5 seconds max to connect
    greetingTimeout: 5000, // 5 seconds max for greeting
    socketTimeout: 10000, // 10 seconds max for any socket operation
});
const sendEmail = async (to, subject, html) => {
    try {
        const from = `"مدبّر | إدارة المنزل" <${process.env.EMAIL_USER}>`;
        console.log(`\n📧 [Mailer] ====== EMAIL DISPATCH START ======`);
        console.log(`📧 [Mailer] FROM: ${process.env.EMAIL_USER}`);
        console.log(`📧 [Mailer] TO:   ${to}`);
        console.log(`📧 [Mailer] SUBJ: ${subject}`);
        // Verify transporter connection first
        await exports.transporter.verify();
        console.log(`📧 [Mailer] SMTP connection verified ✅`);
        const info = await exports.transporter.sendMail({
            from,
            to,
            subject,
            html,
        });
        console.log(`📧 [Mailer] SUCCESS! MessageId: ${info.messageId}`);
        console.log(`📧 [Mailer] ====== EMAIL DISPATCH END ========\n`);
        return true;
    }
    catch (error) {
        console.error(`\n❌ [Mailer] ====== EMAIL FAILED ======`);
        console.error(`❌ [Mailer] TO: ${to}`);
        console.error(`❌ [Mailer] Error Code: ${error.code}`);
        console.error(`❌ [Mailer] Error Message: ${error.message}`);
        console.error(`❌ [Mailer] Full Error:`, error);
        console.error(`❌ [Mailer] ============================\n`);
        return false;
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=mailer.js.map