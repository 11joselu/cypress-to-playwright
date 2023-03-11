import * as assert from 'assert';
import { converter } from '../src/converter.js';
import { format } from './test-utils.js';

describe('it: Test Hooks', () => {
  it('Transform "it" and inject "page" parameter into "test"', () => {
    const result = converter(`it('test_case', () => {});`);

    assert.strictEqual(format(result), format(`test('test_case', async({page}) => {});`));
  });

  it('Do not transform call expression when is not "it" block into "test" block', () => {
    const result = converter(`callFunction('test_case', () => {});`);

    assert.strictEqual(format(result), format(`callFunction('test_case', () => {});`));
  });

  it('Keeps arrow callback body after transform "it" into "test"', () => {
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

  it('Override "anonymous function" callback keeping function body', () => {
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

  it('Transform "it" block wrapped into describe into a "test" block', () => {
    const result = converter(`
    describe('test_suite', () => {
      it('test_case', () => {});
    });
  `);

    assert.strictEqual(
      format(result),
      format(`
      test.describe('test_suite', () => {
        test('test_case', async({page}) => {});
      });
    `)
    );
  });

  it('Transform "it.only" block into "test.only" block', () => {
    const result = converter(`it.only('test_case', () => {});`);

    assert.strictEqual(format(result), format(`test.only('test_case', async({page}) => {});`));
  });

  it('Keeps test body after a transformation of it.only', () => {
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

  it('Do not transform "fn.only" into "test.only" block', () => {
    const result = converter(`fn.only('a simple function', () => {});`);

    assert.strictEqual(format(result), format(`fn.only('a simple function', () => {});`));
  });

  it('Transform "it.skip" block into "test.skip" block', () => {
    const result = converter(`it.skip('test_case', () => {});`);

    assert.strictEqual(format(result), format(`test.skip('test_case', async({page}) => {});`));
  });

  it('Keeps test body after a transformation of it.skip', () => {
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

  it('Do not transform "fn.skip" block into "test.skip" block', () => {
    const result = converter(`fn.skip('test_case', () => {});`);

    assert.strictEqual(format(result), format(`fn.skip('test_case', () => {});`));
  });
});

describe('beforeEach: Test Hooks', () => {
  it('Convert beforeEach with visit into test.beforeEach', () => {
    const result = converter(`
    beforeEach(() => {})
  `);

    assert.strictEqual(
      format(result),
      format(`
        test.beforeEach(async({page}) => {})
      `)
    );
  });

  it('Convert beforeEach with visit into test.beforeEach with page.goto', () => {
    const result = converter(`
    beforeEach(() => {
      cy.visit('http://localhost')
    })
  `);

    assert.strictEqual(
      format(result),
      format(`
          test.beforeEach(async({page}) => {
            await page.goto('http://localhost')
          })
      `)
    );
  });
});

describe('afterEach: Test Hooks', () => {
  it('Convert afterEach with visit into test.afterEach', () => {
    const result = converter(`
    afterEach(() => {})
  `);

    assert.strictEqual(
      format(result),
      format(`
        test.afterEach(async({page}) => {})
      `)
    );
  });
});

describe('describe: Test Hooks', () => {
  it('Convert describe with visit into test.describe', () => {
    const result = converter(`
    describe('text', () => {})
  `);

    assert.strictEqual(
      format(result),
      format(`
        test.describe('text', () => {})
      `)
    );
  });

  it('Convert describe.only with visit into test.describe.only', () => {
    const result = converter(`
    describe.only('text', () => {})
  `);

    assert.strictEqual(
      format(result),
      format(`
        test.describe.only('text', () => {})
      `)
    );
  });

  it('Convert describe.skip with visit into test.describe.skip', () => {
    const result = converter(`
    describe.skip('text', () => {})
  `);

    assert.strictEqual(
      format(result),
      format(`
        test.describe.skip('text', () => {})
      `)
    );
  });
});
