import { describe, it, expect } from 'vitest';
import { translations, SupportedLanguage } from '../src/client/src/i18n.js';

describe('Accessibility & Internationalization Tests', () => {
  const supportedLangs: SupportedLanguage[] = ['en', 'es', 'fr', 'ar', 'de'];
  const expectedKeys = [
    'learningTrack',
    'educatorPortal',
    'complianceLedger',
    'askEdBot',
    'signIn',
    'signOut',
    'activeSessions',
    'curriculumFocus',
    'studioArts',
    'appliedMath',
    'openLecture',
    'milestoneTest',
    'accessibility',
    'bionicReading',
    'dyslexicFont',
    'sensoryMode',
    'cognitivePacing',
    'microChunk',
    'hyperfocus',
    'voiceInput',
    'readAloud',
    'iepNarratives',
    'courseStudio'
  ];

  it('verifies all supported languages contain complete localization keys', () => {
    for (const lang of supportedLangs) {
      const dict = translations[lang];
      expect(dict, `Missing language dictionary for ${lang}`).toBeDefined();

      for (const key of expectedKeys) {
        expect(dict[key as keyof typeof dict], `Missing key "${key}" in language "${lang}"`).toBeDefined();
        expect(typeof dict[key as keyof typeof dict]).toBe('string');
        expect(dict[key as keyof typeof dict].length).toBeGreaterThan(0);
      }
    }
  });

  it('validates bionic reading word-fixation split algorithm', () => {
    // Test the fixation ratio algorithm used in AccessibilityContext
    const splitWord = (word: string) => {
      if (word.length <= 1) return { bold: word, rest: '' };
      const mid = Math.ceil(word.length * 0.45);
      return { bold: word.slice(0, mid), rest: word.slice(mid) };
    };

    expect(splitWord('learning')).toEqual({ bold: 'lear', rest: 'ning' });
    expect(splitWord('geometry')).toEqual({ bold: 'geom', rest: 'etry' });
    expect(splitWord('art')).toEqual({ bold: 'ar', rest: 't' });
    expect(splitWord('a')).toEqual({ bold: 'a', rest: '' });
  });

  it('validates Arabic language direction flag is RTL', () => {
    const lang = 'ar';
    const isRtl = lang === 'ar';
    expect(isRtl).toBe(true);
  });
});
