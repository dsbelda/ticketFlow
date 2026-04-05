import { randomBytes } from 'node:crypto';

export function generateRefreshTokenValue(): string {
  return randomBytes(48).toString('hex');
}
