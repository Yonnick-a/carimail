import "server-only";
import nodemailer from "nodemailer";

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
};

function makeTransport(config: SmtpConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
    tls: { rejectUnauthorized: false },
  });
}

export async function testSmtpConnection(config: SmtpConfig): Promise<void> {
  const transport = makeTransport(config);
  await transport.verify();
}

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
  const transport = makeTransport(config);

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