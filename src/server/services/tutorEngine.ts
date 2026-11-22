import { sanitizeKidInput } from '../middleware/coppa.js';
import { config } from '../config.js';

export interface TutorContext {
  studentAge: number;
  ageTrack: 'early_childhood_6_9' | 'middle_school_10_13' | 'high_school_14_17';
  passionTrack: string;
  courseTitle: string;
  lessonNumber: number;
  lessonTitle: string;
  objective: string;
  keyConcepts: string[];
  allowedVocab: string[];
  analogies: string[];
  activeModality: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface StreamEvent {
  event: 'start' | 'token' | 'suggestion' | 'safety_pivot' | 'done';
  data: any;
}

export class SocraticTutorEngine {
  /**
   * Screen input for prompt injection, jailbreaks, and unsafe queries
   */
  static inspectSafety(userPrompt: string): { safe: boolean; reason?: string; pivotMessage?: string } {
    const text = userPrompt.toLowerCase();

    // Injection / jailbreak signatures
    const jailbreakPatterns = [
      /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
      /you\s+are\s+now\s+in\s+dan\s+mode/i,
      /bypass\s+safety/i,
      /system\s*override/i,
      /act\s+as\s+an\s+unfiltered/i,
      /give\s+me\s+the\s+system\s+prompt/i,
      /disregard\s+all\s+rules/i
    ];

    for (const pattern of jailbreakPatterns) {
      if (pattern.test(text)) {
        return {
          safe: false,
          reason: 'PROMPT_INJECTION',
          pivotMessage: "Nice try, but my quest logs are locked onto today's lesson! 🎮 Let's stay on mission. What part of the concept can we explore together?"
        };
      }
    }

    // Unsafe / harmful themes
    const harmPatterns = [
      /\b(suicide|kill\s+myself|self\s*harm|hurt\s+myself)\b/i,
      /\b(bomb|weapon|explosive|make\s+drugs)\b/i,
      /\b(hate\s+speech|slur)\b/i
    ];

    for (const pattern of harmPatterns) {
      if (pattern.test(text)) {
        return {
          safe: false,
          reason: 'SAFETY_VIOLATION',
          pivotMessage: "Your safety and well-being come first. Please talk to a parent, teacher, or trusted adult who can support you right now. 💙"
        };
      }
    }

    return { safe: true };
  }

  /**
   * Determine persona based on age and track
   */
  static getPersonaDetails(ageTrack: string) {
    if (ageTrack === 'early_childhood_6_9') {
      return {
        name: 'Pip the Learning Buddy',
        tone: 'playful, encouraging, uses simple words and warm metaphors like toys or snacks',
        maxWords: 50,
        avatarEmoji: '🌟'
      };
    } else if (ageTrack === 'high_school_14_17') {
      return {
        name: 'Atlas the Studio Mentor',
        tone: 'scholarly, intellectual peer, first-principles reasoning and structural insights',
        maxWords: 140,
        avatarEmoji: '🏛️'
      };
    } else {
      return {
        name: 'Nova the Quest Guide',
        tone: 'energetic gaming ally, connects topics to game design, creative mechanics, and puzzles',
        maxWords: 85,
        avatarEmoji: '🚀'
      };
    }
  }

  /**
   * Generate intelligent, age-adaptive Socratic response
   */
  static generateResponse(context: TutorContext, userMessage: string): {
    reply: string;
    suggestions: string[];
    isDirectAnswerBlocked: boolean;
  } {
    const cleanPrompt = sanitizeKidInput(userMessage);
    const persona = this.getPersonaDetails(context.ageTrack);
    const lower = cleanPrompt.toLowerCase();

    // Check if user is asking for direct homework / test answer
    const directAnswerPlea =
      lower.includes('give me the answer') ||
      lower.includes('what is the answer') ||
      lower.includes('just tell me') ||
      lower.includes('solve this for me') ||
      lower.includes('do my test');

    if (directAnswerPlea) {
      if (context.ageTrack === 'early_childhood_6_9') {
        return {
          reply: `I could tell you, but solving it yourself is where the magic happens! ✨ Think about ${context.analogies[0] || 'our lesson puzzle'}. What happens if you try looking at the first clue?`,
          suggestions: ['Tell me the first clue', 'Can you explain the main idea again?', 'I need a small hint!'],
          isDirectAnswerBlocked: true
        };
      } else if (context.ageTrack === 'high_school_14_17') {
        return {
          reply: `Direct answers bypass the neural pattern formation you're building! Let's break down the underlying axiom instead: in ${context.lessonTitle}, what constraint is driving the relationship between ${context.keyConcepts[0] || 'these variables'} and ${context.keyConcepts[1] || 'the outcome'}?`,
          suggestions: ['Walk me through the first step', 'Show an analogous example', 'What formula applies here?'],
          isDirectAnswerBlocked: true
        };
      } else {
        return {
          reply: `Hey, giving you the answer would rob you of leveling up! 🎮 In ${context.courseTitle}, every challenge gives you XP. Let's look at ${context.analogies[0] || 'the core rule'}: what is the first move you would make?`,
          suggestions: ['Give me a hint for move 1', 'How does this connect to game rules?', 'Let us test a small example'],
          isDirectAnswerBlocked: true
        };
      }
    }

    // Contextual responses based on lesson concepts
    const primaryConcept = context.keyConcepts[0] || 'the core concept';
    const primaryAnalogy = context.analogies[0] || 'a puzzle piece';

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('help')) {
      if (context.ageTrack === 'early_childhood_6_9') {
        return {
          reply: `Hi friend! I'm Pip! 🌟 We're learning all about ${context.lessonTitle}. Have you checked out ${context.objective}? What looks the most fun to you?`,
          suggestions: [`What is ${primaryConcept}?`, 'Let us do an activity!', 'Can you show me a picture?'],
          isDirectAnswerBlocked: false
        };
      } else if (context.ageTrack === 'high_school_14_17') {
        return {
          reply: `Greetings! I am Atlas, your mentor for ${context.courseTitle}. We are examining ${context.lessonTitle}. Which component of ${context.objective} shall we analyze from first principles?`,
          suggestions: [`How does ${primaryConcept} work?`, 'Explain the architectural trade-offs', 'Connect this to a real-world project'],
          isDirectAnswerBlocked: false
        };
      } else {
        return {
          reply: `Welcome back to the quest! 🚀 I'm Nova. Today's objective in ${context.lessonTitle} is: ${context.objective}. Ready to unlock some skills?`,
          suggestions: [`What does ${primaryConcept} mean?`, `How is this like ${primaryAnalogy}?`, 'Let us solve a challenge'],
          isDirectAnswerBlocked: false
        };
      }
    }

    // Socratic response connecting to concept & passion track
    if (context.ageTrack === 'early_childhood_6_9') {
      return {
        reply: `That's a great thought! 🎨 Imagine ${primaryAnalogy}. If you look closely at ${primaryConcept}, what do you notice changes when we adjust it?`,
        suggestions: ['It gets bigger/brighter', 'It stays the same', 'Show me another clue'],
        isDirectAnswerBlocked: false
      };
    } else if (context.ageTrack === 'high_school_14_17') {
      return {
        reply: `Interesting hypothesis. Consider how ${primaryConcept} intersects with your ${context.passionTrack} domain. If you modify the underlying variable, how does that impact the equilibrium of the system?`,
        suggestions: ['It shifts the balance', 'Can you give a concrete formula?', 'How would an industry expert approach this?'],
        isDirectAnswerBlocked: false
      };
    } else {
      return {
        reply: `Awesome angle to explore! 🎯 Think of ${primaryConcept} like ${primaryAnalogy}. If you were designing this level or art piece, how would this rule help your player?`,
        suggestions: ['It creates a pattern', 'It makes the score go up', 'Can you test my idea?'],
        isDirectAnswerBlocked: false
      };
    }
  }

  /**
   * Stream response tokens via generator
   */
  static async *streamTutorResponse(
    context: TutorContext,
    userPrompt: string
  ): AsyncGenerator<StreamEvent, void, unknown> {
    const safety = this.inspectSafety(userPrompt);
    const persona = this.getPersonaDetails(context.ageTrack);

    yield {
      event: 'start',
      data: {
        tutorPersona: persona.name,
        tone: persona.tone,
        avatarEmoji: persona.avatarEmoji,
        activeLesson: context.lessonTitle
      }
    };

    if (!safety.safe) {
      yield {
        event: 'safety_pivot',
        data: { reason: safety.reason }
      };

      const pivotWords = (safety.pivotMessage || '').split(' ');
      for (const word of pivotWords) {
        yield {
          event: 'token',
          data: { token: word + ' ' }
        };
        await new Promise((r) => setTimeout(r, 25));
      }

      yield {
        event: 'suggestion',
        data: { suggestions: ['Back to the lesson', 'Explain the goal', 'What is our first step?'] }
      };

      yield { event: 'done', data: { completed: true } };
      return;
    }

    const { reply, suggestions, isDirectAnswerBlocked } = this.generateResponse(context, userPrompt);
    const words = reply.split(' ');

    for (const word of words) {
      yield {
        event: 'token',
        data: { token: word + ' ' }
      };
      // Smooth streaming delay
      await new Promise((r) => setTimeout(r, 30));
    }

    yield {
      event: 'suggestion',
      data: { suggestions, isDirectAnswerBlocked }
    };

    yield {
      event: 'done',
      data: { completed: true, wordCount: words.length }
    };
  }
}
