import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, execute } from '../db/database.js';
import { config } from '../config.js';
import { authenticate, AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { logAudit } from '../middleware/rbac.js';

export const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: { message: 'Username and password are required.' } });
      return;
    }

    const user = await queryOne<any>(
      'SELECT id, username, password_hash, role, display_name, age, age_track, passion_track, focus_art_ratio, focus_math_ratio, avatar_seed FROM users WHERE username = ?',
      [username.trim()]
    );

    if (!user) {
      res.status(401).json({ error: { message: 'Invalid credentials.' } });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      res.status(401).json({ error: { message: 'Invalid credentials.' } });
      return;
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.display_name,
      age: user.age,
      ageTrack: user.age_track,
      passionTrack: user.passion_track
    };

    const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '7d' });

    // Set secure HTTP-only cookie
    res.cookie(config.cookieName, token, {
      httpOnly: true,
      secure: config.environment === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await logAudit(user.id, user.role, 'USER_LOGIN', 'users', user.id, req.ip || '127.0.0.1');

    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.display_name,
        age: user.age,
        ageTrack: user.age_track,
        passionTrack: user.passion_track,
        focusArtRatio: user.focus_art_ratio,
        focusMathRatio: user.focus_math_ratio,
        avatarSeed: user.avatar_seed
      },
      token
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: { message: 'An internal server error occurred during login.' } });
  }
});

authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, displayName, role = 'STUDENT', age = 10, passionTrack = 'visual_arts' } = req.body;

    if (!username || !password || !displayName) {
      res.status(400).json({ error: { message: 'Username, password, and display name are required.' } });
      return;
    }

    const existing = await queryOne('SELECT id FROM users WHERE username = ?', [username.trim()]);
    if (existing) {
      res.status(409).json({ error: { message: 'Username is already taken.' } });
      return;
    }

    const numAge = parseInt(age, 10) || 10;
    let ageTrack: string = 'middle_school_10_13';
    if (numAge <= 9) ageTrack = 'early_childhood_6_9';
    else if (numAge >= 14) ageTrack = 'high_school_14_17';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = uuidv4();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO users (id, username, password_hash, role, display_name, age, age_track, passion_track, focus_art_ratio, focus_math_ratio, avatar_seed, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 60, 40, ?, ?)`,
      [userId, username.trim(), passwordHash, role, displayName.trim(), numAge, ageTrack, passionTrack, 'avatar_' + userId.slice(0, 5), now]
    );

    // COPPA Record for students under 13
    if (role === 'STUDENT' && numAge < 13) {
      const expiresAt = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
      await execute(
        `INSERT INTO student_privacy_records (id, student_id, coppa_covered, consent_status, authorized_by_user_id, authorized_at, retention_expires_at, created_at)
         VALUES (?, ?, 1, 'SCHOOL_AUTHORIZED', NULL, ?, ?, ?)`,
        [uuidv4(), userId, now, expiresAt, now]
      );
    }

    const tokenPayload = {
      id: userId,
      username: username.trim(),
      role,
      displayName: displayName.trim(),
      age: numAge,
      ageTrack,
      passionTrack
    };

    const token = jwt.sign(tokenPayload, config.jwtSecret, { expiresIn: '7d' });

    res.cookie(config.cookieName, token, {
      httpOnly: true,
      secure: config.environment === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await logAudit(userId, role, 'USER_REGISTER', 'users', userId, req.ip || '127.0.0.1');

    res.status(201).json({
      user: {
        id: userId,
        username: username.trim(),
        role,
        displayName: displayName.trim(),
        age: numAge,
        ageTrack,
        passionTrack,
        focusArtRatio: 60,
        focusMathRatio: 40
      },
      token
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: { message: 'An internal server error occurred.' } });
  }
});

authRouter.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie(config.cookieName);
  res.json({ message: 'Successfully logged out.' });
});

authRouter.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.json({ user: null });
    return;
  }

  const user = await queryOne<any>(
    'SELECT id, username, role, display_name, age, age_track, passion_track, focus_art_ratio, focus_math_ratio, avatar_seed FROM users WHERE id = ?',
    [req.user.id]
  );

  if (!user) {
    res.json({ user: null });
    return;
  }

  res.json({
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.display_name,
      age: user.age,
      ageTrack: user.age_track,
      passionTrack: user.passion_track,
      focusArtRatio: user.focus_art_ratio,
      focusMathRatio: user.focus_math_ratio,
      avatarSeed: user.avatar_seed
    }
  });
});

authRouter.put('/profile', authenticate, requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { passionTrack, focusArtRatio, focusMathRatio, displayName } = req.body;
    const userId = req.user!.id;

    if (passionTrack || focusArtRatio !== undefined || focusMathRatio !== undefined || displayName) {
      await execute(
        `UPDATE users 
         SET passion_track = COALESCE(?, passion_track),
             focus_art_ratio = COALESCE(?, focus_art_ratio),
             focus_math_ratio = COALESCE(?, focus_math_ratio),
             display_name = COALESCE(?, display_name)
         WHERE id = ?`,
        [passionTrack || null, focusArtRatio ?? null, focusMathRatio ?? null, displayName || null, userId]
      );
    }

    const updated = await queryOne<any>(
      'SELECT id, username, role, display_name, age, age_track, passion_track, focus_art_ratio, focus_math_ratio, avatar_seed FROM users WHERE id = ?',
      [userId]
    );

    res.json({ user: updated });
  } catch (err: any) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: { message: 'Failed to update profile.' } });
  }
});
