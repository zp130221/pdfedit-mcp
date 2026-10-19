/** The one-sentence summary a model reads first, and the warnings it spells out. */
import { describe, expect, it } from 'vitest';

import { SUMMARY_MAX, WARNING_HINTS, explainWarning, summarize } from '../src/result.js';

describe('summarize', () => {
  it('spells out approx_font_used so the model checks the preview', () => {
    const text = summarize(
      { status: 'done', changes: [{ op: 'replace', page: 1 }], warnings: ['approx_font_used'] },
      './quote.edited.pdf',
    );
    expect(text).toContain('Replaced 1 occurrence on page 1.');
    expect(text).toContain('look-alike');
    expect(text).toContain('check the preview');
    expect(text).toContain('Output: ./quote.edited.pdf.');
    expect(text.length).toBeLessThanOrEqual(SUMMARY_MAX);
  });

  it('passes an unknown warning through by name', () => {
    expect(explainWarning('subset_fonts_failed')).toBe('subset_fonts_failed');
    expect(summarize({ status: 'done', changes: [], warnings: ['subset_fonts_failed'] })).toContain(
      'Warnings: subset_fonts_failed.',
    );
  });

  it('keeps every hint short enough to leave room for the output label', () => {
    for (const hint of Object.values(WARNING_HINTS)) expect(hint.length).toBeLessThan(170);
  });
});
