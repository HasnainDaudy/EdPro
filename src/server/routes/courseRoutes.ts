import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, execute } from '../db/database.js';
import { authenticate, AuthenticatedRequest, requireAuth } from '../middleware/auth.js';

export const courseRouter = Router();

// GET all courses
courseRouter.get('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const courses = await query<any>('SELECT * FROM courses ORDER BY created_at ASC');
    
    // If student logged in, fetch their progress
    let progressMap: Record<string, any> = {};
    if (req.user && req.user.role === 'STUDENT') {
      const progresses = await query<any>('SELECT * FROM student_progress WHERE student_id = ?', [req.user.id]);
      progresses.forEach((p) => {
        progressMap[p.course_id] = {
          currentLesson: p.current_lesson,
          completedLessons: JSON.parse(p.completed_lessons_json || '[]'),
          streakDays: p.streak_days
        };
      });
    }

    const enriched = courses.map((c) => ({
      ...c,
      progress: progressMap[c.id] || { currentLesson: 1, completedLessons: [], streakDays: 0 }
    }));

    res.json({ courses: enriched });
  } catch (err: any) {
    console.error('Fetch courses error:', err);
    res.status(500).json({ error: { message: 'Failed to retrieve courses.' } });
  }
});

// GET single course with all 6 lessons
courseRouter.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const courseId = req.params.id;
    const course = await queryOne<any>('SELECT * FROM courses WHERE id = ? OR slug = ?', [courseId, courseId]);

    if (!course) {
      res.status(404).json({ error: { message: 'Course not found.' } });
      return;
    }

    const lessons = await query<any>(
      `SELECT id, course_id, lesson_number, title, duration_minutes, spark_hook, objective,
              key_concepts_json, allowed_vocab_json, analogies_json, simulation_type
       FROM lessons WHERE course_id = ? ORDER BY lesson_number ASC`,
      [course.id]
    );

    const parsedLessons = lessons.map((l) => ({
      ...l,
      keyConcepts: JSON.parse(l.key_concepts_json || '[]'),
      allowedVocab: JSON.parse(l.allowed_vocab_json || '[]'),
      analogies: JSON.parse(l.analogies_json || '[]')
    }));

    let progress = { currentLesson: 1, completedLessons: [], streakDays: 1 };
    if (req.user && req.user.role === 'STUDENT') {
      const p = await queryOne<any>('SELECT * FROM student_progress WHERE student_id = ? AND course_id = ?', [req.user.id, course.id]);
      if (p) {
        progress = {
          currentLesson: p.current_lesson,
          completedLessons: JSON.parse(p.completed_lessons_json || '[]'),
          streakDays: p.streak_days
        };
      }
    }

    res.json({
      course: {
        ...course,
        lessons: parsedLessons,
        progress
      }
    });
  } catch (err: any) {
    console.error('Fetch course detail error:', err);
    res.status(500).json({ error: { message: 'Failed to retrieve course details.' } });
  }
});

// GET specific lesson with multi-modal content
courseRouter.get('/:courseId/lessons/:lessonNumber', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId, lessonNumber } = req.params;
    const num = parseInt(lessonNumber, 10);

    const course = await queryOne<any>('SELECT * FROM courses WHERE id = ? OR slug = ?', [courseId, courseId]);
    if (!course) {
      res.status(404).json({ error: { message: 'Course not found.' } });
      return;
    }

    const lesson = await queryOne<any>(
      'SELECT * FROM lessons WHERE course_id = ? AND lesson_number = ?',
      [course.id, num]
    );

    if (!lesson) {
      res.status(404).json({ error: { message: 'Lesson not found.' } });
      return;
    }

    res.json({
      lesson: {
        id: lesson.id,
        courseId: lesson.course_id,
        courseTitle: course.title,
        lessonNumber: lesson.lesson_number,
        title: lesson.title,
        durationMinutes: lesson.duration_minutes,
        sparkHook: lesson.spark_hook,
        objective: lesson.objective,
        keyConcepts: JSON.parse(lesson.key_concepts_json || '[]'),
        allowedVocab: JSON.parse(lesson.allowed_vocab_json || '[]'),
        analogies: JSON.parse(lesson.analogies_json || '[]'),
        readerContent: lesson.reader_content,
        videoUrl: lesson.video_url,
        videoTitle: lesson.video_title,
        simulationType: lesson.simulation_type,
        simulationConfig: JSON.parse(lesson.simulation_config_json || '{}'),
        audioSummaryText: lesson.audio_summary_text,
        worksheetTitle: lesson.worksheet_title,
        worksheetMarkdown: lesson.worksheet_markdown,
        pulseQuestion: JSON.parse(lesson.pulse_question_json || '{}')
      }
    });
  } catch (err: any) {
    console.error('Fetch lesson error:', err);
    res.status(500).json({ error: { message: 'Failed to load lesson.' } });
  }
});

// POST complete lesson
courseRouter.post('/:courseId/lessons/:lessonNumber/complete', authenticate, requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId, lessonNumber } = req.params;
    const num = parseInt(lessonNumber, 10);
    const studentId = req.user!.id;

    const course = await queryOne<any>('SELECT id FROM courses WHERE id = ? OR slug = ?', [courseId, courseId]);
    if (!course) {
      res.status(404).json({ error: { message: 'Course not found.' } });
      return;
    }

    const existingProgress = await queryOne<any>(
      'SELECT * FROM student_progress WHERE student_id = ? AND course_id = ?',
      [studentId, course.id]
    );

    const now = new Date().toISOString();

    if (!existingProgress) {
      await execute(
        `INSERT INTO student_progress (id, student_id, course_id, current_lesson, completed_lessons_json, streak_days, updated_at)
         VALUES (?, ?, ?, ?, ?, 1, ?)`,
        [uuidv4(), studentId, course.id, Math.min(num + 1, 6), JSON.stringify([num]), now]
      );
    } else {
      const completed: number[] = JSON.parse(existingProgress.completed_lessons_json || '[]');
      if (!completed.includes(num)) {
        completed.push(num);
      }
      const nextLesson = Math.min(Math.max(existingProgress.current_lesson, num + 1), 6);
      await execute(
        `UPDATE student_progress 
         SET current_lesson = ?, completed_lessons_json = ?, streak_days = streak_days + 1, updated_at = ?
         WHERE id = ?`,
        [nextLesson, JSON.stringify(completed), now, existingProgress.id]
      );
    }

    res.json({ message: 'Lesson completed successfully!', completedLesson: num });
  } catch (err: any) {
    console.error('Complete lesson error:', err);
    res.status(500).json({ error: { message: 'Failed to mark lesson complete.' } });
  }
});
