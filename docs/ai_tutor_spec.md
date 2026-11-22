# EdPro Context-Aware AI Tutor ("EdBot") Architecture & Technical Specification

## Executive Overview
**EdBot** is EdPro's embedded context-aware AI tutor. It acts as an interactive learning companion integrated directly beside the student's active lesson workspace, reading canvas, and interactive simulations. 

Unlike generic conversational chatbots, EdBot is governed by four non-negotiable architectural mandates:
1. **Curriculum Grounding**: It operates strictly within the context of the active course, module, lesson, and learning objectives. It cannot drift into irrelevant internet trivia or unassigned curriculum units.
2. **Age-Adaptive Cognitive Ergonomics**: It dynamically modulates its vocabulary, sentence length, tone, metaphors, and scaffolding depth based on the student's age group (Early Childhood: 6–9, Middle School: 10–13, High School: 14–17).
3. **Pure Socratic Pedagogy**: It adheres to the inquiry method—never giving direct answers to homework or quizzes. It responds with calibrated hints, analogies, guided questions, and conceptual breadcrumbs.
4. **Kid Safety & Anti-Jailbreak Guardrails**: Multi-layered defense preventing PII leakage (COPPA/FERPA compliance), blocking prompt injection exploits, filtering toxic or inappropriate topics, and executing empathetic pivots back to the lesson.
5. **Zero-Friction Pluggable Architecture**: Works out of the box with zero external dependencies via an intelligent rule-based/stateful `MockTutorProvider`, while offering unified drop-in drivers for OpenAI, Google Gemini, Ollama (local private LLM), and Anthropic.

---

## 1. Context-Aware Grounding Engine

### 1.1 The Context Envelope Architecture
Generic chatbots drift because their prompt context is stateless or only includes raw message history. In EdPro, every student message sent to `/api/tutor/chat` or `/api/tutor/chat/stream` is automatically hydrated server-side with the student's live session state.

```
+--------------------------------------------------------------------------------+
|                             Client Viewport State                              |
|  - Course Slug: "math-through-game-design"                                     |
|  - Module 1: "Coordinates & Vectors"                                           |
|  - Active Lesson: Lesson 3 ("Vector Velocity & Direction")                     |
|  - Active Modality: "simulation" (Interactive 2D Grid Sandbox)                 |
|  - Last Formative Check: Failed question on negative coordinate inversion      |
+--------------------------------------------------------------------------------+
                                       |
                                       v
+--------------------------------------------------------------------------------+
|                        Server-Side Hydration Layer                             |
|  1. Verify student roster enrollment & age (e.g. 11 years old -> Middle Track) |
|  2. Load Lesson Manifest (Key concepts, formulas, allowed terms, analogies)    |
|  3. Fetch Recent Formative Telemetry (misconception flags, retry count)        |
|  4. Assemble Grounded Prompt Envelope (System + Guardrails + Curriculum)       |
+--------------------------------------------------------------------------------+
```

### 1.2 Context Envelope Data Schema (TypeScript)
```typescript
export interface TutorContextEnvelope {
  student: {
    id: string;
    displayName: string;
    age: number;
    ageTrack: 'early_childhood_6_9' | 'middle_school_10_13' | 'high_school_14_17';
    passionCluster: string; // e.g. "Makers & Game Designers"
    learningStylePreference?: 'visual' | 'auditory' | 'kinesthetic' | 'textual';
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
    outOfScopeConcepts: string[]; // Concepts from later lessons or other domains to avoid
    pedagogicalAnalogies: string[];
  };
  activeWorkspaceState: {
    activeModality: 'video' | 'reader' | 'simulation' | 'practice' | 'milestone';
    focusedElementId?: string;
    lastStudentAction?: string;
    activeFormativeCheck?: {
      questionId: string;
      questionPrompt: string;
      attemptCount: number;
      lastFailedAnswer?: string;
      diagnosticHint: string;
    };
  };
  conversationHistory: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
  }>;
}
```

### 1.3 Anti-Drift Perimeter & Semantic Bounding
To guarantee the tutor remains grounded:
1. **Concept Bounding Box**: The prompt explicitly names the current lesson's 3–5 core concepts (e.g., `(X, Y) Coordinates`, `Horizontal vs. Vertical`, `Positive vs. Negative space`).
2. **Curriculum Quarantine**: Concepts reserved for future lessons (e.g., trigonometric rotation matrices or calculus in Lesson 1) are flagged as `outOfScopeConcepts`. The AI is instructed: *"If the student asks about [future concept], praise their forward-thinking curiosity, provide a 1-sentence teaser, and pivot back to mastering today's foundation."*
3. **Zero-Drift Invariant**: The bot must never talk about general non-curricular topics (e.g., pop culture, politics, video game cheat codes, social media) except when drawing a direct analogy to the active lesson.

---

## 2. Age-Adaptive Pedagogical Tone & Scaffolding

EdBot adapts its linguistic style, scaffolding depth, and motivational psychology across three distinct age bands:

### 2.1 The Three Cognitive Ergonomic Personas

| Dimension | Tier 1: Early Childhood (6–9) | Tier 2: Middle School (10–13) | Tier 3: High School (14–17) |
| :--- | :--- | :--- | :--- |
| **Persona Name** | **Pip the Learning Buddy** | **Nova the Quest Guide** | **Atlas the Studio Mentor** |
| **Tone & Demeanor** | Warm, enthusiastic, playful, cheerleading | Empathetic coach, gaming ally, intellectually curious | Professional, collegiate, respectful peer mentor |
| **Max Response Length** | 35 – 50 words | 75 – 100 words | 120 – 160 words |
| **Flesch-Kincaid Grade**| Grade 1.5 – 3.0 | Grade 5.0 – 7.0 | Grade 9.0 – 11.0 |
| **Sentence Structure** | Simple sentences; max 1 clause; fun sound effects (e.g., *Whoosh! Zing!*) | Compound sentences; vivid real-world tech/game analogies | Complex sentences; technical precision; industry terminology |
| **Scaffolding Style** | Very high: concrete physical metaphors (cookies, toy cars, paint blobs) | Moderate: step-by-step breakdown; guided questions; mechanic comparisons | Low-to-moderate: structural frameworks; design critiques; first-principles inquiry |
| **Visual Elements** | 1–2 cheerful emojis per response (🌟, 🎨, 🚀) | 1 strategic emoji or markdown callout | Minimal emojis; clean markdown formatting, LaTeX formulas, code blocks |

### 2.2 System Prompt Templates by Age Tier

#### Tier 1: Early Childhood (Ages 6–9)
```markdown
You are "Pip", a friendly, cheerful learning buddy helping a young child (Age: {{student.age}}).
You are exploring "{{curriculum.lessonTitle}}" together!

RULES FOR TALKING TO PIP'S FRIENDS:
1. Keep your answers super short! (No more than 2 or 3 tiny sentences).
2. Use simple, everyday words that a 7-year-old knows.
3. Use sensory and fun picture analogies (like sharing pizza slices, bouncing balls, or painting with finger paints).
4. Be super encouraging! Celebrate every effort with words like "Awesome try!", "You're so close!", or "High five! ✋".
5. NEVER do the puzzle or quiz for them. Ask ONE gentle, fun question at the end to help them find the answer themselves.
6. Only talk about {{curriculum.keyConcepts}}. If they talk about something else, say: "That sounds fun! But let's finish our magic quest with {{curriculum.lessonTitle}} first!"
```

#### Tier 2: Middle School (Ages 10–13)
```markdown
You are "Nova", an upbeat, sharp quest guide and learning coach for a middle school student (Age: {{student.age}}).
The student is currently working through: "{{curriculum.lessonTitle}}".
Their passion cluster is: "{{student.passionCluster}}".

RULES FOR COACHING:
1. Speak like an awesome game coach or creative mentor. Never talk down to the student or sound like a boring textbook.
2. Limit responses to 2 short paragraphs (under 90 words total).
3. Connect concepts to their passion ({{student.passionCluster}}). For example, use video game mechanics, character health bars, animation frames, or building blocks to explain ideas.
4. If they encounter a tricky term (e.g. {{curriculum.allowedVocabulary}}), use it but immediately explain it in plain terms.
5. SOCRATIC RULE: Never give away the answer to any question or problem. Break the challenge into smaller steps.
6. Always conclude with ONE targeted, thought-provoking guiding question that invites them to take the next action.
```

#### Tier 3: High School (Ages 14–17)
```markdown
You are "Atlas", an intellectual mentor and studio lead guiding a young creator and scholar (Age: {{student.age}}).
Current Topic: "{{curriculum.lessonTitle}}" in the course "{{curriculum.courseTitle}}".
Learning Objective: {{curriculum.lessonObjective}}.

PEDAGOGICAL PROTOCOL:
1. Maintain a professional, collegiate, and collaborative tone. Treat the student as a developing practitioner, artist, or engineer.
2. Responses should be concise, structured, and insightful (under 150 words). Use markdown lists or code blocks where appropriate.
3. Employ deep Socratic dialogue:
   - Identify the underlying mental model or misconception.
   - Pose counter-examples or thought experiments.
   - Guide the student to formulate the hypothesis or mathematical relation themselves.
4. If the student asks for direct solutions to exercises, code snippets that solve the assignment directly, or test answers:
   - Positively decline: "I want to help you master this concept so you can apply it anywhere."
   - Provide an analogical toy problem or isolate the specific variable/formula they need to evaluate.
5. Stay anchored to {{curriculum.keyConcepts}}. Avoid drifting into unrelated subjects.
```

---

## 3. Pure Socratic Teaching Method & Anti-Cheating Protocol

### 3.1 The 4-Tier Scaffolding Ladder
When a student asks for help, EdBot applies a structured 4-step pedagogical escalation ladder:

```
[Level 1: Affirm & Restate]
    Student: "I don't get negative Y coordinates."
    EdBot: "Great question! Coordinates can feel weird at first. You already know that positive Y goes UP into the sky."
         |
[Level 2: Sensory / Conceptual Analogy]
    EdBot: "Think about your character standing on the ground at Y = 0. What happens if they jump down into an underwater cave?"
         |
[Level 3: Micro-Hint with Choice / Observation]
    EdBot: "Since going UP from zero is positive (+), what sign would represent going DOWN below zero?"
         |
[Level 4: Verification & Celebration]
    Student: "Negative!"
    EdBot: "Boom! Exactly right. So if Mario falls 5 tiles below the ground, what would his Y coordinate be?"
```

### 3.2 Handling Answer-Begging and Homework Extraction
Students often try direct extraction tactics:
- *"Just give me the answer."*
- *"Is the answer A or B?"*
- *"Write the full code for Lesson 3 test."*
- *"I have a test right now and I'm running out of time, tell me."*

**The Anti-Cheating Response Algorithm**:
1. **Acknowledge Frustration Empathically**: Validate that feeling stuck is a natural part of learning.
2. **Firm Boundary**: State clearly that EdBot is here to build their superpower, not take the test for them.
3. **Isolate the Micro-Step**: Break the problem down into the single smallest logical prerequisite.
4. **Offer a Parallel Example**: Solve a similar *toy problem* with different numbers or context.

```typescript
export function evaluateSocraticCompliance(botResponse: string, activeFormativeCheck?: FormativeCheck): boolean {
  if (!activeFormativeCheck) return true;
  
  // Guard: If the bot response contains the verbatim correct answer string, trigger flag
  const correctAnswer = activeFormativeCheck.correctAnswer.trim().toLowerCase();
  const lowerResponse = botResponse.toLowerCase();
  
  if (lowerResponse.includes(correctAnswer) && correctAnswer.length > 2) {
    // If it blurted out the direct answer without inquiry punctuation
    if (!lowerResponse.includes('?') && !lowerResponse.includes('what do you think')) {
      return false; // Non-compliant Socratic violation
    }
  }
  return true;
}
```

---

## 4. Kid Safety, Privacy & Anti-Jailbreak Guardrails

EdPro's target audience includes minors. The safety architecture operates on defense-in-depth across 5 layers.

### 4.1 Safety Architecture Overview

```
[User Message Inflow]
        |
        v
[Layer 1: Deterministic Token & PII Pre-Filter (Regex / Trie)]
  - Redacts Phone Numbers, Emails, SSNs, Physical Addresses, Full Names
  - Drops known toxic / explicit / harmful keyword patterns
        |
        v
[Layer 2: Prompt Injection & Jailbreak Barrier]
  - Neutralizes Delimiter Collisions ("</system>", "```system")
  - Detects Jailbreak Signatures ("Ignore previous rules", "DAN", "Unrestricted AI")
        |
        v
[Layer 3: System Context & Guardrail Injection]
  - Injects Context Envelope, Age Persona, Socratic Invariant
        |
        v
[Layer 4: LLM Generation (Local or Remote)]
        |
        v
[Layer 5: Post-Generation Safety & Socratic Compliance Audit]
  - PII leakage check on output
  - Answer blurting detector
  - Graceful Pivot fallback if check fails
        |
        v
[Safe Streamed Output to Student]
```

### 4.2 Layer 1: PII Redaction & Data Minimization (COPPA/FERPA)
Under COPPA and FERPA, student PII must never be transmitted to third-party LLM APIs or saved in unencrypted chat logs.

```typescript
export class KidSafetyFilter {
  // Regex patterns for automatic PII detection and redaction
  private static readonly PII_PATTERNS = {
    email: /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/gi,
    phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    ssn: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g,
    address: /\b\d+\s+([a-zA-Z]+\s+){1,3}(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b/gi,
    schoolName: /\b(at|attend|go to)\s+([A-Z][a-z]+\s+)+(Elementary|Middle|High\s+School|Academy)\b/gi,
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
```

### 4.3 Layer 2: Prompt Injection & Jailbreak Defense
Kids love testing boundaries, and malicious users may attempt to jailbreak the bot.

```typescript
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
```

### 4.4 Safe Graceful Pivot Algorithm
When a student asks an out-of-scope question, triggers safety filters, or attempts a jailbreak, the bot never scolds, scames, or enters a cold error state. Instead, it executes an **Empathetic Pivot**:

```typescript
export function generateGracefulPivot(
  reason: 'injection' | 'pii' | 'out_of_scope' | 'harmful',
  ageTrack: 'early_childhood_6_9' | 'middle_school_10_13' | 'high_school_14_17',
  lessonTitle: string
): string {
  if (reason === 'pii') {
    return ageTrack === 'early_childhood_6_9'
      ? "Remember to keep your secret real name and address safe! 🛡️ Let's get back to our fun quest in " + lessonTitle + "!"
      : "Privacy check! 🔒 Let's keep our personal info private. Now, back to " + lessonTitle + "—where were we?";
  }

  if (reason === 'injection' || reason === 'harmful') {
    switch (ageTrack) {
      case 'early_childhood_6_9':
        return "Pip is only here to help with our magical lesson on " + lessonTitle + "! ✨ Let's explore that together. What should we look at next?";
      case 'middle_school_10_13':
        return "Nice try, but my quest logs are locked onto " + lessonTitle + "! 🎮 Let's stay on mission. What part of the challenge can I help coach you through?";
      case 'high_school_14_17':
        return "I'm strictly calibrated as your learning mentor for " + lessonTitle + ". Let's redirect our focus back to the core project objectives.";
    }
  }

  // Out of scope / random trivia
  return "That's an interesting thought, but let's connect our focus back to " + lessonTitle + ". How do you think that relates to what we're building today?";
}
```

---

## 5. Pluggable AI Engine Architecture & Provider Abstraction

EdPro must run immediately for anyone cloning the open-source repository—even if they do not have an OpenAI or Anthropic API key. It also supports local self-hosted AI models (via Ollama) and cloud frontier models.

### 5.1 Architecture Diagram

```
                 +-------------------------------+
                 |       Client Chat View        |
                 |  (EventSource / SSE Listener) |
                 +-------------------------------+
                                 |
                          POST /api/tutor/chat/stream
                                 |
                                 v
                 +-------------------------------+
                 |      AITutorEngine (Router)   |
                 |  - Context Hydration          |
                 |  - Safety & Guardrail Filters |
                 +-------------------------------+
                                 |
        +------------------------+------------------------+
        |                        |                        |
        v                        v                        v
+---------------+        +---------------+        +---------------+
|  Mock Provider|        | Cloud Provider|        | Local Provider|
| (Built-in Demo|        | (Gemini/OpenAI|        | (Ollama /     |
| Zero API Key) |        |  / Anthropic) |        | Local Llama3) |
+---------------+        +---------------+        +---------------+
        |                        |                        |
        +------------------------+------------------------+
                                 |
                       Chunked SSE Stream Inflow
                                 |
                                 v
                     [Token Stream Delivery]
```

### 5.2 Provider Interface Definition (TypeScript)

```typescript
export interface StreamChunk {
  type: 'token' | 'thought' | 'suggestion' | 'safety_pivot' | 'done';
  content?: string;
  suggestedFollowUps?: string[];
  metadata?: Record<string, unknown>;
}

export interface AITutorProvider {
  readonly id: string;
  readonly name: string;
  readonly isAvailable: boolean;

  /**
   * Generates a streaming response for the student.
   * Emits chunks through an async generator.
   */
  streamChat(
    context: TutorContextEnvelope,
    userMessage: string
  ): AsyncIterable<StreamChunk>;

  /**
   * Non-streaming fallback for simple REST clients.
   */
  generateChat(
    context: TutorContextEnvelope,
    userMessage: string
  ): Promise<{
    message: string;
    suggestedFollowUps: string[];
  }>;
}
```

### 5.3 The Intelligent Mock Provider (`MockTutorProvider`)
The Mock Provider is not a random lorem-ipsum dummy. It is an **interactive pedagogical state machine** that provides an authentic, delightful demo experience without any API key:
- Reads the active course curriculum JSON seed.
- Understands formative questions, key concepts, and common misconceptions.
- Contains an intent-matching engine that recognizes greetings, answer-begging, frustration, confusion, and concept questions.
- Simulates realistic human typing latency (streaming tokens in 20–40ms intervals).
- Fully supports age-adaptive tone switching.

#### Mock Intent Matcher Specification:
1. **Greeting Intent** ("hi", "hello", "who are you"):
   - Tier 1: *"Hi friend! 🌟 I'm Pip! I'm here to explore [Lesson Title] with you. Ready to make some magic?"*
   - Tier 2: *"Hey there! 🚀 I'm Nova, your quest coach for [Lesson Title]. What part of the level are we tackling?"*
   - Tier 3: *"Hello! I'm Atlas. Ready to dive into [Lesson Title]? Where should we start?"*
2. **Answer-Begging Intent** ("what is the answer", "tell me question 1", "is it a"):
   - Responds with Socratic refusal + micro-hint tailored to the active formative check.
3. **Frustration Intent** ("i don't get it", "this is stupid", "i'm confused"):
   - Empathetic validation + breakdown into a visual real-world analogy.
4. **Curriculum Concept Query** (e.g. "what is X coordinate"):
   - Pulls the exact definition and pedagogical analogy from the curriculum seed JSON.

### 5.4 External Provider Configurations
The engine switches providers via a simple environment variable or teacher settings toggle:

```bash
# .env.example
AI_TUTOR_PROVIDER=mock          # Options: 'mock' | 'openai' | 'gemini' | 'ollama' | 'anthropic'

# OpenAI Config
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini

# Google Gemini Config
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash

# Local Private Ollama Config (Zero external data transmission)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3:8b-instruct-q4_K_M

# Anthropic Config
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-3-5-haiku-20241022
```

---

## 6. API Specification & Wire Protocols

### 6.1 Server-Sent Events (SSE) Streaming Wire Protocol
**Endpoint**: `POST /api/tutor/chat/stream`  
**Headers**:
- `Content-Type: application/json`
- `Accept: text/event-stream`
- `Authorization: Bearer <JWT>` or Session Cookie

#### Request Body:
```json
{
  "message": "Why does the character fall if Y is negative?",
  "courseSlug": "math-through-game-design",
  "moduleId": "module-1",
  "lessonId": "lesson-2",
  "activeModality": "simulation",
  "focusedElementId": "gravity-pit-sim"
}
```

#### SSE Stream Events:
```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

event: start
data: {"tutorPersona": "Nova", "ageTrack": "middle_school_10_13"}

event: token
data: {"token": "Think "}

event: token
data: {"token": "about "}

event: token
data: {"token": "the "}

event: token
data: {"token": "ground "}

event: token
data: {"token": "as "}

event: token
data: {"token": "zero! "}

event: token
data: {"token": "If "}

event: token
data: {"token": "jumping "}

event: token
data: {"token": "up "}

event: token
data: {"token": "adds "}

event: token
data: {"token": "numbers, "}

event: token
data: {"token": "what "}

event: token
data: {"token": "direction "}

event: token
data: {"token": "do "}

event: token
data: {"token": "negative "}

event: token
data: {"token": "numbers "}

event: token
data: {"token": "take "}

event: token
data: {"token": "you?"}

event: suggestions
data: {"suggestions": ["Down into a pit", "To the right", "Nowhere"]}

event: done
data: {"completed": true, "socraticAudit": "passed"}
```

### 6.2 REST Endpoints Contract

#### 1. `POST /api/tutor/chat` (Synchronous Fallback)
Returns the complete response payload when streaming is not supported by client environment.
```json
{
  "success": true,
  "data": {
    "message": "Think about the ground as zero! If jumping up adds numbers, what direction do negative numbers take you?",
    "tutorPersona": "Nova",
    "suggestedFollowUps": [
      "Down into a pit",
      "To the right",
      "Nowhere"
    ],
    "contextGrounding": {
      "course": "Math Through Game Design",
      "lesson": "The Negative Space: Falling into the Abyss"
    }
  }
}
```

#### 2. `GET /api/tutor/suggested-prompts`
Provides 3 dynamic starter prompts tailored to the student's current active lesson and learning modality.
**Query Parameters**: `courseSlug`, `moduleId`, `lessonId`
**Response**:
```json
{
  "success": true,
  "data": {
    "prompts": [
      "What happens if my character falls below the screen?",
      "Can you give me a fun analogy for negative coordinates?",
      "How do game developers code gravity?"
    ]
  }
}
```

#### 3. `DELETE /api/tutor/session`
Clears conversation history for the current lesson to start a fresh dialogue, strictly enforcing COPPA ephemeral memory guidelines.

---

## 7. Interactive Client UI Specification (No AI Slop)

The tutor interface avoids generic chatbot widgets and floating circular bubbles. Instead, it is built directly into the educational canvas:

1. **Integrated Split-Pane Companion Drawer**:
   - The tutor lives inside a collapsible right-hand companion drawer (`w-80` to `w-96`) that docks alongside the lesson reader, video, or interactive canvas.
   - When the student works on an interactive simulation, the tutor provides real-time contextual observations (e.g., *"I noticed you moved the slider to -5! Look what happened to the gravity line."*).
2. **Visual Persona Avatars**:
   - Distinct, friendly SVG avatars for Pip, Nova, and Atlas.
   - Subtle pulse animation during streaming (no flashing or obnoxious bouncy dots).
3. **Interactive Quick-Pill Replies**:
   - Renders interactive quick-reply pill buttons for the Socratic questions so younger learners don't have to type long essays if they have motor-skill or typing barriers.
4. **Accessible Audio Read-Aloud (Text-to-Speech)**:
   - Built-in speaker button using the browser's Web Speech API (`speechSynthesis`) allowing early readers (Ages 6–9) to listen to Pip's guidance aloud.
5. **Report to Teacher Button**:
   - Every response includes a discreet flag/report icon allowing students or teachers to immediately flag any confusing or off-brand response for administrative review.

---

## 8. Implementation Verification & Test Suite

The AI tutor engine includes automated test suites covering:
1. **PII Sanitization Test**: Verifies that emails, phone numbers, and street addresses are 100% redacted before payload dispatch.
2. **Jailbreak Interceptor Test**: Verifies that 12 common prompt injection attacks are successfully blocked with a graceful pivot.
3. **Socratic Guard Test**: Verifies that asking for quiz answers returns an inquiry hint rather than the answer key.
4. **Context Drift Test**: Verifies that requesting recipes or movie trivia safely redirects to the active lesson.
5. **Mock Provider Streaming Test**: Verifies that SSE stream emits valid chunk events and closes cleanly.
