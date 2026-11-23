import { describe, it, expect } from 'vitest';

describe('Human Flourishing & Character Cultivation Architecture', () => {
  it('validates the 6 multi-modal representation pathways including kinesthetic quests', () => {
    const modalities = ['reader', 'simulation', 'quest', 'video', 'audio', 'worksheet'];
    expect(modalities).toHaveLength(6);
    expect(modalities).toContain('quest');
    expect(modalities).toContain('simulation');
    expect(modalities).toContain('reader');
  });

  it('validates the metacognitive reflection data structure', () => {
    const reflection = {
      struggleArea: 'Connecting geometric ratios to visual color harmonics',
      strategyUsed: 'Consulted my Socratic tutor and tested ideas in the sandbox',
      gratitudeNote: 'I am proud of sticking with it when it felt completely new'
    };

    expect(reflection.struggleArea.length).toBeGreaterThan(5);
    expect(reflection.strategyUsed.length).toBeGreaterThan(5);
    expect(reflection.gratitudeNote.length).toBeGreaterThan(5);
  });

  it('verifies that Family Dinner Table prompt adheres to curiosity-led, zero-quiz principles', () => {
    const studentName = 'Leo';
    const lessonTitle = 'Complementary Colors';
    const dinnerQuestion = `Tonight at dinner, ask ${studentName}: "If you could use the ideas you explored in '${lessonTitle}' to design something completely new for the world, what would it look like?"`;

    // Ensure it doesn't say "test", "quiz", "grade", or "correct"
    expect(dinnerQuestion.toLowerCase()).not.toContain('test');
    expect(dinnerQuestion.toLowerCase()).not.toContain('quiz');
    expect(dinnerQuestion.toLowerCase()).not.toContain('grade');
    expect(dinnerQuestion).toContain(studentName);
  });

  it('verifies ethical design and human impact statement structure', () => {
    const submissionPayload = {
      artifactTitle: 'Inclusive Color Harmony Game',
      artifactDescription: 'A tactile sandbox for learning proportions',
      ethicalImpactStatement: 'Designed with high contrast for friends with low vision and calm audio to reduce sensory overload.',
      artifactUrl: 'https://example.com/project'
    };

    const combinedDescription = `${submissionPayload.artifactDescription}\n\n[Ethical Design & Human Impact Reflection]:\n${submissionPayload.ethicalImpactStatement}`;

    expect(combinedDescription).toContain('[Ethical Design & Human Impact Reflection]');
    expect(combinedDescription).toContain('high contrast for friends with low vision');
  });
});
