import { describe, it } from 'node:test';
import * as assert from 'assert';
import { convert } from '../src/convert';
import { format } from './format';

describe('Converter', { concurrency: true }, () => {
  it('Returns empty string when there are not code', () => {
    const result = convert('');

    assert.strictEqual(result, '');
  });

  it('Accepts JavaScript code', () => {
    const result = convert(`function hello() {}`);

    assert.strictEqual(format(result), format('function hello() { }'));
  });

  it('Accepts TypeScript code', () => {
    const result = convert(`function hello(): void {}`);

    assert.strictEqual(format(result), format('function hello(): void { }'));
  });
});
