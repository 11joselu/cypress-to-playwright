import * as assert from 'assert';
import * as command from '../src/command.js';
import { resolve } from 'path';
import * as fs from 'fs';
import { format } from './test-utils.js';
import { nullLogger } from './null-logger.js';
import { Logger } from '../src/core/logger.js';
import { RequiredDirectoryException } from '../src/core/required-directory-exception.js';

describe('Command', () => {
  const ROOT_DIR = resolve('.', 'test', 'command', 'tmp');

  beforeEach(() => {
    fs.mkdirSync(ROOT_DIR, { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(resolve(ROOT_DIR, '..'), { recursive: true, force: true });
  });

  it('Throws error when directory is empty', () => {
    assert.throws(() => {
      command.execute('', nullLogger);
    }, RequiredDirectoryException);
  });

  it('Creates a playwright directory into parent given directory', () => {
    command.execute(ROOT_DIR, nullLogger);

    assert.ok(fs.existsSync(resolve(ROOT_DIR, '..', 'playwright')));
  });

  it('Read cypress code then write converted code into playwright directory', () => {
    createFileWithContent(
      resolve(ROOT_DIR, 'aTest.cy.js'),
      format(`
      it('Test case', () => { })
    `)
    );

    command.execute(ROOT_DIR, nullLogger);

    assert.strictEqual(
      readFile(resolve(ROOT_DIR, '..', 'playwright', 'aTest.cy.js')),
      `test('Test case', async ({ page }) => { });\n`
    );
  });

  it('Writes even untouched code', () => {
    createFileWithContent(
      resolve(ROOT_DIR, 'untouched.cy.js'),
      format(`
      const hello = 'world';
    `)
    );

    command.execute(ROOT_DIR, nullLogger);

    assert.strictEqual(readFile(resolve(ROOT_DIR, '..', 'playwright', 'untouched.cy.js')), `const hello = 'world';\n`);
  });

  it('Do not load non js file', () => {
    createFileWithContent(resolve(ROOT_DIR, 'README.md'), '# Title');

    command.execute(ROOT_DIR, nullLogger);

    assert.equal(fs.existsSync(resolve(ROOT_DIR, '..', 'playwright', 'README.md')), false);
  });

  it('Do not load node_modules files', () => {
    const node_modules_directory = resolve(ROOT_DIR, 'node_modules');
    fs.mkdirSync(node_modules_directory, { recursive: true });
    createFileWithContent(resolve(node_modules_directory, 'library.js'), 'const library = true;');

    command.execute(ROOT_DIR, nullLogger);

    assert.equal(fs.existsSync(resolve(ROOT_DIR, '..', 'playwright', 'node_modules', 'library.js')), false);
  });

  it('Do not load cypress config file', () => {
    createFileWithContent(resolve(ROOT_DIR, 'cypress.config.js'), 'const library = true;');

    command.execute(ROOT_DIR, nullLogger);

    assert.equal(fs.existsSync(resolve(ROOT_DIR, '..', 'playwright', 'cypress.config.js')), false);
  });

  it('Print next steps', () => {
    const logger = createMemoryLogger();
    createFileWithContent(
      resolve(ROOT_DIR, 'aTest.cy.js'),
      format(`
      it('Test case', () => {
      })
    `)
    );

    command.execute(ROOT_DIR, logger);

    assert.strictEqual(
      removeColor(logger.messages()[1]),
      'Next Step:\n' +
        "      1. Run 'npm init playwright@latest'.\n" +
        "      2. Change 'testDir' option inside the playwright configuration file to '/playwright'.\n" +
        '      3. Analyze/Remove unnecessary files (like cy commands, cy plugins, clean package.json etc...)'
    );
  });

  it('Print summary with success migrated and partial migrated files', () => {
    const logger = createMemoryLogger();
    createFileWithContent(
      resolve(ROOT_DIR, 'successMigrated.cy.js'),
      format(`
      it('Test case', () => {
        cy.visit('http://localhost');
      })
    `)
    );
    createFileWithContent(
      resolve(ROOT_DIR, 'partialMigrated.cy.js'),
      format(`
      it('Test case', () => {
        cy.get('selector').should('non-existing-validation')
      })
    `)
    );

    command.execute(ROOT_DIR, logger);

    assert.strictEqual(
      removeColor(logger.messages()[0]),
      '\n' +
        '  - Migrated: 1\n' +
        '  - Partial migrated: 1\n' +
        '\t- /cypress-to-playwright/test/command/tmp/partialMigrated.cy.js\n'
    );
  });
});

function createFileWithContent(file: string, content: string) {
  fs.writeFileSync(file, content, { flag: 'w' });
}

function readFile(file: string): string {
  return fs.readFileSync(file, 'utf-8');
}

function createMemoryLogger(): Logger & { messages: () => string[] } {
  const messages: string[] = [];
  return {
    log(message: string): void {
      messages.push(message);
    },
    messages() {
      return messages;
    },
  };
}

function removeColor(str: string) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[.*?m/g, '');
}
