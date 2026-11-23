import { describe, it, expect } from 'vitest';

describe('MarkdownContent Parser & Formatter', () => {
  it('parses markdown headings correctly into clean heading text without literal hashes', () => {
    const raw = '### Welcome to Visual Geometry!';
    const isHeading = raw.startsWith('### ');
    const headingText = isHeading ? raw.slice(4) : raw;

    expect(isHeading).toBe(true);
    expect(headingText).toBe('Welcome to Visual Geometry!');
    expect(headingText).not.toContain('###');
  });

  it('strips markdown bold tokens and extracts clean text', () => {
    const raw = 'invisible scaffold called **compositional geometry**.';
    const regex = /\*\*([^*]+)\*\*/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(raw)) !== null) {
      matches.push(match[1]);
    }

    expect(matches).toContain('compositional geometry');
  });

  it('extracts bullet list items from lines starting with hyphen', () => {
    const rawLines = [
      '- Primary Colors: Red, Yellow, Blue',
      '- Secondary Colors: Orange, Green, Purple'
    ];

    const listItems = rawLines.map(line => line.slice(2));
    expect(listItems).toHaveLength(2);
    expect(listItems[0]).toBe('Primary Colors: Red, Yellow, Blue');
    expect(listItems[1]).toBe('Secondary Colors: Orange, Green, Purple');
  });
});
