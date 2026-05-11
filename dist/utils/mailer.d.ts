import nodemailer from 'nodemailer';
export declare const transporter: nodemailer.Transporter<import("nodemailer/lib/smtp-transport").SentMessageInfo, import("nodemailer/lib/smtp-transport").Options>;
export declare const sendEmail: (to: string, subject: string, html: string) => Promise<boolean>;
//# sourceMappingURL=mailer.d.ts.map