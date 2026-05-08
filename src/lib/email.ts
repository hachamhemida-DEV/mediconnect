/**
 * Email service — thin façade over Resend (or any provider with a similar API).
 *
 * Behaviour switch:
 *   - If `RESEND_API_KEY` is set in the environment, emails are sent for real.
 *   - Otherwise (dev without a key), emails are logged to the structured
 *     logger and a pretty blue box is printed to the terminal. No email is
 *     actually delivered.
 *
 * This means developers can work on email flows (order confirmation, CCP
 * verification, supplier approval) without any SaaS credentials at all;
 * flipping them live later is a one-env-var change.
 */

import { logger } from './logger';

export interface EmailMessage {
  to:      string;
  subject: string;
  html:    string;
  text?:   string;
}

interface SendResult {
  ok:    boolean;
  id?:   string;
  error?: string;
}

async function sendViaResend(msg: EmailMessage, apiKey: string): Promise<SendResult> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    process.env.EMAIL_FROM ?? 'MediConnect <noreply@mediconnect.dz>',
        to:      [msg.to],
        subject: msg.subject,
        html:    msg.html,
        text:    msg.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `resend ${res.status}: ${body.slice(0, 200)}` };
    }
    const data = await res.json() as { id?: string };
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

function logOnly(msg: EmailMessage): SendResult {
  logger.info('email_dry_run', { to: msg.to, subject: msg.subject });
  // Dev pretty print — human-friendly preview right in the terminal.
  if (process.env.NODE_ENV !== 'production') {
    const bar = '─'.repeat(60);
    process.stdout.write(
      `\n\x1b[36m┌ 📧 EMAIL (dev mode, not sent) ${bar}\x1b[0m\n` +
      `\x1b[36m│\x1b[0m to:      ${msg.to}\n` +
      `\x1b[36m│\x1b[0m subject: ${msg.subject}\n` +
      `\x1b[36m│\x1b[0m\n` +
      `\x1b[36m│\x1b[0m ${(msg.text ?? msg.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, 240)}...\n` +
      `\x1b[36m└${bar}${'─'.repeat(31)}\x1b[0m\n\n`,
    );
  }
  return { ok: true, id: `dev-${Date.now()}` };
}

export async function sendEmail(msg: EmailMessage): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  return key ? sendViaResend(msg, key) : logOnly(msg);
}
