// lib/mail/smtp.ts
import "server-only";
import nodemailer from "nodemailer";

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
};

export async function sendEmail(
  config: SmtpConfig,
  opts: {
    from: string;
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    body: string;
    isHtml?: boolean;
    inReplyTo?: string;
    references?: string;
  }
) {
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
    tls: { rejectUnauthorized: false },
  });

  const mail: nodemailer.SendMailOptions = {
    from: opts.from,
    to: opts.to,
    subject: opts.subject,
    ...(opts.isHtml
      ? { html: opts.body, text: opts.body.replace(/<[^>]+>/g, "") }
      : { text: opts.body }),
  };

  if (opts.cc) mail.cc = opts.cc;
  if (opts.bcc) mail.bcc = opts.bcc;
  if (opts.inReplyTo) mail.inReplyTo = opts.inReplyTo;
  if (opts.references) mail.references = opts.references;

  await transport.sendMail(mail);
}
