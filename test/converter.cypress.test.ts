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

  it('Do not replace cy.fn(selector).click()', () => {
    const result = converter('cy.fn("selector").click()');

    assert.strictEqual(format(result), format('cy.fn("selector").click()'));
  });

  it('Do not replace cy.fn(selector).type()', () => {
    const result = converter('cy.fn("selector").type()');

    assert.strictEqual(format(result), format('cy.fn("selector").type()'));
  });

  [
    createOption('click()', 'click()'),
    createOption('click({force: true})', 'click({force: true})'),
    createOption('type("a message")', 'type("a message")'),
    createOption('type("a message", {force: true})', 'type("a message", {force: true})'),
  ].forEach((option) => {
    it(`Replace cy.get(selector).${option.cy} by await page.locator("selector").${option.playwright})`, () => {
      const result = converter(`cy.get("selector").${option.cy}`);

      assert.strictEqual(format(result), format(`await page.locator("selector").${option.playwright}`));
    });

    it(`Replace cy.get("selector").first().${option.cy} by awaited page.locator("selector").first().${option.cy}`, () => {
      const result = converter('cy.get("selector").first().click()');

      assert.strictEqual(format(result), format('await page.locator("selector").first().click();'));
    });

    it(`Replace cy.get("selector").last().${option.cy} by awaited page.locator("selector").last().${option.cy}`, () => {
      const result = converter('cy.get("selector").last().click()');

      assert.strictEqual(format(result), format('await page.locator("selector").last().click();'));
    });
  });
});

describe('Converter: Cypress validation with .should', () => {
  [
    createOption('should("be.visible")', 'toBeVisible()'),
    createOption('should("have.length", 2)', 'toHaveCount(2)'),
    createOption('should("have.text", "text")', 'toHaveText("text")'),
    createOption('should("have.class", "aClass")', 'toHaveClass("aClass")'),
  ].forEach((option) => {
    it(`Replace cy.get().${option.cy} by  cy.get().${option.playwright}`, () => {
      const result = converter(`cy.get("selector").${option.cy}`);

      assert.strictEqual(format(result), format(`await expect(page.locator("selector")).${option.playwright}`));
    });

    it(`Replace cy.get().first().${option.cy} by page.locator().first().${option.playwright}`, () => {
      const result = converter(`cy.get("selector").first().${option.cy}`);

      assert.strictEqual(format(result), format(`await expect(page.locator("selector").first()).${option.playwright}`));
    });

    it(`Replace cy.get().last().${option.cy} by page.locator().last().${option.playwright}`, () => {
      const result = converter(`cy.get("selector").last().${option.cy}`);

      assert.strictEqual(format(result), format(`await expect(page.locator("selector").last()).${option.playwright}`));
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
