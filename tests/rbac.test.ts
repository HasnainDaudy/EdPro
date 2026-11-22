import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server/index.js';
import { runSeed } from '../src/server/db/seed.js';

let studentCookie: string[];
let teacherCookie: string[];

beforeAll(async () => {
  await runSeed();

  const studentLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'leo_artist', password: 'EdProPass123!' });
  studentCookie = studentLogin.headers['set-cookie'];

  const teacherLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'teacher_carter', password: 'EdProPass123!' });
  teacherCookie = teacherLogin.headers['set-cookie'];
});

describe('Role-Based Access Control & FERPA Isolation', () => {
  it('should return 401 when unauthenticated user requests teacher portal', async () => {
    const res = await request(app).get('/api/teacher/students');
    expect(res.status).toBe(401);
  });

  it('should return 403 Forbidden when a student attempts to view teacher roster', async () => {
    const res = await request(app)
      .get('/api/teacher/students')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should return 403 Forbidden when a student attempts to view admin audit logs', async () => {
    const res = await request(app)
      .get('/api/admin/audit-logs')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(403);
  });

  it('should allow teacher to view student roster with personalized metrics', async () => {
    const res = await request(app)
      .get('/api/teacher/students')
      .set('Cookie', teacherCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.students)).toBe(true);
    expect(res.body.students.length).toBeGreaterThan(0);
  });
});
