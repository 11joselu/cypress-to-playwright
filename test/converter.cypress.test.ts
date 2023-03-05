import { describe, it } from 'node:test';
import * as assert from 'assert';
import { index } from '../src/index.js';
import { format } from './format.js';

describe('Converter: Cypress commands', { concurrency: true }, () => {
  it('Transform cy.visit by awaited page.goto', () => {
    const result = index('cy.visit("http://localhost")');

    assert.strictEqual(format(result), format('await page.goto("http://localhost")'));
  });

  it('Do not transform fn.visit', () => {
    const result = index('fn.visit("http://localhost")');

    assert.strictEqual(format(result), format('fn.visit("http://localhost")'));
  });

  [
    createOption('click()', 'click()'),
    createOption('click({force: true})', 'click({force: true})'),
    createOption('type("a message")', 'type("a message")'),
    createOption('type("a message", {force: true})', 'type("a message", {force: true})'),
    createOption('check()', 'check()'),
    createOption('check({force: true})', 'check({force: true})'),
    createOption('uncheck()', 'uncheck()'),
    createOption('uncheck({force: true})', 'uncheck({force: true})'),
    createOption('select("item")', 'selectOption("item")'),
    createOption('scrollTo(250, 250)', 'scroll(250, 250)'),
    createOption('scrollIntoView()', 'scrollIntoViewIfNeeded()'),
  ].forEach((option) => {
    it(`Transform cy.get(selector).${option.cy} by await page.locator("selector").${option.playwright})`, () => {
      const result = index(`cy.get("selector").${option.cy}`);

      assert.strictEqual(format(result), format(`await page.locator("selector").${option.playwright}`));
    });

    it(`Transform cy.get("selector").first().${option.cy} by awaited page.locator("selector").first().${option.cy}`, () => {
      const result = index(`cy.get("selector").first().${option.cy}`);

      assert.strictEqual(format(result), format(`await page.locator("selector").first().${option.playwright}`));
    });

    it(`Transform cy.get("selector").last().${option.cy} by awaited page.locator("selector").last().${option.cy}`, () => {
      const result = index(`cy.get("selector").last().${option.cy}`);

      assert.strictEqual(format(result), format(`await page.locator("selector").last().${option.playwright}`));
    });

    it(`Do not transform cy.fn(selector).${option.cy}`, () => {
      const result = index(`cy.fn("selector").${option.cy}`);

      assert.strictEqual(format(result), format(`cy.fn("selector").${option.cy}`));
    });
  });
});

describe('Converter: Cypress validation with .should', () => {
  [
    createOption('should("be.visible")', 'toBeVisible()'),
    createOption('should("have.length", 2)', 'toHaveCount(2)'),
    createOption('should("have.text", "text")', 'toHaveText("text")'),
    createOption('should("have.class", "aClass")', 'toHaveClass("aClass")'),
    createOption('should("have.value", "a text message")', 'toHaveValue("a text message")'),
    createOption('should("contain", "a text message")', 'toContainText("a text message")'),
    createOption('should("be.checked")', 'toBeChecked()'),
    createOption('should("be.disabled")', 'toBeDisabled()'),
    createOption('should("have.attr", "type", "text")', "toHaveAttribute('type', 'text')"),
  ].forEach((option) => {
    it(`Transform cy.get().${option.cy} by  cy.get().${option.playwright}`, () => {
      const result = index(`cy.get("selector").${option.cy}`);

      assert.strictEqual(format(result), format(`await expect(page.locator("selector")).${option.playwright}`));
    });

    it(`Transform cy.get().first().${option.cy} by page.locator().first().${option.playwright}`, () => {
      const result = index(`cy.get("selector").first().${option.cy}`);

      assert.strictEqual(format(result), format(`await expect(page.locator("selector").first()).${option.playwright}`));
    });

    it(`Transform cy.get().last().${option.cy} by page.locator().last().${option.playwright}`, () => {
      const result = index(`cy.get("selector").last().${option.cy}`);

      assert.strictEqual(format(result), format(`await expect(page.locator("selector").last()).${option.playwright}`));
    });
  });

  [
    createOption('should("not.be.visible")', 'toBeVisible()'),
    createOption('should("not.have.length", 2)', 'toHaveCount(2)'),
    createOption('should("not.have.text", "text")', 'toHaveText("text")'),
    createOption('should("not.have.class", "aClass")', 'toHaveClass("aClass")'),
    createOption('should("not.have.value", "a text message")', 'toHaveValue("a text message")'),
    createOption('should("not.contain", "a text message")', 'toContainText("a text message")'),
    createOption('should("not.be.checked")', 'toBeChecked()'),
    createOption('should("not.be.disabled")', 'toBeDisabled()'),
    createOption('should("not.have.attr", "type", "text")', "toHaveAttribute('type', 'text')"),
  ].forEach((option) => {
    it(`Transform negative cy.get().${option.cy} by  cy.get().not.${option.playwright}`, () => {
      const result = index(`cy.get("selector").${option.cy}`);

      assert.strictEqual(format(result), format(`await expect(page.locator("selector")).not.${option.playwright}`));
    });

    it(`Transform cy.get().first().${option.cy} by page.locator().first().not.${option.playwright}`, () => {
      const result = index(`cy.get("selector").first().${option.cy}`);

      assert.strictEqual(
        format(result),
        format(`await expect(page.locator("selector").first()).not.${option.playwright}`)
      );
    });

    it(`Transform cy.get().last().${option.cy} by page.locator().last().not.${option.playwright}`, () => {
      const result = index(`cy.get("selector").last().${option.cy}`);

      assert.strictEqual(
        format(result),
        format(`await expect(page.locator("selector").last()).not.${option.playwright}`)
      );
    });
  });

  it('Throws error for unknown validation', () => {
    assert.throws(() => {
      index('cy.get("selector").should("be.foo")');
    }, /^Error: Unknown "be.foo" validation$/);
  });

  it('When there are a variable in a validation should keep it', () => {
    const result = index(`
        const newItem = 'Feed the cat';
        cy.get('selector').should('have.text', newItem);
      `);

    assert.strictEqual(
      format(result),
      format(`
          const newItem = 'Feed the cat';
          await expect(page.locator("selector")).toHaveText(newItem)
        `)
    );
  });
});

function createOption(cy: string, playwright: string) {
  return { cy, playwright };
}
