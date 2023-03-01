import { describe, it } from 'node:test';
import * as assert from 'assert';

function convert(s: string) {
  if (s.trim() === '') return s;
  return s;
}

describe('Converter', () => {
  it('Returns empty string when there are not code', () => {
    const result = convert('');
    assert.strictEqual(result, '');
  });

  it('Accepts JavaScript code', () => {
    const result = convert(`function hello() {}`);
    assert.strictEqual(result, 'function hello() {}');
  });

  it('Accepts TypeScript code', () => {
    const result = convert(`function hello(): void {}`);
    assert.strictEqual(result, 'function hello(): void {}');
  });
});
