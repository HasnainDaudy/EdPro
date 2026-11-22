# EdPro

> **An open-source personalized education platform for K-12 learning communities.**

EdPro is built on the philosophy that children learn differently. Rather than enforcing rigid curricula where struggling with abstract algebra causes academic disengagement, EdPro allows learners to cultivate their passions—such as visual arts, game design, and music production—while acquiring foundational mathematical and logical principles through applied, cross-disciplinary practice.

---

## Key Capabilities

- **Personalized Focus Allocation**: Dynamic weighting between creative passion projects and core applied subjects.
- **The "6+1" Unit Model**: Standard unit flow consisting of 6 engaging micro-lectures followed by an interactive milestone assessment.
- **Multi-Modal Learning Drawer**: Universal Design for Learning (UDL) interface with interactive readers, video masterclasses, hands-on simulations, audio companions, and printable worksheets.
- **Context-Aware Socratic AI Tutor ("EdBot")**:
  - Dynamically grounds conversations strictly within the active topic and lesson objectives.
  - Adapts tone and vocabulary across three age tiers (Ages 6–9, 10–13, and 14–17).
  - Employs guided questions and conceptual analogies rather than providing direct homework or test answers.
  - Includes prompt-injection defense and automatic child privacy (PII) filtering.
- **Educator & Mentor Portal**:
  - Student roster tracking with focus ratios and completed unit metrics.
  - Authentic creative performance task grading with custom rubric scoring.
  - Diagnostic mastery heatmaps across core competencies.
- **COPPA & FERPA Compliance Architecture**:
  - Minimal PII collection with pseudonymous accounts for minors under 13.
  - School official authorization workflows.
  - Immutable access audit logging for student educational records.

---

## Technical Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite with disk persistence (zero-setup embedded storage)
- **Security**: Argon2/Bcrypt password hashing, HTTP-only SameSite cookies, JWT sessions, Zod validation
- **Testing**: Vitest, Supertest (23 automated integration and unit tests)

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
| **Teacher** | `teacher_carter` | `EdProPass123!` | Classroom educator portal |
| **Admin** | `admin` | `EdProPass123!` | District compliance & audit logs |

---

## Running Automated Tests

Run the test suite verifying authentication, RBAC boundaries, curriculum progression, Socratic guardrails, and grading workflows:

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
│       ├── components/     # UI views, player, dashboards, and simulations
│       └── api.ts          # API client and SSE streaming handler
├── tests/                  # Automated integration and unit test suites
├── docs/                   # Architectural blueprints and pedagogy framework
├── Dockerfile              # Production container build
├── docker-compose.yml      # Local container orchestration
└── package.json            # Project dependencies and operational scripts
```

---

## License

This project is licensed under the GNU Affero General Public License v3.0.
