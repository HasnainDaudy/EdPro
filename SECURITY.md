# Security & Privacy Policy

EdPro is committed to maintaining security and privacy standards for all learners, educators, and schools.

---

## Reporting Vulnerabilities

If you identify a security vulnerability or child data privacy concern within EdPro, please report it privately:

- **Email**: `security@edpro.local` (or submit a private advisory on GitHub)
- **Response SLA**: The security team acknowledges incoming reports within 48 hours.

Please do not open public GitHub issues for undisclosed security or privacy vulnerabilities.

---

## Privacy Architecture (COPPA & FERPA)

- **Minors Under 13**: Student registration does not require personal email addresses or phone numbers. Accounts utilize pseudonymous usernames and school-authorized consent records.
- **AI Tutoring Guardrails**: Student prompts sent to the Socratic tutor engine are scrubbed of personal identifiers (emails, phone numbers, addresses) prior to processing.
- **Authentication**: Passwords are encrypted using salted cryptographic hashing. Session tokens are stored in secure, HTTP-only cookies with SameSite protections.
- **Audit Logging**: All access to and modifications of student educational records are recorded in an immutable ledger.
