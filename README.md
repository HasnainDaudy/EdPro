# EdPro

> **An open-source personalized education platform empowering all learning minds, especially differently abled and neurodivergent children.**

EdPro is built on a transformative cognitive premise: **Every child’s brain is wired differently.** 

Standardized mass-schooling systems enforce rigid, conveyor-belt curricula where struggling with abstract, symbolic algebra or rapid phonological reading induces academic trauma and disengagement. EdPro dismantles the historical "deficit model" of education by implementing a **strengths-based, neurodiversity-affirming learning architecture**. 

Learners cultivate their intrinsic passions—such as visual arts, game mechanics, coding, and sound engineering—while acquiring foundational mathematical, scientific, and logical competencies through authentic, cross-disciplinary practice.

---

## The Scientific Foundation: Why Extreme Personalization Matters

Educational psychology and neuroscience research confirm that academic failure is frequently not a failure of the child, but a failure of **environmental fit** (Armstrong, 2012; Baron-Cohen, 2017). 

### 1. Dismantling the Deficit Model
Historical special education treated cognitive variations like ADHD, Autism, Dyslexia, and Dyscalculia as broken internal machinery requiring remedial compliance drills. Contemporary peer-reviewed research demonstrates that these cognitive styles possess profound, distinct evolutionary strengths:
- **Dyscalculia**: While abstract symbolic manipulation can cause working memory overload, dyscalculic learners often possess superior 3D spatial intuition, narrative depth, and visual-artistic synthesis.
- **Dyslexia**: While rapid phonetic decoding presents hurdles, dyslexic individuals frequently demonstrate advanced "big-picture" interconnected reasoning, spatial engineering, and creative problem solving.
- **ADHD**: While prolonged passive listening exhausts limited executive function stores, ADHD learners exhibit high divergent creativity, rapid associative synthesis, and extraordinary hyperfocus when engaged in areas of genuine interest.
- **Autism Spectrum**: Autistic learners often possess exceptional systematic pattern recognition, precision, and deep monotropic focus that thrive in structured, predictable, sensory-calm environments.

### 2. Cognitive Load Theory & The Redundancy Paradox (Sweller, 1988; Le Cunff et al., 2024)
Traditional Cognitive Load Theory warns that presenting text and audio simultaneously creates "extraneous cognitive load." However, recent research demonstrates that for neurodivergent learners, **multi-modal redundancy acts as an attentional anchor**. Providing an interactive reader synchronized with bionic eye-fixation text, audio narration, and live tactile sandboxes bypasses working memory bottlenecks, liberating cognitive bandwidth for higher-order reasoning.

### 3. Universal Design for Learning (CAST UDL Guidelines 3.0)
EdPro implements the three core pillars of UDL:
- **Multiple Means of Engagement**: The **Curriculum Focus Allocation Slider** empowers students and mentors to adjust the balance between creative studio projects and applied logic.
- **Multiple Means of Representation**: The **5-Modality Drawer** allows students to learn through Interactive Readers with Bionic Reading, Hands-On Simulation Sandboxes, Video Masterclasses, Audio Companions, or Printable Practice Sheets.
- **Multiple Means of Action & Expression**: Rather than judging students solely on timed multiple-choice tests, Milestone Evaluations feature authentic **Creative Performance Tasks** (original artwork, playable level schematics, musical loops) graded via multi-dimensional rubrics.

### 4. Eliminating the "Masking Tax"
In traditional classrooms, neurodivergent children expend up to **70% of their mental energy masking** their differences to fit in. EdPro provides a calm, sensory-friendly daylight studio environment (`#FAFAF8`) with an embedded Socratic AI tutor ("EdBot") that offers infinite, judgment-free scaffolding—returning that cognitive energy to authentic discovery.

> 📄 *Read the full academic research whitepaper: [docs/inclusive_pedagogy_research.md](docs/inclusive_pedagogy_research.md)*

---

## Key Capabilities

- **Sensory & Cognitive Accessibility Cockpit**:
  - **Bionic Eye-Fixation Reading**: Bolds the initial fixation points of words to guide saccadic eye movements for dyslexic and ADHD readers.
  - **OpenDyslexic Typography**: Gravity-weighted letter baselines prevent rotation and transposition fatigue.
  - **Sensory Calibration Modes**: Standard Bauhaus Daylight, Calm Warmth Sepia (autism/sensory overload prevention), and High Contrast Ink.
  - **Executive Micro-Chunk Pacer**: 5-minute focused bursts with automated 60-second mindfulness breathing co-regulation pauses.
- **Voice-First Socratic EdBot with Co-Regulation**:
  - Speech-to-Text voice question input and Text-to-Speech audio reading.
  - Emotion and frustration detector that validates feelings and de-escalates test anxiety.
  - Strictly grounded in the active lecture topic with 3 age-adapted personas (Pip 6–9, Nova 10–13, Atlas 14–17).
- **Universal IEP & Strengths-Based Telemetry Generator**:
  - Automated 1-click clinical telemetry reports for school psychologists and 504/IEP district meetings.
  - Highlights evolutionary strengths, multi-modal accommodations utilized, and growth trajectories.
- **Open Curriculum Channel Studio (`@edpro/channel-spec`)**:
  - Open-source specification allowing any educator or community author to compose and publish standardized 6+1 curriculum channels.
- **Global Localization**:
  - Multi-language dictionary support including English, Spanish, French, German, and Arabic (with dynamic RTL layout shifting).
- **COPPA & FERPA Compliance Architecture**:
  - Minimal PII collection with pseudonymous accounts for minors under 13.
  - School official authorization workflows.
  - Immutable access audit logging for student educational records.

---

## Technical Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite with disk persistence (`sql.js`, zero-setup embedded storage)
- **Security**: Argon2/Bcrypt password hashing, HTTP-only SameSite cookies, JWT sessions, Zod validation
- **Testing**: Vitest, Supertest (26 automated integration and unit tests)
- **Design System**: Daylight Scandinavian Studio & Bauhaus Workshop (`#FAFAF8` ground, zero AI slop, zero neon blur)

---

## Quickstart Guide

### Prerequisites
- Node.js 20 or later
- npm 9 or later

### Installation & Launch

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Seed the database with courses, lessons, and demo profiles**:
   ```bash
   npm run seed
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:5000`.

---

## Demo Credentials

| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Student** | `leo_artist` | `EdProPass123!` | Visual Arts focus (Age 11) |
| **Student** | `maya_games` | `EdProPass123!` | Game Design & Coding focus (Age 12) |
| **Student** | `sam_beats` | `EdProPass123!` | Early childhood sound & music explorer (Age 8) |
| **Teacher** | `teacher_carter` | `EdProPass123!` | Classroom educator portal |
| **Admin** | `admin` | `EdProPass123!` | District compliance & audit logs |

---

## Running Automated Tests

Run the test suite verifying authentication, RBAC boundaries, curriculum progression, Socratic guardrails, grading workflows, and accessibility matrices:

```bash
npm test
```

---

## Project Structure

```
.
├── src/
│   ├── server/             # Express API, auth, routes, and Socratic engine
│   │   ├── db/             # Database connection, schemas, and seed script
│   │   ├── middleware/     # Auth, RBAC, COPPA sanitizer, audit logger
│   │   ├── routes/         # Modular REST endpoints
│   │   └── services/       # AI tutor engine and evaluation services
│   └── client/             # React application source
│       ├── components/     # UI views, player, dashboards, cockpit, simulations
│       ├── context/        # AccessibilityContext, Bionic reading, speech engine
│       ├── i18n.ts         # Multi-language translation dictionaries
│       └── api.ts          # API client and SSE streaming handler
├── tests/                  # Automated integration and unit test suites (26 tests)
├── docs/                   # Architectural blueprints, pedagogy framework & inclusion research
│   ├── inclusive_pedagogy_research.md  # Academic whitepaper on neurodiversity & UDL
│   ├── pedagogy_framework.md           # The 6+1 Unit curriculum model
│   └── ai_tutor_spec.md                # Socratic EdBot engine specification
├── Dockerfile              # Production container build
├── docker-compose.yml      # Local container orchestration
└── package.json            # Project dependencies and operational scripts
```

---

## Contributing

We welcome contributions from teachers, cognitive scientists, engineers, parents, and neurodivergent individuals worldwide. Please read [CONTRIBUTING.md](CONTRIBUTING.md) to get started.

---

## License

This project is licensed under the GNU Affero General Public License v3.0.
