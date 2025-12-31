import { slugify } from './slugify';

describe('slugify', () => {
  it('converts names to slug', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
    expect(slugify('  Lead and trail  ')).toBe('lead-and-trail');
  });
});
