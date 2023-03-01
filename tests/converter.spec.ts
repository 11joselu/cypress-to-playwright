import { describe, it } from 'node:test';
import * as assert from 'assert';

function convert(s: string) {
  return '';
}

describe('Converter', () => {
  it('Returns empty string when there are not code', () => {
    const result = convert('');
    assert.strictEqual(result, '');
  });
});
