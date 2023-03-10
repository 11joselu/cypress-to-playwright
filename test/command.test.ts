import * as assert from 'assert';
import * as command from '../src/command.js';
import { EmptyDirectoryException } from '../src/core/EmptyDirectoryException.js';
import { resolve } from 'path';
import * as fs from 'fs';
import { format } from './test-utils.js';

describe.only('Command', () => {
  const ROOT_DIR = resolve('.', 'test', 'command', 'tmp');

  beforeEach(() => {
    fs.mkdirSync(ROOT_DIR, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(resolve(ROOT_DIR, '..'), { recursive: true, force: true });
  });

  it('Throws error when directory is empty', () => {
    assert.throws(() => {
      command.execute('');
    }, EmptyDirectoryException);
  });

  it('Creates a playwright directory into parent given directory', () => {
    command.execute(ROOT_DIR);

    assert.ok(fs.existsSync(resolve(ROOT_DIR, '..', 'playwright')));
  });

  it('Read and converts cypress code', () => {
    createFileWithContent(
      resolve(ROOT_DIR, 'aTest.cy.js'),
      format(`
      it('Test case', () => { })
    `)
    );

    command.execute(ROOT_DIR);

    assert.strictEqual(
      readFile(resolve(ROOT_DIR, '..', 'playwright', 'aTest.cy.js')),
      `test('Test case', async ({ page }) => { });\n`
    );
  });

  it('Do not load non js file', () => {
    createFileWithContent(resolve(ROOT_DIR, 'README.md'), '# Title');

    command.execute(ROOT_DIR);

    assert.equal(fs.existsSync(resolve(ROOT_DIR, '..', 'playwright', 'README.md')), false);
  });

  it('Do not load node_modules files', () => {
    const node_modules_directory = resolve(ROOT_DIR, 'node_modules');
    fs.mkdirSync(node_modules_directory, { recursive: true });
    createFileWithContent(resolve(node_modules_directory, 'library.js'), 'const library = true;');

    command.execute(ROOT_DIR);

    assert.equal(fs.existsSync(resolve(ROOT_DIR, '..', 'playwright', 'node_modules', 'library.js')), false);
  });

  it('Do not load cypress config file', () => {
    createFileWithContent(resolve(ROOT_DIR, 'cypress.config.js'), 'const library = true;');

    command.execute(ROOT_DIR);

    assert.equal(fs.existsSync(resolve(ROOT_DIR, '..', 'playwright', 'cypress.config.js')), false);
  });
});

function createFileWithContent(file: string, content: string) {
  fs.writeFileSync(file, content, { flag: 'w' });
}

function readFile(file: string): string {
  return fs.readFileSync(file, 'utf-8');
}
