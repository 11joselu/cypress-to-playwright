import { describe, it } from 'node:test';
import * as assert from 'assert';

function convert(s: string) {
  return s;
}

describe('Converter', () => {
  it('Returns empty string when there are not code', () => {
    const result = convert('');
    assert.strictEqual(result, '');
  });

  it('Parse a JavaScript code', () => {
    const result = convert(`function hello() {}`);
    assert.strictEqual(result, 'function hello() {}');
  });
});
