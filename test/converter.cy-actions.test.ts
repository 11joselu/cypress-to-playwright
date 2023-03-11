import * as assert from 'assert';
import { converter } from '../src/converter.js';
import { createOption, format } from './test-utils.js';
import { nulCustomCommandTracker } from './nul-custom-command-tracker.js';

describe('Converter: Cypress actions', () => {
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
    createOption('dblclick()', 'dblclick()'),
    createOption('dblclick({force: true})', 'dblclick({force: true})'),
    createOption('clear()', 'fill("")'),
    createOption('clear({force: true})', 'fill("", {force: true})'),
    createOption('focus()', 'focus()'),
    createOption('blur()', 'blur()'),
  ].forEach((option) => {
    it(`Transform cy.get(selector).${option.cy} by await page.locator("selector").${option.playwright})`, () => {
      const result = converter(`cy.get("selector").${option.cy}`, nulCustomCommandTracker);

      assert.strictEqual(format(result), format(`await page.locator("selector").${option.playwright}`));
    });

    it(`Transform cy.get("selector").first().${option.cy} by awaited page.locator("selector").first().${option.playwright}`, () => {
      const result = converter(`cy.get("selector").first().${option.cy}`, nulCustomCommandTracker);

      assert.strictEqual(format(result), format(`await page.locator("selector").first().${option.playwright}`));
    });

    it(`Transform cy.get("selector").last().${option.cy} by awaited page.locator("selector").last().${option.playwright}`, () => {
      const result = converter(`cy.get("selector").last().${option.cy}`, nulCustomCommandTracker);

      assert.strictEqual(format(result), format(`await page.locator("selector").last().${option.playwright}`));
    });

    it(`Do not transform cy.fn(selector).${option.cy}`, () => {
      const result = converter(`cy.fn("selector").${option.cy}`, nulCustomCommandTracker);

      assert.strictEqual(format(result), format(`cy.fn("selector").${option.cy}`));
    });

    it(`Transform cy.contains().${option.cy} by  cy.contains().${option.playwright}`, () => {
      const result = converter(`cy.contains("aText").${option.cy}`, nulCustomCommandTracker);

      assert.strictEqual(format(result), format(`await page.locator("text=aText").${option.playwright}`));
    });
  });
});
