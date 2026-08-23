import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const getSecret = () => {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required in production');
  }
  return process.env.JWT_SECRET || 'development-only-change-me';
};

export type AuthRequest = Request & { user?: { id: number; email: string } };

export function issueToken(user: { id: number; email: string }) {
  return jwt.sign({ email: user.email }, getSecret(), { subject: String(user.id), expiresIn: '7d' });
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Authorization token required' });
  try {
    const payload = jwt.verify(token, getSecret()) as jwt.JwtPayload;
    const id = Number(payload.sub);
    if (!Number.isInteger(id)) throw new Error('Invalid token subject');
    req.user = { id, email: String(payload.email || '') };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
