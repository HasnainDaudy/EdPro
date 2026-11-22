import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, execute, query } from '../db/database.js';
import { authenticate, AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { logAudit } from '../middleware/rbac.js';

export const assessmentRouter = Router();

// GET milestone assessment for course
assessmentRouter.get('/:courseId', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const course = await queryOne<any>('SELECT id, title FROM courses WHERE id = ? OR slug = ?', [courseId, courseId]);
    if (!course) {
      res.status(404).json({ error: { message: 'Course not found.' } });
      return;
    }

    const assessment = await queryOne<any>('SELECT * FROM milestone_assessments WHERE course_id = ?', [course.id]);
    if (!assessment) {
      res.status(404).json({ error: { message: 'No milestone assessment found for this course.' } });
      return;
    }

    const questions = JSON.parse(assessment.questions_json || '[]');
    // For students, sanitize questions so they do not see the correctIndex beforehand
    const isStudent = req.user?.role === 'STUDENT';
    const sanitizedQuestions = questions.map((q: any) => {
      if (isStudent) {
        const { correctIndex, diagnosticHint, ...rest } = q;
        return rest;
      }
      return q;
    });

    let previousSubmission: any = null;
    if (req.user) {
      previousSubmission = await queryOne<any>(
        'SELECT * FROM student_submissions WHERE student_id = ? AND assessment_id = ? ORDER BY submitted_at DESC',
        [req.user.id, assessment.id]
      );
    }

    res.json({
      assessment: {
        id: assessment.id,
        courseId: course.id,
        courseTitle: course.title,
        title: assessment.title,
        description: assessment.description,
        passingScore: assessment.passing_score,
        questions: sanitizedQuestions,
        performanceTask: JSON.parse(assessment.performance_task_json || '{}')
      },
      previousSubmission: previousSubmission
        ? {
            id: previousSubmission.id,
            autoScore: previousSubmission.auto_score,
            status: previousSubmission.status,
            artifactTitle: previousSubmission.artifact_title,
            artifactDescription: previousSubmission.artifact_description,
            teacherGrade: previousSubmission.teacher_grade,
            teacherFeedback: previousSubmission.teacher_feedback,
            submittedAt: previousSubmission.submitted_at
          }
        : null
    });
  } catch (err: any) {
    console.error('Fetch assessment error:', err);
    res.status(500).json({ error: { message: 'Failed to load assessment.' } });
  }
});

// POST submit milestone assessment
assessmentRouter.post('/:courseId/submit', authenticate, requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { answers, artifactTitle, artifactDescription, artifactUrl } = req.body;
    const studentId = req.user!.id;

    const course = await queryOne<any>('SELECT id FROM courses WHERE id = ? OR slug = ?', [courseId, courseId]);
    if (!course) {
      res.status(404).json({ error: { message: 'Course not found.' } });
      return;
    }

    const assessment = await queryOne<any>('SELECT * FROM milestone_assessments WHERE course_id = ?', [course.id]);
    if (!assessment) {
      res.status(404).json({ error: { message: 'Assessment not found.' } });
      return;
    }

    const questions: any[] = JSON.parse(assessment.questions_json || '[]');
    let correctCount = 0;
    const questionFeedback: any[] = [];

    questions.forEach((q, idx) => {
      const studentChoice = answers?.[q.id] ?? answers?.[idx];
      const isCorrect = studentChoice === q.correctIndex;
      if (isCorrect) correctCount++;

      questionFeedback.push({
        questionId: q.id,
        prompt: q.prompt,
        studentChoice,
        correctIndex: q.correctIndex,
        isCorrect,
        explanation: isCorrect ? 'Great deduction!' : q.diagnosticHint
      });
    });

    const autoScore = Math.round((correctCount / Math.max(questions.length, 1)) * 100);
    const submissionId = uuidv4();
    const now = new Date().toISOString();

    await execute(
      `INSERT INTO student_submissions (
        id, student_id, assessment_id, course_id, auto_score, status,
        artifact_url, artifact_title, artifact_description, answers_json,
        teacher_grade, teacher_feedback, reviewed_by_id, reviewed_at, submitted_at
      ) VALUES (?, ?, ?, ?, ?, 'PENDING_TEACHER_REVIEW', ?, ?, ?, ?, NULL, NULL, NULL, NULL, ?)`,
      [
        submissionId,
        studentId,
        assessment.id,
        course.id,
        autoScore,
        artifactUrl || '',
        artifactTitle || 'Creative Project Submission',
        artifactDescription || '',
        JSON.stringify(answers || {}),
        now
      ]
    );

    await logAudit(studentId, req.user!.role, 'SUBMIT_ASSESSMENT', 'student_submissions', submissionId, req.ip || '127.0.0.1');

    res.json({
      submissionId,
      autoScore,
      passed: autoScore >= assessment.passing_score,
      status: 'PENDING_TEACHER_REVIEW',
      questionFeedback,
      message: 'Assessment submitted successfully! Your teacher will review your creative artifact.'
    });
  } catch (err: any) {
    console.error('Submit assessment error:', err);
    res.status(500).json({ error: { message: 'Failed to process assessment submission.' } });
  }
});
