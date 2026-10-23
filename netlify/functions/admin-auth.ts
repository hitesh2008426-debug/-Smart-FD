import type { Handler } from '@netlify/functions';
import crypto from 'crypto';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'AdminFD@2026!';
const TOKEN_SALT = process.env.TOKEN_SALT || 'smart_fd_auth_salt_secure_2026';

export function generateToken(email: string): string {
  const payload = {
    email,
    role: 'rate_manager',
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  const str = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET + TOKEN_SALT)
    .update(str)
    .digest('base64url');
  return `${str}.${signature}`;
}

export function verifyToken(token: string): { valid: boolean; email?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return { valid: false };
    const [str, sig] = parts;
    const expected = crypto
      .createHmac('sha256', ADMIN_SECRET + TOKEN_SALT)
      .update(str)
      .digest('base64url');
    if (sig !== expected) return { valid: false };

    const payload = JSON.parse(Buffer.from(str, 'base64url').toString('utf-8'));
    if (Date.now() > payload.exp) return { valid: false };

    return { valid: true, email: payload.email };
  } catch {
    return { valid: false };
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    };
  }

  try {
    const { email, password } = event.body ? JSON.parse(event.body) : {};

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Email and password required' }),
      };
    }

    // Secure authentication check
    if (password === ADMIN_SECRET) {
      const token = generateToken(email);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          token,
          user: {
            email,
            role: 'rate_manager',
          },
        }),
      };
    }

    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: 'Invalid administrator credentials' }),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication failed';
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: message }),
    };
  }
};
