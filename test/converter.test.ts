import * as assert from 'assert';
import { index } from '../src/index.js';
import { format } from './test-utils.js';

describe('Converter', () => {
  it('Returns empty string when there are not code', () => {
    const result = index('');

    assert.strictEqual(result, '');
  });

  it('Accepts JavaScript code', () => {
    const result = index(`function hello() {}`);

    assert.strictEqual(format(result), format('function hello() { }'));
  });

  it('Accepts TypeScript code', () => {
    const result = index(`function hello(): void {}`);

    assert.strictEqual(format(result), format('function hello(): void { }'));
  });

  it('Convert large cypress code', () => {
    const result = index(`
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
    `);

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
    const result = index(`function visit() {
      cy.visit('http://localhost')
    }`);

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
    const result = index(`function visit(id) {
      cy.visit('http://localhost/' + id)
    }`);

    assert.strictEqual(
      format(result),
      format(`
      async function visit(page, id) {
        await page.goto('http://localhost/' + id);
      }
    `)
    );
  });
});
