import express from 'express';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { config } from './config.js';

const app = express();
app.use(express.json({ limit: '1mb' }));

// Validate request body
const EmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email()).nonempty()]),
  subject: z.string().min(1),
  text: z.string().optional(),
  html: z.string().optional(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  attachments: z.array(
    z.object({
      filename: z.string().min(1),
      content: z.string().min(1), // base64 string
      contentType: z.string().optional(),
      cid: z.string().optional(), // for inline images
    })
  ).optional()
}).refine(body => body.text || body.html, {
  message: "Provide at least 'text' or 'html'",
  path: ['text'],
});

function ensureSmtpConfigured() {
  if (!config.smtpHost) {
    throw new Error('SMTP not configured: set SMTP_HOST at minimum.');
  }
  if (!config.smtpFrom) {
    throw new Error('SMTP_FROM or SMTP_USER is required for the From address.');
  }
}

// Transporter is created lazily per request to keep things simple.
// For higher throughput, create it once and reuse.
function createTransporter() {
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure, // true for 465, false for 587/1025 (MailPit)
    auth: config.smtpUser
      ? { user: config.smtpUser, pass: config.smtpPass }
      : undefined,
  });
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', smtpHost: config.smtpHost ? 'configured' : 'missing' });
});

app.post('/send', async (req, res) => {
  try {
    ensureSmtpConfigured();

    const parsed = EmailSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
    }
    const body = parsed.data;

    const to = Array.isArray(body.to) ? body.to : [body.to];
    const cc = body.cc ?? [];
    const bcc = body.bcc ?? [];

    const mailOptions: nodemailer.SendMailOptions = {
      from: config.smtpFrom,
      to,
      cc: cc.length ? cc : undefined,
      bcc: bcc.length ? bcc : undefined,
      subject: body.subject,
      text: body.text,
      html: body.html,
      attachments: body.attachments?.map(a => ({
        filename: a.filename,
        content: Buffer.from(a.content, 'base64'),
        contentType: a.contentType,
        cid: a.cid,
      })),
    };

    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);

    return res.json({
      status: 'sent',
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });
  } catch (err: any) {
    console.error('SMTP send failed:', err);
    return res.status(502).json({ error: 'SMTP send failed', details: String(err?.message || err) });
  }
});

app.listen(config.port, () => {
  console.log(`email-sender listening on 0.0.0.0:${config.port}`);
});