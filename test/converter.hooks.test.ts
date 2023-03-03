import { describe, it } from 'node:test';
import * as assert from 'assert';
import { converter } from '../src/converter';
import { format } from './format';

describe('Converter: Test Hooks', { concurrency: true }, () => {
  it('Transform "it" block in a "test" block', () => {
    const result = converter(`it('test_case', () => {});`);

    assert.strictEqual(format(result), format(`test('test_case', () => {});`));
  });

  it('Do not transform call expression when is not "it" block into "test" block', () => {
    const result = converter(`callFunction('test_case', () => {});`);

    assert.strictEqual(
      format(result),
      format(`callFunction('test_case', () => {});`)
    );
  });

  it('Transform "it" block wrapped in a describe into a "test" block', () => {
    const result = converter(`
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
    const result = converter(`it.only('test_case', () => {});`);

    assert.strictEqual(
      format(result),
      format(`test.only('test_case', () => {});`)
    );
  });

  it('Do not transform "fn.only" into "test.only" block', () => {
    const result = converter(`fn.only('a simple function', () => {});`);

    assert.strictEqual(
      format(result),
      format(`fn.only('a simple function', () => {});`)
    );
  });

  it('Transform "it.skip" block into "test.skip" block', () => {
    const result = converter(`it.skip('test_case', () => {});`);

    assert.strictEqual(
      format(result),
      format(`test.skip('test_case', () => {});`)
    );
  });

  it('Do not transform "fn.skip" block into "test.skip" block', () => {
    const result = converter(`fn.skip('test_case', () => {});`);

    assert.strictEqual(
      format(result),
      format(`fn.skip('test_case', () => {});`)
    );
  });
});
