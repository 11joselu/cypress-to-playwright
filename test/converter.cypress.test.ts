import { describe, it } from 'node:test';
import * as assert from 'assert';
import { converter } from '../src/converter';
import { format } from './format';

describe('Converter: Cypress commands', { concurrency: true }, () => {
  it('Replace cy.visit by awaited page.goto', () => {
    const result = converter('cy.visit("http://localhost")');

    assert.strictEqual(format(result), format('await page.goto("http://localhost")'));
  });

  it('Do not replace fn.visit', () => {
    const result = converter('fn.visit("http://localhost")');

    assert.strictEqual(format(result), format('fn.visit("http://localhost")'));
  });

  it('Replace cy.get(selector).click() by awaited page.locator(selector).click()', () => {
    const result = converter('cy.get("selector").click()');

    assert.strictEqual(format(result), format('await page.locator("selector").click()'));
  });

  it('Add forced click option', () => {
    const result = converter('cy.get("selector").click({force: true})');

    assert.strictEqual(format(result), format('await page.locator("selector").click({force: true})'));
  });

  it('Replace cy.get("selector").first().click() by awaited page.locator("selector").first()', () => {
    const result = converter('cy.get("selector").first().click()');

    assert.strictEqual(format(result), format('await page.locator("selector").first().click();'));
  });

  it('Add forced click option when access to cy.get property', () => {
    const result = converter('cy.get("selector").first().click({force: true})');

    assert.strictEqual(format(result), format('await page.locator("selector").first().click({force: true});'));
  });

  it('Replace cy.get("selector").last().click() by awaited page.locator("selector").last()', () => {
    const result = converter('cy.get("selector").last().click()');

    assert.strictEqual(format(result), format('await page.locator("selector").last().click();'));
  });

  it('Do not replace cy.fn(selector).click()', () => {
    const result = converter('cy.fn("selector").click()');

    assert.strictEqual(format(result), format('cy.fn("selector").click()'));
  });

  it('Replace cy.get.type by page.type', { only: true }, () => {
    const result = converter(`
      cy.get('selector').type('message')
  `);

    assert.strictEqual(
      format(result),
      format(`
        await page.locator('selector').type('message')
    `)
    );
  });
});

describe('Converter: Cypress validation with .should', () => {
  [
    createOption('should("be.visible")', 'toBeVisible()'),
    createOption('should("have.length", 2)', 'toHaveCount(2)'),
    createOption('should("have.text", "text")', 'toHaveText("text")'),
    createOption('should("have.class", "aClass")', 'toHaveClass("aClass")'),
  ].forEach((x) => {
    it(`Replace cy.get().${x.cy} by  cy.get().${x.playwright}`, () => {
      const result = converter(`cy.get("selector").${x.cy}`);

      assert.strictEqual(format(result), format(`await expect(page.locator("selector")).${x.playwright}`));
    });

    it(`Replace cy.get().first().${x.cy} by page.locator().first().${x.playwright}`, () => {
      const result = converter(`cy.get("selector").first().${x.cy}`);

      assert.strictEqual(format(result), format(`await expect(page.locator("selector").first()).${x.playwright}`));
    });

    it(`Replace cy.get().last().${x.cy} by page.locator().last().${x.playwright}`, () => {
      const result = converter(`cy.get("selector").last().${x.cy}`);

      assert.strictEqual(format(result), format(`await expect(page.locator("selector").last()).${x.playwright}`));
    });
  });

  it('Throws error for unknown validation', () => {
    assert.throws(() => {
      converter('cy.get("selector").should("be.foo")');
    }, /^Error: Unknown "be.foo" validation$/);
  });
});

function createOption(cy: string, playwright: string) {
  return { cy, playwright };
}
