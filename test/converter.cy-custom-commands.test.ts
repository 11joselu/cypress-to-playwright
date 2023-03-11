import { converter } from '../src/converter.js';
import { format } from './test-utils.js';
import assert from 'assert';

describe('Converter: Cypress Custom commands', () => {
  it('Migrate custom command into a normal function', () => {
    const result = converter("Cypress.Commands.add('login', () => {})");

    assert.strictEqual(format(result), format('async function login() {}'));
  });
});
