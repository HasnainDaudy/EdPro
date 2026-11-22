import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'edpro-insecure-dev-secret-key-32chars-min-change-prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: 'edpro_session',
  environment: process.env.NODE_ENV || 'development',
  coppa: {
    minimumAgeWithoutConsent: 13,
    dataRetentionDays: 365,
    allowAnonymousUsernames: true
  },
  ai: {
    provider: process.env.AI_PROVIDER || 'mock', // 'mock' | 'gemini' | 'openai' | 'ollama'
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
  }
};
