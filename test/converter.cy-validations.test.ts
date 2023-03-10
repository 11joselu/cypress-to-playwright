import assert from 'assert';
import { converter } from '../src/converter.js';
import { createOption, format } from './test-utils.js';

describe('Converter: Cypress validation', () => {
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
      const result = converter(`cy.get("selector").${option.cy}`);

      assert.strictEqual(format(result), format(`await expect(page.locator("selector")).${option.playwright}`));
    });

    it(`Transform cy.get().first().${option.cy} by page.locator().first().${option.playwright}`, () => {
      const result = converter(`cy.get("selector").first().${option.cy}`);

      assert.strictEqual(format(result), format(`await expect(page.locator("selector").first()).${option.playwright}`));
    });

    it(`Transform cy.get().last().${option.cy} by page.locator().last().${option.playwright}`, () => {
      const result = converter(`cy.get("selector").last().${option.cy}`);

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
      const result = converter(`cy.get("selector").${option.cy}`);

      assert.strictEqual(format(result), format(`await expect(page.locator("selector")).not.${option.playwright}`));
    });

    it(`Transform cy.get().first().${option.cy} by page.locator().first().not.${option.playwright}`, () => {
      const result = converter(`cy.get("selector").first().${option.cy}`);

      assert.strictEqual(
        format(result),
        format(`await expect(page.locator("selector").first()).not.${option.playwright}`)
      );
    });

    it(`Transform cy.get().last().${option.cy} by page.locator().last().not.${option.playwright}`, () => {
      const result = converter(`cy.get("selector").last().${option.cy}`);

      assert.strictEqual(
        format(result),
        format(`await expect(page.locator("selector").last()).not.${option.playwright}`)
      );
    });
  });

  it('Throws error for unknown validation', () => {
    assert.throws(() => {
      converter('cy.get("selector").should("be.foo")');
    }, /^Error: Unknown "be.foo" validation$/);
  });

  it('When there are a variable in a validation should keep it', () => {
    const result = converter(`
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
