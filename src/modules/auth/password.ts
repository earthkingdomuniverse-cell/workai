import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const KEY_LENGTH = 64;

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const saltValue = salt || randomBytes(16).toString('hex');
  // Using scrypt for more secure password hashing than simple sha256
  const hash = scryptSync(password, saltValue, KEY_LENGTH).toString('hex');
  return { hash, salt: saltValue };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const hashBuffer = Buffer.from(hash, 'hex');
    const computedHashBuffer = scryptSync(password, salt, KEY_LENGTH);
    
    if (hashBuffer.length !== computedHashBuffer.length) {
      return false;
    }
    
    return timingSafeEqual(hashBuffer, computedHashBuffer);
  } catch {
    return false;
  }
}

export function generateSecureRandom(): string {
  return randomBytes(32).toString('hex');
}
