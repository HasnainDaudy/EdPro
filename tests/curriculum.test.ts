import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server/index.js';
import { runSeed } from '../src/server/db/seed.js';

let studentCookie: string[];

beforeAll(async () => {
  await runSeed();
  const studentLogin = await request(app)
    .post('/api/auth/login')
    .send({ username: 'leo_artist', password: 'EdProPass123!' });
  studentCookie = studentLogin.headers['set-cookie'];
});

describe('Curriculum Architecture & 6+1 Unit Flow', () => {
  it('should list all available courses with passion cluster metadata', async () => {
    const res = await request(app).get('/api/courses');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.courses)).toBe(true);
    expect(res.body.courses.length).toBeGreaterThanOrEqual(2);

    const artCourse = res.body.courses.find((c: any) => c.passion_cluster === 'Visual Arts');
    expect(artCourse).toBeDefined();
    expect(artCourse.title).toContain('Visual Arts');
  });

  it('should retrieve a course with exactly 6 sequenced micro-lessons', async () => {
    const coursesRes = await request(app).get('/api/courses');
    const courseId = coursesRes.body.courses[0].id;

    const detailRes = await request(app).get(`/api/courses/${courseId}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.course.lessons).toHaveLength(6);
    expect(detailRes.body.course.lessons[0].lesson_number).toBe(1);
    expect(detailRes.body.course.lessons[5].lesson_number).toBe(6);
  });

  it('should mark a lesson completed and advance student progress', async () => {
    const coursesRes = await request(app).get('/api/courses');
    const courseId = coursesRes.body.courses[0].id;

    const completeRes = await request(app)
      .post(`/api/courses/${courseId}/lessons/1/complete`)
      .set('Cookie', studentCookie);

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.completedLesson).toBe(1);
  });

  it('should load Milestone 7 Assessment for the course', async () => {
    const coursesRes = await request(app).get('/api/courses');
    const courseId = coursesRes.body.courses[0].id;

    const assessRes = await request(app)
      .get(`/api/assessments/${courseId}`)
      .set('Cookie', studentCookie);

    expect(assessRes.status).toBe(200);
    expect(assessRes.body.assessment).toBeDefined();
    expect(assessRes.body.assessment.questions.length).toBe(6);
    expect(assessRes.body.assessment.performanceTask).toBeDefined();
  });
});
