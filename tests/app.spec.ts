import { describe, it } from 'node:test';
import * as assert from 'assert';
import { itWorks } from '../src/app';

describe('Cypress-to-Playwright', () => {
  it('It works', () => {
    assert.strictEqual(itWorks(), true);
  });
});
