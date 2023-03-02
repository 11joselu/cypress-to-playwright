import { describe, it } from 'node:test';
import * as assert from 'assert';
import { convert } from '../src/convert';

describe('Converter', () => {
  it('Returns empty string when there are not code', () => {
    const result = convert('');
    assert.strictEqual(result, '');
  });

  it('Accepts JavaScript code', () => {
    const result = convert(`function hello() {}`);
    assert.strictEqual(result, 'function hello() { }');
  });

  it('Accepts TypeScript code', () => {
    const result = convert(`function hello(): void {}`);
    assert.strictEqual(result, 'function hello(): void { }');
  });

  it('Transform "it" block in a "test" block', () => {
    const result = convert(`it('test_case', () => {});`);
    assert.strictEqual(result, `test('test_case', () => { });`);
  });

  it('Do not transform call expression when is not "it" block in a "test" block', () => {
    const result = convert(`callFunction('test_case', () => {});`);
    assert.strictEqual(result, `callFunction('test_case', () => { });`);
  });
});
