import "server-only";
import nodemailer from "nodemailer";

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password?: string;
  accessToken?: string;
};

function makeTransport(config: SmtpConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.accessToken
      ? { type: "OAuth2", user: config.user, accessToken: config.accessToken }
      : { user: config.user, pass: config.password || "" },
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
    attachments?: { filename: string; contentType?: string; content: string }[];
  }
): Promise<{ raw: string }> {
  const transport = makeTransport(config);
  const messageId = `<${Date.now()}.${Math.random().toString(36).slice(2)}@carimail.local>`;

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
  if (opts.attachments?.length) {
    mail.attachments = opts.attachments.map(att => ({
      filename: att.filename,
      contentType: att.contentType,
      content: Buffer.from(att.content, "base64"),
    }));
  }
  mail.messageId = messageId;

  await transport.sendMail(mail);
  return { raw: buildRawMessage({ ...opts, messageId }) };
}

function encodeHeader(value: string) {
  return /[^\x20-\x7e]/.test(value)
    ? `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`
    : value.replace(/\r?\n/g, " ");
}

function buildRawMessage(opts: {
  from: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  inReplyTo?: string;
  references?: string;
  attachments?: { filename: string; contentType?: string; content: string }[];
  messageId: string;
}) {
  const date = new Date().toUTCString();
  const boundary = `carimail-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const contentHeaders = opts.attachments?.length
    ? [`Content-Type: multipart/mixed; boundary="${boundary}"`]
    : [`Content-Type: ${opts.isHtml ? "text/html" : "text/plain"}; charset=utf-8`, "Content-Transfer-Encoding: base64"];
  const headers = [
    `From: ${opts.from}`,
    `To: ${opts.to}`,
    opts.cc ? `Cc: ${opts.cc}` : "",
    `Subject: ${encodeHeader(opts.subject)}`,
    `Date: ${date}`,
    `Message-ID: ${opts.messageId}`,
    opts.inReplyTo ? `In-Reply-To: ${opts.inReplyTo}` : "",
    opts.references ? `References: ${opts.references}` : "",
    "MIME-Version: 1.0",
    ...contentHeaders,
  ].filter(Boolean);

  if (!opts.attachments?.length) return `${headers.join("\r\n")}\r\n\r\n${Buffer.from(opts.body, "utf8").toString("base64")}\r\n`;

  const parts = [
    `--${boundary}`,
    `Content-Type: ${opts.isHtml ? "text/html" : "text/plain"}; charset=utf-8`,
    "Content-Transfer-Encoding: base64",
    "",
    Buffer.from(opts.body, "utf8").toString("base64"),
    ...opts.attachments.flatMap(att => [
      `--${boundary}`,
      `Content-Type: ${att.contentType || "application/octet-stream"}; name="${att.filename.replace(/"/g, "")}"`,
      "Content-Transfer-Encoding: base64",
      `Content-Disposition: attachment; filename="${att.filename.replace(/"/g, "")}"`,
      "",
      att.content,
    ]),
    `--${boundary}--`,
  ];
  return `${headers.join("\r\n")}\r\n\r\n${parts.join("\r\n")}\r\n`;
}
