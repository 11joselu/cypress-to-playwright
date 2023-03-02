import { describe, it } from 'node:test';
import * as assert from 'assert';
import { convert } from '../src/convert';
import { format } from './format';

describe('Converter: Cypress', () => {
  it('Replace cy.visit by awaited page.goto', () => {
    const result = convert('cy.visit("http://localhost")');

    assert.strictEqual(
      format(result),
      format('await page.goto("http://localhost")')
    );
  });

  it('Do not replace fn.visit by awaited page.goto', () => {
    const result = convert('fn.visit("http://localhost")');

    assert.strictEqual(format(result), format('fn.visit("http://localhost")'));
  });

  it('Replace cy.get(selector).click() by awaited page.click(selector)', () => {
    const result = convert('cy.get("selector").click()');

    assert.strictEqual(format(result), format('await page.click("selector")'));
  });

  it('Do not replace cy.fn(selector).click() by awaited page.click(selector)', () => {
    const result = convert('cy.fn("selector").click()');

    assert.strictEqual(format(result), format('cy.fn("selector").click()'));
  });

  it('Do not replace fn.click(selector).click() by awaited page.click(selector)', () => {
    const result = convert('cy.fn("selector").click()');

    assert.strictEqual(format(result), format('cy.fn("selector").click()'));
  });
});
