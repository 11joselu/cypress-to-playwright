import { describe, it } from 'node:test';
import * as assert from 'assert';
import { convert } from '../src/convert';
import { format } from './format';

describe('Converter', () => {
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

  it('Transform "it" block in a "test" block', () => {
    const result = convert(`it('test_case', () => {});`);

    assert.strictEqual(format(result), format(`test('test_case', () => { });`));
  });

  it('Do not transform call expression when is not "it" block into "test" block', () => {
    const result = convert(`callFunction('test_case', () => {});`);

    assert.strictEqual(
      format(result),
      format(`callFunction('test_case', () => { });`)
    );
  });

  it('Transform "it" block wrapped in a describe into a "test" block', () => {
    const result = convert(`
      describe('test_suite', () => {
        it('test_case', () => {});
      });
    `);

    assert.strictEqual(
      format(result),
      format(`
      describe('test_suite', () => {
        test('test_case', () => {});
      });
    `)
    );
  });

  it('Transform "it.only" block into "test.only" block', () => {
    const result = convert(`it.only('test_case', () => {});`);

    assert.strictEqual(
      format(result),
      format(`test.only('test_case', () => { });`)
    );
  });
});
