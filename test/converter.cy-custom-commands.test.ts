import { converter } from '../src/converter.js';
import { format } from './test-utils.js';
import assert from 'assert';

describe('Converter: Cypress Custom commands', () => {
  it('Migrate custom command into a normal function injecting page', () => {
    const result = converter("Cypress.Commands.add('login', () => {})");

    assert.strictEqual(format(result), format('async function login(page) {}'));
  });

  it('Migrate custom command with parameters into a normal function with parameters injecting page', () => {
    const result = converter("Cypress.Commands.add('login', (username, password) => {})");

    assert.strictEqual(format(result), format('async function login(username, password, page) {}'));
  });
});
