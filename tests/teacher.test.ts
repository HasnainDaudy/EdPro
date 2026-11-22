import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server/index.js';
import { runSeed } from '../src/server/db/seed.js';

let teacherCookie: string[];
let adminCookie: string[];

beforeAll(async () => {
  await runSeed();

  const teacherLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'teacher_carter', password: 'EdProPass123!' });
  teacherCookie = teacherLogin.headers['set-cookie'];

  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'admin', password: 'EdProPass123!' });
  adminCookie = adminLogin.headers['set-cookie'];
});

describe('Teacher Workflow & Admin Compliance API', () => {
  it('should fetch pending submissions in teacher queue', async () => {
    const res = await request(app)
      .get('/api/teacher/submissions')
      .set('Cookie', teacherCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.submissions)).toBe(true);
    expect(res.body.submissions.length).toBeGreaterThan(0);
  });

  it('should allow teacher to grade student submission with rubric feedback', async () => {
    const subsRes = await request(app)
      .get('/api/teacher/submissions')
      .set('Cookie', teacherCookie);

    const subId = subsRes.body.submissions[0].id;

    const gradeRes = await request(app)
      .post(`/api/teacher/submissions/${subId}/grade`)
      .set('Cookie', teacherCookie)
      .send({
        teacherGrade: 96,
        teacherFeedback: 'Outstanding application of Cartesian vectors! Your platform pacing is intuitive.'
      });

    expect(gradeRes.status).toBe(200);
    expect(gradeRes.body.message).toContain('graded successfully');
  });

  it('should fetch diagnostic mastery heatmap analytics', async () => {
    const res = await request(app)
      .get('/api/teacher/analytics')
      .set('Cookie', teacherCookie);

    expect(res.status).toBe(200);
    expect(res.body.analytics).toBeDefined();
    expect(res.body.analytics.masteryData.length).toBeGreaterThan(0);
  });

  it('should fetch COPPA/FERPA student privacy consent ledger for Admin', async () => {
    const res = await request(app)
      .get('/api/admin/privacy-records')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.records)).toBe(true);
    expect(res.body.records[0].coppa_covered).toBe(1);
  });

  it('should fetch immutable FERPA audit logs for Admin', async () => {
    const res = await request(app)
      .get('/api/admin/audit-logs')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.auditLogs)).toBe(true);
    expect(res.body.auditLogs.length).toBeGreaterThan(0);
  });
});
