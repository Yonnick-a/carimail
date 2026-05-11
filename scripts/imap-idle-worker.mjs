import { createDecipheriv, createHmac } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import pg from "pg";
import { ImapFlow } from "imapflow";

function loadEnvFile(path = ".env.local") {
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const idx = trimmed.indexOf("=");
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function decryptAccountSecret(encrypted) {
  if (!encrypted) return "";
  const secret = process.env.CARIMAIL_ENCRYPTION_SECRET;
  if (!secret || secret.length < 32) throw new Error("CARIMAIL_ENCRYPTION_SECRET must be at least 32 characters.");
  const [ivHex, encHex] = encrypted.split(":");
  const key = Buffer.from(createHmac("sha256", secret).update("carimail-account-v1").digest());
  const decipher = createDecipheriv("aes-256-cbc", key, Buffer.from(ivHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]).toString("utf8");
}

function makeClient(account) {
  const auth = account.authType === "oauth" && account.encryptedAccessToken
    ? { user: account.emailAddress, accessToken: decryptAccountSecret(account.encryptedAccessToken) }
    : { user: account.emailAddress, pass: decryptAccountSecret(account.encryptedPassword) };

  return new ImapFlow({
    host: account.imapHost,
    port: account.imapPort,
    secure: account.imapSecure,
    auth,
    logger: false,
    tls: { rejectUnauthorized: false },
  });
}

async function triggerSync(accountId, folder = "INBOX") {
  const baseUrl = process.env.CARIMAIL_WORKER_APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const headers = { "Content-Type": "application/json" };
  if (process.env.CARIMAIL_CRON_SECRET) headers.authorization = `Bearer ${process.env.CARIMAIL_CRON_SECRET}`;
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/mail/jobs/sync`, {
    method: "POST",
    headers,
    body: JSON.stringify({ accountId, folder, limit: Number(process.env.CARIMAIL_WORKER_SYNC_LIMIT || 60) }),
  });
  if (!res.ok) throw new Error(`Sync endpoint returned ${res.status}`);
  return res.json();
}

async function watchAccount(account) {
  let delay = 2000;
  for (;;) {
    const client = makeClient(account);
    try {
      console.log(`[idle] connecting ${account.emailAddress}`);
      await client.connect();
      await client.mailboxOpen("INBOX");
      await triggerSync(account.id, "INBOX").catch(err => console.warn(`[idle] initial sync failed: ${err.message}`));
      delay = 2000;

      for (;;) {
        await Promise.race([client.idle(), sleep(29 * 60 * 1000)]);
        await triggerSync(account.id, "INBOX");
      }
    } catch (err) {
      console.warn(`[idle] ${account.emailAddress}: ${err instanceof Error ? err.message : String(err)}`);
      try {
        await client.logout();
      } catch {}
      await sleep(delay);
      delay = Math.min(delay * 2, 60000);
    }
  }
}

async function main() {
  loadEnvFile();
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const { rows } = await pool.query(`
    SELECT id, "emailAddress", "imapHost", "imapPort", "imapSecure", "encryptedPassword",
           "authType", "encryptedAccessToken", "oauthExpiresAt"
    FROM "MailAccount"
    WHERE "isActive" = true
    ORDER BY "createdAt" ASC
  `);
  await pool.end();
  if (rows.length === 0) {
    console.log("[idle] no active accounts found.");
    return;
  }
  console.log(`[idle] watching ${rows.length} account(s).`);
  await Promise.all(rows.map(watchAccount));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
