import { describe, test } from 'node:test';
import * as assert from 'assert';
import { converter } from '../src/converter';
import { format } from './format';

describe('Converter: Test Hooks', { concurrency: true }, () => {
  test('Transform "it" and inject "page" parameter into "test"', () => {
    const result = converter(`it('test_case', () => {});`);

    assert.strictEqual(format(result), format(`test('test_case', async({page}) => {});`));
  });

  test('Do not transform call expression when is not "it" block into "test" block', () => {
    const result = converter(`callFunction('test_case', () => {});`);

    assert.strictEqual(format(result), format(`callFunction('test_case', () => {});`));
  });

  test('Keeps arrow callback body after transform "it" into "test"', () => {
    const result = converter(`
      it('test_case', () => {
        console.log('Function body');
      });
    `);

    assert.strictEqual(
      format(result),
      format(`
        test('test_case', async({page}) => {
          console.log('Function body');
        });
    `)
    );
  });

  test('Override "anonymous function" callback keeping function body', () => {
    const result = converter(`
      it('test_case', function() {
        console.log('Function body');
      });
    `);

    assert.strictEqual(
      format(result),
      format(`
        test('test_case', async({page}) => {
          console.log('Function body');
        });
    `)
    );
  });

  test('Transform "it" block wrapped into describe into a "test" block', () => {
    const result = converter(`
      describe('test_suite', () => {
        it('test_case', () => {});
      });
    `);

    assert.strictEqual(
      format(result),
      format(`
      describe('test_suite', () => {
        test('test_case', async({page}) => {});
      });
    `)
    );
  });

  test('Transform "it.only" block into "test.only" block', () => {
    const result = converter(`it.only('test_case', () => {});`);

    assert.strictEqual(format(result), format(`test.only('test_case', async({page}) => {});`));
  });

  test('Keeps test body after a transformation of it.only', () => {
    const result = converter(`
      it.only('test_case', () => {
        console.log('Function body');
      });
    `);

    assert.strictEqual(
      format(result),
      format(`
        test.only('test_case', async({page}) => {
          console.log('Function body');
        });
      `)
    );
  });

  test('Do not transform "fn.only" into "test.only" block', () => {
    const result = converter(`fn.only('a simple function', () => {});`);

    assert.strictEqual(format(result), format(`fn.only('a simple function', () => {});`));
  });

  test('Transform "it.skip" block into "test.skip" block', () => {
    const result = converter(`it.skip('test_case', () => {});`);

    assert.strictEqual(format(result), format(`test.skip('test_case', async({page}) => {});`));
  });

  test('Keeps test body after a transformation of it.skip', () => {
    const result = converter(`
      it.skip('test_case', () => {
        console.log('Function body');
      });
    `);

    assert.strictEqual(
      format(result),
      format(`
        test.skip('test_case', async({page}) => {
          console.log('Function body');
        });
      `)
    );
  });

  test('Do not transform "fn.skip" block into "test.skip" block', () => {
    const result = converter(`fn.skip('test_case', () => {});`);

    assert.strictEqual(format(result), format(`fn.skip('test_case', () => {});`));
  });
});
