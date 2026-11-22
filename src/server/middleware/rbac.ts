import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';
import { execute } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

export function requireRole(allowedRoles: Array<'STUDENT' | 'TEACHER' | 'ADMIN'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' }
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'You do not have permission to access this resource.' }
      });
      return;
    }

    next();
  };
}

export async function logAudit(
  actorId: string,
  actorRole: string,
  action: string,
  targetResource: string,
  targetId: string,
  ipAddress: string
): Promise<void> {
  try {
    await execute(
      `INSERT INTO audit_logs (id, actor_id, actor_role, action, target_resource, target_id, ip_address, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), actorId, actorRole, action, targetResource, targetId, ipAddress || '127.0.0.1', new Date().toISOString()]
    );
  } catch (err) {
    console.error('Audit log write failed:', err);
  }
}
