import { describe, it } from 'node:test';
import * as assert from 'assert';
import { convert } from '../src/convert';
import { format } from './format';

describe('Converter: Cypress', () => {
  it('Replace cy.visit to awaited page.goto', () => {
    const result = convert('cy.visit("http://localhost")');

    assert.strictEqual(format(result), 'await page.goto("http://localhost")');
  });
});
