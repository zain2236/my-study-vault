import { randomBytes, createHash } from "crypto";

/**
 * Generate a cryptographically secure random token (32 bytes = 64 hex chars).
 */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Hash a token with SHA-256 for safe database storage.
 * The raw token goes in the email link; the hash is stored in the DB.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
