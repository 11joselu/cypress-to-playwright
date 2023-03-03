import { describe, test } from 'node:test';
import * as assert from 'assert';
import { converter } from '../src/converter';
import { format } from './format';

describe('Converter', { concurrency: true }, () => {
  test('Returns empty string when there are not code', () => {
    const result = converter('');

    assert.strictEqual(result, '');
  });

  test('Accepts JavaScript code', () => {
    const result = converter(`function hello() {}`);

    assert.strictEqual(format(result), format('function hello() { }'));
  });

  test('Accepts TypeScript code', () => {
    const result = converter(`function hello(): void {}`);

    assert.strictEqual(format(result), format('function hello(): void { }'));
  });
});
