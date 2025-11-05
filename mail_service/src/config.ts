import 'dotenv/config';

function bool(env: string | undefined, def: boolean): boolean {
  if (env === undefined) return def;
  return ['1', 'true', 'yes', 'on'].includes(env.toLowerCase());
}

export const config = {
  port: parseInt(process.env.PORT || '8080', 10),

  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || process.env.SMTP_USER || '',
  smtpSecure: bool(process.env.SMTP_SECURE, false), // true for 465, false otherwise
};