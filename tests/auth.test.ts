import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server/index.js';
import { runSeed } from '../src/server/db/seed.js';

beforeAll(async () => {
  await runSeed();
});

describe('Authentication & COPPA Compliance API', () => {
  it('should authenticate seeded teacher with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'teacher_carter', password: 'EdProPass123!' });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.role).toBe('TEACHER');
    expect(res.body.user.displayName).toBe('Ms. Clara Carter');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject invalid password with 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'teacher_carter', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('should register student under 13 with COPPA safeguards', async () => {
    const testUsername = 'test_kid_' + Date.now();
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: testUsername,
        password: 'SecureKidPass123!',
        displayName: 'Oliver S.',
        role: 'STUDENT',
        age: 9,
        passionTrack: 'visual_arts'
      });

    expect(res.status).toBe(201);
    expect(res.body.user.username).toBe(testUsername);
    expect(res.body.user.age).toBe(9);
    expect(res.body.user.ageTrack).toBe('early_childhood_6_9');
  });

  it('should retrieve current user via /api/auth/me', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'leo_artist', password: 'EdProPass123!' });

    const cookie = loginRes.headers['set-cookie'];

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.username).toBe('leo_artist');
    expect(meRes.body.user.role).toBe('STUDENT');
  });
});
