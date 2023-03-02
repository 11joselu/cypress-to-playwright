import { describe, it } from 'node:test';
import * as assert from 'assert';
import { convert } from '../src/convert';
import { format } from './format';

describe('Converter: Cypress', () => {
  it('Replace cy.visit by awaited page.goto', () => {
    const result = convert('cy.visit("http://localhost")');

    assert.strictEqual(format(result), 'await page.goto("http://localhost")');
  });

  it('Do not replace fn.visit by awaited page.goto', () => {
    const result = convert('fn.visit("http://localhost")');

    assert.strictEqual(format(result), 'fn.visit("http://localhost")');
  });
});
