import { Router, Response } from 'express';
import { query, queryOne, execute } from '../db/database.js';
import { authenticate, AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { requireRole, logAudit } from '../middleware/rbac.js';

export const adminRouter = Router();

adminRouter.use(authenticate, requireAuth, requireRole(['ADMIN']));

// GET COPPA/FERPA student privacy consent ledger
adminRouter.get('/privacy-records', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const records = await query<any>(
      `SELECT p.*, u.username, u.display_name, u.age, u.age_track,
              auth_u.display_name as authorized_by_name
       FROM student_privacy_records p
       JOIN users u ON p.student_id = u.id
       LEFT JOIN users auth_u ON p.authorized_by_user_id = auth_u.id
       ORDER BY p.created_at DESC`
    );

    res.json({ records });
  } catch (err: any) {
    console.error('Fetch privacy records error:', err);
    res.status(500).json({ error: { message: 'Failed to retrieve privacy records.' } });
  }
});

// POST update student consent status
adminRouter.post('/consent/:recordId/update', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { recordId } = req.params;
    const { consentStatus } = req.body; // 'SCHOOL_AUTHORIZED' | 'PARENT_VERIFIED' | 'REVOKED'
    const adminId = req.user!.id;

    if (!['SCHOOL_AUTHORIZED', 'PARENT_VERIFIED', 'REVOKED'].includes(consentStatus)) {
      res.status(400).json({ error: { message: 'Invalid consent status value.' } });
      return;
    }

    const now = new Date().toISOString();
    await execute(
      `UPDATE student_privacy_records
       SET consent_status = ?, authorized_by_user_id = ?, authorized_at = ?
       WHERE id = ?`,
      [consentStatus, adminId, now, recordId]
    );

    await logAudit(adminId, 'ADMIN', 'UPDATE_COPPA_CONSENT', 'student_privacy_records', recordId, req.ip || '127.0.0.1');

    res.json({ message: 'Consent status updated successfully.', recordId, consentStatus });
  } catch (err: any) {
    console.error('Update consent error:', err);
    res.status(500).json({ error: { message: 'Failed to update consent status.' } });
  }
});

// GET immutable FERPA audit logs
adminRouter.get('/audit-logs', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const logs = await query<any>(
      `SELECT a.*, u.display_name as actor_name
       FROM audit_logs a
       LEFT JOIN users u ON a.actor_id = u.id
       ORDER BY a.timestamp DESC
       LIMIT 100`
    );

    res.json({ auditLogs: logs });
  } catch (err: any) {
    console.error('Fetch audit logs error:', err);
    res.status(500).json({ error: { message: 'Failed to retrieve audit logs.' } });
  }
});
