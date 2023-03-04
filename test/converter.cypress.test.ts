import { describe, test } from 'node:test';
import * as assert from 'assert';
import { converter } from '../src/converter';
import { format } from './format';

describe('Converter: Cypress', { concurrency: true }, () => {
  test('Replace cy.visit by awaited page.goto', () => {
    const result = converter('cy.visit("http://localhost")');

    assert.strictEqual(format(result), format('await page.goto("http://localhost")'));
  });

  test('Do not replace fn.visit by awaited page.goto', () => {
    const result = converter('fn.visit("http://localhost")');

    assert.strictEqual(format(result), format('fn.visit("http://localhost")'));
  });

  test('Replace cy.get(selector).click() by awaited page.click(selector)', () => {
    const result = converter('cy.get("selector").click()');

    assert.strictEqual(format(result), format('await page.click("selector")'));
  });

  test('Add forced click option', () => {
    const result = converter('cy.get("selector").click({force: true})');

    assert.strictEqual(format(result), format('await page.click("selector", {force: true})'));
  });

  test('Replace cy.get("selector").first().click() by awaited page.locator("selector").first()', () => {
    const result = converter('cy.get("selector").first().click()');

    assert.strictEqual(format(result), format('await page.locator("selector").first().click();'));
  });

  test('Add forced click option when access to cy.get property', () => {
    const result = converter('cy.get("selector").first().click({force: true})');

    assert.strictEqual(format(result), format('await page.locator("selector").first().click({force: true});'));
  });

  test('Replace cy.get("selector").last().click() by awaited page.locator("selector").last()', () => {
    const result = converter('cy.get("selector").last().click()');

    assert.strictEqual(format(result), format('await page.locator("selector").last().click();'));
  });

  test('Do not replace cy.fn(selector).click() by awaited page.click(selector)', () => {
    const result = converter('cy.fn("selector").click()');

    assert.strictEqual(format(result), format('cy.fn("selector").click()'));
  });

  test('Replace cy.get.type by page.type', { only: true }, () => {
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

  describe('Replace Cypress validation cy.get(...).should', () => {
    test('be.visible by expect().toBeVisible', () => {
      const result = converter('cy.get("selector").should("be.visible")');

      assert.strictEqual(format(result), format('await expect(page.locator("selector")).toBeVisible()'));
    });

    test('have.length by expect().toHaveCount', () => {
      const result = converter('cy.get("selector").should("have.length", 2)');

      assert.strictEqual(format(result), format(`await expect(page.locator("selector")).toHaveCount(2);`));
    });

    test('have.text by toHaveText', () => {
      const result = converter('cy.get("selector").should("have.text", "Submitted")');

      assert.strictEqual(
        format(result),
        format(`
          await expect(page.locator("selector")).toHaveText("Submitted");
      `)
      );
    });

    test('cy.get.first() by page.locator.first()', () => {
      const result = converter(`cy.get("selector").first().should('have.text', 'Test')`);

      assert.strictEqual(
        format(result),
        format(`
          await expect(page.locator("selector").first()).toHaveText('Test');
      `)
      );
    });

    test('cy.get.last() by page.locator.last()', () => {
      const result = converter(`cy.get("selector").last().should('have.text', 'Test')`);

      assert.strictEqual(
        format(result),
        format(`
          await expect(page.locator("selector").last()).toHaveText('Test');
      `)
      );
    });
  });
});
