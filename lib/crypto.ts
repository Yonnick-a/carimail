// lib/crypto.ts
import "server-only";
import bcrypt from "bcryptjs";
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "crypto";

// ── Password hashing ──────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── IMAP password encryption ──────────────────────────────────────────
// Account passwords are AES-256-CBC encrypted at rest

function getEncryptionKey(): Buffer {
  const secret = process.env.CARIMAIL_ENCRYPTION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("CARIMAIL_ENCRYPTION_SECRET must be at least 32 characters.");
  }
  return Buffer.from(
    createHmac("sha256", secret).update("carimail-account-v1").digest()
  );
}

export function encryptAccountPassword(password: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(password, "utf8")),
    cipher.final(),
  ]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptAccountPassword(encrypted: string): string {
  const key = getEncryptionKey();
  const [ivHex, encHex] = encrypted.split(":");
  if (!ivHex || !encHex) throw new Error("Invalid encrypted password.");
  const iv = Buffer.from(ivHex, "hex");
  const enc = Buffer.from(encHex, "hex");
  const decipher = createDecipheriv("aes-256-cbc", key, iv);
  const decrypted = Buffer.concat([decipher.update(enc), decipher.final()]);
  return decrypted.toString("utf8");
}
