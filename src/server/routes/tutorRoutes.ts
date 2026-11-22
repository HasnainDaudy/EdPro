import { Router, Request, Response } from 'express';
import { queryOne } from '../db/database.js';
import { SocraticTutorEngine, TutorContext } from '../services/tutorEngine.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

export const tutorRouter = Router();

// SSE Streaming endpoint for real-time Socratic Tutor chat
tutorRouter.post('/chat/stream', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { message, courseId, lessonNumber, activeModality = 'reader', conversationHistory = [] } = req.body;

    if (!message) {
      res.status(400).json({ error: { message: 'Message prompt is required.' } });
      return;
    }

    // Hydrate student profile
    const studentAge = req.user?.age || 10;
    const ageTrack = (req.user?.ageTrack as any) || (studentAge <= 9 ? 'early_childhood_6_9' : studentAge >= 14 ? 'high_school_14_17' : 'middle_school_10_13');
    const passionTrack = req.user?.passionTrack || 'visual_arts';

    // Hydrate curriculum context
    let courseTitle = 'Personalized Learning Track';
    let lessonTitle = 'Core Concept Exploration';
    let objective = 'Master the foundational skills and apply creative intuition.';
    let keyConcepts = ['Foundational Principles', 'Creative Expression'];
    let allowedVocab = ['Concept', 'Design', 'Pattern'];
    let analogies = ['A puzzle piece waiting to click into place'];

    if (courseId && lessonNumber) {
      const course = await queryOne<any>('SELECT title FROM courses WHERE id = ? OR slug = ?', [courseId, courseId]);
      if (course) courseTitle = course.title;

      const lesson = await queryOne<any>(
        'SELECT title, objective, key_concepts_json, allowed_vocab_json, analogies_json FROM lessons WHERE (course_id = ? OR course_id IN (SELECT id FROM courses WHERE slug = ?)) AND lesson_number = ?',
        [courseId, courseId, parseInt(lessonNumber, 10)]
      );

      if (lesson) {
        lessonTitle = lesson.title;
        objective = lesson.objective;
        keyConcepts = JSON.parse(lesson.key_concepts_json || '[]');
        allowedVocab = JSON.parse(lesson.allowed_vocab_json || '[]');
        analogies = JSON.parse(lesson.analogies_json || '[]');
      }
    }

    const context: TutorContext = {
      studentAge,
      ageTrack,
      passionTrack,
      courseTitle,
      lessonNumber: parseInt(lessonNumber, 10) || 1,
      lessonTitle,
      objective,
      keyConcepts,
      allowedVocab,
      analogies,
      activeModality,
      conversationHistory
    };

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    for await (const event of SocraticTutorEngine.streamTutorResponse(context, message)) {
      res.write(`event: ${event.event}\ndata: ${JSON.stringify(event.data)}\n\n`);
    }

    res.end();
  } catch (err: any) {
    console.error('Tutor stream error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: { message: 'Tutor streaming service error.' } });
    } else {
      res.end();
    }
  }
});

// Synchronous fallback endpoint
tutorRouter.post('/chat', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { message, courseId, lessonNumber, activeModality = 'reader', conversationHistory = [] } = req.body;

    if (!message) {
      res.status(400).json({ error: { message: 'Message prompt is required.' } });
      return;
    }

    const studentAge = req.user?.age || 10;
    const ageTrack = (req.user?.ageTrack as any) || (studentAge <= 9 ? 'early_childhood_6_9' : studentAge >= 14 ? 'high_school_14_17' : 'middle_school_10_13');
    const passionTrack = req.user?.passionTrack || 'visual_arts';

    let courseTitle = 'Personalized Learning Track';
    let lessonTitle = 'Core Concept Exploration';
    let objective = 'Master the foundational skills and apply creative intuition.';
    let keyConcepts = ['Foundational Principles', 'Creative Expression'];
    let allowedVocab = ['Concept', 'Design', 'Pattern'];
    let analogies = ['A puzzle piece waiting to click into place'];

    if (courseId && lessonNumber) {
      const course = await queryOne<any>('SELECT title FROM courses WHERE id = ? OR slug = ?', [courseId, courseId]);
      if (course) courseTitle = course.title;

      const lesson = await queryOne<any>(
        'SELECT title, objective, key_concepts_json, allowed_vocab_json, analogies_json FROM lessons WHERE (course_id = ? OR course_id IN (SELECT id FROM courses WHERE slug = ?)) AND lesson_number = ?',
        [courseId, courseId, parseInt(lessonNumber, 10)]
      );

      if (lesson) {
        lessonTitle = lesson.title;
        objective = lesson.objective;
        keyConcepts = JSON.parse(lesson.key_concepts_json || '[]');
        allowedVocab = JSON.parse(lesson.allowed_vocab_json || '[]');
        analogies = JSON.parse(lesson.analogies_json || '[]');
      }
    }

    const context: TutorContext = {
      studentAge,
      ageTrack,
      passionTrack,
      courseTitle,
      lessonNumber: parseInt(lessonNumber, 10) || 1,
      lessonTitle,
      objective,
      keyConcepts,
      allowedVocab,
      analogies,
      activeModality,
      conversationHistory
    };

    const safety = SocraticTutorEngine.inspectSafety(message);
    if (!safety.safe) {
      res.json({
        reply: safety.pivotMessage,
        suggestions: ['Back to the lesson', 'Tell me what to look for'],
        isDirectAnswerBlocked: false,
        safetyPivot: true
      });
      return;
    }

    const result = SocraticTutorEngine.generateResponse(context, message);
    const persona = SocraticTutorEngine.getPersonaDetails(ageTrack);

    res.json({
      tutorPersona: persona.name,
      tone: persona.tone,
      avatarEmoji: persona.avatarEmoji,
      activeLesson: lessonTitle,
      ...result
    });
  } catch (err: any) {
    console.error('Tutor chat error:', err);
    res.status(500).json({ error: { message: 'Tutor service error.' } });
  }
});

// GET contextual starter hints
tutorRouter.get('/suggested-prompts', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId, lessonNumber } = req.query;
    if (!courseId || !lessonNumber) {
      res.json({
        suggestions: [
          'What is the big idea of this topic?',
          'How can I connect this to what I like?',
          'Give me a clue on where to start'
        ]
      });
      return;
    }

    const lesson = await queryOne<any>(
      'SELECT title, key_concepts_json, analogies_json FROM lessons WHERE (course_id = ? OR course_id IN (SELECT id FROM courses WHERE slug = ?)) AND lesson_number = ?',
      [courseId, courseId, parseInt(lessonNumber as string, 10)]
    );

    if (!lesson) {
      res.json({
        suggestions: ['How does this lesson work?', 'Can you give me an analogy?', 'What is our main challenge?']
      });
      return;
    }

    const keyConcepts = JSON.parse(lesson.key_concepts_json || '[]');
    const primary = keyConcepts[0] || 'the core concept';

    res.json({
      suggestions: [
        `How does ${primary} work?`,
        'Can you give me a real-world example?',
        'I am stuck on this step—can you guide me?'
      ]
    });
  } catch (err: any) {
    console.error('Tutor suggestions error:', err);
    res.status(500).json({ error: { message: 'Failed to generate suggestions.' } });
  }
});
