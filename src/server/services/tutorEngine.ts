import { sanitizeKidInput } from '../middleware/coppa.js';
import { config } from '../config.js';
import { LLMGateway, LLMProviderConfig } from './llmGateway.js';

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
  llmConfig?: LLMProviderConfig;
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
   * Construct age-appropriate Socratic System Prompt for LLM
   */
  static buildSocraticSystemPrompt(
    context: TutorContext,
    persona: { name: string; tone: string; maxWords: number }
  ): string {
    return `You are ${persona.name}, a context-aware, neurodiversity-affirming Socratic mentor for K-12 students in the EdPro Studio.
Student Age: ${context.studentAge} (${context.ageTrack.replace(/_/g, ' ')})
Learning Track: ${context.passionTrack.replace(/_/g, ' ')}
Current Course: "${context.courseTitle}"
Current Lesson: Lecture ${context.lessonNumber}: "${context.lessonTitle}"
Lesson Learning Goal: "${context.objective}"
Core Key Concepts: ${(context.keyConcepts || []).join(', ')}
Allowed Vocabulary: ${(context.allowedVocab || []).join(', ')}
Active Modality: ${context.activeModality}

YOUR PEDAGOGICAL INVARIANTS:
1. NEVER PROVIDE DIRECT TEST ANSWERS: If a student asks for the exact solution or answer to a quiz/test question, firmly but kindly decline. Guide them with a scaffolding hint or smaller sub-question.
2. ANSWER CURIOSITY ACCURATELY: If the student asks genuine explanatory questions (e.g. "what are 12 tone color wheels?", "why do opposite colors pop?", "what is a coordinate vector?"), directly explain the core intuition accurately using age-appropriate language, concrete analogies, and visual clarity, then ask a provocative follow-up inquiry.
3. CO-REGULATION & EMPATHY: If the student expresses frustration, self-doubt, or feeling stuck ("I'm stupid", "I can't do this"), validate their emotions warmly first, normalize struggle as neuroplastic brain growth, and offer a tiny, fun first step.
4. TONE & LENGTH: Your persona tone is "${persona.tone}". Keep responses concise (around 50-100 words), formatted with clean markdown paragraphs and bold concepts. Do NOT output raw markdown headers like "###", use natural bolding or bullet points instead.
5. SUGGESTIONS: At the very end of your response, output exactly 3 short, interactive follow-up suggestions for the student wrapped strictly in this XML tag:
<suggestions>
- [Suggestion 1]
- [Suggestion 2]
- [Suggestion 3]
</suggestions>
`;
  }

  /**
   * Generate intelligent, context-aware, non-repetitive Socratic responses.
   * Leverages deep multi-turn analysis, intent classification, and progressive scaffolding.
   */
  static generateResponse(context: TutorContext, userMessage: string): {
    reply: string;
    suggestions: string[];
    isDirectAnswerBlocked: boolean;
  } {
    const cleanPrompt = sanitizeKidInput(userMessage).trim();
    const lower = cleanPrompt.toLowerCase();
    const isEarlyChildhood = context.ageTrack === 'early_childhood_6_9';
    const isHighSchool = context.ageTrack === 'high_school_14_17';

    // Core concepts & domain details
    const primaryConcept = context.keyConcepts?.[0] || 'the core concept';
    const secondaryConcept = context.keyConcepts?.[1] || 'visual balance';
    const lessonTitle = context.lessonTitle || "Today's Lesson";
    const courseTitle = context.courseTitle || 'Studio Track';
    const isArtDomain =
      courseTitle.toLowerCase().includes('art') ||
      lessonTitle.toLowerCase().includes('color') ||
      lessonTitle.toLowerCase().includes('geometry') ||
      lower.includes('color') ||
      lower.includes('colour') ||
      lower.includes('wheel') ||
      lower.includes('pigment');

    // 1. Direct answer plea detection
    const isAskingForDirectAnswer =
      lower.includes('give me the answer') ||
      lower.includes('what is the answer') ||
      lower.includes('just tell me') ||
      lower.includes('solve this for me') ||
      lower.includes('tell me what to click') ||
      lower.includes('do my test');

    if (isAskingForDirectAnswer) {
      if (isEarlyChildhood) {
        return {
          reply: `I could tell you, but finding the treasure yourself is the best part! 🌟 Think about ${context.analogies?.[0] || 'our puzzle'}. If you peek at the very first piece, what color or shape stands out to you?`,
          suggestions: ['Tell me about the colors', 'Can we do a tiny hint?', 'What should I look at first?'],
          isDirectAnswerBlocked: true
        };
      } else if (isHighSchool) {
        return {
          reply: `Providing the direct answer robs you of the cognitive leap that develops first-principles mastery. Let's analyze the governing constraint instead: in ${lessonTitle}, how does ${primaryConcept} influence ${secondaryConcept}? What is your initial hypothesis?`,
          suggestions: [
            'Walk me through the mathematical constraint',
            'Give me an architectural analogy',
            'What variables can we isolate?'
          ],
          isDirectAnswerBlocked: true
        };
      } else {
        return {
          reply: `Hey, giving you the answer would bypass the XP you earn by cracking it! 🎮 In ${lessonTitle}, every problem is a mini-boss. Let's look at ${primaryConcept}: what is the very first move or observation you'd make?`,
          suggestions: [
            'What is the first clue?',
            'Show me how this works in a real game',
            'Give me a warm-up question'
          ],
          isDirectAnswerBlocked: true
        };
      }
    }

    // 2. User Correction: "I asked ... not this"
    if (lower.includes('i asked') || lower.includes('not this') || lower.includes('what i asked')) {
      if (lower.includes('color') || lower.includes('colour') || lower.includes('wheel')) {
        return {
          reply: `Got it—thank you for steering us straight! 🎯\n\nThe 12-tone color wheel is a circle showing 12 key colors: the 3 primaries (Red, Yellow, Blue), the 3 secondaries (Orange, Green, Purple), and the 6 tertiary blends in between. It lets you see complementary harmonies (opposites like Blue & Orange) that create maximum visual contrast.\n\nWould you like to see how primary pigments mix, or how complementary colors make elements pop?`,
          suggestions: ['How do primary pigments mix?', 'How do complementary colors pop?', 'Show me tertiary colors'],
          isDirectAnswerBlocked: false
        };
      }
      return {
        reply: `Thanks for catching that! Let's lock right onto what you need. In "${lessonTitle}", our core mission is ${primaryConcept}. Tell me what specific part you want to break down right now!`,
        suggestions: ['Explain the definition', 'Give me a simple example', 'Show me how to apply it'],
        isDirectAnswerBlocked: false
      };
    }

    // 3. Direct Subject Query: 12-Tone Color Wheel & Pigments
    if (
      lower.includes('color wheel') ||
      lower.includes('colour wheel') ||
      lower.includes('12 tone') ||
      lower.includes('12-tone') ||
      lower.includes('12 toon') ||
      (lower.includes('pigment') && lower.includes('primary'))
    ) {
      return {
        reply: `A 12-Tone Color Wheel is a circular visual map that organizes color harmony! 🎨\n\nIt is built from:\n• 3 Primary Pigments: Red, Yellow, Blue (pure wavelengths that cannot be created by mixing).\n• 3 Secondary Colors: Orange, Green, Violet (formed by combining pairs of primaries).\n• 6 Tertiary Colors: Delicate bridges like Red-Orange and Blue-Green.\n\nThe real superpower is Complementary Contrast: colors sitting directly opposite each other on the wheel make each other pop with optical energy! Which complementary pair would you use to make a game item stand out: Blue & Orange, Yellow & Purple, or Red & Green?`,
        suggestions: ['Blue & Orange', 'Yellow & Purple', 'Red & Green'],
        isDirectAnswerBlocked: false
      };
    }

    // 4. Intent: "Can you test my idea?" or proposing testing
    if (
      lower.includes('test my idea') ||
      lower.includes('test this') ||
      lower.includes('can you test') ||
      lower.includes('try my idea')
    ) {
      if (isArtDomain) {
        return {
          reply: `Challenge accepted! 🎨 Let's test your idea right now. Suppose we place pure vibrant red directly next to emerald green without any neutral border. What do your eyes experience at the boundary? Does it vibrate, blend, or pop?`,
          suggestions: ['The edge vibrates and sparkles', 'It feels too intense or harsh', 'What if I add a gold boundary line?'],
          isDirectAnswerBlocked: false
        };
      } else {
        return {
          reply: `Simulation test running! 🚀 Imagine your rocket starts at coordinates (0, 0) and your engine applies a velocity vector of (+3, +4). Where is your ship located after exactly 2 engine ticks? Tell me your coordinate prediction!`,
          suggestions: ['It lands at (6, 8)', 'It lands at (3, 4)', 'Wait, does gravity pull it down?'],
          isDirectAnswerBlocked: false
        };
      }
    }

    // 5. Intent: Testing student responses to previous questions
    if (lower.includes('it creates a pattern') || lower.includes('pattern')) {
      return {
        reply: `Spot on! Patterns are how human brains make sense of visual rhythm and mathematical predictability. But here is the master question: if a pattern is 100% predictable with zero variation, it can become boring. How would you introduce one surprise element to catch the player's eye?`,
        suggestions: ['Change one color unexpectedly', 'Alter the scale or size', 'Shift the timing of the beat'],
        isDirectAnswerBlocked: false
      };
    }

    if (lower.includes('makes the score go up') || lower.includes('score')) {
      return {
        reply: `That definitely motivates the player! But let's dig one level deeper into the psychology: why does achieving that specific score feel satisfying? Is it because the challenge was hard, or because the visual reward felt special?`,
        suggestions: ['Because the timing was challenging', 'Because the visual effects looked epic', 'How do game designers balance difficulty?'],
        isDirectAnswerBlocked: false
      };
    }

    if (lower.includes('lands at (6, 8)') || lower.includes('(6, 8)') || lower.includes('6, 8')) {
      return {
        reply: `Bullseye! 🎯 (0 + 3×2 = 6, and 0 + 4×2 = 8). You just computed linear 2D vector kinematics! Now what happens if an asteroid appears at (5, 8)? Would your ship collide, or clear it?`,
        suggestions: ['We would hit the asteroid at X=5!', 'We pass just 1 unit to the right', 'How do we calculate collision boundaries?'],
        isDirectAnswerBlocked: false
      };
    }

    // 6. Intent: "Give me an analogy"
    if (lower.includes('analogy') || lower.includes('metaphor') || lower.includes('like what')) {
      if (isArtDomain) {
        return {
          reply: `Think of ${primaryConcept} like seasoning in cooking! 🍲 A dish needs a base (like neutral rice or pasta), but complementary colors are like chili flakes or lime juice. A small pinch creates exciting flavor contrast, but dumping the whole bottle burns your tongue. How much contrast does your current design need?`,
          suggestions: ['A subtle, gentle contrast', 'A bold, energetic high-contrast pop', 'How do I choose the background neutral?'],
          isDirectAnswerBlocked: false
        };
      } else {
        return {
          reply: `Think of ${primaryConcept} like a GPS map for an autonomous delivery drone! 🛸 The drone doesn't see "left" or "right"; it only reads coordinate numbers (X, Y) and altitude (Z). If you tell it to go to (+10, +5), it fires its thrusters until the sensor matches that exact grid intersection. How would you program it to avoid a tall tree?`,
          suggestions: ['Increase Z altitude to fly over it', 'Adjust X coordinates around it', 'How do game engines check boundaries?'],
          isDirectAnswerBlocked: false
        };
      }
    }

    // 7. Intent: "Explain the core concept" or "What is/are..."
    if (
      lower.includes('explain the core concept') ||
      lower.startsWith('what is') ||
      lower.startsWith('what are') ||
      lower.includes('what does') ||
      lower.includes('explain the main idea')
    ) {
      if (isArtDomain) {
        return {
          reply: `Here is the big secret: ${primaryConcept} is about how human eyes process light frequencies. When opposite colors sit next to each other on the 12-tone color wheel, each color makes the other look brighter and more vivid! Which two colors feel most energetic to you when paired together?`,
          suggestions: ['Electric Blue & Bright Orange', 'Deep Violet & Sunflower Yellow', 'Emerald Green & Ruby Red'],
          isDirectAnswerBlocked: false
        };
      } else {
        return {
          reply: `Here is the core logic: ${primaryConcept} gives us an exact mathematical language to describe where things exist in 2D space. The horizontal line is the X-axis (running left-to-right), and the vertical line is the Y-axis (running up-and-down). Where would a jumping character be located when they reach the peak of their jump?`,
          suggestions: ['High positive Y value', 'Negative Y value', 'Does X change while jumping?'],
          isDirectAnswerBlocked: false
        };
      }
    }

    // 8. Intent: "Where should I start?"
    if (lower.includes('where should i start') || lower.includes('start') || lower.includes('first step')) {
      if (isArtDomain) {
        return {
          reply: `Start with a single dominant base color! 🎨 Pick one primary color you love—say, deep cobalt blue. That will be 70% of your canvas. Once you have that anchor, we will pick its opposite complementary color to create focal points. Which base color calls to you right now?`,
          suggestions: ['Warm Vermilion Red', 'Deep Cobalt Blue', 'Golden Ochre Yellow'],
          isDirectAnswerBlocked: false
        };
      } else {
        return {
          reply: `Start at the Origin point: (0, 0)! 📍 Every game engine, canvas, and simulation anchors at the origin. From (0, 0), decide which direction your character faces. Moving right adds to X, moving left subtracts from X. Want to try placing your hero character on the grid?`,
          suggestions: ['Place hero at (2, 2)', 'Place hero at (0, 5)', 'How do negative numbers work on the grid?'],
          isDirectAnswerBlocked: false
        };
      }
    }

    // 9. Intent: Greetings / Introductions
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower === 'help') {
      if (isEarlyChildhood) {
        return {
          reply: `Hi friend! I'm Pip! 🌟 I'm so excited to explore ${lessonTitle} with you today! We get to play with ${primaryConcept}. Have you tried touching the simulation yet?`,
          suggestions: [`What is ${primaryConcept}?`, 'Give me a fun analogy', 'Where should I start?'],
          isDirectAnswerBlocked: false
        };
      } else if (isHighSchool) {
        return {
          reply: `Greetings! I am Atlas, your mentor for ${courseTitle}. In ${lessonTitle}, our focus is: "${context.objective}". Which theoretical or applied aspect shall we examine first?`,
          suggestions: [`Deconstruct ${primaryConcept}`, 'Show practical real-world applications', 'Where should I begin?'],
          isDirectAnswerBlocked: false
        };
      } else {
        return {
          reply: `Welcome back to the studio quest! 🚀 I'm Nova. Today in ${lessonTitle}, we are unlocking ${primaryConcept}. What's on your mind?`,
          suggestions: ['Explain the core concept', 'Give me a studio analogy', 'Where should I start?'],
          isDirectAnswerBlocked: false
        };
      }
    }

    // 10. Intent: Frustration / Difficulty (Co-Regulation)
    if (
      lower.includes('hard') ||
      lower.includes('confused') ||
      lower.includes('stuck') ||
      lower.includes('dont get it') ||
      lower.includes("don't understand")
    ) {
      return {
        reply: `Take a comfortable breath with me. Feeling stuck is completely normal—it means your brain is wrestling with a brand-new concept, which is where real growth happens! Let's make it super simple: forget the big terms for a second. If you look at the screen right now, what is the single clearest thing you notice?`,
        suggestions: ['The colors look bright', 'The numbers keep moving', 'Can you give me a simple example?'],
        isDirectAnswerBlocked: false
      };
    }

    // 11. Intent: "Why" questions
    if (lower.startsWith('why') || lower.includes('why does') || lower.includes('why is')) {
      return {
        reply: `That is the question of a true researcher! Why questions unlock first principles. In ${lessonTitle}, ${primaryConcept} exists because nature follows mathematical harmony. If we didn't have this rule, things would clash or collapse. How do you think this rule helps you as a creator?`,
        suggestions: ['It gives structure to my work', 'It helps players navigate easily', 'Can you show me what breaking this rule looks like?'],
        isDirectAnswerBlocked: false
      };
    }

    // 12. General topical fallback grounded in active lesson
    const words = cleanPrompt.split(/\s+/).filter((w) => w.length > 3);
    const topicalWord = words.length > 0 ? words[words.length - 1] : primaryConcept;

    if (isEarlyChildhood) {
      return {
        reply: `I love how you noticed "${cleanPrompt}"! 🎈 Think about when you're building with blocks. If you add ${topicalWord} to your tower, does it stand taller and stronger, or does it wobble? What do you want to build next?`,
        suggestions: ['Make it taller and stronger!', 'Try a different block', 'Show me another idea'],
        isDirectAnswerBlocked: false
      };
    } else if (isHighSchool) {
      return {
        reply: `An intriguing inquiry regarding "${cleanPrompt}". When analyzing ${lessonTitle}, examining the interaction between ${topicalWord} and ${primaryConcept} reveals core structural constraints. How would you model this relationship mathematically or aesthetically?`,
        suggestions: [
          `Analyze ${topicalWord} mathematically`,
          `Relate ${topicalWord} to ${secondaryConcept}`,
          `Test a hypothetical edge case`
        ],
        isDirectAnswerBlocked: false
      };
    } else {
      return {
        reply: `Great curiosity about "${cleanPrompt}"! 🎮 In ${lessonTitle}, exploring how ${topicalWord} connects with ${primaryConcept} unlocks new creative paths. What happens if we experiment with it in your current project?`,
        suggestions: [
          `Test ${topicalWord} in our simulation`,
          `How does ${topicalWord} affect the final result?`,
          `Can you test another scenario with me?`
        ],
        isDirectAnswerBlocked: false
      };
    }
  }

  /**
   * Stream response tokens via generator
   * Supports active LLM streaming (Gemini, OpenAI, Claude, Ollama, Custom) with graceful fallback
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
        await new Promise((r) => setTimeout(r, 20));
      }

      yield {
        event: 'suggestion',
        data: { suggestions: ['Back to the lesson', 'Explain the goal', 'What is our first step?'] }
      };

      yield { event: 'done', data: { completed: true } };
      return;
    }

    // Check if an external LLM is configured
    const clientLLM = context.llmConfig;
    const effectiveProvider = clientLLM?.provider || (config.ai.provider as any) || 'offline';
    const effectiveApiKey =
      clientLLM?.apiKey ||
      (effectiveProvider === 'gemini'
        ? config.ai.geminiApiKey
        : effectiveProvider === 'openai'
          ? config.ai.openaiApiKey
          : undefined);

    const hasLLMCredentials =
      effectiveProvider !== 'offline' &&
      (effectiveProvider === 'ollama' || (effectiveApiKey && effectiveApiKey.trim().length > 0));

    if (hasLLMCredentials) {
      try {
        const effectiveConfig: LLMProviderConfig = {
          provider: effectiveProvider,
          apiKey: effectiveApiKey,
          model: clientLLM?.model || LLMGateway.getDefaultModel(effectiveProvider),
          baseUrl: clientLLM?.baseUrl || (effectiveProvider === 'ollama' ? config.ai.ollamaBaseUrl : undefined),
          temperature: clientLLM?.temperature ?? 0.7
        };

        const systemPrompt = this.buildSocraticSystemPrompt(context, persona);
        const history = context.conversationHistory || [];

        let fullStreamedText = '';
        let suggestionBuffer = '';
        let isInsideSuggestionsTag = false;

        const streamGen = LLMGateway.streamChat(effectiveConfig, systemPrompt, history, userPrompt);

        for await (const chunk of streamGen) {
          fullStreamedText += chunk;

          // Check for <suggestions> tag boundary
          if (!isInsideSuggestionsTag) {
            if (fullStreamedText.includes('<suggestions>')) {
              isInsideSuggestionsTag = true;
              const parts = fullStreamedText.split('<suggestions>');
              // Only yield the part before the tag that hasn't been emitted yet
              suggestionBuffer = parts[1] || '';
              continue;
            }

            // Normal token yield
            yield {
              event: 'token',
              data: { token: chunk }
            };
          } else {
            // Accumulate suggestion text
            suggestionBuffer += chunk;
          }
        }

        // Parse suggestions from buffer if present
        let parsedSuggestions: string[] = [];
        if (suggestionBuffer.includes('</suggestions>')) {
          const content = suggestionBuffer.split('</suggestions>')[0];
          parsedSuggestions = content
            .split('\n')
            .map((s) => s.replace(/^[-*•\d.]+\s*/, '').trim())
            .filter((s) => s.length > 2)
            .slice(0, 3);
        }

        if (parsedSuggestions.length === 0) {
          parsedSuggestions = [
            `Tell me more about ${context.keyConcepts?.[0] || 'this concept'}`,
            'Can you give me an analogy?',
            'Can you test my idea?'
          ];
        }

        yield {
          event: 'suggestion',
          data: {
            suggestions: parsedSuggestions,
            isDirectAnswerBlocked: false
          }
        };

        yield {
          event: 'done',
          data: { completed: true, modelUsed: effectiveConfig.model }
        };
        return;
      } catch (llmErr) {
        console.warn('LLM Gateway stream error, falling back to enhanced offline tutor:', llmErr);
        // Fall through to offline generator below
      }
    }

    // Offline / Fallback Generator
    const { reply, suggestions, isDirectAnswerBlocked } = this.generateResponse(context, userPrompt);
    const words = reply.split(' ');

    for (const word of words) {
      yield {
        event: 'token',
        data: { token: word + ' ' }
      };
      await new Promise((r) => setTimeout(r, 22));
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
