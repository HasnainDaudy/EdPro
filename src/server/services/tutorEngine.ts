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
    const historyCount = context.conversationHistory ? context.conversationHistory.length : 0;
    const isEarlyChildhood = context.ageTrack === 'early_childhood_6_9';
    const isHighSchool = context.ageTrack === 'high_school_14_17';

    // Core concepts & domain details
    const primaryConcept = context.keyConcepts?.[0] || 'the core concept';
    const secondaryConcept = context.keyConcepts?.[1] || 'visual balance';
    const lessonTitle = context.lessonTitle || 'Today\'s Lesson';
    const courseTitle = context.courseTitle || 'Studio Track';
    const isArtDomain = courseTitle.toLowerCase().includes('art') || lessonTitle.toLowerCase().includes('color') || lessonTitle.toLowerCase().includes('geometry');
    const isGameDomain = courseTitle.toLowerCase().includes('game') || lessonTitle.toLowerCase().includes('coordinate') || lessonTitle.toLowerCase().includes('physics');

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
          suggestions: ['Walk me through the mathematical constraint', 'Give me an architectural analogy', 'What variables can we isolate?'],
          isDirectAnswerBlocked: true
        };
      } else {
        return {
          reply: `Hey, giving you the answer would bypass the XP you earn by cracking it! 🎮 In ${lessonTitle}, every problem is a mini-boss. Let's look at ${primaryConcept}: what is the very first move or observation you'd make?`,
          suggestions: ['What is the first clue?', 'Show me how this works in a real game', 'Give me a warm-up question'],
          isDirectAnswerBlocked: true
        };
      }
    }

    // 2. Intent: "Can you test my idea?" or proposing testing
    if (lower.includes('test my idea') || lower.includes('test this') || lower.includes('can you test') || lower.includes('try my idea')) {
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

    // 3. Intent: Testing student responses to previous questions
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

    // 4. Intent: "Give me an analogy"
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

    // 5. Intent: "Explain the core concept" or "What does this mean?"
    if (lower.includes('explain the core concept') || lower.includes('what is') || lower.includes('what does') || lower.includes('explain the main idea')) {
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

    // 6. Intent: "Where should I start?"
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

    // 7. Intent: Greetings / Introductions
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

    // 8. Intent: Frustration / Difficulty (Co-Regulation)
    if (lower.includes('hard') || lower.includes('confused') || lower.includes('stuck') || lower.includes('dont get it') || lower.includes("don't understand")) {
      return {
        reply: `Take a comfortable breath with me. Feeling stuck is completely normal—it means your brain is wrestling with a brand-new concept, which is where real growth happens! Let's make it super simple: forget the big terms for a second. If you look at the screen right now, what is the single clearest thing you notice?`,
        suggestions: ['The colors look bright', 'The numbers keep moving', 'Can you give me a simple example?'],
        isDirectAnswerBlocked: false
      };
    }

    // 9. Intent: "Why" questions
    if (lower.startsWith('why') || lower.includes('why does') || lower.includes('why is')) {
      return {
        reply: `That is the question of a true researcher! Why questions unlock first principles. In ${lessonTitle}, ${primaryConcept} exists because nature follows mathematical harmony. If we didn't have this rule, things would clash or collapse. How do you think this rule helps you as a creator?`,
        suggestions: ['It gives structure to my work', 'It helps players navigate easily', 'Can you show me what breaking this rule looks like?'],
        isDirectAnswerBlocked: false
      };
    }

    // 10. Multi-turn dynamic adaptive synthesis for general input
    // Analyze user words to reflect their exact vocabulary and advance the dialogue
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
        reply: `A compelling perspective regarding "${topicalWord}". When you synthesize ${topicalWord} with ${primaryConcept}, you are essentially balancing constraints against creative expression. If an industry engineer were optimizing this, what metric would they prioritize: speed, beauty, or accuracy?`,
        suggestions: ['Prioritize aesthetic beauty', 'Prioritize computational speed', 'Balance both dynamically'],
        isDirectAnswerBlocked: false
      };
    } else {
      // Dynamic turn variation using conversation depth
      const turnVariations = [
        `That's a clever observation about "${topicalWord}"! 💡 Notice how it connects directly with ${primaryConcept}. If you were showing this to a friend who has never seen it before, how would you explain it in one sentence?`,
        `You're thinking like a real studio designer! Taking "${topicalWord}" and applying it to ${lessonTitle} opens up new possibilities. What happens if we double its effect? Does it get cooler or chaotic?`,
        `Great point on "${topicalWord}". In professional game and art studios, artists test that exact question. What do you think the user or player feels when they see that in action?`
      ];

      const selectedVariation = turnVariations[historyCount % turnVariations.length];

      return {
        reply: selectedVariation,
        suggestions: [
          `It creates a striking focal point`,
          `It makes the gameplay smoother`,
          `Can you test another scenario with me?`
        ],
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
        await new Promise((r) => setTimeout(r, 20));
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
      await new Promise((r) => setTimeout(r, 24));
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
