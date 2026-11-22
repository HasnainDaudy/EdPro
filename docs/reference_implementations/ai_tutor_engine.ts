/**
 * EdPro Context-Aware AI Tutor Engine & Guardrail Architecture
 * Human-crafted, production-grade implementation for K-12 personalized learning.
 */

export type AgeTrack = 'early_childhood_6_9' | 'middle_school_10_13' | 'high_school_14_17';

export interface FormativeCheck {
  questionId: string;
  questionPrompt: string;
  correctAnswer: string;
  attemptCount: number;
  lastFailedAnswer?: string;
  diagnosticHint: string;
}

export interface TutorContextEnvelope {
  student: {
    id: string;
    displayName: string;
    age: number;
    ageTrack: AgeTrack;
    passionCluster: string;
  };
  curriculum: {
    courseId: string;
    courseTitle: string;
    moduleId: string;
    moduleTitle: string;
    lessonId: string;
    lessonNumber: number;
    lessonTitle: string;
    lessonObjective: string;
    keyConcepts: string[];
    allowedVocabulary: string[];
    outOfScopeConcepts: string[];
    pedagogicalAnalogies: string[];
  };
  activeWorkspaceState: {
    activeModality: 'video' | 'reader' | 'simulation' | 'practice' | 'milestone';
    focusedElementId?: string;
    lastStudentAction?: string;
    activeFormativeCheck?: FormativeCheck;
  };
  conversationHistory: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
  }>;
}

export interface StreamChunk {
  type: 'token' | 'thought' | 'suggestion' | 'safety_pivot' | 'done';
  content?: string;
  suggestedFollowUps?: string[];
  metadata?: Record<string, unknown>;
}

// ============================================================================
// 1. SAFETY & GUARDRAIL SUBSYSTEMS
// ============================================================================

export class KidSafetyFilter {
  private static readonly PII_PATTERNS = {
    email: /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/gi,
    phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    ssn: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g,
    address: /\b\d+\s+([a-zA-Z]+\s+){1,3}(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b/gi,
  };

  public static redactPII(input: string): { sanitized: string; piiDetected: boolean } {
    let sanitized = input;
    let piiDetected = false;

    for (const [key, regex] of Object.entries(this.PII_PATTERNS)) {
      if (regex.test(sanitized)) {
        piiDetected = true;
        sanitized = sanitized.replace(regex, `[REDACTED_${key.toUpperCase()}]`);
      }
    }

    return { sanitized, piiDetected };
  }
}

export class JailbreakGuard {
  private static readonly INJECTION_TRIGGERS: RegExp[] = [
    /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions|prompts|rules)/i,
    /you\s+are\s+now\s+(unrestricted|in\s+developer\s+mode|dan|jailbroken)/i,
    /disregard\s+system\s+prompt/i,
    /system\s*override/i,
    /bypass\s+(safety|content)\s+filter/i,
    /pretend\s+you\s+have\s+no\s+rules/i,
    /roleplay\s+as\s+an\s+evil/i,
    /reveal\s+your\s+(initial|system)\s+(instructions|prompt)/i,
    /<\/?system>/i,
    /```(json|markdown)?\s*\{\s*"system"/i,
  ];

  public static isInjectionAttempt(text: string): boolean {
    return this.INJECTION_TRIGGERS.some((pattern) => pattern.test(text));
  }
}

export class SocraticGuard {
  private static readonly ANSWER_BEGGING_TRIGGERS: RegExp[] = [
    /\b(give|tell)\s+me\s+the\s+answer\b/i,
    /\bwhat\s+is\s+the\s+answer\b/i,
    /\bjust\s+tell\s+me\b/i,
    /\bwhich\s+option\s+is\s+correct\b/i,
    /\bis\s+it\s+a\b|\bis\s+it\s+b\b|\bis\s+it\s+c\b|\bis\s+it\s+d\b/i,
    /\bdo\s+my\s+homework\b/i,
    /\bsolve\s+this\s+for\s+me\b/i,
  ];

  public static isAnswerExtraction(text: string): boolean {
    return this.ANSWER_BEGGING_TRIGGERS.some((p) => p.test(text));
  }
}

// ============================================================================
// 2. AGE-ADAPTIVE PERSONA & PROMPT BUILDER
// ============================================================================

export class SystemPromptBuilder {
  public static build(context: TutorContextEnvelope): string {
    const { student, curriculum } = context;

    switch (student.ageTrack) {
      case 'early_childhood_6_9':
        return `You are "Pip", a warm, enthusiastic learning buddy helping a 7-9 year old child (Age: ${student.age}).
Topic: "${curriculum.lessonTitle}".
Active Concepts: ${curriculum.keyConcepts.join(', ')}.

GUIDELINES:
1. Max 2-3 short, simple sentences. Use cheerful vocabulary and 1-2 friendly emojis (🌟, 🚀, 🎨).
2. Use sensory, tangible analogies (sharing cookies, building blocks, finger painting).
3. Celebrate their effort!
4. NEVER provide direct answers to quiz or puzzle questions. Always ask one simple, encouraging question to help them figure it out.
5. If they drift off-topic, gently guide them back to ${curriculum.lessonTitle}.`;

      case 'middle_school_10_13':
        return `You are "Nova", an upbeat, sharp quest guide and learning coach for a middle school student (Age: ${student.age}).
Topic: "${curriculum.lessonTitle}".
Student Passion Cluster: "${student.passionCluster}".
Active Concepts: ${curriculum.keyConcepts.join(', ')}.

GUIDELINES:
1. Speak like an inspiring creative coach or game guild leader. Avoid dry textbook jargon.
2. Max 2 short paragraphs (<90 words).
3. Connect concepts to ${student.passionCluster} (e.g. game physics, character coordinates, animations).
4. Socratic Invariant: Never give away the answer to any problem. Break challenges into smaller steps.
5. End every response with ONE specific guiding question.`;

      case 'high_school_14_17':
      default:
        return `You are "Atlas", an intellectual studio mentor guiding a high school scholar (Age: ${student.age}).
Course: "${curriculum.courseTitle}" | Topic: "${curriculum.lessonTitle}".
Learning Objective: ${curriculum.lessonObjective}.
Core Concepts: ${curriculum.keyConcepts.join(', ')}.

GUIDELINES:
1. Maintain a collegiate, respectful tone. Treat the student as an emerging practitioner.
2. Concise, structured responses (<140 words). Use clean markdown formatting.
3. Socratic Method: Probe understanding, pose counter-examples, and guide first-principles reasoning.
4. Refuse requests to solve homework or coding exercises directly; provide analogical micro-problems instead.`;
    }
  }
}

// ============================================================================
// 3. PLUGGABLE PROVIDER ABSTRACTION
// ============================================================================

export interface AITutorProvider {
  readonly id: string;
  readonly name: string;
  readonly isAvailable: boolean;

  streamChat(
    context: TutorContextEnvelope,
    userMessage: string
  ): AsyncIterable<StreamChunk>;

  generateChat(
    context: TutorContextEnvelope,
    userMessage: string
  ): Promise<{
    message: string;
    suggestedFollowUps: string[];
  }>;
}

/**
 * Intelligent Mock Provider:
 * Zero API keys required. Realistic streaming, intent matching, and Socratic scaffolding.
 */
export class MockTutorProvider implements AITutorProvider {
  public readonly id = 'mock';
  public readonly name = 'EdPro Built-in Mock Engine';
  public readonly isAvailable = true;

  public async *streamChat(
    context: TutorContextEnvelope,
    userMessage: string
  ): AsyncIterable<StreamChunk> {
    const response = await this.generateChat(context, userMessage);
    const tokens = response.message.split(' ');

    for (const token of tokens) {
      await new Promise((resolve) => setTimeout(resolve, 35)); // 35ms token cadence
      yield {
        type: 'token',
        content: token + ' ',
      };
    }

    if (response.suggestedFollowUps.length > 0) {
      yield {
        type: 'suggestion',
        suggestedFollowUps: response.suggestedFollowUps,
      };
    }

    yield { type: 'done' };
  }

  public async generateChat(
    context: TutorContextEnvelope,
    userMessage: string
  ): Promise<{ message: string; suggestedFollowUps: string[] }> {
    const { student, curriculum, activeWorkspaceState } = context;
    const lower = userMessage.toLowerCase().trim();

    // 1. Answer-begging handler
    if (SocraticGuard.isAnswerExtraction(lower)) {
      if (student.ageTrack === 'early_childhood_6_9') {
        return {
          message: `I bet you can solve this puzzle yourself! 🌟 Think about what happens when your character steps forward. What direction is that?`,
          suggestedFollowUps: ["To the right!", "Up in the air", "Show me a hint"],
        };
      }
      return {
        message: `I could tell you, but that would spoil your victory! 🎮 Let's break it down: look at the horizontal line (the X-axis). If moving right is positive, what direction is left?`,
        suggestedFollowUps: ["Left is negative (-)", "Left is positive (+)", "Can you give another hint?"],
      };
    }

    // 2. Greetings
    if (/^(hi|hello|hey|greetings)/i.test(lower)) {
      if (student.ageTrack === 'early_childhood_6_9') {
        return {
          message: `Hi ${student.displayName}! 🌟 I'm Pip! Ready to explore ${curriculum.lessonTitle}? What should we look at first?`,
          suggestedFollowUps: ["Show me the video", "Let's play the game", "What are we learning?"],
        };
      }
      return {
        message: `Hey ${student.displayName}! I'm Nova, your guide for ${curriculum.lessonTitle}. We're exploring ${curriculum.keyConcepts.join(' and ')}. What part of the level are you on?`,
        suggestedFollowUps: ["How do coordinates work?", "Help with negative numbers", "Explain vectors"],
      };
    }

    // 3. Misconception / Active Formative Check context
    if (activeWorkspaceState.activeFormativeCheck && (lower.includes('negative') || lower.includes('zero') || lower.includes('y'))) {
      return {
        message: `Great observation! Imagine ground level is Y = 0. When Mario falls down into a pit below the ground, does his number get bigger or smaller than zero?`,
        suggestedFollowUps: ["Smaller than zero (negative)", "Bigger than zero", "It stays at zero"],
      };
    }

    // 4. Default pedagogical response
    return {
      message: `That's a thoughtful question about ${curriculum.lessonTitle}. In ${student.passionCluster}, understanding ${curriculum.keyConcepts[0] || 'this concept'} unlocks new creative powers! What do you notice when you adjust the controls?`,
      suggestedFollowUps: ["The character moves faster", "The position changes", "Can you explain step 2?"],
    };
  }
}

// ============================================================================
// 4. UNIFIED ENGINE CONTROLLER
// ============================================================================

export class AITutorEngine {
  private provider: AITutorProvider;

  constructor(provider?: AITutorProvider) {
    this.provider = provider || new MockTutorProvider();
  }

  public setProvider(provider: AITutorProvider): void {
    this.provider = provider;
  }

  public async *processStudentStream(
    context: TutorContextEnvelope,
    rawMessage: string
  ): AsyncIterable<StreamChunk> {
    // 1. PII Redaction
    const { sanitized, piiDetected } = KidSafetyFilter.redactPII(rawMessage);

    // 2. Jailbreak and Injection Detection
    if (JailbreakGuard.isInjectionAttempt(sanitized)) {
      yield {
        type: 'safety_pivot',
        content: `I'm strictly focused on coaching you through ${context.curriculum.lessonTitle}! 🛡️ Let's stay on track. What part of the lesson should we tackle?`,
        suggestedFollowUps: ["Review lesson concept", "Show me a practice hint"],
      };
      yield { type: 'done' };
      return;
    }

    // 3. Delegate to provider
    yield* this.provider.streamChat(context, sanitized);
  }
}
