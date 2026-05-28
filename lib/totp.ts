import "server-only";
import { createHmac, randomBytes, createCipheriv, createDecipheriv, createHmac as hmac } from "crypto";
import { hashPassword } from "./crypto";
import bcrypt from "bcryptjs";

// ── Base32 helpers ────────────────────────────────────────────────────────────

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buf: Buffer): string {
  let result = "";
  for (let i = 0; i < buf.length; ) {
    const b = [buf[i++] ?? 0, buf[i++] ?? 0, buf[i++] ?? 0, buf[i++] ?? 0, buf[i++] ?? 0];
    result +=
      B32[(b[0] >> 3) & 31] +
      B32[((b[0] << 2) | (b[1] >> 6)) & 31] +
      B32[(b[1] >> 1) & 31] +
      B32[((b[1] << 4) | (b[2] >> 4)) & 31] +
      B32[((b[2] << 1) | (b[3] >> 7)) & 31] +
      B32[(b[3] >> 2) & 31] +
      B32[((b[3] << 3) | (b[4] >> 5)) & 31] +
      B32[b[4] & 31];
  }
  return result;
}

function base32Decode(str: string): Buffer {
  const clean = str.toUpperCase().replace(/[^A-Z2-7]/g, "");
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  for (const c of clean) {
    const idx = B32.indexOf(c);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >> bits) & 255);
    }
  }
  return Buffer.from(bytes);
}

// ── TOTP core (RFC 6238 / RFC 4226) ──────────────────────────────────────────

export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function getTotpCode(secret: string, atMs?: number): string {
  const t = Math.floor((atMs ?? Date.now()) / 30_000);
  const key = base32Decode(secret);
  const counter = Buffer.alloc(8);
  counter.writeUInt32BE(Math.floor(t / 0x1_0000_0000), 0);
  counter.writeUInt32BE(t >>> 0, 4);
  const mac = createHmac("sha1", key).update(counter).digest();
  const offset = mac[mac.length - 1] & 0x0f;
  const code =
    ((mac[offset] & 0x7f) << 24) |
    (mac[offset + 1] << 16) |
    (mac[offset + 2] << 8) |
    mac[offset + 3];
  return String(code % 1_000_000).padStart(6, "0");
}

export function verifyTotpCode(secret: string, token: string): boolean {
  if (!/^\d{6}$/.test(token)) return false;
  const t = Date.now();
  // ±1 time step tolerance for clock drift
  return [-1, 0, 1].some(d => getTotpCode(secret, t + d * 30_000) === token);
}

export function getOtpAuthUri(secret: string, account: string, issuer = "Carimail"): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

// Format secret as groups of 4 for readability: JBSW Y3DP EHPK 3PXP
export function formatSecret(secret: string): string {
  return secret.match(/.{1,4}/g)?.join(" ") ?? secret;
}

// ── Backup codes ──────────────────────────────────────────────────────────────

export function generateBackupCodes(): string[] {
  return Array.from({ length: 8 }, () => {
    const buf = randomBytes(4);
    const hex = buf.toString("hex").toUpperCase();
    return `${hex.slice(0, 4)}-${hex.slice(4)}`;
  });
}

export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map(c => hashPassword(c)));
}

export async function verifyBackupCode(code: string, hashed: string[]): Promise<number> {
  const normalised = code.replace(/\s/g, "").toUpperCase();
  for (let i = 0; i < hashed.length; i++) {
    if (await bcrypt.compare(normalised, hashed[i])) return i;
  }
  return -1;
}

// ── 2FA challenge cookie (short-lived, AES-256-CBC signed token) ──────────────

const CHALLENGE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function getChallengeKey(): Buffer {
  const secret = process.env.CARIMAIL_ENCRYPTION_SECRET;
  if (!secret || secret.length < 32) throw new Error("CARIMAIL_ENCRYPTION_SECRET not set.");
  return Buffer.from(
    hmac("sha256", secret).update("carimail-2fa-challenge-v1").digest()
  );
}

export function createTwoFactorChallenge(userId: string): string {
  const key = getChallengeKey();
  const iv = randomBytes(16);
  const payload = `${userId}:${Date.now() + CHALLENGE_EXPIRY_MS}`;
  const cipher = createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(payload, "utf8")),
    cipher.final(),
  ]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function verifyTwoFactorChallenge(token: string): string | null {
  try {
    const key = getChallengeKey();
    const [ivHex, encHex] = token.split(":");
    if (!ivHex || !encHex) return null;
    const iv = Buffer.from(ivHex, "hex");
    const enc = Buffer.from(encHex, "hex");
    const decipher = createDecipheriv("aes-256-cbc", key, iv);
    const decrypted = Buffer.concat([decipher.update(enc), decipher.final()]);
    const [userId, expiresStr] = decrypted.toString("utf8").split(":");
    if (!userId || !expiresStr) return null;
    if (Date.now() > parseInt(expiresStr, 10)) return null;
    return userId;
  } catch {
    return null;
  }
}
