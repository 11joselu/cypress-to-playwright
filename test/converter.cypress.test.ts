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

  it('Add forced click option', { only: true }, () => {
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

describe('Converter: Cypress validation (.should)', () => {
  it('be.visible by expect().toBeVisible', () => {
    const result = converter('cy.get("selector").should("be.visible")');

    assert.strictEqual(format(result), format('await expect(page.locator("selector")).toBeVisible()'));
  });

  it('have.length by expect().toHaveCount', () => {
    const result = converter('cy.get("selector").should("have.length", 2)');

    assert.strictEqual(format(result), format(`await expect(page.locator("selector")).toHaveCount(2);`));
  });

  it('have.text by toHaveText', () => {
    const result = converter('cy.get("selector").should("have.text", "Submitted")');

    assert.strictEqual(
      format(result),
      format(`
          await expect(page.locator("selector")).toHaveText("Submitted");
      `)
    );
  });

  it('cy.get.first() by page.locator.first()', () => {
    const result = converter(`cy.get("selector").first().should('have.text', 'Test')`);

    assert.strictEqual(
      format(result),
      format(`
          await expect(page.locator("selector").first()).toHaveText('Test');
      `)
    );
  });

  it('cy.get.last() by page.locator.last()', () => {
    const result = converter(`cy.get("selector").last().should('have.text', 'Test')`);

    assert.strictEqual(
      format(result),
      format(`
          await expect(page.locator("selector").last()).toHaveText('Test');
      `)
    );
  });

  it('have.class by expect().toHaveClass', () => {
    const result = converter('cy.get("selector").should("have.class", "aClass")');

    assert.strictEqual(format(result), format('await expect(page.locator("selector")).toHaveClass("aClass")'));
  });
});
