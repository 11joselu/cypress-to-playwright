import * as assert from 'assert';
import { converter } from '../src/converter.js';
import { format } from './test-utils.js';
import { nulCustomCommandTracker } from './nul-custom-command-tracker.js';
import { createInMemoryCustomCommandTracker } from '../src/core/infrastructure/in-memory-custom-command-tracker.js';

describe('Converter', () => {
  it('Returns empty string when there are not code', () => {
    const result = converter('', nulCustomCommandTracker);

    assert.strictEqual(result, '');
  });

  it('Accepts JavaScript code', () => {
    const result = converter(`function hello() {}`, nulCustomCommandTracker);

    assert.strictEqual(format(result), format('function hello() { }'));
  });

  it('Accepts TypeScript code', () => {
    const result = converter(`function hello(): void {}`, nulCustomCommandTracker);

    assert.strictEqual(format(result), format('function hello(): void { }'));
  });

  it('Convert large cypress code', () => {
    const result = converter(
      `
    describe('example to-do app', () => {
      beforeEach(() => {
        cy.visit('https://example.cypress.io/todo');
      });
      it('displays two todo items by default', () => {
        cy.get('.todo-list li').should('have.length', 2);
        cy.get('.todo-list li').first().should('have.text', 'Pay electric bill');
        cy.get('.todo-list li').last().should('have.text', 'Walk the dog');
      });
      it('can add new todo items', () => {
        const newItem = 'Feed the cat';
        cy.get('[data-test=new-todo]').type(newItem + "{enter}");
        cy.get('.todo-list li').should('have.length', 3);
        cy.get('.todo-list li').last().should('have.text', newItem);
      });
    });
  `,
      nulCustomCommandTracker
    );

    assert.strictEqual(
      format(result),
      format(`
        test.describe('example to-do app', () => {
          test.beforeEach(async ({page}) => {
            await page.goto('https://example.cypress.io/todo');
          });
          test('displays two todo items by default', async ({page}) => {
            await expect(page.locator('.todo-list li')).toHaveCount(2);
            await expect(page.locator('.todo-list li').first()).toHaveText('Pay electric bill');
            await expect(page.locator('.todo-list li').last()).toHaveText('Walk the dog');
          });
          test('can add new todo items', async ({page}) => {
            const newItem = 'Feed the cat';
            await page.locator('[data-test=new-todo]').type(newItem + "{enter}");
            await expect(page.locator('.todo-list li')).toHaveCount(3);
            await expect(page.locator('.todo-list li').last()).toHaveText(newItem);
          });
        });
    `)
    );
  });

  it('Convert cy code inside a function declaration and inject "page" parameter', () => {
    const result = converter(
      `function visit() {
    cy.visit('http://localhost')
  }`,
      nulCustomCommandTracker
    );

    assert.strictEqual(
      format(result),
      format(`
      async function visit(page) {
        await page.goto('http://localhost');
      }
    `)
    );
  });

  it('Convert cy code inside a function declaration with parameters and inject "page" parameter keeping the rest of parameters', () => {
    const result = converter(
      `function visit(id) {
    cy.visit('http://localhost/' + id)
  }`,
      nulCustomCommandTracker
    );

    assert.strictEqual(
      format(result),
      format(`
      async function visit(page, id) {
        await page.goto('http://localhost/' + id);
      }
    `)
    );
  });

  it('Do not convert a function when there are no cy code into playwright code', () => {
    const result = converter(
      `function visit() {
    console.log('non a cypress code')
  }`,
      nulCustomCommandTracker
    );

    assert.strictEqual(
      format(result),
      format(`
      function visit() {
        console.log('non a cypress code')
      }
    `)
    );
  });

  it('Convert cy code inside a arrow function and inject "page" parameter', () => {
    const result = converter(
      `const visit = () => {
    cy.visit('http://localhost')
  }`,
      nulCustomCommandTracker
    );

    assert.strictEqual(
      format(result),
      format(`
      const visit = async (page) => {
        await page.goto('http://localhost');
      }
    `)
    );
  });

  it('Convert cy code inside a arrow function with parameters and inject "page" parameter keeping the rest of parameters', () => {
    const result = converter(
      `const visit = (id) => {
    cy.visit('http://localhost/' + id)
  }`,
      nulCustomCommandTracker
    );

    assert.strictEqual(
      format(result),
      format(`
      const visit = async (page, id) => {
        await page.goto('http://localhost/' + id);
      }
    `)
    );
  });

  it('Do not convert a arrow function when there are no cy code into playwright code', () => {
    const result = converter(
      `const visit = () => {
    console.log('non a cypress code')
  }`,
      nulCustomCommandTracker
    );

    assert.strictEqual(
      format(result),
      format(`
      const visit = () => {
        console.log('non a cypress code')
      }
    `)
    );
  });

  it('Convert a cy test case injecting page in a functions call into a playwright code', () => {
    const result = converter(
      `
    it('visit', () => {
      goToMainPage();
    });
    function goToMainPage() {
      cy.visit('http://localhost/');
    }
  `,
      nulCustomCommandTracker
    );

    assert.strictEqual(
      format(result),
      format(`
      test('visit', async ({ page }) => {
        await goToMainPage(page);
      });
      async function goToMainPage(page) {
        await page.goto('http://localhost/');
      }
    `)
    );
  });

  it('Do not convert a cy test case with functions without cy references in function declaration', () => {
    const result = converter(
      `
    it('visit', () => {
      goToMainPage();
    });
    function goToMainPage() {
      console.log('hey');
    }
  `,
      nulCustomCommandTracker
    );

    assert.strictEqual(
      format(result),
      format(`
      test('visit', async ({ page }) => {
        goToMainPage();
      });
      function goToMainPage() {
        console.log('hey');
      }
    `)
    );
  });

  it('Convert a cy test case injecting page in a arrow functions call into a playwright code', () => {
    const result = converter(
      `
    it('visit', () => {
      goToMainPage();
    });
    const goToMainPage = () => {
      cy.visit('http://localhost/');
    }
  `,
      nulCustomCommandTracker
    );

    assert.strictEqual(
      format(result),
      format(`
      test('visit', async ({ page }) => {
        await goToMainPage(page);
      });
      const goToMainPage = async (page) => {
        await page.goto('http://localhost/');
      }
    `)
    );
  });

  it('Do not throw error when there are variable without a value defined', () => {
    assert.doesNotThrow(() => {
      converter(
        `
        it('matches unknown text between two elements', () => {
          let text;
        });
      `,
        nulCustomCommandTracker
      );
    });
  });

  it('Should replace Cypress Custom command', () => {
    const result = converter(
      `
      Cypress.Commands.add('myCommand', () => {})
      test('visit', async ({ page }) => {
        cy.myCommand(page);
      });
  `,
      createInMemoryCustomCommandTracker()
    );

    assert.strictEqual(
      format(result),
      format(`
        export async function myCommand(page){}
        test('visit', async ({ page }) => {
          myCommand(page);
        });
    `)
    );
  });
});
