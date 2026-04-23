import { randomBytes, createHash } from 'crypto';

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const saltValue = salt || randomBytes(32).toString('hex');
  const hash = createHash('sha256')
    .update(password + saltValue)
    .digest('hex');
  return { hash, salt: saltValue };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: computedHash } = hashPassword(password, salt);
  return computedHash === hash;
}

export function generateSecureRandom(): string {
  return randomBytes(32).toString('hex');
}
