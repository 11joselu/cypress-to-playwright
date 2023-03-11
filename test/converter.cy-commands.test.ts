import { converter } from '../src/converter.js';
import { format } from './test-utils.js';
import assert from 'assert';
import { nulCustomCommandTracker } from './nul-custom-command-tracker.js';

describe('Converter: Cypress commands', () => {
  it('Transform cy.visit by awaited page.goto', () => {
    const result = converter('cy.visit("http://localhost")', nulCustomCommandTracker);

    assert.strictEqual(format(result), format('await page.goto("http://localhost")'));
  });

  it('Do not transform fn.visit', () => {
    const result = converter('fn.visit("http://localhost")', nulCustomCommandTracker);

    assert.strictEqual(format(result), format('fn.visit("http://localhost")'));
  });

  it('Transform cy.wait by await page.waitForTimeout', () => {
    const result = converter('cy.wait(1000)', nulCustomCommandTracker);

    assert.strictEqual(format(result), format('await page.waitForTimeout(1000)'));
  });

  it('Transform cy.clearCookies() by await page.context().clearCookies()', () => {
    const result = converter('cy.clearCookies()', nulCustomCommandTracker);

    assert.strictEqual(format(result), format('await page.context().clearCookies()'));
  });
});

describe("Query's", () => {
  it('Converts cy.get to page.locator', () => {
    const result = converter(`cy.get("selector").click()`, nulCustomCommandTracker);

    assert.strictEqual(format(result), format(`await page.locator("selector").click()`));
  });

  it('Converts cy.contains to page.locator', () => {
    const result = converter(`cy.contains("test").click()`, nulCustomCommandTracker);

    assert.strictEqual(format(result), format(`await page.locator("text=test").click()`));
  });
});

describe('Intercept', () => {
  it('Migrate cy.intercept with url and response to page.route', () => {
    const result = converter(
      `
  cy.intercept('http://localhost/an-url/**', {
    body: {
      code: 'API_011',
      error: true,
      message: 'Stubbed response',
    },
    statusCode: 400,
  });
`,
      nulCustomCommandTracker
    );

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
    const result = converter(
      `
    cy.intercept('POST', 'http://localhost/an-url/**', {
      body: {
        code: 'API_011',
        error: true,
        message: 'Stubbed response',
      },
      statusCode: 400,
    });,
`,
      nulCustomCommandTracker
    );

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
    const result = converter(
      `
    cy.intercept('GET', 'http://localhost/an-url/**', {
      body: {
        code: 'API_011',
        error: true,
        message: 'Stubbed response',
      },
      statusCode: 400,
    });
`,
      nulCustomCommandTracker
    );

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
