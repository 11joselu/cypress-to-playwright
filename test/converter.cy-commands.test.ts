import { index } from '../src/index.js';
import { format } from './test-utils.js';
import assert from 'assert';

describe('Converter: Cypress commands', () => {
  it('Transform cy.visit by awaited page.goto', () => {
    const result = index('cy.visit("http://localhost")');

    assert.strictEqual(format(result), format('await page.goto("http://localhost")'));
  });

  it('Do not transform fn.visit', () => {
    const result = index('fn.visit("http://localhost")');

    assert.strictEqual(format(result), format('fn.visit("http://localhost")'));
  });
});

describe('Querys', () => {
  it('Converts cy.get to page.locator', () => {
    const result = index(`cy.get("selector").click()`);

    assert.strictEqual(format(result), format(`await page.locator("selector").click()`));
  });

  it('Converts cy.contains to page.locator', () => {
    const result = index(`cy.contains("test").click()`);

    assert.strictEqual(format(result), format(`await page.locator("text=test").click()`));
  });
});

describe('Intercept', () => {
  it('Migrate cy.intercept with url and response to page.route', () => {
    const result = index(`
    cy.intercept('http://localhost/an-url/**', {
      body: {
        code: 'API_011',
        error: true,
        message: 'Stubbed response',
      },
      statusCode: 400,
    });
  `);

    assert.strictEqual(
      format(result),
      format(`
      page.route('http://localhost/an-url/.*', route => {
        route.fulfill({
          status: 400,
          body: {
            code: 'API_011',
            error: true,
            message: 'Stubbed response',
          },
        });
      });
    `)
    );
  });

  it('Migrate cy.intercept with METHOD POST, URL and response to page.route', () => {
    const result = index(`
      cy.intercept('POST', 'http://localhost/an-url/**', {
        body: {
          code: 'API_011',
          error: true,
          message: 'Stubbed response',
        },
        statusCode: 400,
      });
  `);

    assert.strictEqual(
      format(result),
      format(`
      page.route('http://localhost/an-url/.*', route => {
        if (route.request().method() !== 'POST') {
          route.fallback();
          return;
        }
        route.fulfill({
          status: 400,
          body: {
            code: 'API_011',
            error: true,
            message: 'Stubbed response',
          },
        });
      });
    `)
    );
  });

  it('Migrate cy.intercept with METHOD GET, URL and response to page.route', () => {
    const result = index(`
      cy.intercept('GET', 'http://localhost/an-url/**', {
        body: {
          code: 'API_011',
          error: true,
          message: 'Stubbed response',
        },
        statusCode: 400,
      });
  `);

    assert.strictEqual(
      format(result),
      format(`
      page.route('http://localhost/an-url/.*', route => {
        if (route.request().method() !== 'GET') {
          route.fallback();
          return;
        }
        route.fulfill({
          status: 400,
          body: {
            code: 'API_011',
            error: true,
            message: 'Stubbed response',
          },
        });
      });
    `)
    );
  });
});