import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.js';

export function sanitizeKidInput(text: string): string {
  if (!text) return '';
  // Redact email addresses
  let cleaned = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');
  // Redact standard US phone numbers
  cleaned = cleaned.replace(/(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/g, '[REDACTED_PHONE]');
  // Redact street address indicators
  cleaned = cleaned.replace(/\b\d+\s+([A-Za-z]+|[A-Za-z]+\s[A-Za-z]+)\s(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b/gi, '[REDACTED_ADDRESS]');
  return cleaned;
}

export function coppaPrivacyGuard(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // If user is a student under 13, ensure no sensitive personal fields are updated
  if (req.user && req.user.role === 'STUDENT' && (req.user.age ?? 10) < 13) {
    if (req.body) {
      if (req.body.email) {
        delete req.body.email;
      }
      if (req.body.phone) {
        delete req.body.phone;
      }
      if (req.body.realName && !req.body.displayName) {
        req.body.displayName = req.body.realName.split(' ')[0] + ' ' + (req.body.realName.split(' ')[1]?.[0] || '');
        delete req.body.realName;
      }
    }
  }
  next();
}
