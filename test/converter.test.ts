import { describe, it } from 'node:test';
import * as assert from 'assert';
import { converter } from '../src/converter';
import { format } from './format';

describe('Converter', { concurrency: true }, () => {
  it('Returns empty string when there are not code', () => {
    const result = converter('');

    assert.strictEqual(result, '');
  });

  it('Accepts JavaScript code', () => {
    const result = converter(`function hello() {}`);

    assert.strictEqual(format(result), format('function hello() { }'));
  });

  it('Accepts TypeScript code', () => {
    const result = converter(`function hello(): void {}`);

    assert.strictEqual(format(result), format('function hello(): void { }'));
  });
});
